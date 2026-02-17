'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CANONICAL_WORKFLOW, WORKFLOW_MAPPINGS } from '@/lib/workflow/mapping';
import type { CanonicalWorkflowStep } from '@/types';
import { CheckCircle, Circle, ArrowRight, Target, Shield, FileCheck, Rocket, BarChart3, ClipboardCheck } from 'lucide-react';

const STEP_ICONS: Record<CanonicalWorkflowStep, React.ReactNode> = {
  scope: <Target className="h-6 w-6" />,
  classify: <Shield className="h-6 w-6" />,
  control_check: <ClipboardCheck className="h-6 w-6" />,
  approve: <FileCheck className="h-6 w-6" />,
  execute: <Rocket className="h-6 w-6" />,
  decide: <BarChart3 className="h-6 w-6" />,
};

// Demo completion data
const DEMO_COMPLETION: Record<CanonicalWorkflowStep, { completed: number; total: number }> = {
  scope: { completed: 4, total: 6 },
  classify: { completed: 5, total: 7 },
  control_check: { completed: 2, total: 4 },
  approve: { completed: 2, total: 4 },
  execute: { completed: 1, total: 7 },
  decide: { completed: 0, total: 5 },
};

const STEP_COLORS: Record<CanonicalWorkflowStep, string> = {
  scope: 'bg-blue-100 text-blue-700 border-blue-200',
  classify: 'bg-purple-100 text-purple-700 border-purple-200',
  control_check: 'bg-orange-100 text-orange-700 border-orange-200',
  approve: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  execute: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  decide: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);

  const totalCompleted = Object.values(DEMO_COMPLETION).reduce((s, v) => s + v.completed, 0);
  const totalTasks = Object.values(DEMO_COMPLETION).reduce((s, v) => s + v.total, 0);
  const overallProgress = Math.round((totalCompleted / totalTasks) * 100);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Governance Workflow</h1>
        <p className="text-slate-500 mt-1">
          Canonical flow: <strong>Scope &rarr; Classify &rarr; Control Check &rarr; Approve &rarr; Execute &rarr; Decide</strong>
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Overall Workflow Progress</p>
              <p className="text-xs text-slate-500">{totalCompleted} of {totalTasks} items completed</p>
            </div>
            <span className="text-2xl font-bold text-slate-900">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {CANONICAL_WORKFLOW.map((step, index) => {
          const completion = DEMO_COMPLETION[step.step];
          const pct = completion.total > 0 ? Math.round((completion.completed / completion.total) * 100) : 0;
          const isComplete = pct === 100;
          const isActive = !isComplete && index === CANONICAL_WORKFLOW.findIndex((s) => {
            const c = DEMO_COMPLETION[s.step];
            return c.total > 0 && c.completed < c.total;
          });
          const pages = WORKFLOW_MAPPINGS.filter((m) => m.workflow_step === step.step && m.status === 'keep');

          return (
            <Card key={step.step} className={isActive ? 'border-slate-900 border-2' : isComplete ? 'border-emerald-200' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isComplete ? 'bg-emerald-100 text-emerald-700' : isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {STEP_ICONS[step.step]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900">{step.label}</h3>
                      {isComplete && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200" variant="outline">Complete</Badge>}
                      {isActive && <Badge className="bg-slate-900 text-white">Active</Badge>}
                      <span className="text-sm text-slate-500 ml-auto">{completion.completed}/{completion.total}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{step.description}</p>
                    <Progress value={pct} className="h-2 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {pages.map((page) => (
                        <Badge key={page.page_route} variant="outline" className={`text-xs ${STEP_COLORS[step.step]}`}>
                          {page.page_title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
