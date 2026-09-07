import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://zlnydbmcahgssfipepui.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbnlkYm1jYWhnc3NmaXBlcHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NjM5NDcsImV4cCI6MjEwNDMzOTk0N30.syntyfbYUmwjvY-XtHGifxnLpzmcmVBxHvvuHe-o_gQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
