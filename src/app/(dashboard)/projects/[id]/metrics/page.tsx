'use client';

import { useState, useMemo } from 'react';
import type { KpiDefinition, KpiSnapshot, KpiCategory } from '@/types';
import type { KpiAttainment, ProjectKpiSummary } from '@/lib/metrics';
import { evaluateProjectKpis, KPI_CATALOG } from '@/lib/metrics';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_KPIS: KpiDefinition[] = [
  {
    id: 'kpi-001', project_id: 'proj-demo-001', category: 'time_saved',
    name: 'Developer Time Saved', description: 'Hours per week saved by developers using AI coding assistants',
    unit: 'hours/week', baseline_value: 0, target_value: 8, current_value: 5.2,
    measurement_method: 'Time tracking survey + PR cycle time comparison',
    owner_id: 'user-001', owner_name: 'Sarah Chen', frequency: 'weekly', status: 'tracking',
    created_at: '2025-06-15T10:00:00Z', updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-002', project_id: 'proj-demo-001', category: 'quality_lift',
    name: 'Test Coverage Improvement', description: 'Increase in automated test coverage',
    unit: '%', baseline_value: 62, target_value: 77, current_value: 74,
    measurement_method: 'Coverage tool delta',
    owner_id: 'user-002', owner_name: 'James Rodriguez', frequency: 'monthly', status: 'tracking',
    created_at: '2025-06-15T10:00:00Z', updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-003', project_id: 'proj-demo-001', category: 'adoption',
    name: 'Active Pilot Users', description: 'Developers actively using AI assistant daily',
    unit: 'users', baseline_value: 0, target_value: 10, current_value: 12,
    measurement_method: 'Provider usage dashboard',
    owner_id: 'user-001', owner_name: 'Sarah Chen', frequency: 'weekly', status: 'met',
    created_at: '2025-06-15T10:00:00Z', updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-004', project_id: 'proj-demo-001', category: 'error_rate',
    name: 'Defect Rate Change', description: 'Change in defects per 1000 LOC',
    unit: 'defects/KLOC', baseline_value: 4.5, target_value: 2.5, current_value: 3.1,
    measurement_method: 'Bug tracker + KLOC from VCS',
    owner_id: 'user-003', owner_name: 'Maya Patel', frequency: 'monthly', status: 'tracking',
    created_at: '2025-06-15T10:00:00Z', updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-005', project_id: 'proj-demo-001', category: 'satisfaction',
    name: 'Developer Satisfaction', description: 'Developer NPS for AI tools',
    unit: 'NPS', baseline_value: null, target_value: 40, current_value: 52,
    measurement_method: 'Anonymous survey',
    owner_id: 'user-001', owner_name: 'Sarah Chen', frequency: 'monthly', status: 'met',
    created_at: '2025-06-15T10:00:00Z', updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-006', project_id: 'proj-demo-001', category: 'cost_reduction',
    name: 'Cost Per Feature', description: 'Average cost to deliver a feature during pilot',
    unit: 'USD', baseline_value: 1200, target_value: 800, current_value: 920,
    measurement_method: 'Sprint cost allocation',
    owner_id: 'user-002', owner_name: 'James Rodriguez', frequency: 'monthly', status: 'at_risk',
    created_at: '2025-06-15T10:00:00Z', updated_at: '2025-08-01T14:00:00Z',
  },
];

