ALTER TABLE public.tdz_tasks
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS google_updated_at timestamptz;

ALTER TABLE public.tdz_calendar_events
  ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES public.tdz_tasks(id) ON DELETE SET NULL;

ALTER TABLE public.tdz_stakeholders
  ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES public.tdz_tasks(id) ON DELETE CASCADE;

ALTER TABLE public.tdz_stakeholders
  ALTER COLUMN project_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS tdz_calendar_events_task_id_idx ON public.tdz_calendar_events(task_id);
CREATE INDEX IF NOT EXISTS tdz_stakeholders_task_id_idx ON public.tdz_stakeholders(task_id);
CREATE INDEX IF NOT EXISTS tdz_documents_task_id_idx ON public.tdz_documents(task_id);