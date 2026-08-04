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
    -- Allow the designated bootstrap admin account created by the signup trigger
    IF NEW.email = 'admin@asentio.com' THEN
      RETURN NEW;
    END IF;
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