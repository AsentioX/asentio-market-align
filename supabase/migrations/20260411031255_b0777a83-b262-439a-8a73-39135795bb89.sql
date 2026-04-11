CREATE TABLE public.gov_docket_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES public.gov_policies(id) ON DELETE CASCADE,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(policy_id)
);

ALTER TABLE public.gov_docket_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Docket items are publicly viewable"
  ON public.gov_docket_items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add docket items"
  ON public.gov_docket_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can remove docket items"
  ON public.gov_docket_items FOR DELETE
  TO authenticated
  USING (true);