ALTER TABLE public.xr_products DROP CONSTRAINT xr_products_category_check;

ALTER TABLE public.xr_products ADD CONSTRAINT xr_products_category_check CHECK (category = ANY (ARRAY[
  'AR Glasses', 'VR Headsets', 'AI Glasses', 'Smart Glasses', 'Spatial Apps',
  'AR Entertainment Glasses', 'Services', 'AI Smartglasses', 'AR Smartglasses',
  'AI/AR Hybrid', 'Full AR', 'Mixed Reality', 'Enterprise AR', 'Standalone AR'
]));