
-- 1. gov_votes: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Votes are publicly viewable" ON public.gov_votes;
CREATE POLICY "Authenticated users can view votes"
  ON public.gov_votes FOR SELECT
  TO authenticated
  USING (true);

-- 2. gov_settings: lock writes down to admins
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.gov_settings;
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.gov_settings;

CREATE POLICY "Admins can update settings"
  ON public.gov_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can insert settings"
  ON public.gov_settings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 3. wobuddy_users: prevent privilege escalation via is_admin
CREATE OR REPLACE FUNCTION public.prevent_wobuddy_self_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role / superuser bypass entirely
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- On INSERT, force is_admin to false unless caller is already a wobuddy admin
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_admin = true AND NOT public.is_wobuddy_admin(auth.uid()) THEN
      NEW.is_admin := false;
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE, block is_admin changes unless caller is already a wobuddy admin
  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
       AND NOT public.is_wobuddy_admin(auth.uid()) THEN
      NEW.is_admin := OLD.is_admin;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_wobuddy_self_admin_trg ON public.wobuddy_users;
CREATE TRIGGER prevent_wobuddy_self_admin_trg
BEFORE INSERT OR UPDATE ON public.wobuddy_users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_wobuddy_self_admin();
