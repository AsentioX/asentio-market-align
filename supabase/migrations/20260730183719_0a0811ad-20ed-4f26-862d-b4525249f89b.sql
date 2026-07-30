ALTER TABLE public.xr_companies
  ADD COLUMN IF NOT EXISTS human_activities text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS human_capabilities text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS physical_platforms text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS industry_focus text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS ecosystem_roles text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS mission text,
  ADD COLUMN IF NOT EXISTS leadership text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS asentio_perspective text;

CREATE INDEX IF NOT EXISTS xr_companies_human_activities_idx ON public.xr_companies USING GIN (human_activities);
CREATE INDEX IF NOT EXISTS xr_companies_human_capabilities_idx ON public.xr_companies USING GIN (human_capabilities);
CREATE INDEX IF NOT EXISTS xr_companies_ai_capabilities_idx ON public.xr_companies USING GIN (ai_capabilities);
CREATE INDEX IF NOT EXISTS xr_companies_human_interface_idx ON public.xr_companies USING GIN (human_interface);
CREATE INDEX IF NOT EXISTS xr_companies_physical_platforms_idx ON public.xr_companies USING GIN (physical_platforms);
CREATE INDEX IF NOT EXISTS xr_companies_industry_focus_idx ON public.xr_companies USING GIN (industry_focus);
CREATE INDEX IF NOT EXISTS xr_companies_ecosystem_roles_idx ON public.xr_companies USING GIN (ecosystem_roles);