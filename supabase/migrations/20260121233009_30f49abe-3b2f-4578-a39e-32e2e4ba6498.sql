-- Create enum for roles
CREATE TYPE public.schedule_role AS ENUM ('hacker', 'sponsor', 'press', 'mentor', 'organizer');

-- Create schedule_items table
CREATE TABLE public.schedule_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  event_date DATE NOT NULL,
  location TEXT,
  description TEXT,
  allowed_roles schedule_role[] NOT NULL DEFAULT '{}',
  icon_name TEXT DEFAULT 'calendar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Schedule items are publicly viewable"
ON public.schedule_items
FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can insert schedule items"
ON public.schedule_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can update schedule items"
ON public.schedule_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can delete schedule items"
ON public.schedule_items
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create trigger for updated_at
CREATE TRIGGER update_schedule_items_updated_at
BEFORE UPDATE ON public.schedule_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();