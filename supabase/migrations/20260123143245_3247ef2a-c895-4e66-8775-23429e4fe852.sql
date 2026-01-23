-- Add sponsor column to schedule_items table
ALTER TABLE public.schedule_items 
ADD COLUMN sponsor text;