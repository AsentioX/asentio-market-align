CREATE TABLE public.tdz_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  job_title text,
  avatar_url text,
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  source text NOT NULL DEFAULT 'manual',
  account_slot text,
  google_resource_id text,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tdz_contacts_user_email_idx ON public.tdz_contacts (user_id, lower(email)) WHERE email IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tdz_contacts TO authenticated;
GRANT ALL ON public.tdz_contacts TO service_role;
ALTER TABLE public.tdz_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own contacts" ON public.tdz_contacts
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER tdz_contacts_touch BEFORE UPDATE ON public.tdz_contacts
FOR EACH ROW EXECUTE FUNCTION public.tdz_touch_updated_at();

ALTER TABLE public.tdz_stakeholders ADD COLUMN contact_id uuid REFERENCES public.tdz_contacts(id) ON DELETE SET NULL;