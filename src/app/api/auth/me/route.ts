import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
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

    // Auth check with cookie-based client
    const authClient = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client for data operations (bypasses RLS)
    const db = await createServiceRoleClient();

    // Try to get the full user profile from the users table
    const { data: profile, error: profileErr } = await db
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      return NextResponse.json({ data: profile as User });
    }

    if (profileErr) {
      console.error('[GET /api/auth/me] Profile lookup:', profileErr.message);
    }

    // No profile exists — build one from auth metadata and try to insert it
    const fullName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split('@')[0] ??
      'User';

    // Try to find an existing organization, or create one
    let organizationId = user.user_metadata?.organization_id ?? '';
    if (!organizationId) {
      const { data: existingOrg } = await db
        .from('organizations')
        .select('id')
        .limit(1)
        .single();

      if (existingOrg?.id) {
        organizationId = existingOrg.id;
      } else {
        // Create a default organization for the user
        const { data: newOrg } = await db
          .from('organizations')
          .insert({ name: 'My Organization' })
          .select('id')
          .single();
        if (newOrg?.id) {
          organizationId = newOrg.id;
        }
      }
    }

    const now = new Date().toISOString();
    const newProfile: User = {
      id: user.id,
      email: user.email ?? '',
      full_name: fullName,
      role: (user.user_metadata?.role as User['role']) ?? 'admin',
      organization_id: organizationId,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      created_at: user.created_at ?? now,
      updated_at: now,
    };

    // Attempt to insert the profile into the users table
    const { data: inserted, error: insertErr } = await db
      .from('users')
      .insert(newProfile)
      .select()
      .single();

    if (insertErr) {
      console.error('[GET /api/auth/me] Failed to create user profile:', insertErr.message);
      // Still return the constructed profile even if insert fails
      return NextResponse.json({ data: newProfile });
    }

    return NextResponse.json({ data: (inserted as User) ?? newProfile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
