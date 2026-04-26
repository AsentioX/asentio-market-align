
-- ─────────────────────────────────────────────
-- 1. WIPE existing goals data
-- ─────────────────────────────────────────────
DROP TABLE IF EXISTS public.wobuddy_goal_checkpoints CASCADE;
DROP TABLE IF EXISTS public.wobuddy_goal_drivers CASCADE;
DROP TABLE IF EXISTS public.wobuddy_goals CASCADE;

-- ─────────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_goal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '🎯',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wobuddy_goal_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.wobuddy_goal_categories FOR SELECT USING (true);

INSERT INTO public.wobuddy_goal_categories (slug, name, description, display_order, icon) VALUES
  ('body_composition', 'Body Composition', 'Lose fat, gain muscle, transform your physique', 1, '⚖️'),
  ('strength_power', 'Strength & Power', 'Lift heavier, jump higher, hit harder', 2, '💪'),
  ('endurance_cardio', 'Endurance & Cardiovascular', 'Run further, recover faster, build aerobic capacity', 3, '🫁'),
  ('mobility_recovery', 'Mobility, Flexibility & Recovery', 'Move better, recover faster, prevent injury', 4, '🧘'),
  ('sport_specific', 'Sport-Specific Performance', 'Train for your sport — rowing, running, basketball, tennis', 5, '🎯'),
  ('health_longevity', 'Health & Longevity', 'Improve resting heart rate, blood pressure, healthspan', 6, '💚'),
  ('lifestyle_habits', 'Lifestyle & Habits', 'Build consistency: workouts per week, streaks, daily movement', 7, '🔥');

-- ─────────────────────────────────────────────
-- 3. GOALS (new schema)
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.wobuddy_goal_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived')),
  priority TEXT NOT NULL DEFAULT 'primary' CHECK (priority IN ('primary','secondary','supporting')),
  target_value NUMERIC,
  target_unit TEXT,
  current_value NUMERIC DEFAULT 0,
  start_value NUMERIC DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wobuddy_goals_user_idx ON public.wobuddy_goals(user_id);
CREATE INDEX wobuddy_goals_status_idx ON public.wobuddy_goals(user_id, status);
ALTER TABLE public.wobuddy_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own goals" ON public.wobuddy_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own goals" ON public.wobuddy_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own goals" ON public.wobuddy_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own goals" ON public.wobuddy_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 4. GOAL DRIVERS (with weight + explanation)
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_goal_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.wobuddy_goals(id) ON DELETE CASCADE,
  driver TEXT NOT NULL CHECK (driver IN ('Strength','Endurance','Power','Stability','Mobility','Efficiency','Technique')),
  weight INTEGER NOT NULL DEFAULT 5 CHECK (weight BETWEEN 1 AND 10),
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (goal_id, driver)
);
CREATE INDEX wobuddy_goal_drivers_goal_idx ON public.wobuddy_goal_drivers(goal_id);
ALTER TABLE public.wobuddy_goal_drivers ENABLE ROW LEVEL SECURITY;

-- Security definer for nested-ownership checks
CREATE OR REPLACE FUNCTION public.wobuddy_user_owns_goal(_goal_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.wobuddy_goals WHERE id = _goal_id AND user_id = auth.uid())
$$;

CREATE POLICY "Users view own goal drivers" ON public.wobuddy_goal_drivers FOR SELECT TO authenticated USING (public.wobuddy_user_owns_goal(goal_id));
CREATE POLICY "Users insert own goal drivers" ON public.wobuddy_goal_drivers FOR INSERT TO authenticated WITH CHECK (public.wobuddy_user_owns_goal(goal_id));
CREATE POLICY "Users update own goal drivers" ON public.wobuddy_goal_drivers FOR UPDATE TO authenticated USING (public.wobuddy_user_owns_goal(goal_id));
CREATE POLICY "Users delete own goal drivers" ON public.wobuddy_goal_drivers FOR DELETE TO authenticated USING (public.wobuddy_user_owns_goal(goal_id));

-- ─────────────────────────────────────────────
-- 5. EXERCISE LIBRARY (promoted from TS)
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  icon TEXT,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('strength','cardio','bodyweight','flexibility')),
  entry_type TEXT NOT NULL DEFAULT 'sets' CHECK (entry_type IN ('sets','intervals','duration','simple')),
  default_sets INTEGER,
  default_reps INTEGER,
  default_duration_seconds INTEGER,
  why_it_matters TEXT,
  short_term_benefit TEXT,
  long_term_benefit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wobuddy_exercise_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exercise library" ON public.wobuddy_exercise_library FOR SELECT USING (true);

