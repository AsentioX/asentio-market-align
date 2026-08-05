CREATE TABLE public.scrm_past_sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES public.scrm_sponsors(id) ON DELETE CASCADE,
  year integer NOT NULL,
  amount numeric,
  tier text,
  feedback text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scrm_past_sponsorships TO authenticated;
GRANT ALL ON public.scrm_past_sponsorships TO service_role;
ALTER TABLE public.scrm_past_sponsorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm members manage past sponsorships"
ON public.scrm_past_sponsorships FOR ALL TO authenticated
USING (public.scrm_is_member(auth.uid()))
WITH CHECK (public.scrm_is_member(auth.uid()));
CREATE TRIGGER scrm_past_sponsorships_updated BEFORE UPDATE ON public.scrm_past_sponsorships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX scrm_past_sponsorships_sponsor_idx ON public.scrm_past_sponsorships(sponsor_id);