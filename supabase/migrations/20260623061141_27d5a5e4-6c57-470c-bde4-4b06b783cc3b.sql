
-- CareKits CMS schema
-- Helper function to check admin role from profiles table
CREATE OR REPLACE FUNCTION public.is_ck_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'admin'
  )
$$;

-- Categories
CREATE TABLE public.ck_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ck_categories TO anon, authenticated;
GRANT ALL ON public.ck_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.ck_categories TO authenticated;
ALTER TABLE public.ck_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ck_categories public read" ON public.ck_categories FOR SELECT USING (true);
CREATE POLICY "ck_categories admin write" ON public.ck_categories FOR ALL TO authenticated
  USING (public.is_ck_admin(auth.uid())) WITH CHECK (public.is_ck_admin(auth.uid()));
CREATE TRIGGER ck_categories_updated BEFORE UPDATE ON public.ck_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Products
CREATE TABLE public.ck_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  category_id uuid REFERENCES public.ck_categories(id) ON DELETE SET NULL,
  short_description text,
  long_description text,
  image_url text,
  price numeric(10,2),
  price_max numeric(10,2),
  monthly_cost numeric(10,2),
  affiliate_url text,
  partner_name text,
  setup_difficulty text CHECK (setup_difficulty IN ('easy','moderate','professional')),
  privacy_level text CHECK (privacy_level IN ('high','medium','low')),
  requires_wearable boolean NOT NULL DEFAULT false,
  uses_camera boolean NOT NULL DEFAULT false,
  requires_subscription boolean NOT NULL DEFAULT false,
  best_for_tags text[] NOT NULL DEFAULT '{}',
  risk_tags text[] NOT NULL DEFAULT '{}',
  pros text[] NOT NULL DEFAULT '{}',
  cons text[] NOT NULL DEFAULT '{}',
  senior_comfort_score int CHECK (senior_comfort_score BETWEEN 1 AND 5),
  caregiver_peace_of_mind_score int CHECK (caregiver_peace_of_mind_score BETWEEN 1 AND 5),
  overall_score int CHECK (overall_score BETWEEN 1 AND 5),
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ck_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ck_products TO authenticated;
GRANT ALL ON public.ck_products TO service_role;
ALTER TABLE public.ck_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ck_products public read published" ON public.ck_products FOR SELECT
  USING (is_published = true OR public.is_ck_admin(auth.uid()));
CREATE POLICY "ck_products admin write" ON public.ck_products FOR ALL TO authenticated
  USING (public.is_ck_admin(auth.uid())) WITH CHECK (public.is_ck_admin(auth.uid()));
CREATE TRIGGER ck_products_updated BEFORE UPDATE ON public.ck_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ck_products_category_idx ON public.ck_products(category_id);
CREATE INDEX ck_products_published_idx ON public.ck_products(is_published);

-- Assessment results
CREATE TABLE public.ck_assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  parent_name text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  fall_risk_score int NOT NULL DEFAULT 0,
  medication_risk_score int NOT NULL DEFAULT 0,
  cognitive_risk_score int NOT NULL DEFAULT 0,
  home_safety_risk_score int NOT NULL DEFAULT 0,
  routine_visibility_score int NOT NULL DEFAULT 0,
  social_isolation_score int NOT NULL DEFAULT 0,
  privacy_preference_score int NOT NULL DEFAULT 0,
  tech_comfort_score int NOT NULL DEFAULT 0,
  budget_range text,
  risk_tags text[] NOT NULL DEFAULT '{}',
  recommended_categories text[] NOT NULL DEFAULT '{}',
  recommended_product_ids uuid[] NOT NULL DEFAULT '{}',
  kit_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ck_assessment_results TO anon, authenticated;
GRANT UPDATE, DELETE ON public.ck_assessment_results TO authenticated;
GRANT ALL ON public.ck_assessment_results TO service_role;
ALTER TABLE public.ck_assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ck_assess insert anyone" ON public.ck_assessment_results FOR INSERT
  WITH CHECK (true);
