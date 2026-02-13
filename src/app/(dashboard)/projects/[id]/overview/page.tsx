'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Loader2,
  Play,
  Shield,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProjectStatus, UserRole } from '@/types';
import { useProject } from '@/hooks/use-projects';
import { useCurrentUser } from '@/hooks/use-auth';
import { buildDemoProgress, type PhaseProgress } from '@/lib/progress/calculator';

/* -------------------------------------------------------------------------- */
/*  Fallback demo data                                                         */
/* -------------------------------------------------------------------------- */

const DEMO_PROJECT = {
  id: 'demo-new',
  name: 'AI Coding Agent Governance Program',
  description:
    'Enterprise-wide governance framework for deploying Claude Code and related AI coding assistants across engineering teams.',
  status: 'discovery' as ProjectStatus,
  phase: 'Discovery',
  startDate: '2026-01-15',
  targetDate: '2026-07-30',
  feasibilityScore: 72,
  rating: 'Moderate Feasibility' as const,
};

/* -------------------------------------------------------------------------- */
/*  Work Queue Items                                                           */
/* -------------------------------------------------------------------------- */

interface WorkQueueItem {
  id: string;
  title: string;
  description: string;
  href: string;
  priority: 'high' | 'medium' | 'low';
  type: 'approval' | 'action' | 'review' | 'input_needed';
  roles: UserRole[];
}

