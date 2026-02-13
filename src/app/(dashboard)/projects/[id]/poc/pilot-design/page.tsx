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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Plus,
  Pencil,
  Trash2,
  Download,
  Save,
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
  RiskTier,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'govai_pilot_design';

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

const SCALE_OPTIONS: { value: NonNullable<PilotDesign['scale_recommendation']>; label: string; description: string }[] = [
  { value: 'full_scale', label: 'Full Scale Rollout', description: 'Deploy across the entire organization immediately' },
  { value: 'phased', label: 'Phased Expansion', description: 'Expand team-by-team over 2-3 quarters' },
  { value: 'extended', label: 'Extended Pilot', description: 'Continue pilot with expanded scope before deciding' },
  { value: 'pivot', label: 'Pivot Approach', description: 'Modify tool selection or use-case focus based on findings' },
  { value: 'discontinue', label: 'Discontinue', description: 'Insufficient evidence to proceed; revisit in 6 months' },
];

const DEFAULT_OBJECTIVES_BY_TYPE: Record<PilotType, PilotObjective[]> = {
  poc: [
    { category: 'technical', description: 'Validate AI code generation accuracy in a sandboxed environment', priority: 'must_have' },
    { category: 'technical', description: 'Confirm tool integrates with existing IDE and version control', priority: 'must_have' },
  ],
  pov: [
    { category: 'business', description: 'Demonstrate measurable time savings on real project tasks', priority: 'must_have' },
    { category: 'user', description: 'Achieve developer satisfaction score of 3.5/5.0 or higher', priority: 'should_have' },
  ],
  limited_pilot: [
    { category: 'operational', description: 'Verify CI/CD pipeline integration without disruption', priority: 'must_have' },
    { category: 'business', description: 'Demonstrate at least 20% reduction in boilerplate code writing time', priority: 'must_have' },
    { category: 'user', description: 'Achieve developer satisfaction score of 4.0/5.0 or higher', priority: 'should_have' },
  ],
  full_pilot: [
    { category: 'strategic', description: 'Establish a replicable onboarding playbook for all teams', priority: 'must_have' },
    { category: 'business', description: 'Demonstrate at least 30% productivity improvement across teams', priority: 'must_have' },
    { category: 'operational', description: 'Full governance and compliance integration', priority: 'must_have' },
    { category: 'user', description: 'Achieve organization-wide developer satisfaction score of 4.0/5.0', priority: 'should_have' },
  ],
};

const DEFAULT_SUCCESS_BY_TYPE: Record<PilotType, SuccessCriterion[]> = {
  poc: [
    { criteria: 'Code generation produces compilable output > 80%', type: 'must_have', threshold: '80%', status: 'not_measured', evidence: '' },
    { criteria: 'No security vulnerabilities introduced', type: 'must_have', threshold: '0 findings', status: 'not_measured', evidence: '' },
  ],
  pov: [
    { criteria: 'Code generation acceptance rate > 60%', type: 'must_have', threshold: '60%', status: 'not_measured', evidence: '' },
    { criteria: 'Developer satisfaction >= 3.5/5.0', type: 'should_have', threshold: '3.5/5.0', status: 'not_measured', evidence: '' },
  ],
  limited_pilot: [
    { criteria: 'Code generation acceptance rate > 60%', type: 'must_have', threshold: '60%', status: 'not_measured', evidence: '' },
    { criteria: 'No P1/P2 security vulnerabilities introduced', type: 'must_have', threshold: '0 P1/P2 findings', status: 'not_measured', evidence: '' },
    { criteria: 'Cycle time reduction >= 20%', type: 'must_have', threshold: '20% reduction', status: 'not_measured', evidence: '' },
  ],
  full_pilot: [
    { criteria: 'Code generation acceptance rate > 70%', type: 'must_have', threshold: '70%', status: 'not_measured', evidence: '' },
    { criteria: 'No P1/P2 security vulnerabilities introduced', type: 'must_have', threshold: '0 P1/P2 findings', status: 'not_measured', evidence: '' },
    { criteria: 'Cycle time reduction >= 25%', type: 'must_have', threshold: '25% reduction', status: 'not_measured', evidence: '' },
    { criteria: 'Test coverage maintained or improved', type: 'could_have', threshold: '>= baseline', status: 'not_measured', evidence: '' },
  ],
};

