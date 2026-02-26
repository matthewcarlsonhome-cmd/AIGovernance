'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { generateDemoExecutiveBrief } from '@/lib/report-gen/executive-brief';
import {
  CheckCircle, AlertTriangle, XCircle, Download, Printer,
  Shield, BarChart3, FileCheck, ArrowRight,
} from 'lucide-react';

export default function ExecutiveBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);
  const brief = generateDemoExecutiveBrief(projectId);

  const recConfig = {
    go: { label: 'GO', color: 'bg-emerald-600 text-white', bgCard: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
    conditional_go: { label: 'CONDITIONAL GO', color: 'bg-yellow-500 text-white', bgCard: 'bg-yellow-50 border-yellow-200', icon: AlertTriangle },
    no_go: { label: 'NO GO', color: 'bg-red-600 text-white', bgCard: 'bg-red-50 border-red-200', icon: XCircle },
  }[brief.recommendation];

  const RecIcon = recConfig.icon;

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Decision Brief</h1>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Owned by: Executive Sponsor</span>
          <p className="text-slate-500 mt-1">One-page go/no-go recommendation with evidence summary.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-slate-600"><Printer className="h-4 w-4 mr-2" /> Print</Button>
          <Button variant="outline" className="text-slate-600"><Download className="h-4 w-4 mr-2" /> Export PDF</Button>
        </div>
      </div>

      {/* Recommendation Header */}
      <Card className={`border-2 ${recConfig.bgCard}`}>
        <CardContent className="p-8 text-center">
          <RecIcon className="h-16 w-16 mx-auto mb-4 text-slate-700" />
          <Badge className={`text-xl px-6 py-2 ${recConfig.color}`}>{recConfig.label}</Badge>
          <p className="text-slate-700 mt-4 max-w-2xl mx-auto">{brief.recommendation_rationale}</p>
          <p className="text-xs text-slate-400 mt-3">Generated {new Date(brief.generated_at).toLocaleString()} — Trace: {brief.trace_id.slice(0, 8)}</p>
        </CardContent>
      </Card>

      {/* Three Column Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Value Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" /> Value Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-700">{brief.value_summary.kpi_attainment_pct ?? '—'}%</p>
              <p className="text-xs text-blue-600">KPI Attainment</p>
            </div>
            {brief.value_summary.top_wins.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Top Wins</p>
                {brief.value_summary.top_wins.map((w, i) => (
                  <p key={i} className="text-xs text-emerald-700 flex items-start gap-1 mb-1">
                    <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" /> {w}
                  </p>
                ))}
              </div>
            )}
            {brief.value_summary.concerns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Concerns</p>
                {brief.value_summary.concerns.map((c, i) => (
                  <p key={i} className="text-xs text-orange-700 flex items-start gap-1 mb-1">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" /> {c}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Posture */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" /> Risk Posture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-slate-50">
                <p className="text-xl font-bold text-slate-900">{brief.risk_posture.total_risks}</p>
                <p className="text-xs text-slate-500">Total Risks</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-red-50">
                <p className="text-xl font-bold text-red-700">{brief.risk_posture.high_critical_open}</p>
                <p className="text-xs text-red-600">High/Critical</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Control Pass Rate</span>
                <span className="font-bold text-slate-900">{brief.risk_posture.control_pass_rate}%</span>
              </div>
              <Progress value={brief.risk_posture.control_pass_rate} className="h-2" />
            </div>
            {brief.risk_posture.unresolved_items.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Unresolved</p>
                {brief.risk_posture.unresolved_items.map((item, i) => (
                  <p key={i} className="text-xs text-red-700 flex items-start gap-1 mb-1">
                    <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" /> {item}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Governance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" /> Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center p-3 rounded-lg bg-emerald-50">
              <p className="text-2xl font-bold text-emerald-700">{brief.governance_status.gates_passed}/{brief.governance_status.gates_total}</p>
              <p className="text-xs text-emerald-600">Gates Passed</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Data Classified</span>
                {brief.governance_status.data_classified
                  ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                  : <XCircle className="h-4 w-4 text-red-600" />}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Evidence Exported</span>
                {brief.governance_status.evidence_exported
                  ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                  : <XCircle className="h-4 w-4 text-red-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {brief.next_steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-900 text-white text-xs font-bold">{i + 1}</div>
                <span className="text-slate-700">{step}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
