ALTER TABLE public.xr_products DROP CONSTRAINT xr_products_shipping_status_check;

ALTER TABLE public.xr_products ADD CONSTRAINT xr_products_shipping_status_check CHECK (shipping_status = ANY (ARRAY[
  'Available', 'Shipping', 'Preorder', 'Concept', 'CES prototype', 'CES preview', 'CES 2026 launch', 'Dev Only', 'Dev Only ($99/mo)', 'Announced', 'Beta', 'Discontinued'
]));