/**
 * Role-assignment module — maps tasks to responsible roles and enriches
 * NextBestAction items with role and phase metadata.
 * Pure functions, no side effects.
 */

import type { UserRole, NextBestAction, ProjectStatus } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ProjectPhase =
  | 'scope_assess'
  | 'classify_govern'
  | 'approve_gate'
  | 'build_test'
  | 'evaluate_decide';

export interface RoleAssignedTask extends NextBestAction {
  assigned_roles: UserRole[];
  assigned_by?: string;
  due_date?: string;
  blocked_by?: string[];
  phase: ProjectPhase;
}

/* -------------------------------------------------------------------------- */
/*  Phase metadata                                                             */
/* -------------------------------------------------------------------------- */

export const PHASE_LABELS: Record<ProjectPhase, string> = {
  scope_assess: 'Scope & Assess',
  classify_govern: 'Classify & Govern',
  approve_gate: 'Approve & Gate',
  build_test: 'Build & Test',
  evaluate_decide: 'Evaluate & Decide',
};

export const PHASE_DESCRIPTIONS: Record<ProjectPhase, string> = {
  scope_assess:
    'Define project scope, complete intake scoring, conduct readiness assessment, and assign team members.',
  classify_govern:
    'Draft policies, classify data, map compliance controls, define RACI, and classify risks.',
  approve_gate:
    'Pass governance gates, obtain executive approval, and address any exceptions or rejections.',
  build_test:
    'Configure and validate the sandbox environment, design the pilot program, and run evaluation sprints.',
  evaluate_decide:
    'Collect metrics, calculate ROI, generate stakeholder reports, and record the go/no-go decision.',
};

/* -------------------------------------------------------------------------- */
/*  Task type definitions                                                      */
/* -------------------------------------------------------------------------- */

export type TaskTypeId =
  | 'complete_intake_scorecard'
  | 'complete_questionnaire'
  | 'review_readiness'
  | 'review_data_readiness'
  | 'complete_prerequisites'
  | 'assign_team'
  | 'draft_policies'
  | 'review_policies'
  | 'classify_data'
  | 'map_compliance'
  | 'classify_risks'
  | 'define_raci'
  | 'ethics_review'
  | 'security_controls'
  | 'threat_model'
  | 'gate_review_scope'
  | 'gate_review_security'
  | 'gate_review_pilot'
  | 'gate_review_launch'
  | 'exception_approve'
  | 'build_evidence'
  | 'configure_sandbox'
  | 'validate_sandbox'
  | 'design_pilot'
  | 'run_sprints'
  | 'tool_comparison'
  | 'collect_metrics'
  | 'outcome_analysis'
  | 'decision_brief'
  | 'executive_brief'
  | 'roi_calculation'
  | 'generate_reports'
  | 'go_no_go_decision'
  | 'stakeholder_comms'
  | 'change_management'
  | 'monitoring_setup'
  | 'agent_deployment';

/* -------------------------------------------------------------------------- */
/*  Task → Role mapping                                                        */
/* -------------------------------------------------------------------------- */

export const TASK_ROLE_MAP: Record<TaskTypeId, UserRole[]> = {
  // Phase 1 — Scope & Assess
  complete_intake_scorecard: ['admin', 'consultant'],
  complete_questionnaire: ['admin', 'consultant'],
  review_readiness: ['consultant', 'admin'],
  review_data_readiness: ['it', 'consultant'],
  complete_prerequisites: ['admin', 'consultant'],
  assign_team: ['admin'],

  // Phase 2 — Classify & Govern
  draft_policies: ['consultant', 'legal'],
  review_policies: ['legal'],
  classify_data: ['it'],
  map_compliance: ['legal', 'it'],
  classify_risks: ['consultant', 'it'],
  define_raci: ['admin', 'consultant'],
  ethics_review: ['legal', 'consultant'],
  security_controls: ['it'],
  threat_model: ['it', 'consultant'],

  // Phase 3 — Approve & Gate
  gate_review_scope: ['executive', 'admin'],
  gate_review_security: ['it', 'executive'],
  gate_review_pilot: ['executive', 'admin'],
  gate_review_launch: ['executive', 'admin'],
  exception_approve: ['executive', 'legal'],
  build_evidence: ['consultant', 'admin'],

  // Phase 4 — Build & Test
  configure_sandbox: ['it', 'engineering'],
  validate_sandbox: ['it', 'engineering'],
  design_pilot: ['engineering', 'consultant'],
  run_sprints: ['engineering'],
  tool_comparison: ['engineering', 'consultant'],

  // Phase 5 — Evaluate & Decide
  collect_metrics: ['engineering', 'consultant'],
  outcome_analysis: ['consultant', 'admin'],
  decision_brief: ['consultant', 'admin'],
  executive_brief: ['consultant', 'executive'],
  roi_calculation: ['consultant', 'executive'],
  generate_reports: ['consultant', 'admin'],
  go_no_go_decision: ['executive'],
  stakeholder_comms: ['marketing', 'consultant'],
  change_management: ['marketing', 'consultant'],
  monitoring_setup: ['it', 'engineering'],
  agent_deployment: ['it', 'engineering'],
};

