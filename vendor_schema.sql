-- ==============================================================================
-- COUNTRY YARDS: VENDOR DIRECTORY / SUPPLIERS TABLE
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zlnydbmcahgssfipepui/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_name TEXT NOT NULL,
    plant_names TEXT NOT NULL,
    contact_number TEXT DEFAULT '',
    location_link TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Anonymous Access Policy for Mobile App
DROP POLICY IF EXISTS "Allow anon all on vendors" ON public.vendors;
CREATE POLICY "Allow anon all on vendors" 
ON public.vendors 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Indexes for Fast Search
CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(vendor_name);
CREATE INDEX IF NOT EXISTS idx_vendors_created ON public.vendors(created_at DESC);
