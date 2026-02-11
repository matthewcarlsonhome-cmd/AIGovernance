import { NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  isServerSupabaseConfigured,
  isServiceRoleConfigured,
} from '@/lib/supabase/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  supabase_configured: boolean;
  service_role_configured: boolean;
  database_connected: boolean;
  auth_working: boolean;
  user_profile_exists: boolean;
  organization_exists: boolean;
  tables_accessible: Record<string, boolean>;
  errors: string[];
  user_email?: string;
  user_id?: string;
  organization_id?: string;
}

/**
 * GET /api/health
 * Check database connectivity, auth status, and table accessibility.
 * Returns a detailed status object for debugging.
 */
export async function GET(): Promise<NextResponse> {
  const health: HealthStatus = {
    status: 'healthy',
    supabase_configured: isServerSupabaseConfigured(),
    service_role_configured: isServiceRoleConfigured(),
    database_connected: false,
    auth_working: false,
    user_profile_exists: false,
    organization_exists: false,
    tables_accessible: {},
    errors: [],
  };

  if (!health.supabase_configured) {
    health.status = 'error';
    health.errors.push('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    return NextResponse.json({ data: health });
  }

  // 1. Check auth
  try {
    const authClient = await createServerSupabaseClient();
    const { data: { user }, error: authErr } = await authClient.auth.getUser();
    if (authErr) {
      health.errors.push(`Auth error: ${authErr.message}`);
    } else if (user) {
      health.auth_working = true;
      health.user_email = user.email;
      health.user_id = user.id;
    } else {
      health.errors.push('No authenticated user found');
    }
  } catch (err) {
    health.errors.push(`Auth check failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 2. Check database connectivity using service role client
  try {
    const db = await createServiceRoleClient();

    // Test basic connectivity
    const { error: pingErr } = await db.from('projects').select('id').limit(1);
    if (pingErr) {
      health.errors.push(`DB projects query: ${pingErr.message}`);
    } else {
      health.database_connected = true;
    }

    // 3. Check each table
    const tables = ['organizations', 'users', 'projects', 'assessment_templates', 'policies', 'sandbox_configs'];
    for (const table of tables) {
      const { error: tableErr } = await db.from(table).select('id').limit(1);
      health.tables_accessible[table] = !tableErr;
      if (tableErr) {
        health.errors.push(`Table "${table}": ${tableErr.message}`);
      }
    }

    // 4. Check user profile exists
    if (health.user_id) {
      const { data: profile } = await db
        .from('users')
        .select('id, organization_id')
        .eq('id', health.user_id)
        .maybeSingle();

      if (profile) {
        health.user_profile_exists = true;
        health.organization_id = profile.organization_id;
      } else {
        health.errors.push('No user profile row in the "users" table for the authenticated user. Reload the page to trigger auto-creation.');
      }
    }

    // 5. Check organization exists
    if (health.organization_id) {
      const { data: org } = await db
        .from('organizations')
        .select('id')
        .eq('id', health.organization_id)
        .maybeSingle();
      health.organization_exists = !!org;
      if (!org) {
        health.errors.push('User references an organization that does not exist');
      }
    } else {
      const { data: anyOrg } = await db
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle();
      health.organization_exists = !!anyOrg;
      if (!anyOrg) {
        health.errors.push('No organizations exist in the database. Reload the page to trigger auto-creation.');
      }
    }
  } catch (err) {
    health.database_connected = false;
    health.errors.push(`DB connection failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Determine overall status
  if (!health.database_connected || !health.auth_working) {
    health.status = 'error';
  } else if (!health.user_profile_exists || !health.organization_exists || health.errors.length > 0) {
    health.status = 'degraded';
  }

  if (!health.service_role_configured) {
    health.errors.push(
      'SUPABASE_SERVICE_ROLE_KEY not configured. Add it to .env.local to bypass RLS policies.'
    );
    if (health.status === 'healthy') {
      health.status = 'degraded';
    }
  }

  return NextResponse.json({ data: health });
}
