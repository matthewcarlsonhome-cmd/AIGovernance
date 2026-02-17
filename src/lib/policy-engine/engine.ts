import type {
  PolicyRule,
  PolicyEvaluationResult,
  PolicyEvaluationSummary,
  PolicyRuleSeverity,
  PolicyEnforcementMode,
} from '@/types';

// ---------------------------------------------------------------------------
// Project State — the snapshot of project data fed into the engine
// ---------------------------------------------------------------------------

export interface ProjectState {
  project_id: string;
  data_assets: {
    classification: string;
    approved: boolean;
    contains_pii: boolean;
  }[];
  governance_gates: {
    gate_type: string;
    decision: string;
  }[];
  risks: {
    tier: string;
    mitigation: string;
    owner: string | null;
  }[];
  policies: {
    status: string;
  }[];
  control_checks: {
    result: string;
  }[];
  team_members: {
    role: string;
  }[];
}

// ---------------------------------------------------------------------------
// Category Evaluator Registry
// ---------------------------------------------------------------------------

/**
 * A category evaluator is a pure function that inspects the project state
 * according to the parameters in a rule's `rule_definition` and returns
 * a partial evaluation result (passed, message, evidence, remediation).
 */
type CategoryEvaluator = (
  rule: PolicyRule,
  state: ProjectState
) => Pick<PolicyEvaluationResult, 'passed' | 'message' | 'evidence' | 'remediation'>;

const CATEGORY_EVALUATORS: Record<string, CategoryEvaluator> = {
  data_classification: evaluateDataClassification,
  data_approval: evaluateDataApproval,
  gate_completion: evaluateGateCompletion,
  risk_assessment: evaluateRiskAssessment,
  owner_assignment: evaluateOwnerAssignment,
  pii_handling: evaluatePiiHandling,
  security_baseline: evaluateSecurityBaseline,
  policy_review: evaluatePolicyReview,
};

// ---------------------------------------------------------------------------
// Main Evaluation Function
// ---------------------------------------------------------------------------

/**
 * Evaluate a list of policy rules against the current project state.
 *
 * This is a pure function with no side effects. It iterates over every
 * provided rule, dispatches to the appropriate category evaluator, and
 * aggregates the results into a `PolicyEvaluationSummary`.
 *
 * Rules with `enforcement_mode` set to `'disabled'` are skipped entirely.
 */
