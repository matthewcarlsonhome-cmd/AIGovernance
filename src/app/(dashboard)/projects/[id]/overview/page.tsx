'use client';

import * as React from 'react';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Info,
  Lock,
  MessageSquare,
  Play,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
  XCircle,
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { UserRole } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface RoleViewProps {
  projectId: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
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

/* -------------------------------------------------------------------------- */
/*  Demo Data                                                                  */
/* -------------------------------------------------------------------------- */

const PROJECT = {
  name: 'Enterprise AI Coding Agent Pilot',
  phase: 2,
  phaseLabel: 'Classify & Govern',
  totalPhases: 5,
  overallProgress: 38,
  status: 'on_track' as const,
  startDate: '2026-01-15',
  targetDate: '2026-07-30',
};

/* -------------------------------------------------------------------------- */
/*  Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: 'on_track' | 'at_risk' | 'delayed' }): React.ReactElement {
  const config = {
    on_track: { label: 'On Track', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    at_risk: { label: 'At Risk', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    delayed: { label: 'Delayed', className: 'bg-red-100 text-red-800 border-red-200' },
  };
  const c = config[status];
  return <Badge variant="outline" className={cn('text-xs', c.className)}>{c.label}</Badge>;
}

/* -------------------------------------------------------------------------- */
/*  Common Header                                                              */
/* -------------------------------------------------------------------------- */

function CommonHeader(): React.ReactElement {
  const remaining = daysRemaining(PROJECT.targetDate);

  return (
    <div className="space-y-4">
      {/* Title Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{PROJECT.name}</h1>
            <StatusBadge status={PROJECT.status} />
          </div>
          <p className="text-sm text-slate-500">
            Phase {PROJECT.phase} of {PROJECT.totalPhases} &mdash; {PROJECT.phaseLabel}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(PROJECT.startDate)} &ndash; {formatDate(PROJECT.targetDate)}
          </span>
          <span className={cn(
            'flex items-center gap-1 font-medium',
            remaining <= 30 ? 'text-amber-600' : 'text-slate-700',
          )}>
            <Clock className="h-3.5 w-3.5" />
            {remaining} days left
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Overall Progress</span>
            <span className="text-xs font-bold text-slate-900">{PROJECT.overallProgress}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                PROJECT.overallProgress >= 75 ? 'bg-emerald-500' :
                PROJECT.overallProgress >= 50 ? 'bg-blue-500' :
                PROJECT.overallProgress >= 25 ? 'bg-amber-500' : 'bg-slate-300',
              )}
              style={{ width: `${PROJECT.overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {['Assess', 'Govern', 'Build', 'Pilot', 'Decide'].map((label, i) => (
              <span
                key={label}
                className={cn(
                  'text-[10px] font-medium',
                  i < PROJECT.phase ? 'text-emerald-600' : i === PROJECT.phase - 1 ? 'text-blue-600' : 'text-slate-400',
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Executive Sponsor View                                                     */
/* -------------------------------------------------------------------------- */

function ExecutiveView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Decisions Awaiting Approval */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <Gavel className="h-5 w-5 text-slate-500" />
            Decisions Awaiting Your Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: 'Gate 2: Pilot Launch Approval', desc: 'All evidence collected, 2 of 3 approvers signed', badge: 'Urgent', badgeClass: 'bg-red-100 text-red-800 border-red-200' },
            { title: 'Risk Exception: Sandbox Data Access', desc: 'Engineering requests temporary access to internal dataset for pilot testing', badge: 'Pending', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
            { title: 'Budget Extension Request', desc: 'Request to extend pilot by 2 weeks with additional tooling budget', badge: 'New', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <Badge variant="outline" className={cn('text-xs shrink-0 ml-3', item.badgeClass)}>
                {item.badge}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score */}
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-xs text-slate-500 mb-2">Project Health Score</p>
            <div className="text-4xl font-bold text-slate-900">72</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">+5 from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Risk Summary */}
        <Card>
          <CardContent className="py-6">
            <p className="text-xs text-slate-500 mb-3 text-center">Risk Summary</p>
            <div className="flex justify-around">
              {[
                { label: 'High', count: 2, color: 'text-red-600 bg-red-100' },
                { label: 'Medium', count: 5, color: 'text-amber-600 bg-amber-100' },
                { label: 'Low', count: 8, color: 'text-emerald-600 bg-emerald-100' },
              ].map((r) => (
                <div key={r.label} className="text-center">
                  <div className={cn('inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold', r.color)}>
                    {r.count}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{r.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Status */}
        <Card>
          <CardContent className="py-6">
            <p className="text-xs text-slate-500 mb-3 text-center">Milestone Status</p>
            <div className="space-y-2">
              {[
                { label: 'Gate 1 Approved', done: true },
                { label: 'Gate 2 Review', done: false },
                { label: 'Pilot Complete', done: false },
                { label: 'Go/No-Go Decision', done: false },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-2 text-xs">
                  {m.done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  )}
                  <span className={m.done ? 'text-slate-500 line-through' : 'text-slate-700'}>{m.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  IT / Security Lead View                                                    */
/* -------------------------------------------------------------------------- */

function ITSecurityView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Security Control Status */}
        <Card>
          <CardContent className="py-6">
            <p className="text-xs text-slate-500 mb-3 text-center">Security Controls</p>
            <div className="flex justify-around">
              {[
                { label: 'Pass', count: 14, icon: CheckCircle2, color: 'text-emerald-500' },
                { label: 'Fail', count: 2, icon: XCircle, color: 'text-red-500' },
                { label: 'Pending', count: 4, icon: Clock, color: 'text-amber-500' },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="text-center">
                    <Icon className={cn('h-5 w-5 mx-auto', c.color)} />
                    <p className="text-lg font-bold text-slate-900 mt-1">{c.count}</p>
                    <p className="text-[10px] text-slate-500">{c.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sandbox Status */}
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-xs text-slate-500 mb-3">Sandbox Status</p>
            <div className="flex flex-col items-center gap-2">
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Configured</Badge>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Validation Pending</Badge>
            </div>
            <Link href={`/projects/${projectId}/sandbox/validate`}>
              <Button variant="outline" size="sm" className="mt-3 text-xs border-slate-200 text-slate-700">
                Run Validation
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Data Classification */}
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-xs text-slate-500 mb-3">Data Classification</p>
            <div className="text-3xl font-bold text-amber-600">5</div>
            <p className="text-xs text-slate-500 mt-1">assets pending review</p>
            <Link href={`/projects/${projectId}/governance/risk`}>
              <Button variant="outline" size="sm" className="mt-3 text-xs border-slate-200 text-slate-700">
                Review Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Technical Prerequisites */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-500" />
            Technical Prerequisites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: 'VPN access configured for sandbox', done: true },
              { label: 'DLP rules applied to AI tool egress', done: true },
              { label: 'Logging and monitoring enabled', done: true },
              { label: 'Network segmentation verified', done: false },
              { label: 'Secrets management configured', done: false },
              { label: 'Backup and recovery tested', done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-slate-300 shrink-0" />
                )}
                <span className={item.done ? 'text-slate-500' : 'text-slate-900'}>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Legal / Compliance Lead View                                               */
/* -------------------------------------------------------------------------- */

function LegalView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Policies Requiring Review */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            Policies Requiring Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: 'Acceptable Use Policy (v2)', status: 'Awaiting Review', statusClass: 'bg-amber-100 text-amber-800 border-amber-200' },
            { title: 'Incident Response Plan Addendum', status: 'Draft', statusClass: 'bg-slate-100 text-slate-600 border-slate-200' },
            { title: 'Data Classification Policy', status: 'Approved', statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
          ].map((p) => (
            <div key={p.title} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <span className="text-sm text-slate-900">{p.title}</span>
              <Badge variant="outline" className={cn('text-xs', p.statusClass)}>{p.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compliance Mapping Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">Compliance Mapping Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { framework: 'SOC 2', coverage: 78 },
              { framework: 'HIPAA', coverage: 45 },
              { framework: 'NIST AI RMF', coverage: 62 },
              { framework: 'GDPR', coverage: 85 },
            ].map((f) => (
              <div key={f.framework} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{f.framework}</span>
                  <span className="text-slate-900 font-medium">{f.coverage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      f.coverage >= 75 ? 'bg-emerald-500' : f.coverage >= 50 ? 'bg-amber-500' : 'bg-red-400',
                    )}
                    style={{ width: `${f.coverage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Exception Requests & Risk Entries */}
        <div className="space-y-4">
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-xs text-slate-500 mb-2">Exception Requests</p>
              <div className="text-3xl font-bold text-amber-600">3</div>
              <p className="text-xs text-slate-500 mt-1">pending your review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-900">Risk Entries Needing Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { title: 'Data residency for cloud AI provider', tier: 'High' },
                { title: 'Third-party model training on company data', tier: 'Critical' },
                { title: 'IP ownership of AI-generated code', tier: 'Medium' },
              ].map((r) => (
                <div key={r.title} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{r.title}</span>
                  <Badge variant="outline" className={cn(
                    'text-[10px]',
                    r.tier === 'Critical' ? 'bg-red-100 text-red-800 border-red-200' :
                    r.tier === 'High' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200',
                  )}>{r.tier}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Engineering Lead View                                                      */
/* -------------------------------------------------------------------------- */

function EngineeringView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sandbox Setup Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-slate-500" />
              Sandbox Setup Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'managed-settings.json generated', done: true },
              { label: 'requirements.toml configured', done: true },
              { label: 'Docker environment ready', done: false },
              { label: 'IDE plugin installed and configured', done: false },
              { label: 'Test suite baseline established', done: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-slate-300 shrink-0" />
                )}
                <span className={item.done ? 'text-slate-500' : 'text-slate-900'}>{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pilot Sprint Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              Sprint 2 Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Velocity Change</span>
              <span className="text-emerald-600 font-semibold">+62%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Defect Rate</span>
              <span className="text-amber-600 font-semibold">-18%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Developer Satisfaction</span>
              <span className="text-emerald-600 font-semibold">4.2 / 5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Tasks Completed</span>
              <span className="text-slate-900 font-semibold">7 / 12</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '58%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Comparison Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Tool Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="font-medium text-slate-500">Metric</div>
            <div className="font-medium text-slate-900">Claude Code</div>
            <div className="font-medium text-slate-900">Copilot</div>

            <div className="text-slate-600">Code Completion Rate</div>
            <div className="text-emerald-600 font-semibold">94%</div>
            <div className="text-slate-700">87%</div>

            <div className="text-slate-600">Avg. Time Saved / Task</div>
            <div className="text-emerald-600 font-semibold">32 min</div>
            <div className="text-slate-700">24 min</div>

            <div className="text-slate-600">Security Score</div>
            <div className="text-emerald-600 font-semibold">9.1 / 10</div>
            <div className="text-slate-700">8.4 / 10</div>

            <div className="text-slate-600">Dev Satisfaction</div>
            <div className="text-emerald-600 font-semibold">4.5 / 5</div>
            <div className="text-slate-700">4.1 / 5</div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Your Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { title: 'Configure workspace settings for Sprint 2', status: 'In Progress', statusClass: 'bg-blue-100 text-blue-800 border-blue-200' },
            { title: 'Capture Sprint 1 quality metrics', status: 'Due Tomorrow', statusClass: 'bg-amber-100 text-amber-800 border-amber-200' },
            { title: 'Review generated infrastructure config', status: 'Completed', statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
          ].map((t) => (
            <div key={t.title} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <span className="text-sm text-slate-900">{t.title}</span>
              <Badge variant="outline" className={cn('text-xs', t.statusClass)}>{t.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Communications Lead View                                                   */
/* -------------------------------------------------------------------------- */

function CommunicationsView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stakeholder Comms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              Stakeholder Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Engineering Team Briefing', status: 'Draft', statusClass: 'bg-amber-100 text-amber-800 border-amber-200' },
              { label: 'Executive Summary Email', status: 'Sent', statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              { label: 'All-Hands Announcement', status: 'Not Started', statusClass: 'bg-slate-100 text-slate-600 border-slate-200' },
            ].map((c) => (
              <div key={c.label} className="flex items-center justify-between p-2 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-900">{c.label}</span>
                <Badge variant="outline" className={cn('text-xs', c.statusClass)}>{c.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Change Management Plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">Change Management Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Overall Progress</span>
                <span className="text-slate-900 font-medium">45%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Stakeholder mapping', done: true },
                { label: 'Resistance assessment', done: true },
                { label: 'Training plan drafted', done: false },
                { label: 'Communication calendar', done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  )}
                  <span className={item.done ? 'text-slate-500' : 'text-slate-700'}>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FAQ Status */}
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-xs text-slate-500 mb-2">FAQ Document</p>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>
            <p className="text-xs text-slate-500 mt-2">8 of 15 questions answered</p>
          </CardContent>
        </Card>

        {/* Client Brief */}
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-xs text-slate-500 mb-2">Client Brief</p>
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Not Started</Badge>
            <p className="text-xs text-slate-500 mt-2">Awaiting pilot results</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Consultant / Admin View (Full Visibility)                                  */
/* -------------------------------------------------------------------------- */

function ConsultantAdminView({ projectId }: RoleViewProps): React.ReactElement {
  const phases = [
    { label: 'Discovery & Assessment', progress: 85 },
    { label: 'Classify & Govern', progress: 43 },
    { label: 'Sandbox & Control', progress: 33 },
    { label: 'Pilot Execution', progress: 25 },
    { label: 'Decision & Scale', progress: 0 },
  ];

  const bottlenecks = [
    { role: 'Legal / Compliance', pending: 6, trend: 'up' as const },
    { role: 'IT / Security', pending: 4, trend: 'down' as const },
    { role: 'Executive', pending: 3, trend: 'stable' as const },
    { role: 'Engineering', pending: 2, trend: 'down' as const },
    { role: 'Communications', pending: 1, trend: 'stable' as const },
  ];

  const recentActivity = [
    { text: 'Gate 1 (Sandbox Access) approved by Sarah Chen', time: '1 day ago', icon: Shield },
    { text: 'Sprint 1 metrics captured -- velocity +62%', time: '2 days ago', icon: TrendingUp },
    { text: 'AUP policy draft created by Michael Torres', time: '3 days ago', icon: FileText },
    { text: 'Assessment questionnaire completed (25/25)', time: '4 days ago', icon: Target },
    { text: 'Team member Alex Rivera added to the project', time: '5 days ago', icon: Users },
    { text: 'Project created and discovery phase initiated', time: '6 days ago', icon: Play },
  ];

  return (
    <div className="space-y-4">
      {/* Phase Completion Dashboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900">Phase Completion Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {phases.map((p) => (
            <div key={p.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{p.label}</span>
                <span className="text-slate-900 font-medium">{p.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    p.progress >= 75 ? 'bg-emerald-500' :
                    p.progress >= 50 ? 'bg-blue-500' :
                    p.progress >= 25 ? 'bg-amber-500' :
                    p.progress > 0 ? 'bg-slate-300' : 'bg-slate-100',
                  )}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bottleneck Detection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Cross-Role Bottleneck Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bottlenecks.map((b) => (
              <div key={b.role} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <span className="text-sm text-slate-700">{b.role}</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-semibold',
                    b.pending >= 5 ? 'text-red-600' : b.pending >= 3 ? 'text-amber-600' : 'text-slate-700',
                  )}>
                    {b.pending} pending
                  </span>
                  {b.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-400" />}
                  {b.trend === 'down' && <TrendingUp className="h-3 w-3 text-emerald-400 rotate-180" />}
                  {b.trend === 'stable' && <span className="w-3 h-0.5 bg-slate-300 inline-block" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.map((entry, i) => {
              const Icon = entry.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Icon className="h-3 w-3 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 leading-snug">{entry.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{entry.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href={`/projects/${projectId}/team`}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-200 text-slate-700">
                <Users className="h-3.5 w-3.5" />
                Reassign Task
              </Button>
            </Link>
            <Link href={`/projects/${projectId}/governance/gates`}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-200 text-slate-700">
                <Lock className="h-3.5 w-3.5" />
                Override Phase Lock
              </Button>
            </Link>
            <Link href={`/projects/${projectId}/governance/risk`}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-200 text-slate-700">
                <Shield className="h-3.5 w-3.5" />
                Manage Exceptions
              </Button>
            </Link>
            <Link href={`/projects/${projectId}/reports/generate`}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-200 text-slate-700">
                <FileText className="h-3.5 w-3.5" />
                Generate Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Role Labels                                                                */
/* -------------------------------------------------------------------------- */

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  consultant: 'Consultant',
  executive: 'Executive Sponsor',
  it: 'IT / Security Lead',
  legal: 'Legal / Compliance Lead',
  engineering: 'Engineering Lead',
  marketing: 'Communications Lead',
};

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = use(params);
  const [currentRole, setCurrentRole] = useState<UserRole>('consultant');

  // Read role from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('govai_user_role_override');
      if (stored && Object.keys(ROLE_LABELS).includes(stored)) {
        setCurrentRole(stored as UserRole);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist role changes to localStorage
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    try {
      localStorage.setItem('govai_user_role_override', role);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Common Header */}
      <CommonHeader />

      {/* Role Switcher */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 shrink-0">Viewing as:</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([role, label]) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    currentRole === role
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Content */}
      {currentRole === 'executive' && <ExecutiveView projectId={id} />}
      {currentRole === 'it' && <ITSecurityView projectId={id} />}
      {currentRole === 'legal' && <LegalView projectId={id} />}
      {currentRole === 'engineering' && <EngineeringView projectId={id} />}
      {currentRole === 'marketing' && <CommunicationsView projectId={id} />}
      {(currentRole === 'consultant' || currentRole === 'admin') && (
        <ConsultantAdminView projectId={id} />
      )}

      {/* Role context tip */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <span className="text-xs text-blue-700">
          You are viewing this project as <strong>{ROLE_LABELS[currentRole]}</strong>.
          Switch roles above to see different perspectives of the project. Each role sees
          information and actions most relevant to their responsibilities.
        </span>
      </div>
    </div>
  );
}
