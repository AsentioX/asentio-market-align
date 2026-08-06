CREATE OR REPLACE FUNCTION public.scrm_protect_self_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- server-side / admin contexts are unrestricted
  IF auth.uid() IS NULL OR public.scrm_has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- allow claiming a pending invite: linking own auth id to matching email row
  IF OLD.user_id IS NULL
     AND NEW.user_id = auth.uid()
     AND lower(NEW.email) = lower(OLD.email)
     AND NEW.role = OLD.role
     AND NEW.is_active = OLD.is_active THEN
    RETURN NEW;
  END IF;

  NEW.role := OLD.role;
  NEW.is_active := OLD.is_active;
  NEW.user_id := OLD.user_id;
  NEW.email := OLD.email;
  RETURN NEW;
END;
$$;