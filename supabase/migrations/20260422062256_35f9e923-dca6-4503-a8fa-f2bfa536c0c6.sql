
ALTER TABLE public.cf_contractors
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_source TEXT,
  ADD COLUMN IF NOT EXISTS email_extraction_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_extracted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_extraction_error TEXT,
  ADD COLUMN IF NOT EXISTS extra_emails TEXT[];

CREATE INDEX IF NOT EXISTS cf_contractors_email_status_idx
  ON public.cf_contractors (email_extraction_status);

CREATE INDEX IF NOT EXISTS cf_contractors_has_email_idx
  ON public.cf_contractors ((email IS NOT NULL));

-- Track extraction batch runs (Stage 3)
CREATE TABLE IF NOT EXISTS public.cf_extraction_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'firecrawl',
  status TEXT NOT NULL DEFAULT 'pending',
  total_targets INTEGER NOT NULL DEFAULT 0,
  processed INTEGER NOT NULL DEFAULT 0,
  succeeded INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  emails_found INTEGER NOT NULL DEFAULT 0,
  filter_json JSONB,
  error_message TEXT,
  created_by UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

ALTER TABLE public.cf_extraction_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view extraction runs"
  ON public.cf_extraction_runs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can insert extraction runs"
  ON public.cf_extraction_runs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can update extraction runs"
  ON public.cf_extraction_runs FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
