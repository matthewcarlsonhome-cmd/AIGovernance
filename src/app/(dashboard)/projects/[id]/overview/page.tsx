'use client';

import * as React from 'react';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Play,
  Shield,
  Target,
  TrendingUp,
  Users,
  Sparkles,
  Rocket,
  Info,
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
import type { ProjectStatus } from '@/types';
import { useProject } from '@/hooks/use-projects';
import { useCurrentUser } from '@/hooks/use-auth';
import { buildDemoProgress } from '@/lib/progress/calculator';
import { ProjectProgressTracker } from '@/components/features/progress/project-progress-tracker';
import { ProjectStatusHeader } from '@/components/features/project-status/next-best-action';
import { WorkQueue } from '@/components/features/work-queue/work-queue';

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
/*  Work Queue — imported from extracted component                             */
/* -------------------------------------------------------------------------- */

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

  // Check if this is the user's first visit to this project
  useEffect(() => {
    try {
      const key = `govai_overview_visited_${id}`;
      const visited = localStorage.getItem(key);
      if (!visited) {
        setShowWelcome(true);
        localStorage.setItem(key, 'true');
      }
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

  // Fun encouragement based on progress
  const encouragement = progress.overall >= 80
    ? 'You\'re in the home stretch! Victory lap incoming.'
    : progress.overall >= 60
    ? 'Serious momentum here. The team is on fire.'
    : progress.overall >= 40
    ? 'Nice rhythm! You\'re building something great.'
    : progress.overall >= 20
    ? 'The foundation is taking shape. Keep stacking.'
    : 'Every epic governance program starts with step one. This is yours.';

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
                <h2 className="text-lg font-bold text-indigo-900 mb-1">Welcome aboard! This is your command center.</h2>
                <p className="text-sm text-indigo-700 mb-3">
                  Everything you need in one place: progress, action items, health checks.
                  Think of it as your governance cockpit &mdash; buckle up and enjoy the ride.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-indigo-600">
                  <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Your action items are tailored to your role</span>
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Progress updates itself &mdash; no manual tracking</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Every team member gets their own personalized view</span>
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

      {/* Next Best Action Header */}
      <ProjectStatusHeader projectId={id} />

      {/* Progress Tracker */}
      <ProjectProgressTracker progress={progress} />

      {/* Work Queue + Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Work Queue */}
        <WorkQueue projectId={id} userRole={userRole} />

        {/* Health Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900">Vital Signs</CardTitle>
            <CardDescription className="text-slate-500">
              How your governance program is feeling today
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
                Manageable
              </Badge>
            </div>
            {/* Timeline Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Timeline</span>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                Smooth Sailing
              </Badge>
            </div>
            {/* Gate Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Gate Progress</span>
              <span className="text-sm text-slate-900">1 of 3 cleared</span>
            </div>
            {/* Budget */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Budget</span>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                Looking Good
              </Badge>
            </div>

            <div className="pt-2 border-t space-y-2">
              <Link href={`/projects/${id}/discovery/readiness`}>
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs border-slate-200 text-slate-700">
                  <Target className="h-3.5 w-3.5" />
                  Dive Into the Assessment
                  <ArrowRight className="h-3 w-3 ml-auto" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="w-full gap-2 text-xs text-slate-500">
                  <Info className="h-3.5 w-3.5" />
                  Try a different role to see their view
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
            The Story So Far
          </CardTitle>
          <CardDescription className="text-slate-500">
            Every milestone and move, captured in real time
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
