GRANT INSERT, SELECT ON public.ck_assessment_results TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ck_assessment_results TO authenticated;
GRANT ALL ON public.ck_assessment_results TO service_role;
GRANT INSERT ON public.ck_outbound_clicks TO anon;
GRANT SELECT, INSERT ON public.ck_outbound_clicks TO authenticated;
GRANT ALL ON public.ck_outbound_clicks TO service_role;