'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface HeatmapProject {
  id: string;
  name: string;
  state: string;
  risk_score: number;
  control_pass_rate: number;
  kpi_attainment: number | null;
  decision: string | null;
  blockers: number;
  days_in_state: number;
}

const DEMO_PROJECTS: HeatmapProject[] = [
  { id: 'p1', name: 'AI Coding Assistant', state: 'pilot_running', risk_score: 35, control_pass_rate: 87, kpi_attainment: 72, decision: null, blockers: 1, days_in_state: 14 },
  { id: 'p2', name: 'Document Summarizer', state: 'security_approved', risk_score: 22, control_pass_rate: 93, kpi_attainment: null, decision: null, blockers: 0, days_in_state: 5 },
  { id: 'p3', name: 'Customer Support Bot', state: 'data_approved', risk_score: 68, control_pass_rate: 62, kpi_attainment: null, decision: null, blockers: 3, days_in_state: 21 },
  { id: 'p4', name: 'Code Review Agent', state: 'decision_finalized', risk_score: 15, control_pass_rate: 96, kpi_attainment: 91, decision: 'go', blockers: 0, days_in_state: 3 },
  { id: 'p5', name: 'Data Pipeline Assistant', state: 'scoped', risk_score: 45, control_pass_rate: 0, kpi_attainment: null, decision: null, blockers: 2, days_in_state: 8 },
  { id: 'p6', name: 'Compliance Checker', state: 'review_complete', risk_score: 28, control_pass_rate: 88, kpi_attainment: 65, decision: 'conditional_go', blockers: 1, days_in_state: 7 },
];

const STATE_LABELS: Record<string, string> = {
  draft: 'Draft', scoped: 'Scoped', data_approved: 'Data Approved',
  security_approved: 'Security Approved', pilot_running: 'Pilot Running',
  review_complete: 'Review Complete', decision_finalized: 'Decision Finalized',
};

const DECISION_COLORS: Record<string, string> = {
  go: 'bg-emerald-100 text-emerald-800',
  conditional_go: 'bg-yellow-100 text-yellow-800',
  no_go: 'bg-red-100 text-red-800',
};

function getHealthColor(riskScore: number, controlRate: number): string {
  if (riskScore >= 60 || controlRate < 50) return 'bg-red-100 border-red-300';
  if (riskScore >= 40 || controlRate < 70) return 'bg-orange-100 border-orange-300';
  if (riskScore >= 25 || controlRate < 85) return 'bg-yellow-100 border-yellow-300';
  return 'bg-emerald-100 border-emerald-300';
}

function getHealthLabel(riskScore: number, controlRate: number): { label: string; color: string } {
  if (riskScore >= 60 || controlRate < 50) return { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' };
  if (riskScore >= 40 || controlRate < 70) return { label: 'At Risk', color: 'bg-orange-100 text-orange-800 border-orange-200' };
  if (riskScore >= 25 || controlRate < 85) return { label: 'Caution', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  return { label: 'Healthy', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
}

export default function PortfolioHeatmapPage() {
  const stageDistribution = Object.entries(STATE_LABELS).map(([key, label]) => ({
    name: label,
    count: DEMO_PROJECTS.filter((p) => p.state === key).length,
  })).filter((d) => d.count > 0);

  const decisionData = [
    { name: 'Go', value: DEMO_PROJECTS.filter((p) => p.decision === 'go').length, fill: '#059669' },
    { name: 'Conditional', value: DEMO_PROJECTS.filter((p) => p.decision === 'conditional_go').length, fill: '#d97706' },
    { name: 'No Go', value: DEMO_PROJECTS.filter((p) => p.decision === 'no_go').length, fill: '#dc2626' },
    { name: 'Pending', value: DEMO_PROJECTS.filter((p) => !p.decision).length, fill: '#94a3b8' },
  ].filter((d) => d.value > 0);

  const avgControlRate = Math.round(
    DEMO_PROJECTS.reduce((s, p) => s + p.control_pass_rate, 0) / DEMO_PROJECTS.length
  );
  const totalBlockers = DEMO_PROJECTS.reduce((s, p) => s + p.blockers, 0);
  const healthyCount = DEMO_PROJECTS.filter((p) => p.risk_score < 25 && p.control_pass_rate >= 85).length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Portfolio Heatmap</h1>
        <p className="text-slate-500 mt-1">Cross-project governance posture, risk levels, and decision outcomes.</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-slate-900">{DEMO_PROJECTS.length}</p>
            <p className="text-sm text-slate-500">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-emerald-700">{healthyCount}</p>
            <p className="text-sm text-slate-500">Healthy Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-slate-900">{avgControlRate}%</p>
            <p className="text-sm text-slate-500">Avg Control Pass Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-orange-600">{totalBlockers}</p>
            <p className="text-sm text-slate-500">Total Blockers</p>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Project Health Matrix</CardTitle>
          <CardDescription className="text-slate-500">Each project is color-coded by combined risk score and control pass rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_PROJECTS.map((project) => {
              const health = getHealthLabel(project.risk_score, project.control_pass_rate);
              const healthBg = getHealthColor(project.risk_score, project.control_pass_rate);
              return (
                <div key={project.id} className={`p-4 rounded-lg border-2 ${healthBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-900 truncate">{project.name}</h3>
                    <Badge className={health.color} variant="outline">{health.label}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Stage</span>
                      <span className="font-medium text-slate-900">{STATE_LABELS[project.state] ?? project.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Risk Score</span>
                      <span className="font-medium text-slate-900">{project.risk_score}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Controls</span>
                      <div className="flex items-center gap-2">
                        <Progress value={project.control_pass_rate} className="w-16 h-2" />
                        <span className="font-medium text-slate-900">{project.control_pass_rate}%</span>
                      </div>
                    </div>
                    {project.kpi_attainment !== null && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">KPI Attainment</span>
                        <span className="font-medium text-slate-900">{project.kpi_attainment}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Blockers</span>
                      <span className={`font-medium ${project.blockers > 0 ? 'text-orange-700' : 'text-emerald-700'}`}>{project.blockers}</span>
                    </div>
                    {project.decision && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Decision</span>
                        <Badge className={DECISION_COLORS[project.decision]} variant="outline">
                          {project.decision === 'go' ? 'Go' : project.decision === 'conditional_go' ? 'Conditional' : 'No Go'}
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Days in State</span>
                      <span className={`font-medium ${project.days_in_state > 14 ? 'text-orange-700' : 'text-slate-700'}`}>{project.days_in_state}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900">Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stageDistribution}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900">Decision Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={decisionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}>
                  {decisionData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
