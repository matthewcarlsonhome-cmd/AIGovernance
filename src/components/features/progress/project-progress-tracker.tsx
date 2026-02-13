'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import type { PhaseProgress, ProjectProgress } from '@/lib/progress/calculator';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ProjectProgressTracker({
  progress,
}: {
  progress: ProjectProgress;
}): React.ReactElement {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900">
              {progress.overall >= 80 ? 'Almost at the Finish Line!' : progress.overall >= 50 ? 'Making Great Progress' : progress.overall >= 25 ? 'Off to a Good Start' : 'The Journey Begins'}
            </CardTitle>
            <CardDescription className="text-slate-500">
              {progress.overall}% complete across {progress.phases.length} phases
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
  );
}

/* -------------------------------------------------------------------------- */
/*  Compact variant for sidebar                                                */
/* -------------------------------------------------------------------------- */

export function CompactProgressBar({
  progress,
}: {
  progress: ProjectProgress;
}): React.ReactElement {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-slate-500">Project Progress</span>
        <span className="text-[11px] font-semibold text-slate-700">{progress.overall}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
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
      <div className="flex justify-between mt-1">
        {progress.phases.map((phase) => (
          <div
            key={phase.phase}
            title={`${phase.label}: ${phase.percentage}%`}
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              phase.status === 'complete' ? 'bg-emerald-500' :
              phase.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-200'
            )}
          />
        ))}
      </div>
    </div>
  );
}
