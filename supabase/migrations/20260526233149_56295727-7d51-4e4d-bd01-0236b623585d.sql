
CREATE TABLE public.beaver_boat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.beaver_boat_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.beaver_boat_messages TO authenticated;
GRANT ALL ON public.beaver_boat_messages TO service_role;

ALTER TABLE public.beaver_boat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
  ON public.beaver_boat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(message) BETWEEN 1 AND 4000
  );

CREATE POLICY "Authenticated can view messages"
  ON public.beaver_boat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update messages"
  ON public.beaver_boat_messages FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete messages"
  ON public.beaver_boat_messages FOR DELETE
  TO authenticated
  USING (true);
