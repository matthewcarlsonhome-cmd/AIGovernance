'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ClipboardList,
  AlertTriangle,
  FileText,
  Shield,
  Settings,
  Users,
  Megaphone,
  Gavel,
  Code2,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { UserRole } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type TaskPriority = 'required' | 'recommended' | 'optional';
type TaskStatus = 'action_needed' | 'upcoming' | 'completed';

interface DemoTask {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  dueDate: string;
  completedDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  ctaLabel?: string;
  ctaHref?: string;
  blocking?: string;
  blockedBy?: string;
  scheduledPhase?: number;
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

/* -------------------------------------------------------------------------- */
/*  Role-based task data                                                      */
/* -------------------------------------------------------------------------- */

function getTasksForRole(_role: UserRole): DemoTask[] {
  return [];
}

/* -------------------------------------------------------------------------- */
/*  Role task descriptions (shown in empty state)                             */
/* -------------------------------------------------------------------------- */

const ROLE_TASK_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Team assignments, project configuration, meeting scheduling, access permissions, document archival',
  consultant: 'Assessment questionnaires, policy drafts, evidence packages, readiness reviews, ROI calculations',
  executive: 'Gate approvals, risk acceptance decisions, budget sign-offs, go/no-go decisions',
  it: 'Sandbox configuration, security control checks, data classification, DLP rules, monitoring setup',
  legal: 'Policy reviews, compliance mapping, ethics reviews, IP assessments, exception request processing',
  engineering: 'Sandbox architecture, pilot project scoping, baseline metrics, tool comparison, sprint execution',
  marketing: 'Stakeholder communication plans, FAQ documents, change management narratives, pilot announcements',
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

function priorityDotClass(priority: TaskPriority): string {
  switch (priority) {
    case 'required': return 'bg-red-500';
    case 'recommended': return 'bg-amber-500';
    case 'optional': return 'bg-slate-400';
  }
}

function priorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'required': return 'Required';
    case 'recommended': return 'Recommended';
    case 'optional': return 'Optional';
  }
}

function borderAccentClass(priority: TaskPriority): string {
  switch (priority) {
    case 'required': return 'border-l-blue-600';
    case 'recommended': return 'border-l-amber-500';
    case 'optional': return 'border-l-slate-300';
  }
}

/* -------------------------------------------------------------------------- */
/*  Task Card components                                                      */
/* -------------------------------------------------------------------------- */

