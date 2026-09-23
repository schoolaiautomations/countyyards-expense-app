-- ==============================================================================
-- COUNTRY YARDS: COMPANY GENERAL TRANSACTIONS (MAINTENANCE & OUTSIDE FUNDS)
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zlnydbmcahgssfipepui/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.company_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'Cash',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1. Enable Row Level Security (RLS)
ALTER TABLE public.company_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Anonymous Access Policy for Mobile App
DROP POLICY IF EXISTS "Allow anon all on company_transactions" ON public.company_transactions;
CREATE POLICY "Allow anon all on company_transactions" 
ON public.company_transactions 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- 3. Indexes for Fast Filtering and Sorting
CREATE INDEX IF NOT EXISTS idx_company_transactions_date ON public.company_transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_company_transactions_type ON public.company_transactions(type);
CREATE INDEX IF NOT EXISTS idx_company_transactions_category ON public.company_transactions(category);
