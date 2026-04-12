
-- WO.Buddy user profiles (separate from main Asentio profiles)
CREATE TABLE public.wobuddy_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  background_url TEXT,
  height NUMERIC DEFAULT 170,
  weight NUMERIC DEFAULT 70,
  goal_weight NUMERIC DEFAULT 70,
  birthdate DATE,
  gender TEXT DEFAULT 'Other',
  ethnicity TEXT DEFAULT 'Other',
  body_fat NUMERIC,
  resting_hr NUMERIC DEFAULT 65,
  fitness_level TEXT DEFAULT 'beginner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wobuddy_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own wobuddy profile"
ON public.wobuddy_users FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- WO.Buddy admins can view all profiles
CREATE POLICY "WOBuddy admins can view all profiles"
ON public.wobuddy_users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wobuddy_users wu
    WHERE wu.user_id = auth.uid() AND wu.is_admin = true
  )
);

-- Users can insert their own profile
CREATE POLICY "Users can insert own wobuddy profile"
ON public.wobuddy_users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own wobuddy profile"
ON public.wobuddy_users FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- WO.Buddy admins can update any profile (e.g. deactivate)
CREATE POLICY "WOBuddy admins can update any profile"
ON public.wobuddy_users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wobuddy_users wu
    WHERE wu.user_id = auth.uid() AND wu.is_admin = true
  )
);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_wobuddy_users_updated_at
BEFORE UPDATE ON public.wobuddy_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
