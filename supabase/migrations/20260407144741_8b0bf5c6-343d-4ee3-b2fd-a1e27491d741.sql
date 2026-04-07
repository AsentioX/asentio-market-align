
-- ===== ENUMS =====
CREATE TYPE public.mydj_strategy_type AS ENUM ('mirror', 'counterbalance', 'hybrid');
CREATE TYPE public.mydj_connection_status AS ENUM ('active', 'expired', 'disconnected');
CREATE TYPE public.mydj_session_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.mydj_activity_type AS ENUM ('work', 'run', 'gym', 'relax', 'sleep_prep', 'commute', 'other');
CREATE TYPE public.mydj_music_event_type AS ENUM ('started', 'skipped', 'completed', 'auto_switched', 'user_selected');
CREATE TYPE public.mydj_playlist_type AS ENUM ('generated', 'saved', 'recovery', 'workout', 'focus', 'other');
CREATE TYPE public.mydj_feedback_type AS ENUM ('like', 'dislike', 'skip', 'replay', 'helpful', 'not_helpful');

-- ===== 1. MODES =====
CREATE TABLE public.mydj_modes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  strategy_type public.mydj_strategy_type NOT NULL DEFAULT 'counterbalance',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_modes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modes are publicly viewable" ON public.mydj_modes FOR SELECT USING (true);

-- ===== 2. STATE DEFINITIONS =====
CREATE TABLE public.mydj_state_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'mental',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_state_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "State definitions are publicly viewable" ON public.mydj_state_definitions FOR SELECT USING (true);

-- ===== 3. PROFILES =====
CREATE TABLE public.mydj_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preferred_music_service text,
  default_mode_id uuid REFERENCES public.mydj_modes(id),
  resting_hr_baseline numeric,
  hrv_baseline numeric,
  sleep_baseline_hours numeric,
  preferred_energy_min integer,
  preferred_energy_max integer,
  allow_adaptive_changes boolean NOT NULL DEFAULT true,
  personalization_level text NOT NULL DEFAULT 'medium',
  onboarding_completed boolean NOT NULL DEFAULT false,
  display_name text,
  timezone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.mydj_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mydj profile" ON public.mydj_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mydj profile" ON public.mydj_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mydj profile" ON public.mydj_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===== 4. WEARABLE CONNECTIONS =====
CREATE TABLE public.mydj_wearable_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  external_user_id text,
  access_token_ref text,
  refresh_token_ref text,
  status public.mydj_connection_status NOT NULL DEFAULT 'active',
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_wearable_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wearable connections" ON public.mydj_wearable_connections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wearable connections" ON public.mydj_wearable_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wearable connections" ON public.mydj_wearable_connections FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wearable connections" ON public.mydj_wearable_connections FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== 5. MUSIC PROVIDER CONNECTIONS =====
CREATE TABLE public.mydj_music_provider_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  external_user_id text,
  access_token_ref text,
  refresh_token_ref text,
  status public.mydj_connection_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_music_provider_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own music connections" ON public.mydj_music_provider_connections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own music connections" ON public.mydj_music_provider_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own music connections" ON public.mydj_music_provider_connections FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own music connections" ON public.mydj_music_provider_connections FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== 6. SESSIONS =====
CREATE TABLE public.mydj_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode_id uuid REFERENCES public.mydj_modes(id) NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  activity_type public.mydj_activity_type NOT NULL DEFAULT 'other',
  source_context text NOT NULL DEFAULT 'manual',
  current_state_id uuid REFERENCES public.mydj_state_definitions(id),
  target_state_id uuid REFERENCES public.mydj_state_definitions(id),
  intensity_preference integer DEFAULT 3,
  status public.mydj_session_status NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.mydj_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.mydj_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.mydj_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_mydj_sessions_user_started ON public.mydj_sessions(user_id, started_at DESC);

