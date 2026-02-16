import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type {
  ApiResponse,
  EvidencePackage,
  EvidenceArtifact,
  GovernanceGateType,
  GovernanceGateDecision,
  RiskTier,
} from '@/types';

// ---------------------------------------------------------------------------
// GET /api/evidence/packages/[id]
// Get a specific evidence package by ID
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<EvidencePackage>>> {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Evidence package ID is required' },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // Demo mode
    // -----------------------------------------------------------------------

    if (!isServerSupabaseConfigured()) {
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
        {
          id: 'ea-007',
          type: 'report',
          name: 'Executive Feasibility Report',
          description: 'Executive-level feasibility assessment with ROI analysis and risk heat map.',
          file_url: null,
          content_snapshot: { persona: 'executive', pages: 5, feasibility_score: 78 },
          collected_at: now,
        },
      ];

      const gateSummaries: EvidencePackage['gate_summaries'] = [
        { gate_type: 'design_review' as GovernanceGateType, decision: 'approved' as GovernanceGateDecision, decided_at: new Date(Date.now() - 30 * 86400000).toISOString() },
        { gate_type: 'data_approval' as GovernanceGateType, decision: 'approved' as GovernanceGateDecision, decided_at: new Date(Date.now() - 20 * 86400000).toISOString() },
        { gate_type: 'security_review' as GovernanceGateType, decision: 'conditionally_approved' as GovernanceGateDecision, decided_at: new Date(Date.now() - 10 * 86400000).toISOString() },
        { gate_type: 'launch_review' as GovernanceGateType, decision: 'pending' as GovernanceGateDecision, decided_at: null },
      ];

      const demoPackage: EvidencePackage = {
        id,
        project_id: 'proj-demo-001',
        organization_id: 'org-demo-001',
        version: 1,
        title: 'AI Governance Evidence Package v1',
        description: 'Comprehensive evidence package for AI governance audit covering all four gate reviews, security controls, and data classification.',
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

      return NextResponse.json({ data: demoPackage });
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
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Evidence package not found', message: `No evidence package found with id ${id}.` },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: data as EvidencePackage });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
