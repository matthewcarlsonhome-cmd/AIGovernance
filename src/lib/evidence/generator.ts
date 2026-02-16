import type {
  EvidencePackage,
  EvidenceArtifact,
  GovernanceGateType,
  GovernanceGateDecision,
  RiskTier,
} from '@/types';

// ---------------------------------------------------------------------------
// Input shape for the evidence package generator
// ---------------------------------------------------------------------------

export interface EvidenceGeneratorInput {
  project_id: string;
  organization_id: string;
  title: string;
  description?: string;
  governance_gates: {
    gate_type: GovernanceGateType;
    decision: GovernanceGateDecision;
    decided_at: string | null;
  }[];
  control_checks: { result: string }[];
  policies: {
    id: string;
    title: string;
    type: string;
    status: string;
    version: number;
  }[];
  risks: {
    id: string;
    tier: string;
    category: string;
    status: string;
  }[];
  data_assets: {
    id: string;
    name: string;
    classification: string;
    approved: boolean;
  }[];
  generated_by?: string;
}

// ---------------------------------------------------------------------------
// Helpers – deterministic UUID-like id generation for pure-function output
// ---------------------------------------------------------------------------

function makeId(prefix: string, index: number): string {
  const padded = String(index).padStart(4, '0');
  return `${prefix}-${padded}`;
}

// ---------------------------------------------------------------------------
// Artifact collectors
// ---------------------------------------------------------------------------

function collectPolicyArtifacts(
  policies: EvidenceGeneratorInput['policies'],
): EvidenceArtifact[] {
  return policies.map((p, i) => ({
    id: makeId('art-policy', i),
    type: 'policy' as const,
    name: p.title,
    description: `Policy "${p.title}" (${p.type}) — status: ${p.status}, version ${p.version}`,
    file_url: null,
    content_snapshot: {
      policy_id: p.id,
      title: p.title,
      type: p.type,
      status: p.status,
      version: p.version,
    },
    collected_at: new Date().toISOString(),
  }));
}

function collectGateArtifacts(
  gates: EvidenceGeneratorInput['governance_gates'],
): EvidenceArtifact[] {
  return gates.map((g, i) => ({
    id: makeId('art-gate', i),
    type: 'gate_approval' as const,
    name: `Gate: ${formatGateType(g.gate_type)}`,
    description: `Gate "${formatGateType(g.gate_type)}" — decision: ${g.decision}${g.decided_at ? `, decided ${g.decided_at}` : ''}`,
    file_url: null,
    content_snapshot: {
      gate_type: g.gate_type,
      decision: g.decision,
      decided_at: g.decided_at,
    },
    collected_at: new Date().toISOString(),
  }));
}

function collectControlArtifacts(
  checks: EvidenceGeneratorInput['control_checks'],
): EvidenceArtifact[] {
  if (checks.length === 0) {
    return [];
  }

  const passed = checks.filter((c) => c.result === 'pass').length;
  const failed = checks.filter((c) => c.result === 'fail').length;
  const warnings = checks.filter((c) => c.result === 'warning').length;

  return [
    {
      id: makeId('art-ctrl', 0),
      type: 'control_check' as const,
      name: 'Control Checks Summary',
      description: `${checks.length} controls evaluated — ${passed} passed, ${failed} failed, ${warnings} warnings`,
      file_url: null,
      content_snapshot: {
        total: checks.length,
        passed,
        failed,
        warnings,
      },
      collected_at: new Date().toISOString(),
    },
  ];
}

function collectRiskArtifacts(
  risks: EvidenceGeneratorInput['risks'],
): EvidenceArtifact[] {
  return risks.map((r, i) => ({
    id: makeId('art-risk', i),
    type: 'risk_assessment' as const,
    name: `Risk: ${r.category}`,
    description: `Risk "${r.category}" — tier: ${r.tier}, status: ${r.status}`,
    file_url: null,
    content_snapshot: {
      risk_id: r.id,
      tier: r.tier,
      category: r.category,
      status: r.status,
    },
    collected_at: new Date().toISOString(),
  }));
}

