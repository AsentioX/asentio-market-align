
ALTER TABLE public.xr_products
  ADD COLUMN open_ecosystem_score smallint NULL,
  ADD COLUMN ai_access_score smallint NULL,
  ADD COLUMN spatial_capability_score smallint NULL,
  ADD COLUMN monetization_score smallint NULL,
  ADD COLUMN platform_viability_score smallint NULL,
  ADD COLUMN developer_resources_url text NULL;
