'use client';

import Link from 'next/link';
import { use, useMemo } from 'react';
import { STATE_LABELS, getStateProgress } from '@/lib/state-machine';
import type { ProjectState, RiskTier, GovernanceGateDecision } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data — Decision Package
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_STATE: ProjectState = 'review_complete';

interface DecisionItem {
  category: string;
  question: string;
  answer: string;
  evidence_link: string | null;
  status: 'green' | 'yellow' | 'red';
}

const DECISION_ITEMS: DecisionItem[] = [
  {
    category: 'Value',
    question: 'Did the pilot deliver measurable business value?',
    answer: 'Yes — 65% attainment across 6 KPIs. Developer time saved exceeds target. Cost per feature still improving.',
    evidence_link: '/metrics',
    status: 'green',
  },
  {
    category: 'Risk',
    question: 'Are residual risks within acceptable tolerance?',
    answer: '1 high risk (prompt injection) mitigated with input filtering. No critical open risks.',
    evidence_link: '/governance/risk',
    status: 'yellow',
  },
  {
    category: 'Controls',
    question: 'Do security controls pass baseline requirements?',
    answer: '87% pass rate (26/30 controls). 1 failed control has documented exception.',
    evidence_link: '/governance/security-controls',
    status: 'yellow',
  },
  {
    category: 'Data',
    question: 'Is data classification and handling compliant?',
    answer: 'All data assets classified. PII handling approved. No restricted data in scope.',
    evidence_link: '/governance/data-classification',
    status: 'green',
  },
  {
    category: 'Gates',
    question: 'Have all required governance gates been passed?',
    answer: '3 of 4 gates approved. Launch review pending final decision.',
    evidence_link: '/governance/gates',
    status: 'yellow',
  },
  {
    category: 'Adoption',
    question: 'Is user adoption sufficient for scale decision?',
    answer: '12 active users (120% of target). Developer satisfaction NPS: 52.',
    evidence_link: '/metrics',
    status: 'green',
  },
];

const STATUS_COLORS = {
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS = {
  green: 'Approved',
  yellow: 'Pending',
  red: 'Blocked',
};

export default function DecideWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const greenCount = DECISION_ITEMS.filter((d) => d.status === 'green').length;
  const yellowCount = DECISION_ITEMS.filter((d) => d.status === 'yellow').length;
  const redCount = DECISION_ITEMS.filter((d) => d.status === 'red').length;

  const recommendation = useMemo(() => {
    if (redCount > 0) return { label: 'No-Go', color: 'bg-red-600 text-white', description: 'Critical blockers must be resolved before proceeding.' };
    if (yellowCount > 2) return { label: 'Conditional Go', color: 'bg-yellow-500 text-white', description: 'Proceed with documented conditions and remediation timeline.' };
    return { label: 'Go', color: 'bg-green-600 text-white', description: 'All criteria met. Recommend proceeding to production path.' };
  }, [redCount, yellowCount]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Decide</h1>
            <p className="text-sm text-slate-500">
              Go/no-go recommendation with evidence and compliance outputs
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {STATE_LABELS[DEMO_STATE]}
          </span>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className={`rounded-lg p-6 ${recommendation.color}`}>
        <div className="text-sm font-medium opacity-80">System Recommendation</div>
        <div className="text-3xl font-bold mt-1">{recommendation.label}</div>
        <div className="text-sm mt-2 opacity-90">{recommendation.description}</div>
        <div className="flex gap-4 mt-4 text-sm">
          <span>{greenCount} criteria met</span>
          <span>{yellowCount} pending</span>
          <span>{redCount} blocked</span>
        </div>
      </div>

      {/* Decision Checklist */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Decision Criteria</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every decision links to evidence and accountable ownership
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {DECISION_ITEMS.map((item, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[item.status]}`}>
                      {item.category}
                    </span>
                    <span className={`text-xs font-medium ${STATUS_COLORS[item.status].split(' ')[1]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-900 mt-1">{item.question}</div>
                  <div className="text-sm text-slate-600 mt-1">{item.answer}</div>
                </div>
                {item.evidence_link && (
                  <Link
                    href={`/projects/${id}${item.evidence_link}`}
                    className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    View evidence &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href={`/projects/${id}/reports/generate`}
          className="border border-slate-200 rounded-lg bg-white p-4 hover:border-slate-400 transition-colors"
        >
          <div className="font-medium text-slate-900 text-sm">Executive Decision Brief</div>
          <div className="text-xs text-slate-500 mt-1">
            One-page value trend, risk posture, and recommendation
          </div>
        </Link>
        <Link
          href={`/projects/${id}/reports/evidence`}
          className="border border-slate-200 rounded-lg bg-white p-4 hover:border-slate-400 transition-colors"
        >
          <div className="font-medium text-slate-900 text-sm">Governance Evidence Pack</div>
          <div className="text-xs text-slate-500 mt-1">
            Control status, approvals, policy mappings, audit log
          </div>
        </Link>
        <Link
          href={`/projects/${id}/metrics`}
          className="border border-slate-200 rounded-lg bg-white p-4 hover:border-slate-400 transition-colors"
        >
          <div className="font-medium text-slate-900 text-sm">Pilot Outcome Review</div>
          <div className="text-xs text-slate-500 mt-1">
            KPI baseline vs actual, lessons learned, scale recommendation
          </div>
        </Link>
      </div>

      {/* Finalize Action */}
      <div className="border border-slate-200 rounded-lg bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Ready to Finalize?</h2>
        <p className="text-sm text-slate-500 mb-4">
          Record the go/no-go decision with rationale. This action is audited and cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            Approve — Go
          </button>
          <button className="px-6 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600">
            Conditional Go
          </button>
          <button className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
            No-Go
          </button>
        </div>
      </div>
    </div>
  );
}