-- ===== 7. BIOMETRIC READINGS =====
CREATE TABLE public.mydj_biometric_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.mydj_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  heart_rate numeric,
  hrv numeric,
  respiratory_rate numeric,
  sleep_score numeric,
  sleep_duration_minutes integer,
  steps_per_minute numeric,
  cadence numeric,
  pace numeric,
  speed numeric,
  gsr numeric,
  skin_temperature numeric,
  spo2 numeric,
  activity_level text,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_biometric_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own biometric readings" ON public.mydj_biometric_readings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own biometric readings" ON public.mydj_biometric_readings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_mydj_bio_session_recorded ON public.mydj_biometric_readings(session_id, recorded_at);
CREATE INDEX idx_mydj_bio_user_recorded ON public.mydj_biometric_readings(user_id, recorded_at);

-- ===== 8. CONTEXTUAL SIGNALS =====
CREATE TABLE public.mydj_contextual_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.mydj_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  time_of_day_bucket text,
  location_type text,
  ambient_noise_level numeric,
  device_motion_state text,
  manual_mood text,
  manual_goal_note text,
  calendar_context text,
  weather_context text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_contextual_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contextual signals" ON public.mydj_contextual_signals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contextual signals" ON public.mydj_contextual_signals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_mydj_ctx_session_recorded ON public.mydj_contextual_signals(session_id, recorded_at);

-- ===== 9. MUSIC TRACKS =====
CREATE TABLE public.mydj_music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'internal',
  external_track_id text NOT NULL,
  title text NOT NULL,
  artist_name text NOT NULL,
  album_name text,
  duration_ms integer,
  bpm numeric,
  musical_key text,
  mode_major_minor text,
  energy numeric,
  danceability numeric,
  valence numeric,
  acousticness numeric,
  instrumentalness numeric,
  speechiness numeric,
  liveness numeric,
  loudness numeric,
  popularity numeric,
  familiarity_score numeric,
  metadata_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, external_track_id)
);
ALTER TABLE public.mydj_music_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Music tracks are publicly viewable" ON public.mydj_music_tracks FOR SELECT USING (true);
CREATE INDEX idx_mydj_tracks_provider_ext ON public.mydj_music_tracks(provider, external_track_id);

-- ===== 10. PLAYLISTS =====
CREATE TABLE public.mydj_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  mode_id uuid REFERENCES public.mydj_modes(id),
  playlist_type public.mydj_playlist_type NOT NULL DEFAULT 'generated',
  provider text,
  external_playlist_id text,
  is_dynamic boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own playlists" ON public.mydj_playlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playlists" ON public.mydj_playlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playlists" ON public.mydj_playlists FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own playlists" ON public.mydj_playlists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== 11. PLAYLIST TRACKS =====
CREATE TABLE public.mydj_playlist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.mydj_playlists(id) ON DELETE CASCADE NOT NULL,
  track_id uuid REFERENCES public.mydj_music_tracks(id) NOT NULL,
  sequence_number integer NOT NULL,
  target_bpm_alignment numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, sequence_number)
);
ALTER TABLE public.mydj_playlist_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own playlist tracks" ON public.mydj_playlist_tracks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mydj_playlists WHERE mydj_playlists.id = mydj_playlist_tracks.playlist_id AND mydj_playlists.user_id = auth.uid()));
CREATE POLICY "Users can insert own playlist tracks" ON public.mydj_playlist_tracks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.mydj_playlists WHERE mydj_playlists.id = mydj_playlist_tracks.playlist_id AND mydj_playlists.user_id = auth.uid()));
CREATE POLICY "Users can delete own playlist tracks" ON public.mydj_playlist_tracks FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mydj_playlists WHERE mydj_playlists.id = mydj_playlist_tracks.playlist_id AND mydj_playlists.user_id = auth.uid()));

