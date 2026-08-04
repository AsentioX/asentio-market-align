-- 1. profiles.role self-escalation guard
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS DISTINCT FROM 'user' AND NOT public.is_ck_admin(auth.uid()) THEN
      NEW.role := 'user';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_ck_admin(auth.uid()) THEN
      NEW.role := OLD.role;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_profile_role_escalation_trg
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 2. gov_members.role self-escalation guard
CREATE OR REPLACE FUNCTION public.prevent_gov_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role IN ('admin','team-lead') AND NOT public.is_gov_admin(auth.uid()) THEN
      NEW.role := 'member';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_gov_admin(auth.uid()) THEN
      NEW.role := OLD.role;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_gov_role_escalation_trg ON public.gov_members;
CREATE TRIGGER prevent_gov_role_escalation_trg
BEFORE INSERT OR UPDATE ON public.gov_members
FOR EACH ROW EXECUTE FUNCTION public.prevent_gov_role_escalation();

-- 3. pp_users.is_admin self-escalation guard
CREATE OR REPLACE FUNCTION public.prevent_pp_self_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.is_admin = true AND NOT public.is_perkpath_admin(auth.uid()) THEN
      NEW.is_admin := false;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin AND NOT public.is_perkpath_admin(auth.uid()) THEN
      NEW.is_admin := OLD.is_admin;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_pp_self_admin_trg ON public.pp_users;
CREATE TRIGGER prevent_pp_self_admin_trg
BEFORE INSERT OR UPDATE ON public.pp_users
FOR EACH ROW EXECUTE FUNCTION public.prevent_pp_self_admin();