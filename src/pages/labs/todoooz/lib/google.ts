import { supabase } from '@/integrations/supabase/client';
import type { TdzAccountSlot } from './types';

/**
 * Google access token handling.
 *
 * Supabase only exposes `provider_token` on the session immediately after an
 * OAuth sign-in, so we stash it in sessionStorage and reuse it for the rest of
 * the browsing session. No token is ever written to the database.
 */
const TOKEN_KEY = 'tdz.google.provider_token';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ');

export const rememberProviderToken = (token?: string | null) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
};

export const getProviderToken = async (): Promise<string | null> => {
  const cached = sessionStorage.getItem(TOKEN_KEY);
  if (cached) return cached;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.provider_token ?? null;
  rememberProviderToken(token);
  return token;
};

export class GoogleAuthNeeded extends Error {
  constructor() {
    super('Google access has expired. Sign in with Google again to re-authorise Contacts and Calendar.');
    this.name = 'GoogleAuthNeeded';
  }
}

const gfetch = async (url: string) => {
  const token = await getProviderToken();
  if (!token) throw new GoogleAuthNeeded();
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem(TOKEN_KEY);
    throw new GoogleAuthNeeded();
  }
  if (!res.ok) throw new Error(`Google API error (${res.status})`);
  return res.json();
};

/** Google identities linked to the currently signed-in user. */
export interface GoogleIdentity {
  sub: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export const listGoogleIdentities = async (): Promise<GoogleIdentity[]> => {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return [];
  const identities = (user.identities ?? []).filter((i) => i.provider === 'google');
  const rows: GoogleIdentity[] = identities.map((i) => {
    const d = (i.identity_data ?? {}) as Record<string, string>;
    return {
      sub: d.sub ?? i.id,
      email: d.email ?? user.email ?? '',
      name: d.full_name ?? d.name ?? null,
      avatar_url: d.avatar_url ?? d.picture ?? null,
    };
  });
  if (rows.length === 0 && user.email && user.app_metadata?.provider === 'google') {
    const d = (user.user_metadata ?? {}) as Record<string, string>;
    rows.push({
      sub: d.sub ?? user.id,
      email: user.email,
      name: d.full_name ?? d.name ?? null,
      avatar_url: d.avatar_url ?? d.picture ?? null,
    });
  }
  return rows;
};

/** Assign a Google identity to the Work or Personal slot. */
export const designateAccount = async (
  userId: string,
  slot: TdzAccountSlot,
  identity: GoogleIdentity,
) => {
  // A single Google account can only hold one slot at a time.
  await supabase
    .from('tdz_google_connections')
    .delete()
    .eq('user_id', userId)
    .eq('account_email', identity.email);

  const { error } = await supabase.from('tdz_google_connections').upsert(
    {
      user_id: userId,
      account_slot: slot,
      account_email: identity.email,
      account_name: identity.name,
      avatar_url: identity.avatar_url,
      google_sub: identity.sub,
      status: 'connected',
    },
    { onConflict: 'user_id,account_slot' },
  );
  if (error) throw error;
};

export const disconnectAccount = async (userId: string, slot: TdzAccountSlot) => {
  const { error } = await supabase
    .from('tdz_google_connections')
    .delete()
    .eq('user_id', userId)
    .eq('account_slot', slot);
  if (error) throw error;
};

/** Swap which Google account is Work and which is Personal. */
export const swapSlots = async (userId: string) => {
  const { data } = await supabase.from('tdz_google_connections').select('*').eq('user_id', userId);
  const rows = data ?? [];
  if (rows.length === 0) return;
  await supabase.from('tdz_google_connections').delete().eq('user_id', userId);
  await supabase.from('tdz_google_connections').insert(
    rows.map((r) => ({
      user_id: userId,
      account_slot: r.account_slot === 'work' ? 'personal' : 'work',
      account_email: r.account_email,
      account_name: r.account_name,
      avatar_url: r.avatar_url,
      google_sub: r.google_sub,
      status: r.status,
      last_synced_at: r.last_synced_at,
    })),
  );
  // Move already-imported data with the accounts.
  for (const table of ['tdz_calendar_events', 'tdz_contacts'] as const) {
    await supabase.from(table).update({ account_slot: 'tmp' }).eq('user_id', userId).eq('account_slot', 'work');
    await supabase.from(table).update({ account_slot: 'work' }).eq('user_id', userId).eq('account_slot', 'personal');
    await supabase.from(table).update({ account_slot: 'personal' }).eq('user_id', userId).eq('account_slot', 'tmp');
  }
};

/* -------------------------------------------------------------- Calendar */

interface GEvent {
  id: string;
  summary?: string;
  location?: string;
  hangoutLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

export const importGoogleCalendar = async (userId: string, slot: TdzAccountSlot) => {
  const timeMin = new Date(Date.now() - 86400000).toISOString();
  const timeMax = new Date(Date.now() + 21 * 86400000).toISOString();
  const url =
    'https://www.googleapis.com/calendar/v3/calendars/primary/events' +
    `?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
    '&singleEvents=true&orderBy=startTime&maxResults=250';
  const json = (await gfetch(url)) as { items?: GEvent[] };
  const items = json.items ?? [];

  const rows = items
    .filter((e) => e.start?.dateTime || e.start?.date)
    .map((e) => ({
      user_id: userId,
      account_slot: slot,
      google_event_id: e.id,
      title: e.summary ?? '(no title)',
      location: e.location ?? null,
      meeting_link: e.hangoutLink ?? null,
      all_day: !e.start?.dateTime,
      starts_at: new Date(e.start!.dateTime ?? `${e.start!.date}T00:00:00`).toISOString(),
      ends_at: new Date(e.end?.dateTime ?? `${e.end?.date ?? e.start!.date}T23:59:00`).toISOString(),
    }));

  // Replace this slot's synced events, keep manually created ones.
  await supabase
    .from('tdz_calendar_events')
    .delete()
    .eq('user_id', userId)
    .eq('account_slot', slot)
    .not('google_event_id', 'is', null);

  if (rows.length) {
    const { error } = await supabase.from('tdz_calendar_events').insert(rows);
    if (error) throw error;
  }

  await supabase
    .from('tdz_google_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('account_slot', slot);

  return rows.length;
};

/* -------------------------------------------------------------- Contacts */

export interface GooglePerson {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  avatar_url?: string;
  resource_id: string;
}

interface GConn {
  resourceName?: string;
  names?: { displayName?: string }[];
  emailAddresses?: { value?: string }[];
  phoneNumbers?: { value?: string }[];
  photos?: { url?: string }[];
  organizations?: { name?: string; title?: string }[];
}

export const fetchGooglePeople = async (): Promise<GooglePerson[]> => {
  const people: GooglePerson[] = [];
  let pageToken: string | undefined;
  do {
    const url =
      'https://people.googleapis.com/v1/people/me/connections' +
      '?personFields=names,emailAddresses,phoneNumbers,photos,organizations&pageSize=500' +
      (pageToken ? `&pageToken=${pageToken}` : '');
    const json = (await gfetch(url)) as { connections?: GConn[]; nextPageToken?: string };
    (json.connections ?? []).forEach((c) => {
      const email = c.emailAddresses?.[0]?.value;
      if (!email) return;
      people.push({
        resource_id: c.resourceName ?? `people/${email}`,
        name: c.names?.[0]?.displayName ?? email,
        email,
        phone: c.phoneNumbers?.[0]?.value,
        company: c.organizations?.[0]?.name,
        job_title: c.organizations?.[0]?.title,
        avatar_url: c.photos?.[0]?.url,
      });
    });
    pageToken = json.nextPageToken;
  } while (pageToken);
  return people;
};
