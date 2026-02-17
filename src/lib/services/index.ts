// Domain Services (Design Doc v3 §8.1)
// Core orchestration services that tie together the canonical workflow.

import type {
  ProjectState,
  GovernanceGate,
  GovernanceGateDecision,
  ControlCheck,
  RiskClassification,
  RiskException,
  GovernanceControlContext,
  DecisionSupportContext,
  OutcomeMetric,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// GovernanceControlService
// ─────────────────────────────────────────────────────────────────────────────

export interface GovernanceReadiness {
  ready: boolean;
  gates_status: { gate_type: string; decision: string; evidence_complete: boolean }[];
  control_pass_rate: number;
  open_risks: number;
  open_exceptions: number;
  blockers: string[];
}

export function evaluateGovernanceReadiness(ctx: GovernanceControlContext): GovernanceReadiness {
  const gates_status = ctx.gates.map((gate) => {
    const evidenceComplete = gate.required_artifacts.every((a) => a.provided);
    return {
      gate_type: gate.gate_type,
      decision: gate.decision,
      evidence_complete: evidenceComplete,
    };
  });

  const totalControls = ctx.controls.length;
  const passedControls = ctx.controls.filter((c) => c.result === 'pass').length;
  const control_pass_rate = totalControls > 0 ? Math.round((passedControls / totalControls) * 100) : 0;

  const openRisks = ctx.risks.filter((r) => r.status === 'open' || r.status === 'mitigating');
  const activeExceptions = ctx.exceptions.filter((e) => e.status === 'approved');

  const blockers: string[] = [];

  // Check for unapproved required gates
  for (const gs of gates_status) {
    if (gs.decision === 'pending' || gs.decision === 'rejected') {
      blockers.push(`Gate "${gs.gate_type}" is ${gs.decision}`);
    }
    if (!gs.evidence_complete && gs.decision !== 'pending') {
      blockers.push(`Gate "${gs.gate_type}" has incomplete evidence`);
    }
  }

  // Check control pass rate
  if (control_pass_rate < 80) {
    blockers.push(`Control pass rate (${control_pass_rate}%) below 80% threshold`);
  }

  // Check high/critical risks without exceptions
  const highCriticalRisks = openRisks.filter(
    (r) => r.tier === 'critical' || r.tier === 'high',
  );
  const exceptedRiskIds = new Set(activeExceptions.map((e) => e.risk_id).filter(Boolean));
  const unexceptedHighRisks = highCriticalRisks.filter((r) => !exceptedRiskIds.has(r.id));
  if (unexceptedHighRisks.length > 0) {
    blockers.push(`${unexceptedHighRisks.length} high/critical risk(s) without exception or mitigation`);
  }

  return {
    ready: blockers.length === 0,
    gates_status,
    control_pass_rate,
    open_risks: openRisks.length,
    open_exceptions: activeExceptions.length,
    blockers,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DecisionSupportService
// ─────────────────────────────────────────────────────────────────────────────

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface DecisionRecommendation {
  recommendation: 'go' | 'conditional_go' | 'no_go';
  confidence: ConfidenceLevel;
  rationale: string[];
  evidence_gaps: string[];
  risk_factors: string[];
  outcome_summary: { metric: string; target: number; actual: number | null; attainment: string }[];
}

export function generateDecisionRecommendation(ctx: DecisionSupportContext): DecisionRecommendation {
  const rationale: string[] = [];
  const evidence_gaps: string[] = [];
  const risk_factors: string[] = [];

  // Evaluate KPIs
  const kpi = ctx.kpi_summary;
  if (kpi.overall_attainment_pct !== null && kpi.overall_attainment_pct >= 80) {
    rationale.push(`KPI attainment at ${kpi.overall_attainment_pct}% — exceeds 80% threshold`);
  } else if (kpi.overall_attainment_pct !== null) {
    risk_factors.push(`KPI attainment at ${kpi.overall_attainment_pct}% — below 80% threshold`);
  } else {
    evidence_gaps.push('KPI tracking not started or data unavailable');
  }

  // Evaluate risk posture
  if (ctx.risk_posture.high_critical_open === 0) {
    rationale.push('No open high/critical risks');
  } else {
    risk_factors.push(`${ctx.risk_posture.high_critical_open} high/critical risk(s) remain open`);
  }

  if (ctx.risk_posture.control_pass_rate >= 90) {
    rationale.push(`Control pass rate at ${ctx.risk_posture.control_pass_rate}%`);
  } else if (ctx.risk_posture.control_pass_rate >= 70) {
    risk_factors.push(`Control pass rate at ${ctx.risk_posture.control_pass_rate}% — room for improvement`);
  } else {
    risk_factors.push(`Control pass rate critically low at ${ctx.risk_posture.control_pass_rate}%`);
  }

  // Evaluate gates
  if (ctx.gate_status.passed === ctx.gate_status.total) {
    rationale.push('All governance gates approved');
  } else {
    evidence_gaps.push(`${ctx.gate_status.total - ctx.gate_status.passed} gate(s) pending approval`);
  }

  if (!ctx.evidence_complete) {
    evidence_gaps.push('Evidence package is incomplete');
  }

  // Determine recommendation
  let recommendation: DecisionRecommendation['recommendation'];
  if (risk_factors.length === 0 && evidence_gaps.length === 0) {
    recommendation = 'go';
  } else if (risk_factors.length <= 2 && evidence_gaps.length <= 1) {
    recommendation = 'conditional_go';
  } else {
    recommendation = 'no_go';
  }

  // Determine confidence
  const dataPoints = [
    kpi.overall_attainment_pct !== null,
    ctx.risk_posture.total > 0,
    ctx.gate_status.total > 0,
    ctx.evidence_complete,
    ctx.outcome_metrics.length > 0,
  ];
  const filledDataPoints = dataPoints.filter(Boolean).length;
  let confidence: ConfidenceLevel;
  if (filledDataPoints >= 4) confidence = 'high';
  else if (filledDataPoints >= 2) confidence = 'medium';
  else confidence = 'low';

  // Build outcome summary
  const outcome_summary = ctx.outcome_metrics.map((m) => ({
    metric: m.name,
    target: m.target_value,
    actual: m.actual_value,
    attainment: m.actual_value !== null
      ? `${Math.round((m.actual_value / m.target_value) * 100)}%`
      : 'Not measured',
  }));

  return {
    recommendation,
    confidence,
    rationale,
    evidence_gaps,
    risk_factors,
    outcome_summary,
  };
}
