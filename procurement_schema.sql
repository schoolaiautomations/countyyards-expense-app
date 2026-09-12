-- ==============================================================================
-- COUNTRY YARDS: PLANT & MATERIAL PROCUREMENT TABLE (SIMPLIFIED)
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zlnydbmcahgssfipepui/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.procurement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    is_done BOOLEAN DEFAULT FALSE,
    priority_order INTEGER DEFAULT 1,
    location_link TEXT DEFAULT '',
    nursery_name TEXT DEFAULT '',
    latitude NUMERIC(10, 7) DEFAULT NULL,
    longitude NUMERIC(10, 7) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.procurement_items ENABLE ROW LEVEL SECURITY;

-- Anonymous Access Policy for Mobile App
DROP POLICY IF EXISTS "Allow anon all on procurement_items" ON public.procurement_items;
CREATE POLICY "Allow anon all on procurement_items" 
ON public.procurement_items 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_procurement_order ON public.procurement_items(priority_order ASC);
CREATE INDEX IF NOT EXISTS idx_procurement_done ON public.procurement_items(is_done);
