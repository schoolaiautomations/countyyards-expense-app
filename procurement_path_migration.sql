-- ==============================================================================
-- COUNTRY YARDS: PROCUREMENT PATH & LOCATION COLUMNS MIGRATION
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zlnydbmcahgssfipepui/sql
-- ==============================================================================

-- Add location, nursery, and GPS coordinate columns to procurement_items
ALTER TABLE public.procurement_items 
ADD COLUMN IF NOT EXISTS location_link TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS nursery_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7) DEFAULT NULL;

-- Index for nursery lookups
CREATE INDEX IF NOT EXISTS idx_procurement_nursery ON public.procurement_items(nursery_name);
