'use client';

import { useState, useCallback } from 'react';
import * as React from 'react';
import {
  Repeat,
  Users,
  Megaphone,
  GraduationCap,
  ShieldAlert,
  BarChart3,
  Edit2,
  FileDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import type {
  ChangeReadinessFactor,
  StakeholderGroup,
  CommunicationChannel,
  TrainingModule,
  ResistanceRisk,
  AdoptionMetric,
} from '@/types';

// ---------- Helpers ----------

const influenceImpactColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const positionColors: Record<StakeholderGroup['current_position'], string> = {
  champion: 'bg-emerald-100 text-emerald-800',
  advocate: 'bg-green-100 text-green-800',
  supporter: 'bg-blue-100 text-blue-800',
  neutral: 'bg-slate-100 text-slate-700',
  skeptic: 'bg-orange-100 text-orange-800',
  resistant: 'bg-red-100 text-red-800',
};

const intensityColors: Record<ResistanceRisk['intensity'], string> = {
  passive: 'bg-blue-100 text-blue-800 border-blue-200',
  skeptical: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-orange-100 text-orange-800 border-orange-200',
  aggressive: 'bg-red-100 text-red-800 border-red-200',
};

const categoryColors: Record<
  AdoptionMetric['category'],
  { bg: string; border: string; icon: string; text: string }
> = {
  awareness: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
  },
  adoption: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    text: 'text-emerald-800',
  },
  sustainability: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    text: 'text-purple-800',
  },
};

const categoryLabels: Record<AdoptionMetric['category'], string> = {
  awareness: 'Awareness',
  adoption: 'Adoption',
  sustainability: 'Sustainability',
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 60) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

// ---------- Default form values ----------

const emptyFactor: ChangeReadinessFactor = {
  factor: '',
  score: 50,
  weight: 0.2,
  notes: '',
};

const emptyStakeholder: StakeholderGroup = {
  group: '',
  influence: 'medium',
  impact: 'medium',
  current_position: 'neutral',
  target_position: 'supporter',
  strategy: '',
};

const emptyChannel: CommunicationChannel = {
  audience: '',
  message_theme: '',
  channel: '',
  frequency: '',
  owner: '',
};

const emptyModule: TrainingModule = {
  module: '',
  audience: '',
  format: '',
  duration: '',
  prerequisites: '',
};

const emptyRisk: ResistanceRisk = {
  type: '',
  indicators: '',
  root_cause: '',
  response_strategy: '',
  intensity: 'passive',
};

const emptyMetric: AdoptionMetric = {
  category: 'awareness',
  metric: '',
  target: '',
  measurement_method: '',
};

// ---------- Page Component ----------