CREATE POLICY "ck_assess select own or admin" ON public.ck_assessment_results FOR SELECT
  USING (
    public.is_ck_admin(auth.uid())
    OR (user_id IS NOT NULL AND user_id = auth.uid())
    OR user_id IS NULL
  );
CREATE POLICY "ck_assess admin manage" ON public.ck_assessment_results FOR ALL TO authenticated
  USING (public.is_ck_admin(auth.uid())) WITH CHECK (public.is_ck_admin(auth.uid()));

-- Outbound clicks
CREATE TABLE public.ck_outbound_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.ck_products(id) ON DELETE SET NULL,
  assessment_result_id uuid REFERENCES public.ck_assessment_results(id) ON DELETE SET NULL,
  user_email text,
  partner_name text,
  affiliate_url text,
  referrer text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.ck_outbound_clicks TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.ck_outbound_clicks TO authenticated;
GRANT ALL ON public.ck_outbound_clicks TO service_role;
ALTER TABLE public.ck_outbound_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ck_clicks insert anyone" ON public.ck_outbound_clicks FOR INSERT
  WITH CHECK (true);
CREATE POLICY "ck_clicks admin read" ON public.ck_outbound_clicks FOR SELECT
  USING (public.is_ck_admin(auth.uid()));
CREATE POLICY "ck_clicks admin manage" ON public.ck_outbound_clicks FOR ALL TO authenticated
  USING (public.is_ck_admin(auth.uid())) WITH CHECK (public.is_ck_admin(auth.uid()));
CREATE INDEX ck_clicks_product_idx ON public.ck_outbound_clicks(product_id);

-- Articles (SEO content pages)
CREATE TABLE public.ck_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  body text,
  cover_image_url text,
  related_categories text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ck_articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ck_articles TO authenticated;
GRANT ALL ON public.ck_articles TO service_role;
ALTER TABLE public.ck_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ck_articles public read published" ON public.ck_articles FOR SELECT
  USING (is_published = true OR public.is_ck_admin(auth.uid()));
CREATE POLICY "ck_articles admin write" ON public.ck_articles FOR ALL TO authenticated
  USING (public.is_ck_admin(auth.uid())) WITH CHECK (public.is_ck_admin(auth.uid()));
CREATE TRIGGER ck_articles_updated BEFORE UPDATE ON public.ck_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed categories
INSERT INTO public.ck_categories (name, slug, description, sort_order) VALUES
  ('Medical alert systems','medical-alert','Press-button emergency response.',1),
  ('Fall detection wearables','fall-wearable','Wearables that detect falls automatically.',2),
  ('Smartwatches','smartwatch','Health-aware smartwatches for seniors.',3),
  ('WiFi presence sensing','wifi-presence','Camera-free presence and motion using WiFi signals.',4),
  ('Radar fall detection','radar-fall','Contactless radar-based fall detection.',5),
  ('Smart pill dispensers','pill-dispenser','Automated medication dispensers.',6),
  ('Medication reminder devices','med-reminder','Simple medication reminders and alerts.',7),
  ('GPS location trackers','gps-tracker','Discreet GPS for wandering risk.',8),
  ('Door / exit sensors','door-sensor','Alerts when doors are opened unexpectedly.',9),
  ('Stove shutoff devices','stove-shutoff','Auto stove shutoff for kitchen safety.',10),
  ('Water leak sensors','leak-sensor','Detect leaks before damage.',11),
  ('Smart locks','smart-lock','Keyless entry and caregiver access.',12),
  ('Voice assistants / smart displays','voice-display','Hands-free help and check-ins.',13),
  ('Senior tablets','senior-tablet','Simple tablets designed for older adults.',14),
  ('Companion robots','companion-robot','Social and companionship robots.',15),
  ('Cameras','camera','Video monitoring (use thoughtfully).',16);
