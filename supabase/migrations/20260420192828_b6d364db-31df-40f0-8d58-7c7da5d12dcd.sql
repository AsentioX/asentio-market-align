-- Contractors table mirroring CSLB License Master schema + UI fields
CREATE TABLE public.cf_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_number TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  address TEXT,
  city TEXT,
  county TEXT,
  state TEXT DEFAULT 'CA',
  zip_code TEXT,
  phone TEXT,
  license_status TEXT,
  license_status_date DATE,
  issue_date DATE,
  reissue_date DATE,
  expiration_date DATE,
  inactivation_date DATE,
  reactivation_date DATE,
  classifications TEXT[],
  primary_classification TEXT,
  bond_company TEXT,
  bond_number TEXT,
  bond_amount NUMERIC,
  bond_effective_date DATE,
  bond_cancellation_date DATE,
  cb_surety_company TEXT,
  cb_surety_number TEXT,
  cb_surety_amount NUMERIC,
  cb_surety_effective_date DATE,
  cb_surety_cancellation_date DATE,
  wc_status TEXT,
  wc_company TEXT,
  wc_policy_number TEXT,
  wc_effective_date DATE,
  wc_cancellation_date DATE,
  -- Computed/UI fields
  contractor_type TEXT, -- friendly trade label derived from primary_classification
  estimated_company_size TEXT, -- 'Solo Operator' | 'Small Crew' | 'Growing Local' | 'Mid-Sized' | 'Multi-Location'
  estimated_business_maturity TEXT,
  years_in_business INT,
  confidence_score INT DEFAULT 80,
  source_count INT DEFAULT 1,
  source_urls TEXT[] DEFAULT ARRAY['Official License Source (CSLB)']::TEXT[],
  last_verified_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX cf_contractors_city_idx ON public.cf_contractors(city);
CREATE INDEX cf_contractors_county_idx ON public.cf_contractors(county);
CREATE INDEX cf_contractors_zip_idx ON public.cf_contractors(zip_code);
CREATE INDEX cf_contractors_classification_idx ON public.cf_contractors(primary_classification);
CREATE INDEX cf_contractors_status_idx ON public.cf_contractors(license_status);
CREATE INDEX cf_contractors_classifications_gin ON public.cf_contractors USING GIN(classifications);
CREATE INDEX cf_contractors_business_name_idx ON public.cf_contractors USING GIN(to_tsvector('english', business_name));

ALTER TABLE public.cf_contractors ENABLE ROW LEVEL SECURITY;

-- Public read (this is a public registry, equivalent to CSLB's public lookup)
CREATE POLICY "Anyone can read contractors"
  ON public.cf_contractors FOR SELECT
  USING (true);

-- Only admins can modify (via edge function with service role)
CREATE POLICY "Admins can insert contractors"
  ON public.cf_contractors FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update contractors"
  ON public.cf_contractors FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete contractors"
  ON public.cf_contractors FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_cf_contractors_updated_at
  BEFORE UPDATE ON public.cf_contractors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ingestion run history
CREATE TABLE public.cf_ingest_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'CSLB',
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | parsing | inserting | complete | failed
  total_rows INT DEFAULT 0,
  inserted_rows INT DEFAULT 0,
  updated_rows INT DEFAULT 0,
  failed_rows INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.cf_ingest_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ingest runs"
  ON public.cf_ingest_runs FOR SELECT USING (true);

CREATE POLICY "Admins can manage ingest runs"
  ON public.cf_ingest_runs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage bucket for uploaded CSLB files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cf-ingest', 'cf-ingest', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can upload ingest files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cf-ingest'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can read ingest files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cf-ingest'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete ingest files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cf-ingest'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );