ALTER TABLE public.scrm_user_roles ALTER COLUMN user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS scrm_user_roles_email_unique
  ON public.scrm_user_roles (lower(email)) WHERE email IS NOT NULL;

CREATE OR REPLACE FUNCTION public.scrm_claim_pending_membership()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _updated int;
BEGIN
  IF _uid IS NULL THEN RETURN false; END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  IF _email IS NULL THEN RETURN false; END IF;

  UPDATE public.scrm_user_roles
     SET user_id = _uid
   WHERE user_id IS NULL AND lower(email) = lower(_email);
  GET DIAGNOSTICS _updated = ROW_COUNT;
  RETURN _updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.scrm_claim_pending_membership() TO authenticated;