-- Seed (subset of the TS library; engine still references TS for full metadata)
INSERT INTO public.wobuddy_exercise_library (slug, name, category, subcategory, icon, description, type, entry_type, default_sets, default_reps, default_duration_seconds, why_it_matters, short_term_benefit, long_term_benefit) VALUES
  ('running','Running','endurance','Cardiovascular','🏃','Steady-state or tempo running for aerobic conditioning.','cardio','simple',NULL,NULL,1800,'Builds aerobic capacity and cardiovascular efficiency.','Improves cardio within 2-4 weeks.','Powerful aerobic engine for endurance sports and longevity.'),
  ('sprint_intervals','Sprint Intervals','endurance','High Intensity','⚡','High-intensity sprint intervals with rest periods.','cardio','intervals',6,NULL,30,'Develops anaerobic capacity and neuromuscular power.','Increases top-end speed within 3-6 sessions.','Develops explosive speed transferable to all sports.'),
  ('cycling','Cycling','endurance','Cardiovascular','🚴','Indoor or outdoor cycling.','cardio','simple',NULL,NULL,2400,'Aerobic endurance with low joint impact.','Improves leg endurance without joint stress.','Sustainable aerobic base for multi-sport performance.'),
  ('rowing','Rowing','endurance','Full Body Cardio','🚣','Indoor rowing for full-body endurance and power.','cardio','intervals',NULL,NULL,1800,'Aerobic endurance and pacing for faster 2k row.','Builds rowing technique and aerobic power within 2-3 weeks.','World-class cardio and full-body pulling power.'),
  ('swimming','Swimming','endurance','Aquatic','🏊','Pool or open-water swimming.','cardio','intervals',NULL,NULL,1800,'Full-body conditioning with zero impact.','Improves cardio and upper body endurance.','Exceptional joint-friendly fitness for longevity.'),
  ('jump_rope','Jump Rope','endurance','Conditioning','⏭️','Jump rope for coordination and conditioning.','cardio','simple',NULL,NULL,600,'Coordination, foot speed, cardio in one.','Quickly improves coordination and conditioning.','Fast feet and rhythm for combat sports.'),
  ('stair_climbing','Stair Climbing','endurance','Conditioning','🪜','Stair climbing for leg endurance.','cardio','simple',NULL,NULL,1200,'Targets glutes, quads, calves under cardio load.','Builds leg endurance quickly.','Powerful legs for hiking and mountaineering.'),
  ('squats','Squats','strength','Lower Body','🦵','Barbell back squats for lower body strength.','strength','sets',4,8,NULL,'Lower body strength supports sprinting, jumping, rowing drive.','Foundational leg strength within 2-4 weeks.','Maximal lower body strength for every athletic movement.'),
  ('deadlifts','Deadlifts','strength','Full Body','⬆️','Conventional or sumo deadlifts.','strength','sets',3,5,NULL,'Develops posterior chain — glutes, hamstrings, back.','Builds grip and posterior chain rapidly.','Bulletproof back and hips for heavy lifting.'),
  ('bench_press','Bench Press','strength','Upper Body','🏋️','Barbell bench press.','strength','sets',4,8,NULL,'Upper body pressing strength for contact sports.','Builds chest, shoulder, tricep strength quickly.','Elite upper body pressing power and mass.'),
  ('overhead_press','Overhead Press','strength','Upper Body','🙆','Standing overhead press.','strength','sets',3,8,NULL,'Shoulder strength and core stability.','Strengthens shoulders and overhead stability.','Balanced shoulder strength preventing injury.'),
  ('lunges','Lunges','strength','Lower Body','🦿','Walking or stationary lunges.','strength','sets',3,10,NULL,'Single-leg strength for running and cutting.','Improves balance and identifies imbalances.','Bulletproof single-leg strength preventing injury.'),
  ('leg_press','Leg Press','strength','Lower Body','🦵','Machine leg press.','strength','sets',4,10,NULL,'Targeted quad and glute development.','Builds leg size and strength safely.','Massive quads and glutes for athletic power.'),
  ('barbell_row','Barbell Row','strength','Upper Body','🏋️','Bent-over barbell row.','strength','sets',4,8,NULL,'Pulling strength and back development.','Builds upper back thickness quickly.','Powerful pulling for posture and athletic performance.'),
  ('curls','Curls','strength','Upper Body','💪','Bicep curls.','strength','sets',3,10,NULL,'Bicep development and grip support.','Builds bicep size and definition.','Stronger arms for pulling and grip-intensive sports.'),
  ('pull_ups','Pull-ups','bodyweight','Upper Body','🏋️','Bodyweight pull-ups.','bodyweight','sets',3,8,NULL,'Relative upper body pulling strength.','Builds back and bicep strength rapidly.','Bodyweight mastery for climbing and gymnastics.'),
  ('push_ups','Push-ups','bodyweight','Upper Body','💪','Bodyweight push-ups.','bodyweight','sets',3,15,NULL,'Pressing endurance and shoulder stability.','Builds pressing endurance quickly.','Long-term upper body endurance and stability.'),
  ('plank','Plank','bodyweight','Core','🏔️','Forearm plank hold.','bodyweight','duration',3,NULL,60,'Core anti-extension and bracing.','Builds core endurance within weeks.','Long-term core stability for all athletic movement.'),
  ('sit_ups','Sit-Ups','bodyweight','Core','🪑','Crunches or sit-ups.','bodyweight','sets',3,20,NULL,'Trunk flexion and abdominal endurance.','Builds abdominal endurance.','Strong core for power transfer.'),
  ('burpees','Burpees','bodyweight','Conditioning','🔥','Full-body burpees.','bodyweight','sets',3,10,NULL,'Full-body power-endurance.','Quickly improves conditioning.','Sustained metabolic power for sport.'),
  ('box_jumps','Box Jumps','power','Lower Body','📦','Plyometric box jumps.','bodyweight','sets',3,8,NULL,'Lower body explosive power.','Improves vertical jump within weeks.','Sustained explosiveness for jumping sports.'),
  ('shuttle_runs','Shuttle Runs','agility','Conditioning','🏃','Short-distance back-and-forth sprints.','cardio','intervals',6,NULL,15,'Acceleration, deceleration, change of direction.','Sharpens agility quickly.','Sport-specific agility for team sports.'),
  ('dynamic_stretching','Dynamic Stretching','mobility','Warm-up','🧘','Dynamic mobility flow.','flexibility','duration',1,NULL,900,'Joint mobility and movement preparation.','Reduces stiffness immediately.','Long-term mobility and injury prevention.'),
  ('yoga_flow','Yoga Flow','mobility','Recovery','🧘','Yoga sequence for flexibility and recovery.','flexibility','duration',1,NULL,1200,'Full-body mobility and stress reduction.','Improves flexibility and recovery within weeks.','Sustained mobility and resilience over years.');

