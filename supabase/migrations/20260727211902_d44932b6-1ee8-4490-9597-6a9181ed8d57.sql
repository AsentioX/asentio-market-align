-- 1. Extend xr_companies into the primary directory entity
ALTER TABLE public.xr_companies
  ADD COLUMN IF NOT EXISTS company_type text,
  ADD COLUMN IF NOT EXISTS primary_category text,
  ADD COLUMN IF NOT EXISTS subcategories text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS technologies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS products_summary text,
  ADD COLUMN IF NOT EXISTS target_markets text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_capabilities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS human_interface text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS funding_stage text,
  ADD COLUMN IF NOT EXISTS key_investors text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS key_partnerships text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS asentio_take text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

CREATE INDEX IF NOT EXISTS xr_companies_primary_category_idx ON public.xr_companies (primary_category);

-- 2. Link products to companies
ALTER TABLE public.xr_products
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.xr_companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS xr_products_company_id_idx ON public.xr_products (company_id);

-- 3. Articles (Insights + Research)
CREATE TABLE IF NOT EXISTS public.asentio_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  body text,
  hero_image_url text,
  author text NOT NULL DEFAULT 'Jon Li',
  published_at timestamptz,
  kind text NOT NULL DEFAULT 'insight',
  categories text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  related_company_ids uuid[] NOT NULL DEFAULT '{}',
  related_directory_categories text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  is_gated boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.asentio_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asentio_articles TO authenticated;
GRANT ALL ON public.asentio_articles TO service_role;

ALTER TABLE public.asentio_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are public"
  ON public.asentio_articles FOR SELECT
  USING (status = 'published' OR public.is_ck_admin(auth.uid()));

CREATE POLICY "Admins manage articles"
  ON public.asentio_articles FOR ALL
  TO authenticated
  USING (public.is_ck_admin(auth.uid()))
  WITH CHECK (public.is_ck_admin(auth.uid()));

CREATE TRIGGER asentio_articles_set_updated_at
  BEFORE UPDATE ON public.asentio_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Newsletter subscribers
CREATE TABLE IF NOT EXISTS public.asentio_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  company text,
  role text,
  source text NOT NULL DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS asentio_subscribers_email_key ON public.asentio_subscribers (lower(email));

GRANT INSERT ON public.asentio_subscribers TO anon;
GRANT SELECT, INSERT ON public.asentio_subscribers TO authenticated;
GRANT ALL ON public.asentio_subscribers TO service_role;

ALTER TABLE public.asentio_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON public.asentio_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins read subscribers"
  ON public.asentio_subscribers FOR SELECT
  TO authenticated
  USING (public.is_ck_admin(auth.uid()));

-- 5. Directory submissions / profile claims
CREATE TABLE IF NOT EXISTS public.asentio_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type text NOT NULL DEFAULT 'new_company',
  company_name text NOT NULL,
  website text,
  logo_url text,
  description text,
  hq_location text,
  company_type text,
  primary_category text,
  subcategories text[] NOT NULL DEFAULT '{}',
  ai_capabilities text[] NOT NULL DEFAULT '{}',
  human_interface text[] NOT NULL DEFAULT '{}',
  products_summary text,
  funding_stage text,
  key_investors text[] NOT NULL DEFAULT '{}',
  key_partnerships text[] NOT NULL DEFAULT '{}',
  submitter_name text,
  submitter_email text,
  submitter_role text,
  existing_company_id uuid REFERENCES public.xr_companies(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'xr_directory',
  status text NOT NULL DEFAULT 'pending',
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.asentio_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asentio_submissions TO authenticated;
GRANT ALL ON public.asentio_submissions TO service_role;

ALTER TABLE public.asentio_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a company"
  ON public.asentio_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins manage submissions"
  ON public.asentio_submissions FOR ALL
  TO authenticated
  USING (public.is_ck_admin(auth.uid()))
  WITH CHECK (public.is_ck_admin(auth.uid()));

CREATE TRIGGER asentio_submissions_set_updated_at
  BEFORE UPDATE ON public.asentio_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();