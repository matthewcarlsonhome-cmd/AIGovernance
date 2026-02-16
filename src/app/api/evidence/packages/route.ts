import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type {
  ApiResponse,
  EvidencePackage,
  EvidenceArtifact,
  AuditEvent,
  GovernanceGateType,
  GovernanceGateDecision,
  RiskTier,
} from '@/types';

// ---------------------------------------------------------------------------
// Validation - POST body
// ---------------------------------------------------------------------------

const createEvidencePackageSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Demo data factory
// ---------------------------------------------------------------------------

function buildDemoEvidencePackage(projectId: string, title: string, description: string | null): EvidencePackage {
  const now = new Date().toISOString();

  const artifacts: EvidenceArtifact[] = [
    {
      id: 'ea-001',
      type: 'policy',
      name: 'Acceptable Use Policy v2.1',
      description: 'Organization-wide AI acceptable use policy approved by legal and executive leadership.',
      file_url: null,
      content_snapshot: { version: '2.1', status: 'approved', sections: 12 },
      collected_at: now,
    },
    {
      id: 'ea-002',
      type: 'gate_approval',
      name: 'Design Review Gate Approval',
      description: 'Design review gate approval record with all required artifacts verified.',
      file_url: null,
      content_snapshot: { gate_type: 'design_review', decision: 'approved', artifact_count: 4 },
      collected_at: now,
    },
    {
      id: 'ea-003',
      type: 'control_check',
      name: 'Security Control Audit Report',
      description: 'Full security control check results including 24 controls across 9 categories.',
      file_url: null,
      content_snapshot: { total_controls: 24, passed: 19, failed: 2, warnings: 3, pass_rate: 79 },
      collected_at: now,
    },
    {
      id: 'ea-004',
      type: 'risk_assessment',
      name: 'AI Threat Model Assessment',
      description: 'Comprehensive threat model covering 8 AI-specific threat categories with 16 identified threats.',
      file_url: null,
      content_snapshot: { total_threats: 16, mitigated: 8, open: 6, accepted: 2 },
      collected_at: now,
    },
    {
      id: 'ea-005',
      type: 'data_classification',
      name: 'Data Classification Registry',
      description: 'Complete inventory of data assets with classification levels and processing activities.',
      file_url: null,
      content_snapshot: { total_assets: 12, restricted: 2, confidential: 4, internal: 4, public: 2 },
      collected_at: now,
    },
    {
      id: 'ea-006',
      type: 'audit_log',
      name: 'Governance Activity Audit Trail',
      description: 'Audit log covering all governance actions from project inception through current date.',
      file_url: null,
      content_snapshot: { total_events: 47, event_types: 12, date_range: '2025-01-15 to 2025-03-20' },
      collected_at: now,
    },
  ];

  const gateSummaries: EvidencePackage['gate_summaries'] = [
    { gate_type: 'design_review' as GovernanceGateType, decision: 'approved' as GovernanceGateDecision, decided_at: new Date(Date.now() - 30 * 86400000).toISOString() },
    { gate_type: 'data_approval' as GovernanceGateType, decision: 'approved' as GovernanceGateDecision, decided_at: new Date(Date.now() - 20 * 86400000).toISOString() },
    { gate_type: 'security_review' as GovernanceGateType, decision: 'conditionally_approved' as GovernanceGateDecision, decided_at: new Date(Date.now() - 10 * 86400000).toISOString() },
    { gate_type: 'launch_review' as GovernanceGateType, decision: 'pending' as GovernanceGateDecision, decided_at: null },
  ];

  return {
    id: `ep-${Date.now()}`,
    project_id: projectId,
    organization_id: 'org-demo-001',
    version: 1,
    title,
    description,
    artifact_manifest: artifacts,
    gate_summaries: gateSummaries,
    control_summary: { total: 24, passed: 19, failed: 2 },
    risk_summary: {
      total: 16,
      by_tier: {
        critical: 1,
        high: 5,
        medium: 6,
        low: 4,
      } as Record<RiskTier, number>,
    },
    generated_by: 'user-demo-001',
    generated_at: now,
    file_url: null,
    created_at: now,
    updated_at: now,
  };
}

