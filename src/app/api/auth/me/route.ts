import { NextResponse } from 'next/server';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, User } from '@/types';

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 */
export async function GET(): Promise<NextResponse<ApiResponse<User>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const demoUser: User = {
        id: 'user-demo-001',
        email: 'admin@example.com',
        full_name: 'Demo Admin',
        role: 'admin',
        organization_id: 'org-demo-001',
        avatar_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };
      return NextResponse.json({ data: demoUser });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get the full user profile from the users table
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      return NextResponse.json({ data: profile as User });
    }

    // Fallback: build a user object from auth metadata
    const fullName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split('@')[0] ??
      'User';

    const fallbackUser: User = {
      id: user.id,
      email: user.email ?? '',
      full_name: fullName,
      role: (user.user_metadata?.role as User['role']) ?? 'admin',
      organization_id: user.user_metadata?.organization_id ?? '',
      avatar_url: user.user_metadata?.avatar_url ?? null,
      created_at: user.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ data: fallbackUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
