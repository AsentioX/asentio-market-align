CREATE TABLE public.tdz_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tdz_tags TO authenticated;
GRANT ALL ON public.tdz_tags TO service_role;
ALTER TABLE public.tdz_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own tdz tags" ON public.tdz_tags FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);