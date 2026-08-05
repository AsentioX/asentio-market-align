CREATE TABLE public.xr_import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  file_name text,
  merge_mode boolean NOT NULL DEFAULT true,
  success_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  new_slugs text[] NOT NULL DEFAULT '{}',
  previous_rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  imported_by uuid,
  rolled_back_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.xr_import_logs TO authenticated;
GRANT ALL ON public.xr_import_logs TO service_role;

ALTER TABLE public.xr_import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view import logs" ON public.xr_import_logs
  FOR SELECT TO authenticated USING (public.is_ck_admin(auth.uid()));
CREATE POLICY "Admins can create import logs" ON public.xr_import_logs
  FOR INSERT TO authenticated WITH CHECK (public.is_ck_admin(auth.uid()));
CREATE POLICY "Admins can update import logs" ON public.xr_import_logs
  FOR UPDATE TO authenticated USING (public.is_ck_admin(auth.uid())) WITH CHECK (public.is_ck_admin(auth.uid()));
CREATE POLICY "Admins can delete import logs" ON public.xr_import_logs
  FOR DELETE TO authenticated USING (public.is_ck_admin(auth.uid()));

CREATE INDEX xr_import_logs_created_at_idx ON public.xr_import_logs (created_at DESC);

CREATE TRIGGER xr_import_logs_set_updated_at
  BEFORE UPDATE ON public.xr_import_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();