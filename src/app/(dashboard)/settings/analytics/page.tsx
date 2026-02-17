'use client';

import { useState } from 'react';
import type { AdoptionMetrics } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data — Weekly adoption snapshots
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_METRICS: AdoptionMetrics[] = [
  {
    period: 'Week 1', weekly_active_teams: 2, projects_created: 3, pilots_launched: 0,
    governance_artifacts_completed: 4, report_exports: 1, avg_time_to_first_pilot_days: null,
    workflow_completion_rate: 12, data_classification_pct: 33, controls_passing_pct: 60,
  },
  {
    period: 'Week 2', weekly_active_teams: 3, projects_created: 1, pilots_launched: 0,
    governance_artifacts_completed: 9, report_exports: 2, avg_time_to_first_pilot_days: null,
    workflow_completion_rate: 28, data_classification_pct: 50, controls_passing_pct: 67,
  },
  {
    period: 'Week 3', weekly_active_teams: 4, projects_created: 2, pilots_launched: 1,
    governance_artifacts_completed: 15, report_exports: 4, avg_time_to_first_pilot_days: 18,
    workflow_completion_rate: 42, data_classification_pct: 67, controls_passing_pct: 75,
  },
  {
    period: 'Week 4', weekly_active_teams: 5, projects_created: 1, pilots_launched: 1,
    governance_artifacts_completed: 22, report_exports: 7, avg_time_to_first_pilot_days: 16,
    workflow_completion_rate: 55, data_classification_pct: 80, controls_passing_pct: 82,
  },
  {
    period: 'Week 5', weekly_active_teams: 5, projects_created: 2, pilots_launched: 0,
    governance_artifacts_completed: 28, report_exports: 9, avg_time_to_first_pilot_days: 16,
    workflow_completion_rate: 61, data_classification_pct: 83, controls_passing_pct: 84,
  },
  {
    period: 'Week 6', weekly_active_teams: 6, projects_created: 1, pilots_launched: 2,
    governance_artifacts_completed: 35, report_exports: 14, avg_time_to_first_pilot_days: 14,
    workflow_completion_rate: 72, data_classification_pct: 90, controls_passing_pct: 88,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function trendArrow(current: number, previous: number): string {
  if (current > previous) return '\u2191';
  if (current < previous) return '\u2193';
  return '\u2192';
}

function trendColor(current: number, previous: number, higherIsBetter: boolean = true): string {
  if (current === previous) return 'text-slate-500';
  const improving = higherIsBetter ? current > previous : current < previous;
  return improving ? 'text-green-600' : 'text-red-600';
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [selectedPeriod] = useState(DEMO_METRICS.length - 1);
  const latest = DEMO_METRICS[selectedPeriod];
  const previous = DEMO_METRICS[Math.max(0, selectedPeriod - 1)];

  const totalProjects = DEMO_METRICS.reduce((s, m) => s + m.projects_created, 0);
  const totalPilots = DEMO_METRICS.reduce((s, m) => s + m.pilots_launched, 0);
  const totalExports = DEMO_METRICS.reduce((s, m) => s + m.report_exports, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Adoption metrics, workflow completion, and governance health across the platform
        </p>
      </div>

      {/* Top-line KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Active Teams"
          value={latest.weekly_active_teams}
          delta={trendArrow(latest.weekly_active_teams, previous.weekly_active_teams)}
          deltaColor={trendColor(latest.weekly_active_teams, previous.weekly_active_teams)}
        />
        <MetricCard
          label="Total Projects"
          value={totalProjects}
        />
        <MetricCard
          label="Pilots Launched"
          value={totalPilots}
        />
        <MetricCard
          label="Avg Time to Pilot"
          value={latest.avg_time_to_first_pilot_days !== null ? `${latest.avg_time_to_first_pilot_days}d` : 'N/A'}
          delta={latest.avg_time_to_first_pilot_days !== null && previous.avg_time_to_first_pilot_days !== null
            ? trendArrow(latest.avg_time_to_first_pilot_days, previous.avg_time_to_first_pilot_days)
            : undefined}
          deltaColor={latest.avg_time_to_first_pilot_days !== null && previous.avg_time_to_first_pilot_days !== null
            ? trendColor(latest.avg_time_to_first_pilot_days, previous.avg_time_to_first_pilot_days, false)
            : undefined}
        />
        <MetricCard
          label="Report Exports"
          value={totalExports}
        />
      </div>

      {/* Governance Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GaugeCard
          label="Workflow Completion"
          value={latest.workflow_completion_rate}
          unit="%"
          target={80}
        />
        <GaugeCard
          label="Data Classification"
          value={latest.data_classification_pct}
          unit="%"
          target={100}
        />
        <GaugeCard
          label="Controls Passing"
          value={latest.controls_passing_pct}
          unit="%"
          target={90}
        />
      </div>

      {/* Trend Table */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Weekly Trends</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Period</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Active Teams</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">New Projects</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Pilots Launched</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Artifacts Done</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Exports</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Workflow %</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Data Class %</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Controls %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_METRICS.map((m, i) => (
                <tr key={m.period} className={i === selectedPeriod ? 'bg-blue-50' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-medium text-slate-900">{m.period}</td>
                  <td className="px-4 py-3 text-right">{m.weekly_active_teams}</td>
                  <td className="px-4 py-3 text-right">{m.projects_created}</td>
                  <td className="px-4 py-3 text-right">{m.pilots_launched}</td>
                  <td className="px-4 py-3 text-right">{m.governance_artifacts_completed}</td>
                  <td className="px-4 py-3 text-right">{m.report_exports}</td>
                  <td className="px-4 py-3 text-right">
                    <PercentBadge value={m.workflow_completion_rate} target={80} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PercentBadge value={m.data_classification_pct} target={100} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PercentBadge value={m.controls_passing_pct} target={90} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adoption Funnel */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Adoption Funnel</h2>
        <div className="space-y-3">
          <FunnelStep
            label="Projects Created"
            value={totalProjects}
            maxValue={totalProjects}
          />
          <FunnelStep
            label="Data Classified"
            value={Math.round(totalProjects * latest.data_classification_pct / 100)}
            maxValue={totalProjects}
          />
          <FunnelStep
            label="Controls Passing (>80%)"
            value={Math.round(totalProjects * latest.controls_passing_pct / 100)}
            maxValue={totalProjects}
          />
          <FunnelStep
            label="Pilots Launched"
            value={totalPilots}
            maxValue={totalProjects}
          />
          <FunnelStep
            label="Decisions Finalized"
            value={1}
            maxValue={totalProjects}
          />
        </div>
      </div>

      {/* Bottleneck Detection */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Bottleneck Detection</h2>
        <div className="space-y-2">
          {latest.data_classification_pct < 100 && (
            <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Data</span>
              <span className="text-sm text-slate-700">
                {100 - latest.data_classification_pct}% of projects still need data classification
              </span>
            </div>
          )}
          {latest.controls_passing_pct < 90 && (
            <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">Security</span>
              <span className="text-sm text-slate-700">
                Control pass rate ({latest.controls_passing_pct}%) below 90% target
              </span>
            </div>
          )}
          {latest.workflow_completion_rate < 80 && (
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Workflow</span>
              <span className="text-sm text-slate-700">
                Workflow completion ({latest.workflow_completion_rate}%) below 80% target
              </span>
            </div>
          )}
          {latest.avg_time_to_first_pilot_days !== null && latest.avg_time_to_first_pilot_days > 30 && (
            <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">Speed</span>
              <span className="text-sm text-slate-700">
                Avg time to first pilot ({latest.avg_time_to_first_pilot_days} days) exceeds 30-day target
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MetricCard({
  label, value, delta, deltaColor,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaColor?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {delta && (
          <span className={`text-sm font-medium ${deltaColor ?? 'text-slate-500'}`}>{delta}</span>
        )}
      </div>
    </div>
  );
}

function GaugeCard({ label, value, unit, target }: { label: string; value: number; unit: string; target: number }) {
  const pct = Math.min(value, 100);
  const color = value >= target ? 'bg-green-500' : value >= target * 0.75 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-400">Target: {target}{unit}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-2">{value}{unit}</div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PercentBadge({ value, target }: { value: number; target: number }) {
  const color = value >= target ? 'text-green-600' : value >= target * 0.75 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-medium ${color}`}>{value}%</span>;
}

function FunnelStep({ label, value, maxValue }: { label: string; value: number; maxValue: number }) {
  const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value} ({pct}%)</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
