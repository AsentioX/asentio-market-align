CREATE TABLE public.asentio_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  revenue NUMERIC NOT NULL DEFAULT 0,
  margin NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Healthy',
  tenure TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.asentio_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view asentio clients"
ON public.asentio_clients FOR SELECT USING (true);

CREATE POLICY "Public can insert asentio clients"
ON public.asentio_clients FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update asentio clients"
ON public.asentio_clients FOR UPDATE USING (true);

CREATE POLICY "Public can delete asentio clients"
ON public.asentio_clients FOR DELETE USING (true);

CREATE TRIGGER update_asentio_clients_updated_at
BEFORE UPDATE ON public.asentio_clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.asentio_clients (name, revenue, margin, status, tenure) VALUES
  ('Northwind XR', 412000, 0.34, 'Healthy', '2.1y'),
  ('Helix Capital', 318000, 0.41, 'Healthy', '1.4y'),
  ('Atlas Robotics', 264000, 0.28, 'Healthy', '3.0y'),
  ('Meridian Labs', 198000, 0.22, 'At Risk', '0.8y'),
  ('Verge Studios', 162000, 0.18, 'At Risk', '1.1y'),
  ('Cobalt Health', 98000, 0.31, 'Healthy', '0.4y'),
  ('Rivet AI', 42000, 0.12, 'Inactive', '2.3y');