export function evaluatePolicies(
  rules: PolicyRule[],
  projectState: ProjectState
): PolicyEvaluationSummary {
  const results: PolicyEvaluationResult[] = [];

  for (const rule of rules) {
    if (isDisabled(rule.enforcement_mode)) {
      continue;
    }

    const evaluator = CATEGORY_EVALUATORS[rule.category];

    if (!evaluator) {
      // Unknown category — record as a warning so callers know a rule was skipped
      results.push({
        rule_id: rule.id,
        rule_name: rule.name,
        severity: 'info',
        passed: false,
        message: `Unknown rule category "${rule.category}". No evaluator registered.`,
        evidence: null,
        remediation: 'Register an evaluator for this category or correct the rule category.',
      });
      continue;
    }

    const evaluation = evaluator(rule, projectState);

    results.push({
      rule_id: rule.id,
      rule_name: rule.name,
      severity: resolveSeverity(rule.severity, rule.enforcement_mode),
      passed: evaluation.passed,
      message: evaluation.message,
      evidence: evaluation.evidence,
      remediation: evaluation.remediation,
    });
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed && r.severity !== 'info').length;
  const warnings = results.filter((r) => !r.passed && r.severity === 'info').length;

  return {
    project_id: projectState.project_id,
    total_rules: results.length,
    passed,
    failed,
    warnings,
    results,
    evaluated_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Rules in `disabled` mode are not evaluated.
 */
function isDisabled(mode: PolicyEnforcementMode): boolean {
  return mode === 'disabled';
}

/**
 * When a rule is in `warn` or `audit` mode, downgrade its effective
 * severity to `info` so consumers can distinguish hard failures from
 * advisory findings.
 */
function resolveSeverity(
  baseSeverity: PolicyRuleSeverity,
  mode: PolicyEnforcementMode
): PolicyRuleSeverity {
  if (mode === 'warn' || mode === 'audit') {
    return 'info';
  }
  return baseSeverity;
}

/**
 * Safely extract an array from a rule_definition value.
 * Returns an empty array when the key is missing or not an array.
 */
function getDefinitionArray(def: Record<string, unknown>, key: string): string[] {
  const value = def[key];
  if (Array.isArray(value)) {
    return value as string[];
  }
  return [];
}

/**
 * Safely extract a number from a rule_definition value.
 * Returns the fallback when the key is missing or not a number.
 */
function getDefinitionNumber(def: Record<string, unknown>, key: string, fallback: number): number {
  const value = def[key];
  if (typeof value === 'number') {
    return value;
  }
  return fallback;
}

/**
 * Safely extract a string from a rule_definition value.
 * Returns the fallback when the key is missing or not a string.
 */
function getDefinitionString(def: Record<string, unknown>, key: string, fallback: string): string {
  const value = def[key];
  if (typeof value === 'string') {
    return value;
  }
  return fallback;
}

/**
 * Safely extract a boolean from a rule_definition value.
 * Returns the fallback when the key is missing or not a boolean.
 */
function getDefinitionBoolean(def: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const value = def[key];
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Category Evaluators
// ---------------------------------------------------------------------------

/**
 * data_classification: Check that every data asset has a valid classification.
 *
 * rule_definition keys:
 *   - valid_classifications: string[] (accepted classification values)
 */
function evaluateDataClassification(
  rule: PolicyRule,
  state: ProjectState
): Pick<PolicyEvaluationResult, 'passed' | 'message' | 'evidence' | 'remediation'> {
  const { data_assets } = state;

  if (data_assets.length === 0) {
    return {
      passed: true,
      message: 'No data assets in scope. Rule passes vacuously.',
      evidence: '0 data assets evaluated.',
      remediation: null,
    };
  }

  const validClassifications = getDefinitionArray(rule.rule_definition, 'valid_classifications');

  const unclassified = data_assets.filter((asset) => {
    if (!asset.classification || asset.classification.trim() === '') {
      return true;
    }
    if (validClassifications.length > 0 && !validClassifications.includes(asset.classification)) {
      return true;
    }
    return false;
  });

  const total = data_assets.length;
  const classifiedCount = total - unclassified.length;

  if (unclassified.length === 0) {
    return {
      passed: true,
      message: `All ${total} data asset(s) have valid classifications.`,
      evidence: `${classifiedCount}/${total} classified.`,
      remediation: null,
    };
  }

  return {
    passed: false,
    message: `${unclassified.length} of ${total} data asset(s) lack a valid classification.`,
    evidence: `${classifiedCount}/${total} classified.`,
    remediation: 'Assign a valid classification level to all data assets before proceeding.',
  };
}

/**
 * data_approval: Check that data assets requiring approval have been approved.
 *
 * rule_definition keys:
 *   - classifications_requiring_approval: string[] (e.g., ['restricted', 'confidential'])
 */
function evaluateDataApproval(
  rule: PolicyRule,
  state: ProjectState
): Pick<PolicyEvaluationResult, 'passed' | 'message' | 'evidence' | 'remediation'> {
  const { data_assets } = state;
  const requireApproval = getDefinitionArray(rule.rule_definition, 'classifications_requiring_approval');

  const assetsNeedingApproval = data_assets.filter((asset) =>
    requireApproval.includes(asset.classification)
  );

  if (assetsNeedingApproval.length === 0) {
    return {
      passed: true,
      message: 'No data assets require approval based on their classification.',
      evidence: `0 assets matched classifications: ${requireApproval.join(', ')}.`,
      remediation: null,
    };
  }

  const unapproved = assetsNeedingApproval.filter((asset) => !asset.approved);

  if (unapproved.length === 0) {
    return {
      passed: true,
      message: `All ${assetsNeedingApproval.length} data asset(s) requiring approval have been approved.`,
      evidence: `${assetsNeedingApproval.length}/${assetsNeedingApproval.length} approved.`,
      remediation: null,
    };
  }

  return {
    passed: false,
    message: `${unapproved.length} of ${assetsNeedingApproval.length} data asset(s) classified as ${requireApproval.join('/')} are not approved.`,
    evidence: `${assetsNeedingApproval.length - unapproved.length}/${assetsNeedingApproval.length} approved.`,
    remediation: 'Obtain data owner approval for all restricted and confidential data assets.',
  };
}

/**
 * gate_completion: Check that all required governance gates have acceptable decisions.
 *
 * rule_definition keys:
 *   - required_gates: string[] (gate types that must exist)
 *   - accepted_decisions: string[] (decisions considered passing)
 */
function evaluateGateCompletion(
  rule: PolicyRule,
  state: ProjectState
): Pick<PolicyEvaluationResult, 'passed' | 'message' | 'evidence' | 'remediation'> {
  const { governance_gates } = state;
  const requiredGates = getDefinitionArray(rule.rule_definition, 'required_gates');
  const acceptedDecisions = getDefinitionArray(rule.rule_definition, 'accepted_decisions');

  if (requiredGates.length === 0) {
    return {
      passed: true,
      message: 'No required gates defined. Rule passes vacuously.',
      evidence: 'required_gates is empty.',
      remediation: null,
    };
  }

  const gateMap = new Map<string, string>();
  for (const gate of governance_gates) {
    gateMap.set(gate.gate_type, gate.decision);
  }

  const missingGates: string[] = [];
  const unapprovedGates: string[] = [];

  for (const gateType of requiredGates) {
    const decision = gateMap.get(gateType);
    if (decision === undefined) {
      missingGates.push(gateType);
    } else if (!acceptedDecisions.includes(decision)) {
      unapprovedGates.push(`${gateType} (${decision})`);
    }
  }

  const issues = [...missingGates.map((g) => `${g} (missing)`), ...unapprovedGates];

  if (issues.length === 0) {
    return {
      passed: true,
      message: `All ${requiredGates.length} required gate(s) have acceptable decisions.`,
      evidence: `Gates checked: ${requiredGates.join(', ')}. All passed.`,
      remediation: null,
    };
  }

  return {
    passed: false,
    message: `${issues.length} of ${requiredGates.length} required gate(s) are incomplete or not approved.`,
    evidence: `Issues: ${issues.join('; ')}.`,
    remediation: 'Complete and obtain approval for all required governance gates before proceeding.',
  };
}

/**
 * risk_assessment: Check that high/critical risks have mitigations and owners.
 *
 * rule_definition keys:
 *   - tiers_requiring_mitigation: string[] (e.g., ['critical', 'high'])
 *   - require_owner: boolean
 */
function evaluateRiskAssessment(
  rule: PolicyRule,
  state: ProjectState
): Pick<PolicyEvaluationResult, 'passed' | 'message' | 'evidence' | 'remediation'> {
  const { risks } = state;
  const tiersRequiringMitigation = getDefinitionArray(rule.rule_definition, 'tiers_requiring_mitigation');
  const requireOwner = getDefinitionBoolean(rule.rule_definition, 'require_owner', false);

  const targetRisks = risks.filter((risk) => tiersRequiringMitigation.includes(risk.tier));

  if (targetRisks.length === 0) {
    return {
      passed: true,
      message: `No risks at tier(s) ${tiersRequiringMitigation.join(', ')} found.`,
      evidence: `0 risks matched.`,
      remediation: null,
    };
  }

  const missingMitigation = targetRisks.filter(
    (risk) => !risk.mitigation || risk.mitigation.trim() === ''
  );
  const missingOwner = requireOwner
    ? targetRisks.filter((risk) => !risk.owner || risk.owner.trim() === '')
    : [];

  const totalIssues = missingMitigation.length + missingOwner.length;

  if (totalIssues === 0) {
    return {
      passed: true,
      message: `All ${targetRisks.length} high/critical risk(s) have mitigations${requireOwner ? ' and owners' : ''}.`,
      evidence: `${targetRisks.length} risks checked.`,
      remediation: null,
    };
  }

  const parts: string[] = [];
  if (missingMitigation.length > 0) {
    parts.push(`${missingMitigation.length} missing mitigation`);
  }
  if (missingOwner.length > 0) {
    parts.push(`${missingOwner.length} missing owner`);
  }

  return {
    passed: false,
    message: `${targetRisks.length} high/critical risk(s) found: ${parts.join(', ')}.`,
    evidence: `${targetRisks.length} risks at tier(s) ${tiersRequiringMitigation.join(', ')}.`,
    remediation: 'Document mitigation strategies and assign owners for all high and critical risks.',
  };
}

/**
 * owner_assignment: Check that the project team includes members with all
 * required accountable roles.
 *
 * rule_definition keys:
 *   - required_roles: string[] (roles that must be represented on the team)
 */
function evaluateOwnerAssignment(
  rule: PolicyRule,
  state: ProjectState
): Pick<PolicyEvaluationResult, 'passed' | 'message' | 'evidence' | 'remediation'> {
  const { team_members } = state;
  const requiredRoles = getDefinitionArray(rule.rule_definition, 'required_roles');

  if (requiredRoles.length === 0) {
    return {
      passed: true,
      message: 'No required roles defined. Rule passes vacuously.',
      evidence: 'required_roles is empty.',
      remediation: null,
    };
  }

  const presentRoles = new Set(team_members.map((m) => m.role));
  const missingRoles = requiredRoles.filter((role) => !presentRoles.has(role));

  if (missingRoles.length === 0) {
    return {
      passed: true,
      message: `All ${requiredRoles.length} required role(s) are represented on the team.`,
      evidence: `Roles present: ${[...presentRoles].join(', ')}.`,
      remediation: null,
    };
  }

  return {
    passed: false,
    message: `${missingRoles.length} required role(s) missing from the team: ${missingRoles.join(', ')}.`,
    evidence: `Roles present: ${[...presentRoles].join(', ')}. Missing: ${missingRoles.join(', ')}.`,
    remediation: 'Assign team members to fill the missing accountable roles.',
  };
}

/**
 * pii_handling: Check that data assets containing PII have proper controls.
 *
 * rule_definition keys:
 *   - require_approval: boolean
 *   - minimum_classification: string[] (PII assets must have one of these classifications)
 */
function evaluatePiiHandling(
  rule: PolicyRule,
  state: ProjectState
): Pick<PolicyEvaluationResult, 'passed' | 'message' | 'evidence' | 'remediation'> {
  const { data_assets } = state;
  const requireApproval = getDefinitionBoolean(rule.rule_definition, 'require_approval', true);
  const minimumClassifications = getDefinitionArray(rule.rule_definition, 'minimum_classification');

  const piiAssets = data_assets.filter((asset) => asset.contains_pii);

  if (piiAssets.length === 0) {
    return {
      passed: true,
      message: 'No data assets contain PII. Rule passes vacuously.',
      evidence: '0 PII assets found.',
      remediation: null,
    };
  }

  const issues: string[] = [];

  // Check classification
  if (minimumClassifications.length > 0) {
    const badClassification = piiAssets.filter(
      (asset) => !minimumClassifications.includes(asset.classification)
    );
    if (badClassification.length > 0) {
      issues.push(
        `${badClassification.length} PII asset(s) not classified as ${minimumClassifications.join('/')}`
      );
    }
  }

  // Check approval
  if (requireApproval) {
    const unapproved = piiAssets.filter((asset) => !asset.approved);
    if (unapproved.length > 0) {
      issues.push(`${unapproved.length} PII asset(s) not approved`);
    }
  }

  if (issues.length === 0) {
    return {
      passed: true,
      message: `All ${piiAssets.length} PII-containing data asset(s) have proper controls.`,
      evidence: `${piiAssets.length} PII assets checked.`,
      remediation: null,
    };
  }

  return {
    passed: false,
    message: `PII control violations: ${issues.join('; ')}.`,
    evidence: `${piiAssets.length} PII assets evaluated.`,
    remediation:
      'Ensure all PII data assets are classified as confidential or restricted and have data owner approval.',
  };
}

/**
 * security_baseline: Check that security controls achieve a minimum pass rate.
 *
 * rule_definition keys:
 *   - minimum_pass_rate: number (0-100, percentage threshold)
 */
function evaluateSecurityBaseline(
  rule: PolicyRule,
  state: ProjectState
): Pick<PolicyEvaluationResult, 'passed' | 'message' | 'evidence' | 'remediation'> {
  const { control_checks } = state;
  const minimumPassRate = getDefinitionNumber(rule.rule_definition, 'minimum_pass_rate', 80);

  if (control_checks.length === 0) {
    return {
      passed: false,
      message: 'No security control checks found. Cannot determine baseline compliance.',
      evidence: '0 control checks evaluated.',
      remediation: 'Run the security control check suite to establish a baseline.',
    };
  }

  // Count applicable checks (exclude 'not_applicable')
  const applicableChecks = control_checks.filter((c) => c.result !== 'not_applicable');

  if (applicableChecks.length === 0) {
    return {
      passed: true,
      message: 'All control checks are marked not applicable.',
      evidence: `${control_checks.length} checks, all not_applicable.`,
      remediation: null,
    };
  }

  const passedChecks = applicableChecks.filter((c) => c.result === 'pass');
  const passRate = Math.round((passedChecks.length / applicableChecks.length) * 100);

  if (passRate >= minimumPassRate) {
    return {
      passed: true,
      message: `Security control pass rate is ${passRate}% (threshold: ${minimumPassRate}%).`,
      evidence: `${passedChecks.length}/${applicableChecks.length} controls passed.`,
      remediation: null,
    };
  }

  return {
    passed: false,
    message: `Security control pass rate is ${passRate}%, below the ${minimumPassRate}% threshold.`,
    evidence: `${passedChecks.length}/${applicableChecks.length} controls passed.`,
    remediation: `Remediate failing security controls to achieve at least a ${minimumPassRate}% pass rate.`,
  };
}

/**
 * policy_review: Check that all policies meet the required approval status.
 *
 * rule_definition keys:
 *   - required_status: string (the status policies should have, e.g., 'approved')
 *   - disallowed_statuses: string[] (statuses that trigger a failure, e.g., ['draft'])
 */
function evaluatePolicyReview(
  rule: PolicyRule,
  state: ProjectState
): Pick<PolicyEvaluationResult, 'passed' | 'message' | 'evidence' | 'remediation'> {
  const { policies } = state;
  const requiredStatus = getDefinitionString(rule.rule_definition, 'required_status', 'approved');
  const disallowedStatuses = getDefinitionArray(rule.rule_definition, 'disallowed_statuses');

  if (policies.length === 0) {
    return {
      passed: false,
      message: 'No policies found. At least one approved policy is expected.',
      evidence: '0 policies evaluated.',
      remediation: 'Create and approve the required governance policies.',
    };
  }

  const violatingPolicies = policies.filter((policy) => {
    // Fail if the policy has a disallowed status
    if (disallowedStatuses.length > 0 && disallowedStatuses.includes(policy.status)) {
      return true;
    }
    // Fail if the policy does not have the required status
    if (policy.status !== requiredStatus) {
      return true;
    }
    return false;
  });

  if (violatingPolicies.length === 0) {
    return {
      passed: true,
      message: `All ${policies.length} policy/policies have the required "${requiredStatus}" status.`,
      evidence: `${policies.length}/${policies.length} policies are ${requiredStatus}.`,
      remediation: null,
    };
  }

  return {
    passed: false,
    message: `${violatingPolicies.length} of ${policies.length} policy/policies do not have "${requiredStatus}" status.`,
    evidence: `${policies.length - violatingPolicies.length}/${policies.length} policies are ${requiredStatus}.`,
    remediation: `Review and approve all draft or in-review policies to achieve "${requiredStatus}" status.`,
  };
}
