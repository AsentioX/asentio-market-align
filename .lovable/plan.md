# Fix "Refresh linked Google accounts"

## What's happening now

The refresh button calls the same identity loader used when the dialog opens. That loader only re-reads two local sources: the Google identities attached to your signed-in account, and any extra accounts previously saved in browser storage. It never checks whether those accounts still have a working Google authorisation, and it gives no visual feedback — so clicking it appears to do nothing, and dead accounts stay in the list looking fine.

## What to build

1. Real feedback on the button: spinner while running, then a toast such as "2 Google accounts linked" (or "No Google accounts linked yet").
2. Actual re-validation: for each extra account authorised through the Google picker, test its cached access token against Google's userinfo endpoint. Tokens that fail are cleared and the account is marked "Needs re-authorisation" instead of silently appearing connected.
3. A per-account "Re-authorise" action on any account flagged as expired, running the existing Google account-picker flow for that email.
4. Refresh also re-reads the current auth session so a Google account linked in another tab shows up without a page reload.

## Technical notes

- `src/pages/labs/todoooz/components/GoogleAccountsPanel.tsx`: add `refreshing` state, wire the refresh handler through a shared `refresh()` that sets state, awaits the loader, and toasts; render an amber "Needs re-authorisation" pill plus re-auth button for identities whose token check failed.
- `src/pages/labs/todoooz/lib/google.ts`: add a `validateAccountTokens(identities)` helper that pings `https://www.googleapis.com/oauth2/v3/userinfo` with each cached per-email token, calls `forgetAccountToken` on 401/403, and returns a `Record<email, boolean>` of authorisation status. Keep the Supabase-session account exempt (its token comes from the session, not the picker).
- `src/pages/labs/todoooz/lib/useToDoooZ.ts`: expose the validation helper alongside `googleIdentities` so the panel can call one function.
- Re-authorise reuses `authorizeGoogleAccount` from `lib/gis.ts`; no schema or backend changes.
