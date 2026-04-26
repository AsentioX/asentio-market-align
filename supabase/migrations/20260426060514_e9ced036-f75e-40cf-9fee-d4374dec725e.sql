
-- ─────────────────────────────────────────────────────────────
-- PerkPath: Personal Advocacy & Benefit Agent
-- Standalone lab schema, prefix: pp_
-- ─────────────────────────────────────────────────────────────

-- Enums
DO $$ BEGIN
  CREATE TYPE public.pp_membership_category AS ENUM ('financial', 'lifestyle');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pp_pillar AS ENUM ('work', 'home', 'play');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pp_perk_category AS ENUM ('auto', 'dining', 'travel', 'shopping', 'health', 'entertainment', 'services', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- pp_users (per-lab profile, mirrors wo-buddy pattern)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.pp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pp_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pp_users self select" ON public.pp_users
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pp_users self insert" ON public.pp_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pp_users self update" ON public.pp_users
  FOR UPDATE USING (auth.uid() = user_id);

-- Helper: is current user a PerkPath admin
CREATE OR REPLACE FUNCTION public.is_perkpath_admin(_user_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pp_users
    WHERE user_id = _user_id AND is_admin = true
  )
$$;

-- ─────────────────────────────────────────────────────────────
-- pp_memberships
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.pp_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,                              -- internal key e.g. 'aaa', 'chase'
  name TEXT NOT NULL,                              -- display name e.g. 'AAA'
  tier TEXT,                                       -- e.g. 'Executive', 'Reserve', 'Platinum'
  category public.pp_membership_category NOT NULL, -- financial | lifestyle
  pillar public.pp_pillar NOT NULL DEFAULT 'home', -- work | home | play
  brand_color TEXT NOT NULL DEFAULT '#1F2937',
  logo TEXT NOT NULL DEFAULT '✨',                 -- emoji or icon key
  perk_tags TEXT[] NOT NULL DEFAULT '{}',          -- stackable tags e.g. {'travel','dining'}
  renewal_date DATE,                               -- next renewal
  reciprocal_benefits BOOLEAN NOT NULL DEFAULT false, -- museum/club style
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);

CREATE INDEX idx_pp_memberships_user ON public.pp_memberships(user_id);
CREATE INDEX idx_pp_memberships_pillar ON public.pp_memberships(pillar);
CREATE INDEX idx_pp_memberships_category ON public.pp_memberships(category);
CREATE INDEX idx_pp_memberships_renewal ON public.pp_memberships(renewal_date) WHERE renewal_date IS NOT NULL;

ALTER TABLE public.pp_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pp_memberships owner all" ON public.pp_memberships
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Helper: does user own this membership
CREATE OR REPLACE FUNCTION public.pp_user_owns_membership(_membership_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pp_memberships
    WHERE id = _membership_id AND user_id = auth.uid()
  )
$$;

-- ─────────────────────────────────────────────────────────────
-- pp_perks (catalog of benefits per membership)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.pp_perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES public.pp_memberships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value_label TEXT NOT NULL,                       -- e.g. "15% Off", "$50 Credit"
  category public.pp_perk_category NOT NULL DEFAULT 'other',
  venue TEXT,                                      -- where to redeem
  how_to_redeem TEXT,
  image_url TEXT,
  perk_tags TEXT[] NOT NULL DEFAULT '{}',          -- stackable tags
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pp_perks_membership ON public.pp_perks(membership_id);
CREATE INDEX idx_pp_perks_user ON public.pp_perks(user_id);
CREATE INDEX idx_pp_perks_category ON public.pp_perks(category);
CREATE INDEX idx_pp_perks_tags ON public.pp_perks USING GIN(perk_tags);

ALTER TABLE public.pp_perks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pp_perks owner all" ON public.pp_perks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- pp_venues (shared catalog of physical locations for proximity)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.pp_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,                                      -- e.g. 'Hertz', 'Denny's'
  address TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  category public.pp_perk_category,
  perk_tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pp_venues_brand ON public.pp_venues(brand);
