import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { runSecurityControlChecks } from '@/lib/security';
import type { ApiResponse, SecurityControlStatus, AuditEvent } from '@/types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const runControlsSchema = z.object({
  project_id: z.string().uuid(),
  has_mfa: z.boolean(),
  has_sso: z.boolean(),
  secrets_in_env: z.boolean(),
  logging_enabled: z.boolean(),
  encryption_at_rest: z.boolean(),
  encryption_in_transit: z.boolean(),
  egress_restricted: z.boolean(),
  model_allowlist: z.array(z.string()),
  data_retention_configured: z.boolean(),
  rbac_configured: z.boolean(),
  audit_logging: z.boolean(),
});

// ---------------------------------------------------------------------------
// POST /api/security/controls/run
// Run security control checks on-demand for a project
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ status: SecurityControlStatus; audit_event: AuditEvent }>>> {
  try {
    const body = await request.json();
    const parsed = runControlsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: parsed.error.flatten().fieldErrors
            ? JSON.stringify(parsed.error.flatten().fieldErrors)
            : 'Invalid request body',
        },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const now = new Date().toISOString();

    // Run the security control checks engine (pure function)
    const controlStatus = runSecurityControlChecks({
      ...input,
      sandbox_config: null, // Sandbox config not provided in this schema; engine handles null
    });

    // -----------------------------------------------------------------------
    // Demo mode
    // -----------------------------------------------------------------------

    if (!isServerSupabaseConfigured()) {
      const demoAudit: AuditEvent = {
        id: `audit-${Date.now()}`,
        project_id: input.project_id,
        organization_id: 'org-demo-001',
        event_type: 'control_check_run',
        actor_id: 'user-demo-001',
        actor_name: 'Demo User',
        actor_role: 'it',
        description: `Security control checks executed: ${controlStatus.passed} passed, ${controlStatus.failed} failed, ${controlStatus.warnings} warnings out of ${controlStatus.total_controls} total controls. Pass rate: ${controlStatus.pass_rate}%.`,
        metadata: {
          project_id: input.project_id,
          total_controls: controlStatus.total_controls,
          passed: controlStatus.passed,
          failed: controlStatus.failed,
          warnings: controlStatus.warnings,
          pass_rate: controlStatus.pass_rate,
        },
        ip_address: null,
        created_at: now,
      };

      return NextResponse.json({ data: { status: controlStatus, audit_event: demoAudit } });
    }

    // -----------------------------------------------------------------------
    // Authenticated mode
    // -----------------------------------------------------------------------

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up user profile
    const { data: profile } = await supabase
      .from('users')
      .select('organization_id, full_name, role')
      .eq('id', user.id)
      .single();

    const orgId = profile?.organization_id ?? '';
    const actorName = profile?.full_name ?? user.email ?? 'Unknown';
    const actorRole = profile?.role ?? 'it';

    // Persist the control check results
    // First, populate organization_id on each check and set checked_by
    const checksToInsert = controlStatus.checks.map((check) => ({
      ...check,
      organization_id: orgId,
      checked_by: user.id,
    }));

    // Upsert checks (replace existing checks for same project + control_id)
    const { error: insertError } = await supabase
      .from('control_checks')
      .upsert(checksToInsert, { onConflict: 'project_id,control_id' });

    if (insertError) {
      console.warn('[security] Failed to persist control check results:', insertError.message);
      // Continue - still return the computed results
    }

    // Write audit log entry
    const auditRecord = {
      project_id: input.project_id,
      organization_id: orgId,
      event_type: 'control_check_run' as const,
      actor_id: user.id,
      actor_name: actorName,
      actor_role: actorRole,
      description: `Security control checks executed: ${controlStatus.passed} passed, ${controlStatus.failed} failed, ${controlStatus.warnings} warnings out of ${controlStatus.total_controls} total controls. Pass rate: ${controlStatus.pass_rate}%.`,
      metadata: {
        project_id: input.project_id,
        total_controls: controlStatus.total_controls,
        passed: controlStatus.passed,
        failed: controlStatus.failed,
        warnings: controlStatus.warnings,
        pass_rate: controlStatus.pass_rate,
      },
      ip_address: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null,
      created_at: now,
    };

    const { data: auditEvent, error: auditError } = await supabase
      .from('audit_events')
      .insert(auditRecord)
      .select()
      .single();

    if (auditError) {
      console.warn('[audit] Failed to write audit event for control check run:', auditError.message);
    }

    return NextResponse.json({
      data: {
        status: controlStatus,
        audit_event: (auditEvent ?? auditRecord) as AuditEvent,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