-- ─────────────────────────────────────────────
-- 6. EXERCISE → DRIVER MAPPING
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_exercise_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_library_id UUID NOT NULL REFERENCES public.wobuddy_exercise_library(id) ON DELETE CASCADE,
  driver TEXT NOT NULL CHECK (driver IN ('Strength','Endurance','Power','Stability','Mobility','Efficiency','Technique')),
  contribution_score INTEGER NOT NULL DEFAULT 5 CHECK (contribution_score BETWEEN 1 AND 10),
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exercise_library_id, driver)
);
ALTER TABLE public.wobuddy_exercise_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exercise drivers" ON public.wobuddy_exercise_drivers FOR SELECT USING (true);

-- Seed driver contributions per exercise
INSERT INTO public.wobuddy_exercise_drivers (exercise_library_id, driver, contribution_score, explanation)
SELECT e.id, d.driver, d.score, d.explanation FROM public.wobuddy_exercise_library e
JOIN (VALUES
  ('running','Endurance',10,'Sustained aerobic effort builds cardiovascular base.'),
  ('running','Efficiency',8,'Reinforces running economy and pacing.'),
  ('sprint_intervals','Power',9,'Maximal effort sprints develop explosive power.'),
  ('sprint_intervals','Endurance',7,'Repeated efforts build anaerobic capacity.'),
  ('cycling','Endurance',9,'Low-impact aerobic conditioning.'),
  ('cycling','Efficiency',7,'Improves cadence and energy economy.'),
  ('rowing','Endurance',10,'Full-body aerobic and anaerobic engine.'),
  ('rowing','Power',8,'Drive phase trains explosive leg power.'),
  ('rowing','Technique',7,'Stroke mechanics directly affect performance.'),
  ('rowing','Efficiency',8,'Pacing and stroke rate optimize energy output.'),
  ('swimming','Endurance',9,'Sustained breath-controlled cardio.'),
  ('swimming','Technique',8,'Stroke mechanics critical for efficiency.'),
  ('jump_rope','Endurance',7,'Sustained light-intensity cardio.'),
  ('jump_rope','Efficiency',6,'Builds rhythm and footwork economy.'),
  ('stair_climbing','Endurance',8,'Cardio under load.'),
  ('stair_climbing','Strength',6,'Glute and quad endurance.'),
  ('squats','Strength',10,'Foundational lower-body strength builder.'),
  ('squats','Power',8,'Explosive leg drive transfers to sport.'),
  ('squats','Stability',6,'Bracing and trunk control under load.'),
  ('deadlifts','Strength',10,'Total-body strength, especially posterior chain.'),
  ('deadlifts','Power',8,'Hip extension power for sprinting and jumping.'),
  ('bench_press','Strength',10,'Upper-body pressing strength foundation.'),
  ('bench_press','Power',7,'Develops pressing power for contact sports.'),
  ('overhead_press','Strength',9,'Shoulder strength and overhead capacity.'),
  ('overhead_press','Stability',7,'Core bracing under overhead load.'),
  ('lunges','Strength',8,'Unilateral leg strength and balance.'),
  ('lunges','Stability',7,'Hip and ankle stability under load.'),
  ('leg_press','Strength',9,'Targeted quad and glute development.'),
  ('barbell_row','Strength',9,'Upper back pulling strength.'),
  ('curls','Strength',7,'Bicep development and grip support.'),
  ('pull_ups','Strength',9,'Relative upper-body pulling strength.'),
  ('push_ups','Endurance',7,'Pressing endurance and stability.'),
  ('push_ups','Stability',6,'Core and shoulder bracing.'),
  ('plank','Stability',10,'Anti-extension core control.'),
  ('sit_ups','Stability',7,'Trunk flexion strength.'),
  ('burpees','Endurance',8,'Full-body metabolic conditioning.'),
  ('burpees','Power',7,'Explosive jump component.'),
  ('box_jumps','Power',10,'Maximal lower-body explosiveness.'),
  ('box_jumps','Strength',6,'Eccentric loading on landing.'),
  ('shuttle_runs','Power',8,'Acceleration and deceleration power.'),
  ('shuttle_runs','Endurance',7,'Repeated efforts under fatigue.'),
  ('dynamic_stretching','Mobility',10,'Improves joint range of motion.'),
  ('dynamic_stretching','Technique',5,'Reinforces movement quality.'),
  ('yoga_flow','Mobility',10,'Full-body flexibility and recovery.'),
  ('yoga_flow','Stability',6,'Balance and isometric strength.')
) AS d(slug, driver, score, explanation) ON e.slug = d.slug;

