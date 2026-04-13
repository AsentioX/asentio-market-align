
-- Create a security definer function to check wobuddy admin status without recursion
CREATE OR REPLACE FUNCTION public.is_wobuddy_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wobuddy_users
    WHERE user_id = _user_id AND is_admin = true
  )
$$;

-- Drop the recursive policies
DROP POLICY IF EXISTS "WOBuddy admins can view all profiles" ON public.wobuddy_users;
DROP POLICY IF EXISTS "WOBuddy admins can update any profile" ON public.wobuddy_users;

-- Recreate them using the security definer function
CREATE POLICY "WOBuddy admins can view all profiles"
ON public.wobuddy_users FOR SELECT
TO authenticated
USING (public.is_wobuddy_admin(auth.uid()));

CREATE POLICY "WOBuddy admins can update any profile"
ON public.wobuddy_users FOR UPDATE
TO authenticated
USING (public.is_wobuddy_admin(auth.uid()));
