import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type {
  ApiResponse,
  GovernanceGate,
  GovernanceGateArtifact,
  AuditEvent,
} from '@/types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const submitGateSchema = z.object({
  project_id: z.string().uuid(),
  gate_type: z.enum(['design_review', 'data_approval', 'security_review', 'launch_review']),
  artifacts: z.array(z.object({
    name: z.string(),
    description: z.string(),
    file_url: z.string().nullable(),
  })),
  notes: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Gate metadata used for demo mode and default values
// ---------------------------------------------------------------------------

const GATE_METADATA: Record<string, { title: string; description: string; order: number }> = {
  design_review: {
    title: 'Design Review Gate',
    description: 'Review AI system design, architecture, and data flow before development begins.',
    order: 1,
  },
  data_approval: {
    title: 'Data Approval Gate',
    description: 'Approve data classification, retention policies, and processing activities for AI workloads.',
    order: 2,
  },
  security_review: {
    title: 'Security Review Gate',
    description: 'Validate security controls, threat mitigations, and sandbox configuration before pilot launch.',
    order: 3,
  },
  launch_review: {
    title: 'Launch Review Gate',
    description: 'Final go/no-go decision based on pilot results, compliance status, and risk posture.',
    order: 4,
  },
};

// ---------------------------------------------------------------------------
// POST /api/governance/gates/submit
// Submit a governance gate for review (sets status to 'pending')
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ gate: GovernanceGate; audit_event: AuditEvent }>>> {
  try {
    const body = await request.json();
    const parsed = submitGateSchema.safeParse(body);

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

    const { project_id, gate_type, artifacts, notes } = parsed.data;
    const now = new Date().toISOString();
    const meta = GATE_METADATA[gate_type];

    // -----------------------------------------------------------------------
    // Demo mode
    // -----------------------------------------------------------------------

    if (!isServerSupabaseConfigured()) {
      const gateId = `gate-${Date.now()}`;
      const auditId = `audit-${Date.now()}`;

      const gateArtifacts: GovernanceGateArtifact[] = artifacts.map((a, idx) => ({
        id: `artifact-${Date.now()}-${idx}`,
        name: a.name,
        description: a.description,
        required: true,
        provided: true,
        file_url: a.file_url,
        verified_by: null,
        verified_at: null,
      }));

      const demoGate: GovernanceGate = {
        id: gateId,
        project_id,
        organization_id: 'org-demo-001',
        gate_type,
        gate_order: meta.order,
        title: meta.title,
        description: meta.description,
        required_artifacts: gateArtifacts,
        decision: 'pending',
        decision_rationale: null,
        approver_id: null,
        approver_name: null,
        decided_at: null,
        conditions: [],
        escalation_required: false,
        submitted_by: 'user-demo-001',
        submitted_at: now,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      const demoAudit: AuditEvent = {
        id: auditId,
        project_id,
        organization_id: 'org-demo-001',
        event_type: 'gate_submitted',
        actor_id: 'user-demo-001',
        actor_name: 'Demo User',
        actor_role: 'consultant',
        description: `Governance gate "${meta.title}" submitted for review with ${artifacts.length} artifact(s).`,
        metadata: {
          gate_id: gateId,
          gate_type,
          artifact_count: artifacts.length,
          notes: notes ?? null,
        },
        ip_address: null,
        created_at: now,
      };

      return NextResponse.json({ data: { gate: demoGate, audit_event: demoAudit } }, { status: 201 });
    }

    // -----------------------------------------------------------------------
    // Authenticated mode
    // -----------------------------------------------------------------------

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build artifact records
    const gateArtifacts: GovernanceGateArtifact[] = artifacts.map((a, idx) => ({
      id: crypto.randomUUID(),
      name: a.name,
      description: a.description,
      required: true,
      provided: true,
      file_url: a.file_url,
      verified_by: null,
      verified_at: null,
    }));

    // Look up user profile for org id and display name
    const { data: profile } = await supabase
      .from('users')
      .select('organization_id, full_name, role')
      .eq('id', user.id)
      .single();

    const orgId = profile?.organization_id ?? '';
    const actorName = profile?.full_name ?? user.email ?? 'Unknown';
    const actorRole = profile?.role ?? 'consultant';

    // Insert the gate record
    const gateRecord = {
      project_id,
      organization_id: orgId,
      gate_type,
      gate_order: meta.order,
      title: meta.title,
      description: meta.description,
      required_artifacts: gateArtifacts,
      decision: 'pending' as const,
      decision_rationale: null,
      approver_id: null,
      approver_name: null,
      decided_at: null,
      conditions: [],
      escalation_required: false,
      submitted_by: user.id,
      submitted_at: now,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    const { data: gate, error: gateError } = await supabase
      .from('governance_gates')
      .insert(gateRecord)
      .select()
      .single();

    if (gateError) {
      return NextResponse.json(
        { error: 'Failed to submit governance gate', message: gateError.message },
        { status: 500 },
      );
    }

    // Write audit log entry
    const auditRecord = {
      project_id,
      organization_id: orgId,
      event_type: 'gate_submitted' as const,
      actor_id: user.id,
      actor_name: actorName,
      actor_role: actorRole,
      description: `Governance gate "${meta.title}" submitted for review with ${artifacts.length} artifact(s).`,
      metadata: {
        gate_id: gate.id,
        gate_type,
        artifact_count: artifacts.length,
        notes: notes ?? null,
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
      // Gate was created but audit failed - log warning but don't fail the request
      console.warn('[audit] Failed to write audit event for gate submission:', auditError.message);
    }

    return NextResponse.json(
      {
        data: {
          gate: gate as GovernanceGate,
          audit_event: (auditEvent ?? auditRecord) as AuditEvent,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
