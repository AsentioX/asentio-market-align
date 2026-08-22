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
const ACCOUNT_TOKEN_KEY = 'tdz.google.tokens'; // { [email]: access_token }
const IDENTITY_KEY = 'tdz.google.identities'; // extra accounts authorised via GIS

// Read/write scopes: ToDoooZ mirrors edits back into the Google account.
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
].join(' ');

export const rememberProviderToken = (token?: string | null) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
};

const readJson = <T,>(store: Storage, key: string, fallback: T): T => {
  try {
    return JSON.parse(store.getItem(key) ?? '') as T;
  } catch {
    return fallback;
  }
};

/** Per-account access tokens obtained through the GIS account picker. */
export const rememberAccountToken = (email: string, token: string) => {
  const map = readJson<Record<string, string>>(sessionStorage, ACCOUNT_TOKEN_KEY, {});
  map[email.toLowerCase()] = token;
  sessionStorage.setItem(ACCOUNT_TOKEN_KEY, JSON.stringify(map));
};

export const forgetAccountToken = (email: string) => {
  const map = readJson<Record<string, string>>(sessionStorage, ACCOUNT_TOKEN_KEY, {});
  delete map[email.toLowerCase()];
  sessionStorage.setItem(ACCOUNT_TOKEN_KEY, JSON.stringify(map));
};

export const getAccountToken = (email?: string | null): string | null => {
  if (!email) return null;
  const map = readJson<Record<string, string>>(sessionStorage, ACCOUNT_TOKEN_KEY, {});
  return map[email.toLowerCase()] ?? null;
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
  constructor(email?: string | null) {
    super(
      email
        ? `Google access for ${email} has expired. Re-authorise that account from the Accounts panel.`
        : 'Google access has expired. Re-authorise the account from the Accounts panel.',
    );
    this.name = 'GoogleAuthNeeded';
  }
}

/**
 * Fetch a Google API using the token for a specific account when we have one,
 * falling back to the Supabase session token (the account used to sign in).
 */
const gfetch = async (
  url: string,
  email?: string | null,
  init?: { method?: string; body?: unknown },
) => {
  const token = getAccountToken(email) ?? (await getProviderToken());
  if (!token) throw new GoogleAuthNeeded(email);
  const res = await fetch(url, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (res.status === 401 || res.status === 403) {
    if (email) forgetAccountToken(email);
    else sessionStorage.removeItem(TOKEN_KEY);
    throw new GoogleAuthNeeded(email);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(`Google API error [${res.status}] ${url}: ${detail}`);
    throw new Error(`Google API error (${res.status})`);
  }
  if (res.status === 204) return {};
  const text = await res.text();
  return text ? JSON.parse(text) : {};
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
  // Merge in accounts authorised separately through the Google account picker.
  const extra = readJson<GoogleIdentity[]>(localStorage, IDENTITY_KEY, []);
  extra.forEach((e) => {
    if (!rows.some((r) => r.email.toLowerCase() === e.email.toLowerCase())) rows.push(e);
  });
  return rows;
};

/** Persist an extra Google identity authorised via the account picker. */
export const rememberIdentity = (identity: GoogleIdentity) => {
  const list = readJson<GoogleIdentity[]>(localStorage, IDENTITY_KEY, []).filter(
    (i) => i.email.toLowerCase() !== identity.email.toLowerCase(),
  );
  list.push(identity);
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(list));
};

/**
 * Ping Google with each cached per-account token to see whether the account is
 * still authorised. Dead tokens are dropped so the UI can prompt for re-auth.
 * The account used to sign in (no picker token) is treated as authorised.
 */
export const validateAccountTokens = async (
  identities: GoogleIdentity[],
): Promise<Record<string, boolean>> => {
  const status: Record<string, boolean> = {};
  await Promise.all(
    identities.map(async (identity) => {
      const email = identity.email.toLowerCase();
      const token = getAccountToken(email);
      if (!token) {
        // Falls back to the Supabase session token when this is the signed-in account.
        status[email] = Boolean(await getProviderToken());
        return;
      }
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          forgetAccountToken(email);
          status[email] = false;
          return;
        }
        status[email] = res.ok;
      } catch {
        status[email] = false;
      }
    }),
  );
  return status;
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

