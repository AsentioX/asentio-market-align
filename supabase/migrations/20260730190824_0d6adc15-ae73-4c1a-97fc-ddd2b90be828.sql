ALTER TABLE public.xr_agencies ADD COLUMN IF NOT EXISTS cover_url text;
COMMENT ON COLUMN public.xr_agencies.cover_url IS 'Optional banner/cover image URL shown on the agency card and detail page.';