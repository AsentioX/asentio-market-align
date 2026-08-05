ALTER TABLE public.scrm_sponsors
  ADD COLUMN IF NOT EXISTS sponsor_type text,
  ADD COLUMN IF NOT EXISTS organization_type text,
  ADD COLUMN IF NOT EXISTS likelihood_2027 text,
  ADD COLUMN IF NOT EXISTS strategic_fit text,
  ADD COLUMN IF NOT EXISTS recommended_activation text,
  ADD COLUMN IF NOT EXISTS recommended_next_action text;