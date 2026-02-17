/**
 * Next-actions calculator -- derives the ordered list of NextBestAction items
 * from the current project state.  Pure function, no side effects.
 */

import type {
  NextBestAction,
  ProjectStatus,
  GovernanceGateType,
  GovernanceGateDecision,
  ActionCategory,
  ActionPriority,
} from '@/types';

/* -------------------------------------------------------------------------- */
/*  Input shape                                                                */
/* -------------------------------------------------------------------------- */

export interface ProjectStateForActions {
  projectId: string;
  currentPhase: ProjectStatus;

  // Discovery
  questionnaireComplete: boolean;
  readinessScored: boolean;
  dataReadinessReviewed: boolean;
  prerequisitesComplete: boolean;

  // Governance
  policiesDrafted: boolean;
  complianceMapped: boolean;
  riskClassified: boolean;
  raciDefined: boolean;
  ethicsReviewed: boolean;

  // Gates
  gates: { gate_type: GovernanceGateType; decision: GovernanceGateDecision }[];

  // Security
  securityPassRate: number;
  criticalSecurityFailures: number;

  // Sandbox
  sandboxConfigCreated: boolean;
  sandboxValidated: boolean;

  // Pilot
  pilotDesigned: boolean;
  pilotLaunched: boolean;
  metricsCollected: boolean;

  // Data
  dataClassificationComplete: boolean;

  // Reporting
  reportsGenerated: boolean;
  roiCalculated: boolean;

