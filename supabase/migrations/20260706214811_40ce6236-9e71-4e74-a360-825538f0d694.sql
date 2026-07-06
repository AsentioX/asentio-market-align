
-- beaver_boat_gallery: scope UPDATE to owner
DROP POLICY IF EXISTS "Authenticated users can update gallery items" ON public.beaver_boat_gallery;
CREATE POLICY "Owners can update their gallery items"
  ON public.beaver_boat_gallery
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- beaver_boat_messages: restrict SELECT/UPDATE/DELETE to admins
DROP POLICY IF EXISTS "Authenticated can view messages" ON public.beaver_boat_messages;
DROP POLICY IF EXISTS "Authenticated can update messages" ON public.beaver_boat_messages;
DROP POLICY IF EXISTS "Authenticated can delete messages" ON public.beaver_boat_messages;

CREATE POLICY "Admins can view messages"
  ON public.beaver_boat_messages
  FOR SELECT
  TO authenticated
  USING (public.is_ck_admin(auth.uid()));

CREATE POLICY "Admins can update messages"
  ON public.beaver_boat_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_ck_admin(auth.uid()))
  WITH CHECK (public.is_ck_admin(auth.uid()));

CREATE POLICY "Admins can delete messages"
  ON public.beaver_boat_messages
  FOR DELETE
  TO authenticated
  USING (public.is_ck_admin(auth.uid()));

-- ck_assessment_results: remove public exposure of anonymous rows
DROP POLICY IF EXISTS "ck_assess select own or admin" ON public.ck_assessment_results;
CREATE POLICY "ck_assess select own or admin"
  ON public.ck_assessment_results
  FOR SELECT
  USING (
    public.is_ck_admin(auth.uid())
    OR (user_id IS NOT NULL AND user_id = auth.uid())
  );

-- Fix mutable search_path on internal email-queue helpers
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = '';
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = '';
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = '';
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = '';
