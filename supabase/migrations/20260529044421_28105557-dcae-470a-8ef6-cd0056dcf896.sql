-- Singleton control/state row for the auto-enrich background job
CREATE TABLE public.cf_auto_enrich_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_running BOOLEAN NOT NULL DEFAULT false,
  phase TEXT NOT NULL DEFAULT 'idle', -- idle | discovering | extracting | complete | error
  discovery_batch INTEGER NOT NULL DEFAULT 25,
  extraction_batch INTEGER NOT NULL DEFAULT 25,
  websites_found INTEGER NOT NULL DEFAULT 0,
  emails_found INTEGER NOT NULL DEFAULT 0,
  ticks INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  started_at TIMESTAMPTZ,
  last_tick_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cf_auto_enrich_state_singleton CHECK (id = 1)
);

INSERT INTO public.cf_auto_enrich_state (id) VALUES (1) ON CONFLICT DO NOTHING;

GRANT SELECT, UPDATE ON public.cf_auto_enrich_state TO authenticated;
GRANT ALL ON public.cf_auto_enrich_state TO service_role;

ALTER TABLE public.cf_auto_enrich_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view auto-enrich state"
ON public.cf_auto_enrich_state FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update auto-enrich state"
ON public.cf_auto_enrich_state FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