-- ─────────────────────────────────────────────
-- 7. TRAINING PLANS (top-level)
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Training Plan',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','completed','archived')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  source TEXT NOT NULL DEFAULT 'generated' CHECK (source IN ('generated','coach','manual')),
  generation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wobuddy_training_plans_user_idx ON public.wobuddy_training_plans(user_id);
CREATE INDEX wobuddy_training_plans_active_idx ON public.wobuddy_training_plans(user_id, status);
ALTER TABLE public.wobuddy_training_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own training plans" ON public.wobuddy_training_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own training plans" ON public.wobuddy_training_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own training plans" ON public.wobuddy_training_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own training plans" ON public.wobuddy_training_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.wobuddy_user_owns_plan(_plan_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.wobuddy_training_plans WHERE id = _plan_id AND user_id = auth.uid())
$$;

-- ─────────────────────────────────────────────
-- 8. PLAN WEEKS
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_training_plan_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_id UUID NOT NULL REFERENCES public.wobuddy_training_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  phase TEXT NOT NULL DEFAULT 'Foundation',
  weekly_focus TEXT,
  intensity_level TEXT NOT NULL DEFAULT 'medium' CHECK (intensity_level IN ('low','medium','high','deload')),
  volume_level TEXT NOT NULL DEFAULT 'medium' CHECK (volume_level IN ('low','medium','high')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (training_plan_id, week_number)
);
CREATE INDEX wobuddy_training_plan_weeks_plan_idx ON public.wobuddy_training_plan_weeks(training_plan_id);
ALTER TABLE public.wobuddy_training_plan_weeks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.wobuddy_user_owns_week(_week_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wobuddy_training_plan_weeks w
    JOIN public.wobuddy_training_plans p ON p.id = w.training_plan_id
    WHERE w.id = _week_id AND p.user_id = auth.uid()
  )
