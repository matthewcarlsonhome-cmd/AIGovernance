import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// Database type definitions are available in ./database.types.ts for
// type-safe queries. Pass `Database` as a generic parameter when ready
// to adopt per-route typed access:
//   import type { Database } from './database.types';
//   createServerClient<Database>(...)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isServerSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('placeholder') &&
    !SUPABASE_ANON_KEY.includes('placeholder') &&
    SUPABASE_URL.startsWith('https://')
  );
}

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
