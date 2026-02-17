import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { runSecurityControlChecks } from '@/lib/security';
import type { ApiResponse, SecurityControlStatus } from '@/types';

// ---------------------------------------------------------------------------
// GET /api/security/controls/status?project_id=<uuid>
// Get security control status for a project
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<SecurityControlStatus>>> {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'project_id query parameter is required' },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // Demo mode - run checks against a representative demo config
    // -----------------------------------------------------------------------

    if (!isServerSupabaseConfigured()) {
      const demoConfig = {
        project_id: projectId,
        sandbox_config: {
          cloud_provider: 'aws',
          settings: { region: 'us-east-1', instance_type: 't3.large' },
        },
        has_mfa: true,
        has_sso: false,
        secrets_in_env: false,
        logging_enabled: true,
        encryption_at_rest: true,
        encryption_in_transit: true,
        egress_restricted: true,
        model_allowlist: ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414'],
        data_retention_configured: true,
        rbac_configured: true,
        audit_logging: true,
      };

      const status = runSecurityControlChecks(demoConfig);
      return NextResponse.json({ data: status });
    }

    // -----------------------------------------------------------------------
    // Authenticated mode
    // -----------------------------------------------------------------------

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Attempt to load the most recent security control check results from the database
    const { data: checks, error: fetchError } = await supabase
      .from('control_checks')
      .select('*')
      .eq('project_id', projectId)
      .order('checked_at', { ascending: false });

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch control checks', message: fetchError.message },
        { status: 500 },
      );
    }

    // If no stored checks exist, run them against project sandbox config
    if (!checks || checks.length === 0) {
      // Fetch the project's sandbox config for input
      const { data: sandboxConfig } = await supabase
        .from('sandbox_configs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const defaultInput = {
        project_id: projectId,
        sandbox_config: sandboxConfig
          ? { cloud_provider: sandboxConfig.cloud_provider, settings: sandboxConfig.settings }
          : null,
        has_mfa: false,
        has_sso: false,
        secrets_in_env: false,
        logging_enabled: false,
        encryption_at_rest: false,
        encryption_in_transit: false,
        egress_restricted: false,
        model_allowlist: [] as string[],
        data_retention_configured: false,
        rbac_configured: false,
        audit_logging: false,
      };

      const status = runSecurityControlChecks(defaultInput);
      return NextResponse.json({ data: status });
    }

    // Build SecurityControlStatus from stored checks
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    let notApplicable = 0;

    const byCategory: Record<string, { total: number; passed: number; failed: number }> = {};

    for (const check of checks) {
      const cat = check.category;
      if (!byCategory[cat]) {
        byCategory[cat] = { total: 0, passed: 0, failed: 0 };
      }
      byCategory[cat].total += 1;

      switch (check.result) {
        case 'pass':
          passed += 1;
          byCategory[cat].passed += 1;
          break;
        case 'fail':
        case 'error':
          failed += 1;
          byCategory[cat].failed += 1;
          break;
        case 'warning':
          warnings += 1;
          break;
        case 'not_applicable':
          notApplicable += 1;
          break;
      }
    }

    const totalControls = checks.length;
    const passRate = totalControls > 0 ? Math.round((passed / totalControls) * 100) : 0;

    const status: SecurityControlStatus = {
      total_controls: totalControls,
      passed,
      failed,
      warnings,
      not_applicable: notApplicable,
      pass_rate: passRate,
      by_category: byCategory as SecurityControlStatus['by_category'],
      last_run_at: checks[0]?.checked_at ?? null,
      checks,
    };

    return NextResponse.json({ data: status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
