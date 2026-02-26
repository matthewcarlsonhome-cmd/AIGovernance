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
  Info,
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
/*  Phase data — tasks are generated as the project progresses                */
/* -------------------------------------------------------------------------- */

function buildPhases(): Phase[] {
  const today = new Date();
  const d = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString();
  };

  return [
    {
      number: 1,
      name: 'Scope & Assess',
      status: 'in_progress',
      tasks: [
        { id: 'p1-1', title: 'Invite team members and assign roles', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(3), status: 'not_started' },
        { id: 'p1-2', title: 'Complete pilot intake scorecard', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(5), status: 'not_started' },
        { id: 'p1-3', title: 'Complete readiness questionnaire (5 domains)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(5), status: 'not_started' },
        { id: 'p1-4', title: 'Review readiness results and prioritize gaps', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(7), status: 'not_started' },
        { id: 'p1-5', title: 'Track prerequisite completion', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(10), status: 'not_started' },
        { id: 'p1-6', title: 'Review project scope and risk classification', assignedRole: 'Executive Sponsor', roleKey: 'executive', dueDate: d(7), status: 'not_started' },
        { id: 'p1-7', title: 'Define pilot project scope and success criteria', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(12), status: 'not_started' },
        { id: 'p1-8', title: 'Capture baseline development metrics', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(14), status: 'not_started' },
      ],
    },
    {
      number: 2,
      name: 'Classify & Govern',
      status: 'not_started',
      tasks: [
        { id: 'p2-1', title: 'Complete data classification workflow', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(10), status: 'not_started' },
        { id: 'p2-2', title: 'Review security controls (9 categories)', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(14), status: 'not_started' },
        { id: 'p2-3', title: 'Draft Acceptable Use Policy', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(14), status: 'not_started', blockedBy: 'Readiness assessment' },
        { id: 'p2-4', title: 'Draft Incident Response Plan addendum', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(16), status: 'not_started' },
        { id: 'p2-5', title: 'Draft Data Classification Policy', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(16), status: 'not_started' },
        { id: 'p2-6', title: 'Map compliance controls (SOC 2, HIPAA, NIST, GDPR)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(18), status: 'not_started' },
        { id: 'p2-7', title: 'Review AUP and provide legal sign-off', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(16), status: 'not_started' },
        { id: 'p2-8', title: 'Review risk register and approve mitigations', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(18), status: 'not_started' },
        { id: 'p2-9', title: 'Complete compliance framework mapping review', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(18), status: 'not_started' },
        { id: 'p2-10', title: 'Build RACI matrix for all stakeholders', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(14), status: 'not_started' },
        { id: 'p2-11', title: 'Draft stakeholder communication plan', assignedRole: 'Communications Lead', roleKey: 'marketing', dueDate: d(14), status: 'not_started' },
      ],
    },
    {
      number: 3,
      name: 'Gate Reviews',
      status: 'not_started',
      tasks: [
        { id: 'p3-1', title: 'Prepare evidence package for Gate 1', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(20), status: 'not_started', blockedBy: 'Phase 2 artifacts' },
        { id: 'p3-2', title: 'Gate 1: Design Review sign-off', assignedRole: 'Executive Sponsor', roleKey: 'executive', dueDate: d(21), status: 'not_started' },
        { id: 'p3-3', title: 'Gate 2: Data & Security sign-off', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(22), status: 'not_started', blockedBy: 'Gate 1 approval' },
        { id: 'p3-4', title: 'Review IP and licensing terms', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(24), status: 'not_started' },
        { id: 'p3-5', title: 'Gate 3: Launch Authorization', assignedRole: 'Executive Sponsor', roleKey: 'executive', dueDate: d(25), status: 'not_started', blockedBy: 'Gate 2 approval' },
        { id: 'p3-6', title: 'Schedule gate review meetings', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(20), status: 'not_started' },
      ],
    },
    {
      number: 4,
      name: 'Sandbox & Pilot',
      status: 'not_started',
      tasks: [
        { id: 'p4-1', title: 'Configure sandbox environment', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(28), status: 'not_started', blockedBy: 'Gate 3 approval' },
        { id: 'p4-2', title: 'Run sandbox validation checks (20+ checks)', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(30), status: 'not_started' },
        { id: 'p4-3', title: 'Set up developer tooling access', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(30), status: 'not_started' },
        { id: 'p4-4', title: 'Run Sprint 1 evaluation', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(35), status: 'not_started' },
        { id: 'p4-5', title: 'Run Sprint 2 evaluation', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(42), status: 'not_started' },
        { id: 'p4-6', title: 'Complete tool comparison (Claude Code vs. others)', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(42), status: 'not_started' },
        { id: 'p4-7', title: 'Monitor pilot security metrics', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(42), status: 'not_started' },
        { id: 'p4-8', title: 'Prepare FAQ document', assignedRole: 'Communications Lead', roleKey: 'marketing', dueDate: d(30), status: 'not_started' },
        { id: 'p4-9', title: 'Create pilot announcement materials', assignedRole: 'Communications Lead', roleKey: 'marketing', dueDate: d(28), status: 'not_started' },
      ],
    },
    {
      number: 5,
      name: 'Evaluate & Decide',
      status: 'not_started',
      tasks: [
        { id: 'p5-1', title: 'Record outcome metrics (11 KPIs)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(45), status: 'not_started' },
        { id: 'p5-2', title: 'Generate executive decision brief', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(48), status: 'not_started' },
        { id: 'p5-3', title: 'Calculate ROI (NPV, IRR, scenario analysis)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(48), status: 'not_started' },
        { id: 'p5-4', title: 'Review executive brief and make go/no-go decision', assignedRole: 'Executive Sponsor', roleKey: 'executive', dueDate: d(50), status: 'not_started' },
        { id: 'p5-5', title: 'Generate persona-specific reports (PDF/DOCX)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(50), status: 'not_started' },
        { id: 'p5-6', title: 'Prepare post-pilot summary for leadership', assignedRole: 'Communications Lead', roleKey: 'marketing', dueDate: d(52), status: 'not_started' },
        { id: 'p5-7', title: 'Archive project and export final documentation', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(55), status: 'not_started' },
      ],
    },
  ];
}

const PHASES: Phase[] = buildPhases();

/* -------------------------------------------------------------------------- */
/*  Phase guidance text (shown when phases have no tasks)                     */
/* -------------------------------------------------------------------------- */

const PHASE_GUIDANCE: Record<number, string> = {
  1: 'Complete the intake scorecard and discovery questionnaire to generate scope tasks.',
  2: 'Tasks will be generated after Phase 1 assessments — includes data classification, policy drafting, compliance mapping.',
  3: 'Gate reviews will be scheduled after governance artifacts are completed in Phase 2.',
  4: 'Sandbox configuration and pilot design tasks appear after gate approvals in Phase 3.',
  5: 'Evaluation tasks appear after pilot execution completes in Phase 4.',
};

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
            {isFuture && phase.number > 1 && (
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

      {/* Task rows or guidance text */}
      {expanded && (
        <div className={cn(
          'border-t',
          isComplete ? 'border-emerald-200' : 'border-slate-200',
          isFuture ? 'bg-slate-50' : 'bg-white',
        )}>
          {phase.tasks.length === 0 ? (
            <div className="px-5 py-6 flex items-start gap-3">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-500">
                {PHASE_GUIDANCE[phase.number] ?? 'Tasks will be generated as the project progresses.'}
              </p>
            </div>
          ) : (
            phase.tasks.map((task, idx) => {
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
            })
          )}
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
  const completedPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

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
            {totalItems > 0
              ? getProjectStatusBadge(completedPct)
              : <Badge className="bg-slate-100 text-slate-600 border-transparent">Not Started</Badge>
            }
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
            defaultExpanded={phase.tasks.length === 0 || phase.status !== 'complete'}
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