$$;

CREATE POLICY "Users view own plan weeks" ON public.wobuddy_training_plan_weeks FOR SELECT TO authenticated USING (public.wobuddy_user_owns_plan(training_plan_id));
CREATE POLICY "Users insert own plan weeks" ON public.wobuddy_training_plan_weeks FOR INSERT TO authenticated WITH CHECK (public.wobuddy_user_owns_plan(training_plan_id));
CREATE POLICY "Users update own plan weeks" ON public.wobuddy_training_plan_weeks FOR UPDATE TO authenticated USING (public.wobuddy_user_owns_plan(training_plan_id));
CREATE POLICY "Users delete own plan weeks" ON public.wobuddy_training_plan_weeks FOR DELETE TO authenticated USING (public.wobuddy_user_owns_plan(training_plan_id));

-- ─────────────────────────────────────────────
-- 9. PLAN DAYS
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_training_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_week_id UUID NOT NULL REFERENCES public.wobuddy_training_plan_weeks(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  date DATE,
  is_rest BOOLEAN NOT NULL DEFAULT false,
  rest_reason TEXT,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (training_plan_week_id, day_of_week)
);
CREATE INDEX wobuddy_training_plan_days_week_idx ON public.wobuddy_training_plan_days(training_plan_week_id);
ALTER TABLE public.wobuddy_training_plan_days ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.wobuddy_user_owns_day(_day_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wobuddy_training_plan_days d
    JOIN public.wobuddy_training_plan_weeks w ON w.id = d.training_plan_week_id
    JOIN public.wobuddy_training_plans p ON p.id = w.training_plan_id
    WHERE d.id = _day_id AND p.user_id = auth.uid()
  )
$$;

CREATE POLICY "Users view own plan days" ON public.wobuddy_training_plan_days FOR SELECT TO authenticated USING (public.wobuddy_user_owns_week(training_plan_week_id));
CREATE POLICY "Users insert own plan days" ON public.wobuddy_training_plan_days FOR INSERT TO authenticated WITH CHECK (public.wobuddy_user_owns_week(training_plan_week_id));
CREATE POLICY "Users update own plan days" ON public.wobuddy_training_plan_days FOR UPDATE TO authenticated USING (public.wobuddy_user_owns_week(training_plan_week_id));
CREATE POLICY "Users delete own plan days" ON public.wobuddy_training_plan_days FOR DELETE TO authenticated USING (public.wobuddy_user_owns_week(training_plan_week_id));

