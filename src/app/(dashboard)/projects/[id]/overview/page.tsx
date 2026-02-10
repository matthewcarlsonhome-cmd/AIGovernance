'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
  Play,
  Search,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { ProjectStatus, ScoreDomain } from '@/types';
import { useProject } from '@/hooks/use-projects';

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

interface DomainScoreEntry {
  domain: ScoreDomain;
  label: string;
  score: number;
  color: string;
}

const DOMAIN_SCORES: DomainScoreEntry[] = [
  { domain: 'infrastructure', label: 'Infrastructure', score: 78, color: 'bg-emerald-500' },
  { domain: 'security', label: 'Security', score: 65, color: 'bg-amber-500' },
  { domain: 'governance', label: 'Governance', score: 58, color: 'bg-orange-500' },
  { domain: 'engineering', label: 'Engineering', score: 82, color: 'bg-emerald-500' },
  { domain: 'business', label: 'Business', score: 71, color: 'bg-emerald-500' },
];

interface ProgressCard {
  label: string;
  detail: string;
  value: number;
  max: number;
  icon: React.ElementType;
  href: string;
}

const PROGRESS_CARDS: ProgressCard[] = [
  {
    label: 'Discovery',
    detail: '3 of 5 sections complete',
    value: 3,
    max: 5,
    icon: Search,
    href: 'discovery/questionnaire',
  },
  {
    label: 'Governance',
    detail: '1 of 4 policies drafted',
    value: 1,
    max: 4,
    icon: Shield,
    href: 'governance/policies',
  },
  {
    label: 'Sandbox',
    detail: 'Not started',
    value: 0,
    max: 3,
    icon: Settings,
    href: 'sandbox/configure',
  },
  {
    label: 'Timeline',
    detail: '3 of 12 tasks complete',
    value: 3,
    max: 12,
    icon: Calendar,
    href: 'timeline/gantt',
  },
];

interface ActivityEntry {
  id: string;
  text: string;
  timestamp: string;
  icon: React.ElementType;
}

const RECENT_ACTIVITY: ActivityEntry[] = [
  {
    id: '1',
    text: 'Assessment questionnaire started by Sarah Chen',
    timestamp: '2 hours ago',
    icon: FileText,
  },
  {
    id: '2',
    text: 'AUP policy draft created by Michael Torres',
    timestamp: '5 hours ago',
    icon: Shield,
  },
  {
    id: '3',
    text: 'Infrastructure domain assessment completed',
    timestamp: '1 day ago',
    icon: Target,
  },
  {
    id: '4',
    text: 'Team member Alex Rivera added to the project',
    timestamp: '2 days ago',
    icon: Users,
  },
  {
    id: '5',
    text: 'Project created and discovery phase initiated',
    timestamp: '3 days ago',
    icon: Play,
  },
  {
    id: '6',
    text: 'Executive sponsor approval received',
    timestamp: '3 days ago',
    icon: TrendingUp,
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function daysRemaining(target: string): number {
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-500';
}

function ratingBadgeVariant(
  rating: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (rating.includes('High')) return 'default';
  if (rating.includes('Moderate')) return 'secondary';
  return 'destructive';
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

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  // Merge fetched project data with demo data shape for display compatibility
  const rawProject = fetchedProject ?? DEMO_PROJECT;
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

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* ------------------------------------------------------------------ */}
      {/*  Top Section – Project name, status, dates                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {project.name}
            </h1>
            <Badge variant="secondary" className="capitalize">
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">{project.description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <LayoutDashboard className="h-4 w-4" />
            <span>
              Phase: <span className="font-medium text-slate-900">{project.phase}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            <span>{formatDate(project.targetDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span className="font-medium text-slate-900">{remaining} days left</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Score Card                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Feasibility Score</CardTitle>
          <CardDescription>
            Overall readiness assessment based on five evaluation domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            {/* Large score */}
            <div className="flex flex-col items-center gap-2 lg:min-w-[180px]">
              <div
                className={cn(
                  'flex h-28 w-28 items-center justify-center rounded-full border-4',
                  project.feasibilityScore >= 75
                    ? 'border-emerald-500'
                    : project.feasibilityScore >= 60
                    ? 'border-amber-500'
                    : 'border-orange-500'
                )}
              >
                <span className={cn('text-4xl font-bold', scoreColor(project.feasibilityScore))}>
                  {project.feasibilityScore}
                </span>
              </div>
              <Badge variant={ratingBadgeVariant(project.rating)}>{project.rating}</Badge>
            </div>

            {/* Domain bars */}
            <div className="flex-1 space-y-3">
              {DOMAIN_SCORES.map((d) => (
                <div key={d.domain} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">{d.label}</span>
                    <span className="text-slate-500">{d.score}/100</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn('h-full rounded-full transition-all', d.color)}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/*  Progress Cards Row                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROGRESS_CARDS.map((card) => {
          const percentage = card.max > 0 ? Math.round((card.value / card.max) * 100) : 0;
          const Icon = card.icon;

          return (
            <Link key={card.label} href={`/projects/${id}/${card.href}`}>
              <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className="h-5 w-5 text-slate-500" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardTitle className="text-base">{card.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-500">{card.detail}</p>
                  <Progress value={percentage} />
                  <p className="text-xs text-slate-500">{percentage}% complete</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Activity + Quick Actions                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-slate-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_ACTIVITY.map((entry) => {
                const Icon = entry.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <Icon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-900">{entry.text}</p>
                      <p className="text-xs text-slate-500">{entry.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/projects/${id}/discovery/questionnaire`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Continue Assessment
              </Button>
            </Link>
            <Link href={`/projects/${id}/timeline/gantt`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                View Timeline
              </Button>
            </Link>
            <Link href={`/projects/${id}/reports/generate`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                Generate Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