function collectDataAssetArtifacts(
  assets: EvidenceGeneratorInput['data_assets'],
): EvidenceArtifact[] {
  return assets.map((a, i) => ({
    id: makeId('art-data', i),
    type: 'data_classification' as const,
    name: a.name,
    description: `Data asset "${a.name}" — classification: ${a.classification}, approved: ${a.approved ? 'yes' : 'no'}`,
    file_url: null,
    content_snapshot: {
      data_asset_id: a.id,
      name: a.name,
      classification: a.classification,
      approved: a.approved,
    },
    collected_at: new Date().toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Summary builders
// ---------------------------------------------------------------------------

function buildGateSummaries(
  gates: EvidenceGeneratorInput['governance_gates'],
): EvidencePackage['gate_summaries'] {
  return gates.map((g) => ({
    gate_type: g.gate_type,
    decision: g.decision,
    decided_at: g.decided_at,
  }));
}

function buildControlSummary(
  checks: EvidenceGeneratorInput['control_checks'],
): EvidencePackage['control_summary'] {
  if (checks.length === 0) {
    return null;
  }

  const passed = checks.filter((c) => c.result === 'pass').length;
  const failed = checks.filter((c) => c.result === 'fail').length;

  return {
    total: checks.length,
    passed,
    failed,
  };
}

function buildRiskSummary(
  risks: EvidenceGeneratorInput['risks'],
): EvidencePackage['risk_summary'] {
  if (risks.length === 0) {
    return null;
  }

  const byTier: Record<RiskTier, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const r of risks) {
    const tier = r.tier as RiskTier;
    if (tier in byTier) {
      byTier[tier] += 1;
    }
  }

  return {
    total: risks.length,
    by_tier: byTier,
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatGateType(gateType: GovernanceGateType): string {
  const labels: Record<GovernanceGateType, string> = {
    design_review: 'Design Review',
    data_approval: 'Data Approval',
    security_review: 'Security Review',
    launch_review: 'Launch Review',
  };
  return labels[gateType] ?? gateType;
}

// ---------------------------------------------------------------------------
// Main generator — pure function (except Date timestamps)
// ---------------------------------------------------------------------------

export function generateEvidencePackage(
  input: EvidenceGeneratorInput,
  existingVersion?: number,
): EvidencePackage {
  const now = new Date().toISOString();
  const version = (existingVersion ?? 0) + 1;

  // 1. Collect evidence artifacts from each source
  const artifacts: EvidenceArtifact[] = [
    ...collectPolicyArtifacts(input.policies),
    ...collectGateArtifacts(input.governance_gates),
    ...collectControlArtifacts(input.control_checks),
    ...collectRiskArtifacts(input.risks),
    ...collectDataAssetArtifacts(input.data_assets),
  ];

  // 2. Build summaries
  const gateSummaries = buildGateSummaries(input.governance_gates);
  const controlSummary = buildControlSummary(input.control_checks);
  const riskSummary = buildRiskSummary(input.risks);

  // 3. Assemble the evidence package
  const evidencePackage: EvidencePackage = {
    id: `evpkg-${input.project_id}-v${version}`,
    project_id: input.project_id,
    organization_id: input.organization_id,
    version,
    title: input.title,
    description: input.description ?? null,
    artifact_manifest: artifacts,
    gate_summaries: gateSummaries,
    control_summary: controlSummary,
    risk_summary: riskSummary,
    generated_by: input.generated_by ?? null,
    generated_at: now,
    file_url: null,
    created_at: now,
    updated_at: now,
  };

  return evidencePackage;
}

// ---------------------------------------------------------------------------
// Demo evidence generator
// ---------------------------------------------------------------------------

export function generateDemoEvidencePackage(projectId: string): EvidencePackage {
  const demoInput: EvidenceGeneratorInput = {
    project_id: projectId,
    organization_id: 'demo-org-001',
    title: 'AI Governance Evidence Package — Demo',
    description: 'Automatically generated evidence package for demonstration purposes.',
    governance_gates: [
      { gate_type: 'design_review', decision: 'approved', decided_at: '2025-11-01T10:00:00Z' },
      { gate_type: 'data_approval', decision: 'approved', decided_at: '2025-11-15T14:30:00Z' },
      { gate_type: 'security_review', decision: 'conditionally_approved', decided_at: '2025-12-01T09:00:00Z' },
      { gate_type: 'launch_review', decision: 'pending', decided_at: null },
    ],
    control_checks: [
      { result: 'pass' },
      { result: 'pass' },
      { result: 'pass' },
      { result: 'fail' },
      { result: 'pass' },
      { result: 'warning' },
      { result: 'pass' },
      { result: 'pass' },
      { result: 'not_applicable' },
      { result: 'pass' },
    ],
    policies: [
      { id: 'pol-001', title: 'Acceptable Use Policy', type: 'aup', status: 'approved', version: 2 },
      { id: 'pol-002', title: 'Incident Response Plan — AI Addendum', type: 'irp', status: 'approved', version: 1 },
      { id: 'pol-003', title: 'Data Classification Policy', type: 'data_classification', status: 'review', version: 1 },
      { id: 'pol-004', title: 'AI Risk Framework', type: 'risk_framework', status: 'draft', version: 1 },
    ],
    risks: [
      { id: 'risk-001', tier: 'critical', category: 'data_exfiltration', status: 'mitigating' },
      { id: 'risk-002', tier: 'high', category: 'prompt_injection', status: 'mitigating' },
      { id: 'risk-003', tier: 'medium', category: 'model_misuse', status: 'open' },
      { id: 'risk-004', tier: 'low', category: 'vendor_lock_in', status: 'accepted' },
      { id: 'risk-005', tier: 'high', category: 'compliance_gap', status: 'mitigating' },
      { id: 'risk-006', tier: 'medium', category: 'bias_fairness', status: 'open' },
    ],
    data_assets: [
      { id: 'da-001', name: 'Customer Support Tickets DB', classification: 'confidential', approved: true },
      { id: 'da-002', name: 'Internal Knowledge Base', classification: 'internal', approved: true },
      { id: 'da-003', name: 'HR Employee Records', classification: 'restricted', approved: false },
      { id: 'da-004', name: 'Public Documentation', classification: 'public', approved: true },
    ],
    generated_by: 'demo-user',
  };

  return generateEvidencePackage(demoInput);
}
