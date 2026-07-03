
-- Roles enum
CREATE TYPE public.scrm_role AS ENUM ('chair','committee','ops','leadership');

CREATE TABLE public.scrm_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role scrm_role NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scrm_user_roles TO authenticated;
GRANT ALL ON public.scrm_user_roles TO service_role;
ALTER TABLE public.scrm_user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.scrm_has_role(_user_id uuid, _role scrm_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.scrm_user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.scrm_is_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.scrm_user_roles WHERE user_id = _user_id);
$$;

-- Auto-assign committee role to first user (bootstrap); otherwise none
CREATE OR REPLACE FUNCTION public.scrm_bootstrap_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.scrm_user_roles LIMIT 1) THEN
    INSERT INTO public.scrm_user_roles(user_id, role, email) VALUES (NEW.id, 'chair', NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

CREATE POLICY "members read roles" ON public.scrm_user_roles FOR SELECT TO authenticated
  USING (public.scrm_is_member(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "chair manages roles" ON public.scrm_user_roles FOR ALL TO authenticated
  USING (public.scrm_has_role(auth.uid(),'chair')) WITH CHECK (public.scrm_has_role(auth.uid(),'chair'));
CREATE POLICY "self insert first" ON public.scrm_user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Sponsors
CREATE TABLE public.scrm_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  headquarters TEXT,
  logo_url TEXT,
  stage TEXT NOT NULL DEFAULT 'target_identified',
  priority TEXT NOT NULL DEFAULT 'medium',
  tier_target TEXT,
  relationship_strength INT DEFAULT 0,
  probability INT DEFAULT 20,
  estimated_value NUMERIC DEFAULT 0,
  motivations JSONB DEFAULT '{}'::jsonb,
  owner_id UUID REFERENCES auth.users(id),
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scrm_sponsors TO authenticated;
GRANT ALL ON public.scrm_sponsors TO service_role;
ALTER TABLE public.scrm_sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members all sponsors" ON public.scrm_sponsors FOR ALL TO authenticated
  USING (public.scrm_is_member(auth.uid())) WITH CHECK (public.scrm_is_member(auth.uid()));
CREATE TRIGGER scrm_sponsors_updated BEFORE UPDATE ON public.scrm_sponsors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contacts
CREATE TABLE public.scrm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.scrm_sponsors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  linkedin TEXT,
  influence TEXT DEFAULT 'medium',
  is_decision_maker BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scrm_contacts TO authenticated;
GRANT ALL ON public.scrm_contacts TO service_role;
ALTER TABLE public.scrm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members all contacts" ON public.scrm_contacts FOR ALL TO authenticated
  USING (public.scrm_is_member(auth.uid())) WITH CHECK (public.scrm_is_member(auth.uid()));

-- Actions
CREATE TABLE public.scrm_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.scrm_sponsors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template_key TEXT,
  category TEXT,
  owner_id UUID REFERENCES auth.users(id),
  owner_name TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  waiting_on TEXT DEFAULT 'mit',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scrm_actions TO authenticated;
GRANT ALL ON public.scrm_actions TO service_role;
ALTER TABLE public.scrm_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members all actions" ON public.scrm_actions FOR ALL TO authenticated
  USING (public.scrm_is_member(auth.uid())) WITH CHECK (public.scrm_is_member(auth.uid()));
CREATE TRIGGER scrm_actions_updated BEFORE UPDATE ON public.scrm_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX scrm_actions_open_due ON public.scrm_actions(due_date) WHERE status = 'open';

-- Meetings
CREATE TABLE public.scrm_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.scrm_sponsors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ,
  attendees TEXT,
  transcript TEXT,
  summary JSONB,
  minutes TEXT,
  extracted_actions JSONB,
  source TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scrm_meetings TO authenticated;
GRANT ALL ON public.scrm_meetings TO service_role;
ALTER TABLE public.scrm_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members all meetings" ON public.scrm_meetings FOR ALL TO authenticated
  USING (public.scrm_is_member(auth.uid())) WITH CHECK (public.scrm_is_member(auth.uid()));

-- Deliverables
CREATE TABLE public.scrm_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.scrm_sponsors(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  owner_id UUID REFERENCES auth.users(id),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scrm_deliverables TO authenticated;
GRANT ALL ON public.scrm_deliverables TO service_role;
ALTER TABLE public.scrm_deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members all deliverables" ON public.scrm_deliverables FOR ALL TO authenticated
  USING (public.scrm_is_member(auth.uid())) WITH CHECK (public.scrm_is_member(auth.uid()));
CREATE TRIGGER scrm_deliverables_updated BEFORE UPDATE ON public.scrm_deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
