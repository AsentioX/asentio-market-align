
CREATE TABLE public.mydj_track_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  session_id TEXT NULL,
  
  -- Track info
  track_title TEXT NOT NULL,
  track_artist TEXT NOT NULL,
  track_genre TEXT NOT NULL,
  track_url TEXT NOT NULL,
  
  -- Music parameters at time of feedback
  music_bpm INTEGER NOT NULL,
  music_energy INTEGER NOT NULL,
  music_rhythm_density INTEGER NOT NULL,
  music_vocal_presence INTEGER NOT NULL,
  music_harmonic_tension INTEGER NOT NULL,
  music_intensity INTEGER NOT NULL,
  
  -- Biometric state at time of feedback
  bio_heart_rate INTEGER NOT NULL,
  bio_hrv INTEGER NOT NULL,
  bio_stress INTEGER NOT NULL,
  bio_cadence INTEGER NOT NULL,
  bio_sleep_score INTEGER NOT NULL,
  bio_physio_state TEXT NOT NULL,
  
  -- Context
  mode TEXT NOT NULL,
  alignment_score NUMERIC NOT NULL DEFAULT 0,
  strategy TEXT NOT NULL DEFAULT 'counterbalance',
  
  -- User preference
  feedback TEXT NOT NULL CHECK (feedback IN ('thumbs_up', 'thumbs_down')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mydj_track_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (supports demo/anonymous use)
CREATE POLICY "Anyone can submit track feedback"
ON public.mydj_track_feedback
FOR INSERT
TO public
WITH CHECK (true);

-- Authenticated users can view their own feedback
CREATE POLICY "Users can view own feedback"
ON public.mydj_track_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.mydj_track_feedback
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Index for analytics queries
CREATE INDEX idx_mydj_track_feedback_mode ON public.mydj_track_feedback(mode);
CREATE INDEX idx_mydj_track_feedback_feedback ON public.mydj_track_feedback(feedback);
CREATE INDEX idx_mydj_track_feedback_created ON public.mydj_track_feedback(created_at DESC);
