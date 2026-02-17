// SLA & Escalation Workflow Service (Design Doc §9 Phase 4)
// Tracks SLA compliance and escalates overdue items.

import type { SlaPolicy, EscalationRecord, EscalationLevel, SlaStatus } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Default SLA Policies
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_SLA_POLICIES: SlaPolicy[] = [
  {
    id: 'sla-risk-high',
    name: 'High/Critical Risk Resolution',
    description: 'High and critical risks must be mitigated or accepted within target days',
    target_days: 14,
    warning_days: 10,
    applies_to: 'risk',
    escalation_chain: ['l1_owner', 'l2_manager', 'l3_director', 'l4_executive'],
    organization_id: 'org-demo-001',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 'sla-gate-review',
    name: 'Gate Review Turnaround',
    description: 'Governance gate reviews must be completed within target days of submission',
    target_days: 7,
    warning_days: 5,
    applies_to: 'gate_review',
    escalation_chain: ['l1_owner', 'l2_manager', 'l3_director'],
    organization_id: 'org-demo-001',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 'sla-control-failure',
    name: 'Control Failure Remediation',
    description: 'Failed security controls must be remediated within target days',
    target_days: 21,
    warning_days: 14,
    applies_to: 'control_failure',
    escalation_chain: ['l1_owner', 'l2_manager', 'l3_director', 'l4_executive'],
    organization_id: 'org-demo-001',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 'sla-incident',
    name: 'Security Incident Response',
    description: 'Security incidents must be triaged and assigned within target days',
    target_days: 3,
    warning_days: 1,
    applies_to: 'incident',
    escalation_chain: ['l1_owner', 'l2_manager', 'l3_director', 'l4_executive'],
    organization_id: 'org-demo-001',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Escalation Logic
// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_ORDER: EscalationLevel[] = ['l1_owner', 'l2_manager', 'l3_director', 'l4_executive'];

/**
 * Compute the SLA status for a record based on elapsed time.
 */
export function computeSlaStatus(
  policy: SlaPolicy,
  openedAt: string,
  now: Date = new Date(),
): SlaStatus {
  const elapsedMs = now.getTime() - new Date(openedAt).getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  if (elapsedDays >= policy.target_days) return 'breached';
  if (elapsedDays >= policy.warning_days) return 'warning';
  return 'within';
}

/**
 * Determine the appropriate escalation level based on elapsed time.
 * Each level gets an equal portion of the SLA window.
 */
export function computeEscalationLevel(
  policy: SlaPolicy,
  openedAt: string,
  now: Date = new Date(),
): EscalationLevel {
  const elapsedMs = now.getTime() - new Date(openedAt).getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  const chain = policy.escalation_chain;

  if (chain.length === 0) return 'l1_owner';

  const daysPerLevel = policy.target_days / chain.length;
  const levelIndex = Math.min(
    Math.floor(elapsedDays / daysPerLevel),
    chain.length - 1,
  );

  return chain[Math.max(0, levelIndex)];
}

/**
 * Evaluate all open escalation records and update their status/level.
 * Pure function — returns updated records without mutating originals.
 */
export function evaluateEscalations(
  records: EscalationRecord[],
  policies: SlaPolicy[],
  now: Date = new Date(),
): EscalationRecord[] {
  const policyMap = new Map(policies.map((p) => [p.id, p]));

  return records
    .filter((r) => r.resolved_at === null) // Only open records
    .map((record) => {
      const policy = policyMap.get(record.sla_policy_id);
      if (!policy) return record;

      const status = computeSlaStatus(policy, record.opened_at, now);
      const level = computeEscalationLevel(policy, record.opened_at, now);

      return {
        ...record,
        status,
        current_level: level,
        escalated_at: level !== record.current_level ? now.toISOString() : record.escalated_at,
        updated_at: now.toISOString(),
      };
    });
}

/**
 * Create a new escalation record for a resource.
 */
export function createEscalationRecord(
  policy: SlaPolicy,
  resourceType: string,
  resourceId: string,
  projectId: string,
  assignedTo: string | null = null,
): EscalationRecord {
  const now = new Date().toISOString();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + policy.target_days);

  return {
    id: `esc-${crypto.randomUUID()}`,
    sla_policy_id: policy.id,
    resource_type: resourceType,
    resource_id: resourceId,
    project_id: projectId,
    organization_id: policy.organization_id,
    current_level: policy.escalation_chain[0] ?? 'l1_owner',
    status: 'within',
    opened_at: now,
    due_at: dueDate.toISOString(),
    escalated_at: null,
    resolved_at: null,
    assigned_to: assignedTo,
    notes: null,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Get the human-readable label for an escalation level.
 */
export function getEscalationLevelLabel(level: EscalationLevel): string {
  const labels: Record<EscalationLevel, string> = {
    l1_owner: 'Owner',
    l2_manager: 'Manager',
    l3_director: 'Director',
    l4_executive: 'Executive',
  };
  return labels[level];
}

/**
 * Get the next escalation level in the chain, or null if at max.
 */
export function getNextEscalationLevel(current: EscalationLevel): EscalationLevel | null {
  const idx = LEVEL_ORDER.indexOf(current);
  if (idx < 0 || idx >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[idx + 1];
}
