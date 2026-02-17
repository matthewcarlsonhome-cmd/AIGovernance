'use client';

import * as React from 'react';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  Shield,
  ShieldAlert,
  Target,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  NextBestAction,
  ProjectStatusSummary,
  GovernanceGateType,
  GovernanceGateDecision,
  ProjectStatus,
  ActionCategory,
  ActionPriority,
} from '@/types';
import {
  computeNextActions,
  buildDemoProjectState,
} from '@/lib/progress/next-actions';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PHASE_LABELS: Record<ProjectStatus, string> = {
  discovery: 'Discovery',
  governance: 'Governance',
  sandbox: 'Sandbox',
  pilot: 'Pilot',
  evaluation: 'Evaluation',
  production: 'Production',
  completed: 'Completed',
};

const PHASE_ORDER: ProjectStatus[] = [
  'discovery',
  'governance',
  'sandbox',
  'pilot',
  'evaluation',
  'production',
  'completed',
];

const GATE_LABELS: Record<GovernanceGateType, string> = {
  design_review: 'Design Review',
  data_approval: 'Data Approval',
  security_review: 'Security Review',
  launch_review: 'Launch Review',
};

const GATE_ORDER: GovernanceGateType[] = [
  'design_review',
  'data_approval',
  'security_review',
  'launch_review',
];

const CATEGORY_ICONS: Record<ActionCategory, React.ReactNode> = {
  governance: <Shield className="h-4 w-4" />,
  security: <ShieldAlert className="h-4 w-4" />,
  data: <Lock className="h-4 w-4" />,
  pilot: <Target className="h-4 w-4" />,
  review: <Clock className="h-4 w-4" />,
  team: <Circle className="h-4 w-4" />,
};

/* -------------------------------------------------------------------------- */
/*  Demo data builder                                                          */
/* -------------------------------------------------------------------------- */

function buildDemoSummary(projectId: string): ProjectStatusSummary {
  const state = buildDemoProjectState(projectId);
  const nextActions = computeNextActions(state);
  const blockerCount = nextActions.filter((a) => a.blocker).length;

  return {
    project_id: projectId,
    current_phase: state.currentPhase,
    completion_percent: 38,
    blockers: blockerCount,
    next_actions: nextActions,
    governance_gates: state.gates,
    security_posture: {
      pass_rate: state.securityPassRate,
      critical_failures: state.criticalSecurityFailures,
    },
    data_classification_complete: state.dataClassificationComplete,
    pilot_readiness_score: null,
  };
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

/** Phase badge with color semantics */
function PhaseBadge({ phase }: { phase: ProjectStatus }): React.ReactElement {
  const isComplete = phase === 'completed';
  const isProduction = phase === 'production';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        isComplete
          ? 'bg-emerald-100 text-emerald-800'
          : isProduction
            ? 'bg-blue-100 text-blue-800'
            : 'bg-amber-100 text-amber-800',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isComplete
            ? 'bg-emerald-500'
            : isProduction
              ? 'bg-blue-500'
              : 'bg-amber-500',
        )}
      />
      {PHASE_LABELS[phase]}
    </span>
  );
}

/** Gate status pill */
function GateStatusPill({
  gateType,
  decision,
}: {
  gateType: GovernanceGateType;
  decision: GovernanceGateDecision;
}): React.ReactElement {
  const colorMap: Record<GovernanceGateDecision, string> = {
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    conditionally_approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-slate-100 text-slate-600 border-slate-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    deferred: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const iconMap: Record<GovernanceGateDecision, React.ReactNode> = {
    approved: <CheckCircle2 className="h-3 w-3 text-emerald-600" />,
    conditionally_approved: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
    pending: <Circle className="h-3 w-3 text-slate-400" />,
    rejected: <XCircle className="h-3 w-3 text-red-600" />,
    deferred: <Clock className="h-3 w-3 text-amber-600" />,
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium',
        colorMap[decision],
      )}
    >
      {iconMap[decision]}
      {GATE_LABELS[gateType]}
    </div>
  );
}

