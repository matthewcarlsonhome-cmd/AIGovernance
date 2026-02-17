'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { RiskTier } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectPosture {
  id: string;
  name: string;
  state: string;
  owner: string;
  risk_tier: RiskTier;
  control_pass_rate: number;
  total_controls: number;
  passed_controls: number;
  failed_controls: number;
  open_risks: number;
  high_risks: number;
  gates_completed: number;
  gates_total: number;
  data_classified: boolean;
  evidence_exported: boolean;
  kpi_attainment: number | null;
  last_review_date: string | null;
  days_since_last_review: number | null;
  sla_status: 'within' | 'warning' | 'breached';
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_PROJECTS: ProjectPosture[] = [
  {
    id: 'proj-001', name: 'Enterprise AI Coding Pilot', state: 'pilot_running', owner: 'Sarah Chen',
    risk_tier: 'medium', control_pass_rate: 87, total_controls: 30, passed_controls: 26, failed_controls: 4,
    open_risks: 3, high_risks: 1, gates_completed: 3, gates_total: 4,
    data_classified: true, evidence_exported: true, kpi_attainment: 72,
    last_review_date: '2025-08-10', days_since_last_review: 5, sla_status: 'within',
  },
  {
    id: 'proj-002', name: 'Legal Document Assistant', state: 'security_approved', owner: 'James Rodriguez',
    risk_tier: 'high', control_pass_rate: 73, total_controls: 30, passed_controls: 22, failed_controls: 8,
    open_risks: 6, high_risks: 3, gates_completed: 2, gates_total: 4,
    data_classified: true, evidence_exported: false, kpi_attainment: null,
    last_review_date: '2025-08-01', days_since_last_review: 14, sla_status: 'warning',
  },
  {
    id: 'proj-003', name: 'DevOps Automation PoC', state: 'scoped', owner: 'Maya Patel',
    risk_tier: 'low', control_pass_rate: 93, total_controls: 30, passed_controls: 28, failed_controls: 2,
    open_risks: 1, high_risks: 0, gates_completed: 1, gates_total: 4,
    data_classified: false, evidence_exported: false, kpi_attainment: null,
    last_review_date: null, days_since_last_review: null, sla_status: 'within',
  },
  {
    id: 'proj-004', name: 'Customer Support Chatbot', state: 'review_complete', owner: 'Alex Kim',
    risk_tier: 'medium', control_pass_rate: 96, total_controls: 30, passed_controls: 29, failed_controls: 1,
    open_risks: 1, high_risks: 0, gates_completed: 4, gates_total: 4,
    data_classified: true, evidence_exported: true, kpi_attainment: 91,
    last_review_date: '2025-08-12', days_since_last_review: 3, sla_status: 'within',
  },
  {
    id: 'proj-005', name: 'Data Analytics Copilot', state: 'data_approved', owner: 'Chen Wei',
    risk_tier: 'high', control_pass_rate: 60, total_controls: 30, passed_controls: 18, failed_controls: 12,
    open_risks: 8, high_risks: 4, gates_completed: 1, gates_total: 4,
    data_classified: true, evidence_exported: false, kpi_attainment: null,
    last_review_date: '2025-07-20', days_since_last_review: 26, sla_status: 'breached',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<RiskTier, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const SLA_COLORS: Record<string, string> = {
  within: 'text-green-600',
  warning: 'text-yellow-600',
  breached: 'text-red-600 font-semibold',
};

const STATE_LABELS: Record<string, string> = {
  draft: 'Draft',
  scoped: 'Scoped',
  data_approved: 'Data Approved',
  security_approved: 'Security Approved',
  pilot_running: 'Pilot Running',
  review_complete: 'Review Complete',
  decision_finalized: 'Decision Finalized',
};

function passRateColor(rate: number): string {
  if (rate >= 90) return 'text-green-600';
  if (rate >= 75) return 'text-yellow-600';
  return 'text-red-600';
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PortfolioPosturePage() {
  const [sortField, setSortField] = useState<'control_pass_rate' | 'open_risks' | 'name'>('control_pass_rate');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...DEMO_PROJECTS].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [sortField, sortAsc]);

  // Aggregate metrics
  const totalProjects = DEMO_PROJECTS.length;
  const avgPassRate = Math.round(DEMO_PROJECTS.reduce((s, p) => s + p.control_pass_rate, 0) / totalProjects);
  const totalOpenRisks = DEMO_PROJECTS.reduce((s, p) => s + p.open_risks, 0);
  const totalHighRisks = DEMO_PROJECTS.reduce((s, p) => s + p.high_risks, 0);
  const slaBreaches = DEMO_PROJECTS.filter((p) => p.sla_status === 'breached').length;
  const dataClassified = DEMO_PROJECTS.filter((p) => p.data_classified).length;

  function handleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Portfolio Control Posture</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cross-project governance, security, and compliance status for leadership review
        </p>
      </div>

      {/* Aggregate Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-lg bg-slate-100 p-4">
          <div className="text-2xl font-bold text-slate-800">{totalProjects}</div>
          <div className="text-xs text-slate-500 mt-1">Active Projects</div>
        </div>
        <div className={`rounded-lg p-4 ${avgPassRate >= 80 ? 'bg-green-100' : avgPassRate >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
          <div className={`text-2xl font-bold ${passRateColor(avgPassRate)}`}>{avgPassRate}%</div>
          <div className="text-xs text-slate-500 mt-1">Avg Control Pass Rate</div>
        </div>
        <div className="rounded-lg bg-orange-100 p-4">
          <div className="text-2xl font-bold text-orange-800">{totalOpenRisks}</div>
          <div className="text-xs text-slate-500 mt-1">Open Risks</div>
        </div>
        <div className={`rounded-lg p-4 ${totalHighRisks > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
          <div className={`text-2xl font-bold ${totalHighRisks > 0 ? 'text-red-800' : 'text-green-800'}`}>{totalHighRisks}</div>
          <div className="text-xs text-slate-500 mt-1">High/Critical Risks</div>
        </div>
        <div className={`rounded-lg p-4 ${slaBreaches > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
          <div className={`text-2xl font-bold ${slaBreaches > 0 ? 'text-red-800' : 'text-green-800'}`}>{slaBreaches}</div>
          <div className="text-xs text-slate-500 mt-1">SLA Breaches</div>
        </div>
        <div className="rounded-lg bg-blue-100 p-4">
          <div className="text-2xl font-bold text-blue-800">{dataClassified}/{totalProjects}</div>
          <div className="text-xs text-slate-500 mt-1">Data Classified</div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Risk Tier Distribution</h2>
        <div className="flex gap-4">
          {(['critical', 'high', 'medium', 'low'] as RiskTier[]).map((tier) => {
            const count = DEMO_PROJECTS.filter((p) => p.risk_tier === tier).length;
            return (
              <div key={tier} className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_COLORS[tier]}`}>
                  {tier}
                </span>
                <span className="text-sm font-medium text-slate-700">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Posture Table */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Project Posture Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th
                  className="text-left px-4 py-2 font-medium text-slate-600 cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('name')}
                >
                  Project {sortField === 'name' ? (sortAsc ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">State</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Owner</th>
                <th className="text-center px-4 py-2 font-medium text-slate-600">Risk Tier</th>
                <th
                  className="text-right px-4 py-2 font-medium text-slate-600 cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('control_pass_rate')}
                >
                  Controls {sortField === 'control_pass_rate' ? (sortAsc ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th
                  className="text-right px-4 py-2 font-medium text-slate-600 cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('open_risks')}
                >
                  Open Risks {sortField === 'open_risks' ? (sortAsc ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th className="text-center px-4 py-2 font-medium text-slate-600">Gates</th>
                <th className="text-center px-4 py-2 font-medium text-slate-600">Data</th>
                <th className="text-center px-4 py-2 font-medium text-slate-600">Evidence</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">KPI</th>
                <th className="text-center px-4 py-2 font-medium text-slate-600">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/projects/${p.id}/overview`} className="font-medium text-slate-900 hover:text-blue-600">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {STATE_LABELS[p.state] ?? p.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.owner}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_COLORS[p.risk_tier]}`}>
                      {p.risk_tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${passRateColor(p.control_pass_rate)}`}>
                      {p.control_pass_rate}%
                    </span>
                    <span className="text-xs text-slate-400 ml-1">
                      ({p.passed_controls}/{p.total_controls})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.high_risks > 0 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                      {p.open_risks}
                    </span>
                    {p.high_risks > 0 && (
                      <span className="text-xs text-red-500 ml-1">({p.high_risks} high)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={p.gates_completed === p.gates_total ? 'text-green-600' : 'text-slate-600'}>
                      {p.gates_completed}/{p.gates_total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.data_classified ? (
                      <span className="text-green-600 font-bold">&#10003;</span>
                    ) : (
                      <span className="text-red-500 font-bold">&#10007;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.evidence_exported ? (
                      <span className="text-green-600 font-bold">&#10003;</span>
                    ) : (
                      <span className="text-slate-300">\u2014</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.kpi_attainment !== null ? (
                      <span className={p.kpi_attainment >= 80 ? 'text-green-600' : p.kpi_attainment >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                        {p.kpi_attainment}%
                      </span>
                    ) : (
                      <span className="text-slate-300">\u2014</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-center text-xs ${SLA_COLORS[p.sla_status]}`}>
                    {p.sla_status === 'within' ? 'OK' : p.sla_status === 'warning' ? 'Warning' : 'BREACHED'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Items */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Priority Actions</h2>
        <div className="space-y-2">
          {DEMO_PROJECTS.filter((p) => p.sla_status === 'breached').map((p) => (
            <div key={`sla-${p.id}`} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">SLA Breach</span>
              <span className="text-sm text-slate-900">{p.name}</span>
              <span className="text-xs text-slate-500">{p.days_since_last_review} days since last review</span>
            </div>
          ))}
          {DEMO_PROJECTS.filter((p) => p.high_risks > 2).map((p) => (
            <div key={`risk-${p.id}`} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">High Risk</span>
              <span className="text-sm text-slate-900">{p.name}</span>
              <span className="text-xs text-slate-500">{p.high_risks} high/critical risks unresolved</span>
            </div>
          ))}
          {DEMO_PROJECTS.filter((p) => p.control_pass_rate < 70).map((p) => (
            <div key={`ctrl-${p.id}`} className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">Low Controls</span>
              <span className="text-sm text-slate-900">{p.name}</span>
              <span className="text-xs text-slate-500">{p.control_pass_rate}% pass rate ({p.failed_controls} failures)</span>
            </div>
          ))}
          {DEMO_PROJECTS.filter((p) => !p.data_classified).map((p) => (
            <div key={`data-${p.id}`} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">Missing</span>
              <span className="text-sm text-slate-900">{p.name}</span>
              <span className="text-xs text-slate-500">Data classification not completed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
