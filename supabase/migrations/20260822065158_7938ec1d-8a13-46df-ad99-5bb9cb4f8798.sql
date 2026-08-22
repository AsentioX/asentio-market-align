ALTER TABLE public.tdz_projects ADD COLUMN IF NOT EXISTS google_task_list_id TEXT;
ALTER TABLE public.tdz_contacts ADD COLUMN IF NOT EXISTS google_etag TEXT;
ALTER TABLE public.tdz_calendar_events ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary';