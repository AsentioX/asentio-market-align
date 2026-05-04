
-- Helper: governance admin check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_gov_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gov_members
    WHERE user_id = _user_id AND role IN ('admin','team-lead')
  )
$$;

-- ============ cf_contractors: require auth for SELECT ============
DROP POLICY IF EXISTS "Anyone can read contractors" ON public.cf_contractors;
CREATE POLICY "Authenticated can read contractors"
  ON public.cf_contractors FOR SELECT
  TO authenticated USING (true);

-- ============ cf_ingest_runs: admins only ============
DROP POLICY IF EXISTS "Anyone can read ingest runs" ON public.cf_ingest_runs;
-- "Admins can manage ingest runs" ALL policy already covers admin SELECT.

-- ============ gov_members ============
DROP POLICY IF EXISTS "Members are publicly viewable" ON public.gov_members;
DROP POLICY IF EXISTS "Authenticated users can manage members" ON public.gov_members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON public.gov_members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.gov_members;

CREATE POLICY "Authenticated can view members"
  ON public.gov_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can update own row; admins update any"
  ON public.gov_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_gov_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_gov_admin(auth.uid()));
CREATE POLICY "Gov admins can insert members"
  ON public.gov_members FOR INSERT TO authenticated
  WITH CHECK (public.is_gov_admin(auth.uid()));
CREATE POLICY "Gov admins can delete members"
  ON public.gov_members FOR DELETE TO authenticated
  USING (public.is_gov_admin(auth.uid()));

-- ============ gov_policies: tighten DELETE ============
DROP POLICY IF EXISTS "Authenticated users can delete policies" ON public.gov_policies;
CREATE POLICY "Creator or admin can delete policies"
  ON public.gov_policies FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_gov_admin(auth.uid()));

-- ============ gov_drafts: tighten DELETE ============
DROP POLICY IF EXISTS "Authenticated users can delete drafts" ON public.gov_drafts;
CREATE POLICY "Creator or admin can delete drafts"
  ON public.gov_drafts FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_gov_admin(auth.uid()));

-- ============ gov_action_items: tighten UPDATE/DELETE ============
DROP POLICY IF EXISTS "Authenticated can delete action items" ON public.gov_action_items;
DROP POLICY IF EXISTS "Authenticated can update action items" ON public.gov_action_items;
CREATE POLICY "Creator or admin can update action items"
  ON public.gov_action_items FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.is_gov_admin(auth.uid()))
  WITH CHECK (auth.uid() = created_by OR public.is_gov_admin(auth.uid()));
CREATE POLICY "Creator or admin can delete action items"
  ON public.gov_action_items FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_gov_admin(auth.uid()));

-- ============ gov_topic_assignees ============
DROP POLICY IF EXISTS "Assignees are publicly viewable" ON public.gov_topic_assignees;
DROP POLICY IF EXISTS "Authenticated can manage assignees" ON public.gov_topic_assignees;
CREATE POLICY "Authenticated can view assignees"
  ON public.gov_topic_assignees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Assigner or admin can insert assignees"
  ON public.gov_topic_assignees FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = assigned_by OR public.is_gov_admin(auth.uid()));
CREATE POLICY "Assigner or admin can update assignees"
  ON public.gov_topic_assignees FOR UPDATE TO authenticated
  USING (auth.uid() = assigned_by OR public.is_gov_admin(auth.uid()))
  WITH CHECK (auth.uid() = assigned_by OR public.is_gov_admin(auth.uid()));
CREATE POLICY "Assigner or admin can delete assignees"
  ON public.gov_topic_assignees FOR DELETE TO authenticated
  USING (auth.uid() = assigned_by OR public.is_gov_admin(auth.uid()));

-- ============ gov_topic_relations ============
DROP POLICY IF EXISTS "Topic relations are publicly viewable" ON public.gov_topic_relations;
DROP POLICY IF EXISTS "Authenticated can manage topic relations" ON public.gov_topic_relations;
CREATE POLICY "Authenticated can view topic relations"
  ON public.gov_topic_relations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creator or admin can insert topic relations"
  ON public.gov_topic_relations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by OR public.is_gov_admin(auth.uid()));
CREATE POLICY "Creator or admin can update topic relations"
  ON public.gov_topic_relations FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.is_gov_admin(auth.uid()))
  WITH CHECK (auth.uid() = created_by OR public.is_gov_admin(auth.uid()));
CREATE POLICY "Creator or admin can delete topic relations"
  ON public.gov_topic_relations FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_gov_admin(auth.uid()));

-- ============ gov_proposals: hide author email from non-admins ============
DROP POLICY IF EXISTS "Proposals are publicly viewable" ON public.gov_proposals;
CREATE POLICY "Authenticated can view proposals"
  ON public.gov_proposals FOR SELECT TO authenticated USING (true);

-- ============ pp_scrape_runs / pp_offer_sources: admins only ============
DROP POLICY IF EXISTS "Authenticated can read run history" ON public.pp_scrape_runs;
DROP POLICY IF EXISTS "Anyone authenticated can read sources" ON public.pp_offer_sources;

-- ============ analytics_sessions: remove unrestricted UPDATE ============
DROP POLICY IF EXISTS "Anyone can update own session" ON public.analytics_sessions;

-- Provide a SECURITY DEFINER RPC so the client can update its own session
-- only when it presents the matching visitor_id (stored client-side).
CREATE OR REPLACE FUNCTION public.analytics_touch_session(
  _session_id uuid,
  _visitor_id text,
  _intent_score integer DEFAULT NULL,
  _intent_level text DEFAULT NULL,
  _converted boolean DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF _visitor_id IS NULL OR length(_visitor_id) = 0 THEN
    RETURN;
  END IF;
  UPDATE public.analytics_sessions
     SET intent_score = COALESCE(_intent_score, intent_score),
         intent_level = COALESCE(_intent_level, intent_level),
         converted    = COALESCE(_converted, converted),
         last_seen_at = now()
   WHERE id = _session_id
     AND visitor_id = _visitor_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_touch_session(uuid, text, integer, text, boolean) TO anon, authenticated;
