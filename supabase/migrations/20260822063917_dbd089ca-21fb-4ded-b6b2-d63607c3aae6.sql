
-- 1. gov_docket_items: prevent spoofed author on insert
DROP POLICY IF EXISTS "Authenticated users can add docket items" ON public.gov_docket_items;
CREATE POLICY "Authenticated users can add docket items"
ON public.gov_docket_items FOR INSERT TO authenticated
WITH CHECK (added_by = auth.uid());

-- 2. profiles: block self role escalation
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE((SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()), '') <> 'admin' THEN
    RAISE EXCEPTION 'Not allowed to change role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 3. gov_members: block self role escalation
CREATE OR REPLACE FUNCTION public.prevent_gov_member_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_gov_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not allowed to change role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_gov_member_role_escalation ON public.gov_members;
CREATE TRIGGER prevent_gov_member_role_escalation
BEFORE UPDATE ON public.gov_members
FOR EACH ROW EXECUTE FUNCTION public.prevent_gov_member_role_escalation();

-- 4. scrm_user_roles: block self role escalation
CREATE OR REPLACE FUNCTION public.prevent_scrm_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.scrm_has_role(auth.uid(), 'admin'::public.scrm_role) THEN
    RAISE EXCEPTION 'Not allowed to change role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_scrm_role_escalation ON public.scrm_user_roles;
CREATE TRIGGER prevent_scrm_role_escalation
BEFORE UPDATE ON public.scrm_user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_scrm_role_escalation();
