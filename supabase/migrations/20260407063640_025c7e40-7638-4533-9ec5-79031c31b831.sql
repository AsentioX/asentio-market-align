
-- Add avatar and background image URL columns to wobuddy_profiles
ALTER TABLE public.wobuddy_profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS background_url text;

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wobuddy-profiles', 'wobuddy-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload own profile images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'wobuddy-profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own profile images
CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'wobuddy-profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own profile images
CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'wobuddy-profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to profile images
CREATE POLICY "Public read access for profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'wobuddy-profiles');
