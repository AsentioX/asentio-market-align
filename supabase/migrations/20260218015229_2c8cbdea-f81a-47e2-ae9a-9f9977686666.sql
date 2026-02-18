
CREATE TABLE public.xr_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  hq_location TEXT,
  founded_year INTEGER,
  company_size TEXT,
  sectors TEXT[] DEFAULT '{}'::text[],
  is_editors_pick BOOLEAN DEFAULT false,
  editors_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.xr_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "XR Companies are publicly viewable" ON public.xr_companies FOR SELECT USING (true);
CREATE POLICY "Admins can insert XR companies" ON public.xr_companies FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update XR companies" ON public.xr_companies FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete XR companies" ON public.xr_companies FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE TRIGGER update_xr_companies_updated_at BEFORE UPDATE ON public.xr_companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
