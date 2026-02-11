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
    // Use maybeSingle() — returns null (not error) when no rows exist
    const { data: profile } = await db
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      return NextResponse.json({ data: profile as User });
    }

    // No profile exists — bootstrap user + organization
    console.log('[GET /api/auth/me] No user profile found, bootstrapping...');

    const fullName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split('@')[0] ??
      'User';

    const emailDomain = (user.email ?? 'example.com').split('@')[1] ?? 'example';

    // Step 1: Ensure an organization exists
    let organizationId = '';

    // Check for existing org first
    const { data: existingOrg } = await db
      .from('organizations')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existingOrg?.id) {
      organizationId = existingOrg.id;
      console.log('[GET /api/auth/me] Found existing org:', organizationId);
    } else {
      // Create a default organization with required slug
      const orgSlug = emailDomain.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      const { data: newOrg, error: orgErr } = await db
        .from('organizations')
        .insert({ name: 'My Organization', slug: orgSlug })
        .select('id')
        .single();

      if (orgErr) {
        console.error('[GET /api/auth/me] Failed to create organization:', orgErr.message, orgErr.code, orgErr.details);
        // Try with a unique slug in case of collision
        const fallbackSlug = `org-${Date.now()}`;
        const { data: retryOrg, error: retryErr } = await db
          .from('organizations')
          .insert({ name: 'My Organization', slug: fallbackSlug })
          .select('id')
          .single();
        if (retryErr) {
          console.error('[GET /api/auth/me] Retry org creation also failed:', retryErr.message);
        } else if (retryOrg?.id) {
          organizationId = retryOrg.id;
          console.log('[GET /api/auth/me] Created org with fallback slug:', organizationId);
        }
      } else if (newOrg?.id) {
        organizationId = newOrg.id;
        console.log('[GET /api/auth/me] Created new org:', organizationId);
      }
    }

    if (!organizationId) {
      console.error('[GET /api/auth/me] Could not resolve or create organization — returning partial user');
      // Return a constructed user without DB persistence
      const partialUser: User = {
        id: user.id,
        email: user.email ?? '',
        full_name: fullName,
        role: 'admin',
        organization_id: '',
        avatar_url: user.user_metadata?.avatar_url ?? null,
        created_at: user.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ data: partialUser });
    }

    // Step 2: Create the user profile
    const now = new Date().toISOString();
    const userInsert = {
      id: user.id,
      email: user.email ?? '',
      full_name: fullName,
      role: (user.user_metadata?.role as User['role']) ?? 'admin',
      organization_id: organizationId,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    };

    const { data: inserted, error: insertErr } = await db
      .from('users')
      .insert(userInsert)
      .select()
      .single();

    if (insertErr) {
      console.error('[GET /api/auth/me] Failed to create user profile:', insertErr.message, insertErr.code, insertErr.details);
      // Return a constructed profile even if insert fails
      const fallbackProfile: User = {
        ...userInsert,
        created_at: user.created_at ?? now,
        updated_at: now,
      };
      return NextResponse.json({ data: fallbackProfile });
    }

    console.log('[GET /api/auth/me] Successfully bootstrapped user profile:', inserted.id);
    return NextResponse.json({ data: inserted as User });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