-- ─────────────────────────────────────────────
-- 10. PLAN SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_training_plan_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_day_id UUID NOT NULL REFERENCES public.wobuddy_training_plan_days(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('strength','cardio','bodyweight','rest','active_recovery')),
  session_order INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  estimated_duration_minutes INTEGER,
  intensity_level TEXT DEFAULT 'medium' CHECK (intensity_level IN ('low','medium','high','peak','taper')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wobuddy_training_plan_sessions_day_idx ON public.wobuddy_training_plan_sessions(training_plan_day_id);
ALTER TABLE public.wobuddy_training_plan_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.wobuddy_user_owns_session(_session_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wobuddy_training_plan_sessions s
    JOIN public.wobuddy_training_plan_days d ON d.id = s.training_plan_day_id
    JOIN public.wobuddy_training_plan_weeks w ON w.id = d.training_plan_week_id
    JOIN public.wobuddy_training_plans p ON p.id = w.training_plan_id
    WHERE s.id = _session_id AND p.user_id = auth.uid()
  )
$$;

CREATE POLICY "Users view own sessions" ON public.wobuddy_training_plan_sessions FOR SELECT TO authenticated USING (public.wobuddy_user_owns_day(training_plan_day_id));
CREATE POLICY "Users insert own sessions" ON public.wobuddy_training_plan_sessions FOR INSERT TO authenticated WITH CHECK (public.wobuddy_user_owns_day(training_plan_day_id));
CREATE POLICY "Users update own sessions" ON public.wobuddy_training_plan_sessions FOR UPDATE TO authenticated USING (public.wobuddy_user_owns_day(training_plan_day_id));
CREATE POLICY "Users delete own sessions" ON public.wobuddy_training_plan_sessions FOR DELETE TO authenticated USING (public.wobuddy_user_owns_day(training_plan_day_id));

-- ─────────────────────────────────────────────
-- 11. SESSION DRIVERS
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_training_plan_session_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_session_id UUID NOT NULL REFERENCES public.wobuddy_training_plan_sessions(id) ON DELETE CASCADE,
  driver TEXT NOT NULL CHECK (driver IN ('Strength','Endurance','Power','Stability','Mobility','Efficiency','Technique')),
  priority TEXT NOT NULL DEFAULT 'primary' CHECK (priority IN ('primary','secondary')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (training_plan_session_id, driver)
);
CREATE INDEX wobuddy_session_drivers_session_idx ON public.wobuddy_training_plan_session_drivers(training_plan_session_id);
ALTER TABLE public.wobuddy_training_plan_session_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own session drivers" ON public.wobuddy_training_plan_session_drivers FOR SELECT TO authenticated USING (public.wobuddy_user_owns_session(training_plan_session_id));
CREATE POLICY "Users insert own session drivers" ON public.wobuddy_training_plan_session_drivers FOR INSERT TO authenticated WITH CHECK (public.wobuddy_user_owns_session(training_plan_session_id));
CREATE POLICY "Users update own session drivers" ON public.wobuddy_training_plan_session_drivers FOR UPDATE TO authenticated USING (public.wobuddy_user_owns_session(training_plan_session_id));
CREATE POLICY "Users delete own session drivers" ON public.wobuddy_training_plan_session_drivers FOR DELETE TO authenticated USING (public.wobuddy_user_owns_session(training_plan_session_id));

-- ─────────────────────────────────────────────
-- 12. SESSION EXERCISES
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_training_plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_session_id UUID NOT NULL REFERENCES public.wobuddy_training_plan_sessions(id) ON DELETE CASCADE,
  exercise_library_id UUID REFERENCES public.wobuddy_exercise_library(id) ON DELETE SET NULL,
  exercise_order INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('strength','cardio','bodyweight','flexibility')),
  sets INTEGER,
  reps INTEGER,
  weight NUMERIC,
  duration_seconds INTEGER,
  distance NUMERIC,
  intensity_target TEXT,
  rest_seconds INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wobuddy_plan_exercises_session_idx ON public.wobuddy_training_plan_exercises(training_plan_session_id);
ALTER TABLE public.wobuddy_training_plan_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own plan exercises" ON public.wobuddy_training_plan_exercises FOR SELECT TO authenticated USING (public.wobuddy_user_owns_session(training_plan_session_id));
CREATE POLICY "Users insert own plan exercises" ON public.wobuddy_training_plan_exercises FOR INSERT TO authenticated WITH CHECK (public.wobuddy_user_owns_session(training_plan_session_id));
CREATE POLICY "Users update own plan exercises" ON public.wobuddy_training_plan_exercises FOR UPDATE TO authenticated USING (public.wobuddy_user_owns_session(training_plan_session_id));
CREATE POLICY "Users delete own plan exercises" ON public.wobuddy_training_plan_exercises FOR DELETE TO authenticated USING (public.wobuddy_user_owns_session(training_plan_session_id));

-- ─────────────────────────────────────────────
-- 13. EXERCISE → GOAL CONTRIBUTIONS
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_exercise_goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.wobuddy_goals(id) ON DELETE CASCADE,
  exercise_library_id UUID NOT NULL REFERENCES public.wobuddy_exercise_library(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL DEFAULT 'primary' CHECK (contribution_type IN ('primary','secondary','supporting')),
  contribution_score INTEGER NOT NULL DEFAULT 5 CHECK (contribution_score BETWEEN 1 AND 10),
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (goal_id, exercise_library_id)
);
CREATE INDEX wobuddy_exercise_goal_contrib_goal_idx ON public.wobuddy_exercise_goal_contributions(goal_id);
ALTER TABLE public.wobuddy_exercise_goal_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own goal contributions" ON public.wobuddy_exercise_goal_contributions FOR SELECT TO authenticated USING (public.wobuddy_user_owns_goal(goal_id));
CREATE POLICY "Users insert own goal contributions" ON public.wobuddy_exercise_goal_contributions FOR INSERT TO authenticated WITH CHECK (public.wobuddy_user_owns_goal(goal_id));
CREATE POLICY "Users update own goal contributions" ON public.wobuddy_exercise_goal_contributions FOR UPDATE TO authenticated USING (public.wobuddy_user_owns_goal(goal_id));
CREATE POLICY "Users delete own goal contributions" ON public.wobuddy_exercise_goal_contributions FOR DELETE TO authenticated USING (public.wobuddy_user_owns_goal(goal_id));

