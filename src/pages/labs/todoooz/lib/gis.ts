import { supabase } from '@/integrations/supabase/client';
import { GOOGLE_SCOPES, rememberAccountToken, rememberIdentity, type GoogleIdentity } from './google';

/**
 * Google Identity Services (GIS) token flow.
 *
 * Lets the user authorise *additional* Google accounts (e.g. a personal one)
 * without touching their Supabase session. Each authorised account gets its own
 * access token, stored per-email in sessionStorage.
 */

declare global {
  interface Window {
    google?: any;
  }
}

let clientIdPromise: Promise<string> | null = null;

export const getGoogleClientId = async (): Promise<string> => {
  if (!clientIdPromise) {
    clientIdPromise = supabase.functions
      .invoke('tdz-google-config')
      .then(({ data, error }) => {
        if (error) throw error;
        return (data as { clientId?: string })?.clientId ?? '';
      })
      .catch(() => '');
  }
  return clientIdPromise;
};

const loadGis = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const existing = document.getElementById('gis-client') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }
    const s = document.createElement('script');
    s.id = 'gis-client';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(s);
  });

const fetchUserInfo = async (token: string): Promise<GoogleIdentity> => {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Could not read the Google profile for that account.');
  const j = (await res.json()) as { sub: string; email: string; name?: string; picture?: string };
  return { sub: j.sub, email: j.email, name: j.name ?? null, avatar_url: j.picture ?? null };
};

/**
 * Opens Google's account picker and authorises Contacts + Calendar read access
 * for whichever account the user selects. Returns the identity and caches its
 * access token for later imports.
 */
export const authorizeGoogleAccount = async (): Promise<GoogleIdentity> => {
  const clientId = await getGoogleClientId();
  if (!clientId) {
    throw new Error('Google client ID is not configured yet. Add GOOGLE_OAUTH_CLIENT_ID and try again.');
  }
  await loadGis();

  const token = await new Promise<string>((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: `openid email profile ${GOOGLE_SCOPES}`,
      prompt: 'consent select_account',
      callback: (resp: { access_token?: string; error?: string }) => {
        if (resp.error || !resp.access_token) return reject(new Error(resp.error ?? 'Authorisation cancelled'));
        resolve(resp.access_token);
      },
      error_callback: (err: { type?: string }) => reject(new Error(err?.type ?? 'Authorisation cancelled')),
    });
    client.requestAccessToken();
  });

  const identity = await fetchUserInfo(token);
  rememberAccountToken(identity.email, token);
  rememberIdentity(identity);
  return identity;
};
