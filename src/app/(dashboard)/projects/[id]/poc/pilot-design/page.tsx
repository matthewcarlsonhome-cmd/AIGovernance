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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  FlaskConical,
  Target,
  Users,
  CheckCircle2,
  BarChart3,
  ShieldAlert,
  OctagonX,
  ArrowUpRight,
  CircleDot,
  CircleCheck,
  CircleX,
  Clock,
} from 'lucide-react';
import type {
  PilotDesign,
  PilotType,
  PilotObjective,
  ParticipantCriterion,
  SuccessCriterion,
  PilotMetric,
  GoNoGoGate,
  PilotRisk,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const PILOT_TYPES: { value: PilotType; label: string; description: string; duration: string; participants: string }[] = [
  {
    value: 'poc',
    label: 'Proof of Concept',
    description: 'Validate technical feasibility in a controlled environment with synthetic data.',
    duration: '2-4 weeks',
    participants: '2-3 engineers',
  },
  {
    value: 'pov',
    label: 'Proof of Value',
    description: 'Demonstrate measurable business value on a real but limited scope project.',
    duration: '4-6 weeks',
    participants: '5-8 team members',
  },
  {
    value: 'limited_pilot',
    label: 'Limited Pilot',
    description: 'Run a controlled deployment across a single team or business unit.',
    duration: '6-12 weeks',
    participants: '1-2 teams (10-20)',
  },
  {
    value: 'full_pilot',
    label: 'Full Pilot',
    description: 'Organization-wide rollout with full monitoring, support, and governance.',
    duration: '3-6 months',
    participants: 'Multiple teams (50+)',
  },
];

const DEMO_OBJECTIVES: PilotObjective[] = [
  { category: 'technical', description: 'Validate AI code generation accuracy against internal coding standards', priority: 'must_have' },
  { category: 'business', description: 'Demonstrate at least 30% reduction in boilerplate code writing time', priority: 'must_have' },
  { category: 'user', description: 'Achieve developer satisfaction score of 4.0/5.0 or higher', priority: 'should_have' },
  { category: 'operational', description: 'Verify integration with existing CI/CD pipeline without disruption', priority: 'must_have' },
  { category: 'strategic', description: 'Establish a replicable onboarding playbook for future teams', priority: 'nice_to_have' },
];

const DEMO_PARTICIPANTS: ParticipantCriterion[] = [
  { criterion: 'Technical Proficiency', weight: 30, ideal_profile: 'Mid-to-senior engineers with 3+ years in the primary language' },
  { criterion: 'Domain Knowledge', weight: 25, ideal_profile: 'Team members who understand the business domain deeply' },
  { criterion: 'Openness to Change', weight: 20, ideal_profile: 'Volunteers who have expressed interest in AI tooling' },
  { criterion: 'Role Diversity', weight: 15, ideal_profile: 'Mix of backend, frontend, and full-stack developers' },
  { criterion: 'Availability', weight: 10, ideal_profile: 'Not on critical-path deadlines during pilot window' },
];

const DEMO_SUCCESS: SuccessCriterion[] = [
  { criteria: 'Code generation acceptance rate > 60%', type: 'must_have', threshold: '60%', status: 'met', evidence: 'Measured at 72% over 3-week window' },
  { criteria: 'No P1/P2 security vulnerabilities introduced', type: 'must_have', threshold: '0 P1/P2 findings', status: 'met', evidence: 'SAST scan clean across all AI-generated PRs' },
  { criteria: 'Developer satisfaction >= 4.0/5.0', type: 'should_have', threshold: '4.0/5.0', status: 'partial', evidence: 'Survey at 3.8/5.0 - improving trend' },
  { criteria: 'Cycle time reduction >= 20%', type: 'must_have', threshold: '20% reduction', status: 'met', evidence: 'Cycle time dropped from 4.2d to 3.1d (26% reduction)' },
  { criteria: 'Test coverage maintained or improved', type: 'could_have', threshold: '>= baseline 78%', status: 'met', evidence: 'Coverage at 82%, up from 78% baseline' },
];

const DEMO_METRICS: PilotMetric[] = [
  { metric: 'Code Acceptance Rate', baseline: '0% (no AI)', target: '60%', actual: '72%', method: 'PR merge analytics' },
  { metric: 'Average Cycle Time', baseline: '4.2 days', target: '3.4 days', actual: '3.1 days', method: 'Jira workflow timestamps' },
  { metric: 'Defect Escape Rate', baseline: '12 per sprint', target: '<= 12', actual: '9', method: 'QA defect tracker' },
  { metric: 'Lines of Code per Day', baseline: '120 LoC', target: '160 LoC', actual: '185 LoC', method: 'Git analytics (excluding tests)' },
  { metric: 'Developer NPS', baseline: 'N/A', target: '40+', actual: '38', method: 'Bi-weekly anonymous survey' },
];

const DEMO_GONOGO: GoNoGoGate[] = [
  { criteria: 'Security review passed', threshold: 'No critical findings', status: 'pass', evidence: 'SAST/DAST clean; manual review complete' },
  { criteria: 'Performance baseline met', threshold: 'P95 latency <= 200ms', status: 'pass', evidence: 'P95 at 142ms in load testing' },
  { criteria: 'Data handling compliant', threshold: 'No PII/PHI leakage', status: 'pass', evidence: 'DLP monitoring confirmed zero incidents' },
  { criteria: 'Team satisfaction threshold', threshold: '>= 3.5/5.0', status: 'pass', evidence: 'Survey result: 3.8/5.0' },
  { criteria: 'Cost within budget', threshold: '<= $15K/month', status: 'pending', evidence: 'Awaiting final billing cycle reconciliation' },
  { criteria: 'Executive sponsor approval', threshold: 'Written sign-off', status: 'pending', evidence: 'Meeting scheduled for next week' },
];

const DEMO_RISKS: PilotRisk[] = [
  { risk: 'AI-generated code introduces subtle logic errors', likelihood: 'medium', impact: 'high', mitigation: 'Mandatory code review for all AI-generated PRs', contingency: 'Revert to manual coding; flag patterns in training data' },
  { risk: 'Developer over-reliance reduces code comprehension', likelihood: 'medium', impact: 'medium', mitigation: 'Require developers to annotate AI suggestions before accepting', contingency: 'Implement mandatory understanding checks in PR template' },
  { risk: 'Sensitive data leaked to external AI provider', likelihood: 'low', impact: 'critical', mitigation: 'Sandboxed environment with DLP; no production data in pilot', contingency: 'Immediate kill switch; incident response per IRP' },
  { risk: 'License costs exceed projected budget', likelihood: 'low', impact: 'medium', mitigation: 'Usage caps per developer; weekly spend monitoring', contingency: 'Reduce participant count; negotiate enterprise discount' },
  { risk: 'CI/CD pipeline instability from AI tooling integration', likelihood: 'low', impact: 'high', mitigation: 'Feature-flagged integration; isolated build runners', contingency: 'Disable AI integration; rollback to previous pipeline config' },
];

const DEMO_KILL_SWITCH: string[] = [
  'Any confirmed data breach or PII/PHI exposure via the AI tool',
  'Critical security vulnerability (CVSS >= 9.0) traced to AI-generated code',
  'Sustained developer satisfaction drop below 2.5/5.0 for two consecutive surveys',
  'Monthly cost exceeds 200% of projected budget for two billing cycles',
  'AI provider SLA breach with > 8 hours cumulative downtime in a sprint',
];

const SCALE_OPTIONS: { value: NonNullable<PilotDesign['scale_recommendation']>; label: string; description: string }[] = [
  { value: 'full_scale', label: 'Full Scale Rollout', description: 'Deploy across the entire organization immediately' },
  { value: 'phased', label: 'Phased Expansion', description: 'Expand team-by-team over 2-3 quarters' },
  { value: 'extended', label: 'Extended Pilot', description: 'Continue pilot with expanded scope before deciding' },
  { value: 'pivot', label: 'Pivot Approach', description: 'Modify tool selection or use-case focus based on findings' },
  { value: 'discontinue', label: 'Discontinue', description: 'Insufficient evidence to proceed; revisit in 6 months' },
];

const DEMO_PILOT: PilotDesign = {
  id: 'pilot-001',
  project_id: 'proj-001',
  pilot_type: 'limited_pilot',
  objectives: DEMO_OBJECTIVES,
  participant_criteria: DEMO_PARTICIPANTS,
  success_criteria: DEMO_SUCCESS,
  quantitative_metrics: DEMO_METRICS,
  go_nogo_gates: DEMO_GONOGO,
  risk_register: DEMO_RISKS,
  kill_switch_criteria: DEMO_KILL_SWITCH,
  scale_recommendation: 'phased',
  created_at: '2025-11-01T00:00:00Z',
  updated_at: '2025-12-15T00:00:00Z',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function priorityColor(priority: PilotObjective['priority']): string {
  switch (priority) {
    case 'must_have':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'should_have':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'nice_to_have':
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function priorityLabel(priority: PilotObjective['priority']): string {
  switch (priority) {
    case 'must_have':
      return 'Must Have';
    case 'should_have':
      return 'Should Have';
    case 'nice_to_have':
      return 'Nice to Have';
  }
}

function categoryLabel(category: PilotObjective['category']): string {
  switch (category) {
    case 'technical':
      return 'Technical';
    case 'business':
      return 'Business';
    case 'user':
      return 'User';
    case 'operational':
      return 'Operational';
    case 'strategic':
      return 'Strategic';
  }
}

function successTypeColor(type: SuccessCriterion['type']): string {
  switch (type) {
    case 'must_have':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'should_have':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'could_have':
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function successStatusIcon(status: SuccessCriterion['status']): React.ReactElement {
  switch (status) {
    case 'met':
      return <CircleCheck className="h-4 w-4 text-emerald-600" />;
    case 'not_met':
      return <CircleX className="h-4 w-4 text-red-600" />;
    case 'partial':
      return <Clock className="h-4 w-4 text-amber-600" />;
    case 'not_measured':
      return <CircleDot className="h-4 w-4 text-slate-400" />;
  }
}

function successStatusLabel(status: SuccessCriterion['status']): string {
  switch (status) {
    case 'met':
      return 'Met';
    case 'not_met':
      return 'Not Met';
    case 'partial':
      return 'Partial';
    case 'not_measured':
      return 'Not Measured';
  }
}

function goNoGoIcon(status: GoNoGoGate['status']): React.ReactElement {
  switch (status) {
    case 'pass':
      return <CircleCheck className="h-5 w-5 text-emerald-600" />;
    case 'fail':
      return <CircleX className="h-5 w-5 text-red-600" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-amber-500" />;
  }
}

function riskTierColor(tier: string): string {
  switch (tier) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function PilotDesignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: _projectId } = React.use(params);

  const [selectedPilotType, setSelectedPilotType] = React.useState<PilotType>(DEMO_PILOT.pilot_type);
  const [scaleRecommendation, setScaleRecommendation] = React.useState<PilotDesign['scale_recommendation']>(DEMO_PILOT.scale_recommendation);
  const [goNoGoStates, setGoNoGoStates] = React.useState<GoNoGoGate[]>(DEMO_PILOT.go_nogo_gates);

  const toggleGoNoGo = (idx: number) => {
    setGoNoGoStates((prev) => {
      const next = [...prev];
      const current = next[idx].status;
      const order: GoNoGoGate['status'][] = ['pending', 'pass', 'fail'];
      const nextStatus = order[(order.indexOf(current) + 1) % order.length];
      next[idx] = { ...next[idx], status: nextStatus };
      return next;
    });
  };

  const passCount = goNoGoStates.filter((g) => g.status === 'pass').length;
  const failCount = goNoGoStates.filter((g) => g.status === 'fail').length;
  const pendingCount = goNoGoStates.filter((g) => g.status === 'pending').length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pilot Program Designer
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Design and configure your AI pilot program with objectives, success criteria, risk assessment, and go/no-go gates.
        </p>
      </div>

      <Separator />

      {/* ---- Pilot Type Selector ---- */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-violet-600" />
          Pilot Type
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILOT_TYPES.map((pt) => (
            <button
              key={pt.value}
              onClick={() => setSelectedPilotType(pt.value)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                selectedPilotType === pt.value
                  ? 'border-violet-600 bg-violet-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
              )}
            >
              <h3 className={cn(
                'text-sm font-semibold',
                selectedPilotType === pt.value ? 'text-violet-700' : 'text-slate-900',
              )}>
                {pt.label}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{pt.description}</p>
              <div className="mt-3 flex gap-3 text-[11px]">
                <span className="text-slate-500">
                  <span className="font-medium text-slate-700">{pt.duration}</span>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">
                  <span className="font-medium text-slate-700">{pt.participants}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ---- Objectives ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Target className="h-5 w-5 text-blue-600" />
            Objectives
          </CardTitle>
          <CardDescription className="text-slate-500">
            Define what the pilot needs to accomplish across key dimensions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_OBJECTIVES.map((obj, idx) => (
                  <tr key={idx} className={cn('border-b border-slate-100', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {categoryLabel(obj.category)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{obj.description}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={cn('text-xs', priorityColor(obj.priority))}>
                        {priorityLabel(obj.priority)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Participant Selection Criteria ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="h-5 w-5 text-teal-600" />
            Participant Selection Criteria
          </CardTitle>
          <CardDescription className="text-slate-500">
            Criteria for selecting pilot participants, weighted by importance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Criterion</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-20">Weight</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ideal Profile</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_PARTICIPANTS.map((pc, idx) => (
                  <tr key={idx} className={cn('border-b border-slate-100', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                    <td className="py-3 px-4 font-medium text-slate-900">{pc.criterion}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal-500"
                            style={{ width: `${pc.weight}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 w-8">{pc.weight}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{pc.ideal_profile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Success Criteria ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Success Criteria
          </CardTitle>
          <CardDescription className="text-slate-500">
            Measurable outcomes that determine pilot success.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Criteria</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Type</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">Threshold</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_SUCCESS.map((sc, idx) => (
                  <tr key={idx} className={cn('border-b border-slate-100', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                    <td className="py-3 px-4 font-medium text-slate-900">{sc.criteria}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={cn('text-xs', successTypeColor(sc.type))}>
                        {sc.type === 'must_have' ? 'Must' : sc.type === 'should_have' ? 'Should' : 'Could'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">{sc.threshold}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {successStatusIcon(sc.status)}
                        <span className="text-xs text-slate-700">{successStatusLabel(sc.status)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{sc.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Quantitative Metrics ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Quantitative Metrics
          </CardTitle>
          <CardDescription className="text-slate-500">
            Baseline vs. target vs. actual measurements for the pilot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Metric</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Baseline</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Target</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actual</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Measurement Method</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_METRICS.map((m, idx) => (
                  <tr key={idx} className={cn('border-b border-slate-100', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                    <td className="py-3 px-4 font-medium text-slate-900">{m.metric}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{m.baseline}</td>
                    <td className="py-3 px-4 text-blue-700 font-mono text-xs font-semibold">{m.target}</td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold">
                      <span className={m.actual ? 'text-emerald-700' : 'text-slate-400'}>
                        {m.actual ?? 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{m.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Go/No-Go Decision Matrix ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <CircleDot className="h-5 w-5 text-violet-600" />
                Go / No-Go Decision Matrix
              </CardTitle>
              <CardDescription className="text-slate-500">
                Click each gate to toggle status between pending, pass, and fail.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-700">
                <CircleCheck className="h-4 w-4" /> {passCount} Pass
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <CircleX className="h-4 w-4" /> {failCount} Fail
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="h-4 w-4" /> {pendingCount} Pending
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {goNoGoStates.map((gate, idx) => (
              <button
                key={idx}
                onClick={() => toggleGoNoGo(idx)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left',
                  gate.status === 'pass'
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : gate.status === 'fail'
                    ? 'border-red-200 bg-red-50/50'
                    : 'border-slate-200 bg-slate-50/50',
                )}
              >
                {goNoGoIcon(gate.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{gate.criteria}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Threshold: {gate.threshold}</p>
                </div>
                <div className="text-xs text-slate-500 max-w-xs text-right hidden sm:block">
                  {gate.evidence}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---- Risk Register ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <ShieldAlert className="h-5 w-5 text-orange-600" />
            Risk Register
          </CardTitle>
          <CardDescription className="text-slate-500">
            Identified risks with likelihood, impact, mitigation strategies, and contingency plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Risk</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Likelihood</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Impact</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mitigation</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Contingency</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_RISKS.map((r, idx) => (
                  <tr key={idx} className={cn('border-b border-slate-100', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                    <td className="py-3 px-4 font-medium text-slate-900">{r.risk}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={cn('text-xs capitalize', riskTierColor(r.likelihood))}>
                        {r.likelihood}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={cn('text-xs capitalize', riskTierColor(r.impact))}>
                        {r.impact}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{r.mitigation}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{r.contingency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Kill Switch Criteria ---- */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <OctagonX className="h-5 w-5 text-red-600" />
            Kill Switch Criteria
          </CardTitle>
          <CardDescription className="text-slate-500">
            Conditions that trigger an immediate halt to the pilot program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {DEMO_KILL_SWITCH.map((ks, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-100">
                <OctagonX className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">{ks}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* ---- Scale Recommendation ---- */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5 text-emerald-600" />
          Scale Recommendation
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setScaleRecommendation(opt.value)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                scaleRecommendation === opt.value
                  ? 'border-emerald-600 bg-emerald-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
              )}
            >
              <div className="flex items-center gap-2">
                {scaleRecommendation === opt.value && (
                  <CircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <h3 className={cn(
                  'text-sm font-semibold',
                  scaleRecommendation === opt.value ? 'text-emerald-700' : 'text-slate-900',
                )}>
                  {opt.label}
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{opt.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ---- Footer Action ---- */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
          Export as PDF
        </Button>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          Save Pilot Design
        </Button>
      </div>
    </div>
  );
}
