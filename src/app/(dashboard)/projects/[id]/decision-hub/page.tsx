'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Download, CheckCircle, AlertTriangle, XCircle, TrendingUp,
  Shield, BarChart3, Clock, Award,
} from 'lucide-react';

const DEMO_BRIEF = {
  recommendation: 'conditional_go' as const,
  confidence: 'high' as const,
  rationale: [
    'KPI attainment at 72% — approaching 80% threshold',
    'All governance gates approved or conditionally approved',
    'Developer satisfaction exceeds target (NPS 52 vs target 40)',
  ],
  risk_factors: [
    '1 high/critical risk remains open (prompt injection mitigation)',
    'Control pass rate at 87% — below 90% target',
  ],
  evidence_gaps: [
    'Launch review gate pending final approval',
  ],
  outcome_summary: [
    { metric: 'Developer Time Saved', target: 8, actual: 5.2, attainment: '65%' },
    { metric: 'Active Pilot Users', target: 10, actual: 12, attainment: '120%' },
    { metric: 'Test Coverage', target: 77, actual: 74, attainment: '96%' },
    { metric: 'Developer Satisfaction', target: 40, actual: 52, attainment: '130%' },
    { metric: 'Defect Rate', target: 2.5, actual: 3.1, attainment: '70%' },
    { metric: 'Cost Per Feature', target: 800, actual: 920, attainment: '70%' },
  ],
};

const DEMO_EVIDENCE = {
  artifacts: [
    { type: 'Policy', name: 'Acceptable Use Policy v2.1', status: 'verified', date: '2025-06-01' },
    { type: 'Gate Approval', name: 'Design Review — Approved', status: 'verified', date: '2025-05-28' },
    { type: 'Gate Approval', name: 'Data Approval — Approved', status: 'verified', date: '2025-06-05' },
    { type: 'Gate Approval', name: 'Security Review — Conditional', status: 'verified', date: '2025-06-10' },
    { type: 'Control Check', name: 'Security Controls Run (30 checks)', status: 'verified', date: '2025-06-12' },
    { type: 'Risk Assessment', name: 'AI Threat Model (16 threats)', status: 'verified', date: '2025-06-02' },
    { type: 'Data Classification', name: 'Data Asset Registry (12 assets)', status: 'verified', date: '2025-06-03' },
    { type: 'Audit Log', name: 'Critical Action Audit Trail', status: 'verified', date: '2025-06-14' },
    { type: 'Report', name: 'Executive Briefing PDF', status: 'pending', date: '2025-06-15' },
  ],
  completeness: 89,
};

const REC_CONFIG = {
  go: { label: 'GO', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200' },
  conditional_go: { label: 'CONDITIONAL GO', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle, bg: 'bg-yellow-50 border-yellow-200' },
  no_go: { label: 'NO GO', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, bg: 'bg-red-50 border-red-200' },
};

const CONFIDENCE_COLORS = {
  low: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function DecisionHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);
  const [activeTab, setActiveTab] = useState('brief');

  const recConfig = REC_CONFIG[DEMO_BRIEF.recommendation];
  const RecIcon = recConfig.icon;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Decision & Evidence Hub</h1>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Owned by: Executive Sponsor, Governance Consultant</span>
          <p className="text-slate-500 mt-1">Executive decision brief, outcome metrics, and governance evidence in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-slate-600">
            <Download className="h-4 w-4 mr-2" /> Export Package
          </Button>
        </div>
      </div>

      {/* Recommendation Banner */}
      <Card className={`border-2 ${recConfig.bg}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RecIcon className="h-10 w-10 text-slate-700" />
              <div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-lg px-3 py-1 ${recConfig.color}`}>{recConfig.label}</Badge>
                  <Badge className={CONFIDENCE_COLORS[DEMO_BRIEF.confidence]} variant="outline">
                    {DEMO_BRIEF.confidence.toUpperCase()} confidence
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Auto-generated recommendation based on KPI attainment, risk posture, control pass rates, and gate approvals.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Evidence Completeness</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={DEMO_EVIDENCE.completeness} className="w-24 h-2" />
                <span className="font-bold text-slate-900">{DEMO_EVIDENCE.completeness}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="brief" className="data-[state=active]:bg-white">Decision Brief</TabsTrigger>
          <TabsTrigger value="outcomes" className="data-[state=active]:bg-white">Outcome Metrics</TabsTrigger>
          <TabsTrigger value="evidence" className="data-[state=active]:bg-white">Evidence Package</TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-600" /> Supporting Rationale</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {DEMO_BRIEF.rationale.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-600" /> Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {DEMO_BRIEF.risk_factors.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                  {DEMO_BRIEF.evidence_gaps.map((r, i) => (
                    <li key={`gap-${i}`} className="flex items-start gap-2 text-sm text-slate-700">
                      <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outcomes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900">Outcome Metrics — Target vs Actual</CardTitle>
              <CardDescription className="text-slate-500">KPI performance tracked throughout the pilot period.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEMO_BRIEF.outcome_summary.map((m, i) => {
                  const pct = m.actual !== null ? Math.round((m.actual / m.target) * 100) : 0;
                  const isMet = pct >= 100;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-48 flex-shrink-0">
                        <p className="text-sm font-medium text-slate-900">{m.metric}</p>
                        <p className="text-xs text-slate-500">Target: {m.target}</p>
                      </div>
                      <div className="flex-1">
                        <Progress value={Math.min(pct, 100)} className="h-3" />
                      </div>
                      <div className="w-20 text-right">
                        <p className={`text-sm font-bold ${isMet ? 'text-emerald-700' : pct >= 70 ? 'text-yellow-700' : 'text-red-700'}`}>
                          {m.actual ?? '—'}
                        </p>
                        <p className="text-xs text-slate-500">{m.attainment}</p>
                      </div>
                      <div className="w-8">
                        {isMet ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : pct >= 70 ? <TrendingUp className="h-5 w-5 text-yellow-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Evidence Artifacts</CardTitle>
                  <CardDescription className="text-slate-500">{DEMO_EVIDENCE.artifacts.length} artifacts collected for audit trail and compliance.</CardDescription>
                </div>
                <Badge className="bg-slate-100 text-slate-700 border-slate-200" variant="outline">
                  {DEMO_EVIDENCE.artifacts.filter((a) => a.status === 'verified').length}/{DEMO_EVIDENCE.artifacts.length} verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DEMO_EVIDENCE.artifacts.map((artifact, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{artifact.name}</p>
                        <p className="text-xs text-slate-500">{artifact.type} — {artifact.date}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={artifact.status === 'verified' ? 'text-emerald-700 border-emerald-200' : 'text-yellow-700 border-yellow-200'}
                    >
                      {artifact.status === 'verified' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                      {artifact.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