export const importGoogleCalendar = async (userId: string, slot: TdzAccountSlot, email?: string | null) => {
  const timeMin = new Date(Date.now() - 86400000).toISOString();
  const timeMax = new Date(Date.now() + 21 * 86400000).toISOString();
  const url =
    'https://www.googleapis.com/calendar/v3/calendars/primary/events' +
    `?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
    '&singleEvents=true&orderBy=startTime&maxResults=250';
  const json = (await gfetch(url, email)) as { items?: GEvent[] };
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
  etag?: string;
}

interface GConn {
  resourceName?: string;
  etag?: string;
  names?: { displayName?: string }[];
  emailAddresses?: { value?: string }[];
  phoneNumbers?: { value?: string }[];
  photos?: { url?: string }[];
  organizations?: { name?: string; title?: string }[];
}

export const fetchGooglePeople = async (email?: string | null): Promise<GooglePerson[]> => {
  const people: GooglePerson[] = [];
  let pageToken: string | undefined;
  do {
    const url =
      'https://people.googleapis.com/v1/people/me/connections' +
      '?personFields=names,emailAddresses,phoneNumbers,photos,organizations&pageSize=500' +
      (pageToken ? `&pageToken=${pageToken}` : '');
    const json = (await gfetch(url, email)) as { connections?: GConn[]; nextPageToken?: string };
    (json.connections ?? []).forEach((c) => {
      const email = c.emailAddresses?.[0]?.value;
      if (!email) return;
      people.push({
        resource_id: c.resourceName ?? `people/${email}`,
        etag: c.etag,
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

/* ----------------------------------------------------------- Google Tasks */

interface GTaskList {
  id: string;
  title?: string;
}

interface GTask {
  id: string;
  title?: string;
  notes?: string;
  status?: string;
  due?: string;
  completed?: string;
  updated?: string;
  deleted?: boolean;
  hidden?: boolean;
  position?: string;
  parent?: string;
  links?: { type?: string; description?: string; link?: string }[];
}


/**
 * Import Google Tasks for one account slot.
 * Each Google Tasks list becomes a card; each task becomes a subtask.
 * Re-running updates in place (matched on google_task_id).
 */
export const importGoogleTasks = async (userId: string, slot: TdzAccountSlot, email?: string | null) => {
  const lists = ((await gfetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=100', email)) as {
    items?: GTaskList[];
  }).items ?? [];

  let imported = 0;

  for (const list of lists) {
    const listTitle = list.title?.trim() || 'Google Tasks';
    const json = (await gfetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks` +
        '?showCompleted=true&showHidden=false&maxResults=100',
      email,
    )) as { items?: GTask[] };
    const items = (json.items ?? []).filter(
      (t) => (t.title ?? '').trim().length > 0 && !t.deleted,
    );
    if (items.length === 0) continue;

    // Find or create the card for this list.
    const { data: existingCard } = await supabase
      .from('tdz_projects')
      .select('id')
      .eq('user_id', userId)
      .eq('google_task_list_id', list.id)
      .maybeSingle();

    let cardId = existingCard?.id as string | undefined;
    if (!cardId) {
      const { data: created, error } = await supabase
        .from('tdz_projects')
        .insert({
          user_id: userId,
          title: listTitle,
          mode: slot,
          context_label: listTitle,
          google_task_list_id: list.id,
          description: 'Imported from Google Tasks',
        } as never)
        .select('id')
        .single();
      if (error) throw error;
      cardId = (created as { id: string }).id;
    }

    const { data: existingTasks } = await supabase
      .from('tdz_tasks')
      .select('id, google_task_id')
      .eq('user_id', userId)
      .eq('project_id', cardId);
    const byGoogleId = new Map(
      ((existingTasks ?? []) as { id: string; google_task_id: string | null }[])
        .filter((t) => t.google_task_id)
        .map((t) => [t.google_task_id as string, t.id]),
    );

    // Rebuild Google's one-level hierarchy: roots in position order, each
    // followed immediately by its children (also in position order).
    const byPosition = (a: GTask, b: GTask) => (a.position ?? '').localeCompare(b.position ?? '');
    const present = new Set(items.map((t) => t.id));
    const childrenOf = new Map<string, GTask[]>();
    const roots: GTask[] = [];
    for (const t of items) {
      if (t.parent && present.has(t.parent)) {
        childrenOf.set(t.parent, [...(childrenOf.get(t.parent) ?? []), t]);
      } else {
        roots.push(t);
      }
    }
    roots.sort(byPosition);
    const ordered: { task: GTask; parentGoogleId: string | null }[] = [];
    for (const root of roots) {
      ordered.push({ task: root, parentGoogleId: null });
      for (const child of (childrenOf.get(root.id) ?? []).sort(byPosition)) {
        ordered.push({ task: child, parentGoogleId: root.id });
      }
    }

    // Parents are written before children so the local parent id is resolvable.
    const localIdByGoogleId = new Map(byGoogleId);
    for (let i = 0; i < ordered.length; i++) {
      const { task: t, parentGoogleId } = ordered[i];
      const row = {
        user_id: userId,
        project_id: cardId,
        title: (t.title ?? '').trim(),
        notes: t.notes ?? null,
        done: t.status === 'completed',
        due_date: t.due ? t.due.slice(0, 10) : null,
        completed_at: t.completed ?? null,
        google_updated_at: t.updated ?? null,
        account_slot: slot,
        google_task_id: t.id,
        parent_task_id: parentGoogleId ? (localIdByGoogleId.get(parentGoogleId) ?? null) : null,
        rank: i,
      };
      const existingId = byGoogleId.get(t.id);
      let localId = existingId;
      if (existingId) {
        await supabase.from('tdz_tasks').update(row as never).eq('id', existingId);
        localIdByGoogleId.set(t.id, existingId);
      } else {
        const { data: inserted, error } = await supabase
          .from('tdz_tasks')
          .insert(row as never)
          .select('id')
          .single();
        if (error) throw error;
        localId = (inserted as { id: string }).id;
        localIdByGoogleId.set(t.id, localId);
      }

      // Google Tasks "attachments" are a read-only links array — mirror them
      // into ToDoooZ documents, matched on task + url so re-imports update.
      if (localId && t.links?.length) {
        const { data: existingDocs } = await supabase
          .from('tdz_documents')
          .select('id, url')
          .eq('task_id', localId);
        const docIdByUrl = new Map(
          ((existingDocs ?? []) as { id: string; url: string }[]).map((d) => [d.url, d.id]),
        );
        for (const link of t.links) {
          if (!link.link) continue;
          const docRow = {
            user_id: userId,
            project_id: cardId,
            task_id: localId,
            url: link.link,
            title: link.description?.trim() || link.link.replace(/^https?:\/\//, '').slice(0, 60),
            doc_type: link.type === 'email' ? 'email' : link.link.includes('drive.google.com') ? 'drive' : 'other',
          };
          const docId = docIdByUrl.get(link.link);
          if (docId) await supabase.from('tdz_documents').update(docRow as never).eq('id', docId);
          else await supabase.from('tdz_documents').insert(docRow as never);
        }
      }
      imported++;
    }
  }


  await supabase
    .from('tdz_google_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('account_slot', slot);

  return imported;
};

