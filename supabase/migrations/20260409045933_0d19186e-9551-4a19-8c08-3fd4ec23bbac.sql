INSERT INTO storage.buckets (id, name, public) 
VALUES ('mydj-tracks', 'mydj-tracks', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read mydj tracks" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'mydj-tracks');
