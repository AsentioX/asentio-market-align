
-- Create enum for policy status
CREATE TYPE public.gov_policy_status AS ENUM ('draft', 'active', 'under-revision', 'archived');

-- Create enum for vote type
CREATE TYPE public.gov_vote_type AS ENUM ('agree', 'abstain', 'disagree', 'block');

-- Create enum for governance phase
CREATE TYPE public.gov_phase AS ENUM ('visioning', 'drafting', 'community-review', 'finalized');

-- Policies table
CREATE TABLE public.gov_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  context_snippet TEXT,
  status public.gov_policy_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gov_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Policies are publicly viewable" ON public.gov_policies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create policies" ON public.gov_policies FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update policies" ON public.gov_policies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete policies" ON public.gov_policies FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_gov_policies_updated_at BEFORE UPDATE ON public.gov_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Proposals table
CREATE TABLE public.gov_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.gov_policies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gov_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proposals are publicly viewable" ON public.gov_proposals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create proposals" ON public.gov_proposals FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can delete own proposals" ON public.gov_proposals FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Votes table (one vote per user per proposal)
CREATE TABLE public.gov_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.gov_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote public.gov_vote_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);

ALTER TABLE public.gov_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are publicly viewable" ON public.gov_votes FOR SELECT USING (true);
CREATE POLICY "Users can cast votes" ON public.gov_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON public.gov_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON public.gov_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_gov_votes_updated_at BEFORE UPDATE ON public.gov_votes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Drafts table (temporary cards from transcript processing)
CREATE TABLE public.gov_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  context_snippet TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gov_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drafts are publicly viewable" ON public.gov_drafts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create drafts" ON public.gov_drafts FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can delete drafts" ON public.gov_drafts FOR DELETE TO authenticated USING (true);

-- Members table
CREATE TABLE public.gov_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member',
  avatar TEXT NOT NULL DEFAULT '',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gov_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members are publicly viewable" ON public.gov_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage members" ON public.gov_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update members" ON public.gov_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete members" ON public.gov_members FOR DELETE TO authenticated USING (true);

-- Settings table for phase tracking
CREATE TABLE public.gov_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gov_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly viewable" ON public.gov_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update settings" ON public.gov_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert settings" ON public.gov_settings FOR INSERT TO authenticated WITH CHECK (true);

-- Seed the phase setting
INSERT INTO public.gov_settings (key, value) VALUES ('phase', 'visioning');

-- Seed sample members
INSERT INTO public.gov_members (name, role, avatar) VALUES
  ('Amara Okafor', 'Facilitator', 'AO'),
  ('Jordan Lee', 'Policy Lead', 'JL'),
  ('Priya Sharma', 'Community Rep', 'PS'),
  ('Marcus Chen', 'Technical Advisor', 'MC'),
  ('Sofia Reyes', 'Secretary', 'SR');

-- Seed sample policies
INSERT INTO public.gov_policies (title, summary, context_snippet, status) VALUES
  ('Decision-Making Framework', 'All strategic decisions require a two-thirds supermajority from voting members. Operational decisions may be made by designated leads with a 48-hour objection window.', '"We agreed that big-picture strategy should need broad consensus, but day-to-day ops can move faster with a cooling-off period."', 'active'),
  ('Community Engagement Protocol', 'Monthly open forums and quarterly surveys ensure ongoing community input. All engagement results are published within 5 business days.', '"Transparency is non-negotiable. If we ask for input, we publish the results."', 'draft');
