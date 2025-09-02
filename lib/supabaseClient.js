import { createClient } from '@supabase/supabase-js';

// Default to provided Supabase project if env vars are not set
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://qdrdyhkomfjpyljjwsfv.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcmR5aGtvbWZqcHlsamp3c2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzMxNjIsImV4cCI6MjA3MjI0OTE2Mn0.NmME_bZmwdteE7ObqRSGG69mr9KFgnV9aTI2F5QcGRU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
