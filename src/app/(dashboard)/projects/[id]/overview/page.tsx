'use client';

import * as React from 'react';
import { use, useState, useEffect } from 'react';
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
  Sparkles,
  Rocket,
  Info,
  PartyPopper,
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
  assignee?: string;
}

function buildWorkQueue(projectId: string): WorkQueueItem[] {
  const p = (path: string) => `/projects/${projectId}${path}`;
  return [
    {
      id: 'wq-1',
      title: 'Gate 2 approval pending',
      description: 'Pilot deployment gate requires security sign-off before sandbox access is granted.',
      href: p('/governance/gates'),
      priority: 'high',
      type: 'approval',
      roles: ['admin', 'consultant', 'it', 'executive'],
      assignee: 'Sarah Chen',
    },
    {
      id: 'wq-2',
      title: 'Complete DLP rule configuration',
      description: 'Sandbox DLP rules not yet configured -- required before Gate 2 can be approved.',
      href: p('/sandbox/configure'),
      priority: 'high',
      type: 'action',
      roles: ['admin', 'consultant', 'it'],
      assignee: 'Alex Rivera',
    },
    {
      id: 'wq-3',
      title: 'Sprint 2 metrics need entry',
      description: 'Enter velocity, defect rate, and satisfaction scores for the latest sprint.',
      href: p('/poc/sprints'),
      priority: 'medium',
      type: 'input_needed',
      roles: ['admin', 'consultant', 'engineering'],
      assignee: 'Jordan Lee',
    },
    {
      id: 'wq-4',
      title: 'Compliance mapping incomplete',
      description: '2 of 5 frameworks mapped -- HIPAA and GDPR mappings still pending.',
      href: p('/governance/compliance'),
      priority: 'medium',
      type: 'action',
      roles: ['admin', 'consultant', 'legal', 'it'],
      assignee: 'Lisa Park',
    },
    {
      id: 'wq-5',
      title: 'Data readiness review needed',
      description: 'Assess data quality and classification readiness before pilot launch.',
      href: p('/discovery/data-readiness'),
      priority: 'medium',
      type: 'review',
      roles: ['admin', 'consultant', 'it', 'engineering'],
    },
    {
      id: 'wq-6',
      title: 'Penetration test report due',
      description: 'Required for Gate 2 completion checklist. Schedule and upload results.',
      href: p('/sandbox/validate'),
      priority: 'high',
      type: 'action',
      roles: ['admin', 'it'],
      assignee: 'Marcus Johnson',
    },
    {
      id: 'wq-7',
      title: 'RACI matrix needs assignment',
      description: 'Define role assignments for key deliverables across the project phases.',
      href: p('/governance/raci'),
      priority: 'low',
      type: 'action',
      roles: ['admin', 'consultant'],
    },
    {
      id: 'wq-8',
      title: 'Communications plan not started',
      description: 'Draft stakeholder messaging guide and FAQ for broader organization rollout.',
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
  { id: '2', text: 'Sprint 1 metrics captured -- velocity +62%', timestamp: '2 days ago', icon: TrendingUp },
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
  const { data: fetchedProject, isLoading } = useProject(id);
  const { data: currentUser } = useCurrentUser();

  const [showWelcome, setShowWelcome] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Check if this is the user's first visit to this project
  useEffect(() => {
    try {
      const key = `govai_overview_visited_${id}`;
      const visited = localStorage.getItem(key);
      if (!visited) {
        setShowWelcome(true);
        localStorage.setItem(key, 'true');
      }
      const dismissed = localStorage.getItem(`govai_dismissed_queue_${id}`);
      if (dismissed) setDismissedIds(new Set(JSON.parse(dismissed)));
    } catch { /* ignore */ }
  }, [id]);

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;

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

  // Filter work queue by user role and dismissals
  const allQueueItems = buildWorkQueue(id);
  const myQueueItems = allQueueItems.filter(
    (item) => !dismissedIds.has(item.id) && (!userRole || item.roles.includes(userRole))
  );

  const dismissItem = (itemId: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(itemId);
      localStorage.setItem(`govai_dismissed_queue_${id}`, JSON.stringify([...next]));
      return next;
    });
  };

  // Fun encouragement based on progress
  const encouragement = progress.overall >= 80
    ? 'Incredible progress! The finish line is in sight.'
    : progress.overall >= 60
    ? 'Great momentum! The team is firing on all cylinders.'
    : progress.overall >= 40
    ? 'Solid progress! Each step brings you closer.'
    : progress.overall >= 20
    ? 'Good start! The foundation is taking shape.'
    : 'Welcome to the journey! Every great program starts here.';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner for first-time visitors */}
      {showWelcome && (
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-blue-50 overflow-hidden relative">
          <CardContent className="py-5">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 rounded-xl bg-white shadow-sm items-center justify-center shrink-0">
                <Rocket className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-indigo-900 mb-1">Welcome to your project command center</h2>
                <p className="text-sm text-indigo-700 mb-3">
                  This overview is your home base. From here you can track progress across all phases,
                  see your personal action items, and monitor project health at a glance.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-indigo-600">
                  <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Action items are personalized to your role</span>
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Progress updates automatically as you complete tasks</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Team members see different items based on their role</span>
                </div>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-indigo-400 hover:text-indigo-600 text-sm shrink-0"
              >
                Dismiss
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {project.name}
            </h1>
            <Badge variant="secondary" className="capitalize">{project.status}</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">{project.description}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            {encouragement}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(project.startDate)} -- {formatDate(project.targetDate)}
          </span>
          <span className={cn(
            'flex items-center gap-1 font-medium',
            remaining <= 30 ? 'text-amber-600' : 'text-slate-700'
          )}>
            <Clock className="h-3.5 w-3.5" />
            {remaining} days left
          </span>
        </div>
      </div>

      {/* Progress Tracker */}
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
                {idx < progress.phases.length - 1 && (
                  <div className="absolute top-2.5 left-[calc(50%+12px)] right-0 h-px bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Queue + Health */}
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
              {dismissedIds.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-400"
                  onClick={() => {
                    setDismissedIds(new Set());
                    localStorage.removeItem(`govai_dismissed_queue_${id}`);
                  }}
                >
                  Show all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {myQueueItems.length === 0 ? (
              <div className="text-center py-8">
                <PartyPopper className="h-10 w-10 mx-auto mb-3 text-emerald-400" />
                <p className="text-sm font-medium text-slate-700 mb-1">You&apos;re all caught up!</p>
                <p className="text-xs text-slate-400">No pending action items for your role. Nice work!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myQueueItems.slice(0, 6).map((item) => {
                  const tl = typeLabel(item.type);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-l-4 p-3 transition-all hover:shadow-sm group',
                        priorityColor(item.priority),
                      )}
                    >
                      <Link href={item.href} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {item.title}
                          </p>
                          <Badge variant="outline" className={cn('text-[10px] shrink-0', tl.className)}>
                            {tl.text}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                        {item.assignee && (
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Users className="h-2.5 w-2.5" /> Assigned to {item.assignee}
                          </p>
                        )}
                      </Link>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => dismissItem(item.id)}
                          title="Dismiss"
                          className="p-1 rounded text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <Link href={item.href}>
                          <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-slate-400 text-center pt-1">
                  Click the checkmark to dismiss completed items
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900">Project Health</CardTitle>
            <CardDescription className="text-slate-500">
              Key indicators for your governance program
            </CardDescription>
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

            <div className="pt-2 border-t space-y-2">
              <Link href={`/projects/${id}/discovery/readiness`}>
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs border-slate-200 text-slate-700">
                  <Target className="h-3.5 w-3.5" />
                  View Full Assessment
                  <ArrowRight className="h-3 w-3 ml-auto" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="w-full gap-2 text-xs text-slate-500">
                  <Info className="h-3.5 w-3.5" />
                  Switch role to see different action items
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
            <Activity className="h-5 w-5 text-slate-500" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-slate-500">
            Latest updates and milestones across the project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RECENT_ACTIVITY.map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
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