  // Team
  teamAssigned: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

let actionIdCounter = 0;

function makeAction(
  fields: Omit<NextBestAction, 'id'>,
): NextBestAction {
  actionIdCounter += 1;
  return { id: `nba-${actionIdCounter}`, ...fields };
}

function gateDecision(
  gates: ProjectStateForActions['gates'],
  gateType: GovernanceGateType,
): GovernanceGateDecision {
  const gate = gates.find((g) => g.gate_type === gateType);
  return gate?.decision ?? 'pending';
}

function isGateApproved(decision: GovernanceGateDecision): boolean {
  return decision === 'approved' || decision === 'conditionally_approved';
}

/* -------------------------------------------------------------------------- */
/*  Main calculator                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Computes a prioritised list of next-best-actions for a project.
 * Actions are returned in priority order: required blockers first, then
 * recommended, then optional.
 */
export function computeNextActions(
  projectState: ProjectStateForActions,
): NextBestAction[] {
  // Reset the counter for each call so output is deterministic
  actionIdCounter = 0;

  const actions: NextBestAction[] = [];
  const p = (path: string) => `/projects/${projectState.projectId}${path}`;

  // ── Team ──────────────────────────────────────────────────────────────────
  if (!projectState.teamAssigned) {
    actions.push(
      makeAction({
        title: 'Assign project team members',
        description:
          'Add team members and assign roles so work can be delegated across gates and phases.',
        category: 'team',
        priority: 'required',
        href: p('/team'),
        cta_label: 'Manage Team',
        blocker: true,
        completed: false,
      }),
    );
  }

  // ── Discovery ─────────────────────────────────────────────────────────────
  if (!projectState.questionnaireComplete) {
    actions.push(
      makeAction({
        title: 'Complete the assessment questionnaire',
        description:
          'Answer the feasibility questionnaire to generate a readiness score and identify gaps.',
        category: 'governance',
        priority: 'required',
        href: p('/discovery/questionnaire'),
        cta_label: 'Start Questionnaire',
        blocker: true,
        completed: false,
      }),
    );
  }

  if (projectState.questionnaireComplete && !projectState.readinessScored) {
    actions.push(
      makeAction({
        title: 'Review readiness assessment results',
        description:
          'Your questionnaire is complete. Review domain scores and address recommendations.',
        category: 'governance',
        priority: 'required',
        href: p('/discovery/readiness'),
        cta_label: 'View Readiness',
        blocker: true,
        completed: false,
      }),
    );
  }

  if (!projectState.dataReadinessReviewed) {
    actions.push(
      makeAction({
        title: 'Review data readiness audit',
        description:
          'Assess data quality, availability, and governance maturity before proceeding.',
        category: 'data',
        priority: 'recommended',
        href: p('/discovery/readiness'),
        cta_label: 'Review Data',
        blocker: false,
        completed: false,
      }),
    );
  }

  if (!projectState.prerequisitesComplete) {
    actions.push(
      makeAction({
        title: 'Complete prerequisite checklist',
        description:
          'All prerequisite items must be completed before advancing past the discovery phase.',
        category: 'governance',
        priority: 'required',
        href: p('/discovery/prerequisites'),
        cta_label: 'View Checklist',
        blocker: true,
        completed: false,
      }),
    );
  }

  // ── Governance ────────────────────────────────────────────────────────────
  if (!projectState.policiesDrafted) {
    actions.push(
      makeAction({
        title: 'Draft governance policies',
        description:
          'Create your Acceptable Use Policy, Incident Response Plan, and data classification docs.',
        category: 'governance',
        priority: 'required',
        href: p('/governance/policies'),
        cta_label: 'Draft Policies',
        blocker: true,
        completed: false,
      }),
    );
  }

  if (!projectState.riskClassified) {
    actions.push(
      makeAction({
        title: 'Classify project risks',
        description:
          'Identify and tier risks so the review board can evaluate your project\'s risk posture.',
        category: 'security',
        priority: 'required',
        href: p('/governance/risk'),
        cta_label: 'Classify Risks',
        blocker: true,
        completed: false,
      }),
    );
  }

  if (!projectState.complianceMapped) {
    actions.push(
      makeAction({
        title: 'Map compliance controls',
        description:
          'Map your controls to applicable frameworks (SOC 2, HIPAA, NIST, GDPR).',
        category: 'governance',
        priority: 'recommended',
        href: p('/governance/compliance'),
        cta_label: 'Map Controls',
        blocker: false,
        completed: false,
      }),
    );
  }

  if (!projectState.raciDefined) {
    actions.push(
      makeAction({
        title: 'Define RACI matrix',
        description:
          'Assign Responsible, Accountable, Consulted, Informed roles for each governance task.',
        category: 'team',
        priority: 'recommended',
        href: p('/governance/compliance'),
        cta_label: 'Define RACI',
        blocker: false,
        completed: false,
      }),
    );
  }

  if (!projectState.ethicsReviewed) {
    actions.push(
      makeAction({
        title: 'Complete ethics review',
        description:
          'Evaluate bias risks, fairness metrics, and transparency requirements for AI usage.',
        category: 'governance',
        priority: 'recommended',
        href: p('/governance/risk'),
        cta_label: 'Review Ethics',
        blocker: false,
        completed: false,
      }),
    );
  }

  // ── Data Classification ───────────────────────────────────────────────────
  if (!projectState.dataClassificationComplete) {
    actions.push(
      makeAction({
        title: 'Classify data assets',
        description:
          'Tag data assets with classification levels and lawful basis before they flow into AI systems.',
        category: 'data',
        priority: 'required',
        href: p('/governance/policies'),
        cta_label: 'Classify Data',
        blocker: true,
        completed: false,
      }),
    );
  }

  // ── Gates ─────────────────────────────────────────────────────────────────
  const designReviewDecision = gateDecision(projectState.gates, 'design_review');
  if (!isGateApproved(designReviewDecision)) {
    const isRejected = designReviewDecision === 'rejected';
    actions.push(
      makeAction({
        title: isRejected
          ? 'Address Design Review rejection'
          : 'Submit Design Review gate',
        description: isRejected
          ? 'The design review gate was rejected. Address feedback and resubmit.'
          : 'Submit your design review artifacts for gate approval to proceed.',
        category: 'review',
        priority: 'required',
        href: p('/governance/gates'),
        cta_label: isRejected ? 'Fix & Resubmit' : 'Submit for Review',
        blocker: true,
        completed: false,
      }),
    );
  }

  const dataApprovalDecision = gateDecision(projectState.gates, 'data_approval');
  if (isGateApproved(designReviewDecision) && !isGateApproved(dataApprovalDecision)) {
    const isRejected = dataApprovalDecision === 'rejected';
    actions.push(
      makeAction({
        title: isRejected
          ? 'Address Data Approval rejection'
          : 'Submit Data Approval gate',
        description: isRejected
          ? 'Data approval was rejected. Remediate classification issues and resubmit.'
          : 'Your data classification and processing activities need formal approval.',
        category: 'review',
        priority: 'required',
        href: p('/governance/gates'),
        cta_label: isRejected ? 'Fix & Resubmit' : 'Request Approval',
        blocker: true,
        completed: false,
      }),
    );
  }

  const securityReviewDecision = gateDecision(projectState.gates, 'security_review');
  if (
    isGateApproved(dataApprovalDecision) &&
    !isGateApproved(securityReviewDecision)
  ) {
    const isRejected = securityReviewDecision === 'rejected';
    actions.push(
      makeAction({
        title: isRejected
          ? 'Address Security Review rejection'
          : 'Submit Security Review gate',
        description: isRejected
          ? 'Security review was rejected. Fix critical failures and resubmit.'
          : 'Security controls must be reviewed before launch approval.',
        category: 'security',
        priority: 'required',
        href: p('/governance/gates'),
        cta_label: isRejected ? 'Fix & Resubmit' : 'Request Review',
        blocker: true,
        completed: false,
      }),
    );
  }

  const launchReviewDecision = gateDecision(projectState.gates, 'launch_review');
  if (
    isGateApproved(securityReviewDecision) &&
    !isGateApproved(launchReviewDecision)
  ) {
    actions.push(
      makeAction({
        title: 'Submit Launch Review gate',
        description:
          'All prior gates are approved. Submit for final launch approval to go to production.',
        category: 'review',
        priority: 'required',
        href: p('/governance/gates'),
        cta_label: 'Submit Launch Review',
        blocker: true,
        completed: false,
      }),
    );
  }

  // ── Security ──────────────────────────────────────────────────────────────
  if (projectState.criticalSecurityFailures > 0) {
    actions.push(
      makeAction({
        title: `Fix ${projectState.criticalSecurityFailures} critical security failure${projectState.criticalSecurityFailures > 1 ? 's' : ''}`,
        description:
          'Critical security control checks are failing. These must be resolved before any gate can be approved.',
        category: 'security',
        priority: 'required',
        href: p('/governance/compliance'),
        cta_label: 'View Failures',
        blocker: true,
        completed: false,
      }),
    );
  }

  // ── Sandbox ───────────────────────────────────────────────────────────────
  if (!projectState.sandboxConfigCreated) {
    actions.push(
      makeAction({
        title: 'Configure sandbox environment',
        description:
          'Set up the sandbox infrastructure configuration (cloud provider, model, VPC, DLP rules).',
        category: 'security',
        priority: 'required',
        href: p('/sandbox/configure'),
        cta_label: 'Configure Sandbox',
        blocker: true,
        completed: false,
      }),
    );
  }

  if (projectState.sandboxConfigCreated && !projectState.sandboxValidated) {
    actions.push(
      makeAction({
        title: 'Validate sandbox environment',
        description:
          'Run health checks against your sandbox to confirm it meets security and infrastructure requirements.',
        category: 'security',
        priority: 'required',
        href: p('/sandbox/validate'),
        cta_label: 'Run Validation',
        blocker: true,
        completed: false,
      }),
    );
  }

  // ── Pilot ─────────────────────────────────────────────────────────────────
  if (!projectState.pilotDesigned) {
    actions.push(
      makeAction({
        title: 'Design the pilot program',
        description:
          'Define objectives, success criteria, participant selection, and sprint cadence.',
        category: 'pilot',
        priority: 'recommended',
        href: p('/poc/projects'),
        cta_label: 'Design Pilot',
        blocker: false,
        completed: false,
      }),
    );
  }

  if (projectState.pilotDesigned && !projectState.pilotLaunched) {
    actions.push(
      makeAction({
        title: 'Launch the pilot',
        description:
          'All prerequisites are met. Kick off your first pilot sprint.',
        category: 'pilot',
        priority: 'recommended',
        href: p('/poc/sprints'),
        cta_label: 'Launch Pilot',
        blocker: false,
        completed: false,
      }),
    );
  }

  if (projectState.pilotLaunched && !projectState.metricsCollected) {
    actions.push(
      makeAction({
        title: 'Collect pilot metrics',
        description:
          'Log velocity, defect rate, satisfaction, and code quality metrics for your sprints.',
        category: 'pilot',
        priority: 'required',
        href: p('/poc/metrics'),
        cta_label: 'Log Metrics',
        blocker: false,
        completed: false,
      }),
    );
  }

  // ── Reporting ─────────────────────────────────────────────────────────────
  if (!projectState.roiCalculated) {
    actions.push(
      makeAction({
        title: 'Calculate ROI projections',
        description:
          'Run ROI calculations to build the business case for stakeholder reports.',
        category: 'review',
        priority: 'recommended',
        href: p('/reports/generate'),
        cta_label: 'Calculate ROI',
        blocker: false,
        completed: false,
      }),
    );
  }

  if (!projectState.reportsGenerated) {
    actions.push(
      makeAction({
        title: 'Generate stakeholder reports',
        description:
          'Build persona-specific reports (Executive, Legal, IT/Security, Engineering, Marketing).',
        category: 'review',
        priority: 'optional',
        href: p('/reports/generate'),
        cta_label: 'Generate Reports',
        blocker: false,
        completed: false,
      }),
    );
  }

  // ── Sort by priority ──────────────────────────────────────────────────────
  const priorityOrder: Record<ActionPriority, number> = {
    required: 0,
    recommended: 1,
    optional: 2,
  };

  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actions;
}

/* -------------------------------------------------------------------------- */
/*  Demo state builder                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Returns a demo ProjectStateForActions suitable for rendering the
 * component in standalone / demo mode.
 */
export function buildDemoProjectState(projectId: string): ProjectStateForActions {
  return {
    projectId,
    currentPhase: 'governance',
    questionnaireComplete: true,
    readinessScored: true,
    dataReadinessReviewed: false,
    prerequisitesComplete: true,
    policiesDrafted: true,
    complianceMapped: false,
    riskClassified: true,
    raciDefined: false,
    ethicsReviewed: false,
    gates: [
      { gate_type: 'design_review', decision: 'approved' },
      { gate_type: 'data_approval', decision: 'pending' },
      { gate_type: 'security_review', decision: 'pending' },
      { gate_type: 'launch_review', decision: 'pending' },
    ],
    securityPassRate: 72,
    criticalSecurityFailures: 1,
    sandboxConfigCreated: true,
    sandboxValidated: false,
    pilotDesigned: true,
    pilotLaunched: false,
    metricsCollected: false,
    dataClassificationComplete: false,
    reportsGenerated: false,
    roiCalculated: false,
    teamAssigned: true,
  };
}
