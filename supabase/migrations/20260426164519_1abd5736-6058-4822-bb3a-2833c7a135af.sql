-- Add card image + card type fields to wallet entries
ALTER TABLE public.pp_memberships
  ADD COLUMN IF NOT EXISTS card_image_url TEXT,
  ADD COLUMN IF NOT EXISTS card_type TEXT NOT NULL DEFAULT 'membership';

-- Create storage bucket for user-uploaded card images (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pp-cards', 'pp-cards', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: users can manage their own card images (folder = user_id)
DROP POLICY IF EXISTS "pp-cards owner read" ON storage.objects;
CREATE POLICY "pp-cards owner read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pp-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "pp-cards owner insert" ON storage.objects;
CREATE POLICY "pp-cards owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pp-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "pp-cards owner update" ON storage.objects;
CREATE POLICY "pp-cards owner update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'pp-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "pp-cards owner delete" ON storage.objects;
CREATE POLICY "pp-cards owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'pp-cards' AND auth.uid()::text = (storage.foldername(name))[1]);