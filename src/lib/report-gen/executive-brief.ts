// Executive Decision Brief Generator (Redesign §11.1)
// Auto-generates a single-page go/no-go recommendation from project state.

import type { ExecutiveDecisionBrief } from '@/types';
import type { ProjectKpiSummary } from '@/lib/metrics';

export interface BriefInput {
  project_id: string;
  kpi_summary: ProjectKpiSummary | null;
  risk_data: {
    total_risks: number;
    high_critical_open: number;
    unresolved_items: string[];
  };
  control_data: {
    total_controls: number;
    passed: number;
    failed: number;
  };
  gate_data: {
    gates_passed: number;
    gates_total: number;
  };
  data_classified: boolean;
  evidence_exported: boolean;
}

/**
 * Generate an executive decision brief from project state.
 * Pure function with no side effects.
 */
export function generateExecutiveBrief(input: BriefInput): ExecutiveDecisionBrief {
  const controlPassRate = input.control_data.total_controls > 0
    ? Math.round((input.control_data.passed / input.control_data.total_controls) * 100)
    : 0;

  const kpiAttainment = input.kpi_summary?.overall_attainment_pct ?? null;

  // Determine recommendation
  const recommendation = computeRecommendation(input, controlPassRate, kpiAttainment);

  // Build value summary
  const topWins: string[] = [];
  const concerns: string[] = [];

  if (input.kpi_summary) {
    const metKpis = input.kpi_summary.kpis.filter((k) => k.status === 'met');
    for (const kpi of metKpis.slice(0, 3)) {
      topWins.push(`${kpi.kpi_name}: ${kpi.current ?? 0} (target: ${kpi.target})`);
    }
    const atRiskKpis = input.kpi_summary.kpis.filter((k) => k.status === 'at_risk' || k.status === 'missed');
    for (const kpi of atRiskKpis.slice(0, 3)) {
      concerns.push(`${kpi.kpi_name}: ${kpi.attainment_pct ?? 0}% attainment`);
    }
  }

  if (input.risk_data.high_critical_open > 0) {
    concerns.push(`${input.risk_data.high_critical_open} high/critical risks remain open`);
  }
  if (controlPassRate < 80) {
    concerns.push(`Control pass rate (${controlPassRate}%) below 80% threshold`);
  }

  // Build next steps
  const nextSteps: string[] = [];
  if (recommendation === 'go') {
    nextSteps.push('Prepare production deployment plan');
    nextSteps.push('Schedule broader rollout with additional teams');
    nextSteps.push('Archive pilot evidence for compliance record');
  } else if (recommendation === 'conditional_go') {
    nextSteps.push('Address remaining control failures within 14 days');
    nextSteps.push('Close open high-risk findings before scaling');
    nextSteps.push('Schedule follow-up review in 2 weeks');
  } else {
    nextSteps.push('Document root causes for pilot challenges');
    nextSteps.push('Review pilot scope and success criteria');
    nextSteps.push('Schedule retrospective with stakeholders');
  }

  return {
    project_id: input.project_id,
    generated_at: new Date().toISOString(),
    trace_id: crypto.randomUUID(),
    recommendation,
    recommendation_rationale: buildRationale(recommendation, kpiAttainment, controlPassRate, input),
    value_summary: {
      kpi_attainment_pct: kpiAttainment,
      top_wins: topWins,
      concerns,
    },
    risk_posture: {
      total_risks: input.risk_data.total_risks,
      high_critical_open: input.risk_data.high_critical_open,
      control_pass_rate: controlPassRate,
      unresolved_items: input.risk_data.unresolved_items,
    },
    governance_status: {
      gates_passed: input.gate_data.gates_passed,
      gates_total: input.gate_data.gates_total,
      data_classified: input.data_classified,
      evidence_exported: input.evidence_exported,
    },
    next_steps: nextSteps,
  };
}

/**
 * Generate a demo executive brief for showcase purposes.
 */
