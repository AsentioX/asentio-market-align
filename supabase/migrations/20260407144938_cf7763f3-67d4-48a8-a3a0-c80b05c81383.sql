
-- ===== ENUMS =====
CREATE TYPE public.mydj_location_event_type AS ENUM ('entered', 'exited', 'reentered', 'dwell');
CREATE TYPE public.mydj_playback_status AS ENUM ('playing', 'paused', 'stopped');

-- ===== 1. LOCATIONS =====
CREATE TABLE public.mydj_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  location_type text NOT NULL DEFAULT 'room',
  detection_method text NOT NULL DEFAULT 'manual',
  latitude numeric,
  longitude numeric,
  radius_meters numeric,
  wifi_signature text,
  beacon_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own locations" ON public.mydj_locations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own locations" ON public.mydj_locations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own locations" ON public.mydj_locations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own locations" ON public.mydj_locations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_mydj_locations_user_name ON public.mydj_locations(user_id, name);

-- ===== 2. AUDIO SCENES =====
CREATE TABLE public.mydj_audio_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  location_id uuid REFERENCES public.mydj_locations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  mode_id uuid REFERENCES public.mydj_modes(id),
  playlist_id uuid REFERENCES public.mydj_playlists(id),
  preferred_genre text,
  preferred_artist text,
  preferred_bpm_min numeric,
  preferred_bpm_max numeric,
  entry_behavior text NOT NULL DEFAULT 'play',
  exit_behavior text NOT NULL DEFAULT 'pause',
  reentry_behavior text NOT NULL DEFAULT 'resume',
  fade_in_seconds integer,
  fade_out_seconds integer,
  priority integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_audio_scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audio scenes" ON public.mydj_audio_scenes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audio scenes" ON public.mydj_audio_scenes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own audio scenes" ON public.mydj_audio_scenes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own audio scenes" ON public.mydj_audio_scenes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_mydj_scenes_location_priority ON public.mydj_audio_scenes(location_id, priority);

-- ===== 3. LOCATION EVENTS =====
CREATE TABLE public.mydj_location_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid REFERENCES public.mydj_sessions(id),
  location_id uuid REFERENCES public.mydj_locations(id) ON DELETE CASCADE NOT NULL,
  event_type public.mydj_location_event_type NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  confidence_score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_location_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own location events" ON public.mydj_location_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own location events" ON public.mydj_location_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_mydj_loc_events_user_detected ON public.mydj_location_events(user_id, detected_at DESC);

-- ===== 4. MEMORY ASSOCIATIONS =====
CREATE TABLE public.mydj_memory_associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  location_id uuid REFERENCES public.mydj_locations(id) ON DELETE SET NULL,
  track_id uuid REFERENCES public.mydj_music_tracks(id),
  playlist_id uuid REFERENCES public.mydj_playlists(id),
  title text NOT NULL,
  note text,
  memory_type text NOT NULL DEFAULT 'ritual',
  emotional_intent text NOT NULL DEFAULT 'comfort',
  strength_score numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mydj_memory_associations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memories" ON public.mydj_memory_associations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON public.mydj_memory_associations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON public.mydj_memory_associations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON public.mydj_memory_associations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_mydj_memories_user_location ON public.mydj_memory_associations(user_id, location_id);

-- ===== 5. PLAYBACK CONTEXT =====
CREATE TABLE public.mydj_playback_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  location_id uuid REFERENCES public.mydj_locations(id) ON DELETE CASCADE NOT NULL,
  scene_id uuid REFERENCES public.mydj_audio_scenes(id) ON DELETE SET NULL,
  track_id uuid REFERENCES public.mydj_music_tracks(id),
  playlist_id uuid REFERENCES public.mydj_playlists(id),
  playback_position_ms integer,
  playback_status public.mydj_playback_status NOT NULL DEFAULT 'stopped',
  last_event_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, location_id)
);
ALTER TABLE public.mydj_playback_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own playback context" ON public.mydj_playback_context FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playback context" ON public.mydj_playback_context FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playback context" ON public.mydj_playback_context FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own playback context" ON public.mydj_playback_context FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_mydj_playback_user_location ON public.mydj_playback_context(user_id, location_id);

-- ===== TRIGGERS =====
CREATE TRIGGER set_mydj_locations_updated_at BEFORE UPDATE ON public.mydj_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_scenes_updated_at BEFORE UPDATE ON public.mydj_audio_scenes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_memories_updated_at BEFORE UPDATE ON public.mydj_memory_associations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_mydj_playback_updated_at BEFORE UPDATE ON public.mydj_playback_context FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
