
-- Source kinds: program homepage, search query, or RSS feed
CREATE TYPE public.pp_source_kind AS ENUM ('program_site', 'search_query', 'rss_feed');
CREATE TYPE public.pp_offer_status AS ENUM ('new', 'applied', 'skipped', 'duplicate');

-- Curated sources to scrape
CREATE TABLE public.pp_offer_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_slug TEXT NOT NULL,
  kind public.pp_source_kind NOT NULL,
  url TEXT,
  query TEXT,
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pp_offer_sources_slug ON public.pp_offer_sources(membership_slug);
CREATE INDEX idx_pp_offer_sources_active ON public.pp_offer_sources(is_active);

ALTER TABLE public.pp_offer_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read sources"
  ON public.pp_offer_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage sources"
  ON public.pp_offer_sources FOR ALL TO authenticated
  USING (public.is_perkpath_admin(auth.uid()))
  WITH CHECK (public.is_perkpath_admin(auth.uid()));

-- Discovered offers (audit log + dedupe key)
CREATE TABLE public.pp_scraped_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.pp_offer_sources(id) ON DELETE SET NULL,
  membership_id UUID REFERENCES public.pp_memberships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  membership_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  value_label TEXT NOT NULL DEFAULT 'See offer',
  category TEXT NOT NULL DEFAULT 'other',
  venue TEXT,
  how_to_redeem TEXT,
  source_url TEXT,
  perk_tags TEXT[] NOT NULL DEFAULT '{}',
  fingerprint TEXT NOT NULL,
  status public.pp_offer_status NOT NULL DEFAULT 'new',
  perk_id UUID REFERENCES public.pp_perks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dedupe per user+membership+offer fingerprint
CREATE UNIQUE INDEX uq_pp_scraped_offers_fingerprint
  ON public.pp_scraped_offers(user_id, membership_id, fingerprint);
CREATE INDEX idx_pp_scraped_offers_user ON public.pp_scraped_offers(user_id);
CREATE INDEX idx_pp_scraped_offers_status ON public.pp_scraped_offers(status);

ALTER TABLE public.pp_scraped_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own scraped offers"
  ON public.pp_scraped_offers FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_perkpath_admin(auth.uid()));
CREATE POLICY "Admins manage scraped offers"
  ON public.pp_scraped_offers FOR ALL TO authenticated
  USING (public.is_perkpath_admin(auth.uid()))
  WITH CHECK (public.is_perkpath_admin(auth.uid()));

-- Run history
CREATE TABLE public.pp_scrape_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by TEXT NOT NULL DEFAULT 'cron',
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'running',
  sources_total INT NOT NULL DEFAULT 0,
  sources_succeeded INT NOT NULL DEFAULT 0,
  sources_failed INT NOT NULL DEFAULT 0,
  offers_found INT NOT NULL DEFAULT 0,
  perks_created INT NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX idx_pp_scrape_runs_started ON public.pp_scrape_runs(started_at DESC);

ALTER TABLE public.pp_scrape_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read run history"
  ON public.pp_scrape_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage run history"
  ON public.pp_scrape_runs FOR ALL TO authenticated
  USING (public.is_perkpath_admin(auth.uid()))
  WITH CHECK (public.is_perkpath_admin(auth.uid()));

-- updated_at trigger
CREATE TRIGGER pp_offer_sources_updated_at
  BEFORE UPDATE ON public.pp_offer_sources
  FOR EACH ROW EXECUTE FUNCTION public.pp_set_updated_at();

-- Seed default sources
INSERT INTO public.pp_offer_sources (membership_slug, kind, url, query, label) VALUES
  ('aaa',     'program_site', 'https://www.aaa.com/discounts',                                    NULL, 'AAA Discounts'),
  ('aaa',     'search_query', NULL, 'AAA member discounts 2025 site:aaa.com OR site:hertz.com',         'AAA web search'),
  ('aarp',    'program_site', 'https://www.aarp.org/benefits-discounts/all/',                     NULL, 'AARP Benefits'),
  ('aarp',    'rss_feed',     'https://www.aarp.org/aarp/feeds/benefits-discounts/',              NULL, 'AARP Benefits RSS'),
  ('chase',   'program_site', 'https://www.chase.com/personal/credit-cards/sapphire-reserve',     NULL, 'Chase Sapphire Reserve benefits'),
  ('chase',   'search_query', NULL, 'Chase Sapphire Reserve new benefits 2025',                          'Chase web search'),
  ('costco',  'program_site', 'https://www.costcotravel.com/h=14242',                             NULL, 'Costco Travel deals'),
  ('costco',  'search_query', NULL, 'Costco member only deals 2025',                                     'Costco web search'),
  ('amex',    'program_site', 'https://www.americanexpress.com/us/credit-cards/card/platinum/',   NULL, 'Amex Platinum benefits'),
  ('amex',    'search_query', NULL, 'Amex Platinum offers 2025 new benefit',                             'Amex web search'),
  ('marriott','search_query', NULL, 'Marriott Bonvoy member offers 2025',                                'Marriott web search'),
  ('hilton',  'search_query', NULL, 'Hilton Honors member offers 2025',                                  'Hilton web search'),
  ('delta',   'search_query', NULL, 'Delta SkyMiles member offers 2025',                                 'Delta web search'),
  ('united',  'search_query', NULL, 'United MileagePlus member offers 2025',                             'United web search'),
  ('southwest','search_query', NULL, 'Southwest Rapid Rewards member offers 2025',                       'Southwest web search');
