GRANT INSERT ON public.analytics_sessions TO anon, authenticated;
GRANT SELECT ON public.analytics_sessions TO authenticated;
GRANT ALL ON public.analytics_sessions TO service_role;

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;