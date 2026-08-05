CREATE POLICY "scrm members read team photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'scrm-team-photos' AND public.scrm_is_member(auth.uid()));

CREATE POLICY "scrm members upload team photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'scrm-team-photos' AND public.scrm_is_member(auth.uid()));

CREATE POLICY "scrm members update team photos" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'scrm-team-photos' AND public.scrm_is_member(auth.uid()));

CREATE POLICY "scrm members delete team photos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'scrm-team-photos' AND public.scrm_is_member(auth.uid()));