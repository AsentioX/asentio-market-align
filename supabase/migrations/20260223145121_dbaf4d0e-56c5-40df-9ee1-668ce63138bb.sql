
-- Create RSS feeds table for admin-managed feed URLs
CREATE TABLE public.rss_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "RSS feeds are publicly viewable"
ON public.rss_feeds
FOR SELECT
USING (true);

-- Admin insert
CREATE POLICY "Admins can insert RSS feeds"
ON public.rss_feeds
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Admin update
CREATE POLICY "Admins can update RSS feeds"
ON public.rss_feeds
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Admin delete
CREATE POLICY "Admins can delete RSS feeds"
ON public.rss_feeds
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Seed default feeds
INSERT INTO public.rss_feeds (name, url) VALUES
  ('Road to VR', 'https://www.roadtovr.com/feed/'),
  ('Mixed News', 'https://mixed-news.com/en/feed/'),
  ('Upload VR', 'https://www.uploadvr.com/feed/');
