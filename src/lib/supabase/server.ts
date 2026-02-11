import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
// Database type definitions are available in ./database.types.ts for
// type-safe queries. Pass `Database` as a generic parameter when ready
// to adopt per-route typed access:
//   import type { Database } from './database.types';
//   createServerClient<Database>(...)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isServerSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('placeholder') &&
    !SUPABASE_ANON_KEY.includes('placeholder') &&
    SUPABASE_URL.startsWith('https://')
  );
}

/**
 * Check if the service role key is available.
 * The service role key bypasses RLS and should only be used server-side.
 */
export function isServiceRoleConfigured(): boolean {
  return Boolean(
    SUPABASE_SERVICE_ROLE_KEY &&
    !SUPABASE_SERVICE_ROLE_KEY.includes('placeholder') &&
    !SUPABASE_SERVICE_ROLE_KEY.includes('your-')
  );
}

/**
 * Cookie-based Supabase client for authentication checks.
 * Uses the anon key and user's session cookies.
 */
export async function createServerSupabaseClient() {
  if (!isServerSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component - ignore
        }
      },
    },
  });
}

/**
 * Service role Supabase client that bypasses RLS.
 * Use this for server-side data queries in API routes where
 * the user has already been authenticated via createServerSupabaseClient().
 *
 * Falls back to the cookie-based client if the service role key
 * is not configured (queries may fail if RLS policies are restrictive).
 */
export async function createServiceRoleClient() {
  if (!isServerSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }

  // Use service role key if available — bypasses RLS entirely
  if (isServiceRoleConfigured()) {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Fallback: use cookie-based client (may hit RLS issues)
  console.warn(
    '[Supabase] SUPABASE_SERVICE_ROLE_KEY not configured. ' +
    'Using anon key — RLS policies may block queries. ' +
    'Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.'
  );
  return createServerSupabaseClient();
}
