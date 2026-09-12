-- ==============================================================================
-- COUNTRY YARDS LANDSCAPING APP - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this SQL in your Supabase Dashboard:
-- 1. Go to your Supabase project: https://supabase.com/dashboard/project/zlnydbmcahgssfipepui
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "+ New Query"
-- 4. Paste this entire file and click "Run" (green button)
-- ==============================================================================

-- 1. Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_name TEXT DEFAULT '',
    client_phone TEXT DEFAULT '',
    location TEXT DEFAULT '',
    quoted_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    status TEXT DEFAULT 'Active', -- 'Active', 'Completed', 'On Hold'
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROJECT EXPENSES TABLE
-- Categories: Soil, Plants, Pots, Fertilizer, Transport, Fuel, Food, Stay, Miscellaneous, Workers Cost, Design
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'Soil', 'Plants', 'Pots', 'Fertilizer', 'Transport', 'Fuel', 'Food', 'Stay', 'Miscellaneous', 'Workers Cost', 'Design'
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT DEFAULT '', -- optional detailed description
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SALARIES TABLE
CREATE TABLE IF NOT EXISTS public.salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    person_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CLIENT PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.client_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    payment_method TEXT DEFAULT 'UPI', -- 'UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Other'
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PROJECT GALLERY PHOTOS TABLE
-- Stages: 'Before Work', 'Work in Progress', 'After Completion'
CREATE TABLE IF NOT EXISTS public.project_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    stage TEXT NOT NULL, -- 'Before Work', 'Work in Progress', 'After Completion'
    image_url TEXT NOT NULL,
    description TEXT DEFAULT '',
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PROJECT DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT 'document',
    file_size NUMERIC(10, 2) DEFAULT 0.00, -- in KB/MB
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_salaries_project_id ON public.salaries(project_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_project_id ON public.client_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_project_id ON public.project_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.project_documents(project_id);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling public read/write access for the mobile app using the anon key
-- ==============================================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon role
DROP POLICY IF EXISTS "Allow anon all on projects" ON public.projects;
CREATE POLICY "Allow anon all on projects" ON public.projects FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on expenses" ON public.expenses;
CREATE POLICY "Allow anon all on expenses" ON public.expenses FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on salaries" ON public.salaries;
CREATE POLICY "Allow anon all on salaries" ON public.salaries FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on client_payments" ON public.client_payments;
CREATE POLICY "Allow anon all on client_payments" ON public.client_payments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on project_photos" ON public.project_photos;
CREATE POLICY "Allow anon all on project_photos" ON public.project_photos FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on project_documents" ON public.project_documents;
CREATE POLICY "Allow anon all on project_documents" ON public.project_documents FOR ALL TO anon USING (true) WITH CHECK (true);

-- ==============================================================================
-- 10. STORAGE BUCKET CREATION (FOR PHOTOS & DOCUMENTS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public uploads & downloads in project-media bucket
DROP POLICY IF EXISTS "Public Access project-media" ON storage.objects;
CREATE POLICY "Public Access project-media" ON storage.objects FOR ALL TO anon 
USING (bucket_id = 'project-media') 
WITH CHECK (bucket_id = 'project-media');

-- ==============================================================================
-- 11. CLIENT SITE ASSESSMENT & MEASUREMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.site_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_phone TEXT DEFAULT '',
  location TEXT DEFAULT '',
  visit_date TEXT NOT NULL,
  interest_description TEXT DEFAULT '',
  soil_test_done BOOLEAN DEFAULT FALSE,
  soil_test_notes TEXT DEFAULT '',
  water_test_done BOOLEAN DEFAULT FALSE,
  water_test_notes TEXT DEFAULT '',
  sunlight_check_done BOOLEAN DEFAULT FALSE,
  sunlight_check_notes TEXT DEFAULT '',
  total_sqft NUMERIC(12,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.assessment_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.site_assessments(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  length_ft NUMERIC(10,2) DEFAULT 0,
  width_ft NUMERIC(10,2) DEFAULT 0,
  area_sqft NUMERIC(12,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on site_assessments" ON public.site_assessments;
CREATE POLICY "Allow anon all on site_assessments" ON public.site_assessments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on assessment_measurements" ON public.assessment_measurements;
CREATE POLICY "Allow anon all on assessment_measurements" ON public.assessment_measurements FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_site_assessments_date ON public.site_assessments(visit_date);
CREATE INDEX IF NOT EXISTS idx_assessment_measurements_assessment ON public.assessment_measurements(assessment_id);

-- ==============================================================================
-- 12. INSPECTION & MAINTENANCE SCHEDULES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  location TEXT DEFAULT '',
  title TEXT NOT NULL,
  type TEXT DEFAULT 'Maintenance' CHECK (type IN ('Maintenance', 'Inspection', 'Follow-up')),
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT DEFAULT '',
  assigned_to TEXT DEFAULT '',
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Overdue', 'Cancelled')),
  recurrence TEXT DEFAULT 'Once' CHECK (recurrence IN ('Once', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly')),
  notes TEXT DEFAULT '',
  completion_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on maintenance_schedules" ON public.maintenance_schedules;
CREATE POLICY "Allow anon all on maintenance_schedules" ON public.maintenance_schedules FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_maintenance_date ON public.maintenance_schedules(scheduled_date ASC);
CREATE INDEX IF NOT EXISTS idx_maintenance_project ON public.maintenance_schedules(project_id);

-- ==============================================================================
-- 13. PLANT & MATERIAL PROCUREMENT TABLE (SIMPLIFIED)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.procurement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    is_done BOOLEAN DEFAULT FALSE,
    priority_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.procurement_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on procurement_items" ON public.procurement_items;
CREATE POLICY "Allow anon all on procurement_items" 
ON public.procurement_items 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_procurement_order ON public.procurement_items(priority_order ASC);
CREATE INDEX IF NOT EXISTS idx_procurement_done ON public.procurement_items(is_done);

-- ==============================================================================
-- 14. VENDOR DIRECTORY / SUPPLIERS TABLE
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

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on vendors" ON public.vendors;
CREATE POLICY "Allow anon all on vendors" 
ON public.vendors 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(vendor_name);
CREATE INDEX IF NOT EXISTS idx_vendors_created ON public.vendors(created_at DESC);


