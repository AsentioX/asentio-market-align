-- 1. Extend gov_policies with topic-centric fields
ALTER TABLE public.gov_policies
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS vibe text,
  ADD COLUMN IF NOT EXISTS elephant_in_room text,
  ADD COLUMN IF NOT EXISTS last_discussed_at timestamptz;

-- Validate priority range via trigger (avoiding CHECK for flexibility)
CREATE OR REPLACE FUNCTION public.validate_gov_policy_priority()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.priority IS NOT NULL AND (NEW.priority < 1 OR NEW.priority > 5) THEN
    RAISE EXCEPTION 'priority must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_gov_policy_priority_trg ON public.gov_policies;
CREATE TRIGGER validate_gov_policy_priority_trg
  BEFORE INSERT OR UPDATE ON public.gov_policies
  FOR EACH ROW EXECUTE FUNCTION public.validate_gov_policy_priority();

-- 2. Action Items
CREATE TABLE IF NOT EXISTS public.gov_action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.gov_policies(id) ON DELETE CASCADE,
  task_description text NOT NULL,
  driver_id uuid,
  deadline date,
  is_completed boolean NOT NULL DEFAULT false,
  friction_point text,
  outcome text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_gov_action_items_topic ON public.gov_action_items(topic_id);
ALTER TABLE public.gov_action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Action items are publicly viewable"
  ON public.gov_action_items FOR SELECT USING (true);
CREATE POLICY "Authenticated can create action items"
  ON public.gov_action_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated can update action items"
  ON public.gov_action_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete action items"
  ON public.gov_action_items FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_gov_action_items_updated_at
  BEFORE UPDATE ON public.gov_action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Topic relations (self-referencing)
CREATE TABLE IF NOT EXISTS public.gov_topic_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.gov_policies(id) ON DELETE CASCADE,
  related_topic_id uuid NOT NULL REFERENCES public.gov_policies(id) ON DELETE CASCADE,
  relation_type text NOT NULL DEFAULT 'related',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(topic_id, related_topic_id)
);
ALTER TABLE public.gov_topic_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Topic relations are publicly viewable"
  ON public.gov_topic_relations FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage topic relations"
  ON public.gov_topic_relations FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 4. Topic assignees (Pit Crew)
CREATE TABLE IF NOT EXISTS public.gov_topic_assignees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.gov_policies(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.gov_members(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contributor',
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(topic_id, member_id)
);
ALTER TABLE public.gov_topic_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignees are publicly viewable"
  ON public.gov_topic_assignees FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage assignees"
  ON public.gov_topic_assignees FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 5. Topic history thread (action item lifecycle + description revisions)
CREATE TABLE IF NOT EXISTS public.gov_topic_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.gov_policies(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'description_updated' | 'action_created' | 'action_completed' | 'insight_added' | 'note'
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gov_topic_history_topic ON public.gov_topic_history(topic_id, created_at DESC);
ALTER TABLE public.gov_topic_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "History is publicly viewable"
  ON public.gov_topic_history FOR SELECT USING (true);
CREATE POLICY "Authenticated can append history"
  ON public.gov_topic_history FOR INSERT TO authenticated WITH CHECK (true);

-- 6. Touch last_discussed_at when meeting minutes link to a transcript-derived topic OR action item is added
CREATE OR REPLACE FUNCTION public.touch_topic_last_discussed()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.gov_policies
    SET last_discussed_at = now()
    WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_topic_on_action ON public.gov_action_items;
CREATE TRIGGER touch_topic_on_action
  AFTER INSERT ON public.gov_action_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_topic_last_discussed();

DROP TRIGGER IF EXISTS touch_topic_on_history ON public.gov_topic_history;
CREATE TRIGGER touch_topic_on_history
  AFTER INSERT ON public.gov_topic_history
  FOR EACH ROW EXECUTE FUNCTION public.touch_topic_last_discussed();