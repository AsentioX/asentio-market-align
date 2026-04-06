
-- W.O.Buddy user profiles (fitness-specific data)
CREATE TABLE public.wobuddy_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  avatar_initials text NOT NULL DEFAULT '',
  height_cm numeric,
  weight_kg numeric,
  goal_weight_kg numeric,
  birthdate date,
  gender text,
  ethnicity text,
  body_fat_pct numeric,
  resting_hr integer,
  daily_goal integer NOT NULL DEFAULT 500,
  weekly_goal integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- W.O.Buddy workout sessions
CREATE TABLE public.wobuddy_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode text NOT NULL CHECK (mode IN ('strength', 'cardio', 'bodyweight')),
  total_score integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- W.O.Buddy exercises within a workout
CREATE TABLE public.wobuddy_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES public.wobuddy_workouts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('strength', 'cardio', 'bodyweight')),
  reps integer NOT NULL DEFAULT 0,
  sets integer NOT NULL DEFAULT 1,
  weight_lbs numeric,
  distance_km numeric,
  duration_seconds integer NOT NULL DEFAULT 0,
  confidence integer,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- W.O.Buddy competitions
CREATE TABLE public.wobuddy_competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('daily', 'weekly')),
  target integer NOT NULL,
  time_remaining text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- W.O.Buddy competition participants (join table)
CREATE TABLE public.wobuddy_competition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.wobuddy_competitions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

-- W.O.Buddy achievements
CREATE TABLE public.wobuddy_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '🎯',
  unlocked boolean NOT NULL DEFAULT false,
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.wobuddy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wobuddy_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wobuddy_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wobuddy_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wobuddy_competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wobuddy_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: users can CRUD their own
CREATE POLICY "Users can view own wobuddy profile" ON public.wobuddy_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wobuddy profile" ON public.wobuddy_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wobuddy profile" ON public.wobuddy_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Workouts: users can CRUD their own
CREATE POLICY "Users can view own wobuddy workouts" ON public.wobuddy_workouts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wobuddy workouts" ON public.wobuddy_workouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wobuddy workouts" ON public.wobuddy_workouts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wobuddy workouts" ON public.wobuddy_workouts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Exercises: users can CRUD their own
CREATE POLICY "Users can view own wobuddy exercises" ON public.wobuddy_exercises FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wobuddy exercises" ON public.wobuddy_exercises FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wobuddy exercises" ON public.wobuddy_exercises FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wobuddy exercises" ON public.wobuddy_exercises FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Competitions: publicly viewable
CREATE POLICY "Anyone can view wobuddy competitions" ON public.wobuddy_competitions FOR SELECT USING (true);

-- Competition participants: users manage their own, can view leaderboard
CREATE POLICY "Anyone can view wobuddy participants" ON public.wobuddy_competition_participants FOR SELECT USING (true);
CREATE POLICY "Users can join wobuddy competitions" ON public.wobuddy_competition_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wobuddy participation" ON public.wobuddy_competition_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can leave wobuddy competitions" ON public.wobuddy_competition_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Achievements: users can view their own
CREATE POLICY "Users can view own wobuddy achievements" ON public.wobuddy_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wobuddy achievements" ON public.wobuddy_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wobuddy achievements" ON public.wobuddy_achievements FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER update_wobuddy_profiles_updated_at BEFORE UPDATE ON public.wobuddy_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wobuddy_competitions_updated_at BEFORE UPDATE ON public.wobuddy_competitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
