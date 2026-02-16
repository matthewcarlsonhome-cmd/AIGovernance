import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type {
  ApiResponse,
  GovernanceGate,
  GovernanceGateDecision,
  AuditEvent,
  AuditEventType,
} from '@/types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const approveGateSchema = z.object({
  gate_id: z.string().uuid(),
  project_id: z.string().uuid(),
  decision: z.enum(['approved', 'conditionally_approved', 'rejected', 'deferred']),
  rationale: z.string().min(1),
  conditions: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function auditEventTypeForDecision(decision: GovernanceGateDecision): AuditEventType {
  switch (decision) {
    case 'approved':
    case 'conditionally_approved':
      return 'gate_approved';
    case 'rejected':
      return 'gate_rejected';
    case 'deferred':
      return 'gate_rejected'; // Deferred is logged as a rejection variant
    default:
      return 'gate_approved';
  }
}

function decisionLabel(decision: GovernanceGateDecision): string {
  switch (decision) {
    case 'approved':
      return 'Approved';
    case 'conditionally_approved':
      return 'Conditionally Approved';
    case 'rejected':
      return 'Rejected';
    case 'deferred':
      return 'Deferred';
    default:
      return decision;
  }
}

// ---------------------------------------------------------------------------
// POST /api/governance/gates/approve
// Approve, conditionally approve, reject, or defer a governance gate
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ gate: GovernanceGate; audit_event: AuditEvent }>>> {
  try {
    const body = await request.json();
    const parsed = approveGateSchema.safeParse(body);

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

    const { gate_id, project_id, decision, rationale, conditions } = parsed.data;
    const now = new Date().toISOString();

    // -----------------------------------------------------------------------
    // Demo mode
    // -----------------------------------------------------------------------

    if (!isServerSupabaseConfigured()) {
      const auditId = `audit-${Date.now()}`;

      const demoGate: GovernanceGate = {
        id: gate_id,
        project_id,
        organization_id: 'org-demo-001',
        gate_type: 'security_review',
        gate_order: 3,
        title: 'Security Review Gate',
        description: 'Validate security controls, threat mitigations, and sandbox configuration before pilot launch.',
        required_artifacts: [
          {
            id: 'artifact-demo-001',
            name: 'Security Control Audit Report',
            description: 'Results of all security control checks with pass/fail status.',
            required: true,
            provided: true,
            file_url: null,
            verified_by: 'user-demo-001',
            verified_at: now,
          },
          {
            id: 'artifact-demo-002',
            name: 'Threat Model Assessment',
            description: 'LLM-specific threat model with mitigation status for all identified threats.',
            required: true,
            provided: true,
            file_url: null,
            verified_by: 'user-demo-001',
            verified_at: now,
          },
        ],
        decision,
        decision_rationale: rationale,
        approver_id: 'user-demo-001',
        approver_name: 'Demo Reviewer',
        decided_at: now,
        conditions: conditions ?? [],
        escalation_required: decision === 'rejected',
        submitted_by: 'user-demo-002',
        submitted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: now,
        deleted_at: null,
      };

      const demoAudit: AuditEvent = {
        id: auditId,
        project_id,
        organization_id: 'org-demo-001',
        event_type: auditEventTypeForDecision(decision),
        actor_id: 'user-demo-001',
        actor_name: 'Demo Reviewer',
        actor_role: 'admin',
        description: `Governance gate "${demoGate.title}" decision: ${decisionLabel(decision)}. Rationale: ${rationale}`,
        metadata: {
          gate_id,
          gate_type: demoGate.gate_type,
          decision,
          conditions: conditions ?? [],
          rationale,
        },
        ip_address: null,
        created_at: now,
      };

      return NextResponse.json({ data: { gate: demoGate, audit_event: demoAudit } });
    }

    // -----------------------------------------------------------------------
    // Authenticated mode
    // -----------------------------------------------------------------------

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the existing gate to validate it exists and is in a reviewable state
    const { data: existingGate, error: fetchError } = await supabase
      .from('governance_gates')
      .select('*')
      .eq('id', gate_id)
      .eq('project_id', project_id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingGate) {
      return NextResponse.json(
        { error: 'Gate not found', message: `No governance gate found with id ${gate_id} for this project.` },
        { status: 404 },
      );
    }

    // Prevent re-approving or re-rejecting already-decided gates
    if (existingGate.decision !== 'pending') {
      return NextResponse.json(
        {
          error: 'Gate already decided',
          message: `This gate has already been decided with status: ${existingGate.decision}. Submit a new gate review if re-evaluation is needed.`,
        },
        { status: 409 },
      );
    }

    // Look up user profile
    const { data: profile } = await supabase
      .from('users')
      .select('organization_id, full_name, role')
      .eq('id', user.id)
      .single();

    const orgId = profile?.organization_id ?? existingGate.organization_id ?? '';
    const actorName = profile?.full_name ?? user.email ?? 'Unknown';
    const actorRole = profile?.role ?? 'admin';

    // Update the gate with the decision
    const { data: updatedGate, error: updateError } = await supabase
      .from('governance_gates')
      .update({
        decision,
        decision_rationale: rationale,
        approver_id: user.id,
        approver_name: actorName,
        decided_at: now,
        conditions: conditions ?? [],
        escalation_required: decision === 'rejected',
        updated_at: now,
      })
      .eq('id', gate_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update governance gate', message: updateError.message },
        { status: 500 },
      );
    }

    // Write audit log entry
    const auditRecord = {
      project_id,
      organization_id: orgId,
      event_type: auditEventTypeForDecision(decision),
      actor_id: user.id,
      actor_name: actorName,
      actor_role: actorRole,
      description: `Governance gate "${existingGate.title}" decision: ${decisionLabel(decision)}. Rationale: ${rationale}`,
      metadata: {
        gate_id,
        gate_type: existingGate.gate_type,
        decision,
        conditions: conditions ?? [],
        rationale,
        previous_decision: existingGate.decision,
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
      console.warn('[audit] Failed to write audit event for gate decision:', auditError.message);
    }

    return NextResponse.json({
      data: {
        gate: updatedGate as GovernanceGate,
        audit_event: (auditEvent ?? auditRecord) as AuditEvent,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
