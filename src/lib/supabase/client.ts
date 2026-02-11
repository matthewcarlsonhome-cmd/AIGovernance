import { createBrowserClient } from '@supabase/ssr';
// Database type definitions are available in ./database.types.ts for
// type-safe queries. Pass `Database` as a generic parameter when ready
// to adopt per-route typed access:
//   import type { Database } from './database.types';
//   createBrowserClient<Database>(...)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('placeholder') &&
    !SUPABASE_ANON_KEY.includes('placeholder') &&
    SUPABASE_URL.startsWith('https://')
  );
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. See SETUP_MANUAL.md for instructions.'
    );
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
