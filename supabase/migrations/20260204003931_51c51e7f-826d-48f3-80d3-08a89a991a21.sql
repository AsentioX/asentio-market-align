-- Create xr_agencies table
CREATE TABLE public.xr_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  services TEXT[] DEFAULT '{}',
  regions TEXT[] DEFAULT '{}',
  is_editors_pick BOOLEAN DEFAULT false,
  editors_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create xr_use_cases table
CREATE TABLE public.xr_use_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  device TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  agency_id UUID REFERENCES public.xr_agencies(id) ON DELETE SET NULL,
  image_url TEXT,
  client_name TEXT,
  is_editors_pick BOOLEAN DEFAULT false,
  editors_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xr_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xr_use_cases ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "XR Agencies are publicly viewable" ON public.xr_agencies FOR SELECT USING (true);
CREATE POLICY "XR Use Cases are publicly viewable" ON public.xr_use_cases FOR SELECT USING (true);

-- Admin write policies for xr_agencies
CREATE POLICY "Admins can insert XR agencies" ON public.xr_agencies FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can update XR agencies" ON public.xr_agencies FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can delete XR agencies" ON public.xr_agencies FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admin write policies for xr_use_cases
CREATE POLICY "Admins can insert XR use cases" ON public.xr_use_cases FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can update XR use cases" ON public.xr_use_cases FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can delete XR use cases" ON public.xr_use_cases FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_xr_agencies_updated_at
BEFORE UPDATE ON public.xr_agencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_xr_use_cases_updated_at
BEFORE UPDATE ON public.xr_use_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();