function buildWorkQueue(projectId: string): WorkQueueItem[] {
  const p = (path: string) => `/projects/${projectId}${path}`;
  return [
    {
      id: 'wq-1',
      title: 'Gate 2 approval pending',
      description: 'Pilot deployment gate requires security sign-off',
      href: p('/governance/gates'),
      priority: 'high',
      type: 'approval',
      roles: ['admin', 'consultant', 'it', 'executive'],
    },
    {
      id: 'wq-2',
      title: 'Complete DLP rule configuration',
      description: 'Sandbox DLP rules not yet configured — required for Gate 2',
      href: p('/sandbox/configure'),
      priority: 'high',
      type: 'action',
      roles: ['admin', 'consultant', 'it'],
    },
    {
      id: 'wq-3',
      title: 'Sprint 2 metrics need entry',
      description: 'Velocity, defect rate, and satisfaction scores due',
      href: p('/poc/sprints'),
      priority: 'medium',
      type: 'input_needed',
      roles: ['admin', 'consultant', 'engineering'],
    },
    {
      id: 'wq-4',
      title: 'Compliance mapping incomplete',
      description: '2 of 5 frameworks mapped — HIPAA and GDPR pending',
      href: p('/governance/compliance'),
      priority: 'medium',
      type: 'action',
      roles: ['admin', 'consultant', 'legal', 'it'],
    },
    {
      id: 'wq-5',
      title: 'Data readiness review needed',
      description: 'Assess data quality and classification readiness',
      href: p('/discovery/data-readiness'),
      priority: 'medium',
      type: 'review',
      roles: ['admin', 'consultant', 'it', 'engineering'],
    },
    {
      id: 'wq-6',
      title: 'Penetration test report due',
      description: 'Required for Gate 2 completion checklist',
      href: p('/sandbox/validate'),
      priority: 'high',
      type: 'action',
      roles: ['admin', 'it'],
    },
    {
      id: 'wq-7',
      title: 'RACI matrix needs assignment',
      description: 'Role assignments not yet defined for key deliverables',
      href: p('/governance/raci'),
      priority: 'low',
      type: 'action',
      roles: ['admin', 'consultant'],
    },
    {
      id: 'wq-8',
      title: 'Communications plan not started',
      description: 'Stakeholder messaging guide and FAQ needed',
      href: p('/reports/communications'),
      priority: 'low',
      type: 'action',
      roles: ['admin', 'consultant', 'marketing'],
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*  Activity Feed                                                              */
/* -------------------------------------------------------------------------- */

interface ActivityEntry {
  id: string;
  text: string;
  timestamp: string;
  icon: React.ElementType;
}

const RECENT_ACTIVITY: ActivityEntry[] = [
  { id: '1', text: 'Gate 1 (Sandbox Access) approved by system', timestamp: '1 day ago', icon: Shield },
  { id: '2', text: 'Sprint 1 metrics captured — velocity +62%', timestamp: '2 days ago', icon: TrendingUp },
  { id: '3', text: 'AUP policy draft created by Michael Torres', timestamp: '3 days ago', icon: FileText },
  { id: '4', text: 'Assessment questionnaire completed (25/25)', timestamp: '4 days ago', icon: Target },
  { id: '5', text: 'Team member Alex Rivera added to the project', timestamp: '5 days ago', icon: Users },
  { id: '6', text: 'Project created and discovery phase initiated', timestamp: '6 days ago', icon: Play },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function daysRemaining(target: string): number {
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function phaseStatusIcon(status: PhaseProgress['status']): React.ReactElement {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    case 'in_progress':
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    case 'not_started':
      return <Circle className="h-5 w-5 text-slate-300" />;
  }
}

function priorityColor(priority: WorkQueueItem['priority']): string {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50/50';
    case 'medium':
      return 'border-l-amber-500 bg-amber-50/50';
    case 'low':
      return 'border-l-slate-300 bg-slate-50/50';
  }
}

function typeLabel(type: WorkQueueItem['type']): { text: string; className: string } {
  switch (type) {
    case 'approval':
      return { text: 'Approval', className: 'bg-red-100 text-red-700' };
    case 'action':
      return { text: 'Action', className: 'bg-blue-100 text-blue-700' };
    case 'review':
      return { text: 'Review', className: 'bg-amber-100 text-amber-700' };
    case 'input_needed':
      return { text: 'Input Needed', className: 'bg-violet-100 text-violet-700' };
  }
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = use(params);
  const { data: fetchedProject, isLoading, error } = useProject(id);
  const { data: currentUser } = useCurrentUser();

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  const project = {
    ...DEMO_PROJECT,
    ...(fetchedProject ? {
      id: fetchedProject.id,
      name: fetchedProject.name,
      description: fetchedProject.description,
      status: fetchedProject.status,
      phase: fetchedProject.status?.charAt(0).toUpperCase() + fetchedProject.status?.slice(1),
      startDate: fetchedProject.start_date ?? DEMO_PROJECT.startDate,
      targetDate: fetchedProject.target_end_date ?? DEMO_PROJECT.targetDate,
      feasibilityScore: fetchedProject.feasibility_score ?? DEMO_PROJECT.feasibilityScore,
    } : {}),
  };
  const remaining = daysRemaining(project.targetDate);
  const progress = buildDemoProgress();
  const userRole = currentUser?.role;

  // Filter work queue by user role
  const allQueueItems = buildWorkQueue(id);
  const myQueueItems = allQueueItems.filter(
    (item) => !userRole || item.roles.includes(userRole)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {project.name}
            </h1>
            <Badge variant="secondary" className="capitalize">{project.status}</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(project.startDate)} — {formatDate(project.targetDate)}
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Clock className="h-3.5 w-3.5" />
            {remaining} days left
          </span>
        </div>
      </div>

      {/* ── Progress Tracker ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-900">Project Progress</CardTitle>
              <CardDescription className="text-slate-500">
                Overall: {progress.overall}% complete across {progress.phases.length} phases
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-32 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    progress.overall >= 75 ? 'bg-emerald-500' :
                    progress.overall >= 50 ? 'bg-blue-500' :
                    progress.overall >= 25 ? 'bg-amber-500' : 'bg-slate-300'
                  )}
                  style={{ width: `${progress.overall}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-900">{progress.overall}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Phase stepper */}
          <div className="flex items-start gap-0">
            {progress.phases.map((phase, idx) => (
              <div key={phase.phase} className="flex-1 relative">
                <div className="flex flex-col items-center text-center">
                  {phaseStatusIcon(phase.status)}
                  <p className="mt-1.5 text-xs font-semibold text-slate-900">{phase.label}</p>
                  <p className="text-[11px] text-slate-500">{phase.percentage}%</p>
                  <p className="text-[10px] text-slate-400">{phase.completedItems}/{phase.totalItems} items</p>
                </div>
                {/* Connector line */}
                {idx < progress.phases.length - 1 && (
                  <div className="absolute top-2.5 left-[calc(50%+12px)] right-0 h-px bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Work Queue + Health ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Work Queue */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Your Action Items
                </CardTitle>
                <CardDescription className="text-slate-500">
                  {myQueueItems.length} items requiring your attention
                  {userRole && (
                    <span className="ml-1 text-slate-400">
                      (filtered for {userRole})
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {myQueueItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm">No pending action items. You&#39;re all caught up.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myQueueItems.slice(0, 6).map((item) => {
                  const tl = typeLabel(item.type);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-l-4 p-3 transition-colors hover:shadow-sm group',
                        priorityColor(item.priority),
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {item.title}
                          </p>
                          <Badge variant="outline" className={cn('text-[10px] shrink-0', tl.className)}>
                            {tl.text}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900">Project Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Readiness Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Readiness Score</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      project.feasibilityScore >= 75 ? 'bg-emerald-500' :
                      project.feasibilityScore >= 60 ? 'bg-amber-500' : 'bg-orange-500'
                    )}
                    style={{ width: `${project.feasibilityScore}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-900 w-10 text-right">
                  {project.feasibilityScore}/100
                </span>
              </div>
            </div>
            {/* Risk Level */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Risk Level</span>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                Medium
              </Badge>
            </div>
            {/* Timeline Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Timeline</span>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                On Track
              </Badge>
            </div>
            {/* Gate Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Gate Progress</span>
              <span className="text-sm text-slate-900">1 of 3 approved</span>
            </div>
            {/* Budget */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Budget</span>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                Within Budget
              </Badge>
            </div>

            <div className="pt-2 border-t">
              <Link href={`/projects/${id}/discovery/readiness`}>
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs border-slate-200 text-slate-700">
                  <Target className="h-3.5 w-3.5" />
                  View Full Assessment
                  <ArrowRight className="h-3 w-3 ml-auto" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Activity Feed ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
            <Activity className="h-5 w-5 text-slate-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RECENT_ACTIVITY.map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">{entry.text}</p>
                    <p className="text-xs text-slate-400">{entry.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
