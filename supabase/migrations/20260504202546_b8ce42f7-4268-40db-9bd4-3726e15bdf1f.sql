
-- 1. cf_contractors: restrict SELECT to admins only (PII protection)
DROP POLICY IF EXISTS "Authenticated can read contractors" ON public.cf_contractors;
CREATE POLICY "Admins can read contractors"
  ON public.cf_contractors FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 2. gov_members: restrict SELECT to governance members and admins
DROP POLICY IF EXISTS "Authenticated can view members" ON public.gov_members;
CREATE POLICY "Gov members and admins can view members"
  ON public.gov_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_gov_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.gov_members gm WHERE gm.user_id = auth.uid())
  );

-- 3. gov_policy_votes: restrict SELECT to authenticated governance members + own votes
DROP POLICY IF EXISTS "Policy votes are publicly viewable" ON public.gov_policy_votes;
CREATE POLICY "Gov members can view policy votes"
  ON public.gov_policy_votes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_gov_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.gov_members gm WHERE gm.user_id = auth.uid())
  );

-- 4. wobuddy_users: prevent self-promotion via WITH CHECK on self-update
DROP POLICY IF EXISTS "Users can update own wobuddy profile" ON public.wobuddy_users;
CREATE POLICY "Users can update own wobuddy profile"
  ON public.wobuddy_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_admin = false);

-- 5. gov_docket_items: restrict DELETE to adder or gov admin
DROP POLICY IF EXISTS "Authenticated users can remove docket items" ON public.gov_docket_items;
CREATE POLICY "Adders or gov admins can remove docket items"
  ON public.gov_docket_items FOR DELETE
  TO authenticated
  USING (auth.uid() = added_by OR public.is_gov_admin(auth.uid()));

-- 6. gov_topic_history: enforce actor_id matches auth.uid()
DROP POLICY IF EXISTS "Authenticated can append history" ON public.gov_topic_history;
CREATE POLICY "Members append own history entries"
  ON public.gov_topic_history FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.gov_members gm WHERE gm.user_id = auth.uid())
  );

-- 7. analytics_sessions: tighten INSERT to require a non-empty visitor_id
DROP POLICY IF EXISTS "Anyone can create a session" ON public.analytics_sessions;
CREATE POLICY "Anyone can create a session"
  ON public.analytics_sessions FOR INSERT
  TO public
  WITH CHECK (visitor_id IS NOT NULL AND length(visitor_id) BETWEEN 8 AND 128);

-- 8. Lock down helper functions with fixed search_path
CREATE OR REPLACE FUNCTION public.wobuddy_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$;
