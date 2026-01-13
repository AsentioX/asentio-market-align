-- Create XR Products Directory Table
CREATE TABLE public.xr_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('AR Glasses', 'VR Headsets', 'AI Glasses', 'Smart Glasses', 'Spatial Apps', 'AR Entertainment Glasses', 'Services')),
  ai_integration TEXT NOT NULL CHECK (ai_integration IN ('Yes', 'No', 'Partial')),
  price_range TEXT,
  shipping_status TEXT NOT NULL CHECK (shipping_status IN ('Available', 'Shipping', 'Preorder', 'Concept', 'CES prototype', 'CES preview', 'CES 2026 launch')),
  region TEXT NOT NULL,
  description TEXT,
  key_features TEXT[],
  link TEXT,
  image_url TEXT,
  is_editors_pick BOOLEAN DEFAULT false,
  editors_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Profiles Table for Admin Users
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.xr_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- XR Products: Anyone can read (public directory)
CREATE POLICY "XR Products are publicly viewable" 
ON public.xr_products 
FOR SELECT 
USING (true);

-- XR Products: Only admins can insert
CREATE POLICY "Admins can insert XR products" 
ON public.xr_products 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- XR Products: Only admins can update
CREATE POLICY "Admins can update XR products" 
ON public.xr_products 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- XR Products: Only admins can delete
CREATE POLICY "Admins can delete XR products" 
ON public.xr_products 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Profiles: Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Profiles: Auto-create profile on signup
CREATE POLICY "Enable insert for authenticated users" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_xr_products_updated_at
  BEFORE UPDATE ON public.xr_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_xr_products_category ON public.xr_products(category);
CREATE INDEX idx_xr_products_ai_integration ON public.xr_products(ai_integration);
CREATE INDEX idx_xr_products_shipping_status ON public.xr_products(shipping_status);
CREATE INDEX idx_xr_products_slug ON public.xr_products(slug);
CREATE INDEX idx_xr_products_editors_pick ON public.xr_products(is_editors_pick);
CREATE INDEX idx_profiles_role ON public.profiles(role);