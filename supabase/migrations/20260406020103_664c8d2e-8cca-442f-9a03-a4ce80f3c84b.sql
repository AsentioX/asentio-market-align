
-- Performance drivers (shared reference table)
CREATE TABLE wobuddy_performance_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text DEFAULT '⚡',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wobuddy_performance_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view performance drivers" ON wobuddy_performance_drivers FOR SELECT TO public USING (true);

-- Seed performance drivers
INSERT INTO wobuddy_performance_drivers (name, description, icon) VALUES
('Strength', 'Raw force production and muscle power', '💪'),
('Endurance', 'Sustained effort over time', '🫁'),
('Power', 'Explosive force and speed', '⚡'),
('Technique', 'Movement quality and skill precision', '🎯'),
('Efficiency', 'Energy economy and performance per effort', '📊'),
('Mobility', 'Range of motion and flexibility', '🧘'),
('Stability', 'Core control and balance', '🏔️');

-- User goals
CREATE TABLE wobuddy_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'performance',
  metric text NOT NULL DEFAULT 'reps',
  target_value numeric NOT NULL,
  current_value numeric DEFAULT 0,
  timeframe text,
  deadline date,
  status text DEFAULT 'on_track',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE wobuddy_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON wobuddy_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON wobuddy_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON wobuddy_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON wobuddy_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Goal-to-driver mapping
CREATE TABLE wobuddy_goal_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES wobuddy_goals(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES wobuddy_performance_drivers(id) ON DELETE CASCADE,
  UNIQUE(goal_id, driver_id)
);
ALTER TABLE wobuddy_goal_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goal drivers" ON wobuddy_goal_drivers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM wobuddy_goals WHERE id = goal_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own goal drivers" ON wobuddy_goal_drivers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM wobuddy_goals WHERE id = goal_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own goal drivers" ON wobuddy_goal_drivers FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM wobuddy_goals WHERE id = goal_id AND user_id = auth.uid()));

-- Activity enrichment templates (shared reference)
CREATE TABLE wobuddy_activity_enrichments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_name text NOT NULL,
  training_purpose text,
  driver_name text NOT NULL,
  explanation text,
  target_suggestion text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wobuddy_activity_enrichments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view enrichments" ON wobuddy_activity_enrichments FOR SELECT TO public USING (true);

-- Seed activity enrichments
INSERT INTO wobuddy_activity_enrichments (activity_name, training_purpose, driver_name, explanation, target_suggestion) VALUES
('Squats', 'Build leg strength and power', 'Strength', 'Squats develop foundational lower body strength critical for athletic performance', 'Maintain depth and control through full range'),
('Squats', 'Develop explosive power', 'Power', 'Heavy squats build force production needed for explosive movements', 'Focus on driving up powerfully from the bottom'),
('Bench Press', 'Upper body pressing strength', 'Strength', 'Bench press builds chest, shoulder, and tricep strength', 'Control the descent, explode on the press'),
('Deadlift', 'Total body strength', 'Strength', 'Deadlifts build posterior chain strength and grip endurance', 'Maintain neutral spine throughout the lift'),
('Overhead Press', 'Shoulder and pressing power', 'Strength', 'Overhead press develops vertical pushing strength and stability', 'Brace core and press in a straight line'),
('Barbell Row', 'Back and pulling strength', 'Strength', 'Rows build the pulling muscles that balance pressing movements', 'Keep torso stable and pull to lower chest'),
('Curls', 'Arm strength and hypertrophy', 'Strength', 'Isolation work builds arm strength for compound lifts', 'Control the negative for maximum benefit'),
('Run', 'Build aerobic capacity', 'Endurance', 'Running develops cardiovascular endurance and mental toughness', 'Maintain consistent pace across intervals'),
('Run', 'Improve movement economy', 'Efficiency', 'Efficient running form reduces energy cost at any speed', 'Focus on cadence and relaxed shoulders'),
('Row', 'Build total body endurance', 'Endurance', 'Rowing combines upper and lower body for sustained cardiovascular work', 'Hold consistent split times per 500m'),
('Row', 'Develop pulling power', 'Power', 'The rowing stroke requires explosive leg drive and sustained pull', 'Drive hard with legs, maintain smooth recovery'),
('Bike', 'Low-impact cardio endurance', 'Endurance', 'Cycling builds leg endurance with minimal joint impact', 'Maintain steady cadence above 80rpm'),
('Push-ups', 'Build upper body endurance', 'Endurance', 'Push-ups develop muscular endurance and core stability', 'Maintain form quality through all reps'),
('Push-ups', 'Core stability under load', 'Stability', 'Push-ups require sustained core engagement throughout the movement', 'Keep hips level and core braced'),
('Burpees', 'Total body conditioning', 'Endurance', 'Burpees combine strength and cardio for maximum metabolic impact', 'Maintain rhythm and smooth transitions'),
('Pull-ups', 'Upper body pulling strength', 'Strength', 'Pull-ups build back and bicep strength with bodyweight', 'Full range of motion, dead hang to chin over bar'),
('Sit-ups', 'Core strength and endurance', 'Stability', 'Sit-ups develop abdominal strength for trunk stability', 'Control the movement, avoid momentum');