-- ===== 12. ADAPTATION RULES =====
CREATE TABLE public.mydj_adaptation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_id uuid REFERENCES public.mydj_modes(id) NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  rule_type text NOT NULL DEFAULT 'threshold',
  input_conditions jsonb NOT NULL DEFAULT '{}',
  output_actions jsonb NOT NULL DEFAULT '{}',
  priority integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_adaptation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Adaptation rules are publicly viewable" ON public.mydj_adaptation_rules FOR SELECT USING (true);

-- ===== 13. SESSION MUSIC EVENTS =====
CREATE TABLE public.mydj_session_music_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.mydj_sessions(id) ON DELETE CASCADE NOT NULL,
  track_id uuid REFERENCES public.mydj_music_tracks(id) NOT NULL,
  played_at timestamptz NOT NULL DEFAULT now(),
  stopped_at timestamptz,
  event_type public.mydj_music_event_type NOT NULL DEFAULT 'started',
  selection_reason text,
  source_rule_id uuid REFERENCES public.mydj_adaptation_rules(id),
  bpm_at_selection numeric,
  energy_at_selection numeric,
  target_state_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_session_music_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own music events" ON public.mydj_session_music_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mydj_sessions WHERE mydj_sessions.id = mydj_session_music_events.session_id AND mydj_sessions.user_id = auth.uid()));
CREATE POLICY "Users can insert own music events" ON public.mydj_session_music_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.mydj_sessions WHERE mydj_sessions.id = mydj_session_music_events.session_id AND mydj_sessions.user_id = auth.uid()));
CREATE INDEX idx_mydj_music_events_session ON public.mydj_session_music_events(session_id, played_at);

-- ===== 14. PERSONALIZATION FEEDBACK =====
CREATE TABLE public.mydj_personalization_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid REFERENCES public.mydj_sessions(id),
  track_id uuid REFERENCES public.mydj_music_tracks(id),
  feedback_type public.mydj_feedback_type NOT NULL,
  feedback_value integer,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_personalization_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own feedback" ON public.mydj_personalization_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback" ON public.mydj_personalization_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_mydj_feedback_user ON public.mydj_personalization_feedback(user_id, created_at DESC);

-- ===== 15. SESSION OUTCOMES =====
CREATE TABLE public.mydj_session_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.mydj_sessions(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  hr_start numeric,
  hr_end numeric,
  hr_change numeric,
  hrv_start numeric,
  hrv_end numeric,
  hrv_change numeric,
  duration_minutes numeric,
  completion_score numeric,
  target_state_reached boolean,
  effectiveness_score numeric,
  user_rating integer,
  outcome_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_session_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own outcomes" ON public.mydj_session_outcomes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outcomes" ON public.mydj_session_outcomes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outcomes" ON public.mydj_session_outcomes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===== 16. USER TRACK PREFERENCES =====
CREATE TABLE public.mydj_user_track_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_id uuid REFERENCES public.mydj_music_tracks(id) NOT NULL,
  affinity_score numeric NOT NULL DEFAULT 0,
  familiarity_score numeric NOT NULL DEFAULT 0,
  last_interacted_at timestamptz,
  total_likes integer NOT NULL DEFAULT 0,
  total_skips integer NOT NULL DEFAULT 0,
  total_completions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);
ALTER TABLE public.mydj_user_track_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own track prefs" ON public.mydj_user_track_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own track prefs" ON public.mydj_user_track_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own track prefs" ON public.mydj_user_track_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_mydj_track_prefs_affinity ON public.mydj_user_track_preferences(user_id, affinity_score DESC);

