import type { PolicyRule } from '@/types';

/**
 * Built-in policy rule categories supported by the evaluation engine.
 */
export const POLICY_RULE_CATEGORIES = [
  'data_classification',
  'data_approval',
  'gate_completion',
  'risk_assessment',
  'owner_assignment',
  'pii_handling',
  'security_baseline',
  'policy_review',
] as const;

export type PolicyRuleCategory = (typeof POLICY_RULE_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Default Policy Rules
// ---------------------------------------------------------------------------

/**
 * A comprehensive set of default policy rules covering all built-in
 * categories. These can be used as-is or customised per project/org.
 *
 * Each rule_definition carries the parameters the evaluation engine
 * inspects when running the corresponding category evaluator.
 */
export const DEFAULT_POLICY_RULES: PolicyRule[] = [
  // ── Data Classification ──────────────────────────────────────────────
  {
    id: 'rule-data-classification-001',
    project_id: null,
    organization_id: 'default',
    name: 'All data assets must be classified',
    description:
      'Every data asset in scope must have a classification level assigned (public, internal, confidential, or restricted).',
    category: 'data_classification',
    rule_definition: {
      check: 'all_classified',
      valid_classifications: ['public', 'internal', 'confidential', 'restricted'],
    },
    severity: 'high',
    enforcement_mode: 'enforce',
    applies_to: ['data_assets'],
    exceptions: [],
    version: 1,
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },

  // ── Data Approval ────────────────────────────────────────────────────
  {
    id: 'rule-data-approval-001',
    project_id: null,
    organization_id: 'default',
    name: 'Restricted data requires approval',
    description:
      'Data assets classified as restricted or confidential must have an explicit approval on record before use in AI workloads.',
    category: 'data_approval',
    rule_definition: {
      classifications_requiring_approval: ['restricted', 'confidential'],
    },
    severity: 'critical',
    enforcement_mode: 'enforce',
    applies_to: ['data_assets'],
    exceptions: [],
    version: 1,
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },

  // ── Gate Completion ──────────────────────────────────────────────────
  {
    id: 'rule-gate-completion-001',
    project_id: null,
    organization_id: 'default',
    name: 'Required governance gates must be approved',
    description:
      'All required governance gates (design review, data approval, security review, launch review) must reach an approved or conditionally-approved decision.',
    category: 'gate_completion',
    rule_definition: {
      required_gates: ['design_review', 'data_approval', 'security_review', 'launch_review'],
      accepted_decisions: ['approved', 'conditionally_approved'],
    },
    severity: 'critical',
    enforcement_mode: 'enforce',
    applies_to: ['governance_gates'],
    exceptions: [],
    version: 1,
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },

  // ── Risk Assessment ──────────────────────────────────────────────────
  {
    id: 'rule-risk-assessment-001',
    project_id: null,
    organization_id: 'default',
    name: 'High and critical risks must have mitigations and owners',
    description:
      'Every risk classified as high or critical must have a documented mitigation strategy and an assigned owner.',
    category: 'risk_assessment',
    rule_definition: {
      tiers_requiring_mitigation: ['critical', 'high'],
      require_owner: true,
    },
    severity: 'high',
    enforcement_mode: 'enforce',
    applies_to: ['risks'],
    exceptions: [],
    version: 1,
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },

  // ── Owner Assignment ─────────────────────────────────────────────────
  {
    id: 'rule-owner-assignment-001',
    project_id: null,
    organization_id: 'default',
    name: 'Project must have accountable owners',
    description:
      'The project team must include at least one member in each of the required accountable roles.',
    category: 'owner_assignment',
    rule_definition: {
      required_roles: ['admin', 'engineering', 'it'],
    },
    severity: 'medium',
    enforcement_mode: 'warn',
    applies_to: ['team_members'],
    exceptions: [],
    version: 1,
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },

  // ── PII Handling ─────────────────────────────────────────────────────
  {
    id: 'rule-pii-handling-001',
    project_id: null,
    organization_id: 'default',
    name: 'PII data must have proper controls',
    description:
      'Data assets containing PII must be classified as confidential or restricted, and must be approved before processing.',
    category: 'pii_handling',
    rule_definition: {
      require_approval: true,
      minimum_classification: ['confidential', 'restricted'],
    },
    severity: 'critical',
    enforcement_mode: 'enforce',
    applies_to: ['data_assets'],
    exceptions: [],
    version: 1,
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },

  // ── Security Baseline ────────────────────────────────────────────────
  {
    id: 'rule-security-baseline-001',
    project_id: null,
    organization_id: 'default',
    name: 'Security controls must meet minimum pass rate',
    description:
      'The overall security control pass rate must be at or above the configured threshold (default 80%).',
    category: 'security_baseline',
    rule_definition: {
      minimum_pass_rate: 80,
    },
    severity: 'high',
    enforcement_mode: 'enforce',
    applies_to: ['control_checks'],
    exceptions: [],
    version: 1,
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },

  // ── Policy Review ────────────────────────────────────────────────────
  {
    id: 'rule-policy-review-001',
    project_id: null,
    organization_id: 'default',
    name: 'All policies must be approved',
    description:
      'No governance policy should remain in draft status. All policies must reach approved status before the project can advance.',
    category: 'policy_review',
    rule_definition: {
      required_status: 'approved',
      disallowed_statuses: ['draft'],
    },
    severity: 'medium',
    enforcement_mode: 'warn',
    applies_to: ['policies'],
    exceptions: [],
    version: 1,
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },
];