/* ------------------------------------------------- Write-back to Google */

/** Resolve the Google Tasks list a card belongs to, creating one if needed. */
const ensureTaskList = async (
  cardId: string,
  cardTitle: string,
  email?: string | null,
): Promise<string | null> => {
  const { data } = await supabase
    .from('tdz_projects')
    .select('google_task_list_id')
    .eq('id', cardId)
    .maybeSingle();
  const existing = (data as { google_task_list_id: string | null } | null)?.google_task_list_id;
  if (existing) return existing;

  const created = (await gfetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', email, {
    method: 'POST',
    body: { title: cardTitle || 'ToDoooZ' },
  })) as { id?: string };
  if (!created.id) return null;
  await supabase.from('tdz_projects').update({ google_task_list_id: created.id }).eq('id', cardId);
  return created.id;
};

export interface TaskPushInput {
  id: string;
  project_id: string;
  title: string;
  notes: string | null;
  done: boolean;
  due_date: string | null;
  google_task_id: string | null;
  parent_task_id?: string | null;
}

/** Create or update a task in Google Tasks to match the local row. */
export const pushTaskToGoogle = async (
  task: TaskPushInput,
  cardTitle: string,
  email?: string | null,
) => {
  const listId = await ensureTaskList(task.project_id, cardTitle, email);
  if (!listId) return;
  const body = {
    title: task.title,
    notes: task.notes ?? '',
    status: task.done ? 'completed' : 'needsAction',
    ...(task.due_date ? { due: new Date(`${task.due_date}T00:00:00Z`).toISOString() } : {}),
    ...(task.done ? {} : { completed: null }),
  };
  const base = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks`;
  if (task.google_task_id) {
    await gfetch(`${base}/${encodeURIComponent(task.google_task_id)}`, email, { method: 'PATCH', body });
  } else {
    // Nested tasks are created under their parent so Google keeps the hierarchy.
    let parentGoogleId: string | null = null;
    if (task.parent_task_id) {
      const { data } = await supabase
        .from('tdz_tasks')
        .select('google_task_id')
        .eq('id', task.parent_task_id)
        .maybeSingle();
      parentGoogleId = (data as { google_task_id: string | null } | null)?.google_task_id ?? null;
    }
    const url = parentGoogleId ? `${base}?parent=${encodeURIComponent(parentGoogleId)}` : base;
    const created = (await gfetch(url, email, { method: 'POST', body })) as { id?: string };
    if (created.id) {
      await supabase.from('tdz_tasks').update({ google_task_id: created.id }).eq('id', task.id);
    }
  }
};

export const deleteGoogleTask = async (
  cardId: string,
  googleTaskId: string,
  email?: string | null,
) => {
  const { data } = await supabase
    .from('tdz_projects')
    .select('google_task_list_id')
    .eq('id', cardId)
    .maybeSingle();
  const listId = (data as { google_task_list_id: string | null } | null)?.google_task_list_id;
  if (!listId) return;
  await gfetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(googleTaskId)}`,
    email,
    { method: 'DELETE' },
  );
};