-- ===== 17. USER MODE PREFERENCES =====
CREATE TABLE public.mydj_user_mode_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode_id uuid REFERENCES public.mydj_modes(id) NOT NULL,
  preferred_bpm_min numeric,
  preferred_bpm_max numeric,
  preferred_energy_min numeric,
  preferred_energy_max numeric,
  preferred_vocal_level text,
  preferred_familiarity_bias numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, mode_id)
);
ALTER TABLE public.mydj_user_mode_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mode prefs" ON public.mydj_user_mode_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mode prefs" ON public.mydj_user_mode_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mode prefs" ON public.mydj_user_mode_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===== UPDATED_AT TRIGGERS =====
CREATE TRIGGER set_mydj_modes_updated_at BEFORE UPDATE ON public.mydj_modes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_state_defs_updated_at BEFORE UPDATE ON public.mydj_state_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_profiles_updated_at BEFORE UPDATE ON public.mydj_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_wearable_updated_at BEFORE UPDATE ON public.mydj_wearable_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_music_prov_updated_at BEFORE UPDATE ON public.mydj_music_provider_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_sessions_updated_at BEFORE UPDATE ON public.mydj_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_tracks_updated_at BEFORE UPDATE ON public.mydj_music_tracks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_playlists_updated_at BEFORE UPDATE ON public.mydj_playlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_rules_updated_at BEFORE UPDATE ON public.mydj_adaptation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_outcomes_updated_at BEFORE UPDATE ON public.mydj_session_outcomes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_track_prefs_updated_at BEFORE UPDATE ON public.mydj_user_track_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_mode_prefs_updated_at BEFORE UPDATE ON public.mydj_user_mode_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== SEED: MODES =====
INSERT INTO public.mydj_modes (slug, name, description, strategy_type, sort_order) VALUES
  ('calm', 'Calm', 'Reduce stress and anxiety through soothing, adaptive music', 'counterbalance', 1),
  ('focus', 'Focus', 'Enhance deep work and productivity with non-distracting music', 'counterbalance', 2),
  ('energize', 'Energize', 'Boost general activation and energy levels', 'mirror', 3),
  ('endurance', 'Endurance', 'Sustain steady-state workouts with cadence-matched music', 'mirror', 4),
  ('recovery', 'Recovery', 'Support cooldown and relaxation after activity', 'counterbalance', 5);

-- ===== SEED: STATE DEFINITIONS =====
INSERT INTO public.mydj_state_definitions (slug, name, category, description) VALUES
  ('stressed', 'Stressed', 'mental', 'Elevated HR, low HRV — sympathetic nervous system dominant'),
  ('calm', 'Calm', 'mental', 'Low HR, high HRV — parasympathetic dominant'),
  ('fatigued', 'Fatigued', 'physical', 'Low energy, poor sleep score, elevated resting HR'),
  ('energized', 'Energized', 'physical', 'Good sleep, moderate HR, high HRV'),
  ('focused', 'Focused', 'mental', 'Steady HR, high HRV, low movement'),
  ('distracted', 'Distracted', 'mental', 'Fluctuating HR, irregular movement patterns'),
  ('exercising', 'Exercising', 'physical', 'Elevated HR, cadence detected, high movement'),
  ('recovering', 'Recovering', 'physical', 'HR declining post-exercise, HRV rising');

-- ===== SEED: ADAPTATION RULES =====
INSERT INTO public.mydj_adaptation_rules (mode_id, name, description, rule_type, input_conditions, output_actions, priority) VALUES
  ((SELECT id FROM public.mydj_modes WHERE slug='calm'), 'Calm Down High Stress', 'When HR is high and HRV is low, gradually reduce BPM and energy', 'threshold',
   '{"hr_above_baseline_percent": 15, "hrv_below_baseline": true}',
   '{"target_bpm_max": 70, "energy_shift": -30, "vocal_density": "low", "harmonic_tension": "low", "transition_speed": "gradual"}', 10),
  ((SELECT id FROM public.mydj_modes WHERE slug='focus'), 'Focus Work Context', 'Low movement in work context — medium BPM, minimal vocals', 'range',
   '{"activity_level": "low", "context": "work"}',
   '{"target_bpm_min": 70, "target_bpm_max": 100, "vocal_density": "none", "harmonic_tension": "low", "transition_speed": "slow"}', 10),
  ((SELECT id FROM public.mydj_modes WHERE slug='endurance'), 'Cadence Match', 'Match BPM to detected cadence for steady-state workouts', 'scoring',
   '{"cadence_detected": true}',
   '{"bpm_match": "cadence", "energy_shift": 10, "vocal_density": "medium", "transition_speed": "none"}', 10),
  ((SELECT id FROM public.mydj_modes WHERE slug='recovery'), 'Post-Activity Cooldown', 'Gradually decrease tempo and intensity after exercise', 'transition',
   '{"post_activity": true, "hr_declining": true}',
   '{"target_bpm_max": 65, "energy_shift": -40, "harmonic_tension": "minimal", "transition_speed": "very_gradual"}', 10);

