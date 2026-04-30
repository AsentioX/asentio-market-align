-- My DJ: per-user YouTube seed tracking
CREATE TABLE public.mydj_yt_seeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode TEXT NOT NULL,
  query TEXT NOT NULL,
  video_id TEXT,
  video_title TEXT,
  video_channel TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_mydj_yt_seeds_user_mode ON public.mydj_yt_seeds(user_id, mode, created_at DESC);

ALTER TABLE public.mydj_yt_seeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own YT seeds"
  ON public.mydj_yt_seeds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own YT seeds"
  ON public.mydj_yt_seeds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own YT seeds"
  ON public.mydj_yt_seeds FOR DELETE
  USING (auth.uid() = user_id);

-- Per-user rate limit tracking for YouTube searches (keep day-bucketed counts)
CREATE TABLE public.mydj_yt_quota (
  user_id UUID NOT NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  search_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

ALTER TABLE public.mydj_yt_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own YT quota"
  ON public.mydj_yt_quota FOR SELECT
  USING (auth.uid() = user_id);
