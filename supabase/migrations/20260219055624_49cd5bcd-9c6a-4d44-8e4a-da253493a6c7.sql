
-- Platform & Software
ALTER TABLE public.xr_products
  ADD COLUMN operating_system text NULL,
  ADD COLUMN standalone_or_tethered text NULL,
  ADD COLUMN sdk_availability text NULL,
  ADD COLUMN developer_docs_url text NULL,
  ADD COLUMN openxr_compatible boolean NULL,
  ADD COLUMN app_store_availability text NULL,
  ADD COLUMN sideloading_allowed boolean NULL;

-- Display & Optics
ALTER TABLE public.xr_products
  ADD COLUMN optics_type text NULL,
  ADD COLUMN field_of_view text NULL,
  ADD COLUMN resolution_per_eye text NULL,
  ADD COLUMN refresh_rate text NULL,
  ADD COLUMN brightness_nits text NULL;

-- Sensors & Tracking
ALTER TABLE public.xr_products
  ADD COLUMN tracking_type text NULL,
  ADD COLUMN slam_support boolean NULL,
  ADD COLUMN hand_tracking boolean NULL,
  ADD COLUMN eye_tracking boolean NULL,
  ADD COLUMN camera_access_for_devs boolean NULL;

-- AI & Compute
ALTER TABLE public.xr_products
  ADD COLUMN soc_processor text NULL,
  ADD COLUMN ram text NULL,
  ADD COLUMN on_device_ai boolean NULL,
  ADD COLUMN voice_assistant text NULL,
  ADD COLUMN cloud_dependency text NULL;

-- Hardware & Connectivity
ALTER TABLE public.xr_products
  ADD COLUMN battery_life text NULL,
  ADD COLUMN weight text NULL,
  ADD COLUMN wifi_bluetooth_version text NULL,
  ADD COLUMN cellular_5g boolean NULL;
