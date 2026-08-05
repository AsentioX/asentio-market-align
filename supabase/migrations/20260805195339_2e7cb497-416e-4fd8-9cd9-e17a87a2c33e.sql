DROP POLICY IF EXISTS "members all sponsors" ON public.scrm_sponsors;

CREATE POLICY "members read sponsors" ON public.scrm_sponsors FOR SELECT TO authenticated USING (public.scrm_is_member(auth.uid()));
CREATE POLICY "members insert sponsors" ON public.scrm_sponsors FOR INSERT TO authenticated WITH CHECK (public.scrm_is_member(auth.uid()));
CREATE POLICY "members update sponsors" ON public.scrm_sponsors FOR UPDATE TO authenticated USING (public.scrm_is_member(auth.uid())) WITH CHECK (public.scrm_is_member(auth.uid()));
CREATE POLICY "admins delete sponsors" ON public.scrm_sponsors FOR DELETE TO authenticated USING (public.scrm_has_role(auth.uid(), 'admin'::public.scrm_role));