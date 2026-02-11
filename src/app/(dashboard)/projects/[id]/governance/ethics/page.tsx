'use client';

import { useState, useCallback } from 'react';
import * as React from 'react';
import {
  Shield,
  Eye,
  Brain,
  Users,
  Edit2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Plus,
  Trash2,
  Download,
  FileText,
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type {
  EthicsReview,
  BiasAssessment,
  FairnessMetric,
  PrivacyImpactItem,
  RiskTier,
  ComplianceStatus,
  BiasType,
  FairnessMetricType,
} from '@/types';

// ---------- Helpers ----------

const tierColors: Record<RiskTier, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const complianceStatusColors: Record<ComplianceStatus, string> = {
  compliant: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  non_compliant: 'bg-red-100 text-red-800',
  needs_review: 'bg-blue-100 text-blue-800',
  not_applicable: 'bg-slate-100 text-slate-600',
};

const complianceStatusLabels: Record<ComplianceStatus, string> = {
  compliant: 'Compliant',
  partial: 'Partial',
  non_compliant: 'Non-Compliant',
  needs_review: 'Needs Review',
  not_applicable: 'N/A',
};

const biasTypeLabels: Record<BiasAssessment['type'], string> = {
  historical: 'Historical Bias',
  representation: 'Representation Bias',
  measurement: 'Measurement Bias',
  aggregation: 'Aggregation Bias',
  evaluation: 'Evaluation Bias',
};

const fairnessTypeLabels: Record<FairnessMetric['type'], string> = {
  demographic_parity: 'Demographic Parity',
  equalized_odds: 'Equalized Odds',
  predictive_parity: 'Predictive Parity',
  individual_fairness: 'Individual Fairness',
};

const transparencyConfig: Record<
  EthicsReview['transparency_level'],
  { label: string; color: string; description: string }
> = {
  black_box: {
    label: 'Black Box',
    color: 'bg-red-600 text-white',
    description:
      'No visibility into decision-making process. Outputs cannot be explained or audited.',
  },
  interpretable: {
    label: 'Interpretable',
    color: 'bg-yellow-500 text-white',
    description:
      'General reasoning can be understood. Key factors influencing outputs are identifiable.',
  },
  explainable: {
    label: 'Explainable',
    color: 'bg-green-600 text-white',
    description:
      'Full transparency into decision process. Every output can be traced and justified.',
  },
};

// ---------- Default form values ----------

const defaultBiasForm: BiasAssessment = {
  type: 'historical',
  risk_level: 'medium',
  evidence: '',
  mitigation: '',
};

const defaultFairnessForm: FairnessMetric = {
  type: 'demographic_parity',
  target: '',
  current: null,
  status: 'needs_review',
};

const defaultPrivacyForm: Omit<PrivacyImpactItem, 'id'> = {
  data_type: '',
  purpose: '',
  legal_basis: '',
  retention: '',
  access: '',
  risk_level: 'medium',
};

// ---------- Page Component ----------

export default function EthicsReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  void resolvedParams;

  // Main review state
  const [review, setReview] = useState<EthicsReview | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Dialog open states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [biasDialogOpen, setBiasDialogOpen] = useState(false);
  const [fairnessDialogOpen, setFairnessDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [oversightDialogOpen, setOversightDialogOpen] = useState(false);
  const [recommendationDialogOpen, setRecommendationDialogOpen] = useState(false);
  const [aiAlertOpen, setAiAlertOpen] = useState(false);

  // Editing index tracking (null = adding new, number = editing existing)
  const [editingBiasIndex, setEditingBiasIndex] = useState<number | null>(null);
  const [editingFairnessIndex, setEditingFairnessIndex] = useState<number | null>(null);
  const [editingPrivacyIndex, setEditingPrivacyIndex] = useState<number | null>(null);
  const [editingOversightIndex, setEditingOversightIndex] = useState<number | null>(null);
  const [editingRecommendationIndex, setEditingRecommendationIndex] = useState<number | null>(null);

  // Form states for create/edit review
  const [createForm, setCreateForm] = useState({
    system_name: '',
    system_purpose: '',
    risk_classification: 'medium' as RiskTier,
  });
  const [editForm, setEditForm] = useState({
    system_name: '',
    system_purpose: '',
    risk_classification: 'medium' as RiskTier,
    transparency_level: 'interpretable' as EthicsReview['transparency_level'],
  });

  // Form states for section items
  const [biasForm, setBiasForm] = useState<BiasAssessment>({ ...defaultBiasForm });
  const [fairnessForm, setFairnessForm] = useState<FairnessMetric>({ ...defaultFairnessForm });
  const [privacyForm, setPrivacyForm] = useState<Omit<PrivacyImpactItem, 'id'>>({ ...defaultPrivacyForm });
  const [oversightText, setOversightText] = useState('');
  const [recommendationText, setRecommendationText] = useState('');

  // ---------- Handlers ----------

  const handleCreateReview = useCallback(() => {
    const now = new Date().toISOString();
    const newReview: EthicsReview = {
      id: `eth-${Date.now()}`,
      project_id: resolvedParams.id,
      system_name: createForm.system_name,
      system_purpose: createForm.system_purpose,
      risk_classification: createForm.risk_classification,
      bias_assessments: [],
      fairness_metrics: [],
      privacy_items: [],
      transparency_level: 'interpretable',
      human_oversight_controls: [],
      recommendations: [],
      created_at: now,
      updated_at: now,
    };
    setReview(newReview);
    setCreateDialogOpen(false);
    setCreateForm({ system_name: '', system_purpose: '', risk_classification: 'medium' });
  }, [createForm, resolvedParams.id]);

  const openEditDialog = useCallback(() => {
    if (!review) return;
    setEditForm({
      system_name: review.system_name,
      system_purpose: review.system_purpose,
      risk_classification: review.risk_classification,
      transparency_level: review.transparency_level,
    });
    setEditDialogOpen(true);
  }, [review]);

  const handleEditReview = useCallback(() => {
    if (!review) return;
    setReview({
      ...review,
      system_name: editForm.system_name,
      system_purpose: editForm.system_purpose,
      risk_classification: editForm.risk_classification,
      transparency_level: editForm.transparency_level,
      updated_at: new Date().toISOString(),
    });
    setEditDialogOpen(false);
  }, [review, editForm]);

  // --- Bias ---
  const openAddBias = useCallback(() => {
    setEditingBiasIndex(null);
    setBiasForm({ ...defaultBiasForm });
    setBiasDialogOpen(true);
  }, []);

  const openEditBias = useCallback((index: number) => {
    if (!review) return;
    setEditingBiasIndex(index);
    setBiasForm({ ...review.bias_assessments[index] });
    setBiasDialogOpen(true);
  }, [review]);

  const handleSaveBias = useCallback(() => {
    if (!review) return;
    const updated = [...review.bias_assessments];
    if (editingBiasIndex !== null) {
      updated[editingBiasIndex] = { ...biasForm };
    } else {
      updated.push({ ...biasForm });
    }
    setReview({ ...review, bias_assessments: updated, updated_at: new Date().toISOString() });
    setBiasDialogOpen(false);
  }, [review, biasForm, editingBiasIndex]);

  const handleDeleteBias = useCallback((index: number) => {
    if (!review) return;
    const updated = review.bias_assessments.filter((_, i) => i !== index);
    setReview({ ...review, bias_assessments: updated, updated_at: new Date().toISOString() });
  }, [review]);

  // --- Fairness ---
  const openAddFairness = useCallback(() => {
    setEditingFairnessIndex(null);
    setFairnessForm({ ...defaultFairnessForm });
    setFairnessDialogOpen(true);
  }, []);

  const openEditFairness = useCallback((index: number) => {
    if (!review) return;
    setEditingFairnessIndex(index);
    setFairnessForm({ ...review.fairness_metrics[index] });
    setFairnessDialogOpen(true);
  }, [review]);

  const handleSaveFairness = useCallback(() => {
    if (!review) return;
    const updated = [...review.fairness_metrics];
    if (editingFairnessIndex !== null) {
      updated[editingFairnessIndex] = { ...fairnessForm };
    } else {
      updated.push({ ...fairnessForm });
    }
    setReview({ ...review, fairness_metrics: updated, updated_at: new Date().toISOString() });
    setFairnessDialogOpen(false);
  }, [review, fairnessForm, editingFairnessIndex]);

  const handleDeleteFairness = useCallback((index: number) => {
    if (!review) return;
    const updated = review.fairness_metrics.filter((_, i) => i !== index);
    setReview({ ...review, fairness_metrics: updated, updated_at: new Date().toISOString() });
  }, [review]);

  // --- Privacy ---
  const openAddPrivacy = useCallback(() => {
    setEditingPrivacyIndex(null);
    setPrivacyForm({ ...defaultPrivacyForm });
    setPrivacyDialogOpen(true);
  }, []);

  const openEditPrivacy = useCallback((index: number) => {
    if (!review) return;
    setEditingPrivacyIndex(index);
    const item = review.privacy_items[index];
    setPrivacyForm({
      data_type: item.data_type,
      purpose: item.purpose,
      legal_basis: item.legal_basis,
      retention: item.retention,
      access: item.access,
      risk_level: item.risk_level,
    });
    setPrivacyDialogOpen(true);
  }, [review]);

  const handleSavePrivacy = useCallback(() => {
    if (!review) return;
    const updated = [...review.privacy_items];
    const newItem: PrivacyImpactItem = {
      id: editingPrivacyIndex !== null ? updated[editingPrivacyIndex].id : `pi-${Date.now()}`,
      ...privacyForm,
    };
    if (editingPrivacyIndex !== null) {
      updated[editingPrivacyIndex] = newItem;
    } else {
      updated.push(newItem);
    }
    setReview({ ...review, privacy_items: updated, updated_at: new Date().toISOString() });
    setPrivacyDialogOpen(false);
  }, [review, privacyForm, editingPrivacyIndex]);

  const handleDeletePrivacy = useCallback((index: number) => {
    if (!review) return;
    const updated = review.privacy_items.filter((_, i) => i !== index);
    setReview({ ...review, privacy_items: updated, updated_at: new Date().toISOString() });
  }, [review]);

  // --- Oversight ---
  const openAddOversight = useCallback(() => {
    setEditingOversightIndex(null);
    setOversightText('');
    setOversightDialogOpen(true);
  }, []);

  const openEditOversight = useCallback((index: number) => {
    if (!review) return;
    setEditingOversightIndex(index);
    setOversightText(review.human_oversight_controls[index]);
    setOversightDialogOpen(true);
  }, [review]);

  const handleSaveOversight = useCallback(() => {
    if (!review || !oversightText.trim()) return;
    const updated = [...review.human_oversight_controls];
    if (editingOversightIndex !== null) {
      updated[editingOversightIndex] = oversightText.trim();
    } else {
      updated.push(oversightText.trim());
    }
    setReview({ ...review, human_oversight_controls: updated, updated_at: new Date().toISOString() });
    setOversightDialogOpen(false);
  }, [review, oversightText, editingOversightIndex]);

  const handleDeleteOversight = useCallback((index: number) => {
    if (!review) return;
    const updated = review.human_oversight_controls.filter((_, i) => i !== index);
    setReview({ ...review, human_oversight_controls: updated, updated_at: new Date().toISOString() });
  }, [review]);

  // --- Recommendations ---
  const openAddRecommendation = useCallback(() => {
    setEditingRecommendationIndex(null);
    setRecommendationText('');
    setRecommendationDialogOpen(true);
  }, []);

  const openEditRecommendation = useCallback((index: number) => {
    if (!review) return;
    setEditingRecommendationIndex(index);
    setRecommendationText(review.recommendations[index]);
    setRecommendationDialogOpen(true);
  }, [review]);

  const handleSaveRecommendation = useCallback(() => {
    if (!review || !recommendationText.trim()) return;
    const updated = [...review.recommendations];
    if (editingRecommendationIndex !== null) {
      updated[editingRecommendationIndex] = recommendationText.trim();
    } else {
      updated.push(recommendationText.trim());
    }
    setReview({ ...review, recommendations: updated, updated_at: new Date().toISOString() });
    setRecommendationDialogOpen(false);
  }, [review, recommendationText, editingRecommendationIndex]);

  const handleDeleteRecommendation = useCallback((index: number) => {
    if (!review) return;
    const updated = review.recommendations.filter((_, i) => i !== index);
    setReview({ ...review, recommendations: updated, updated_at: new Date().toISOString() });
  }, [review]);

  // --- Export ---
  const handleExportPdf = useCallback(() => {
    if (!review) return;
    const exportData = {
      title: 'AI Ethics Review Report',
      exported_at: new Date().toISOString(),
      system_name: review.system_name,
      system_purpose: review.system_purpose,
      risk_classification: review.risk_classification,
      transparency_level: review.transparency_level,
      bias_assessments: review.bias_assessments,
      fairness_metrics: review.fairness_metrics,
      privacy_items: review.privacy_items,
      human_oversight_controls: review.human_oversight_controls,
      recommendations: review.recommendations,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ethics-review-${review.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [review]);

  // ---------- Sections ----------
  const sections = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'bias', label: 'Bias Assessment', icon: Brain },
    { id: 'fairness', label: 'Fairness Metrics', icon: Eye },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'transparency', label: 'Transparency', icon: Eye },
    { id: 'oversight', label: 'Oversight', icon: Users },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
  ];

  // ---------- Empty State ----------
  if (!review) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              AI Ethics Review
            </h1>
            <p className="text-slate-500 mt-1">
              Comprehensive ethical assessment of AI system deployment
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">No Ethics Review Yet</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Create an ethics review to assess bias, fairness, privacy, transparency,
                  and human oversight controls for your AI system deployment.
                </p>
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-indigo-600 text-white hover:bg-indigo-700 gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Ethics Review
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create Ethics Review</DialogTitle>
              <DialogDescription className="text-slate-500">
                Define the AI system to be assessed for ethical considerations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="create-system-name">System Name</Label>
                <Input
                  id="create-system-name"
                  placeholder="e.g., AI Code Assistant"
                  value={createForm.system_name}
                  onChange={(e) => setCreateForm({ ...createForm, system_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-system-purpose">System Purpose</Label>
                <Textarea
                  id="create-system-purpose"
                  placeholder="Describe the purpose of this AI system..."
                  value={createForm.system_purpose}
                  onChange={(e) => setCreateForm({ ...createForm, system_purpose: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-risk">Risk Classification</Label>
                <Select
                  id="create-risk"
                  value={createForm.risk_classification}
                  onValueChange={(v) => setCreateForm({ ...createForm, risk_classification: v as RiskTier })}
                >
                  <SelectOption value="low">Low</SelectOption>
                  <SelectOption value="medium">Medium</SelectOption>
                  <SelectOption value="high">High</SelectOption>
                  <SelectOption value="critical">Critical</SelectOption>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateReview}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={!createForm.system_name.trim() || !createForm.system_purpose.trim()}
              >
                Create Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ---------- Main Review View ----------
  const transparencyInfo = transparencyConfig[review.transparency_level];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            AI Ethics Review
          </h1>
          <p className="text-slate-500 mt-1">
            Comprehensive ethical assessment of AI system deployment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={openEditDialog}>
            <Edit2 className="h-4 w-4" />
            Edit Review
          </Button>
          <Button
            className="bg-indigo-600 text-white hover:bg-indigo-700 gap-2"
            onClick={() => setAiAlertOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            Generate AI Review
          </Button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200 pb-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-md transition-colors ${
                activeSection === section.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* System Overview */}
      {activeSection === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    System Name
                  </p>
                  <p className="text-sm font-semibold mt-1">{review.system_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Purpose
                  </p>
                  <p className="text-sm text-slate-700 mt-1">{review.system_purpose}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Risk Classification
                  </p>
                  <div className="mt-1">
                    <Badge className={tierColors[review.risk_classification]}>
                      {review.risk_classification.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Transparency Level
                  </p>
                  <div className="mt-1">
                    <Badge className={transparencyInfo.color}>
                      {transparencyInfo.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Last Updated
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    {new Date(review.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">
                  {review.bias_assessments.length}
                </p>
                <p className="text-xs text-slate-500">Bias Types Assessed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">
                  {review.fairness_metrics.filter((m) => m.status === 'compliant').length}/
                  {review.fairness_metrics.length}
                </p>
                <p className="text-xs text-slate-500">Fairness Metrics Met</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">
                  {review.privacy_items.length}
                </p>
                <p className="text-xs text-slate-500">Privacy Items</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">
                  {review.human_oversight_controls.length}
                </p>
                <p className="text-xs text-slate-500">Oversight Controls</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bias Assessment */}
      {activeSection === 'bias' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Bias Assessment
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1" onClick={openAddBias}>
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {review.bias_assessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Brain className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No bias assessments added yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click &quot;Add&quot; to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 px-3 font-medium text-slate-700">Bias Type</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Risk Level</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Evidence</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Mitigation</th>
                      <th className="py-3 px-3 font-medium text-slate-700 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {review.bias_assessments.map((bias, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-3 font-medium">
                          {biasTypeLabels[bias.type]}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={tierColors[bias.risk_level]}>
                            {bias.risk_level}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-[250px] truncate">
                          {bias.evidence}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-[250px] truncate">
                          {bias.mitigation}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditBias(idx)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBias(idx)}
                              className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                              title="Delete"
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
      )}

      {/* Fairness Metrics */}
      {activeSection === 'fairness' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Fairness Metrics
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1" onClick={openAddFairness}>
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {review.fairness_metrics.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Eye className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No fairness metrics added yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click &quot;Add&quot; to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 px-3 font-medium text-slate-700">Metric Type</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Target</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Current</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Status</th>
                      <th className="py-3 px-3 font-medium text-slate-700 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {review.fairness_metrics.map((metric, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-3 font-medium">
                          {fairnessTypeLabels[metric.type]}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{metric.target}</td>
                        <td className="py-3 px-3 text-slate-600">
                          {metric.current ?? (
                            <span className="italic text-slate-400">Not measured</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={complianceStatusColors[metric.status]}>
                            {complianceStatusLabels[metric.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditFairness(idx)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFairness(idx)}
                              className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                              title="Delete"
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
      )}

      {/* Privacy Assessment */}
      {activeSection === 'privacy' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-600" />
                Privacy Assessment
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1" onClick={openAddPrivacy}>
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {review.privacy_items.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Lock className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No privacy impact items added yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click &quot;Add&quot; to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 px-3 font-medium text-slate-700">Data Type</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Purpose</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Legal Basis</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Retention</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Access</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Risk</th>
                      <th className="py-3 px-3 font-medium text-slate-700 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {review.privacy_items.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-3 font-medium">{item.data_type}</td>
                        <td className="py-3 px-3 text-slate-600">{item.purpose}</td>
                        <td className="py-3 px-3 text-slate-600">{item.legal_basis}</td>
                        <td className="py-3 px-3 text-slate-600">{item.retention}</td>
                        <td className="py-3 px-3 text-slate-600">{item.access}</td>
                        <td className="py-3 px-3">
                          <Badge className={tierColors[item.risk_level]}>
                            {item.risk_level}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditPrivacy(idx)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePrivacy(idx)}
                              className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                              title="Delete"
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

            {/* Privacy Checklist */}
            {review.privacy_items.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Privacy Compliance Checklist
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      label: 'Data Minimization',
                      desc: 'Only essential data is collected and processed',
                      done: review.privacy_items.length > 0,
                    },
                    {
                      label: 'Consent Management',
                      desc: 'User consent obtained via AUP acknowledgment',
                      done: review.privacy_items.some((p) => p.legal_basis.toLowerCase().includes('consent')),
                    },
                    {
                      label: 'Data Protection Impact Assessment',
                      desc: 'DPIA completed for AI data processing',
                      done: review.privacy_items.length >= 3,
                    },
                    {
                      label: 'Right to Erasure',
                      desc: 'Process in place to delete data on request',
                      done: review.privacy_items.some((p) => p.retention.toLowerCase().includes('delete')),
                    },
                    {
                      label: 'Cross-border Transfer Safeguards',
                      desc: 'SCCs or adequacy decisions in place',
                      done: false,
                    },
                    {
                      label: 'Breach Notification Plan',
                      desc: 'AI-specific incident response procedures documented',
                      done: false,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transparency */}
      {activeSection === 'transparency' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-600" />
              Transparency Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              {(
                Object.entries(transparencyConfig) as [
                  EthicsReview['transparency_level'],
                  (typeof transparencyConfig)[EthicsReview['transparency_level']],
                ][]
              ).map(([level, config]) => (
                <div
                  key={level}
                  className={`flex-1 p-4 rounded-lg border-2 ${
                    level === review.transparency_level
                      ? 'border-slate-900 shadow-md'
                      : 'border-slate-200 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={config.color}>{config.label}</Badge>
                    {level === review.transparency_level && (
                      <Badge className="bg-slate-900 text-white">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{config.description}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {transparencyInfo.label} Level Assessment
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {review.transparency_level === 'black_box'
                      ? 'The current system provides no visibility into its reasoning process. Consider upgrading to at least "Interpretable" level.'
                      : review.transparency_level === 'interpretable'
                      ? 'The current system provides general visibility into its reasoning process. To achieve "Explainable" status, implement detailed output attribution, confidence scoring, and decision audit trails.'
                      : 'The current system provides full transparency into its decision process. Continue maintaining documentation and audit trails.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Human Oversight Controls */}
      {activeSection === 'oversight' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                Human Oversight Controls
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1" onClick={openAddOversight}>
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {review.human_oversight_controls.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No oversight controls added yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click &quot;Add&quot; to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {review.human_oversight_controls.map((control, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-100 text-teal-700 text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-700 flex-1">{control}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openEditOversight(idx)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOversight(idx)}
                        className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {activeSection === 'recommendations' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Recommendations
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1" onClick={openAddRecommendation}>
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {review.recommendations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Sparkles className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No recommendations added yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click &quot;Add&quot; to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {review.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-lg bg-indigo-50 border border-indigo-100 group"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-200 text-indigo-800 text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-700 flex-1">{rec}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openEditRecommendation(idx)}
                        className="p-1 rounded hover:bg-indigo-200 text-slate-500 hover:text-slate-700"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecommendation(idx)}
                        className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== DIALOGS ========== */}

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Ethics Review</DialogTitle>
            <DialogDescription className="text-slate-500">
              Update the main review details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-system-name">System Name</Label>
              <Input
                id="edit-system-name"
                value={editForm.system_name}
                onChange={(e) => setEditForm({ ...editForm, system_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-system-purpose">System Purpose</Label>
              <Textarea
                id="edit-system-purpose"
                value={editForm.system_purpose}
                onChange={(e) => setEditForm({ ...editForm, system_purpose: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-risk">Risk Classification</Label>
              <Select
                id="edit-risk"
                value={editForm.risk_classification}
                onValueChange={(v) => setEditForm({ ...editForm, risk_classification: v as RiskTier })}
              >
                <SelectOption value="low">Low</SelectOption>
                <SelectOption value="medium">Medium</SelectOption>
                <SelectOption value="high">High</SelectOption>
                <SelectOption value="critical">Critical</SelectOption>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-transparency">Transparency Level</Label>
              <Select
                id="edit-transparency"
                value={editForm.transparency_level}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, transparency_level: v as EthicsReview['transparency_level'] })
                }
              >
                <SelectOption value="black_box">Black Box</SelectOption>
                <SelectOption value="interpretable">Interpretable</SelectOption>
                <SelectOption value="explainable">Explainable</SelectOption>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditReview}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={!editForm.system_name.trim() || !editForm.system_purpose.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bias Assessment Dialog */}
      <Dialog open={biasDialogOpen} onOpenChange={setBiasDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingBiasIndex !== null ? 'Edit Bias Assessment' : 'Add Bias Assessment'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Document a potential bias type and its mitigation strategy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bias-type">Bias Type</Label>
              <Select
                id="bias-type"
                value={biasForm.type}
                onValueChange={(v) => setBiasForm({ ...biasForm, type: v as BiasType })}
              >
                <SelectOption value="historical">Historical Bias</SelectOption>
                <SelectOption value="representation">Representation Bias</SelectOption>
                <SelectOption value="measurement">Measurement Bias</SelectOption>
                <SelectOption value="aggregation">Aggregation Bias</SelectOption>
                <SelectOption value="evaluation">Evaluation Bias</SelectOption>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bias-risk">Risk Level</Label>
              <Select
                id="bias-risk"
                value={biasForm.risk_level}
                onValueChange={(v) => setBiasForm({ ...biasForm, risk_level: v as RiskTier })}
              >
                <SelectOption value="low">Low</SelectOption>
                <SelectOption value="medium">Medium</SelectOption>
                <SelectOption value="high">High</SelectOption>
                <SelectOption value="critical">Critical</SelectOption>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bias-evidence">Evidence</Label>
              <Textarea
                id="bias-evidence"
                placeholder="Describe the evidence for this bias..."
                value={biasForm.evidence}
                onChange={(e) => setBiasForm({ ...biasForm, evidence: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bias-mitigation">Mitigation</Label>
              <Textarea
                id="bias-mitigation"
                placeholder="Describe the mitigation strategy..."
                value={biasForm.mitigation}
                onChange={(e) => setBiasForm({ ...biasForm, mitigation: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBiasDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBias}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={!biasForm.evidence.trim() || !biasForm.mitigation.trim()}
            >
              {editingBiasIndex !== null ? 'Save Changes' : 'Add Assessment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fairness Metric Dialog */}
      <Dialog open={fairnessDialogOpen} onOpenChange={setFairnessDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingFairnessIndex !== null ? 'Edit Fairness Metric' : 'Add Fairness Metric'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a fairness metric target and its current measurement status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fairness-type">Metric Type</Label>
              <Select
                id="fairness-type"
                value={fairnessForm.type}
                onValueChange={(v) => setFairnessForm({ ...fairnessForm, type: v as FairnessMetricType })}
              >
                <SelectOption value="demographic_parity">Demographic Parity</SelectOption>
                <SelectOption value="equalized_odds">Equalized Odds</SelectOption>
                <SelectOption value="predictive_parity">Predictive Parity</SelectOption>
                <SelectOption value="individual_fairness">Individual Fairness</SelectOption>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fairness-target">Target</Label>
              <Input
                id="fairness-target"
                placeholder="e.g., Equal suggestion quality across all experience levels"
                value={fairnessForm.target}
                onChange={(e) => setFairnessForm({ ...fairnessForm, target: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fairness-current">Current Value (optional)</Label>
              <Input
                id="fairness-current"
                placeholder="e.g., 82% parity score"
                value={fairnessForm.current ?? ''}
                onChange={(e) =>
                  setFairnessForm({ ...fairnessForm, current: e.target.value || null })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fairness-status">Status</Label>
              <Select
                id="fairness-status"
                value={fairnessForm.status}
                onValueChange={(v) =>
                  setFairnessForm({ ...fairnessForm, status: v as ComplianceStatus })
                }
              >
                <SelectOption value="compliant">Compliant</SelectOption>
                <SelectOption value="partial">Partial</SelectOption>
                <SelectOption value="non_compliant">Non-Compliant</SelectOption>
                <SelectOption value="needs_review">Needs Review</SelectOption>
                <SelectOption value="not_applicable">Not Applicable</SelectOption>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFairnessDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveFairness}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={!fairnessForm.target.trim()}
            >
              {editingFairnessIndex !== null ? 'Save Changes' : 'Add Metric'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Impact Dialog */}
      <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
        <DialogContent className="bg-white max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingPrivacyIndex !== null ? 'Edit Privacy Impact Item' : 'Add Privacy Impact Item'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Document a data type and its privacy implications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="privacy-data-type">Data Type</Label>
                <Input
                  id="privacy-data-type"
                  placeholder="e.g., Source Code"
                  value={privacyForm.data_type}
                  onChange={(e) => setPrivacyForm({ ...privacyForm, data_type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy-purpose">Purpose</Label>
                <Input
                  id="privacy-purpose"
                  placeholder="e.g., Code generation"
                  value={privacyForm.purpose}
                  onChange={(e) => setPrivacyForm({ ...privacyForm, purpose: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="privacy-legal-basis">Legal Basis</Label>
                <Input
                  id="privacy-legal-basis"
                  placeholder="e.g., Consent via AUP"
                  value={privacyForm.legal_basis}
                  onChange={(e) => setPrivacyForm({ ...privacyForm, legal_basis: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy-retention">Retention</Label>
                <Input
                  id="privacy-retention"
                  placeholder="e.g., 30 days"
                  value={privacyForm.retention}
                  onChange={(e) => setPrivacyForm({ ...privacyForm, retention: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="privacy-access">Access</Label>
                <Input
                  id="privacy-access"
                  placeholder="e.g., AI provider API only"
                  value={privacyForm.access}
                  onChange={(e) => setPrivacyForm({ ...privacyForm, access: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy-risk">Risk Level</Label>
                <Select
                  id="privacy-risk"
                  value={privacyForm.risk_level}
                  onValueChange={(v) => setPrivacyForm({ ...privacyForm, risk_level: v as RiskTier })}
                >
                  <SelectOption value="low">Low</SelectOption>
                  <SelectOption value="medium">Medium</SelectOption>
                  <SelectOption value="high">High</SelectOption>
                  <SelectOption value="critical">Critical</SelectOption>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrivacyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePrivacy}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={!privacyForm.data_type.trim() || !privacyForm.purpose.trim()}
            >
              {editingPrivacyIndex !== null ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Human Oversight Dialog */}
      <Dialog open={oversightDialogOpen} onOpenChange={setOversightDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingOversightIndex !== null ? 'Edit Oversight Control' : 'Add Oversight Control'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a human oversight control for the AI system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="oversight-text">Control Description</Label>
              <Textarea
                id="oversight-text"
                placeholder="e.g., All AI-generated code requires human review before merge"
                value={oversightText}
                onChange={(e) => setOversightText(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOversightDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveOversight}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={!oversightText.trim()}
            >
              {editingOversightIndex !== null ? 'Save Changes' : 'Add Control'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recommendation Dialog */}
      <Dialog open={recommendationDialogOpen} onOpenChange={setRecommendationDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingRecommendationIndex !== null ? 'Edit Recommendation' : 'Add Recommendation'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Add a recommendation for ethical AI deployment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="recommendation-text">Recommendation</Label>
              <Textarea
                id="recommendation-text"
                placeholder="e.g., Implement quarterly bias audits with diverse review panels"
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecommendationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRecommendation}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={!recommendationText.trim()}
            >
              {editingRecommendationIndex !== null ? 'Save Changes' : 'Add Recommendation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generation Alert Dialog */}
      <Dialog open={aiAlertOpen} onOpenChange={setAiAlertOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              AI Generation Unavailable
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              AI-powered ethics review generation requires API key configuration. Please configure
              your Claude API key in project settings to enable this feature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setAiAlertOpen(false)}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
