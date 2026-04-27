ALTER TABLE public.pp_memberships
  ADD COLUMN IF NOT EXISTS reward_rates jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS base_rate numeric(6,3) NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS points_value_cents numeric(6,3) NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS rewards_currency text NOT NULL DEFAULT 'cashback',
  ADD COLUMN IF NOT EXISTS rewards_seeded_at timestamptz;

ALTER TABLE public.pp_memberships
  DROP CONSTRAINT IF EXISTS pp_memberships_rewards_currency_check;

ALTER TABLE public.pp_memberships
  ADD CONSTRAINT pp_memberships_rewards_currency_check
  CHECK (rewards_currency IN ('cashback', 'points'));