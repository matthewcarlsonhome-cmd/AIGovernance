'use client';

import * as React from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Timer,
  CheckCircle2,
  Play,
  CalendarDays,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useSprints } from '@/hooks/use-poc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SprintStatus = 'completed' | 'active' | 'planned';

interface SprintGoal {
  name: string;
  completed: boolean;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  goals: SprintGoal[];
  velocity: number;
  baselineVelocity: number;
  storyPointsPlanned: number;
  storyPointsCompleted: number;
  defectRate: number;
  satisfaction: number;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const SPRINTS: Sprint[] = [
  {
    id: 's1',
    name: 'Sprint 1',
    startDate: 'Jan 27, 2026',
    endDate: 'Feb 7, 2026',
    status: 'completed',
    goals: [
      { name: 'API endpoint generation', completed: true },
      { name: 'Unit test writing', completed: true },
      { name: 'Code review automation', completed: true },
    ],
    velocity: 34,
    baselineVelocity: 21,
    storyPointsPlanned: 34,
    storyPointsCompleted: 34,
    defectRate: 9,
    satisfaction: 8.4,
  },
  {
    id: 's2',
    name: 'Sprint 2',
    startDate: 'Feb 10, 2026',
    endDate: 'Feb 21, 2026',
    status: 'active',
    goals: [
      { name: 'Database migration generation', completed: true },
      { name: 'Integration testing', completed: false },
      { name: 'Performance optimization', completed: false },
    ],
    velocity: 38,
    baselineVelocity: 21,
    storyPointsPlanned: 40,
    storyPointsCompleted: 24,
    defectRate: 7,
    satisfaction: 8.9,
  },
  {
    id: 's3',
    name: 'Sprint 3',
    startDate: 'Feb 24, 2026',
    endDate: 'Mar 7, 2026',
    status: 'planned',
    goals: [
      { name: 'Full feature development', completed: false },
      { name: 'CI/CD pipeline tasks', completed: false },
      { name: 'Documentation generation', completed: false },
    ],
    velocity: 0,
    baselineVelocity: 21,
    storyPointsPlanned: 42,
    storyPointsCompleted: 0,
    defectRate: 0,
    satisfaction: 0,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusBadgeClasses(status: SprintStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25';
    case 'active':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/25';
    case 'planned':
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

function getStatusLabel(status: SprintStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'active':
      return 'Active';
    case 'planned':
      return 'Planned';
  }
}

function getStatusIcon(status: SprintStatus): React.ReactElement {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'active':
      return <Play className="h-5 w-5 text-blue-500" />;
    case 'planned':
      return <CalendarDays className="h-5 w-5 text-slate-500" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SprintEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const { data: fetchedSprints, isLoading, error } = useSprints(id);
  const [expandedSprint, setExpandedSprint] = React.useState<string | null>('s2');

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  const sprints: Sprint[] = (fetchedSprints && fetchedSprints.length > 0) ? fetchedSprints as unknown as Sprint[] : SPRINTS;

  const toggleExpand = (id: string): void => {
    setExpandedSprint((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sprint Evaluation Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track evaluation sprints for the Claude Code PoC with velocity,
            quality, and satisfaction metrics per sprint.
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-500/15 text-blue-700 border-blue-500/25 text-sm px-3 py-1">
          <Zap className="h-3.5 w-3.5 mr-1" />
          Claude Code Evaluation
        </Badge>
      </div>

      <Separator />

      {/* Sprint Summary Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {sprints.filter((s) => s.status === 'completed').length}
                </p>
                <p className="text-xs text-slate-500">Sprints Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">+62%</p>
                <p className="text-xs text-slate-500">Avg Velocity Increase</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">8.7/10</p>
                <p className="text-xs text-slate-500">Avg Dev Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sprint Cards */}
      <div className="space-y-4">
        {sprints.map((sprint) => {
          const isExpanded = expandedSprint === sprint.id;
          const completionPct =
            sprint.storyPointsPlanned > 0
              ? Math.round(
                  (sprint.storyPointsCompleted / sprint.storyPointsPlanned) * 100
                )
              : 0;
          const velocityChange =
            sprint.velocity > 0
              ? Math.round(
                  ((sprint.velocity - sprint.baselineVelocity) /
                    sprint.baselineVelocity) *
                    100
                )
              : 0;

          return (
            <Card
              key={sprint.id}
              className={cn(
                'transition-colors',
                sprint.status === 'active' && 'border-blue-500/30'
              )}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleExpand(sprint.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sprint.status)}
                    <div>
                      <CardTitle className="text-lg">{sprint.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-0.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {sprint.startDate} - {sprint.endDate}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getStatusBadgeClasses(sprint.status))}
                    >
                      {getStatusLabel(sprint.status)}
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {sprint.status !== 'planned' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>
                        {sprint.storyPointsCompleted}/{sprint.storyPointsPlanned} story
                        points
                      </span>
                      <span>{completionPct}%</span>
                    </div>
                    <Progress value={completionPct} />
                  </div>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <Separator className="mb-4" />

                  {/* Goals */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">
                      Sprint Goals
                    </h4>
                    <div className="space-y-2">
                      {sprint.goals.map((goal) => (
                        <div
                          key={goal.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          {goal.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-slate-400 shrink-0" />
                          )}
                          <span
                            className={cn(
                              goal.completed
                                ? 'text-slate-900'
                                : 'text-slate-500'
                            )}
                          >
                            {goal.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  {sprint.status !== 'planned' && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">
                        Sprint Metrics
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Velocity</p>
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-xl font-bold text-slate-900">
                              {sprint.velocity}
                            </p>
                            <span className="text-xs text-slate-500">
                              pts/sprint
                            </span>
                          </div>
                          {velocityChange > 0 && (
                            <p className="text-xs text-emerald-600 mt-0.5">
                              +{velocityChange}% vs baseline ({sprint.baselineVelocity})
                            </p>
                          )}
                        </div>
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Defect Rate</p>
                          <p className="text-xl font-bold text-slate-900">
                            {sprint.defectRate}%
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Baseline: 12%
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">
                            Dev Satisfaction
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            {sprint.satisfaction}/10
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Baseline: 6.2/10
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Completion</p>
                          <p className="text-xl font-bold text-slate-900">
                            {completionPct}%
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sprint.storyPointsCompleted}/{sprint.storyPointsPlanned} pts
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
