'use client';

import Link from 'next/link';
import { use } from 'react';
import {
  STATE_LABELS,
  STATE_ORDER,
  getStateProgress,
  getAvailableTransitions,
} from '@/lib/state-machine';
import type { ProjectState } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Demo State
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_STATE: ProjectState = 'scoped';

interface WorkspaceItem {
  title: string;
  description: string;
  href: string;
  status: 'complete' | 'in_progress' | 'not_started';
  required: boolean;
}

export default function PlanWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const items: WorkspaceItem[] = [
    {
      title: 'Pilot Wizard',
      description: 'Define business goal, use case, data scope, risk tier, and success metrics.',
      href: `/projects/${id}/pilot-setup`,
      status: 'complete',
      required: true,
    },
    {
      title: 'Success Metrics & KPIs',
      description: 'Set measurable targets with baseline values and measurement methods.',
      href: `/projects/${id}/metrics`,
      status: 'in_progress',
      required: true,
    },
    {
      title: 'Team & Owners',
      description: 'Assign accountable owners for each project role.',
      href: `/projects/${id}/team`,
      status: 'complete',
      required: true,
    },
    {
      title: 'Prerequisites Checklist',
      description: 'Verify infrastructure, tooling, and organizational readiness.',
      href: `/projects/${id}/discovery/prerequisites`,
      status: 'not_started',
      required: false,
    },
    {
      title: 'ROI Projection',
      description: 'Model expected costs, savings, and payback period.',
      href: `/projects/${id}/roi`,
      status: 'not_started',
      required: false,
    },
  ];

  const completedCount = items.filter((i) => i.status === 'complete').length;
  const totalRequired = items.filter((i) => i.required).length;
  const requiredComplete = items.filter((i) => i.required && i.status === 'complete').length;
  const progress = getStateProgress(DEMO_STATE);

  return (
    <div className="space-y-6 p-6">
      {/* Header with state machine context */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Plan</h1>
            <p className="text-sm text-slate-500">
              Business case, use case scope, success metrics, and owners
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {STATE_LABELS[DEMO_STATE]}
            </span>
            <div className="text-xs text-slate-400 mt-1">{progress}% through workflow</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${Math.round((completedCount / items.length) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>{completedCount}/{items.length} tasks complete</span>
          <span>{requiredComplete}/{totalRequired} required tasks done</span>
        </div>
      </div>

      {/* Primary CTA */}
      {items.find((i) => i.required && i.status !== 'complete') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-blue-900">Next Required Action</div>
            <div className="text-xs text-blue-700 mt-0.5">
              {items.find((i) => i.required && i.status !== 'complete')?.title}
            </div>
          </div>
          <Link
            href={items.find((i) => i.required && i.status !== 'complete')?.href ?? '#'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Continue
          </Link>
        </div>
      )}

      {/* Task Cards */}
      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block border border-slate-200 rounded-lg bg-white p-4 hover:border-slate-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status={item.status} />
                <div>
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.required && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">Required</span>
                )}
                <span className="text-slate-400">&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Available transitions */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Next State Transitions</h2>
        {getAvailableTransitions(DEMO_STATE).map((t) => (
          <div key={t.to} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div>
              <span className="text-sm font-medium text-slate-700">{t.label}</span>
              <span className="text-xs text-slate-400 ml-2">{t.description}</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Requires: {t.required_gates.length > 0 ? t.required_gates.join(', ') : 'role approval'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: 'complete' | 'in_progress' | 'not_started' }) {
  if (status === 'complete') {
    return <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">&#10003;</div>;
  }
  if (status === 'in_progress') {
    return <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">...</div>;
  }
  return <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">&bull;</div>;
}
