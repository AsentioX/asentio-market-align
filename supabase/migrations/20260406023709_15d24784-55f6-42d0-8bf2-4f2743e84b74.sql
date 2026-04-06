
CREATE TABLE public.wobuddy_workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Auto-Generated Plan',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.wobuddy_plan_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.wobuddy_workout_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  workout_type TEXT NOT NULL DEFAULT 'rest',
  focus_drivers TEXT[] NOT NULL DEFAULT '{}',
  exercises JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wobuddy_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wobuddy_plan_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans" ON public.wobuddy_workout_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON public.wobuddy_workout_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.wobuddy_workout_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.wobuddy_workout_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plan days" ON public.wobuddy_plan_days FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.wobuddy_workout_plans WHERE id = plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own plan days" ON public.wobuddy_plan_days FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.wobuddy_workout_plans WHERE id = plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own plan days" ON public.wobuddy_plan_days FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.wobuddy_workout_plans WHERE id = plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own plan days" ON public.wobuddy_plan_days FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.wobuddy_workout_plans WHERE id = plan_id AND user_id = auth.uid()));