CREATE INDEX idx_pp_venues_geo ON public.pp_venues(latitude, longitude) WHERE latitude IS NOT NULL;

ALTER TABLE public.pp_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pp_venues read all" ON public.pp_venues
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "pp_venues admin write" ON public.pp_venues
  FOR ALL USING (public.is_perkpath_admin(auth.uid())) WITH CHECK (public.is_perkpath_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- pp_perk_venues (many-to-many: a perk can apply at many venues)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.pp_perk_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perk_id UUID NOT NULL REFERENCES public.pp_perks(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.pp_venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (perk_id, venue_id)
);

CREATE INDEX idx_pp_perk_venues_perk ON public.pp_perk_venues(perk_id);
CREATE INDEX idx_pp_perk_venues_venue ON public.pp_perk_venues(venue_id);

ALTER TABLE public.pp_perk_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pp_perk_venues read own" ON public.pp_perk_venues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pp_perks p
      WHERE p.id = pp_perk_venues.perk_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "pp_perk_venues insert own" ON public.pp_perk_venues
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pp_perks p
      WHERE p.id = pp_perk_venues.perk_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "pp_perk_venues delete own" ON public.pp_perk_venues
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.pp_perks p
      WHERE p.id = pp_perk_venues.perk_id AND p.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- Updated-at triggers
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pp_set_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER pp_users_set_updated_at BEFORE UPDATE ON public.pp_users
  FOR EACH ROW EXECUTE FUNCTION public.pp_set_updated_at();
CREATE TRIGGER pp_memberships_set_updated_at BEFORE UPDATE ON public.pp_memberships
  FOR EACH ROW EXECUTE FUNCTION public.pp_set_updated_at();
CREATE TRIGGER pp_perks_set_updated_at BEFORE UPDATE ON public.pp_perks
  FOR EACH ROW EXECUTE FUNCTION public.pp_set_updated_at();
CREATE TRIGGER pp_venues_set_updated_at BEFORE UPDATE ON public.pp_venues
  FOR EACH ROW EXECUTE FUNCTION public.pp_set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Seed-on-signup: when a pp_users row is inserted, seed demo data
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pp_seed_demo_for_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  m_aaa UUID; m_aarp UUID; m_chase UUID; m_costco UUID; m_amex UUID;
  v_renew DATE := (CURRENT_DATE + INTERVAL '90 days')::date;
BEGIN
  -- AAA (lifestyle / play)
  INSERT INTO public.pp_memberships (user_id, slug, name, tier, category, pillar, brand_color, logo, perk_tags, renewal_date)
  VALUES (NEW.user_id, 'aaa', 'AAA', 'Plus', 'lifestyle', 'play', '#D32F2F', '🛡️',
          ARRAY['auto','travel','dining','roadside'], (CURRENT_DATE + INTERVAL '120 days')::date)
  RETURNING id INTO m_aaa;

  INSERT INTO public.pp_perks (membership_id, user_id, title, value_label, category, venue, how_to_redeem, perk_tags, sort_order) VALUES
  (m_aaa, NEW.user_id, 'Free 200mi Towing', 'Save $350+', 'auto', 'Nationwide', 'Call AAA Roadside at 1-800-222-4357 or use the AAA app to request service.', ARRAY['auto','roadside'], 1),
  (m_aaa, NEW.user_id, '15% Off at Denny''s', '15% Off', 'dining', 'Denny''s', 'Show your AAA membership card to your server before ordering.', ARRAY['dining'], 2),
  (m_aaa, NEW.user_id, 'Up to 35% Off Hertz', '35% Off', 'travel', 'Hertz Rental', 'Book through aaa.com/hertz or use code CDP# 0164800.', ARRAY['travel','car-rental'], 3),
  (m_aaa, NEW.user_id, 'LensCrafters 30% Off', '30% Off', 'health', 'LensCrafters', 'Present AAA card at checkout.', ARRAY['health','eyewear'], 4);

  -- AARP (lifestyle / home)
  INSERT INTO public.pp_memberships (user_id, slug, name, tier, category, pillar, brand_color, logo, perk_tags, renewal_date)
  VALUES (NEW.user_id, 'aarp', 'AARP', 'Member', 'lifestyle', 'home', '#1A237E', '🏛️',
          ARRAY['dining','travel','health','shopping'], (CURRENT_DATE + INTERVAL '300 days')::date)
  RETURNING id INTO m_aarp;

  INSERT INTO public.pp_perks (membership_id, user_id, title, value_label, category, venue, how_to_redeem, perk_tags, sort_order) VALUES
  (m_aarp, NEW.user_id, '15% Off Total Bill', '15% Off', 'dining', 'Denny''s', 'Show your AARP membership card to your server.', ARRAY['dining'], 1),
  (m_aarp, NEW.user_id, '25% Off Wyndham Hotels', '25% Off', 'travel', 'Wyndham Hotels', 'Book at wyndhamhotels.com and enter your AARP member number.', ARRAY['travel','hotels'], 2),
  (m_aarp, NEW.user_id, 'Walgreens Rewards+', '20% Off', 'health', 'Walgreens', 'Link AARP to your Walgreens Balance Rewards.', ARRAY['health','pharmacy'], 3);

  -- Chase Sapphire (financial / play)
  INSERT INTO public.pp_memberships (user_id, slug, name, tier, category, pillar, brand_color, logo, perk_tags, renewal_date)
  VALUES (NEW.user_id, 'chase', 'Chase Sapphire Reserve', 'Reserve', 'financial', 'play', '#1565C0', '💳',
          ARRAY['travel','dining','hotels','points'], (CURRENT_DATE + INTERVAL '365 days')::date)
  RETURNING id INTO m_chase;

  INSERT INTO public.pp_perks (membership_id, user_id, title, value_label, category, venue, how_to_redeem, perk_tags, sort_order) VALUES
  (m_chase, NEW.user_id, 'Priority Pass Lounges', 'Free Access', 'travel', 'Airport Lounges', 'Present your Priority Pass membership at the lounge entrance.', ARRAY['travel','lounges'], 1),
  (m_chase, NEW.user_id, '3x Points on Dining', '3x Points', 'dining', 'All Restaurants', 'Pay with your Chase Sapphire Reserve card.', ARRAY['dining','points'], 2),
  (m_chase, NEW.user_id, '$50 Hotel Credit', '$50 Credit', 'travel', 'Hotels via Chase', 'Book through Chase Ultimate Rewards portal.', ARRAY['travel','hotels'], 3),
  (m_chase, NEW.user_id, 'DoorDash DashPass', 'Free 1yr', 'dining', 'DoorDash', 'Activate through Chase benefits portal.', ARRAY['dining','delivery'], 4);

  -- Costco Executive (financial / home)
  INSERT INTO public.pp_memberships (user_id, slug, name, tier, category, pillar, brand_color, logo, perk_tags, renewal_date)
  VALUES (NEW.user_id, 'costco', 'Costco Executive', 'Executive', 'financial', 'home', '#E53935', '🏪',
          ARRAY['shopping','travel','health','cashback'], (CURRENT_DATE + INTERVAL '200 days')::date)
  RETURNING id INTO m_costco;

  INSERT INTO public.pp_perks (membership_id, user_id, title, value_label, category, venue, how_to_redeem, perk_tags, sort_order) VALUES
  (m_costco, NEW.user_id, '2% Cash Back', '2% Back', 'shopping', 'Costco Warehouse', 'Annual 2% reward (up to $1,250) issued as a certificate.', ARRAY['shopping','cashback'], 1),
  (m_costco, NEW.user_id, 'Costco Optical', '$50–100 Off', 'health', 'Costco Optical', 'Visit the Costco Optical department.', ARRAY['health','eyewear'], 2),
  (m_costco, NEW.user_id, 'Costco Travel Deals', 'Up to 40% Off', 'travel', 'Costco Travel', 'Book at costcotravel.com.', ARRAY['travel'], 3);

  -- Amex Platinum (financial / work)
  INSERT INTO public.pp_memberships (user_id, slug, name, tier, category, pillar, brand_color, logo, perk_tags, renewal_date)
  VALUES (NEW.user_id, 'amex', 'Amex Platinum', 'Platinum', 'financial', 'work', '#37474F', '✨',
          ARRAY['travel','shopping','dining','points'], (CURRENT_DATE + INTERVAL '180 days')::date)
  RETURNING id INTO m_amex;

  INSERT INTO public.pp_perks (membership_id, user_id, title, value_label, category, venue, how_to_redeem, perk_tags, sort_order) VALUES
  (m_amex, NEW.user_id, 'Centurion Lounges', 'Free Access', 'travel', 'Centurion Lounges', 'Present your Amex Platinum card and same-day boarding pass.', ARRAY['travel','lounges'], 1),
  (m_amex, NEW.user_id, 'Saks Fifth Avenue', '$100 Credit', 'shopping', 'Saks Fifth Avenue', 'Enroll via Amex app. $50 Jan–Jun, $50 Jul–Dec.', ARRAY['shopping','luxury'], 2),
  (m_amex, NEW.user_id, '5x on Flights', '5x Points', 'travel', 'Airlines Direct', 'Book flights directly with airlines or amextravel.com.', ARRAY['travel','points','flights'], 3),
  (m_amex, NEW.user_id, 'Uber Cash', '$200/yr', 'auto', 'Uber / Uber Eats', 'Link Platinum card in the Uber app. $15/mo + $20 bonus in Dec.', ARRAY['auto','rideshare'], 4);

  RETURN NEW;
END;
$$;

CREATE TRIGGER pp_users_seed_demo
  AFTER INSERT ON public.pp_users
  FOR EACH ROW EXECUTE FUNCTION public.pp_seed_demo_for_user();

-- ─────────────────────────────────────────────────────────────
-- Seed shared venues (for geolocation)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.pp_venues (name, brand, address, city, region, country, latitude, longitude, category, perk_tags) VALUES
('Denny''s Downtown', 'Denny''s', '123 Main St', 'San Francisco', 'CA', 'US', 37.7849, -122.4094, 'dining', ARRAY['dining']),
('Hertz SFO', 'Hertz', 'San Francisco International Airport', 'San Francisco', 'CA', 'US', 37.6213, -122.3790, 'travel', ARRAY['travel','car-rental']),
('LensCrafters Union Square', 'LensCrafters', '865 Market St', 'San Francisco', 'CA', 'US', 37.7837, -122.4076, 'health', ARRAY['health','eyewear']),
('Walgreens Castro', 'Walgreens', '498 Castro St', 'San Francisco', 'CA', 'US', 37.7609, -122.4350, 'health', ARRAY['health','pharmacy']),
('Costco SoMa', 'Costco', '450 10th St', 'San Francisco', 'CA', 'US', 37.7705, -122.4115, 'shopping', ARRAY['shopping']),
('Wyndham Garden SF', 'Wyndham Hotels', '440 Geary St', 'San Francisco', 'CA', 'US', 37.7873, -122.4117, 'travel', ARRAY['travel','hotels']),
('Saks Fifth Avenue SF', 'Saks Fifth Avenue', '384 Post St', 'San Francisco', 'CA', 'US', 37.7884, -122.4071, 'shopping', ARRAY['shopping','luxury']),
('Centurion Lounge SFO', 'Centurion Lounges', 'SFO Terminal 3', 'San Francisco', 'CA', 'US', 37.6213, -122.3790, 'travel', ARRAY['travel','lounges']);
