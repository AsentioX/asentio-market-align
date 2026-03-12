-- CRM: contacts table
CREATE TABLE public.crm_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'manual', -- 'contact_form' | 'manual' | 'directory_cta'
  source_context TEXT, -- e.g. product slug or page they were on
  stage TEXT NOT NULL DEFAULT 'new', -- 'new' | 'reached_out' | 'call_booked' | 'proposal_sent' | 'won' | 'lost'
  follow_up_date DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write contacts
CREATE POLICY "Admins can select crm contacts"
  ON public.crm_contacts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can insert crm contacts"
  ON public.crm_contacts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can update crm contacts"
  ON public.crm_contacts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can delete crm contacts"
  ON public.crm_contacts FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Anyone can INSERT via public capture (contact form / directory CTAs)
-- We use a separate RLS policy for anon capture via a service-role edge function approach
-- instead, we allow public insert but validate server-side via edge function.
-- For now, allow public insert so contact forms work without auth:
CREATE POLICY "Public can submit leads"
  ON public.crm_contacts FOR INSERT
  TO anon
  WITH CHECK (source IN ('contact_form', 'directory_cta'));

-- CRM: notes / activity timeline
CREATE TABLE public.crm_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note', -- 'note' | 'email' | 'call' | 'meeting'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage crm notes"
  ON public.crm_notes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Timestamps trigger
CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for pipeline queries
CREATE INDEX idx_crm_contacts_stage ON public.crm_contacts(stage);
CREATE INDEX idx_crm_contacts_created_at ON public.crm_contacts(created_at DESC);
CREATE INDEX idx_crm_notes_contact_id ON public.crm_notes(contact_id);