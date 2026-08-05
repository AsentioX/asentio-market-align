ALTER TABLE public.scrm_user_roles
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;