
ALTER TYPE public.gov_policy_status ADD VALUE IF NOT EXISTS 'commenting';
ALTER TYPE public.gov_policy_status ADD VALUE IF NOT EXISTS 'voting';
ALTER TYPE public.gov_policy_status ADD VALUE IF NOT EXISTS 'passed';
ALTER TYPE public.gov_policy_status ADD VALUE IF NOT EXISTS 'archived';
