'use client';

import Link from 'next/link';
import { use } from 'react';
import { STATE_LABELS, getStateProgress } from '@/lib/state-machine';
import type { ProjectState, GovernanceGateType, GovernanceGateDecision, RiskTier } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Demo State
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_STATE: ProjectState = 'data_approved';

interface GateStatus {
  gate_type: GovernanceGateType;
  label: string;
  decision: GovernanceGateDecision;
  reviewer: string | null;
  decided_at: string | null;
}

const DEMO_GATES: GateStatus[] = [
  { gate_type: 'design_review', label: 'Design Review', decision: 'approved', reviewer: 'Sarah Chen', decided_at: '2025-07-20' },
  { gate_type: 'data_approval', label: 'Data Approval', decision: 'approved', reviewer: 'Maya Patel', decided_at: '2025-07-25' },
  { gate_type: 'security_review', label: 'Security Review', decision: 'pending', reviewer: null, decided_at: null },
  { gate_type: 'launch_review', label: 'Launch Review', decision: 'pending', reviewer: null, decided_at: null },
];

const DEMO_RISKS = [
  { id: 'r1', title: 'PII data exposure via prompt injection', severity: 'high' as RiskTier, owner: 'Security Team', status: 'open', due: '2025-08-15' },
  { id: 'r2', title: 'Model output contains hallucinated PII', severity: 'medium' as RiskTier, owner: 'Maya Patel', status: 'mitigated', due: '2025-08-01' },
  { id: 'r3', title: 'Unauthorized model API access', severity: 'low' as RiskTier, owner: 'IT Ops', status: 'accepted', due: null },
];

const RISK_COLORS: Record<RiskTier, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const DECISION_COLORS: Record<GovernanceGateDecision, string> = {
  approved: 'bg-green-100 text-green-800',
  conditionally_approved: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-slate-100 text-slate-600',
  rejected: 'bg-red-100 text-red-800',
  deferred: 'bg-slate-100 text-slate-500',
};

export default function GovernWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const gatesPassed = DEMO_GATES.filter((g) => g.decision === 'approved' || g.decision === 'conditionally_approved').length;
  const nextGate = DEMO_GATES.find((g) => g.decision === 'pending');
  const openHighRisks = DEMO_RISKS.filter((r) => (r.severity === 'high' || r.severity === 'critical') && r.status === 'open').length;

  const govItems = [
    { title: 'Data Classification', href: `/projects/${id}/governance/data-classification`, status: 'complete' as const },
    { title: 'Policies', href: `/projects/${id}/governance/policies`, status: 'complete' as const },
    { title: 'Risk Register', href: `/projects/${id}/governance/risk`, status: 'in_progress' as const },
    { title: 'Compliance Mapping', href: `/projects/${id}/governance/compliance`, status: 'in_progress' as const },
    { title: 'Security Controls', href: `/projects/${id}/governance/security-controls`, status: 'not_started' as const },
    { title: 'RACI Matrix', href: `/projects/${id}/governance/raci`, status: 'complete' as const },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Govern</h1>
            <p className="text-sm text-slate-500">
              Data classification, risk register, policy checks, and gate approvals
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {STATE_LABELS[DEMO_STATE]}
          </span>
        </div>
      </div>

      {/* Primary CTA */}
      {nextGate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-yellow-900">Next Required Gate</div>
            <div className="text-xs text-yellow-700 mt-0.5">
              {nextGate.label} — submit for review
            </div>
          </div>
          <Link
            href={`/projects/${id}/governance/gates`}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
          >
            Submit {nextGate.label}
          </Link>
        </div>
      )}

      {/* Gate Approval Chain */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Gate Approvals ({gatesPassed}/{DEMO_GATES.length} passed)
        </h2>
        <div className="flex gap-2">
          {DEMO_GATES.map((gate, i) => (
            <div key={gate.gate_type} className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                {i > 0 && <div className={`h-0.5 flex-1 ${gate.decision === 'approved' || gate.decision === 'conditionally_approved' ? 'bg-green-400' : 'bg-slate-200'}`} />}
              </div>
              <div className={`rounded-lg p-3 text-center ${DECISION_COLORS[gate.decision]}`}>
                <div className="text-xs font-medium">{gate.label}</div>
                <div className="text-xs mt-1 opacity-80">
                  {gate.decision === 'approved' ? `${gate.reviewer}` : gate.decision}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Summary */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Risk Register ({DEMO_RISKS.length} risks, {openHighRisks} high/critical open)
          </h2>
          <Link href={`/projects/${id}/governance/risk`} className="text-xs text-blue-600 hover:text-blue-800">
            View all &rarr;
          </Link>
        </div>
        <div className="space-y-2">
          {DEMO_RISKS.map((risk) => (
            <div key={risk.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_COLORS[risk.severity]}`}>
                  {risk.severity}
                </span>
                <span className="text-sm text-slate-700">{risk.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{risk.owner}</span>
                <span className={`text-xs font-medium ${risk.status === 'open' ? 'text-red-600' : risk.status === 'mitigated' ? 'text-green-600' : 'text-slate-500'}`}>
                  {risk.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Tasks */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Governance Tasks</h2>
        <div className="space-y-2">
          {govItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <StatusDot status={item.status} />
                <span className="text-sm text-slate-700">{item.title}</span>
              </div>
              <span className="text-slate-400">&rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: 'complete' | 'in_progress' | 'not_started' }) {
  const colors = {
    complete: 'bg-green-500',
    in_progress: 'bg-blue-500',
    not_started: 'bg-slate-300',
  };
  return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
}
