'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, FileCheck, AlertTriangle, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_DATA = {
  gates: [
    { type: 'Design Review', status: 'approved', evidence: 5, evidence_total: 5 },
    { type: 'Data Approval', status: 'approved', evidence: 4, evidence_total: 4 },
    { type: 'Security Review', status: 'conditionally_approved', evidence: 6, evidence_total: 7 },
    { type: 'Launch Review', status: 'pending', evidence: 1, evidence_total: 5 },
  ],
  controls: { total: 30, passed: 24, failed: 4, warnings: 2, pass_rate: 80 },
  risks: { total: 12, critical: 1, high: 2, medium: 5, low: 4, open: 8 },
  exceptions: { total: 3, approved: 1, pending: 1, expired: 1 },
  policies: { total: 4, approved: 2, draft: 1, review: 1 },
};

function GateStatusIcon({ status }: { status: string }): React.ReactElement {
  if (status === 'approved') return <CheckCircle className="h-5 w-5 text-emerald-600" />;
  if (status === 'conditionally_approved') return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  if (status === 'rejected') return <XCircle className="h-5 w-5 text-red-600" />;
  return <Clock className="h-5 w-5 text-slate-400" />;
}

function GateStatusBadge({ status }: { status: string }): React.ReactElement {
  const colors: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    conditionally_approved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const labels: Record<string, string> = {
    approved: 'Approved',
    conditionally_approved: 'Conditional',
    rejected: 'Rejected',
    pending: 'Pending',
  };
  return <Badge className={colors[status] ?? colors.pending} variant="outline">{labels[status] ?? 'Pending'}</Badge>;
}

export default function ControlCenterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: _projectId } = React.use(params);

  const gatesPassed = DEMO_DATA.gates.filter((g) => g.status === 'approved' || g.status === 'conditionally_approved').length;
  const gatesTotal = DEMO_DATA.gates.length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Governance Control Center</h1>
        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Owned by: IT / Security Lead, Legal Lead</span>
        <p className="text-slate-500 mt-1">Unified view of gates, controls, risks, and exceptions for this project.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100"><FileCheck className="h-5 w-5 text-blue-700" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{gatesPassed}/{gatesTotal}</p>
                <p className="text-sm text-slate-500">Gates Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100"><Shield className="h-5 w-5 text-emerald-700" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{DEMO_DATA.controls.pass_rate}%</p>
                <p className="text-sm text-slate-500">Control Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100"><AlertTriangle className="h-5 w-5 text-orange-700" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{DEMO_DATA.risks.critical + DEMO_DATA.risks.high}</p>
                <p className="text-sm text-slate-500">High/Critical Risks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100"><Clock className="h-5 w-5 text-yellow-700" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{DEMO_DATA.exceptions.pending}</p>
                <p className="text-sm text-slate-500">Pending Exceptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gate Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Governance Gates</CardTitle>
          <CardDescription className="text-slate-500">Required approval gates with evidence checklists. All gates must pass before launch.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DEMO_DATA.gates.map((gate, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <GateStatusIcon status={gate.status} />
                  <div>
                    <p className="font-medium text-slate-900">{gate.type}</p>
                    <p className="text-xs text-slate-500">Evidence: {gate.evidence}/{gate.evidence_total} artifacts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={(gate.evidence / gate.evidence_total) * 100} className="w-24 h-2" />
                  <GateStatusBadge status={gate.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls & Risks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Security Controls</CardTitle>
              <Button variant="ghost" size="sm" className="text-slate-500">View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Pass Rate</span>
                <span className="font-bold text-slate-900">{DEMO_DATA.controls.pass_rate}%</span>
              </div>
              <Progress value={DEMO_DATA.controls.pass_rate} className="h-3" />
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-2 rounded bg-emerald-50">
                  <p className="text-lg font-bold text-emerald-700">{DEMO_DATA.controls.passed}</p>
                  <p className="text-xs text-emerald-600">Passed</p>
                </div>
                <div className="text-center p-2 rounded bg-red-50">
                  <p className="text-lg font-bold text-red-700">{DEMO_DATA.controls.failed}</p>
                  <p className="text-xs text-red-600">Failed</p>
                </div>
                <div className="text-center p-2 rounded bg-yellow-50">
                  <p className="text-lg font-bold text-yellow-700">{DEMO_DATA.controls.warnings}</p>
                  <p className="text-xs text-yellow-600">Warnings</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Risk Posture</CardTitle>
              <Button variant="ghost" size="sm" className="text-slate-500">View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Risks</span>
                <span className="font-bold text-slate-900">{DEMO_DATA.risks.total}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded bg-red-50">
                  <p className="text-lg font-bold text-red-700">{DEMO_DATA.risks.critical}</p>
                  <p className="text-xs text-red-600">Critical</p>
                </div>
                <div className="text-center p-2 rounded bg-orange-50">
                  <p className="text-lg font-bold text-orange-700">{DEMO_DATA.risks.high}</p>
                  <p className="text-xs text-orange-600">High</p>
                </div>
                <div className="text-center p-2 rounded bg-yellow-50">
                  <p className="text-lg font-bold text-yellow-700">{DEMO_DATA.risks.medium}</p>
                  <p className="text-xs text-yellow-600">Medium</p>
                </div>
                <div className="text-center p-2 rounded bg-slate-50">
                  <p className="text-lg font-bold text-slate-600">{DEMO_DATA.risks.low}</p>
                  <p className="text-xs text-slate-500">Low</p>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-700 border-slate-200" variant="outline">{DEMO_DATA.risks.open} open</Badge>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200" variant="outline">{DEMO_DATA.risks.total - DEMO_DATA.risks.open} resolved</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exceptions Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Active Exceptions</CardTitle>
              <CardDescription className="text-slate-500">Time-bound risk and control exceptions with compensating controls.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-slate-600">Manage Exceptions <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{DEMO_DATA.exceptions.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-50">
              <p className="text-2xl font-bold text-emerald-700">{DEMO_DATA.exceptions.approved}</p>
              <p className="text-xs text-emerald-600">Approved</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-50">
              <p className="text-2xl font-bold text-yellow-700">{DEMO_DATA.exceptions.pending}</p>
              <p className="text-xs text-yellow-600">Pending</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50">
              <p className="text-2xl font-bold text-red-700">{DEMO_DATA.exceptions.expired}</p>
              <p className="text-xs text-red-600">Expired</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
