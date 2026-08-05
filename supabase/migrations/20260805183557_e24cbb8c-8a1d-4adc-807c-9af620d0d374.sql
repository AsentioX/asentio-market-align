ALTER TABLE public.scrm_sponsors DROP CONSTRAINT IF EXISTS scrm_sponsors_owner_id_fkey;
ALTER TABLE public.scrm_sponsors
  ADD CONSTRAINT scrm_sponsors_owner_member_fkey
  FOREIGN KEY (owner_id) REFERENCES public.scrm_user_roles(id) ON DELETE SET NULL;