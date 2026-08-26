/**
 * Frontend Supabase client — ANON key ONLY.
 * ⚠️  NEVER put the service role key here. NEXT_PUBLIC_ vars are in client JS.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.warn('⚠️  Supabase credentials missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(url, key);
