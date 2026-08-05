CREATE TABLE public.hai_use_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  domain text NOT NULL,
  summary text,
  description text,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  human_activities text[] DEFAULT '{}',
  human_capabilities text[] DEFAULT '{}',
  ai_capabilities text[] DEFAULT '{}',
  human_interface text[] DEFAULT '{}',
  industry_focus text[] DEFAULT '{}',
  ecosystem_roles text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hai_use_cases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hai_use_cases TO authenticated;
GRANT ALL ON public.hai_use_cases TO service_role;

ALTER TABLE public.hai_use_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HAI use cases are publicly viewable"
  ON public.hai_use_cases FOR SELECT USING (true);

CREATE POLICY "Admins can insert HAI use cases"
  ON public.hai_use_cases FOR INSERT TO authenticated
  WITH CHECK (public.is_ck_admin(auth.uid()));

CREATE POLICY "Admins can update HAI use cases"
  ON public.hai_use_cases FOR UPDATE TO authenticated
  USING (public.is_ck_admin(auth.uid()));

CREATE POLICY "Admins can delete HAI use cases"
  ON public.hai_use_cases FOR DELETE TO authenticated
  USING (public.is_ck_admin(auth.uid()));

CREATE TRIGGER hai_use_cases_set_updated_at
  BEFORE UPDATE ON public.hai_use_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX hai_use_cases_domain_idx ON public.hai_use_cases (domain, display_order);