/**
 * Reposition a task inside its Google Tasks list.
 * `previousGoogleId` is the sibling it should sit after (null = first).
 */
export const moveGoogleTask = async (
  cardId: string,
  googleTaskId: string,
  previousGoogleId: string | null,
  parentGoogleId: string | null,
  email?: string | null,
) => {
  const { data } = await supabase
    .from('tdz_projects')
    .select('google_task_list_id')
    .eq('id', cardId)
    .maybeSingle();
  const listId = (data as { google_task_list_id: string | null } | null)?.google_task_list_id;
  if (!listId) return;
  const params = new URLSearchParams();
  if (previousGoogleId) params.set('previous', previousGoogleId);
  if (parentGoogleId) params.set('parent', parentGoogleId);
  const qs = params.toString();
  await gfetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(
      googleTaskId,
    )}/move${qs ? `?${qs}` : ''}`,
    email,
    { method: 'POST' },
  );
};

export interface EventPushInput {
  id: string;
  google_event_id?: string | null;
  google_calendar_id?: string | null;
  title: string;
  location: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
}

/** Push a calendar edit back to Google Calendar. */
export const pushEventToGoogle = async (event: EventPushInput, email?: string | null) => {
  const calendarId = event.google_calendar_id || 'primary';
  const body = {
    summary: event.title,
    location: event.location ?? undefined,
    start: event.all_day
      ? { date: event.starts_at.slice(0, 10) }
      : { dateTime: new Date(event.starts_at).toISOString() },
    end: event.all_day
      ? { date: event.ends_at.slice(0, 10) }
      : { dateTime: new Date(event.ends_at).toISOString() },
  };
  const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  if (event.google_event_id) {
    await gfetch(`${base}/${encodeURIComponent(event.google_event_id)}`, email, { method: 'PATCH', body });
  } else {
    const created = (await gfetch(base, email, { method: 'POST', body })) as { id?: string };
    if (created.id) {
      await supabase
        .from('tdz_calendar_events')
        .update({ google_event_id: created.id, google_calendar_id: calendarId })
        .eq('id', event.id);
    }
  }
};

export const deleteGoogleEvent = async (
  googleEventId: string,
  calendarId?: string | null,
  email?: string | null,
) => {
  await gfetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId || 'primary')}/events/${encodeURIComponent(googleEventId)}`,
    email,
    { method: 'DELETE' },
  );
};

export interface ContactPushInput {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  google_resource_id: string | null;
  google_etag?: string | null;
}

const contactBody = (c: ContactPushInput) => ({
  names: [{ givenName: c.name }],
  ...(c.email ? { emailAddresses: [{ value: c.email }] } : {}),
  ...(c.phone ? { phoneNumbers: [{ value: c.phone }] } : {}),
  ...(c.company || c.job_title
    ? { organizations: [{ name: c.company ?? undefined, title: c.job_title ?? undefined }] }
    : {}),
});

const CONTACT_FIELDS = 'names,emailAddresses,phoneNumbers,organizations';

/** Create or update the matching Google contact (People API). */
export const pushContactToGoogle = async (contact: ContactPushInput, email?: string | null) => {
  if (contact.google_resource_id) {
    // People API requires the current etag on update.
    let etag = contact.google_etag ?? null;
    if (!etag) {
      const current = (await gfetch(
        `https://people.googleapis.com/v1/${contact.google_resource_id}?personFields=names`,
        email,
      )) as { etag?: string };
      etag = current.etag ?? null;
    }
    if (!etag) return;
    const updated = (await gfetch(
      `https://people.googleapis.com/v1/${contact.google_resource_id}:updateContact` +
        `?updatePersonFields=${encodeURIComponent(CONTACT_FIELDS)}`,
      email,
      { method: 'PATCH', body: { etag, ...contactBody(contact) } },
    )) as { etag?: string };
    if (updated.etag) {
      await supabase.from('tdz_contacts').update({ google_etag: updated.etag }).eq('id', contact.id);
    }
  } else {
    const created = (await gfetch('https://people.googleapis.com/v1/people:createContact', email, {
      method: 'POST',
      body: contactBody(contact),
    })) as { resourceName?: string; etag?: string };
    if (created.resourceName) {
      await supabase
        .from('tdz_contacts')
        .update({ google_resource_id: created.resourceName, google_etag: created.etag ?? null })
        .eq('id', contact.id);
    }
  }
};

export const deleteGoogleContact = async (resourceName: string, email?: string | null) => {
  await gfetch(`https://people.googleapis.com/v1/${resourceName}:deleteContact`, email, {
    method: 'DELETE',
  });
};
