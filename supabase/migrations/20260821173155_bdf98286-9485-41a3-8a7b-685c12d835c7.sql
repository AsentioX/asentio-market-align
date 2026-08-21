
-- ToDoooZ schema
CREATE TABLE public.tdz_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.tdz_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  mode TEXT NOT NULL DEFAULT 'work',
  context_label TEXT,
  grouping_key TEXT,
  time_bucket TEXT NOT NULL DEFAULT 'this_week',
  priority TEXT NOT NULL DEFAULT 'core',
  color_theme TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  collapsed BOOLEAN NOT NULL DEFAULT false,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tdz_projects TO authenticated;
GRANT ALL ON public.tdz_projects TO service_role;
ALTER TABLE public.tdz_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdz_projects own" ON public.tdz_projects FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX tdz_projects_user_idx ON public.tdz_projects(user_id);
CREATE INDEX tdz_projects_parent_idx ON public.tdz_projects(parent_id);

CREATE OR REPLACE FUNCTION public.tdz_validate_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  grandparent UUID;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'A card cannot be its own parent';
    END IF;
    SELECT parent_id INTO grandparent FROM public.tdz_projects WHERE id = NEW.parent_id;
    IF grandparent IS NOT NULL THEN
      RAISE EXCEPTION 'Cards can only be nested two levels deep';
    END IF;
    IF EXISTS (SELECT 1 FROM public.tdz_projects WHERE parent_id = NEW.id) THEN
      RAISE EXCEPTION 'A card with sub-tasks cannot become a sub-task';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER tdz_projects_validate_parent
BEFORE INSERT OR UPDATE ON public.tdz_projects
FOR EACH ROW EXECUTE FUNCTION public.tdz_validate_parent();

CREATE OR REPLACE FUNCTION public.tdz_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER tdz_projects_touch BEFORE UPDATE ON public.tdz_projects
FOR EACH ROW EXECUTE FUNCTION public.tdz_touch_updated_at();

CREATE TABLE public.tdz_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.tdz_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  done BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMPTZ,
  rank INTEGER NOT NULL DEFAULT 0,
  account_slot TEXT,
  google_task_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tdz_tasks TO authenticated;
GRANT ALL ON public.tdz_tasks TO service_role;
ALTER TABLE public.tdz_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdz_tasks own" ON public.tdz_tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX tdz_tasks_project_idx ON public.tdz_tasks(project_id);
CREATE TRIGGER tdz_tasks_touch BEFORE UPDATE ON public.tdz_tasks
FOR EACH ROW EXECUTE FUNCTION public.tdz_touch_updated_at();

CREATE TABLE public.tdz_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.tdz_projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'manual',
  summary TEXT NOT NULL,
  detail TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tdz_activity_logs TO authenticated;
GRANT ALL ON public.tdz_activity_logs TO service_role;
ALTER TABLE public.tdz_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdz_activity own" ON public.tdz_activity_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX tdz_activity_project_idx ON public.tdz_activity_logs(project_id);

CREATE TABLE public.tdz_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.tdz_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tdz_stakeholders TO authenticated;
GRANT ALL ON public.tdz_stakeholders TO service_role;
ALTER TABLE public.tdz_stakeholders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdz_stakeholders own" ON public.tdz_stakeholders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX tdz_stakeholders_project_idx ON public.tdz_stakeholders(project_id);

CREATE TABLE public.tdz_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.tdz_projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tdz_tasks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT 'other',
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tdz_documents TO authenticated;
GRANT ALL ON public.tdz_documents TO service_role;
ALTER TABLE public.tdz_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdz_documents own" ON public.tdz_documents FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX tdz_documents_project_idx ON public.tdz_documents(project_id);

CREATE TABLE public.tdz_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.tdz_projects(id) ON DELETE SET NULL,
  account_slot TEXT NOT NULL DEFAULT 'work',
  google_event_id TEXT,
  title TEXT NOT NULL,
  location TEXT,
  meeting_link TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tdz_calendar_events TO authenticated;
GRANT ALL ON public.tdz_calendar_events TO service_role;
ALTER TABLE public.tdz_calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdz_events own" ON public.tdz_calendar_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX tdz_events_user_start_idx ON public.tdz_calendar_events(user_id, starts_at);

CREATE TABLE public.tdz_google_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_slot TEXT NOT NULL,
  account_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, account_slot)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tdz_google_connections TO authenticated;
GRANT ALL ON public.tdz_google_connections TO service_role;
ALTER TABLE public.tdz_google_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdz_conn own" ON public.tdz_google_connections FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
