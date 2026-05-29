ALTER TABLE public.cf_ingest_runs
  ADD COLUMN IF NOT EXISTS skipped_rows integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verification jsonb;