-- ==============================================================================
-- COUNTRY YARDS - CLIENT SITE ASSESSMENT & MEASUREMENTS TABLES
-- ==============================================================================

-- 1. site_assessments table
CREATE TABLE IF NOT EXISTS public.site_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_phone TEXT DEFAULT '',
  location TEXT DEFAULT '',
  visit_date TEXT NOT NULL,
  interest_description TEXT DEFAULT '',
  
  -- Site Checklist (Soil, Water, Sunlight)
  soil_test_done BOOLEAN DEFAULT FALSE,
  soil_test_notes TEXT DEFAULT '',
  water_test_done BOOLEAN DEFAULT FALSE,
  water_test_notes TEXT DEFAULT '',
  sunlight_check_done BOOLEAN DEFAULT FALSE,
  sunlight_check_notes TEXT DEFAULT '',
  
  -- Total coverage & status
  total_sqft NUMERIC(12,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. assessment_measurements table (Individual zones with lengths & areas)
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

-- 3. Enable RLS
ALTER TABLE public.site_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_measurements ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for anon role
DROP POLICY IF EXISTS "Allow anon all on site_assessments" ON public.site_assessments;
CREATE POLICY "Allow anon all on site_assessments" ON public.site_assessments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on assessment_measurements" ON public.assessment_measurements;
CREATE POLICY "Allow anon all on assessment_measurements" ON public.assessment_measurements FOR ALL TO anon USING (true) WITH CHECK (true);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_site_assessments_date ON public.site_assessments(visit_date);
CREATE INDEX IF NOT EXISTS idx_assessment_measurements_assessment ON public.assessment_measurements(assessment_id);
