'use client';

import Link from 'next/link';
import { use } from 'react';
import { STATE_LABELS } from '@/lib/state-machine';
import type { ProjectState } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_STATE: ProjectState = 'pilot_running';

interface MilestoneItem {
  title: string;
  due: string;
  status: 'complete' | 'in_progress' | 'upcoming';
  owner: string;
}

const DEMO_MILESTONES: MilestoneItem[] = [
  { title: 'Sandbox environment provisioned', due: '2025-07-10', status: 'complete', owner: 'IT Ops' },
  { title: 'Pilot team onboarded', due: '2025-07-20', status: 'complete', owner: 'Sarah Chen' },
  { title: 'Sprint 1 complete (baseline capture)', due: '2025-08-03', status: 'complete', owner: 'James Rodriguez' },
  { title: 'Sprint 2 complete (AI-assisted)', due: '2025-08-17', status: 'in_progress', owner: 'James Rodriguez' },
  { title: 'Sprint 3 complete (comparison)', due: '2025-08-31', status: 'upcoming', owner: 'James Rodriguez' },
  { title: 'Pilot review meeting', due: '2025-09-05', status: 'upcoming', owner: 'Sarah Chen' },
];

interface ControlCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  category: string;
}

const DEMO_CONTROLS: ControlCheck[] = [
  { name: 'MFA Enabled', status: 'pass', category: 'Auth' },
  { name: 'Model Allowlist', status: 'pass', category: 'Model' },
  { name: 'Egress Restrictions', status: 'pass', category: 'Network' },
  { name: 'Audit Logging Active', status: 'pass', category: 'Logging' },
  { name: 'Data Retention Policy', status: 'warning', category: 'Data' },
  { name: 'Output Validation', status: 'fail', category: 'Model' },
];

const CHECK_COLORS = {
  pass: 'text-green-600',
  fail: 'text-red-600',
  warning: 'text-yellow-600',
};

export default function ExecuteWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const completed = DEMO_MILESTONES.filter((m) => m.status === 'complete').length;
  const controlsPassed = DEMO_CONTROLS.filter((c) => c.status === 'pass').length;
  const controlsFailed = DEMO_CONTROLS.filter((c) => c.status === 'fail').length;
  const currentMilestone = DEMO_MILESTONES.find((m) => m.status === 'in_progress');

  const executeItems = [
    { title: 'Sandbox Configuration', href: `/projects/${id}/sandbox/configure`, description: 'Infrastructure setup and config files' },
    { title: 'Sandbox Validation', href: `/projects/${id}/sandbox/validate`, description: 'Health checks and environment verification' },
    { title: 'Sprint Tracker', href: `/projects/${id}/poc/sprints`, description: 'Sprint-by-sprint evaluation data' },
    { title: 'Timeline & Gantt', href: `/projects/${id}/timeline/gantt`, description: 'Task dependencies and scheduling' },
    { title: 'Tool Comparison', href: `/projects/${id}/poc/compare`, description: 'Head-to-head AI tool evaluation' },
    { title: 'Monitoring', href: `/projects/${id}/monitoring`, description: 'Live performance and drift detection' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Execute</h1>
            <p className="text-sm text-slate-500">
              Pilot backlog, milestones, dependencies, and readiness checks
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
            {STATE_LABELS[DEMO_STATE]}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${Math.round((completed / DEMO_MILESTONES.length) * 100)}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-2">
          {completed}/{DEMO_MILESTONES.length} milestones complete
        </div>
      </div>

      {/* Primary CTA */}
      {currentMilestone && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-green-900">Current Milestone</div>
            <div className="text-xs text-green-700 mt-0.5">
              {currentMilestone.title} — Due {currentMilestone.due}
            </div>
          </div>
          <Link
            href={`/projects/${id}/timeline/milestones`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            View Milestones
          </Link>
        </div>
      )}

      {/* Two-column: Milestones + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Milestone Timeline */}
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Milestone Progress</h2>
          <div className="space-y-3">
            {DEMO_MILESTONES.map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    m.status === 'complete' ? 'bg-green-500' :
                    m.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
                  }`} />
                  {i < DEMO_MILESTONES.length - 1 && (
                    <div className={`w-0.5 h-6 ${m.status === 'complete' ? 'bg-green-300' : 'bg-slate-200'}`} />
                  )}
                </div>
                <div className="flex-1 -mt-0.5">
                  <div className="text-sm font-medium text-slate-700">{m.title}</div>
                  <div className="text-xs text-slate-400">{m.due} &middot; {m.owner}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Control Checks */}
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Control Baseline ({controlsPassed}/{DEMO_CONTROLS.length} passing)
            </h2>
            {controlsFailed > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                {controlsFailed} failing
              </span>
            )}
          </div>
          <div className="space-y-2">
            {DEMO_CONTROLS.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${CHECK_COLORS[c.status]}`}>
                    {c.status === 'pass' ? '\u2713' : c.status === 'fail' ? '\u2717' : '\u26A0'}
                  </span>
                  <span className="text-sm text-slate-700">{c.name}</span>
                </div>
                <span className="text-xs text-slate-400">{c.category}</span>
              </div>
            ))}
          </div>
          <Link
            href={`/projects/${id}/governance/security-controls`}
            className="block mt-3 text-xs text-blue-600 hover:text-blue-800"
          >
            View full control dashboard &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {executeItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border border-slate-200 rounded-lg bg-white p-4 hover:border-slate-400 transition-colors"
          >
            <div className="font-medium text-slate-900 text-sm">{item.title}</div>
            <div className="text-xs text-slate-500 mt-1">{item.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
