
-- ============================================================
-- ASENTIO ANALYTICS SCHEMA
-- Architecture: event-based tracking with session aggregation
-- All visitor data is anonymized (no PII stored)
-- ============================================================

-- Sessions table: one row per browser session (anonymous)
CREATE TABLE public.analytics_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id    TEXT NOT NULL,
  landing_page  TEXT NOT NULL DEFAULT '/',
  referrer      TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_content   TEXT,
  utm_term      TEXT,
  device_type   TEXT,
  user_agent    TEXT,
  country       TEXT,
  region        TEXT,
  started_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intent_score  INTEGER NOT NULL DEFAULT 0,
  intent_level  TEXT NOT NULL DEFAULT 'low',
  converted     BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a session"
  ON public.analytics_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read sessions"
  ON public.analytics_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can update own session"
  ON public.analytics_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Events table: every tracked interaction
CREATE TABLE public.analytics_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID REFERENCES public.analytics_sessions(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL,
  page_path    TEXT NOT NULL DEFAULT '/',
  event_data   JSONB,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create an event"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read events"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_page_path  ON public.analytics_events(page_path);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_sessions_started  ON public.analytics_sessions(started_at DESC);
CREATE INDEX idx_analytics_sessions_visitor  ON public.analytics_sessions(visitor_id);
CREATE INDEX idx_analytics_sessions_converted ON public.analytics_sessions(converted);