export default function ChangeManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  void resolvedParams;

  // Plan existence
  const [planExists, setPlanExists] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('readiness');

  // Data state
  const [readinessFactors, setReadinessFactors] = useState<
    ChangeReadinessFactor[]
  >([]);
  const [stakeholderGroups, setStakeholderGroups] = useState<
    StakeholderGroup[]
  >([]);
  const [communicationChannels, setCommunicationChannels] = useState<
    CommunicationChannel[]
  >([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [resistanceRisks, setResistanceRisks] = useState<ResistanceRisk[]>([]);
  const [adoptionMetrics, setAdoptionMetrics] = useState<AdoptionMetric[]>([]);

  // Edit Plan dialog
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [useManualScore, setUseManualScore] = useState(false);
  const [manualScore, setManualScore] = useState(0);

  // Factor dialog
  const [factorDialogOpen, setFactorDialogOpen] = useState(false);
  const [editingFactorIdx, setEditingFactorIdx] = useState<number | null>(
    null,
  );
  const [factorForm, setFactorForm] =
    useState<ChangeReadinessFactor>(emptyFactor);

  // Stakeholder dialog
  const [stakeholderDialogOpen, setStakeholderDialogOpen] = useState(false);
  const [editingStakeholderIdx, setEditingStakeholderIdx] = useState<
    number | null
  >(null);
  const [stakeholderForm, setStakeholderForm] =
    useState<StakeholderGroup>(emptyStakeholder);

  // Communication dialog
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [editingChannelIdx, setEditingChannelIdx] = useState<number | null>(
    null,
  );
  const [channelForm, setChannelForm] =
    useState<CommunicationChannel>(emptyChannel);

  // Training dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModuleIdx, setEditingModuleIdx] = useState<number | null>(
    null,
  );
  const [moduleForm, setModuleForm] = useState<TrainingModule>(emptyModule);

  // Resistance dialog
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [editingRiskIdx, setEditingRiskIdx] = useState<number | null>(null);
  const [riskForm, setRiskForm] = useState<ResistanceRisk>(emptyRisk);

  // Metric dialog
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [editingMetricIdx, setEditingMetricIdx] = useState<number | null>(
    null,
  );
  const [metricForm, setMetricForm] = useState<AdoptionMetric>(emptyMetric);

  // ---------- Computed readiness score ----------
  const autoReadinessScore = React.useMemo(() => {
    if (readinessFactors.length === 0) return 0;
    const totalWeight = readinessFactors.reduce((a, f) => a + f.weight, 0);
    if (totalWeight === 0) return 0;
    return Math.round(
      readinessFactors.reduce((a, f) => a + f.score * f.weight, 0) /
        totalWeight,
    );
  }, [readinessFactors]);

  const readinessScore = useManualScore ? manualScore : autoReadinessScore;

  // SVG gauge calculations
  const gaugeRadius = 70;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset =
    gaugeCircumference - (readinessScore / 100) * gaugeCircumference;

  const tabs = [
    { id: 'readiness', label: 'Readiness', icon: BarChart3 },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'communications', label: 'Communications', icon: Megaphone },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'resistance', label: 'Resistance', icon: ShieldAlert },
    { id: 'metrics', label: 'Metrics', icon: TrendingUp },
  ];

  // ---------- Factor CRUD ----------
  const openFactorDialog = useCallback(
    (idx: number | null) => {
      setEditingFactorIdx(idx);
      setFactorForm(
        idx !== null ? { ...readinessFactors[idx] } : { ...emptyFactor },
      );
      setFactorDialogOpen(true);
    },
    [readinessFactors],
  );

  const saveFactor = useCallback(() => {
    if (!factorForm.factor.trim()) return;
    setReadinessFactors((prev) => {
      if (editingFactorIdx !== null) {
        const updated = [...prev];
        updated[editingFactorIdx] = { ...factorForm };
        return updated;
      }
      return [...prev, { ...factorForm }];
    });
    setFactorDialogOpen(false);
  }, [factorForm, editingFactorIdx]);

  const deleteFactor = useCallback((idx: number) => {
    setReadinessFactors((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ---------- Stakeholder CRUD ----------
  const openStakeholderDialog = useCallback(
    (idx: number | null) => {
      setEditingStakeholderIdx(idx);
      setStakeholderForm(
        idx !== null ? { ...stakeholderGroups[idx] } : { ...emptyStakeholder },
      );
      setStakeholderDialogOpen(true);
    },
    [stakeholderGroups],
  );

  const saveStakeholder = useCallback(() => {
    if (!stakeholderForm.group.trim()) return;
    setStakeholderGroups((prev) => {
      if (editingStakeholderIdx !== null) {
        const updated = [...prev];
        updated[editingStakeholderIdx] = { ...stakeholderForm };
        return updated;
      }
      return [...prev, { ...stakeholderForm }];
    });
    setStakeholderDialogOpen(false);
  }, [stakeholderForm, editingStakeholderIdx]);

  const deleteStakeholder = useCallback((idx: number) => {
    setStakeholderGroups((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ---------- Channel CRUD ----------
  const openChannelDialog = useCallback(
    (idx: number | null) => {
      setEditingChannelIdx(idx);
      setChannelForm(
        idx !== null
          ? { ...communicationChannels[idx] }
          : { ...emptyChannel },
      );
      setChannelDialogOpen(true);
    },
    [communicationChannels],
  );

  const saveChannel = useCallback(() => {
    if (!channelForm.audience.trim()) return;
    setCommunicationChannels((prev) => {
      if (editingChannelIdx !== null) {
        const updated = [...prev];
        updated[editingChannelIdx] = { ...channelForm };
        return updated;
      }
      return [...prev, { ...channelForm }];
    });
    setChannelDialogOpen(false);
  }, [channelForm, editingChannelIdx]);

  const deleteChannel = useCallback((idx: number) => {
    setCommunicationChannels((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ---------- Module CRUD ----------
  const openModuleDialog = useCallback(
    (idx: number | null) => {
      setEditingModuleIdx(idx);
      setModuleForm(
        idx !== null ? { ...trainingModules[idx] } : { ...emptyModule },
      );
      setModuleDialogOpen(true);
    },
    [trainingModules],
  );

  const saveModule = useCallback(() => {
    if (!moduleForm.module.trim()) return;
    setTrainingModules((prev) => {
      if (editingModuleIdx !== null) {
        const updated = [...prev];
        updated[editingModuleIdx] = { ...moduleForm };
        return updated;
      }
      return [...prev, { ...moduleForm }];
    });
    setModuleDialogOpen(false);
  }, [moduleForm, editingModuleIdx]);

  const deleteModule = useCallback((idx: number) => {
    setTrainingModules((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ---------- Risk CRUD ----------
  const openRiskDialog = useCallback(
    (idx: number | null) => {
      setEditingRiskIdx(idx);
      setRiskForm(
        idx !== null ? { ...resistanceRisks[idx] } : { ...emptyRisk },
      );
      setRiskDialogOpen(true);
    },
    [resistanceRisks],
  );

  const saveRisk = useCallback(() => {
    if (!riskForm.type.trim()) return;
    setResistanceRisks((prev) => {
      if (editingRiskIdx !== null) {
        const updated = [...prev];
        updated[editingRiskIdx] = { ...riskForm };
        return updated;
      }
      return [...prev, { ...riskForm }];
    });
    setRiskDialogOpen(false);
  }, [riskForm, editingRiskIdx]);

  const deleteRisk = useCallback((idx: number) => {
    setResistanceRisks((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ---------- Metric CRUD ----------
  const openMetricDialog = useCallback(
    (idx: number | null) => {
      setEditingMetricIdx(idx);
      setMetricForm(
        idx !== null ? { ...adoptionMetrics[idx] } : { ...emptyMetric },
      );
      setMetricDialogOpen(true);
    },
    [adoptionMetrics],
  );

  const saveMetric = useCallback(() => {
    if (!metricForm.metric.trim()) return;
    setAdoptionMetrics((prev) => {
      if (editingMetricIdx !== null) {
        const updated = [...prev];
        updated[editingMetricIdx] = { ...metricForm };
        return updated;
      }
      return [...prev, { ...metricForm }];
    });
    setMetricDialogOpen(false);
  }, [metricForm, editingMetricIdx]);

  const deleteMetric = useCallback((idx: number) => {
    setAdoptionMetrics((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ---------- Export handler ----------
  const handleExport = useCallback(() => {
    const plan = {
      readiness_score: readinessScore,
      readiness_factors: readinessFactors,
      stakeholder_groups: stakeholderGroups,
      communication_channels: communicationChannels,
      training_modules: trainingModules,
      resistance_risks: resistanceRisks,
      adoption_metrics: adoptionMetrics,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(plan, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'change-management-plan.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [
    readinessScore,
    readinessFactors,
    stakeholderGroups,
    communicationChannels,
    trainingModules,
    resistanceRisks,
    adoptionMetrics,
  ]);

  // ---------- Edit Plan handler ----------
  const openEditPlan = useCallback(() => {
    setManualScore(readinessScore);
    setEditPlanOpen(true);
  }, [readinessScore]);

  const saveEditPlan = useCallback(() => {
    setEditPlanOpen(false);
  }, []);

  // ---------- Empty state ----------
  if (!planExists) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Repeat className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">
          No Change Management Plan
        </h2>
        <p className="text-slate-500 mb-6 text-center max-w-md">
          Create a change management plan to track organizational readiness,
          stakeholder engagement, training programs, and adoption metrics for AI
          coding tool rollout.
        </p>
        <Button
          onClick={() => setPlanExists(true)}
          className="bg-teal-600 text-white hover:bg-teal-700 gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Change Management Plan
        </Button>
      </div>
    );
  }

  // ---------- Main render ----------
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Repeat className="h-6 w-6 text-teal-600" />
            Change Management Planner
          </h1>
          <p className="text-slate-500 mt-1">
            Plan, track, and execute organizational change for AI coding tool
            adoption
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={openEditPlan}
          >
            <Edit2 className="h-4 w-4" />
            Edit Plan
          </Button>
          <Button
            className="bg-teal-600 text-white hover:bg-teal-700 gap-2"
            onClick={handleExport}
          >
            <FileDown className="h-4 w-4" />
            Export Plan
          </Button>
        </div>
      </div>

      {/* Summary Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-teal-600">
              {readinessScore}
            </p>
            <p className="text-xs text-slate-500 mt-1">Readiness Score</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-teal-500 h-1.5 rounded-full transition-all"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-900">
              {stakeholderGroups.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Stakeholder Groups</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              {
                stakeholderGroups.filter(
                  (s) =>
                    s.current_position === 'champion' ||
                    s.current_position === 'advocate',
                ).length
              }{' '}
              aligned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-900">
              {trainingModules.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Training Modules</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              {trainingModules.reduce((acc, m) => {
                const hours = parseInt(m.duration, 10);
                return acc + (isNaN(hours) ? 0 : hours);
              }, 0)}
              h total duration
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {resistanceRisks.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Resistance Risks</p>
            <p className="text-xs text-orange-600 mt-1 font-medium">
              {
                resistanceRisks.filter(
                  (r) =>
                    r.intensity === 'active' || r.intensity === 'aggressive',
                ).length
              }{' '}
              active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==================== Readiness Assessment ==================== */}
      {activeTab === 'readiness' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Gauge */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                  Overall Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pb-6">
                <div className="relative w-48 h-48">
                  <svg
                    className="w-48 h-48 -rotate-90"
                    viewBox="0 0 160 160"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r={gaugeRadius}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={gaugeRadius}
                      fill="none"
                      className={getScoreRingColor(readinessScore)}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={gaugeOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-4xl font-bold ${getScoreColor(readinessScore)}`}
                    >
                      {readinessScore}
                    </span>
                    <span className="text-sm text-slate-500">out of 100</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Badge
                    className={`${
                      readinessScore >= 80
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : readinessScore >= 60
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    {readinessScore >= 80
                      ? 'Ready to Proceed'
                      : readinessScore >= 60
                        ? 'Conditionally Ready'
                        : 'Not Ready'}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-2">
                    {useManualScore
                      ? 'Manual override'
                      : `Auto-calculated from ${readinessFactors.length} factor(s)`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Factor Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Readiness Factor Breakdown
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => openFactorDialog(null)}
                  >
                    <Plus className="h-3 w-3" />
                    Add Factor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {readinessFactors.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No readiness factors added yet.</p>
                    <p className="text-xs mt-1">
                      Click &quot;Add Factor&quot; to define readiness criteria.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="py-3 px-3 font-medium text-slate-700">
                            Factor
                          </th>
                          <th className="py-3 px-3 font-medium text-slate-700 w-20 text-center">
                            Score
                          </th>
                          <th className="py-3 px-3 font-medium text-slate-700 w-20 text-center">
                            Weight
                          </th>
                          <th className="py-3 px-3 font-medium text-slate-700 w-36">
                            Progress
                          </th>
                          <th className="py-3 px-3 font-medium text-slate-700">
                            Notes
                          </th>
                          <th className="py-3 px-3 font-medium text-slate-700 w-20 text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {readinessFactors.map(
                          (factor: ChangeReadinessFactor, idx: number) => (
                            <tr
                              key={idx}
                              className="border-b border-slate-100 hover:bg-slate-50"
                            >
                              <td className="py-3 px-3 font-medium text-slate-900">
                                {factor.factor}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`font-bold ${getScoreColor(factor.score)}`}
                                >
                                  {factor.score}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center text-slate-500">
                                {Math.round(factor.weight * 100)}%
                              </td>
                              <td className="py-3 px-3">
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${getScoreBarColor(factor.score)}`}
                                    style={{ width: `${factor.score}%` }}
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-3 text-slate-600 text-xs max-w-[250px] truncate">
                                {factor.notes}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => openFactorDialog(idx)}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                                    title="Edit factor"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteFactor(idx)}
                                    className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                                    title="Delete factor"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ==================== Stakeholder Map ==================== */}
      {activeTab === 'stakeholders' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Stakeholder Map
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => openStakeholderDialog(null)}
              >
                <Plus className="h-3 w-3" />
                Add Group
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stakeholderGroups.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No stakeholder groups defined yet.</p>
                <p className="text-xs mt-1">
                  Click &quot;Add Group&quot; to map your stakeholders.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 px-3 font-medium text-slate-700">
                        Group
                      </th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">
                        Influence
                      </th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">
                        Impact
                      </th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">
                        Current Position
                      </th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">
                        Target Position
                      </th>
                      <th className="py-3 px-3 font-medium text-slate-700">
                        Engagement Strategy
                      </th>
                      <th className="py-3 px-3 font-medium text-slate-700 w-20 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stakeholderGroups.map(
                      (group: StakeholderGroup, idx: number) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-3 font-medium text-slate-900">
                            {group.group}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              className={influenceImpactColors[group.influence]}
                            >
                              {group.influence}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              className={influenceImpactColors[group.impact]}
                            >
                              {group.impact}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              className={
                                positionColors[group.current_position]
                              }
                            >
                              {group.current_position.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <Badge
                                className={
                                  positionColors[group.target_position]
                                }
                              >
                                {group.target_position.replace('_', ' ')}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 text-xs max-w-[300px] truncate">
                            {group.strategy}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openStakeholderDialog(idx)}
                                className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                                title="Edit group"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteStakeholder(idx)}
                                className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                                title="Delete group"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==================== Communication Plan ==================== */}
      {activeTab === 'communications' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-amber-600" />
                Communication Plan
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => openChannelDialog(null)}
              >
                <Plus className="h-3 w-3" />
                Add Channel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {communicationChannels.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Megaphone className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No communication channels defined yet.</p>
                <p className="text-xs mt-1">
                  Click &quot;Add Channel&quot; to plan your communications.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className="py-3 px-3 font-medium text-slate-700">
                          Audience
                        </th>
                        <th className="py-3 px-3 font-medium text-slate-700">
                          Message Theme
                        </th>
                        <th className="py-3 px-3 font-medium text-slate-700">
                          Channel
                        </th>
                        <th className="py-3 px-3 font-medium text-slate-700">
                          Frequency
                        </th>
                        <th className="py-3 px-3 font-medium text-slate-700">
                          Owner
                        </th>
                        <th className="py-3 px-3 font-medium text-slate-700 w-20 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {communicationChannels.map(
                        (channel: CommunicationChannel, idx: number) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="py-3 px-3 font-medium text-slate-900">
                              {channel.audience}
                            </td>
                            <td className="py-3 px-3 text-slate-700">
                              {channel.message_theme}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {channel.channel}
                            </td>
                            <td className="py-3 px-3">
                              <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                                {channel.frequency}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {channel.owner}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openChannelDialog(idx)}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                                  title="Edit channel"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteChannel(idx)}
                                  className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                                  title="Delete channel"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Communication Tips */}
                <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Communication Best Practice
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Begin change communication at least 2 weeks before any
                        tooling rollout. Frame messages around &quot;why&quot;
                        before &quot;what&quot; and &quot;how.&quot; Ensure
                        two-way feedback channels are open for each audience
                        segment.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==================== Training Program ==================== */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Training Program
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => openModuleDialog(null)}
            >
              <Plus className="h-3 w-3" />
              Add Module
            </Button>
          </div>
          {trainingModules.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No training modules defined yet.</p>
              <p className="text-xs mt-1">
                Click &quot;Add Module&quot; to build your training program.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingModules.map((mod: TrainingModule, idx: number) => (
                <Card key={idx} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{mod.module}</CardTitle>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => openModuleDialog(idx)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                          title="Edit module"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteModule(idx)}
                          className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                          title="Delete module"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Target Audience
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {mod.audience}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Format
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {mod.format}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Duration
                      </p>
                      <p className="text-sm font-semibold text-blue-700 mt-1">
                        {mod.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Prerequisites
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {mod.prerequisites}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== Resistance Risk Management ==================== */}
      {activeTab === 'resistance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-orange-600" />
              Resistance Risk Management
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => openRiskDialog(null)}
            >
              <Plus className="h-3 w-3" />
              Add Risk
            </Button>
          </div>
          {resistanceRisks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No resistance risks identified yet.</p>
              <p className="text-xs mt-1">
                Click &quot;Add Risk&quot; to document potential resistance
                areas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resistanceRisks.map((risk: ResistanceRisk, idx: number) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        {risk.type}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={intensityColors[risk.intensity]}>
                          {risk.intensity.charAt(0).toUpperCase() +
                            risk.intensity.slice(1)}{' '}
                          Resistance
                        </Badge>
                        <button
                          onClick={() => openRiskDialog(idx)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                          title="Edit risk"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteRisk(idx)}
                          className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                          title="Delete risk"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-slate-50">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                          Indicators
                        </p>
                        <p className="text-sm text-slate-700">
                          {risk.indicators}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-50">
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
                          Root Cause
                        </p>
                        <p className="text-sm text-slate-700">
                          {risk.root_cause}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50">
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">
                          Response Strategy
                        </p>
                        <p className="text-sm text-slate-700">
                          {risk.response_strategy}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== Adoption Metrics Dashboard ==================== */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Adoption Metrics Dashboard
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => openMetricDialog(null)}
            >
              <Plus className="h-3 w-3" />
              Add Metric
            </Button>
          </div>

          {adoptionMetrics.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No adoption metrics defined yet.</p>
              <p className="text-xs mt-1">
                Click &quot;Add Metric&quot; to track adoption progress.
              </p>
            </div>
          ) : (
            (['awareness', 'adoption', 'sustainability'] as const).map(
              (category) => {
                const metrics = adoptionMetrics.filter(
                  (m: AdoptionMetric) => m.category === category,
                );
                if (metrics.length === 0) return null;
                const colors = categoryColors[category];
                return (
                  <div key={category}>
                    <h3
                      className={`text-sm font-semibold uppercase tracking-wide mb-3 ${colors.text}`}
                    >
                      {categoryLabels[category]}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {metrics.map((metric: AdoptionMetric, _mIdx: number) => {
                        const globalIdx = adoptionMetrics.indexOf(metric);
                        return (
                          <Card
                            key={globalIdx}
                            className={`${colors.bg} border ${colors.border}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-lg bg-white shadow-sm ${colors.icon}`}
                                >
                                  {category === 'awareness' && (
                                    <CheckCircle2 className="h-5 w-5" />
                                  )}
                                  {category === 'adoption' && (
                                    <TrendingUp className="h-5 w-5" />
                                  )}
                                  {category === 'sustainability' && (
                                    <Target className="h-5 w-5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <p className="text-sm font-semibold text-slate-900">
                                      {metric.metric}
                                    </p>
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                      <button
                                        onClick={() =>
                                          openMetricDialog(globalIdx)
                                        }
                                        className="p-1 rounded hover:bg-white/80 text-slate-500 hover:text-slate-700"
                                        title="Edit metric"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          deleteMetric(globalIdx)
                                        }
                                        className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                                        title="Delete metric"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2 p-2 rounded bg-white/70">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                      Target
                                    </p>
                                    <p className="text-sm text-slate-800 mt-0.5">
                                      {metric.target}
                                    </p>
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                      Measurement
                                    </p>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                      {metric.measurement_method}
                                    </p>
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
              },
            )
          )}
        </div>
      )}

      {/* ==================== DIALOGS ==================== */}

      {/* ---------- Edit Plan Dialog ---------- */}
      <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Plan Settings</DialogTitle>
            <DialogDescription className="text-slate-500">
              Configure the overall readiness score for your change management
              plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Auto-calculated Readiness Score
              </p>
              <p className="text-2xl font-bold text-teal-600 mt-1">
                {autoReadinessScore}
                <span className="text-sm font-normal text-slate-500">
                  {' '}
                  / 100
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Based on {readinessFactors.length} readiness factor(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useManualScore"
                checked={useManualScore}
                onChange={(e) => setUseManualScore(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="useManualScore">
                Override with manual score
              </Label>
            </div>
            {useManualScore && (
              <div className="space-y-2">
                <Label htmlFor="manualScore">Manual Readiness Score</Label>
                <Input
                  id="manualScore"
                  type="number"
                  min={0}
                  max={100}
                  value={manualScore}
                  onChange={(e) =>
                    setManualScore(
                      Math.min(100, Math.max(0, Number(e.target.value))),
                    )
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditPlanOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={saveEditPlan}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Factor Dialog ---------- */}
      <Dialog open={factorDialogOpen} onOpenChange={setFactorDialogOpen}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFactorIdx !== null
                ? 'Edit Readiness Factor'
                : 'Add Readiness Factor'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a readiness factor with its score and weight.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="factorName">Factor Name</Label>
              <Input
                id="factorName"
                placeholder="e.g. Leadership Sponsorship"
                value={factorForm.factor}
                onChange={(e) =>
                  setFactorForm({ ...factorForm, factor: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="factorScore">Score (0-100)</Label>
                <Input
                  id="factorScore"
                  type="number"
                  min={0}
                  max={100}
                  value={factorForm.score}
                  onChange={(e) =>
                    setFactorForm({
                      ...factorForm,
                      score: Math.min(
                        100,
                        Math.max(0, Number(e.target.value)),
                      ),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="factorWeight">Weight (0-1)</Label>
                <Input
                  id="factorWeight"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={factorForm.weight}
                  onChange={(e) =>
                    setFactorForm({
                      ...factorForm,
                      weight: Math.min(
                        1,
                        Math.max(0, Number(e.target.value)),
                      ),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="factorNotes">Notes</Label>
              <Textarea
                id="factorNotes"
                placeholder="Additional context about this factor..."
                rows={3}
                value={factorForm.notes}
                onChange={(e) =>
                  setFactorForm({ ...factorForm, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFactorDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={saveFactor}
            >
              {editingFactorIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Stakeholder Dialog ---------- */}
      <Dialog
        open={stakeholderDialogOpen}
        onOpenChange={setStakeholderDialogOpen}
      >
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStakeholderIdx !== null
                ? 'Edit Stakeholder Group'
                : 'Add Stakeholder Group'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Map a stakeholder group with influence, impact, and engagement
              strategy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="stakeholderGroup">Group Name</Label>
              <Input
                id="stakeholderGroup"
                placeholder="e.g. Engineering Team"
                value={stakeholderForm.group}
                onChange={(e) =>
                  setStakeholderForm({
                    ...stakeholderForm,
                    group: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stakeholderInfluence">Influence</Label>
                <Select
                  id="stakeholderInfluence"
                  value={stakeholderForm.influence}
                  onValueChange={(v) =>
                    setStakeholderForm({
                      ...stakeholderForm,
                      influence: v as 'high' | 'medium' | 'low',
                    })
                  }
                >
                  <SelectOption value="high">High</SelectOption>
                  <SelectOption value="medium">Medium</SelectOption>
                  <SelectOption value="low">Low</SelectOption>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stakeholderImpact">Impact</Label>
                <Select
                  id="stakeholderImpact"
                  value={stakeholderForm.impact}
                  onValueChange={(v) =>
                    setStakeholderForm({
                      ...stakeholderForm,
                      impact: v as 'high' | 'medium' | 'low',
                    })
                  }
                >
                  <SelectOption value="high">High</SelectOption>
                  <SelectOption value="medium">Medium</SelectOption>
                  <SelectOption value="low">Low</SelectOption>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stakeholderCurrent">Current Position</Label>
                <Select
                  id="stakeholderCurrent"
                  value={stakeholderForm.current_position}
                  onValueChange={(v) =>
                    setStakeholderForm({
                      ...stakeholderForm,
                      current_position: v as StakeholderGroup['current_position'],
                    })
                  }
                >
                  <SelectOption value="champion">Champion</SelectOption>
                  <SelectOption value="advocate">Advocate</SelectOption>
                  <SelectOption value="supporter">Supporter</SelectOption>
                  <SelectOption value="neutral">Neutral</SelectOption>
                  <SelectOption value="skeptic">Skeptic</SelectOption>
                  <SelectOption value="resistant">Resistant</SelectOption>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stakeholderTarget">Target Position</Label>
                <Select
                  id="stakeholderTarget"
                  value={stakeholderForm.target_position}
                  onValueChange={(v) =>
                    setStakeholderForm({
                      ...stakeholderForm,
                      target_position: v as StakeholderGroup['target_position'],
                    })
                  }
                >
                  <SelectOption value="champion">Champion</SelectOption>
                  <SelectOption value="advocate">Advocate</SelectOption>
                  <SelectOption value="supporter">Supporter</SelectOption>
                  <SelectOption value="neutral">Neutral</SelectOption>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stakeholderStrategy">Engagement Strategy</Label>
              <Textarea
                id="stakeholderStrategy"
                placeholder="How will you move this group from current to target position?"
                rows={3}
                value={stakeholderForm.strategy}
                onChange={(e) =>
                  setStakeholderForm({
                    ...stakeholderForm,
                    strategy: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStakeholderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={saveStakeholder}
            >
              {editingStakeholderIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Channel Dialog ---------- */}
      <Dialog open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingChannelIdx !== null
                ? 'Edit Communication Channel'
                : 'Add Communication Channel'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a communication channel for change management messaging.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="channelAudience">Audience</Label>
              <Input
                id="channelAudience"
                placeholder="e.g. All Employees"
                value={channelForm.audience}
                onChange={(e) =>
                  setChannelForm({ ...channelForm, audience: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channelTheme">Message Theme</Label>
              <Input
                id="channelTheme"
                placeholder="e.g. AI as Augmentation"
                value={channelForm.message_theme}
                onChange={(e) =>
                  setChannelForm({
                    ...channelForm,
                    message_theme: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channelName">Channel</Label>
              <Input
                id="channelName"
                placeholder="e.g. Slack #ai-tools + Sprint Demos"
                value={channelForm.channel}
                onChange={(e) =>
                  setChannelForm({ ...channelForm, channel: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channelFrequency">Frequency</Label>
                <Input
                  id="channelFrequency"
                  placeholder="e.g. Weekly"
                  value={channelForm.frequency}
                  onChange={(e) =>
                    setChannelForm({
                      ...channelForm,
                      frequency: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channelOwner">Owner</Label>
                <Input
                  id="channelOwner"
                  placeholder="e.g. VP Engineering"
                  value={channelForm.owner}
                  onChange={(e) =>
                    setChannelForm({ ...channelForm, owner: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChannelDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={saveChannel}
            >
              {editingChannelIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Module Dialog ---------- */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingModuleIdx !== null
                ? 'Edit Training Module'
                : 'Add Training Module'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a training module for the change management program.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="moduleName">Module Name</Label>
              <Input
                id="moduleName"
                placeholder="e.g. AI-Assisted Development Fundamentals"
                value={moduleForm.module}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, module: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleAudience">Target Audience</Label>
              <Input
                id="moduleAudience"
                placeholder="e.g. All Developers"
                value={moduleForm.audience}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, audience: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleFormat">Format</Label>
              <Input
                id="moduleFormat"
                placeholder="e.g. Instructor-led workshop + self-paced lab"
                value={moduleForm.format}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, format: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moduleDuration">Duration</Label>
                <Input
                  id="moduleDuration"
                  placeholder="e.g. 8 hours (2 half-days)"
                  value={moduleForm.duration}
                  onChange={(e) =>
                    setModuleForm({
                      ...moduleForm,
                      duration: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modulePrereqs">Prerequisites</Label>
                <Input
                  id="modulePrereqs"
                  placeholder="e.g. Basic CLI proficiency"
                  value={moduleForm.prerequisites}
                  onChange={(e) =>
                    setModuleForm({
                      ...moduleForm,
                      prerequisites: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModuleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={saveModule}
            >
              {editingModuleIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Risk Dialog ---------- */}
      <Dialog open={riskDialogOpen} onOpenChange={setRiskDialogOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRiskIdx !== null
                ? 'Edit Resistance Risk'
                : 'Add Resistance Risk'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Document a resistance risk with indicators, root cause, and
              response strategy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="riskType">Risk Type</Label>
                <Input
                  id="riskType"
                  placeholder="e.g. Skill Obsolescence Anxiety"
                  value={riskForm.type}
                  onChange={(e) =>
                    setRiskForm({ ...riskForm, type: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskIntensity">Intensity</Label>
                <Select
                  id="riskIntensity"
                  value={riskForm.intensity}
                  onValueChange={(v) =>
                    setRiskForm({
                      ...riskForm,
                      intensity: v as ResistanceRisk['intensity'],
                    })
                  }
                >
                  <SelectOption value="passive">Passive</SelectOption>
                  <SelectOption value="skeptical">Skeptical</SelectOption>
                  <SelectOption value="active">Active</SelectOption>
                  <SelectOption value="aggressive">Aggressive</SelectOption>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskIndicators">Indicators</Label>
              <Textarea
                id="riskIndicators"
                placeholder="Observable signs of this resistance..."
                rows={2}
                value={riskForm.indicators}
                onChange={(e) =>
                  setRiskForm({ ...riskForm, indicators: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskCause">Root Cause</Label>
              <Textarea
                id="riskCause"
                placeholder="Underlying reason for this resistance..."
                rows={2}
                value={riskForm.root_cause}
                onChange={(e) =>
                  setRiskForm({ ...riskForm, root_cause: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskStrategy">Response Strategy</Label>
              <Textarea
                id="riskStrategy"
                placeholder="How to address and mitigate this resistance..."
                rows={2}
                value={riskForm.response_strategy}
                onChange={(e) =>
                  setRiskForm({
                    ...riskForm,
                    response_strategy: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRiskDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={saveRisk}
            >
              {editingRiskIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Metric Dialog ---------- */}
      <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMetricIdx !== null
                ? 'Edit Adoption Metric'
                : 'Add Adoption Metric'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a metric to track change adoption progress.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="metricCategory">Category</Label>
              <Select
                id="metricCategory"
                value={metricForm.category}
                onValueChange={(v) =>
                  setMetricForm({
                    ...metricForm,
                    category: v as AdoptionMetric['category'],
                  })
                }
              >
                <SelectOption value="awareness">Awareness</SelectOption>
                <SelectOption value="adoption">Adoption</SelectOption>
                <SelectOption value="sustainability">
                  Sustainability
                </SelectOption>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metricName">Metric Name</Label>
              <Input
                id="metricName"
                placeholder="e.g. Active Daily Users"
                value={metricForm.metric}
                onChange={(e) =>
                  setMetricForm({ ...metricForm, metric: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metricTarget">Target</Label>
              <Input
                id="metricTarget"
                placeholder="e.g. 70% of developers using AI tools daily by month 3"
                value={metricForm.target}
                onChange={(e) =>
                  setMetricForm({ ...metricForm, target: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metricMethod">Measurement Method</Label>
              <Textarea
                id="metricMethod"
                placeholder="How will this metric be measured and tracked?"
                rows={2}
                value={metricForm.measurement_method}
                onChange={(e) =>
                  setMetricForm({
                    ...metricForm,
                    measurement_method: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMetricDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={saveMetric}
            >
              {editingMetricIdx !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
