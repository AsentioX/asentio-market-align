
-- Add timeline, category, and hierarchy columns to gov_policies
ALTER TABLE public.gov_policies 
  ADD COLUMN voting_start timestamp with time zone DEFAULT NULL,
  ADD COLUMN voting_deadline timestamp with time zone DEFAULT NULL,
  ADD COLUMN passed_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN category text DEFAULT NULL,
  ADD COLUMN parent_id uuid DEFAULT NULL REFERENCES public.gov_policies(id) ON DELETE SET NULL;

-- Create index for hierarchy lookups
CREATE INDEX idx_gov_policies_parent_id ON public.gov_policies(parent_id);
CREATE INDEX idx_gov_policies_category ON public.gov_policies(category);

-- Create policy votes table (direct votes on policies, not proposals)
CREATE TABLE public.gov_policy_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid NOT NULL REFERENCES public.gov_policies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote text NOT NULL CHECK (vote IN ('agree', 'abstain', 'disagree', 'block')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(policy_id, user_id)
);

ALTER TABLE public.gov_policy_votes ENABLE ROW LEVEL SECURITY;

-- Votes are publicly viewable
CREATE POLICY "Policy votes are publicly viewable"
  ON public.gov_policy_votes FOR SELECT
  USING (true);

-- Authenticated users can cast votes
CREATE POLICY "Authenticated users can cast policy votes"
  ON public.gov_policy_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own votes
CREATE POLICY "Users can update own policy votes"
  ON public.gov_policy_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own votes
CREATE POLICY "Users can delete own policy votes"
  ON public.gov_policy_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS on gov_policies: only admins can update status/timeline fields
-- Drop existing permissive update policy and replace with admin-only
DROP POLICY IF EXISTS "Authenticated users can update policies" ON public.gov_policies;

CREATE POLICY "Admins can update policies"
  ON public.gov_policies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at on policy votes
CREATE TRIGGER update_gov_policy_votes_updated_at
  BEFORE UPDATE ON public.gov_policy_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
