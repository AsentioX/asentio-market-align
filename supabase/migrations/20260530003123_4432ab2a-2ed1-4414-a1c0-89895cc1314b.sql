DROP POLICY IF EXISTS "Owners can update their gallery items" ON public.beaver_boat_gallery;

CREATE POLICY "Authenticated users can update gallery items"
ON public.beaver_boat_gallery
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);