-- ─────────────────────────────────────────────
-- 14. WORKOUT LOGS (per training_plan_day)
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  training_plan_day_id UUID REFERENCES public.wobuddy_training_plan_days(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','skipped','partially_completed')),
  perceived_effort INTEGER CHECK (perceived_effort BETWEEN 1 AND 10),
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wobuddy_workout_logs_user_idx ON public.wobuddy_workout_logs(user_id, completed_at DESC);
ALTER TABLE public.wobuddy_workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own workout logs" ON public.wobuddy_workout_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own workout logs" ON public.wobuddy_workout_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own workout logs" ON public.wobuddy_workout_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own workout logs" ON public.wobuddy_workout_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 15. EXERCISE LOGS
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES public.wobuddy_workout_logs(id) ON DELETE CASCADE,
  exercise_library_id UUID REFERENCES public.wobuddy_exercise_library(id) ON DELETE SET NULL,
  sets_completed INTEGER,
  reps_completed INTEGER,
  weight_used NUMERIC,
  duration_seconds INTEGER,
  distance NUMERIC,
  pace NUMERIC,
  speed NUMERIC,
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  perceived_effort INTEGER CHECK (perceived_effort BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wobuddy_exercise_logs_workout_idx ON public.wobuddy_exercise_logs(workout_log_id);
ALTER TABLE public.wobuddy_exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.wobuddy_user_owns_workout_log(_log_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.wobuddy_workout_logs WHERE id = _log_id AND user_id = auth.uid())
$$;

CREATE POLICY "Users view own exercise logs" ON public.wobuddy_exercise_logs FOR SELECT TO authenticated USING (public.wobuddy_user_owns_workout_log(workout_log_id));
CREATE POLICY "Users insert own exercise logs" ON public.wobuddy_exercise_logs FOR INSERT TO authenticated WITH CHECK (public.wobuddy_user_owns_workout_log(workout_log_id));
CREATE POLICY "Users update own exercise logs" ON public.wobuddy_exercise_logs FOR UPDATE TO authenticated USING (public.wobuddy_user_owns_workout_log(workout_log_id));
CREATE POLICY "Users delete own exercise logs" ON public.wobuddy_exercise_logs FOR DELETE TO authenticated USING (public.wobuddy_user_owns_workout_log(workout_log_id));

-- ─────────────────────────────────────────────
-- 16. GOAL PROGRESS LOGS
-- ─────────────────────────────────────────────
CREATE TABLE public.wobuddy_goal_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.wobuddy_goals(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','workout','wearable','equipment','app')),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wobuddy_goal_progress_logs_goal_idx ON public.wobuddy_goal_progress_logs(goal_id, logged_at DESC);
CREATE INDEX wobuddy_goal_progress_logs_user_idx ON public.wobuddy_goal_progress_logs(user_id, logged_at DESC);
ALTER TABLE public.wobuddy_goal_progress_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own progress logs" ON public.wobuddy_goal_progress_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress logs" ON public.wobuddy_goal_progress_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress logs" ON public.wobuddy_goal_progress_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own progress logs" ON public.wobuddy_goal_progress_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 17. updated_at triggers (reuse existing fn)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.wobuddy_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER wobuddy_goals_updated_at BEFORE UPDATE ON public.wobuddy_goals
  FOR EACH ROW EXECUTE FUNCTION public.wobuddy_set_updated_at();
CREATE TRIGGER wobuddy_training_plans_updated_at BEFORE UPDATE ON public.wobuddy_training_plans
  FOR EACH ROW EXECUTE FUNCTION public.wobuddy_set_updated_at();
