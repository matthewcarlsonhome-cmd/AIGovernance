/**
 * Phase-gating module — tracks phase completion and controls phase progression.
 * Evaluates exit criteria per phase and determines if a project can advance.
 * Pure functions, no side effects.
 */

import type { UserRole, ProjectStatus } from '@/types';
import type { ProjectStateForActions } from '@/lib/progress/next-actions';
import type { ProjectPhase } from '@/lib/tasks/role-assignment';
import { PHASE_LABELS } from '@/lib/tasks/role-assignment';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface PhaseCriterion {
  id: string;
  label: string;
  description: string;
  check: (state: ProjectStateForActions) => boolean;
  required: boolean;
  assigned_roles: UserRole[];
}

export interface PhaseExitCriteria {
  phase: ProjectPhase;
  criteria: PhaseCriterion[];
}

export interface PhaseStatus {
  phase: ProjectPhase;
  status: 'locked' | 'active' | 'complete';
  completedAt?: string;
  criteria_met: number;
  criteria_total: number;
  percentage: number;
  blockers: string[];
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function isGateApprovedByType(
  gates: ProjectStateForActions['gates'],
  gateType: string,
): boolean {
  const gate = gates.find((g) => g.gate_type === gateType);
  return gate?.decision === 'approved' || gate?.decision === 'conditionally_approved';
}

/* -------------------------------------------------------------------------- */
/*  Phase order                                                                */
/* -------------------------------------------------------------------------- */

const PHASE_ORDER: ProjectPhase[] = [
  'scope_assess',
  'classify_govern',
  'approve_gate',
  'build_test',
  'evaluate_decide',
];

/* -------------------------------------------------------------------------- */
/*  Exit criteria definitions                                                  */
/* -------------------------------------------------------------------------- */

export const PHASE_EXIT_CRITERIA: PhaseExitCriteria[] = [
  // Phase 1 — Scope & Assess
  {
    phase: 'scope_assess',
    criteria: [
      {
        id: 'p1_questionnaire',
        label: 'Intake scored',
        description: 'Complete the assessment questionnaire and receive a readiness score.',
        check: (s) => s.questionnaireComplete,
        required: true,
        assigned_roles: ['admin', 'consultant'],
      },
      {
        id: 'p1_readiness',
        label: 'Readiness assessed',
        description: 'Review and acknowledge the readiness assessment results.',
        check: (s) => s.readinessScored,
        required: true,
        assigned_roles: ['consultant', 'admin'],
      },
      {
        id: 'p1_team',
        label: 'Team assigned',
        description: 'Assign team members with appropriate roles to the project.',
        check: (s) => s.teamAssigned,
        required: true,
        assigned_roles: ['admin'],
      },
      {
        id: 'p1_prerequisites',
        label: 'Prerequisites started',
        description: 'Begin working through the prerequisite checklist items.',
        check: (s) => s.prerequisitesComplete,
        required: false,
        assigned_roles: ['admin', 'consultant'],
      },
    ],
  },

  // Phase 2 — Classify & Govern
  {
    phase: 'classify_govern',
    criteria: [
      {
        id: 'p2_policies',
        label: 'Policies drafted',
        description: 'Draft Acceptable Use Policy, Incident Response Plan, and data classification documents.',
        check: (s) => s.policiesDrafted,
        required: true,
        assigned_roles: ['consultant', 'legal'],
      },
      {
        id: 'p2_compliance',
        label: 'Compliance mapped',
        description: 'Map controls to applicable compliance frameworks (SOC 2, HIPAA, NIST, GDPR).',
        check: (s) => s.complianceMapped,
        required: true,
        assigned_roles: ['legal', 'it'],
      },
      {
        id: 'p2_risk',
        label: 'Risks classified',
        description: 'Identify, classify, and tier all project risks.',
        check: (s) => s.riskClassified,
        required: true,
        assigned_roles: ['consultant', 'it'],
      },
      {
        id: 'p2_data',
        label: 'Data classified',
        description: 'Tag all data assets with classification levels and lawful basis.',
        check: (s) => s.dataClassificationComplete,
        required: true,
        assigned_roles: ['it'],
      },
      {
        id: 'p2_raci',
        label: 'RACI defined',
        description: 'Assign Responsible, Accountable, Consulted, Informed roles for governance tasks.',
        check: (s) => s.raciDefined,
        required: false,
        assigned_roles: ['admin', 'consultant'],
      },
    ],
  },

  // Phase 3 — Approve & Gate
  {
    phase: 'approve_gate',
    criteria: [
      {
        id: 'p3_design_review',
        label: 'Design Review gate passed',
        description: 'Submit and pass the design review governance gate.',
        check: (s) => isGateApprovedByType(s.gates, 'design_review'),
        required: true,
        assigned_roles: ['executive', 'admin'],
      },
      {
        id: 'p3_data_approval',
        label: 'Data Approval gate passed',
        description: 'Submit and pass the data approval governance gate.',
        check: (s) => isGateApprovedByType(s.gates, 'data_approval'),
        required: true,
        assigned_roles: ['executive', 'admin'],
      },
      {
        id: 'p3_security_review',
        label: 'Security Review gate passed',
        description: 'Submit and pass the security review governance gate.',
        check: (s) => isGateApprovedByType(s.gates, 'security_review'),
        required: true,
        assigned_roles: ['it', 'executive'],
      },
      {
        id: 'p3_no_critical_failures',
        label: 'No critical security failures',
        description: 'All critical security control checks must pass.',
        check: (s) => s.criticalSecurityFailures === 0,
        required: true,
        assigned_roles: ['it'],
      },
    ],
  },

  // Phase 4 — Build & Test
  {
    phase: 'build_test',
    criteria: [
      {
        id: 'p4_sandbox_config',
        label: 'Sandbox configured',
        description: 'Create the sandbox infrastructure configuration.',
        check: (s) => s.sandboxConfigCreated,
        required: true,
        assigned_roles: ['it', 'engineering'],
      },
      {
        id: 'p4_sandbox_validated',
        label: 'Sandbox validated',
        description: 'Run health checks to confirm sandbox meets requirements.',
        check: (s) => s.sandboxValidated,
        required: true,
        assigned_roles: ['it', 'engineering'],
      },
      {
        id: 'p4_pilot_designed',
        label: 'Pilot designed',
        description: 'Define objectives, success criteria, and sprint cadence.',
        check: (s) => s.pilotDesigned,
        required: true,
        assigned_roles: ['engineering', 'consultant'],
      },
      {
        id: 'p4_pilot_launched',
        label: 'Pilot launched',
        description: 'Kick off the first pilot sprint with participants.',
        check: (s) => s.pilotLaunched,
        required: true,
        assigned_roles: ['engineering'],
      },
    ],
  },

  // Phase 5 — Evaluate & Decide
  {
    phase: 'evaluate_decide',
    criteria: [
      {
        id: 'p5_metrics',
        label: 'Metrics collected',
        description: 'Log velocity, defect rate, satisfaction, and code quality metrics.',
        check: (s) => s.metricsCollected,
        required: true,
        assigned_roles: ['engineering', 'consultant'],
      },
      {
        id: 'p5_roi',
        label: 'ROI calculated',
        description: 'Complete ROI projections and business case analysis.',
        check: (s) => s.roiCalculated,
        required: true,
        assigned_roles: ['consultant', 'executive'],
      },
      {
        id: 'p5_reports',
        label: 'Reports generated',
        description: 'Generate persona-specific stakeholder reports.',
        check: (s) => s.reportsGenerated,
        required: true,
        assigned_roles: ['consultant', 'admin'],
      },
      {
        id: 'p5_launch_gate',
        label: 'Decision recorded',
        description: 'Complete the launch review gate with a go/no-go decision.',
        check: (s) => isGateApprovedByType(s.gates, 'launch_review'),
        required: true,
        assigned_roles: ['executive'],
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Public functions                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Evaluate the status of a single phase against the project state.
 */
export function evaluatePhaseStatus(
  phase: ProjectPhase,
  state: ProjectStateForActions,
): PhaseStatus {
  const exitCriteria = PHASE_EXIT_CRITERIA.find((ec) => ec.phase === phase);
  if (!exitCriteria) {
    return {
      phase,
      status: 'locked',
      criteria_met: 0,
      criteria_total: 0,
      percentage: 0,
      blockers: [],
    };
  }

  const criteria_total = exitCriteria.criteria.length;
  let criteria_met = 0;
  const blockers: string[] = [];

  for (const criterion of exitCriteria.criteria) {
    const passed = criterion.check(state);
    if (passed) {
      criteria_met += 1;
    } else if (criterion.required) {
      blockers.push(criterion.label);
    }
  }

  const percentage = criteria_total > 0
    ? Math.round((criteria_met / criteria_total) * 100)
    : 0;

  // Determine status based on whether earlier phases are complete
  const phaseIdx = PHASE_ORDER.indexOf(phase);
  let status: PhaseStatus['status'] = 'active';

  if (criteria_met === criteria_total) {
    status = 'complete';
  } else if (phaseIdx > 0) {
    // Check if the previous phase is complete
    const prevPhase = PHASE_ORDER[phaseIdx - 1];
    const prevStatus = evaluatePhaseCriteriaMet(prevPhase, state);
    if (!prevStatus.allRequiredMet) {
      status = 'locked';
    }
  }

  return {
    phase,
    status,
    completedAt: status === 'complete' ? new Date().toISOString() : undefined,
    criteria_met,
    criteria_total,
    percentage,
    blockers,
  };
}

/**
 * Evaluate the status of all 5 phases.
 */
export function evaluateAllPhases(
  state: ProjectStateForActions,
): PhaseStatus[] {
  return PHASE_ORDER.map((phase) => evaluatePhaseStatus(phase, state));
}

/**
 * Determine which phase is currently active for the project.
 * Returns the first phase that is not yet complete.
 */
export function getActivePhase(
  state: ProjectStateForActions,
): ProjectPhase {
  for (const phase of PHASE_ORDER) {
    const status = evaluatePhaseStatus(phase, state);
    if (status.status !== 'complete') {
      return phase;
    }
  }
  // All phases complete
  return 'evaluate_decide';
}

/**
 * Check if the project can advance past the given phase.
 * Returns whether advancement is possible and any blocking criteria.
 */
export function canAdvancePhase(
  current: ProjectPhase,
  state: ProjectStateForActions,
): { canAdvance: boolean; blockers: string[] } {
  const exitCriteria = PHASE_EXIT_CRITERIA.find((ec) => ec.phase === current);
  if (!exitCriteria) {
    return { canAdvance: true, blockers: [] };
  }

  const blockers: string[] = [];
  for (const criterion of exitCriteria.criteria) {
    if (criterion.required && !criterion.check(state)) {
      blockers.push(criterion.label);
    }
  }

  return {
    canAdvance: blockers.length === 0,
    blockers,
  };
}

/**
 * Maps an existing ProjectStatus (the 7-value enum) to the new 5-phase model.
 */
export function getPhaseForProjectStatus(status: ProjectStatus): ProjectPhase {
  switch (status) {
    case 'discovery':
      return 'scope_assess';
    case 'governance':
      return 'classify_govern';
    case 'sandbox':
      return 'approve_gate';
    case 'pilot':
      return 'build_test';
    case 'evaluation':
      return 'evaluate_decide';
    case 'production':
      return 'evaluate_decide';
    case 'completed':
      return 'evaluate_decide';
    default:
      return 'scope_assess';
  }
}

/* -------------------------------------------------------------------------- */
/*  Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

function evaluatePhaseCriteriaMet(
  phase: ProjectPhase,
  state: ProjectStateForActions,
): { allRequiredMet: boolean } {
  const exitCriteria = PHASE_EXIT_CRITERIA.find((ec) => ec.phase === phase);
  if (!exitCriteria) {
    return { allRequiredMet: true };
  }

  const allRequiredMet = exitCriteria.criteria
    .filter((c) => c.required)
    .every((c) => c.check(state));

  return { allRequiredMet };
}
