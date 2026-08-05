DROP POLICY IF EXISTS "chair manages roles" ON public.scrm_user_roles;
DROP POLICY IF EXISTS "members read roles" ON public.scrm_user_roles;
DROP POLICY IF EXISTS "bootstrap first chair only" ON public.scrm_user_roles;
DROP POLICY IF EXISTS "self insert first" ON public.scrm_user_roles;
DROP FUNCTION IF EXISTS public.scrm_has_role(uuid, public.scrm_role);

CREATE TYPE public.scrm_role_new AS ENUM ('admin','sponsorship','finance','team_rh');

ALTER TABLE public.scrm_user_roles
  ALTER COLUMN role TYPE public.scrm_role_new
  USING (CASE role::text
    WHEN 'chair' THEN 'admin'
    WHEN 'committee' THEN 'sponsorship'
    WHEN 'ops' THEN 'team_rh'
    WHEN 'leadership' THEN 'team_rh'
    ELSE 'team_rh' END)::public.scrm_role_new;

DROP TYPE public.scrm_role;
ALTER TYPE public.scrm_role_new RENAME TO scrm_role;

CREATE OR REPLACE FUNCTION public.scrm_has_role(_user_id uuid, _role public.scrm_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.scrm_user_roles WHERE user_id = _user_id AND role = _role) $$;

REVOKE EXECUTE ON FUNCTION public.scrm_has_role(uuid, public.scrm_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.scrm_has_role(uuid, public.scrm_role) TO authenticated, service_role;

CREATE POLICY "members read roles" ON public.scrm_user_roles FOR SELECT TO authenticated
  USING (public.scrm_is_member(auth.uid()));
CREATE POLICY "admin manages roles" ON public.scrm_user_roles FOR ALL TO authenticated
  USING (public.scrm_has_role(auth.uid(),'admin')) WITH CHECK (public.scrm_has_role(auth.uid(),'admin'));
CREATE POLICY "bootstrap first admin only" ON public.scrm_user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.scrm_no_roles_exist());