-- ===== SEED: SAMPLE TRACKS =====
INSERT INTO public.mydj_music_tracks (provider, external_track_id, title, artist_name, album_name, duration_ms, bpm, energy, valence, instrumentalness) VALUES
  ('internal', 'ocean-waves-001', 'Ocean Waves', 'Ambient Drift', 'Seascape', 280000, 60, 0.15, 0.3, 0.95),
  ('internal', 'neural-flow-001', 'Neural Flow', 'Deep Work', 'Flow State', 240000, 85, 0.35, 0.45, 0.85),
  ('internal', 'sunrise-protocol-001', 'Sunrise Protocol', 'Synth Runners', 'Dawn EP', 210000, 128, 0.75, 0.7, 0.4),
  ('internal', 'midnight-pulse-001', 'Midnight Pulse', 'Beat Lab', 'Nocturne', 195000, 140, 0.85, 0.6, 0.3),
  ('internal', 'forest-rain-001', 'Forest Rain', 'Nature Sound Co', 'Woodland', 320000, 55, 0.10, 0.25, 0.98),
  ('internal', 'grind-state-001', 'Grind State', 'Bass Theory', 'Overdrive', 180000, 170, 0.95, 0.55, 0.2),
  ('internal', 'warm-glow-001', 'Warm Glow', 'Piano Dusk', 'Twilight', 300000, 70, 0.20, 0.5, 0.92),
  ('internal', 'steady-climb-001', 'Steady Climb', 'Tempo Match', 'Elevation', 240000, 125, 0.65, 0.6, 0.5),
  ('internal', 'mind-garden-001', 'Mind Garden', 'Alpha Waves', 'Meditation', 360000, 72, 0.25, 0.4, 0.9),
  ('internal', 'thunder-drive-001', 'Thunder Drive', 'Voltage', 'Storm', 200000, 138, 0.80, 0.5, 0.35),
  ('internal', 'silk-road-001', 'Silk Road', 'World Beat', 'Journey', 260000, 95, 0.45, 0.65, 0.6),
  ('internal', 'cloud-nine-001', 'Cloud Nine', 'Chill Factory', 'Altitude', 290000, 90, 0.30, 0.55, 0.75);

-- ===== VIEWS =====
CREATE OR REPLACE VIEW public.mydj_session_summary_view AS
SELECT
  s.id AS session_id,
  s.user_id,
  m.name AS mode_name,
  m.strategy_type,
  s.activity_type,
  s.started_at,
  s.ended_at,
  s.status,
  s.intensity_preference,
  so.duration_minutes,
  so.hr_start,
  so.hr_end,
  so.hr_change,
  so.hrv_change,
  so.effectiveness_score,
  so.target_state_reached,
  so.user_rating,
  cs.name AS current_state_name,
  ts.name AS target_state_name
FROM public.mydj_sessions s
LEFT JOIN public.mydj_modes m ON s.mode_id = m.id
LEFT JOIN public.mydj_session_outcomes so ON so.session_id = s.id
LEFT JOIN public.mydj_state_definitions cs ON s.current_state_id = cs.id
LEFT JOIN public.mydj_state_definitions ts ON s.target_state_id = ts.id;
