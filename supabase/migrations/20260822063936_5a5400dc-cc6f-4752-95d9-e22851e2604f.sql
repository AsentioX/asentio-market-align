
REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_escalation() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_gov_member_role_escalation() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_scrm_role_escalation() FROM public, anon, authenticated;
