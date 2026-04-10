
CREATE TABLE public.gov_meeting_minutes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  meeting_date date NOT NULL DEFAULT CURRENT_DATE,
  attendees text[] NOT NULL DEFAULT '{}',
  notes text NOT NULL DEFAULT '',
  transcript_id uuid DEFAULT NULL REFERENCES public.gov_drafts(id) ON DELETE SET NULL,
  created_by uuid DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gov_meeting_minutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meeting minutes are publicly viewable"
  ON public.gov_meeting_minutes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create meeting minutes"
  ON public.gov_meeting_minutes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update meeting minutes"
  ON public.gov_meeting_minutes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete meeting minutes"
  ON public.gov_meeting_minutes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE TRIGGER update_gov_meeting_minutes_updated_at
  BEFORE UPDATE ON public.gov_meeting_minutes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
