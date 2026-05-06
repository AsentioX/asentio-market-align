
-- 1. gov_policy_likes: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view policy likes" ON public.gov_policy_likes;
DROP POLICY IF EXISTS "Public can view policy likes" ON public.gov_policy_likes;
DROP POLICY IF EXISTS "policy_likes_select" ON public.gov_policy_likes;
CREATE POLICY "Authenticated users can view policy likes"
  ON public.gov_policy_likes FOR SELECT
  TO authenticated
  USING (true);

-- 2. gov_vision_comment_votes: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Anyone can view vision comment votes" ON public.gov_vision_comment_votes;
DROP POLICY IF EXISTS "Public can view vision comment votes" ON public.gov_vision_comment_votes;
CREATE POLICY "Authenticated users can view vision comment votes"
  ON public.gov_vision_comment_votes FOR SELECT
  TO authenticated
  USING (true);

-- 3. gov_action_items: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Anyone can view action items" ON public.gov_action_items;
DROP POLICY IF EXISTS "Public can view action items" ON public.gov_action_items;
CREATE POLICY "Authenticated users can view action items"
  ON public.gov_action_items FOR SELECT
  TO authenticated
  USING (true);

-- 4. analytics_events: bound INSERT field lengths
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Public can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert bounded analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(event_type) <= 128
    AND length(page_path) <= 512
    AND (event_data IS NULL OR length(event_data::text) <= 8192)
  );

-- 5. wobuddy_users: prevent admin-to-admin privilege escalation
DROP POLICY IF EXISTS "WOBuddy admins can update any profile" ON public.wobuddy_users;
CREATE POLICY "WOBuddy admins can update any profile"
  ON public.wobuddy_users FOR UPDATE
  TO authenticated
  USING (public.is_wobuddy_admin(auth.uid()))
  WITH CHECK (
    public.is_wobuddy_admin(auth.uid())
    AND (is_admin = false OR auth.uid() = user_id)
  );
