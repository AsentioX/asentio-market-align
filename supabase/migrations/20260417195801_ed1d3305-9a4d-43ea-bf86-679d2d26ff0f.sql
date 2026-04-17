
-- Goal Checkpoints: every 4 weeks the user logs a real measurement
-- which updates the goal's current_value and helps the plan engine adapt.

CREATE TABLE IF NOT EXISTS public.wobuddy_goal_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.wobuddy_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  scheduled_for DATE NOT NULL,
  measured_value NUMERIC,
  measured_at TIMESTAMP WITH TIME ZONE,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | logged | skipped
  sequence_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wobuddy_goal_checkpoints_goal_id ON public.wobuddy_goal_checkpoints(goal_id);
CREATE INDEX IF NOT EXISTS idx_wobuddy_goal_checkpoints_user_id ON public.wobuddy_goal_checkpoints(user_id);

ALTER TABLE public.wobuddy_goal_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal checkpoints"
  ON public.wobuddy_goal_checkpoints FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal checkpoints"
  ON public.wobuddy_goal_checkpoints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal checkpoints"
  ON public.wobuddy_goal_checkpoints FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal checkpoints"
  ON public.wobuddy_goal_checkpoints FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_wobuddy_goal_checkpoints_updated_at
  BEFORE UPDATE ON public.wobuddy_goal_checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-seed checkpoints every 4 weeks when a goal is created.
-- Stops at the deadline (or 6 checkpoints if no deadline).
CREATE OR REPLACE FUNCTION public.seed_wobuddy_goal_checkpoints()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq INTEGER := 1;
  v_date DATE := (CURRENT_DATE + INTERVAL '4 weeks')::date;
  v_max_date DATE;
BEGIN
  IF NEW.deadline IS NOT NULL THEN
    v_max_date := NEW.deadline;
  ELSE
    -- No deadline: schedule up to 6 checkpoints (~6 months ahead)
    v_max_date := (CURRENT_DATE + INTERVAL '24 weeks')::date;
  END IF;

  WHILE v_date <= v_max_date AND v_seq <= 12 LOOP
    INSERT INTO public.wobuddy_goal_checkpoints (goal_id, user_id, scheduled_for, sequence_number)
    VALUES (NEW.id, NEW.user_id, v_date, v_seq);
    v_seq := v_seq + 1;
    v_date := (v_date + INTERVAL '4 weeks')::date;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_wobuddy_goal_checkpoints ON public.wobuddy_goals;
CREATE TRIGGER trg_seed_wobuddy_goal_checkpoints
  AFTER INSERT ON public.wobuddy_goals
  FOR EACH ROW EXECUTE FUNCTION public.seed_wobuddy_goal_checkpoints();
