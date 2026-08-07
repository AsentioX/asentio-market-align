
-- pp_users: prevent self-granted admin
DROP POLICY IF EXISTS "pp_users self insert" ON public.pp_users;
DROP POLICY IF EXISTS "pp_users self update" ON public.pp_users;

CREATE POLICY "pp_users self insert" ON public.pp_users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND is_admin = false);

CREATE POLICY "pp_users self update" ON public.pp_users
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND is_admin = false);

CREATE POLICY "pp_users admins update any" ON public.pp_users
FOR UPDATE TO authenticated
USING (public.is_perkpath_admin(auth.uid()) AND auth.uid() <> user_id)
WITH CHECK (public.is_perkpath_admin(auth.uid()) AND auth.uid() <> user_id);

-- wobuddy_users: prevent self-granted admin on insert
DROP POLICY IF EXISTS "Users can insert own wobuddy profile" ON public.wobuddy_users;
CREATE POLICY "Users can insert own wobuddy profile" ON public.wobuddy_users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND is_admin = false);

-- wobuddy_competition_participants: restrict reads to authenticated users
DROP POLICY IF EXISTS "Anyone can view wobuddy participants" ON public.wobuddy_competition_participants;
CREATE POLICY "Authenticated can view wobuddy participants" ON public.wobuddy_competition_participants
FOR SELECT TO authenticated
USING (true);
