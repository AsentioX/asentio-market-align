
-- Governance: authenticated-only reads
DROP POLICY IF EXISTS "Drafts are publicly viewable" ON public.gov_drafts;
CREATE POLICY "Drafts viewable by authenticated" ON public.gov_drafts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Policies are publicly viewable" ON public.gov_policies;
CREATE POLICY "Policies viewable by authenticated" ON public.gov_policies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Meeting minutes are publicly viewable" ON public.gov_meeting_minutes;
CREATE POLICY "Meeting minutes viewable by authenticated" ON public.gov_meeting_minutes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Settings are publicly viewable" ON public.gov_settings;
CREATE POLICY "Settings viewable by authenticated" ON public.gov_settings FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.gov_drafts, public.gov_policies, public.gov_meeting_minutes, public.gov_settings FROM anon;

-- CareKits: cannot attach results to someone else's account
DROP POLICY IF EXISTS "ck_assess insert anyone" ON public.ck_assessment_results;
CREATE POLICY "ck_assess insert self or anon" ON public.ck_assessment_results
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- SCRM: prevent self role escalation
CREATE OR REPLACE FUNCTION public.scrm_no_roles_exist()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.scrm_user_roles)
$$;

DROP POLICY IF EXISTS "self insert first" ON public.scrm_user_roles;
CREATE POLICY "bootstrap first chair only" ON public.scrm_user_roles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.scrm_no_roles_exist());
