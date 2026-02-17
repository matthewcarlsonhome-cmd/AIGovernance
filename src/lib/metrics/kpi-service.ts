// Centralized KPI / Metrics Service (Design Doc §5E, §8.1)
// Aggregates, tracks, and evaluates KPIs across projects.

import type { KpiDefinition, KpiSnapshot, KpiCategory } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// KPI Catalog — Standard KPIs for AI pilots
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiCatalogEntry {
  category: KpiCategory;
  name: string;
  description: string;
  unit: string;
  suggested_target: number;
  measurement_method: string;
  frequency: KpiDefinition['frequency'];
}

export const KPI_CATALOG: KpiCatalogEntry[] = [
  {
    category: 'time_saved',
    name: 'Developer Time Saved',
    description: 'Hours per week saved by developers using AI coding assistants',
    unit: 'hours/week',
    suggested_target: 8,
    measurement_method: 'Time tracking survey + PR cycle time comparison',
    frequency: 'weekly',
  },
  {
    category: 'time_saved',
    name: 'Code Review Turnaround',
    description: 'Reduction in average code review cycle time',
    unit: 'hours',
    suggested_target: 4,
    measurement_method: 'PR open-to-merge time from VCS analytics',
    frequency: 'weekly',
  },
  {
    category: 'quality_lift',
    name: 'Test Coverage Improvement',
    description: 'Increase in automated test coverage across pilot repositories',
    unit: '%',
    suggested_target: 15,
    measurement_method: 'Coverage tool delta (before vs after pilot)',
    frequency: 'monthly',
  },
  {
    category: 'quality_lift',
    name: 'Documentation Completeness',
    description: 'Percentage of public APIs with AI-generated documentation',
    unit: '%',
    suggested_target: 80,
    measurement_method: 'Doc coverage scanner',
    frequency: 'monthly',
  },
  {
    category: 'error_rate',
    name: 'Defect Rate Change',
    description: 'Change in defects per 1000 lines of code during pilot period',
    unit: 'defects/KLOC',
    suggested_target: -2,
    measurement_method: 'Bug tracker + KLOC from VCS',
    frequency: 'monthly',
  },
  {
    category: 'error_rate',
    name: 'Security Vulnerability Rate',
    description: 'New security findings per sprint during pilot',
    unit: 'findings/sprint',
    suggested_target: 0,
    measurement_method: 'SAST/DAST scan results',
    frequency: 'weekly',
  },
  {
    category: 'adoption',
    name: 'Active Pilot Users',
    description: 'Number of developers actively using AI assistant daily',
    unit: 'users',
    suggested_target: 10,
    measurement_method: 'Provider usage dashboard / license analytics',
    frequency: 'weekly',
  },
  {
    category: 'adoption',
    name: 'AI-Assisted PR Percentage',
    description: 'Percentage of PRs that include AI-generated code',
    unit: '%',
    suggested_target: 50,
    measurement_method: 'PR metadata / git commit markers',
    frequency: 'weekly',
  },
  {
    category: 'cost_reduction',
    name: 'Cost Per Feature',
    description: 'Average cost to deliver a story point or feature during pilot',
    unit: 'USD',
    suggested_target: 500,
    measurement_method: 'Sprint cost allocation / story points delivered',
    frequency: 'monthly',
  },
  {
    category: 'satisfaction',
    name: 'Developer Satisfaction Score',
    description: 'Developer NPS or satisfaction survey score for AI tools',
    unit: 'NPS',
    suggested_target: 40,
    measurement_method: 'Anonymous survey (1-10 scale, converted to NPS)',
    frequency: 'monthly',
  },
  {
    category: 'satisfaction',
    name: 'Stakeholder Confidence',
    description: 'Governance stakeholder confidence in AI deployment controls',
    unit: 'score (1-5)',
    suggested_target: 4,
    measurement_method: 'Quarterly stakeholder survey',
    frequency: 'quarterly',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// KPI Evaluation — compute attainment and status
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiAttainment {
  kpi_id: string;
  kpi_name: string;
  category: KpiCategory;
  baseline: number | null;
  target: number;
  current: number | null;
  attainment_pct: number | null;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  status: KpiDefinition['status'];
  confidence: KpiSnapshot['confidence'];
}

export interface ProjectKpiSummary {
  project_id: string;
  total_kpis: number;
  met: number;
  at_risk: number;
  missed: number;
  tracking: number;
  not_started: number;
  overall_attainment_pct: number | null;
  kpis: KpiAttainment[];
}

/**
 * Evaluate all KPIs for a project and return a summary.
 * Pure function with no side effects.
 */
export function evaluateProjectKpis(
  kpis: KpiDefinition[],
  snapshots: KpiSnapshot[],
): ProjectKpiSummary {
  const snapshotsByKpi = new Map<string, KpiSnapshot[]>();
  for (const snap of snapshots) {
    const existing = snapshotsByKpi.get(snap.kpi_id) ?? [];
    existing.push(snap);
    snapshotsByKpi.set(snap.kpi_id, existing);
  }

  const attainments: KpiAttainment[] = kpis.map((kpi) => {
    const kpiSnaps = (snapshotsByKpi.get(kpi.id) ?? [])
      .sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime());

    const latestSnap = kpiSnaps[0] ?? null;
    const currentValue = kpi.current_value ?? latestSnap?.value ?? null;
    const attainmentPct = computeAttainment(kpi.baseline_value, kpi.target_value, currentValue);
    const trend = computeTrend(kpiSnaps);
    const status = deriveStatus(attainmentPct, trend);

    return {
      kpi_id: kpi.id,
      kpi_name: kpi.name,
      category: kpi.category,
      baseline: kpi.baseline_value,
      target: kpi.target_value,
      current: currentValue,
      attainment_pct: attainmentPct,
      trend,
      status,
      confidence: latestSnap?.confidence ?? 'low',
    };
  });

  const met = attainments.filter((a) => a.status === 'met').length;
  const atRisk = attainments.filter((a) => a.status === 'at_risk').length;
  const missed = attainments.filter((a) => a.status === 'missed').length;
  const tracking = attainments.filter((a) => a.status === 'tracking').length;
  const notStarted = attainments.filter((a) => a.status === 'not_started').length;

  const measuredKpis = attainments.filter((a) => a.attainment_pct !== null);
  const overallAttainment = measuredKpis.length > 0
    ? Math.round(measuredKpis.reduce((sum, a) => sum + (a.attainment_pct ?? 0), 0) / measuredKpis.length)
    : null;

  return {
    project_id: kpis[0]?.project_id ?? '',
    total_kpis: kpis.length,
    met,
    at_risk: atRisk,
    missed,
    tracking,
    not_started: notStarted,
    overall_attainment_pct: overallAttainment,
    kpis: attainments,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Metrics — aggregate across projects
// ─────────────────────────────────────────────────────────────────────────────

export interface PortfolioMetrics {
  total_projects: number;
  active_pilots: number;
  avg_attainment_pct: number | null;
  total_kpis: number;
  kpis_met: number;
  kpis_at_risk: number;
  kpis_missed: number;
  by_category: Record<KpiCategory, { total: number; met: number; avg_attainment: number | null }>;
}

export function computePortfolioMetrics(summaries: ProjectKpiSummary[]): PortfolioMetrics {
  const allKpis = summaries.flatMap((s) => s.kpis);
  const categories: KpiCategory[] = ['time_saved', 'quality_lift', 'error_rate', 'adoption', 'cost_reduction', 'satisfaction'];

  const byCategory = {} as PortfolioMetrics['by_category'];
  for (const cat of categories) {
    const catKpis = allKpis.filter((k) => k.category === cat);
    const catMeasured = catKpis.filter((k) => k.attainment_pct !== null);
    byCategory[cat] = {
      total: catKpis.length,
      met: catKpis.filter((k) => k.status === 'met').length,
      avg_attainment: catMeasured.length > 0
        ? Math.round(catMeasured.reduce((s, k) => s + (k.attainment_pct ?? 0), 0) / catMeasured.length)
        : null,
    };
  }

  const measured = allKpis.filter((k) => k.attainment_pct !== null);

  return {
    total_projects: summaries.length,
    active_pilots: summaries.filter((s) => s.tracking > 0 || s.met > 0).length,
    avg_attainment_pct: measured.length > 0
      ? Math.round(measured.reduce((s, k) => s + (k.attainment_pct ?? 0), 0) / measured.length)
      : null,
    total_kpis: allKpis.length,
    kpis_met: allKpis.filter((k) => k.status === 'met').length,
    kpis_at_risk: allKpis.filter((k) => k.status === 'at_risk').length,
    kpis_missed: allKpis.filter((k) => k.status === 'missed').length,
    by_category: byCategory,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function computeAttainment(
  baseline: number | null,
  target: number,
  current: number | null,
): number | null {
  if (current === null) return null;
  if (baseline === null) {
    // No baseline: treat attainment as current/target ratio
    return target === 0 ? 100 : Math.round((current / target) * 100);
  }
  const totalDelta = target - baseline;
  if (totalDelta === 0) return current >= target ? 100 : 0;
  const currentDelta = current - baseline;
  return Math.round((currentDelta / totalDelta) * 100);
}

function computeTrend(snapshots: KpiSnapshot[]): KpiAttainment['trend'] {
  if (snapshots.length < 2) return 'unknown';
  // Compare the two most recent snapshots
  const [latest, previous] = snapshots;
  if (latest.value > previous.value) return 'improving';
  if (latest.value < previous.value) return 'declining';
  return 'stable';
}

function deriveStatus(attainmentPct: number | null, trend: KpiAttainment['trend']): KpiDefinition['status'] {
  if (attainmentPct === null) return 'not_started';
  if (attainmentPct >= 100) return 'met';
  if (attainmentPct >= 70) return 'tracking';
  if (trend === 'declining' && attainmentPct < 50) return 'missed';
  return 'at_risk';
}
