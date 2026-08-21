ALTER TABLE public.tdz_google_connections
  ADD COLUMN IF NOT EXISTS account_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS google_sub text;

DELETE FROM public.tdz_google_connections a
USING public.tdz_google_connections b
WHERE a.user_id = b.user_id AND a.account_slot = b.account_slot AND a.ctid > b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS tdz_google_connections_user_slot_key
  ON public.tdz_google_connections (user_id, account_slot);