/** Single action row */
function ActionRow({
  action,
  isPrimary,
}: {
  action: NextBestAction;
  isPrimary: boolean;
}): React.ReactElement {
  const priorityColor: Record<ActionPriority, string> = {
    required: 'text-red-600',
    recommended: 'text-amber-600',
    optional: 'text-slate-500',
  };

  const priorityBg: Record<ActionPriority, string> = {
    required: 'bg-red-50 border-red-200',
    recommended: 'bg-amber-50 border-amber-200',
    optional: 'bg-slate-50 border-slate-200',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        isPrimary ? priorityBg[action.priority] : 'border-slate-200 bg-white',
      )}
    >
      <div className={cn('flex-shrink-0', priorityColor[action.priority])}>
        {action.blocker ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          CATEGORY_ICONS[action.category]
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 truncate">
            {action.title}
          </p>
          {action.blocker && (
            <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
              BLOCKER
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
          {action.description}
        </p>
      </div>

      <Link href={action.href}>
        <Button
          size="sm"
          className={cn(
            'flex-shrink-0',
            isPrimary
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
          )}
        >
          {action.cta_label}
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Completion progress bar                                                    */
/* -------------------------------------------------------------------------- */

function CompletionBar({
  percent,
}: {
  percent: number;
}): React.ReactElement {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-600">
          Overall Completion
        </span>
        <span className="text-xs font-semibold text-slate-900">
          {clampedPercent}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            clampedPercent >= 80
              ? 'bg-emerald-500'
              : clampedPercent >= 50
                ? 'bg-blue-500'
                : clampedPercent >= 25
                  ? 'bg-amber-500'
                  : 'bg-slate-400',
          )}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Phase stepper (mini timeline across the top)                               */
/* -------------------------------------------------------------------------- */

function PhaseStepper({
  currentPhase,
}: {
  currentPhase: ProjectStatus;
}): React.ReactElement {
  const currentIdx = PHASE_ORDER.indexOf(currentPhase);

  return (
    <div className="flex items-center gap-0.5">
      {PHASE_ORDER.map((phase, idx) => {
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;

        return (
          <React.Fragment key={phase}>
            <div className="flex flex-col items-center" title={PHASE_LABELS[phase]}>
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  isComplete && 'bg-emerald-500',
                  isCurrent && 'bg-amber-500',
                  isFuture && 'bg-slate-200',
                )}
              />
              <span
                className={cn(
                  'text-[9px] mt-1 whitespace-nowrap',
                  isComplete && 'text-emerald-700 font-medium',
                  isCurrent && 'text-amber-700 font-semibold',
                  isFuture && 'text-slate-400',
                )}
              >
                {PHASE_LABELS[phase]}
              </span>
            </div>
            {idx < PHASE_ORDER.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px min-w-3',
                  idx < currentIdx ? 'bg-emerald-300' : 'bg-slate-200',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export interface ProjectStatusHeaderProps {
  projectId: string;
  summary?: ProjectStatusSummary;
}

export function ProjectStatusHeader({
  projectId,
  summary,
}: ProjectStatusHeaderProps): React.ReactElement {
  const data = useMemo<ProjectStatusSummary>(
    () => summary ?? buildDemoSummary(projectId),
    [summary, projectId],
  );

  const primaryAction = data.next_actions.find(
    (a) => !a.completed,
  );
  const secondaryActions = data.next_actions
    .filter((a) => !a.completed && a !== primaryAction)
    .slice(0, 3);

  // Sort gates into the canonical order
  const sortedGates = useMemo(() => {
    const gateMap = new Map(
      data.governance_gates.map((g) => [g.gate_type, g.decision]),
    );
    return GATE_ORDER.map((gt) => ({
      gate_type: gt,
      decision: gateMap.get(gt) ?? ('pending' as GovernanceGateDecision),
    }));
  }, [data.governance_gates]);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        {/* ── Top row: phase badge + stats ──────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              Project Status
            </CardTitle>
            <PhaseBadge phase={data.current_phase} />
          </div>

          <div className="flex items-center gap-4 text-sm">
            {/* Completion */}
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-slate-900">
                {data.completion_percent}%
              </span>
              <span className="text-slate-500">complete</span>
            </div>

            {/* Blockers */}
            <div
              className={cn(
                'flex items-center gap-1.5',
                data.blockers > 0 ? 'text-red-600' : 'text-slate-500',
              )}
            >
              {data.blockers > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
              <span className="font-semibold">
                {data.blockers}
              </span>
              <span className={data.blockers > 0 ? 'text-red-600' : 'text-slate-500'}>
                {data.blockers === 1 ? 'blocker' : 'blockers'}
              </span>
            </div>

            {/* Security posture */}
            {data.security_posture.critical_failures > 0 && (
              <div className="flex items-center gap-1.5 text-red-600">
                <ShieldAlert className="h-4 w-4" />
                <span className="font-semibold">
                  {data.security_posture.critical_failures}
                </span>
                <span>critical</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Progress bar ──────────────────────────────────────────────── */}
        <CompletionBar percent={data.completion_percent} />

        {/* ── Phase stepper ─────────────────────────────────────────────── */}
        <PhaseStepper currentPhase={data.current_phase} />

        {/* ── Primary CTA ───────────────────────────────────────────────── */}
        {primaryAction && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Next Required Action
            </p>
            <ActionRow action={primaryAction} isPrimary />
          </div>
        )}

        {/* ── Secondary actions (collapsed) ─────────────────────────────── */}
        {secondaryActions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Up Next
            </p>
            <div className="space-y-2">
              {secondaryActions.map((action) => (
                <ActionRow key={action.id} action={action} isPrimary={false} />
              ))}
            </div>
          </div>
        )}

        {/* ── Governance gates ──────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Governance Gates
          </p>
          <div className="flex flex-wrap gap-2">
            {sortedGates.map((gate) => (
              <GateStatusPill
                key={gate.gate_type}
                gateType={gate.gate_type}
                decision={gate.decision}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
