import { NextResponse } from 'next/server';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

/**
 * POST /api/auth/sign-out
 * Sign out the current user by clearing the Supabase session.
 */
export async function POST(): Promise<NextResponse> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ message: 'Signed out (demo mode)' });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: 'Sign out failed', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: 'Signed out successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
