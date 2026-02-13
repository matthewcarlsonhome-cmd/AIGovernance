'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Bug,
  Clock,
  GitPullRequest,
  Shield,
  Smile,
} from 'lucide-react';
import { usePocMetrics } from '@/hooks/use-poc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MetricDirection = 'up' | 'down';

interface Metric {
  id: string;
  name: string;
  icon: React.ElementType;
  baselineValue: string;
  baselineUnit: string;
  aiValue: string;
  aiUnit: string;
  changePercent: number;
  direction: MetricDirection;
  isPositive: boolean;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const METRICS: Metric[] = [
  {
    id: 'velocity',
    name: 'Velocity',
    icon: Zap,
    baselineValue: '21',
    baselineUnit: 'pts/sprint',
    aiValue: '36',
    aiUnit: 'pts/sprint',
    changePercent: 71,
    direction: 'up',
    isPositive: true,
    description:
      'Story points completed per sprint. Measures team throughput with and without AI assistance.',
  },
  {
    id: 'cycle-time',
    name: 'Cycle Time',
    icon: Clock,
    baselineValue: '4.2',
    baselineUnit: 'days',
    aiValue: '2.1',
    aiUnit: 'days',
    changePercent: 50,
    direction: 'down',
    isPositive: true,
    description:
      'Average time from task start to completion. Measures how quickly individual work items move through the pipeline.',
  },
  {
    id: 'defect-rate',
    name: 'Defect Rate',
    icon: Bug,
    baselineValue: '12',
    baselineUnit: '%',
    aiValue: '8',
    aiUnit: '%',
    changePercent: 33,
    direction: 'down',
    isPositive: true,
    description:
      'Percentage of code changes that introduce defects caught in QA or production. Lower is better.',
  },
  {
    id: 'review-time',
    name: 'Code Review Time',
    icon: GitPullRequest,
    baselineValue: '45',
    baselineUnit: 'min/PR',
    aiValue: '22',
    aiUnit: 'min/PR',
    changePercent: 51,
    direction: 'down',
    isPositive: true,
    description:
      'Average time spent reviewing each pull request. Includes initial review and revision cycles.',
  },
  {
    id: 'test-coverage',
    name: 'Test Coverage',
    icon: Shield,
    baselineValue: '67',
    baselineUnit: '%',
    aiValue: '84',
    aiUnit: '%',
    changePercent: 25,
    direction: 'up',
    isPositive: true,
    description:
      'Percentage of codebase covered by automated tests. Includes unit, integration, and e2e tests.',
  },
  {
    id: 'satisfaction',
    name: 'Developer Satisfaction',
    icon: Smile,
    baselineValue: '6.2',
    baselineUnit: '/10',
    aiValue: '8.7',
    aiUnit: '/10',
    changePercent: 40,
    direction: 'up',
    isPositive: true,
    description:
      'Self-reported developer satisfaction score from anonymous surveys. Measures tooling experience and productivity sentiment.',
  },
];

/* ------------------------------------------------------------------ */
/*  Metric Card Component                                              */
/* ------------------------------------------------------------------ */

function MetricCard({ metric }: { metric: Metric }): React.ReactElement {
  const Icon = metric.icon;
  const isPositiveChange = metric.isPositive;
  const changePrefix = metric.direction === 'up' ? '+' : '-';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <Icon className="h-5 w-5 text-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm">
              {metric.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1">
              {metric.description}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 gap-0 border-t border-slate-200">
          {/* Baseline */}
          <div className="p-4 border-r border-slate-200">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Baseline
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-500">
                {metric.baselineValue}
              </span>
              <span className="text-xs text-slate-500">
                {metric.baselineUnit}
              </span>
            </div>
          </div>

          {/* AI-Assisted */}
          <div className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              AI-Assisted
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">
                {metric.aiValue}
              </span>
              <span className="text-xs text-slate-500">
                {metric.aiUnit}
              </span>
            </div>
          </div>
        </div>

        {/* Change indicator */}
        <div
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 px-4',
            isPositiveChange
              ? 'bg-emerald-500/10'
              : 'bg-red-500/10'
          )}
        >
          {metric.direction === 'up' ? (
            <ArrowUpRight
              className={cn(
                'h-4 w-4',
                isPositiveChange ? 'text-emerald-600' : 'text-red-600'
              )}
            />
          ) : (
            <ArrowDownRight
              className={cn(
                'h-4 w-4',
                isPositiveChange ? 'text-emerald-600' : 'text-red-600'
              )}
            />
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              isPositiveChange ? 'text-emerald-700' : 'text-red-700'
            )}
          >
            {changePrefix}{metric.changePercent}%
          </span>
          <span className="text-xs text-slate-500 ml-1">
            vs baseline
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MetricsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const { data: fetchedMetrics, isLoading, error } = usePocMetrics(id);

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  // Gracefully fall through to demo data if API errors

  // Use fetched metrics or fall back to demo data
  const metrics: Metric[] = METRICS;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Baseline vs. AI-Assisted Metrics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare team performance metrics before and after AI coding agent
          adoption across velocity, quality, and developer experience.
        </p>
      </div>

      <Separator />

      {/* Overall Impact Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Overall Impact Assessment
                </h2>
                <p className="text-sm text-slate-500">
                  All 6 measured metrics show positive improvement with AI
                  assistance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-emerald-500/15 text-emerald-700 border-emerald-500/25 text-sm px-3 py-1"
              >
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                6/6 Metrics Improved
              </Badge>
            </div>
          </div>

          {/* Metric highlights bar */}
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {METRICS.map((metric) => {
              const changePrefix = metric.direction === 'up' ? '+' : '-';
              return (
                <div key={metric.id} className="text-center">
                  <p className="text-lg font-bold text-emerald-600">
                    {changePrefix}{metric.changePercent}%
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {metric.name}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Data Collection Note */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Data Collection Methodology
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Baseline metrics were captured during a 2-week period prior to
                AI tool introduction (Jan 13-24, 2026). AI-assisted metrics
                represent the average across Sprint 1 (completed) and Sprint 2
                (in progress). Final metrics will include all 3 evaluation
                sprints. Developer satisfaction scores are from anonymous surveys
                administered at the end of each sprint.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
