
-- asentio_clients: restrict to admins only
DROP POLICY IF EXISTS "Public can view asentio clients" ON public.asentio_clients;
DROP POLICY IF EXISTS "Public can insert asentio clients" ON public.asentio_clients;
DROP POLICY IF EXISTS "Public can update asentio clients" ON public.asentio_clients;
DROP POLICY IF EXISTS "Public can delete asentio clients" ON public.asentio_clients;

CREATE POLICY "Admins can view asentio clients" ON public.asentio_clients
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can insert asentio clients" ON public.asentio_clients
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update asentio clients" ON public.asentio_clients
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete asentio clients" ON public.asentio_clients
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Governance tables: drop public SELECT policies (authenticated policies already cover gov_action_items, gov_policy_likes, gov_vision_comment_votes)
DROP POLICY IF EXISTS "Action items are publicly viewable" ON public.gov_action_items;
DROP POLICY IF EXISTS "Likes are publicly viewable" ON public.gov_policy_likes;
DROP POLICY IF EXISTS "Vision comment votes are publicly viewable" ON public.gov_vision_comment_votes;

-- gov_docket_items: replace public SELECT with authenticated SELECT
DROP POLICY IF EXISTS "Docket items are publicly viewable" ON public.gov_docket_items;
CREATE POLICY "Authenticated users can view docket items" ON public.gov_docket_items
  FOR SELECT TO authenticated USING (true);

-- gov_topic_history: replace public SELECT with authenticated SELECT
DROP POLICY IF EXISTS "History is publicly viewable" ON public.gov_topic_history;
CREATE POLICY "Authenticated users can view topic history" ON public.gov_topic_history
  FOR SELECT TO authenticated USING (true);

-- gov_vision_comments: replace public SELECT with authenticated SELECT
DROP POLICY IF EXISTS "Vision comments are publicly viewable" ON public.gov_vision_comments;
CREATE POLICY "Authenticated users can view vision comments" ON public.gov_vision_comments
  FOR SELECT TO authenticated USING (true);

-- mydj_track_feedback: restrict INSERT to authenticated users matching their own user_id
DROP POLICY IF EXISTS "Anyone can submit track feedback" ON public.mydj_track_feedback;
CREATE POLICY "Users can submit own track feedback" ON public.mydj_track_feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- wobuddy_users: fix admin update policy to prevent self-escalation
DROP POLICY IF EXISTS "WOBuddy admins can update any profile" ON public.wobuddy_users;
CREATE POLICY "WOBuddy admins can update any profile" ON public.wobuddy_users
  FOR UPDATE TO authenticated
  USING (is_wobuddy_admin(auth.uid()) AND auth.uid() <> user_id)
  WITH CHECK (is_wobuddy_admin(auth.uid()) AND auth.uid() <> user_id);
