CREATE OR REPLACE FUNCTION public.scrm_protect_self_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.scrm_has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.role := OLD.role;
  NEW.is_active := OLD.is_active;
  NEW.user_id := OLD.user_id;
  NEW.email := OLD.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS scrm_protect_self_role_trg ON public.scrm_user_roles;
CREATE TRIGGER scrm_protect_self_role_trg
BEFORE UPDATE ON public.scrm_user_roles
FOR EACH ROW EXECUTE FUNCTION public.scrm_protect_self_role();

DROP POLICY IF EXISTS "members update own profile" ON public.scrm_user_roles;
CREATE POLICY "members update own profile" ON public.scrm_user_roles
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());