const DEFAULT_GONOGO: GoNoGoGate[] = [
  { criteria: 'Security review passed', threshold: 'No critical findings', status: 'pending', evidence: '' },
  { criteria: 'Performance baseline met', threshold: 'P95 latency <= 200ms', status: 'pending', evidence: '' },
  { criteria: 'Data handling compliant', threshold: 'No PII/PHI leakage', status: 'pending', evidence: '' },
  { criteria: 'Team satisfaction threshold', threshold: '>= 3.5/5.0', status: 'pending', evidence: '' },
  { criteria: 'Cost within budget', threshold: '<= projected budget', status: 'pending', evidence: '' },
];

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

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function PilotDesignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: projectId } = React.use(params);

  // ---- Core State ----
  const [hasDesign, setHasDesign] = React.useState(false);
  const [pilotType, setPilotType] = React.useState<PilotType>('limited_pilot');
  const [objectives, setObjectives] = React.useState<PilotObjective[]>([]);
  const [participants, setParticipants] = React.useState<ParticipantCriterion[]>([]);
  const [successCriteria, setSuccessCriteria] = React.useState<SuccessCriterion[]>([]);
  const [metrics, setMetrics] = React.useState<PilotMetric[]>([]);
  const [goNoGoGates, setGoNoGoGates] = React.useState<GoNoGoGate[]>([]);
  const [risks, setRisks] = React.useState<PilotRisk[]>([]);
  const [killSwitch, setKillSwitch] = React.useState<string[]>([]);
  const [scaleRecommendation, setScaleRecommendation] = React.useState<PilotDesign['scale_recommendation']>(null);

  // ---- Dialog State ----
  const [objectiveDialogOpen, setObjectiveDialogOpen] = React.useState(false);
  const [editingObjectiveIdx, setEditingObjectiveIdx] = React.useState<number | null>(null);
  const [objForm, setObjForm] = React.useState<PilotObjective>({ category: 'technical', description: '', priority: 'must_have' });

  const [riskDialogOpen, setRiskDialogOpen] = React.useState(false);
  const [editingRiskIdx, setEditingRiskIdx] = React.useState<number | null>(null);
  const [riskForm, setRiskForm] = React.useState<PilotRisk>({ risk: '', likelihood: 'medium', impact: 'medium', mitigation: '', contingency: '' });

  const [killSwitchDialogOpen, setKillSwitchDialogOpen] = React.useState(false);
  const [newKillSwitch, setNewKillSwitch] = React.useState('');

  const [participantDialogOpen, setParticipantDialogOpen] = React.useState(false);
  const [editingParticipantIdx, setEditingParticipantIdx] = React.useState<number | null>(null);
  const [participantForm, setParticipantForm] = React.useState<ParticipantCriterion>({ criterion: '', weight: 20, ideal_profile: '' });

  const [metricDialogOpen, setMetricDialogOpen] = React.useState(false);
  const [editingMetricIdx, setEditingMetricIdx] = React.useState<number | null>(null);
  const [metricForm, setMetricForm] = React.useState<PilotMetric>({ metric: '', baseline: '', target: '', actual: null, method: '' });

  // ---- Load from localStorage ----
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${projectId}`);
      if (stored) {
        const data = JSON.parse(stored) as PilotDesign;
        setHasDesign(true);
        setPilotType(data.pilot_type);
        setObjectives(data.objectives);
        setParticipants(data.participant_criteria);
        setSuccessCriteria(data.success_criteria);
        setMetrics(data.quantitative_metrics);
        setGoNoGoGates(data.go_nogo_gates);
        setRisks(data.risk_register);
        setKillSwitch(data.kill_switch_criteria);
        setScaleRecommendation(data.scale_recommendation);
      }
    } catch {
      // ignore parse errors
    }
  }, [projectId]);

  // ---- Create Pilot Design ----
  const handleCreateDesign = (type: PilotType): void => {
    setPilotType(type);
    setObjectives(DEFAULT_OBJECTIVES_BY_TYPE[type]);
    setSuccessCriteria(DEFAULT_SUCCESS_BY_TYPE[type]);
    setGoNoGoGates([...DEFAULT_GONOGO]);
    setParticipants([]);
    setMetrics([]);
    setRisks([]);
    setKillSwitch([]);
    setScaleRecommendation(null);
    setHasDesign(true);
  };

  // ---- Pilot Type Change ----
  const handlePilotTypeChange = (type: PilotType): void => {
    setPilotType(type);
    // Reset defaults for the new type
    setObjectives(DEFAULT_OBJECTIVES_BY_TYPE[type]);
    setSuccessCriteria(DEFAULT_SUCCESS_BY_TYPE[type]);
    setGoNoGoGates([...DEFAULT_GONOGO]);
  };

  // ---- Save ----
  const handleSave = (): void => {
    const data: PilotDesign = {
      id: generateId(),
      project_id: projectId,
      pilot_type: pilotType,
      objectives,
      participant_criteria: participants,
      success_criteria: successCriteria,
      quantitative_metrics: metrics,
      go_nogo_gates: goNoGoGates,
      risk_register: risks,
      kill_switch_criteria: killSwitch,
      scale_recommendation: scaleRecommendation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(`${STORAGE_KEY}_${projectId}`, JSON.stringify(data));
    alert('Pilot design saved successfully.');
  };

  // ---- Export ----
  const handleExport = (): void => {
    const data: PilotDesign = {
      id: generateId(),
      project_id: projectId,
      pilot_type: pilotType,
      objectives,
      participant_criteria: participants,
      success_criteria: successCriteria,
      quantitative_metrics: metrics,
      go_nogo_gates: goNoGoGates,
      risk_register: risks,
      kill_switch_criteria: killSwitch,
      scale_recommendation: scaleRecommendation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pilot-design-${projectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Objective CRUD ----
  const openAddObjective = (): void => {
    setEditingObjectiveIdx(null);
    setObjForm({ category: 'technical', description: '', priority: 'must_have' });
    setObjectiveDialogOpen(true);
  };

  const openEditObjective = (idx: number): void => {
    setEditingObjectiveIdx(idx);
    setObjForm({ ...objectives[idx] });
    setObjectiveDialogOpen(true);
  };

  const saveObjective = (): void => {
    if (!objForm.description.trim()) return;
    if (editingObjectiveIdx !== null) {
      setObjectives((prev) => prev.map((o, i) => (i === editingObjectiveIdx ? { ...objForm } : o)));
    } else {
      setObjectives((prev) => [...prev, { ...objForm }]);
    }
    setObjectiveDialogOpen(false);
  };

  const deleteObjective = (idx: number): void => {
    setObjectives((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Success Criteria Status Toggle ----
  const cycleSuccessStatus = (idx: number): void => {
    const statuses: SuccessCriterion['status'][] = ['not_measured', 'met', 'not_met', 'partial'];
    setSuccessCriteria((prev) =>
      prev.map((sc, i) => {
        if (i !== idx) return sc;
        const nextStatus = statuses[(statuses.indexOf(sc.status) + 1) % statuses.length];
        return { ...sc, status: nextStatus };
      }),
    );
  };

  // ---- Go/No-Go Toggle ----
  const toggleGoNoGo = (idx: number): void => {
    setGoNoGoGates((prev) => {
      const next = [...prev];
      const order: GoNoGoGate['status'][] = ['pending', 'pass', 'fail'];
      const nextStatus = order[(order.indexOf(next[idx].status) + 1) % order.length];
      next[idx] = { ...next[idx], status: nextStatus };
      return next;
    });
  };

  // ---- Risk CRUD ----
  const openAddRisk = (): void => {
    setEditingRiskIdx(null);
    setRiskForm({ risk: '', likelihood: 'medium', impact: 'medium', mitigation: '', contingency: '' });
    setRiskDialogOpen(true);
  };

  const openEditRisk = (idx: number): void => {
    setEditingRiskIdx(idx);
    setRiskForm({ ...risks[idx] });
    setRiskDialogOpen(true);
  };

  const saveRisk = (): void => {
    if (!riskForm.risk.trim()) return;
    if (editingRiskIdx !== null) {
      setRisks((prev) => prev.map((r, i) => (i === editingRiskIdx ? { ...riskForm } : r)));
    } else {
      setRisks((prev) => [...prev, { ...riskForm }]);
    }
    setRiskDialogOpen(false);
  };

  const deleteRisk = (idx: number): void => {
    setRisks((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Kill Switch CRUD ----
  const addKillSwitch = (): void => {
    if (!newKillSwitch.trim()) return;
    setKillSwitch((prev) => [...prev, newKillSwitch.trim()]);
    setNewKillSwitch('');
    setKillSwitchDialogOpen(false);
  };

  const deleteKillSwitch = (idx: number): void => {
    setKillSwitch((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Participant Criteria CRUD ----
  const openAddParticipant = (): void => {
    setEditingParticipantIdx(null);
    setParticipantForm({ criterion: '', weight: 20, ideal_profile: '' });
    setParticipantDialogOpen(true);
  };

  const openEditParticipant = (idx: number): void => {
    setEditingParticipantIdx(idx);
    setParticipantForm({ ...participants[idx] });
    setParticipantDialogOpen(true);
  };

  const saveParticipant = (): void => {
    if (!participantForm.criterion.trim()) return;
    if (editingParticipantIdx !== null) {
      setParticipants((prev) => prev.map((p, i) => (i === editingParticipantIdx ? { ...participantForm } : p)));
    } else {
      setParticipants((prev) => [...prev, { ...participantForm }]);
    }
    setParticipantDialogOpen(false);
  };

  const deleteParticipant = (idx: number): void => {
    setParticipants((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Quantitative Metrics CRUD ----
  const openAddMetric = (): void => {
    setEditingMetricIdx(null);
    setMetricForm({ metric: '', baseline: '', target: '', actual: null, method: '' });
    setMetricDialogOpen(true);
  };

  const openEditMetric = (idx: number): void => {
    setEditingMetricIdx(idx);
    setMetricForm({ ...metrics[idx] });
    setMetricDialogOpen(true);
  };

  const saveMetric = (): void => {
    if (!metricForm.metric.trim()) return;
    if (editingMetricIdx !== null) {
      setMetrics((prev) => prev.map((m, i) => (i === editingMetricIdx ? { ...metricForm } : m)));
    } else {
      setMetrics((prev) => [...prev, { ...metricForm }]);
    }
    setMetricDialogOpen(false);
  };

  const deleteMetric = (idx: number): void => {
    setMetrics((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Go/No-Go Evidence Update ----
  const updateGateEvidence = (idx: number, evidence: string): void => {
    setGoNoGoGates((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, evidence } : g))
    );
  };

  // ---- Computed ----
  const passCount = goNoGoGates.filter((g) => g.status === 'pass').length;
  const failCount = goNoGoGates.filter((g) => g.status === 'fail').length;
  const pendingCount = goNoGoGates.filter((g) => g.status === 'pending').length;

  // ---- Empty State ----
  if (!hasDesign) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pilot Program Designer
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Design and configure your AI pilot program with objectives, success criteria, risk assessment, and go/no-go gates.
          </p>
        </div>
        <Separator />
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FlaskConical className="h-12 w-12 text-slate-300 mb-4" />
            <h2 className="text-lg font-semibold text-slate-700 mb-2">No Pilot Design Yet</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md">
              Select a pilot type below to create your pilot program design with pre-configured objectives and success criteria.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-4xl">
              {PILOT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => handleCreateDesign(pt.value)}
                  className="rounded-xl border-2 border-slate-200 bg-white hover:border-violet-400 hover:shadow-md p-4 text-left transition-all"
                >
                  <h3 className="text-sm font-semibold text-slate-900">{pt.label}</h3>
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
          </CardContent>
        </Card>
      </div>
    );
  }

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
              onClick={() => handlePilotTypeChange(pt.value)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                pilotType === pt.value
                  ? 'border-violet-600 bg-violet-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
              )}
            >
              <h3 className={cn(
                'text-sm font-semibold',
                pilotType === pt.value ? 'text-violet-700' : 'text-slate-900',
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
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Target className="h-5 w-5 text-blue-600" />
                Objectives
              </CardTitle>
              <CardDescription className="text-slate-500">
                Define what the pilot needs to accomplish across key dimensions.
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={openAddObjective}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Objective
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {objectives.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Target className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No objectives defined yet. Click &quot;Add Objective&quot; to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {objectives.map((obj, idx) => (
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditObjective(idx)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteObjective(idx)}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Participant Selection Criteria ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Users className="h-5 w-5 text-teal-600" />
                Participant Selection Criteria
              </CardTitle>
              <CardDescription className="text-slate-500">
                Criteria for selecting pilot participants, weighted by importance.
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={openAddParticipant}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Criterion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No participant criteria defined yet. Click &quot;Add Criterion&quot; to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Criterion</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">Weight</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ideal Profile</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((pc, idx) => (
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditParticipant(idx)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteParticipant(idx)}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            Measurable outcomes that determine pilot success. Click a status to cycle through: Not Measured, Met, Not Met, Partial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successCriteria.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No success criteria defined yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Criteria</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Type</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">Threshold</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-36">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {successCriteria.map((sc, idx) => (
                    <tr key={idx} className={cn('border-b border-slate-100', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                      <td className="py-3 px-4 font-medium text-slate-900">{sc.criteria}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={cn('text-xs', successTypeColor(sc.type))}>
                          {sc.type === 'must_have' ? 'Must' : sc.type === 'should_have' ? 'Should' : 'Could'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-mono">{sc.threshold}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => cycleSuccessStatus(idx)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                          title="Click to cycle status"
                        >
                          {successStatusIcon(sc.status)}
                          <span className="text-xs text-slate-700">{successStatusLabel(sc.status)}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{sc.evidence || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Quantitative Metrics ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Quantitative Metrics
              </CardTitle>
              <CardDescription className="text-slate-500">
                Baseline vs. target vs. actual measurements for the pilot.
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={openAddMetric}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Metric
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No quantitative metrics defined yet. Click &quot;Add Metric&quot; to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Metric</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Baseline</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Target</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actual</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Method</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m, idx) => (
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditMetric(idx)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMetric(idx)}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          {goNoGoGates.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CircleDot className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No go/no-go gates defined.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goNoGoGates.map((gate, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex flex-col gap-3 p-4 rounded-lg border transition-all',
                    gate.status === 'pass'
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : gate.status === 'fail'
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-slate-200 bg-slate-50/50',
                  )}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleGoNoGo(idx)}
                      className="shrink-0 hover:scale-110 transition-transform"
                      title="Click to toggle status"
                    >
                      {goNoGoIcon(gate.status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{gate.criteria}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Threshold: {gate.threshold}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs capitalize shrink-0',
                        gate.status === 'pass' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        gate.status === 'fail' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      )}
                    >
                      {gate.status}
                    </Badge>
                  </div>
                  <div className="ml-9">
                    <Input
                      value={gate.evidence}
                      onChange={(e) => updateGateEvidence(idx, e.target.value)}
                      placeholder="Add evidence (e.g., link to report, test results, sign-off date)..."
                      className="text-xs border-slate-200 bg-white/70 h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Risk Register ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <ShieldAlert className="h-5 w-5 text-orange-600" />
                Risk Register
              </CardTitle>
              <CardDescription className="text-slate-500">
                Identified risks with likelihood, impact, mitigation strategies, and contingency plans.
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={openAddRisk}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Risk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No risks identified yet. Click &quot;Add Risk&quot; to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Risk</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Likelihood</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Impact</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mitigation</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Contingency</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {risks.map((r, idx) => (
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditRisk(idx)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRisk(idx)}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Kill Switch Criteria ---- */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <OctagonX className="h-5 w-5 text-red-600" />
                Kill Switch Criteria
              </CardTitle>
              <CardDescription className="text-slate-500">
                Conditions that trigger an immediate halt to the pilot program.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => setKillSwitchDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Condition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {killSwitch.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <OctagonX className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No kill switch conditions defined yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {killSwitch.map((ks, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-100">
                  <OctagonX className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 flex-1">{ks}</span>
                  <button
                    onClick={() => deleteKillSwitch(idx)}
                    className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
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
        <Button
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-100"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export PDF
        </Button>
        <Button
          className="bg-slate-900 text-white hover:bg-slate-800"
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-1.5" />
          Save Pilot Design
        </Button>
      </div>

      {/* ---- Objective Dialog ---- */}
      <Dialog open={objectiveDialogOpen} onOpenChange={setObjectiveDialogOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingObjectiveIdx !== null ? 'Edit Objective' : 'Add Objective'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a pilot objective with category, description, and priority.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-700">Category</Label>
              <select
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                value={objForm.category}
                onChange={(e) => setObjForm({ ...objForm, category: e.target.value as PilotObjective['category'] })}
              >
                <option value="technical">Technical</option>
                <option value="business">Business</option>
                <option value="user">User</option>
                <option value="operational">Operational</option>
                <option value="strategic">Strategic</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Description</Label>
              <Textarea
                value={objForm.description}
                onChange={(e) => setObjForm({ ...objForm, description: e.target.value })}
                placeholder="Describe the objective..."
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Priority</Label>
              <select
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                value={objForm.priority}
                onChange={(e) => setObjForm({ ...objForm, priority: e.target.value as PilotObjective['priority'] })}
              >
                <option value="must_have">Must Have</option>
                <option value="should_have">Should Have</option>
                <option value="nice_to_have">Nice to Have</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-700" onClick={() => setObjectiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={saveObjective}>
              {editingObjectiveIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Risk Dialog ---- */}
      <Dialog open={riskDialogOpen} onOpenChange={setRiskDialogOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingRiskIdx !== null ? 'Edit Risk' : 'Add Risk'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a risk with likelihood, impact, mitigation, and contingency.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-700">Risk Description</Label>
              <Textarea
                value={riskForm.risk}
                onChange={(e) => setRiskForm({ ...riskForm, risk: e.target.value })}
                placeholder="Describe the risk..."
                className="border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Likelihood</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                  value={riskForm.likelihood}
                  onChange={(e) => setRiskForm({ ...riskForm, likelihood: e.target.value as RiskTier })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Impact</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                  value={riskForm.impact}
                  onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value as RiskTier })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Mitigation Strategy</Label>
              <Textarea
                value={riskForm.mitigation}
                onChange={(e) => setRiskForm({ ...riskForm, mitigation: e.target.value })}
                placeholder="How will this risk be mitigated?"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Contingency Plan</Label>
              <Textarea
                value={riskForm.contingency}
                onChange={(e) => setRiskForm({ ...riskForm, contingency: e.target.value })}
                placeholder="What is the fallback if mitigation fails?"
                className="border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-700" onClick={() => setRiskDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={saveRisk}>
              {editingRiskIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Kill Switch Dialog ---- */}
      <Dialog open={killSwitchDialogOpen} onOpenChange={setKillSwitchDialogOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Add Kill Switch Condition</DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a condition that would trigger an immediate halt to the pilot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-700">Condition</Label>
              <Textarea
                value={newKillSwitch}
                onChange={(e) => setNewKillSwitch(e.target.value)}
                placeholder="e.g., Any confirmed data breach or PII/PHI exposure via the AI tool"
                className="border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-700" onClick={() => setKillSwitchDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={addKillSwitch}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Participant Criteria Dialog ---- */}
      <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingParticipantIdx !== null ? 'Edit Criterion' : 'Add Participant Criterion'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define criteria for selecting pilot participants.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-700">Criterion Name *</Label>
              <Input
                value={participantForm.criterion}
                onChange={(e) => setParticipantForm({ ...participantForm, criterion: e.target.value })}
                placeholder="e.g., Technical Proficiency"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Weight (%)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={participantForm.weight}
                  onChange={(e) => setParticipantForm({ ...participantForm, weight: Number(e.target.value) })}
                  className="flex-1 h-2 accent-teal-600"
                />
                <Input
                  type="number"
                  min={5}
                  max={100}
                  value={participantForm.weight}
                  onChange={(e) => setParticipantForm({ ...participantForm, weight: Math.min(100, Math.max(5, Number(e.target.value))) })}
                  className="w-20 text-center border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Ideal Profile</Label>
              <Textarea
                value={participantForm.ideal_profile}
                onChange={(e) => setParticipantForm({ ...participantForm, ideal_profile: e.target.value })}
                placeholder="e.g., 3+ years with TypeScript, familiar with CI/CD"
                className="border-slate-200"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-700" onClick={() => setParticipantDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={saveParticipant} disabled={!participantForm.criterion.trim()}>
              {editingParticipantIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Quantitative Metric Dialog ---- */}
      <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingMetricIdx !== null ? 'Edit Metric' : 'Add Quantitative Metric'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a measurable metric with baseline and target values.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-700">Metric Name *</Label>
              <Input
                value={metricForm.metric}
                onChange={(e) => setMetricForm({ ...metricForm, metric: e.target.value })}
                placeholder="e.g., Sprint Velocity"
                className="border-slate-200"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-700">Baseline</Label>
                <Input
                  value={metricForm.baseline}
                  onChange={(e) => setMetricForm({ ...metricForm, baseline: e.target.value })}
                  placeholder="e.g., 21 pts"
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Target</Label>
                <Input
                  value={metricForm.target}
                  onChange={(e) => setMetricForm({ ...metricForm, target: e.target.value })}
                  placeholder="e.g., 30 pts"
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Actual</Label>
                <Input
                  value={metricForm.actual ?? ''}
                  onChange={(e) => setMetricForm({ ...metricForm, actual: e.target.value || null })}
                  placeholder="Pending"
                  className="border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Measurement Method</Label>
              <Input
                value={metricForm.method}
                onChange={(e) => setMetricForm({ ...metricForm, method: e.target.value })}
                placeholder="e.g., JIRA story points per sprint"
                className="border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-700" onClick={() => setMetricDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={saveMetric} disabled={!metricForm.metric.trim()}>
              {editingMetricIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
