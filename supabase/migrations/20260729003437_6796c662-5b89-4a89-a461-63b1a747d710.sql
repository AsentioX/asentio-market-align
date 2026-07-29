REVOKE EXECUTE ON FUNCTION public.scrm_no_roles_exist() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.scrm_no_roles_exist() TO authenticated, service_role;