/**
 * Progress calculator — computes phase-level and overall project completion
 * percentages from existing data structures. Pure functions, no side effects.
 */

export interface PhaseProgress {
  phase: string;
  label: string;
  percentage: number;
  completedItems: number;
  totalItems: number;
  status: 'not_started' | 'in_progress' | 'complete';
}

export interface ProjectProgress {
  phases: PhaseProgress[];
  overall: number;
}

interface PhaseChecks {
  [key: string]: boolean;
}

/**
 * Compute Discovery phase progress.
 * - Questionnaire completed
 * - Readiness scored
 * - Data readiness reviewed
 * - Prerequisites completed
 */
export function computeDiscoveryProgress(checks: {
  questionnaireComplete: boolean;
  readinessScored: boolean;
  dataReadinessReviewed: boolean;
  prerequisitesComplete: number; // 0-1 fraction
}): PhaseProgress {
  const items: boolean[] = [
    checks.questionnaireComplete,
    checks.readinessScored,
    checks.dataReadinessReviewed,
  ];
  const completedBool = items.filter(Boolean).length;
  const prereqWeight = Math.round(checks.prerequisitesComplete * 100) / 100;
  const completed = completedBool + prereqWeight;
  const total = items.length + 1;
  const pct = Math.round((completed / total) * 100);
  return {
    phase: 'discovery',
    label: 'Assess & Plan',
    percentage: pct,
    completedItems: Math.round(completed),
    totalItems: total,
    status: pct === 0 ? 'not_started' : pct >= 100 ? 'complete' : 'in_progress',
  };
}

/**
 * Compute Governance phase progress.
 */
export function computeGovernanceProgress(checks: {
  policiesDrafted: boolean;
  complianceMapped: boolean;
  riskClassified: boolean;
  raciDefined: boolean;
  gate1Approved: boolean;
  gate2Approved: boolean;
  ethicsReviewed: boolean;
}): PhaseProgress {
  const items = Object.values(checks);
  const completed = items.filter(Boolean).length;
  const pct = Math.round((completed / items.length) * 100);
  return {
    phase: 'governance',
    label: 'Govern & Comply',
    percentage: pct,
    completedItems: completed,
    totalItems: items.length,
    status: pct === 0 ? 'not_started' : pct >= 100 ? 'complete' : 'in_progress',
  };
}

/**
 * Compute Sandbox/Build phase progress.
 */
export function computeSandboxProgress(checks: {
  configCreated: boolean;
  sandboxValidated: boolean;
  architectureReviewed: boolean;
}): PhaseProgress {
  const items = Object.values(checks);
  const completed = items.filter(Boolean).length;
  const pct = Math.round((completed / items.length) * 100);
  return {
    phase: 'sandbox',
    label: 'Build & Test',
    percentage: pct,
    completedItems: completed,
    totalItems: items.length,
    status: pct === 0 ? 'not_started' : pct >= 100 ? 'complete' : 'in_progress',
  };
}

/**
 * Compute Pilot/PoC phase progress.
 */
export function computePilotProgress(checks: {
  pilotDesigned: boolean;
  sprintsCompleted: number;
  totalSprints: number;
  metricsCollected: boolean;
  toolComparisonDone: boolean;
}): PhaseProgress {
  const sprintProgress = checks.totalSprints > 0 ? checks.sprintsCompleted / checks.totalSprints : 0;
  const items = [
    checks.pilotDesigned ? 1 : 0,
    sprintProgress,
    checks.metricsCollected ? 1 : 0,
    checks.toolComparisonDone ? 1 : 0,
  ];
  const completed = items.reduce((a, b) => a + b, 0);
  const total = items.length;
  const pct = Math.round((completed / total) * 100);
  return {
    phase: 'pilot',
    label: 'Pilot & Evaluate',
    percentage: pct,
    completedItems: Math.round(completed),
    totalItems: total,
    status: pct === 0 ? 'not_started' : pct >= 100 ? 'complete' : 'in_progress',
  };
}

/**
 * Compute Reporting/Production readiness progress.
 */
export function computeReportingProgress(checks: {
  reportsGenerated: boolean;
  roiCalculated: boolean;
  gate3Approved: boolean;
}): PhaseProgress {
  const items = Object.values(checks);
  const completed = items.filter(Boolean).length;
  const pct = Math.round((completed / items.length) * 100);
  return {
    phase: 'reporting',
    label: 'Report & Decide',
    percentage: pct,
    completedItems: completed,
    totalItems: items.length,
    status: pct === 0 ? 'not_started' : pct >= 100 ? 'complete' : 'in_progress',
  };
}

/**
 * Compute overall project progress from phase weights.
 */
export function computeOverallProgress(phases: PhaseProgress[]): number {
  const weights: Record<string, number> = {
    discovery: 0.20,
    governance: 0.25,
    sandbox: 0.15,
    pilot: 0.25,
    reporting: 0.15,
  };
  let total = 0;
  let weightSum = 0;
  for (const phase of phases) {
    const w = weights[phase.phase] ?? 0.2;
    total += phase.percentage * w;
    weightSum += w;
  }
  return weightSum > 0 ? Math.round(total / weightSum) : 0;
}

/**
 * Build demo progress for a project.
 * Uses hardcoded checks matching the demo data state.
 */
export function buildDemoProgress(): ProjectProgress {
  const discovery = computeDiscoveryProgress({
    questionnaireComplete: true,
    readinessScored: true,
    dataReadinessReviewed: false,
    prerequisitesComplete: 0.8,
  });
  const governance = computeGovernanceProgress({
    policiesDrafted: true,
    complianceMapped: false,
    riskClassified: true,
    raciDefined: false,
    gate1Approved: true,
    gate2Approved: false,
    ethicsReviewed: false,
  });
  const sandbox = computeSandboxProgress({
    configCreated: true,
    sandboxValidated: false,
    architectureReviewed: false,
  });
  const pilot = computePilotProgress({
    pilotDesigned: true,
    sprintsCompleted: 1,
    totalSprints: 3,
    metricsCollected: false,
    toolComparisonDone: true,
  });
  const reporting = computeReportingProgress({
    reportsGenerated: false,
    roiCalculated: false,
    gate3Approved: false,
  });

  const phases = [discovery, governance, sandbox, pilot, reporting];
  const overall = computeOverallProgress(phases);

  return { phases, overall };
}
