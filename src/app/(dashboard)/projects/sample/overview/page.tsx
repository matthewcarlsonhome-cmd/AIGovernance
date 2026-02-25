'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Shield,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/* -------------------------------------------------------------------------- */
/*  Phase Stepper                                                              */
/* -------------------------------------------------------------------------- */

const PHASES = [
  { number: 1, name: 'Scope & Assess', status: 'complete' as const, tasks: 6 },
  { number: 2, name: 'Classify & Govern', status: 'complete' as const, tasks: 12 },
  { number: 3, name: 'Approve & Gate', status: 'active' as const, tasks: 5 },
  { number: 4, name: 'Build & Test', status: 'not_started' as const, tasks: 6 },
  { number: 5, name: 'Evaluate & Decide', status: 'not_started' as const, tasks: 4 },
];

function PhaseStepper(): React.ReactElement {
  return (
    <div className="flex items-center justify-between w-full">
      {PHASES.map((phase, i) => (
        <React.Fragment key={phase.number}>
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
              phase.status === 'complete'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : phase.status === 'active'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-slate-300 text-slate-400',
            )}>
              {phase.status === 'complete' ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs font-bold">{phase.number}</span>
              )}
            </div>
            <span className={cn(
              'text-[10px] font-medium text-center leading-tight',
              phase.status === 'complete' ? 'text-emerald-700' :
              phase.status === 'active' ? 'text-blue-700' : 'text-slate-400',
            )}>
              {phase.name}
            </span>
            <span className={cn(
              'text-[10px]',
              phase.status === 'complete' ? 'text-emerald-600' :
              phase.status === 'active' ? 'text-blue-600' : 'text-slate-400',
            )}>
              {phase.status === 'complete' ? `${phase.tasks} done` :
               phase.status === 'active' ? `${phase.tasks} tasks` : 'Pending'}
            </span>
          </div>
          {i < PHASES.length - 1 && (
            <div className={cn(
              'h-0.5 flex-1 mx-1 -mt-6',
              PHASES[i + 1].status !== 'not_started' || phase.status === 'complete'
                ? 'bg-emerald-300' : 'bg-slate-200',
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Activity Item                                                              */
/* -------------------------------------------------------------------------- */

const ACTIVITIES = [
  { text: 'Gate 1 approved — data classification complete', time: '2 days ago', icon: CheckCircle2, color: 'text-emerald-500' },
  { text: 'AUP policy finalized and signed by legal', time: '4 days ago', icon: FileText, color: 'text-blue-500' },
  { text: 'SOC2 compliance mapping reached 92% coverage', time: '1 week ago', icon: Shield, color: 'text-indigo-500' },
  { text: 'Security controls baseline: 14 of 16 passing', time: '1 week ago', icon: Shield, color: 'text-emerald-500' },
  { text: 'Risk register updated: 2 high-risk items with mitigation plans', time: '2 weeks ago', icon: AlertTriangle, color: 'text-amber-500' },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function SampleProjectOverviewPage(): React.ReactElement {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Demo banner */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800">
            This is a <strong>sample project</strong> for demonstration purposes.
          </p>
        </div>
        <Link
          href="/projects/new/onboarding"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors shrink-0"
        >
          Create Your Own Project
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Project Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Enterprise AI Coding Agent Pilot
              </h1>
              <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
                On Track
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Acme Corporation &mdash; Phase 3 of 5 &mdash; Approve &amp; Gate
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Jan 15, 2026 &ndash; Jul 30, 2026
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Clock className="h-3.5 w-3.5" />
              155 days left
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Overall Progress</span>
              <span className="text-xs font-bold text-slate-900">55%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: '55%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Stepper */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-900">Project Phases</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-5">
          <PhaseStepper />
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Readiness Score</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">78<span className="text-lg text-slate-400">/100</span></p>
            <Badge className="mt-2 bg-emerald-100 text-emerald-800 border-transparent text-xs">Passed</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Compliance</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">82<span className="text-lg text-slate-400">%</span></p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge className="bg-slate-100 text-slate-700 border-transparent text-[10px]">SOC2: 92%</Badge>
              <Badge className="bg-slate-100 text-slate-700 border-transparent text-[10px]">HIPAA: 78%</Badge>
              <Badge className="bg-slate-100 text-slate-700 border-transparent text-[10px]">NIST: 76%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Items</span>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold text-slate-900">15</p>
              <span className="text-xs text-slate-500">total</span>
            </div>
            <div className="mt-2 flex gap-2">
              <Badge className="bg-red-100 text-red-800 border-transparent text-[10px]">2 High</Badge>
              <Badge className="bg-amber-100 text-amber-800 border-transparent text-[10px]">5 Medium</Badge>
              <Badge className="bg-slate-100 text-slate-600 border-transparent text-[10px]">8 Low</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Team</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">12<span className="text-lg text-slate-400"> members</span></p>
            <p className="mt-2 text-xs text-slate-500">Across 7 roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Phase Summary + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">Phase Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PHASES.map((phase) => (
              <div key={phase.number} className="flex items-center gap-3">
                <div className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full shrink-0',
                  phase.status === 'complete' ? 'bg-emerald-100' :
                  phase.status === 'active' ? 'bg-blue-100' : 'bg-slate-100',
                )}>
                  {phase.status === 'complete' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : phase.status === 'active' ? (
                    <Circle className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    phase.status === 'complete' ? 'text-slate-500' :
                    phase.status === 'active' ? 'text-slate-900' : 'text-slate-400',
                  )}>
                    Phase {phase.number}: {phase.name}
                  </p>
                </div>
                <Badge className={cn(
                  'text-[10px] border-transparent shrink-0',
                  phase.status === 'complete' ? 'bg-emerald-100 text-emerald-800' :
                  phase.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500',
                )}>
                  {phase.status === 'complete' ? `${phase.tasks} tasks done` :
                   phase.status === 'active' ? 'In Progress' : 'Not Started'}
                </Badge>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total tasks completed</span>
                <span className="font-bold text-slate-900">18 of 33</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ACTIVITIES.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <Icon className={cn('h-4 w-4', activity.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{activity.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Governance Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">Governance Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-medium text-slate-900">Policies</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  Acceptable Use Policy — Approved
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  IRP Addendum — Approved
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  Data Classification — Approved
                </li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <h4 className="text-sm font-medium text-slate-900">Security Controls</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  14 of 16 controls passing
                </li>
                <li className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                  2 controls need remediation
                </li>
                <li className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-blue-500 shrink-0" />
                  87.5% pass rate (target: 90%)
                </li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-medium text-slate-900">Gate Reviews</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  Gate 1: Data Approval — Approved
                </li>
                <li className="flex items-center gap-1.5">
                  <Circle className="h-3 w-3 text-blue-500 fill-blue-500 shrink-0" />
                  Gate 2: Security Review — In Review
                </li>
                <li className="flex items-center gap-1.5">
                  <Circle className="h-3 w-3 text-slate-300 shrink-0" />
                  Gate 3: Launch Review — Pending
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center py-4">
        <Link
          href="/projects/new/onboarding"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          Create Your Own Project
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-slate-400 mt-2">
          Set up your organization&apos;s AI governance project in under 5 minutes.
        </p>
      </div>
    </div>
  );
}