const DEMO_SNAPSHOTS: KpiSnapshot[] = [
  { id: 'snap-001', kpi_id: 'kpi-001', value: 3.1, confidence: 'medium', notes: 'Week 2', captured_at: '2025-07-01T10:00:00Z' },
  { id: 'snap-002', kpi_id: 'kpi-001', value: 4.8, confidence: 'high', notes: 'Week 4', captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-003', kpi_id: 'kpi-001', value: 5.2, confidence: 'high', notes: 'Week 6', captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-004', kpi_id: 'kpi-002', value: 67, confidence: 'high', notes: 'Month 1', captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-005', kpi_id: 'kpi-002', value: 74, confidence: 'high', notes: 'Month 2', captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-006', kpi_id: 'kpi-003', value: 7, confidence: 'high', notes: null, captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-007', kpi_id: 'kpi-003', value: 12, confidence: 'high', notes: null, captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-008', kpi_id: 'kpi-004', value: 3.8, confidence: 'medium', notes: null, captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-009', kpi_id: 'kpi-004', value: 3.1, confidence: 'medium', notes: null, captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-010', kpi_id: 'kpi-005', value: 38, confidence: 'medium', notes: 'First survey', captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-011', kpi_id: 'kpi-005', value: 52, confidence: 'high', notes: 'Second survey', captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-012', kpi_id: 'kpi-006', value: 1050, confidence: 'low', notes: null, captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-013', kpi_id: 'kpi-006', value: 920, confidence: 'medium', notes: null, captured_at: '2025-08-01T10:00:00Z' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  met: 'bg-green-100 text-green-800',
  tracking: 'bg-blue-100 text-blue-800',
  at_risk: 'bg-yellow-100 text-yellow-800',
  missed: 'bg-red-100 text-red-800',
  not_started: 'bg-slate-100 text-slate-600',
};

const TREND_ICONS: Record<string, string> = {
  improving: '\u2191',
  stable: '\u2192',
  declining: '\u2193',
  unknown: '\u2022',
};

const TREND_COLORS: Record<string, string> = {
  improving: 'text-green-600',
  stable: 'text-slate-500',
  declining: 'text-red-600',
  unknown: 'text-slate-400',
};

const CATEGORY_LABELS: Record<KpiCategory, string> = {
  time_saved: 'Time Saved',
  quality_lift: 'Quality Lift',
  error_rate: 'Error Rate',
  adoption: 'Adoption',
  cost_reduction: 'Cost Reduction',
  satisfaction: 'Satisfaction',
};

const CATEGORY_ICONS: Record<KpiCategory, string> = {
  time_saved: '\u23F1',
  quality_lift: '\u2705',
  error_rate: '\u26A0',
  adoption: '\uD83D\uDC65',
  cost_reduction: '\uD83D\uDCB0',
  satisfaction: '\u2764',
};

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function KpiDashboardPage() {
  const [filterCategory, setFilterCategory] = useState<KpiCategory | 'all'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const summary: ProjectKpiSummary = useMemo(
    () => evaluateProjectKpis(DEMO_KPIS, DEMO_SNAPSHOTS),
    [],
  );

  const filteredKpis = useMemo(() => {
    if (filterCategory === 'all') return summary.kpis;
    return summary.kpis.filter((k) => k.category === filterCategory);
  }, [summary, filterCategory]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KPI Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track pilot outcomes against baselines and targets
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddDialog(!showAddDialog)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Add KPI
          </button>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <SummaryCard
          label="Total KPIs"
          value={summary.total_kpis}
          color="bg-slate-100 text-slate-800"
        />
        <SummaryCard
          label="Met Target"
          value={summary.met}
          color="bg-green-100 text-green-800"
        />
        <SummaryCard
          label="On Track"
          value={summary.tracking}
          color="bg-blue-100 text-blue-800"
        />
        <SummaryCard
          label="At Risk"
          value={summary.at_risk}
          color="bg-yellow-100 text-yellow-800"
        />
        <SummaryCard
          label="Missed"
          value={summary.missed}
          color="bg-red-100 text-red-800"
        />
        <SummaryCard
          label="Overall"
          value={summary.overall_attainment_pct !== null ? `${summary.overall_attainment_pct}%` : 'N/A'}
          color="bg-indigo-100 text-indigo-800"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <FilterButton
          label="All"
          active={filterCategory === 'all'}
          onClick={() => setFilterCategory('all')}
        />
        {(Object.keys(CATEGORY_LABELS) as KpiCategory[]).map((cat) => (
          <FilterButton
            key={cat}
            label={`${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
            active={filterCategory === cat}
            onClick={() => setFilterCategory(cat)}
          />
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKpis.map((kpi) => (
          <KpiCard key={kpi.kpi_id} kpi={kpi} snapshots={DEMO_SNAPSHOTS.filter((s) => s.kpi_id === kpi.kpi_id)} />
        ))}
      </div>

      {/* KPI Catalog (Add Dialog) */}
      {showAddDialog && (
        <div className="border border-slate-200 rounded-lg bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">KPI Catalog</h2>
            <button
              onClick={() => setShowAddDialog(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Select from standard AI pilot KPIs to add to this project.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {KPI_CATALOG.map((entry, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-400 cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {CATEGORY_LABELS[entry.category]}
                  </span>
                  <span className="text-xs text-slate-400">{entry.frequency}</span>
                </div>
                <h3 className="font-medium text-slate-900 text-sm">{entry.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{entry.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>Target: {entry.suggested_target} {entry.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attainment Overview Table */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Attainment Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">KPI</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Category</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Baseline</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Target</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Current</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Attainment</th>
                <th className="text-center px-4 py-2 font-medium text-slate-600">Trend</th>
                <th className="text-center px-4 py-2 font-medium text-slate-600">Status</th>
                <th className="text-center px-4 py-2 font-medium text-slate-600">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.kpis.map((kpi) => (
                <tr key={kpi.kpi_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{kpi.kpi_name}</td>
                  <td className="px-4 py-3 text-slate-500">{CATEGORY_LABELS[kpi.category]}</td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {kpi.baseline !== null ? kpi.baseline : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 font-medium">{kpi.target}</td>
                  <td className="px-4 py-3 text-right text-slate-900 font-medium">
                    {kpi.current !== null ? kpi.current : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {kpi.attainment_pct !== null ? (
                      <span className={kpi.attainment_pct >= 100 ? 'text-green-600 font-semibold' : kpi.attainment_pct >= 70 ? 'text-blue-600' : 'text-yellow-600'}>
                        {kpi.attainment_pct}%
                      </span>
                    ) : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-lg ${TREND_COLORS[kpi.trend]}`}>
                      {TREND_ICONS[kpi.trend]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[kpi.status]}`}>
                      {kpi.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ConfidenceDot confidence={kpi.confidence} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium mt-1 opacity-80">{label}</div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

function KpiCard({ kpi, snapshots }: { kpi: KpiAttainment; snapshots: KpiSnapshot[] }) {
  const sortedSnaps = [...snapshots].sort(
    (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime(),
  );

  return (
    <div className="border border-slate-200 rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[kpi.status]}`}>
          {kpi.status.replace('_', ' ')}
        </span>
        <span className={`text-lg ${TREND_COLORS[kpi.trend]}`}>
          {TREND_ICONS[kpi.trend]}
        </span>
      </div>

      <h3 className="font-medium text-slate-900 mb-1">{kpi.kpi_name}</h3>
      <p className="text-xs text-slate-400 mb-3">{CATEGORY_LABELS[kpi.category]}</p>

      {/* Attainment bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-500">
            {kpi.current !== null ? kpi.current : '\u2014'} / {kpi.target}
          </span>
          <span className={`font-semibold ${
            (kpi.attainment_pct ?? 0) >= 100 ? 'text-green-600' :
            (kpi.attainment_pct ?? 0) >= 70 ? 'text-blue-600' : 'text-yellow-600'
          }`}>
            {kpi.attainment_pct !== null ? `${kpi.attainment_pct}%` : 'N/A'}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              (kpi.attainment_pct ?? 0) >= 100 ? 'bg-green-500' :
              (kpi.attainment_pct ?? 0) >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(kpi.attainment_pct ?? 0, 100)}%` }}
          />
        </div>
      </div>

      {/* Mini sparkline (text-based) */}
      {sortedSnaps.length > 0 && (
        <div className="text-xs text-slate-400">
          <span className="font-medium text-slate-500">History: </span>
          {sortedSnaps.map((s, i) => (
            <span key={s.id}>
              {i > 0 && ' \u2192 '}
              {s.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfidenceDot({ confidence }: { confidence: KpiSnapshot['confidence'] }) {
  const colors = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-red-500',
  };
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`w-2 h-2 rounded-full ${colors[confidence]}`} />
      <span className="text-xs text-slate-500">{confidence}</span>
    </span>
  );
}
