'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  TrendingDown,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';
type RiskCategory = 'overdue' | 'blocked' | 'stalled' | 'dependency_chain' | 'resource_gap';

interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  severity: RiskSeverity;
  affectedTask: string;
  affectedRole: UserRole;
  dueDate: string;
  daysOverdue?: number;
  daysStalled?: number;
  blockedBy?: string;
  impactDescription: string;
  suggestedAction: string;
  actionHref: string;
}

/* -------------------------------------------------------------------------- */
/*  Role labels                                                               */
/* -------------------------------------------------------------------------- */

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Project Administrator',
  consultant: 'Governance Consultant',
  executive: 'Executive Sponsor',
  it: 'IT / Security Lead',
  legal: 'Legal / Compliance Lead',
  engineering: 'Engineering Lead',
  marketing: 'Communications Lead',
};

/* -------------------------------------------------------------------------- */
/*  Severity config                                                           */
/* -------------------------------------------------------------------------- */

const SEVERITY_CONFIG: Record<RiskSeverity, {
  label: string;
  dotClass: string;
  badgeClass: string;
  borderClass: string;
}> = {
  critical: {
    label: 'Critical',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    borderClass: 'border-l-red-500',
  },
  high: {
    label: 'High',
    dotClass: 'bg-orange-500',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    borderClass: 'border-l-orange-500',
  },
  medium: {
    label: 'Medium',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    borderClass: 'border-l-amber-500',
  },
  low: {
    label: 'Low',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
    borderClass: 'border-l-slate-400',
  },
};

const CATEGORY_CONFIG: Record<RiskCategory, { label: string; icon: React.ElementType }> = {
  overdue: { label: 'Overdue Task', icon: Clock },
  blocked: { label: 'Blocked', icon: XCircle },
  stalled: { label: 'Stalled Progress', icon: Loader2 },
  dependency_chain: { label: 'Dependency Chain', icon: TrendingDown },
  resource_gap: { label: 'Resource Gap', icon: Users },
};

/* -------------------------------------------------------------------------- */
/*  Risk data                                                                  */
/* -------------------------------------------------------------------------- */

