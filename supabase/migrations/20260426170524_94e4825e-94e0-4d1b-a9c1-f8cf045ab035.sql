-- Stop auto-seeding demo data for new PerkPath users
DROP TRIGGER IF EXISTS pp_users_seed_demo ON public.pp_users;
DROP FUNCTION IF EXISTS public.pp_seed_demo_for_user();

-- Remove existing seeded demo memberships (cascade clears their perks)
DELETE FROM public.pp_perks
  WHERE membership_id IN (
    SELECT id FROM public.pp_memberships WHERE slug IN ('aaa','aarp','chase','costco','amex')
  );
DELETE FROM public.pp_memberships WHERE slug IN ('aaa','aarp','chase','costco','amex');

-- Remove demo venues (these were seeded fixtures, not user data)
DELETE FROM public.pp_venues;