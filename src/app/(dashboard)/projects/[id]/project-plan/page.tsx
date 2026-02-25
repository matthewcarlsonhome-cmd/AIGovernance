'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Filter,
  Ban,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectOption } from '@/components/ui/select';
import type { UserRole } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type PlanTaskStatus = 'complete' | 'in_progress' | 'not_started' | 'blocked';
type PhaseStatus = 'complete' | 'in_progress' | 'not_started';

interface PlanTask {
  id: string;
  title: string;
  assignedRole: string;
  roleKey: UserRole | 'multiple';
  dueDate: string;
  completionDate?: string;
  status: PlanTaskStatus;
  blockedBy?: string;
}

interface Phase {
  number: number;
  name: string;
  status: PhaseStatus;
  completionDate?: string;
  tasks: PlanTask[];
}

/* -------------------------------------------------------------------------- */
/*  Role labels                                                               */
/* -------------------------------------------------------------------------- */

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Project Administrator',
  consultant: 'Governance Consultant',
  executive: 'Executive Sponsor',
  it: 'IT / Security Lead',
  legal: 'Legal / Compliance Lead',
  engineering: 'Engineering Lead',
  marketing: 'Communications Lead',
};

const ROLE_BADGE_LABELS: Record<string, string> = {
  admin: 'Admin',
  consultant: 'Consultant',
  executive: 'Exec Sponsor',
  it: 'IT Lead',
  legal: 'Legal Lead',
  engineering: 'Eng Lead',
  marketing: 'Comms Lead',
  multiple: 'Multiple',
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  consultant: 'bg-blue-100 text-blue-800',
  executive: 'bg-amber-100 text-amber-800',
  it: 'bg-emerald-100 text-emerald-800',
  legal: 'bg-rose-100 text-rose-800',
  engineering: 'bg-indigo-100 text-indigo-800',
  marketing: 'bg-teal-100 text-teal-800',
  multiple: 'bg-slate-100 text-slate-700',
};

/* -------------------------------------------------------------------------- */
/*  Demo data — 33 tasks across 5 phases                                     */
/* -------------------------------------------------------------------------- */