// ---------------------------------------------------------------------------
// GET /api/evidence/packages?project_id=<uuid>
// List evidence packages for a project
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<EvidencePackage[]>>> {
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
    // Demo mode
    // -----------------------------------------------------------------------

    if (!isServerSupabaseConfigured()) {
      const demoPackage = buildDemoEvidencePackage(
        projectId,
        'AI Governance Evidence Package v1',
        'Comprehensive evidence package for AI governance audit covering all four gate reviews, security controls, and data classification.',
      );

      return NextResponse.json({ data: [demoPackage] });
    }

    // -----------------------------------------------------------------------
    // Authenticated mode
    // -----------------------------------------------------------------------

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('evidence_packages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch evidence packages', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/evidence/packages
// Generate a new evidence package for a project
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ package: EvidencePackage; audit_event: AuditEvent }>>> {
  try {
    const body = await request.json();
    const parsed = createEvidencePackageSchema.safeParse(body);

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

    const { project_id, title, description } = parsed.data;
    const now = new Date().toISOString();

    // -----------------------------------------------------------------------
    // Demo mode
    // -----------------------------------------------------------------------

    if (!isServerSupabaseConfigured()) {
      const demoPackage = buildDemoEvidencePackage(project_id, title, description ?? null);

      const demoAudit: AuditEvent = {
        id: `audit-${Date.now()}`,
        project_id,
        organization_id: 'org-demo-001',
        event_type: 'evidence_generated',
        actor_id: 'user-demo-001',
        actor_name: 'Demo User',
        actor_role: 'consultant',
        description: `Evidence package "${title}" generated with ${demoPackage.artifact_manifest.length} artifacts.`,
        metadata: {
          package_id: demoPackage.id,
          artifact_count: demoPackage.artifact_manifest.length,
          gate_count: demoPackage.gate_summaries.length,
        },
        ip_address: null,
        created_at: now,
      };

      return NextResponse.json(
        { data: { package: demoPackage, audit_event: demoAudit } },
        { status: 201 },
      );
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
    const actorRole = profile?.role ?? 'consultant';

    // Collect evidence artifacts from various sources

    // 1. Governance gates
    const { data: gates } = await supabase
      .from('governance_gates')
      .select('id, gate_type, title, decision, decided_at, required_artifacts')
      .eq('project_id', project_id)
      .is('deleted_at', null)
      .order('gate_order', { ascending: true });

    const gateSummaries = (gates ?? []).map((g) => ({
      gate_type: g.gate_type as GovernanceGateType,
      decision: g.decision as GovernanceGateDecision,
      decided_at: g.decided_at,
    }));

    const gateArtifacts: EvidenceArtifact[] = (gates ?? []).map((g) => ({
      id: `ea-gate-${g.id}`,
      type: 'gate_approval' as const,
      name: `${g.title} - ${g.decision}`,
      description: `Gate review record for ${g.gate_type} with decision: ${g.decision}.`,
      file_url: null,
      content_snapshot: { gate_type: g.gate_type, decision: g.decision, artifacts: g.required_artifacts },
      collected_at: g.decided_at ?? now,
    }));

    // 2. Latest security control checks
    const { data: controlChecks } = await supabase
      .from('control_checks')
      .select('*')
      .eq('project_id', project_id)
      .order('checked_at', { ascending: false });

    let controlSummary: EvidencePackage['control_summary'] = null;
    const controlArtifacts: EvidenceArtifact[] = [];

    if (controlChecks && controlChecks.length > 0) {
      const passedCount = controlChecks.filter((c) => c.result === 'pass').length;
      const failedCount = controlChecks.filter((c) => c.result === 'fail' || c.result === 'error').length;
      controlSummary = { total: controlChecks.length, passed: passedCount, failed: failedCount };

      controlArtifacts.push({
        id: `ea-controls-${Date.now()}`,
        type: 'control_check',
        name: 'Security Control Audit Report',
        description: `${controlChecks.length} controls evaluated: ${passedCount} passed, ${failedCount} failed.`,
        file_url: null,
        content_snapshot: controlSummary,
        collected_at: controlChecks[0].checked_at,
      });
    }

    // 3. Policies
    const { data: policies } = await supabase
      .from('policies')
      .select('id, title, type, status, version')
      .eq('project_id', project_id);

    const policyArtifacts: EvidenceArtifact[] = (policies ?? []).map((p) => ({
      id: `ea-policy-${p.id}`,
      type: 'policy' as const,
      name: `${p.title} (v${p.version})`,
      description: `Policy document of type ${p.type} with status: ${p.status}.`,
      file_url: null,
      content_snapshot: { policy_type: p.type, status: p.status, version: p.version },
      collected_at: now,
    }));

    // Combine all artifacts
    const allArtifacts = [...gateArtifacts, ...controlArtifacts, ...policyArtifacts];

    // Determine next version number
    const { data: existingPackages } = await supabase
      .from('evidence_packages')
      .select('version')
      .eq('project_id', project_id)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (existingPackages && existingPackages.length > 0)
      ? (existingPackages[0].version ?? 0) + 1
      : 1;

    // Build the package record
    const packageRecord = {
      project_id,
      organization_id: orgId,
      version: nextVersion,
      title,
      description: description ?? null,
      artifact_manifest: allArtifacts,
      gate_summaries: gateSummaries,
      control_summary: controlSummary,
      risk_summary: null, // Could be enriched with risk data in future iterations
      generated_by: user.id,
      generated_at: now,
      file_url: null,
      created_at: now,
      updated_at: now,
    };

    const { data: evidencePackage, error: insertError } = await supabase
      .from('evidence_packages')
      .insert(packageRecord)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create evidence package', message: insertError.message },
        { status: 500 },
      );
    }

    // Write audit log
    const auditRecord = {
      project_id,
      organization_id: orgId,
      event_type: 'evidence_generated' as const,
      actor_id: user.id,
      actor_name: actorName,
      actor_role: actorRole,
      description: `Evidence package "${title}" (v${nextVersion}) generated with ${allArtifacts.length} artifacts.`,
      metadata: {
        package_id: evidencePackage.id,
        version: nextVersion,
        artifact_count: allArtifacts.length,
        gate_count: gateSummaries.length,
        has_control_summary: controlSummary !== null,
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
      console.warn('[audit] Failed to write audit event for evidence package generation:', auditError.message);
    }

    return NextResponse.json(
      {
        data: {
          package: evidencePackage as EvidencePackage,
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
