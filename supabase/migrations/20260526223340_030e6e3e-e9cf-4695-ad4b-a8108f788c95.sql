
-- Gallery table for Beaver Boat
CREATE TABLE public.beaver_boat_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'race',
  media_url TEXT NOT NULL,
  media_kind TEXT NOT NULL DEFAULT 'image',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.beaver_boat_gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.beaver_boat_gallery TO authenticated;
GRANT ALL ON public.beaver_boat_gallery TO service_role;

ALTER TABLE public.beaver_boat_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery is publicly viewable"
  ON public.beaver_boat_gallery FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add gallery items"
  ON public.beaver_boat_gallery FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their gallery items"
  ON public.beaver_boat_gallery FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their gallery items"
  ON public.beaver_boat_gallery FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_beaver_boat_gallery_updated_at
  BEFORE UPDATE ON public.beaver_boat_gallery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public storage bucket for gallery media
INSERT INTO storage.buckets (id, name, public)
VALUES ('beaver-boat-gallery', 'beaver-boat-gallery', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Beaver boat gallery is publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'beaver-boat-gallery');

CREATE POLICY "Authenticated users can upload to beaver boat gallery"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'beaver-boat-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own beaver boat media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'beaver-boat-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own beaver boat media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'beaver-boat-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);