const PHASES: Phase[] = [
  {
    number: 1,
    name: 'Scope & Assess',
    status: 'complete',
    completionDate: '2026-02-10',
    tasks: [
      { id: 'p1-1', title: 'Complete intake scorecard', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-02-05', completionDate: '2026-02-05', status: 'complete' },
      { id: 'p1-2', title: 'Run discovery questionnaire', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-02-06', completionDate: '2026-02-06', status: 'complete' },
      { id: 'p1-3', title: 'Review readiness assessment', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-02-08', completionDate: '2026-02-08', status: 'complete' },
      { id: 'p1-4', title: 'Complete prerequisites', assignedRole: 'Admin', roleKey: 'admin', dueDate: '2026-02-09', completionDate: '2026-02-09', status: 'complete' },
      { id: 'p1-5', title: 'Assign project team', assignedRole: 'Admin', roleKey: 'admin', dueDate: '2026-02-04', completionDate: '2026-02-04', status: 'complete' },
      { id: 'p1-6', title: 'Data readiness review', assignedRole: 'IT Lead', roleKey: 'it', dueDate: '2026-02-10', completionDate: '2026-02-10', status: 'complete' },
    ],
  },
  {
    number: 2,
    name: 'Classify & Govern',
    status: 'in_progress',
    tasks: [
      { id: 'p2-1', title: 'Data classification', assignedRole: 'IT Lead', roleKey: 'it', dueDate: '2026-02-14', completionDate: '2026-02-14', status: 'complete' },
      { id: 'p2-2', title: 'Risk register', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-02-16', completionDate: '2026-02-16', status: 'complete' },
      { id: 'p2-3', title: 'RACI matrix', assignedRole: 'Admin', roleKey: 'admin', dueDate: '2026-02-18', completionDate: '2026-02-18', status: 'complete' },
      { id: 'p2-4', title: 'AUP policy draft', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-02-20', completionDate: '2026-02-20', status: 'complete' },
      { id: 'p2-5', title: 'IRP addendum draft', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-02-20', completionDate: '2026-02-20', status: 'complete' },
      { id: 'p2-6', title: 'Data handling policy', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-02-21', completionDate: '2026-02-21', status: 'complete' },
      { id: 'p2-7', title: 'SOC2 compliance mapping', assignedRole: 'IT Lead', roleKey: 'it', dueDate: '2026-02-22', completionDate: '2026-02-22', status: 'complete' },
      { id: 'p2-8', title: 'HIPAA compliance mapping', assignedRole: 'Legal Lead', roleKey: 'legal', dueDate: '2026-02-22', completionDate: '2026-02-22', status: 'complete' },
      { id: 'p2-9', title: 'Ethics review', assignedRole: 'Legal Lead', roleKey: 'legal', dueDate: '2026-02-28', status: 'in_progress' },
      { id: 'p2-10', title: 'AUP policy legal review', assignedRole: 'Legal Lead', roleKey: 'legal', dueDate: '2026-02-28', status: 'in_progress' },
      { id: 'p2-11', title: 'Security controls baseline', assignedRole: 'IT Lead', roleKey: 'it', dueDate: '2026-03-03', status: 'not_started' },
      { id: 'p2-12', title: 'Gate 1 review preparation', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-03-05', status: 'blocked', blockedBy: 'Ethics review, AUP legal review' },
    ],
  },
  {
    number: 3,
    name: 'Gate Reviews',
    status: 'not_started',
    tasks: [
      { id: 'p3-1', title: 'Gate 1: Scope Review', assignedRole: 'Exec Sponsor', roleKey: 'executive', dueDate: '2026-03-07', status: 'not_started' },
      { id: 'p3-2', title: 'Gate 2: Security Review', assignedRole: 'IT Lead', roleKey: 'it', dueDate: '2026-03-10', status: 'not_started' },
      { id: 'p3-3', title: 'Evidence package', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-03-12', status: 'not_started' },
      { id: 'p3-4', title: 'Exception requests (if needed)', assignedRole: 'Legal Lead', roleKey: 'legal', dueDate: '2026-03-12', status: 'not_started' },
      { id: 'p3-5', title: 'Gate 3: Pilot Approval', assignedRole: 'Exec Sponsor', roleKey: 'executive', dueDate: '2026-03-14', status: 'not_started' },
    ],
  },
  {
    number: 4,
    name: 'Sandbox & Pilot',
    status: 'not_started',
    tasks: [
      { id: 'p4-1', title: 'Sandbox configuration', assignedRole: 'IT Lead', roleKey: 'it', dueDate: '2026-03-18', status: 'not_started' },
      { id: 'p4-2', title: 'Sandbox validation', assignedRole: 'IT Lead', roleKey: 'it', dueDate: '2026-03-20', status: 'not_started' },
      { id: 'p4-3', title: 'Pilot design', assignedRole: 'Eng Lead', roleKey: 'engineering', dueDate: '2026-03-22', status: 'not_started' },
      { id: 'p4-4', title: 'Sprint 1 execution', assignedRole: 'Eng Lead', roleKey: 'engineering', dueDate: '2026-03-29', status: 'not_started' },
      { id: 'p4-5', title: 'Sprint 2 execution', assignedRole: 'Eng Lead', roleKey: 'engineering', dueDate: '2026-04-05', status: 'not_started' },
      { id: 'p4-6', title: 'Monitoring setup', assignedRole: 'IT Lead', roleKey: 'it', dueDate: '2026-03-25', status: 'not_started' },
    ],
  },
  {
    number: 5,
    name: 'Evaluate & Decide',
    status: 'not_started',
    tasks: [
      { id: 'p5-1', title: 'Outcome metrics analysis', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-04-08', status: 'not_started' },
      { id: 'p5-2', title: 'ROI calculation', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-04-10', status: 'not_started' },
      { id: 'p5-3', title: 'Executive brief', assignedRole: 'Consultant', roleKey: 'consultant', dueDate: '2026-04-12', status: 'not_started' },
      { id: 'p5-4', title: 'Go/No-Go decision', assignedRole: 'Exec Sponsor', roleKey: 'executive', dueDate: '2026-04-15', status: 'not_started' },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  useRoleOverride hook                                                      */
/* -------------------------------------------------------------------------- */

function useRoleOverride(): UserRole {
  const [role, setRole] = useState<UserRole>('consultant');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('govai_user_role_override');
      if (stored && isValidRole(stored)) {
        setRole(stored);
      }
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  return role;
}

function isValidRole(value: string): value is UserRole {
  return ['admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing'].includes(value);
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getAllTasks(phases: Phase[]): PlanTask[] {
  return phases.flatMap((p) => p.tasks);
}

function getStatusBadge(status: PhaseStatus): React.ReactElement {
  switch (status) {
    case 'complete':
      return <Badge className="bg-emerald-100 text-emerald-800 border-transparent text-xs">Complete</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800 border-transparent text-xs">In Progress</Badge>;
    case 'not_started':
      return <Badge className="bg-slate-100 text-slate-600 border-transparent text-xs">Not Started</Badge>;
  }
}

function getProjectStatusBadge(completedPct: number): React.ReactElement {
  if (completedPct >= 40) {
    return <Badge className="bg-emerald-100 text-emerald-800 border-transparent">On Track</Badge>;
  }
  if (completedPct >= 25) {
    return <Badge className="bg-amber-100 text-amber-800 border-transparent">At Risk</Badge>;
  }
  return <Badge className="bg-red-100 text-red-800 border-transparent">Delayed</Badge>;
}

/* -------------------------------------------------------------------------- */
/*  Task status icon                                                          */
/* -------------------------------------------------------------------------- */

function TaskStatusIcon({ status }: { status: PlanTaskStatus }): React.ReactElement {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
    case 'in_progress':
      return (
        <div className="h-4 w-4 shrink-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
        </div>
      );
    case 'not_started':
      return <Circle className="h-4 w-4 text-slate-300 shrink-0" />;
    case 'blocked':
      return <Ban className="h-4 w-4 text-red-500 shrink-0" />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Phase section component                                                   */
/* -------------------------------------------------------------------------- */

function PhaseSection({
  phase,
  currentRole,
  roleFilter,
  defaultExpanded,
}: {
  phase: Phase;
  currentRole: UserRole;
  roleFilter: string;
  defaultExpanded: boolean;
}): React.ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const completedCount = phase.tasks.filter((t) => t.status === 'complete').length;
  const totalCount = phase.tasks.length;

  const isActive = phase.status === 'in_progress';
  const isComplete = phase.status === 'complete';
  const isFuture = phase.status === 'not_started';

  return (
    <div className={cn(
      'rounded-lg border overflow-hidden',
      isActive ? 'border-l-4 border-l-blue-600 border-slate-200' :
      isComplete ? 'border-slate-200' :
      'border-slate-200',
    )}>
      {/* Phase header */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          'w-full flex items-center justify-between px-5 py-4 text-left transition-colors',
          isComplete ? 'bg-emerald-50 hover:bg-emerald-100' :
          isActive ? 'bg-white hover:bg-slate-50' :
          'bg-slate-50 hover:bg-slate-100',
        )}
      >
        <div className="flex items-center gap-3">
          {expanded
            ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
            : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          }
          <div>
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-semibold',
                isComplete ? 'text-emerald-800' :
                isActive ? 'text-slate-900' :
                'text-slate-500',
              )}>
                Phase {phase.number}: {phase.name}
              </h3>
              {getStatusBadge(phase.status)}
            </div>
            {isComplete && phase.completionDate && (
              <p className="text-xs text-emerald-600 mt-0.5">Completed {formatDate(phase.completionDate)}</p>
            )}
            {isFuture && (
              <p className="text-xs text-slate-400 mt-0.5">Begins after Phase {phase.number - 1}</p>
            )}
          </div>
        </div>
        <span className={cn(
          'text-sm font-medium',
          isComplete ? 'text-emerald-700' :
          isActive ? 'text-blue-700' :
          'text-slate-400',
        )}>
          {completedCount} of {totalCount} items
        </span>
      </button>

      {/* Task rows */}
      {expanded && (
        <div className={cn(
          'border-t',
          isComplete ? 'border-emerald-200' : 'border-slate-200',
          isFuture ? 'bg-slate-50' : 'bg-white',
        )}>
          {phase.tasks.map((task, idx) => {
            const isUserTask = task.roleKey === currentRole;
            const isDimmed = roleFilter !== 'all' && task.roleKey !== roleFilter;

            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 transition-opacity',
                  idx < phase.tasks.length - 1 ? 'border-b border-slate-100' : '',
                  isDimmed ? 'opacity-30' : '',
                  isFuture && !isDimmed ? 'opacity-60' : '',
                )}
              >
                <TaskStatusIcon status={task.status} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm',
                      task.status === 'complete' ? 'text-slate-500' :
                      task.status === 'blocked' ? 'text-slate-600' :
                      'text-slate-900 font-medium',
                    )}>
                      {task.title}
                    </span>
                    {isUserTask && !isDimmed && (
                      <span className="text-xs font-bold text-blue-600 shrink-0">&larr; YOU</span>
                    )}
                  </div>
                  {task.status === 'blocked' && task.blockedBy && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Blocked by: {task.blockedBy}
                    </p>
                  )}
                </div>

                <Badge className={cn(
                  'border-transparent text-[10px] shrink-0',
                  ROLE_BADGE_COLORS[task.roleKey] ?? 'bg-slate-100 text-slate-700',
                )}>
                  {ROLE_BADGE_LABELS[task.roleKey] ?? task.assignedRole}
                </Badge>

                <span className={cn(
                  'text-xs shrink-0 w-20 text-right',
                  task.status === 'complete' ? 'text-emerald-600' :
                  task.status === 'in_progress' ? 'text-blue-600' :
                  task.status === 'blocked' ? 'text-red-500' :
                  'text-slate-400',
                )}>
                  {task.completionDate
                    ? formatDate(task.completionDate)
                    : `Due ${formatDate(task.dueDate)}`
                  }
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ProjectPlanPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const { id: _projectId } = React.use(params);
  const currentRole = useRoleOverride();
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const allTasks = getAllTasks(PHASES);
  const totalItems = allTasks.length;
  const completedItems = allTasks.filter((t) => t.status === 'complete').length;
  const completedPct = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Target className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Project Plan</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {completedItems} of {totalItems} items complete &mdash; {completedPct}%
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getProjectStatusBadge(completedPct)}
            <div className="text-right">
              <p className="text-xs text-slate-400">Target completion</p>
              <p className="text-sm font-medium text-slate-700">Apr 15, 2026</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${completedPct}%` }}
          />
        </div>

        {/* Role filter */}
        <div className="mt-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">Filter by role:</span>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
            className="w-56 h-8 text-sm border-slate-200"
          >
            <SelectOption value="all">All Roles</SelectOption>
            <SelectOption value="admin">{ROLE_LABELS.admin}</SelectOption>
            <SelectOption value="consultant">{ROLE_LABELS.consultant}</SelectOption>
            <SelectOption value="executive">{ROLE_LABELS.executive}</SelectOption>
            <SelectOption value="it">{ROLE_LABELS.it}</SelectOption>
            <SelectOption value="legal">{ROLE_LABELS.legal}</SelectOption>
            <SelectOption value="engineering">{ROLE_LABELS.engineering}</SelectOption>
            <SelectOption value="marketing">{ROLE_LABELS.marketing}</SelectOption>
          </Select>
          {roleFilter !== 'all' && (
            <span className="text-xs text-slate-400 ml-2">
              Showing tasks for {ROLE_LABELS[roleFilter as UserRole] ?? roleFilter} &mdash; other tasks dimmed
            </span>
          )}
        </div>

        {/* Current role indicator */}
        <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
          <span className="font-bold">&larr; YOU</span>
          <span className="text-slate-400">markers show tasks for your role:</span>
          <Badge className="bg-blue-50 text-blue-700 border-transparent text-xs">{ROLE_LABELS[currentRole]}</Badge>
        </div>
      </div>

      <Separator className="mb-6 bg-slate-200" />

      {/* Phase sections */}
      <div className="space-y-4">
        {PHASES.map((phase) => (
          <PhaseSection
            key={phase.number}
            phase={phase}
            currentRole={currentRole}
            roleFilter={roleFilter}
            defaultExpanded={phase.status !== 'complete'}
          />
        ))}
      </div>

      {/* Footer legend */}
      <div className="mt-8 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <p className="text-xs font-medium text-slate-500 mb-2">Legend</p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Complete
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 flex items-center justify-center"><div className="h-2.5 w-2.5 rounded-full bg-blue-500" /></div> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <Circle className="h-3.5 w-3.5 text-slate-300" /> Not Started
          </span>
          <span className="flex items-center gap-1.5">
            <Ban className="h-3.5 w-3.5 text-red-500" /> Blocked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-blue-600">&larr; YOU</span> Your tasks
          </span>
        </div>
      </div>
    </div>
  );
}