function getProjectRisks(): ProjectRisk[] {
  const today = new Date();
  const d = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString();
  };

  return [
    {
      id: 'r-1',
      title: 'Security controls review is overdue',
      description: 'IT / Security Lead has not completed the security controls audit. 2 of 9 control categories remain incomplete.',
      category: 'overdue',
      severity: 'critical',
      affectedTask: 'Review security controls',
      affectedRole: 'it',
      dueDate: d(-2),
      daysOverdue: 2,
      impactDescription: 'Blocks sandbox configuration (Phase 4) and cascades to pilot launch timeline. Could delay project by 1-2 weeks.',
      suggestedAction: 'Review Controls',
      actionHref: 'controls',
    },
    {
      id: 'r-2',
      title: 'Sandbox setup blocked by incomplete data classification',
      description: 'Data classification is still in progress. Sandbox environment configuration cannot begin until classification is complete.',
      category: 'blocked',
      severity: 'high',
      affectedTask: 'Configure sandbox environment',
      affectedRole: 'it',
      dueDate: d(25),
      blockedBy: 'Data classification (IT / Security Lead)',
      impactDescription: 'Engineering team cannot begin pilot development until sandbox is provisioned. Delays Phase 4 start.',
      suggestedAction: 'Classify Data',
      actionHref: 'governance/compliance',
    },
    {
      id: 'r-3',
      title: 'Policy review not started — blocks Gate 1 approval',
      description: 'Legal / Compliance Lead has not begun reviewing the Acceptable Use Policy. This is a prerequisite for Gate 1.',
      category: 'dependency_chain',
      severity: 'high',
      affectedTask: 'Review Acceptable Use Policy draft',
      affectedRole: 'legal',
      dueDate: d(14),
      impactDescription: 'Gate 1 (Design Review) cannot proceed without policy sign-off. Executive approval is blocked until legal review completes.',
      suggestedAction: 'Review Policies',
      actionHref: 'governance/policies',
    },
    {
      id: 'r-4',
      title: 'Readiness questionnaire in progress — Phase 2 gated',
      description: 'Governance Consultant has started but not completed the readiness questionnaire. Phase 2 governance activities are waiting on results.',
      category: 'stalled',
      severity: 'medium',
      affectedTask: 'Complete readiness questionnaire',
      affectedRole: 'consultant',
      dueDate: d(5),
      daysStalled: 3,
      impactDescription: 'Policy drafting, compliance mapping, and evidence preparation are all blocked until readiness scores are available.',
      suggestedAction: 'Continue Assessment',
      actionHref: 'discovery/questionnaire',
    },
    {
      id: 'r-5',
      title: 'No Engineering Lead assigned to pilot scoping',
      description: 'The pilot project scope has not been defined. Engineering Lead needs to select a bounded pilot project and define success criteria.',
      category: 'resource_gap',
      severity: 'medium',
      affectedTask: 'Define pilot project scope',
      affectedRole: 'engineering',
      dueDate: d(12),
      impactDescription: 'Without a defined pilot scope, sprint planning and baseline metrics collection cannot begin. Phase 4 start at risk.',
      suggestedAction: 'View PoC Projects',
      actionHref: 'poc/projects',
    },
    {
      id: 'r-6',
      title: 'Communication plan delayed — pilot announcement at risk',
      description: 'Communications Lead has the stakeholder communication plan in progress but overdue. Pilot announcement materials depend on this.',
      category: 'stalled',
      severity: 'low',
      affectedTask: 'Draft stakeholder communication plan',
      affectedRole: 'marketing',
      dueDate: d(14),
      daysStalled: 2,
      impactDescription: 'Internal announcement for pilot launch may be delayed, reducing stakeholder awareness and buy-in.',
      suggestedAction: 'View Reports',
      actionHref: 'reports/generate',
    },
    {
      id: 'r-7',
      title: 'Compliance mapping incomplete — blocks Gate 2',
      description: 'Legal / Compliance Lead is working on compliance framework mapping but progress is slow. Gate 2 (Data & Security) requires this.',
      category: 'dependency_chain',
      severity: 'medium',
      affectedTask: 'Complete compliance framework mapping',
      affectedRole: 'legal',
      dueDate: d(16),
      impactDescription: 'Gate 2 sign-off is blocked. This cascades to sandbox setup approval and pilot launch timeline.',
      suggestedAction: 'Compliance Map',
      actionHref: 'governance/compliance',
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* -------------------------------------------------------------------------- */
/*  Risk Card                                                                  */
/* -------------------------------------------------------------------------- */

function RiskCard({ risk, projectId }: { risk: ProjectRisk; projectId: string }): React.ReactElement {
  const sevConfig = SEVERITY_CONFIG[risk.severity];
  const catConfig = CATEGORY_CONFIG[risk.category];
  const CatIcon = catConfig.icon;

  return (
    <Card className={cn('border-l-4 bg-white', sevConfig.borderClass)}>
      <CardContent className="py-5 px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={cn('inline-block h-2.5 w-2.5 rounded-full shrink-0', sevConfig.dotClass)} />
              <h3 className="font-semibold text-sm text-slate-900">{risk.title}</h3>
              <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5', sevConfig.badgeClass)}>
                {sevConfig.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-600 border-slate-200 gap-1">
                <CatIcon className="h-3 w-3" />
                {catConfig.label}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 mb-3 ml-[18px]">{risk.description}</p>

            {/* Impact */}
            <div className="ml-[18px] p-3 rounded-lg bg-red-50 border border-red-100 mb-3">
              <p className="text-xs font-medium text-red-800 mb-1">Impact on Project Timeline</p>
              <p className="text-xs text-red-700">{risk.impactDescription}</p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 ml-[18px] text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {ROLE_LABELS[risk.affectedRole]}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {risk.daysOverdue
                  ? <span className="text-red-600 font-medium">{risk.daysOverdue} day{risk.daysOverdue !== 1 ? 's' : ''} overdue</span>
                  : `Due ${formatDate(risk.dueDate)}`}
              </span>
              {risk.daysStalled && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Loader2 className="h-3 w-3" />
                  Stalled {risk.daysStalled} day{risk.daysStalled !== 1 ? 's' : ''}
                </span>
              )}
              {risk.blockedBy && (
                <span className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-3 w-3" />
                  Blocked by: {risk.blockedBy}
                </span>
              )}
            </div>
          </div>

          {/* Action button */}
          <Link href={`/projects/${projectId}/${risk.actionHref}`}>
            <Button size="sm" className="shrink-0 bg-slate-900 text-white hover:bg-slate-800">
              {risk.suggestedAction}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Summary cards                                                              */
/* -------------------------------------------------------------------------- */

function RiskSummaryCards({ risks }: { risks: ProjectRisk[] }) {
  const critical = risks.filter((r) => r.severity === 'critical').length;
  const high = risks.filter((r) => r.severity === 'high').length;
  const medium = risks.filter((r) => r.severity === 'medium').length;
  const low = risks.filter((r) => r.severity === 'low').length;

  const overdue = risks.filter((r) => r.category === 'overdue').length;
  const blocked = risks.filter((r) => r.category === 'blocked').length;

  const cards = [
    { label: 'Critical Risks', value: critical, color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
    { label: 'High Risks', value: high, color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle },
    { label: 'Overdue Tasks', value: overdue, color: 'text-red-600', bg: 'bg-red-50', icon: Clock },
    { label: 'Blocked Items', value: blocked, color: 'text-amber-600', bg: 'bg-amber-50', icon: XCircle },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn('flex items-center justify-center h-10 w-10 rounded-lg', card.bg, card.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className={cn('text-2xl font-bold', card.value > 0 ? card.color : 'text-slate-300')}>
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ProjectRisksPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const { id: projectId } = React.use(params);
  const [filter, setFilter] = useState<RiskSeverity | 'all'>('all');
  const risks = getProjectRisks();

  const filtered = filter === 'all' ? risks : risks.filter((r) => r.severity === filter);

  // Sort: critical first, then high, medium, low
  const severityOrder: Record<RiskSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...filtered].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Project Risks</h1>
            <p className="text-sm text-slate-500">Tasks and decisions at risk of delaying the project timeline</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <RiskSummaryCards risks={risks} />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => {
          const count = sev === 'all' ? risks.length : risks.filter((r) => r.severity === sev).length;
          return (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                filter === sev
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              )}
            >
              {sev === 'all' ? 'All Risks' : SEVERITY_CONFIG[sev].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Risk list */}
      {sorted.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No risks at this severity level</h3>
          <p className="text-sm text-slate-500 mt-2">
            {filter === 'all'
              ? 'All tasks are on track. No risks identified at this time.'
              : `No ${SEVERITY_CONFIG[filter as RiskSeverity].label.toLowerCase()} risks detected. Try viewing all risks.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((risk) => (
            <RiskCard key={risk.id} risk={risk} projectId={projectId} />
          ))}
        </div>
      )}

      {/* Dependency chain visualization */}
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Risk Cascade Timeline</CardTitle>
            <CardDescription className="text-slate-500">
              How current risks cascade through the project phases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  phase: 'Phase 1: Scope & Assess',
                  status: 'at_risk' as const,
                  reason: 'Readiness questionnaire stalled (3 days)',
                  cascadeTo: 'Phase 2 governance activities',
                },
                {
                  phase: 'Phase 2: Classify & Govern',
                  status: 'blocked' as const,
                  reason: 'Security controls overdue, policy review not started',
                  cascadeTo: 'Gate 1 & Gate 2 approvals',
                },
                {
                  phase: 'Phase 3: Approve & Gate',
                  status: 'delayed' as const,
                  reason: 'Gate approvals dependent on Phase 2 completion',
                  cascadeTo: 'Sandbox setup and pilot launch',
                },
                {
                  phase: 'Phase 4: Build & Test',
                  status: 'at_risk' as const,
                  reason: 'Sandbox blocked by data classification; no pilot scope defined',
                  cascadeTo: 'Sprint evaluations and tool comparison',
                },
                {
                  phase: 'Phase 5: Evaluate & Decide',
                  status: 'pending' as const,
                  reason: 'No immediate risks — depends on Phase 4 completion',
                  cascadeTo: null,
                },
              ].map((item, i) => {
                const statusConfig = {
                  at_risk: { color: 'bg-amber-500', label: 'At Risk', textColor: 'text-amber-700' },
                  blocked: { color: 'bg-red-500', label: 'Blocked', textColor: 'text-red-700' },
                  delayed: { color: 'bg-orange-500', label: 'Delayed', textColor: 'text-orange-700' },
                  pending: { color: 'bg-slate-300', label: 'Pending', textColor: 'text-slate-500' },
                }[item.status];

                return (
                  <div key={item.phase} className="flex items-start gap-4">
                    {/* Timeline marker */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={cn('h-4 w-4 rounded-full', statusConfig.color)} />
                      {i < 4 && <div className="w-0.5 h-10 bg-slate-200 mt-1" />}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">{item.phase}</span>
                        <Badge variant="outline" className={cn('text-[10px]', `${statusConfig.textColor} border-current bg-transparent`)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{item.reason}</p>
                      {item.cascadeTo && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Cascades to: {item.cascadeTo}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={`/projects/${projectId}/my-tasks`}>
          <Button variant="outline" size="sm" className="gap-1 border-slate-200 text-slate-600">
            Back to My Tasks
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
        <Link href={`/projects/${projectId}/project-plan`}>
          <Button variant="outline" size="sm" className="gap-1 border-slate-200 text-slate-600">
            View Project Plan
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
