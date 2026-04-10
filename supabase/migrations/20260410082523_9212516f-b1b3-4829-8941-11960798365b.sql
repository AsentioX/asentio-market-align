CREATE TABLE public.gov_policy_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid NOT NULL REFERENCES public.gov_policies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (policy_id, user_id)
);

ALTER TABLE public.gov_policy_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are publicly viewable"
  ON public.gov_policy_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON public.gov_policy_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes"
  ON public.gov_policy_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);