/* -------------------------------------------------------------------------- */
/*  Task → Phase mapping                                                       */
/* -------------------------------------------------------------------------- */

export const TASK_PHASE_MAP: Record<TaskTypeId, ProjectPhase> = {
  complete_intake_scorecard: 'scope_assess',
  complete_questionnaire: 'scope_assess',
  review_readiness: 'scope_assess',
  review_data_readiness: 'scope_assess',
  complete_prerequisites: 'scope_assess',
  assign_team: 'scope_assess',

  draft_policies: 'classify_govern',
  review_policies: 'classify_govern',
  classify_data: 'classify_govern',
  map_compliance: 'classify_govern',
  classify_risks: 'classify_govern',
  define_raci: 'classify_govern',
  ethics_review: 'classify_govern',
  security_controls: 'classify_govern',
  threat_model: 'classify_govern',

  gate_review_scope: 'approve_gate',
  gate_review_security: 'approve_gate',
  gate_review_pilot: 'approve_gate',
  gate_review_launch: 'approve_gate',
  exception_approve: 'approve_gate',
  build_evidence: 'approve_gate',

  configure_sandbox: 'build_test',
  validate_sandbox: 'build_test',
  design_pilot: 'build_test',
  run_sprints: 'build_test',
  tool_comparison: 'build_test',

  collect_metrics: 'evaluate_decide',
  outcome_analysis: 'evaluate_decide',
  decision_brief: 'evaluate_decide',
  executive_brief: 'evaluate_decide',
  roi_calculation: 'evaluate_decide',
  generate_reports: 'evaluate_decide',
  go_no_go_decision: 'evaluate_decide',
  stakeholder_comms: 'evaluate_decide',
  change_management: 'evaluate_decide',
  monitoring_setup: 'evaluate_decide',
  agent_deployment: 'evaluate_decide',
};

/* -------------------------------------------------------------------------- */
/*  Title keywords → TaskTypeId mapping (for matching NextBestAction titles)   */
/* -------------------------------------------------------------------------- */

const TITLE_KEYWORD_MAP: [string[], TaskTypeId][] = [
  [['intake', 'scorecard'], 'complete_intake_scorecard'],
  [['questionnaire'], 'complete_questionnaire'],
  [['readiness assessment', 'readiness results'], 'review_readiness'],
  [['data readiness'], 'review_data_readiness'],
  [['prerequisite'], 'complete_prerequisites'],
  [['assign', 'team'], 'assign_team'],
  [['draft', 'policies'], 'draft_policies'],
  [['review policies', 'review_policies'], 'review_policies'],
  [['classify data', 'data assets'], 'classify_data'],
  [['compliance', 'map controls'], 'map_compliance'],
  [['classify', 'risk'], 'classify_risks'],
  [['raci'], 'define_raci'],
  [['ethics'], 'ethics_review'],
  [['security control', 'security failure'], 'security_controls'],
  [['threat model'], 'threat_model'],
  [['design review', 'scope review'], 'gate_review_scope'],
  [['security review'], 'gate_review_security'],
  [['launch review'], 'gate_review_launch'],
  [['data approval'], 'gate_review_pilot'],
  [['exception'], 'exception_approve'],
  [['evidence'], 'build_evidence'],
  [['configure sandbox', 'sandbox environment'], 'configure_sandbox'],
  [['validate sandbox'], 'validate_sandbox'],
  [['design', 'pilot'], 'design_pilot'],
  [['launch', 'pilot', 'sprint'], 'run_sprints'],
  [['tool comparison'], 'tool_comparison'],
  [['collect', 'metric', 'log metric'], 'collect_metrics'],
  [['outcome'], 'outcome_analysis'],
  [['decision brief'], 'decision_brief'],
  [['executive brief'], 'executive_brief'],
  [['roi'], 'roi_calculation'],
  [['generate', 'report'], 'generate_reports'],
  [['go/no-go', 'go-no-go', 'go_no_go'], 'go_no_go_decision'],
  [['stakeholder comm'], 'stakeholder_comms'],
  [['change management'], 'change_management'],
  [['monitoring setup'], 'monitoring_setup'],
  [['agent deployment', 'deploy agent'], 'agent_deployment'],
];

