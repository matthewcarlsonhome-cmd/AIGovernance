// Domain Event Types (Design Doc §8.2)
// Every critical action emits a typed event for audit, evidence, and notification.

import type { UserRole, RiskTier, GovernanceGateType, GovernanceGateDecision } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Event Type Registry
// ─────────────────────────────────────────────────────────────────────────────

export type DomainEventType =
  // Project lifecycle
  | 'project.created'
  | 'project.state_changed'
  | 'project.archived'
  | 'project.owner_changed'
  // Governance
  | 'gate.submitted'
  | 'gate.approved'
  | 'gate.rejected'
  | 'gate.evidence_attached'
  // Policy
  | 'policy.drafted'
  | 'policy.submitted_for_review'
  | 'policy.approved'
  | 'policy.deprecated'
  | 'policy.version_published'
  // Risk
  | 'risk.created'
  | 'risk.updated'
  | 'risk.accepted'
  | 'risk.mitigated'
  | 'risk.escalated'
  // Data governance
  | 'data.classified'
  | 'data.approval_requested'
  | 'data.approval_granted'
  | 'data.approval_denied'
  // Security
  | 'control.check_run'
  | 'control.check_failed'
  | 'control.check_passed'
  | 'control.drift_detected'
  // Incidents
  | 'incident.created'
  | 'incident.assigned'
  | 'incident.resolved'
  | 'incident.escalated'
  // Evidence
  | 'evidence.package_generated'
  | 'evidence.artifact_attached'
  // Metrics
  | 'metric.kpi_recorded'
  | 'metric.threshold_breached'
  // Auth / team
  | 'auth.role_changed'
  | 'auth.step_up_required'
  | 'team.member_added'
  | 'team.member_removed';

// ─────────────────────────────────────────────────────────────────────────────
// Base Event Shape
// ─────────────────────────────────────────────────────────────────────────────

export interface DomainEvent<T extends DomainEventType = DomainEventType> {
  /** Unique event ID */
  id: string;
  /** Event type from the registry */
  type: T;
  /** Timestamp (ISO 8601) */
  timestamp: string;
  /** Organization scope */
  organization_id: string;
  /** Project scope (null for org-level events) */
  project_id: string | null;
  /** Who triggered the event */
  actor: {
    id: string;
    name: string;
    role: UserRole;
  };
  /** Event-specific payload */
  payload: DomainEventPayload[T];
  /** Correlation trace ID for request tracking */
  trace_id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Typed Payloads per Event
// ─────────────────────────────────────────────────────────────────────────────

export interface DomainEventPayload {
  // Project
  'project.created': { project_name: string; template_id: string | null };
  'project.state_changed': { from_state: string; to_state: string; reason: string | null };
  'project.archived': { reason: string | null };
  'project.owner_changed': { previous_owner_id: string | null; new_owner_id: string };
  // Gate
  'gate.submitted': { gate_type: GovernanceGateType; gate_id: string; submitted_by: string };
  'gate.approved': { gate_type: GovernanceGateType; gate_id: string; decision: GovernanceGateDecision; rationale: string };
  'gate.rejected': { gate_type: GovernanceGateType; gate_id: string; decision: GovernanceGateDecision; rationale: string };
  'gate.evidence_attached': { gate_id: string; artifact_id: string; artifact_type: string };
  // Policy
  'policy.drafted': { policy_id: string; policy_type: string; title: string };
  'policy.submitted_for_review': { policy_id: string; title: string };
  'policy.approved': { policy_id: string; version: number; approved_by: string };
  'policy.deprecated': { policy_id: string; reason: string };
  'policy.version_published': { policy_id: string; version: number; change_summary: string };
  // Risk
  'risk.created': { risk_id: string; title: string; severity: RiskTier };
  'risk.updated': { risk_id: string; fields_changed: string[] };
  'risk.accepted': { risk_id: string; accepted_by: string; rationale: string; expiry_date: string | null };
  'risk.mitigated': { risk_id: string; mitigation_description: string };
  'risk.escalated': { risk_id: string; escalated_to: string; reason: string };
  // Data
  'data.classified': { asset_id: string; classification: string; classified_by: string };
  'data.approval_requested': { asset_id: string; requested_by: string; classification: string };
  'data.approval_granted': { asset_id: string; approved_by: string };
  'data.approval_denied': { asset_id: string; denied_by: string; reason: string };
  // Security
  'control.check_run': { total: number; passed: number; failed: number; warnings: number };
  'control.check_failed': { control_id: string; control_name: string; category: string; remediation: string };
  'control.check_passed': { control_id: string; control_name: string; category: string };
  'control.drift_detected': { control_id: string; drift_type: string; previous_state: string; current_state: string };
  // Incidents
  'incident.created': { incident_id: string; category: string; severity: string; title: string };
  'incident.assigned': { incident_id: string; assigned_to: string };
  'incident.resolved': { incident_id: string; resolution: string; resolved_by: string };
  'incident.escalated': { incident_id: string; escalated_to: string; reason: string };
  // Evidence
  'evidence.package_generated': { package_id: string; version: number; artifact_count: number };
  'evidence.artifact_attached': { package_id: string; artifact_id: string; artifact_type: string };
  // Metrics
  'metric.kpi_recorded': { kpi_id: string; value: number; target: number; unit: string };
  'metric.threshold_breached': { kpi_id: string; value: number; threshold: number; direction: 'above' | 'below' };
  // Auth
  'auth.role_changed': { user_id: string; previous_role: UserRole; new_role: UserRole };
  'auth.step_up_required': { action: string; user_id: string };
  'team.member_added': { user_id: string; user_name: string; role: UserRole };
  'team.member_removed': { user_id: string; user_name: string; reason: string | null };
}
