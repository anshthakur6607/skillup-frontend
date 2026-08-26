/**
 * Frontend Supabase client — ANON key ONLY.
 * ⚠️  NEVER put the service role key here. NEXT_PUBLIC_ vars are in client JS.
 *
 * Lazy-initialized to avoid crashing during SSR/prerendering when env vars
 * are not yet available. The client is created on first access (in the browser).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

/**
 * Returns the Supabase client, creating it on first call.
 * Returns null during SSR/prerendering when env vars aren't set.
 */
function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    // During build/SSR, env vars may not be available.
    // Return a dummy client that will fail gracefully on any call.
    // In the browser, this should never happen if .env.local is set.
    if (typeof window === 'undefined') {
      // SSR — return a proxy that throws helpful errors
      return new Proxy({} as SupabaseClient, {
        get(_target, prop) {
          if (prop === 'auth') {
            return {
              getSession: async () => ({ data: { session: null }, error: null }),
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
              getUser: async () => ({ data: { user: null }, error: null }),
            };
          }
          if (prop === 'from') {
            return () => ({
              select: () => ({
                eq: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured during SSR' } }) }),
                limit: () => ({ data: [], error: null }),
                data: [],
                error: null,
              }),
              update: () => ({
                eq: () => ({
                  select: () => ({
                    single: async () => ({ data: null, error: null }),
                  }),
                }),
              }),
            });
          }
          return () => {};
        },
      }) as SupabaseClient;
    }
    console.warn('⚠️  Supabase credentials missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// Export as a getter so it's lazily initialized on first access
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabase(), prop, receiver);
  },
});