function matchTitleToTaskType(title: string): TaskTypeId | null {
  const lower = title.toLowerCase();
  for (const [keywords, taskType] of TITLE_KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return taskType;
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Public functions                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Returns all task type IDs that the given role is responsible for.
 */
export function getTasksForRole(role: UserRole): TaskTypeId[] {
  return (Object.entries(TASK_ROLE_MAP) as [TaskTypeId, UserRole[]][]).filter(
    ([, roles]) => roles.includes(role),
  ).map(([taskId]) => taskId);
}

/**
 * Returns all task type IDs that belong to the given phase.
 */
export function getTasksForPhase(phase: ProjectPhase): TaskTypeId[] {
  return (Object.entries(TASK_PHASE_MAP) as [TaskTypeId, ProjectPhase][]).filter(
    ([, p]) => p === phase,
  ).map(([taskId]) => taskId);
}

/**
 * Filters a list of NextBestAction items to only those assigned to the given
 * role, based on matching action titles to the task-role map.
 */
export function filterActionsByRole(
  actions: NextBestAction[],
  role: UserRole,
): NextBestAction[] {
  const roleTaskIds = new Set(getTasksForRole(role));

  return actions.filter((action) => {
    const taskType = matchTitleToTaskType(action.title);
    if (taskType) {
      return roleTaskIds.has(taskType);
    }
    // If we cannot match, include the action by default so nothing is lost
    return true;
  });
}

/**
 * Takes existing NextBestAction items and enriches them with role assignments
 * and phase metadata, returning RoleAssignedTask items.
 */
export function assignRolesToActions(
  actions: NextBestAction[],
): RoleAssignedTask[] {
  return actions.map((action) => {
    const taskType = matchTitleToTaskType(action.title);

    const assigned_roles: UserRole[] = taskType
      ? TASK_ROLE_MAP[taskType]
      : ['admin', 'consultant'];

    const phase: ProjectPhase = taskType
      ? TASK_PHASE_MAP[taskType]
      : inferPhaseFromCategory(action.category);

    const blocked_by: string[] = [];
    if (action.blocker) {
      // Blockers in earlier phases block later phases
      const phaseOrder: ProjectPhase[] = [
        'scope_assess',
        'classify_govern',
        'approve_gate',
        'build_test',
        'evaluate_decide',
      ];
      const currentPhaseIdx = phaseOrder.indexOf(phase);
      if (currentPhaseIdx > 0) {
        blocked_by.push(`Phase: ${PHASE_LABELS[phaseOrder[currentPhaseIdx - 1]]}`);
      }
    }

    return {
      ...action,
      assigned_roles,
      phase,
      blocked_by: blocked_by.length > 0 ? blocked_by : undefined,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

function inferPhaseFromCategory(category: string): ProjectPhase {
  switch (category) {
    case 'team':
      return 'scope_assess';
    case 'governance':
      return 'classify_govern';
    case 'security':
      return 'classify_govern';
    case 'data':
      return 'classify_govern';
    case 'review':
      return 'approve_gate';
    case 'pilot':
      return 'build_test';
    default:
      return 'scope_assess';
  }
}

/**
 * Maps a ProjectStatus to its corresponding ProjectPhase.
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
