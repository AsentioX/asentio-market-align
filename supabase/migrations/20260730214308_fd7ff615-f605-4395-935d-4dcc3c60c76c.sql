ALTER TABLE public.xr_products
  ADD COLUMN IF NOT EXISTS price_type TEXT NOT NULL DEFAULT 'one-time',
  ADD COLUMN IF NOT EXISTS billing_period TEXT;

ALTER TABLE public.xr_products
  ADD CONSTRAINT xr_products_price_type_check CHECK (price_type IN ('one-time','subscription'));

ALTER TABLE public.xr_products
  ADD CONSTRAINT xr_products_billing_period_check CHECK (billing_period IS NULL OR billing_period IN ('month','year'));