export function generateDemoExecutiveBrief(projectId: string): ExecutiveDecisionBrief {
  return generateExecutiveBrief({
    project_id: projectId,
    kpi_summary: {
      project_id: projectId,
      total_kpis: 6,
      met: 2,
      at_risk: 1,
      missed: 0,
      tracking: 3,
      not_started: 0,
      overall_attainment_pct: 72,
      kpis: [
        { kpi_id: '1', kpi_name: 'Active Pilot Users', category: 'adoption', baseline: 0, target: 10, current: 12, attainment_pct: 120, trend: 'improving', status: 'met', confidence: 'high' },
        { kpi_id: '2', kpi_name: 'Developer Satisfaction', category: 'satisfaction', baseline: null, target: 40, current: 52, attainment_pct: 130, trend: 'improving', status: 'met', confidence: 'high' },
        { kpi_id: '3', kpi_name: 'Developer Time Saved', category: 'time_saved', baseline: 0, target: 8, current: 5.2, attainment_pct: 65, trend: 'improving', status: 'tracking', confidence: 'high' },
        { kpi_id: '4', kpi_name: 'Test Coverage', category: 'quality_lift', baseline: 62, target: 77, current: 74, attainment_pct: 80, trend: 'improving', status: 'tracking', confidence: 'high' },
        { kpi_id: '5', kpi_name: 'Defect Rate', category: 'error_rate', baseline: 4.5, target: 2.5, current: 3.1, attainment_pct: 70, trend: 'improving', status: 'tracking', confidence: 'medium' },
        { kpi_id: '6', kpi_name: 'Cost Per Feature', category: 'cost_reduction', baseline: 1200, target: 800, current: 920, attainment_pct: 70, trend: 'improving', status: 'at_risk', confidence: 'medium' },
      ],
    },
    risk_data: {
      total_risks: 5,
      high_critical_open: 1,
      unresolved_items: ['Prompt injection mitigation review pending'],
    },
    control_data: { total_controls: 30, passed: 26, failed: 4 },
    gate_data: { gates_passed: 3, gates_total: 4 },
    data_classified: true,
    evidence_exported: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function computeRecommendation(
  input: BriefInput,
  controlPassRate: number,
  kpiAttainment: number | null,
): ExecutiveDecisionBrief['recommendation'] {
  // Hard blockers → no-go
  if (input.risk_data.high_critical_open >= 3) return 'no_go';
  if (controlPassRate < 50) return 'no_go';
  if (!input.data_classified) return 'no_go';

  // Conditions present → conditional go
  if (input.risk_data.high_critical_open > 0) return 'conditional_go';
  if (controlPassRate < 80) return 'conditional_go';
  if (input.gate_data.gates_passed < input.gate_data.gates_total) return 'conditional_go';
  if (kpiAttainment !== null && kpiAttainment < 70) return 'conditional_go';

  return 'go';
}

function buildRationale(
  recommendation: ExecutiveDecisionBrief['recommendation'],
  kpiAttainment: number | null,
  controlPassRate: number,
  input: BriefInput,
): string {
  const parts: string[] = [];

  if (recommendation === 'go') {
    parts.push('All governance criteria met.');
    if (kpiAttainment !== null) parts.push(`KPI attainment at ${kpiAttainment}%.`);
    parts.push(`Security controls at ${controlPassRate}% pass rate.`);
    parts.push('Recommend proceeding to production path.');
  } else if (recommendation === 'conditional_go') {
    parts.push('Most criteria met with conditions.');
    if (input.risk_data.high_critical_open > 0) {
      parts.push(`${input.risk_data.high_critical_open} high/critical risk(s) require remediation.`);
    }
    if (controlPassRate < 80) {
      parts.push(`Control pass rate (${controlPassRate}%) needs improvement.`);
    }
    parts.push('Recommend proceeding with documented remediation timeline.');
  } else {
    parts.push('Critical blockers prevent safe progression.');
    if (!input.data_classified) parts.push('Data classification not completed.');
    if (controlPassRate < 50) parts.push(`Control pass rate critically low (${controlPassRate}%).`);
    if (input.risk_data.high_critical_open >= 3) parts.push(`${input.risk_data.high_critical_open} high/critical open risks.`);
    parts.push('Recommend addressing root causes before re-evaluation.');
  }

  return parts.join(' ');
}
