// Workflow Mapping Matrix (Design Doc v3 §5.2, Phase 0)
// Maps every page to a canonical workflow step to ensure clarity of purpose.

import type { WorkflowMapping, CanonicalWorkflowStep } from '@/types';

export const CANONICAL_WORKFLOW: { step: CanonicalWorkflowStep; label: string; description: string }[] = [
  { step: 'scope', label: 'Scope', description: 'Define pilot objectives, stakeholders, KPI targets, and success criteria' },
  { step: 'classify', label: 'Classify', description: 'Classify data assets, risk tiers, and compliance requirements' },
  { step: 'control_check', label: 'Control Check', description: 'Verify security controls, run automated checks, document evidence' },
  { step: 'approve', label: 'Approve', description: 'Gate reviews with role-based sign-offs and evidence checklists' },
  { step: 'execute', label: 'Execute', description: 'Run pilot, track milestones, collect metrics, manage sprints' },
  { step: 'decide', label: 'Decide', description: 'Evaluate outcomes, generate decision brief, finalize go/no-go' },
];

export const WORKFLOW_MAPPINGS: WorkflowMapping[] = [
  // ── Plan Workspace (Scope) ──
  { page_route: '/projects/[id]/plan', page_title: 'Plan Workspace', workflow_step: 'scope', workspace: 'plan', decision_supported: 'Define pilot scope and objectives', status: 'keep' },
  { page_route: '/projects/[id]/discovery/questionnaire', page_title: 'Assessment Questionnaire', workflow_step: 'scope', workspace: 'plan', decision_supported: 'Evaluate organizational readiness', status: 'keep' },
  { page_route: '/projects/[id]/discovery/readiness', page_title: 'Readiness Dashboard', workflow_step: 'scope', workspace: 'plan', decision_supported: 'Review feasibility scores by domain', status: 'keep' },
  { page_route: '/projects/[id]/discovery/prerequisites', page_title: 'Prerequisites Checklist', workflow_step: 'scope', workspace: 'plan', decision_supported: 'Track prerequisite completion', status: 'keep' },
  { page_route: '/projects/[id]/team', page_title: 'Team Management', workflow_step: 'scope', workspace: 'plan', decision_supported: 'Assign roles and responsibilities', status: 'keep' },
  { page_route: '/projects/[id]/pilot-setup', page_title: 'Pilot Setup Wizard', workflow_step: 'scope', workspace: 'plan', decision_supported: 'Configure pilot parameters', status: 'keep' },

  // ── Govern Workspace (Classify + Control Check + Approve) ──
  { page_route: '/projects/[id]/govern', page_title: 'Govern Workspace', workflow_step: 'classify', workspace: 'govern', decision_supported: 'Governance control center', status: 'keep' },
  { page_route: '/projects/[id]/governance/policies', page_title: 'Policy Editor', workflow_step: 'classify', workspace: 'govern', decision_supported: 'Draft and approve governance policies', status: 'keep' },
  { page_route: '/projects/[id]/governance/risk', page_title: 'Risk Manager', workflow_step: 'classify', workspace: 'govern', decision_supported: 'Classify and tier project risks', status: 'keep' },
  { page_route: '/projects/[id]/governance/data-classification', page_title: 'Data Classification', workflow_step: 'classify', workspace: 'govern', decision_supported: 'Classify data assets and processing activities', status: 'keep' },
  { page_route: '/projects/[id]/governance/compliance', page_title: 'Compliance Mapping', workflow_step: 'control_check', workspace: 'govern', decision_supported: 'Map controls to compliance frameworks', status: 'keep' },
  { page_route: '/projects/[id]/governance/security-controls', page_title: 'Security Controls', workflow_step: 'control_check', workspace: 'govern', decision_supported: 'Run and track security control checks', status: 'keep' },
  { page_route: '/projects/[id]/governance/gates', page_title: 'Gate Reviews', workflow_step: 'approve', workspace: 'govern', decision_supported: 'Submit and approve governance gates', status: 'keep' },
  { page_route: '/projects/[id]/governance/ethics', page_title: 'Ethics Review', workflow_step: 'classify', workspace: 'govern', decision_supported: 'Evaluate bias and fairness risks', status: 'keep' },
  { page_route: '/projects/[id]/governance/raci', page_title: 'RACI Matrix', workflow_step: 'scope', workspace: 'govern', decision_supported: 'Define accountability assignments', status: 'consolidate', consolidate_into: '/projects/[id]/team' },
  { page_route: '/projects/[id]/governance/data-flows', page_title: 'Data Flows', workflow_step: 'classify', workspace: 'govern', decision_supported: 'Map data flow and risk points', status: 'consolidate', consolidate_into: '/projects/[id]/governance/data-classification' },
  { page_route: '/projects/[id]/governance/playbook', page_title: 'AI Usage Playbook', workflow_step: 'classify', workspace: 'govern', decision_supported: 'Define approved AI usage rules', status: 'consolidate', consolidate_into: '/projects/[id]/governance/policies' },

  // ── Execute Workspace ──
  { page_route: '/projects/[id]/execute', page_title: 'Execute Workspace', workflow_step: 'execute', workspace: 'execute', decision_supported: 'Execution board and milestone tracking', status: 'keep' },
  { page_route: '/projects/[id]/sandbox/configure', page_title: 'Sandbox Config', workflow_step: 'execute', workspace: 'execute', decision_supported: 'Configure sandbox infrastructure', status: 'keep' },
  { page_route: '/projects/[id]/sandbox/validate', page_title: 'Sandbox Validation', workflow_step: 'control_check', workspace: 'execute', decision_supported: 'Validate sandbox health', status: 'keep' },
  { page_route: '/projects/[id]/poc/projects', page_title: 'PoC Projects', workflow_step: 'execute', workspace: 'execute', decision_supported: 'Define and track proof-of-concept projects', status: 'keep' },
  { page_route: '/projects/[id]/poc/sprints', page_title: 'Sprint Tracker', workflow_step: 'execute', workspace: 'execute', decision_supported: 'Track sprint progress and velocity', status: 'keep' },
  { page_route: '/projects/[id]/poc/metrics', page_title: 'Pilot Metrics', workflow_step: 'execute', workspace: 'execute', decision_supported: 'Collect baseline vs AI-assisted metrics', status: 'keep' },
  { page_route: '/projects/[id]/timeline/gantt', page_title: 'Gantt Chart', workflow_step: 'execute', workspace: 'execute', decision_supported: 'Visual timeline with dependencies', status: 'keep' },
  { page_route: '/projects/[id]/timeline/milestones', page_title: 'Milestones', workflow_step: 'execute', workspace: 'execute', decision_supported: 'Track key milestone dates', status: 'consolidate', consolidate_into: '/projects/[id]/timeline/gantt' },
  { page_route: '/projects/[id]/monitoring', page_title: 'AI Monitoring', workflow_step: 'execute', workspace: 'execute', decision_supported: 'Monitor AI system performance', status: 'keep' },

  // ── Decide Workspace ──
  { page_route: '/projects/[id]/decide', page_title: 'Decide Workspace', workflow_step: 'decide', workspace: 'decide', decision_supported: 'Decision evidence and recommendation', status: 'keep' },
  { page_route: '/projects/[id]/reports/generate', page_title: 'Report Generator', workflow_step: 'decide', workspace: 'decide', decision_supported: 'Generate stakeholder-specific reports', status: 'keep' },
  { page_route: '/projects/[id]/reports/evidence', page_title: 'Evidence Packages', workflow_step: 'decide', workspace: 'decide', decision_supported: 'Bundle governance evidence for audit', status: 'keep' },
  { page_route: '/projects/[id]/roi', page_title: 'ROI Calculator', workflow_step: 'decide', workspace: 'decide', decision_supported: 'Calculate and present business value', status: 'keep' },
  { page_route: '/projects/[id]/metrics', page_title: 'KPI Dashboard', workflow_step: 'decide', workspace: 'decide', decision_supported: 'Track outcome metrics vs targets', status: 'keep' },
  { page_route: '/projects/[id]/poc/compare', page_title: 'Tool Comparison', workflow_step: 'decide', workspace: 'decide', decision_supported: 'Compare AI tool evaluations', status: 'consolidate', consolidate_into: '/projects/[id]/decide' },
  { page_route: '/projects/[id]/reports/history', page_title: 'Report History', workflow_step: 'decide', workspace: 'decide', decision_supported: 'View previously generated reports', status: 'consolidate', consolidate_into: '/projects/[id]/reports/generate' },
];

export function getWorkflowStep(route: string): CanonicalWorkflowStep | null {
  const mapping = WORKFLOW_MAPPINGS.find((m) => m.page_route === route);
  return mapping?.workflow_step ?? null;
}

export function getPagesByWorkspace(workspace: WorkflowMapping['workspace']): WorkflowMapping[] {
  return WORKFLOW_MAPPINGS.filter((m) => m.workspace === workspace && m.status === 'keep');
}

export function getConsolidationTargets(): WorkflowMapping[] {
  return WORKFLOW_MAPPINGS.filter((m) => m.status === 'consolidate');
}

export function getWorkflowCompletionForStep(
  step: CanonicalWorkflowStep,
  completedRoutes: string[],
): { total: number; completed: number; percentage: number } {
  const stepPages = WORKFLOW_MAPPINGS.filter((m) => m.workflow_step === step && m.status === 'keep');
  const completed = stepPages.filter((m) => completedRoutes.includes(m.page_route)).length;
  return {
    total: stepPages.length,
    completed,
    percentage: stepPages.length > 0 ? Math.round((completed / stepPages.length) * 100) : 0,
  };
}