function ActionTaskCard({ task, projectId }: { task: DemoTask; projectId: string }): React.ReactElement {
  return (
    <Card className={cn('border-l-4 bg-white', borderAccentClass(task.priority))}>
      <CardContent className="py-4 px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('inline-block h-2.5 w-2.5 rounded-full shrink-0', priorityDotClass(task.priority))} />
              <h3 className="font-semibold text-slate-900 text-sm">{task.title}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-3 ml-[18px]">{task.description}</p>
            <div className="flex items-center gap-4 ml-[18px] text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Assigned by {task.assignedBy}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due {formatDate(task.dueDate)}
              </span>
              <Badge className={cn(
                'text-[10px] px-1.5 py-0 border-transparent',
                task.priority === 'required' ? 'bg-red-50 text-red-700' :
                task.priority === 'recommended' ? 'bg-amber-50 text-amber-700' :
                'bg-slate-100 text-slate-500',
              )}>
                {priorityLabel(task.priority)}
              </Badge>
            </div>
            {task.blocking && (
              <p className="text-xs text-red-600 mt-2 ml-[18px] flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Blocking: {task.blocking}
              </p>
            )}
          </div>
          {task.ctaLabel && task.ctaHref && (
            <Link href={`/projects/${projectId}/${task.ctaHref}`}>
              <Button size="sm" className="shrink-0 bg-slate-900 text-white hover:bg-slate-800">
                {task.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingTaskCard({ task }: { task: DemoTask }): React.ReactElement {
  return (
    <Card className="border border-slate-200 bg-slate-50 opacity-70">
      <CardContent className="py-3 px-5">
        <div className="flex items-center gap-2 mb-1">
          <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <h3 className="text-sm text-slate-500">{task.title}</h3>
        </div>
        <p className="text-xs text-slate-400 ml-[22px]">
          {task.blockedBy
            ? <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3 inline" /> Blocked by: {task.blockedBy}</span>
            : task.scheduledPhase
              ? `Scheduled for Phase ${task.scheduledPhase}`
              : `Due ${formatDate(task.dueDate)}`
          }
        </p>
      </CardContent>
    </Card>
  );
}

function CompletedTaskCard({ task }: { task: DemoTask }): React.ReactElement {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardContent className="py-3 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <h3 className="text-sm text-slate-400 line-through">{task.title}</h3>
          </div>
          {task.completedDate && (
            <span className="text-xs text-slate-400">
              Completed {formatDate(task.completedDate)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Role icon                                                                 */
/* -------------------------------------------------------------------------- */

function getRoleIcon(role: UserRole): React.ReactElement {
  const iconClass = 'h-5 w-5';
  switch (role) {
    case 'admin': return <Settings className={iconClass} />;
    case 'consultant': return <BarChart3 className={iconClass} />;
    case 'executive': return <FileText className={iconClass} />;
    case 'it': return <Shield className={iconClass} />;
    case 'legal': return <Gavel className={iconClass} />;
    case 'engineering': return <Code2 className={iconClass} />;
    case 'marketing': return <Megaphone className={iconClass} />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function MyTasksPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const { id: projectId } = React.use(params);
  const role = useRoleOverride();
  const tasks = getTasksForRole(role);

  const actionTasks = tasks.filter((t) => t.status === 'action_needed');
  const upcomingTasks = tasks.filter((t) => t.status === 'upcoming');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const phaseProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const hasNoTasks = tasks.length === 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Phase header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600">
            {getRoleIcon(role)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
            <p className="text-sm text-slate-500">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-100 text-slate-600 border-transparent text-xs">Phase 1 of 5</Badge>
              <span className="text-sm font-medium text-slate-700">Scope &amp; Assess</span>
            </div>
            <span className="text-sm text-slate-500">{completedCount} of {totalTasks} tasks complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${phaseProgress}%` }}
            />
          </div>
        </div>
      </div>

      {hasNoTasks ? (
        /* Empty state */
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100">
              <ClipboardList className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No tasks assigned yet</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mb-8">
            Tasks are assigned based on your role as the project progresses through each phase.
            As your team completes assessments, drafts policies, and reviews gates, relevant
            action items will appear here.
          </p>

          <Card className="max-w-xl mx-auto text-left border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Typical tasks for {ROLE_LABELS[role]}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-500">{ROLE_TASK_DESCRIPTIONS[role]}</p>
            </CardContent>
          </Card>

          <Separator className="my-8 bg-slate-200 max-w-xl mx-auto" />

          <div className="max-w-xl mx-auto text-left">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tasks by role across the project</h3>
            <div className="space-y-2">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((roleKey) => (
                <div key={roleKey} className="flex items-start gap-2 text-sm">
                  <span className={cn(
                    'font-medium shrink-0 w-48',
                    roleKey === role ? 'text-blue-700' : 'text-slate-600',
                  )}>
                    {ROLE_LABELS[roleKey]}
                  </span>
                  <span className="text-slate-500">{ROLE_TASK_DESCRIPTIONS[roleKey]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Requires Your Action */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {actionTasks.length}
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Requires Your Action</h2>
            </div>
            <div className="space-y-3">
              {actionTasks.map((task) => (
                <ActionTaskCard key={task.id} task={task} projectId={projectId} />
              ))}
            </div>
          </section>

          <Separator className="mb-10 bg-slate-200" />

          {/* Upcoming */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-700">Upcoming</h2>
            </div>
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <UpcomingTaskCard key={task.id} task={task} />
              ))}
            </div>
          </section>

          <Separator className="mb-10 bg-slate-200" />

          {/* Recently Completed */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-700">Recently Completed</h2>
            </div>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <CompletedTaskCard key={task.id} task={task} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
