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
import {
  Store,
  Shield,
  Cog,
  DollarSign,
  HeartPulse,
  Headphones,
  Award,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Download,
  BarChart3,
  TrendingUp,
  FileText,
} from 'lucide-react';
import type {
  VendorEvaluation,
  VendorScore,
  VendorDimension,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type VendorRecommendation = VendorEvaluation['recommendation'];

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'govai_vendor_evaluations';

const VENDOR_DIMENSIONS: { key: VendorDimension; label: string; description: string; icon: React.ReactElement }[] = [
  { key: 'capabilities', label: 'Capabilities', description: 'Core AI capabilities, model quality, and feature set', icon: <Award className="h-4 w-4 text-blue-500" /> },
  { key: 'security', label: 'Security', description: 'Data protection, encryption, access controls, SOC2/ISO', icon: <Shield className="h-4 w-4 text-emerald-500" /> },
  { key: 'compliance', label: 'Compliance', description: 'Regulatory framework support, audit capabilities', icon: <FileText className="h-4 w-4 text-violet-500" /> },
  { key: 'integration', label: 'Integration', description: 'API quality, IDE support, CI/CD compatibility', icon: <Cog className="h-4 w-4 text-orange-500" /> },
  { key: 'economics', label: 'Economics', description: 'Pricing model, TCO, ROI potential, licensing terms', icon: <DollarSign className="h-4 w-4 text-amber-500" /> },
  { key: 'viability', label: 'Viability', description: 'Company stability, market position, roadmap, funding', icon: <HeartPulse className="h-4 w-4 text-rose-500" /> },
  { key: 'support', label: 'Support', description: 'SLA terms, support channels, documentation quality', icon: <Headphones className="h-4 w-4 text-teal-500" /> },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId(): string {
  return `ve-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function calculateOverallScore(scores: VendorScore[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  return Math.round(total / scores.length);
}

function assignRecommendation(score: number): VendorRecommendation {
  if (score >= 80) return 'recommended';
  if (score >= 60) return 'alternative';
  return 'not_recommended';
}

function recommendationLabel(r: VendorRecommendation): string {
  switch (r) {
    case 'recommended':
      return 'Recommended';
    case 'alternative':
      return 'Alternative';
    case 'not_recommended':
      return 'Not Recommended';
  }
}

function recommendationBadgeColor(r: VendorRecommendation): string {
  switch (r) {
    case 'recommended':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'alternative':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'not_recommended':
      return 'bg-red-100 text-red-700 border-red-200';
  }
}

function recommendationIcon(r: VendorRecommendation): React.ReactElement {
  switch (r) {
    case 'recommended':
      return <CircleCheck className="h-4 w-4 text-emerald-600" />;
    case 'alternative':
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case 'not_recommended':
      return <CircleX className="h-4 w-4 text-red-600" />;
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-700';
  if (score >= 60) return 'text-amber-700';
  return 'text-red-600';
}

function dimensionBarColor(d: VendorDimension): string {
  switch (d) {
    case 'capabilities':
      return 'bg-blue-500';
    case 'security':
      return 'bg-emerald-500';
    case 'compliance':
      return 'bg-violet-500';
    case 'integration':
      return 'bg-orange-500';
    case 'economics':
      return 'bg-amber-500';
    case 'viability':
      return 'bg-rose-500';
    case 'support':
      return 'bg-teal-500';
  }
}

function dimensionIcon(d: VendorDimension): React.ReactElement {
  const dim = VENDOR_DIMENSIONS.find((vd) => vd.key === d);
  return dim?.icon ?? <Cog className="h-4 w-4 text-slate-400" />;
}

function getDimScore(scores: VendorScore[], dim: VendorDimension): number {
  return scores.find((s) => s.dimension === dim)?.score ?? 0;
}

/* ------------------------------------------------------------------ */
/*  Form Type                                                          */
/* ------------------------------------------------------------------ */

interface VendorForm {
  vendor_name: string;
  capabilities: number;
  security: number;
  compliance: number;
  integration: number;
  economics: number;
  viability: number;
  support: number;
  strengths: string;
  weaknesses: string;
  red_flags: string;
  tco_estimate: string;
}

const EMPTY_FORM: VendorForm = {
  vendor_name: '',
  capabilities: 50,
  security: 50,
  compliance: 50,
  integration: 50,
  economics: 50,
  viability: 50,
  support: 50,
  strengths: '',
  weaknesses: '',
  red_flags: '',
  tco_estimate: '',
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function VendorEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: projectId } = React.use(params);

  const [vendors, setVendors] = React.useState<VendorEvaluation[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<VendorForm>(EMPTY_FORM);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // ---- Load from localStorage ----
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${projectId}`);
      if (stored) {
        const data = JSON.parse(stored) as VendorEvaluation[];
        setVendors(data);
      }
    } catch {
      // ignore
    }
  }, [projectId]);

  // ---- Persist ----
  const persist = (data: VendorEvaluation[]): void => {
    localStorage.setItem(`${STORAGE_KEY}_${projectId}`, JSON.stringify(data));
  };

  // ---- Build Vendor from Form ----
  const buildVendor = (existingId?: string): VendorEvaluation => {
    const scores: VendorScore[] = VENDOR_DIMENSIONS.map((d) => ({
      dimension: d.key,
      score: form[d.key as keyof VendorForm] as number,
      max_score: 100,
      notes: '',
    }));
    const overallScore = calculateOverallScore(scores);
    const recommendation = assignRecommendation(overallScore);
    const splitComma = (s: string): string[] =>
      s
        .split(',')
        .map((x) => x.trim())
        .filter((x): x is string => x.length > 0);
    const tco = form.tco_estimate ? parseInt(form.tco_estimate, 10) : null;

    return {
      id: existingId ?? generateId(),
      project_id: projectId,
      vendor_name: form.vendor_name,
      dimension_scores: scores,
      overall_score: overallScore,
      recommendation,
      strengths: splitComma(form.strengths),
      weaknesses: splitComma(form.weaknesses),
      red_flags: splitComma(form.red_flags),
      tco_estimate: isNaN(tco as number) ? null : tco,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  // ---- Open Add ----
  const openAdd = (): void => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  // ---- Open Edit ----
  const openEdit = (id: string): void => {
    const v = vendors.find((x) => x.id === id);
    if (!v) return;
    setEditingId(id);
    setForm({
      vendor_name: v.vendor_name,
      capabilities: getDimScore(v.dimension_scores, 'capabilities'),
      security: getDimScore(v.dimension_scores, 'security'),
      compliance: getDimScore(v.dimension_scores, 'compliance'),
      integration: getDimScore(v.dimension_scores, 'integration'),
      economics: getDimScore(v.dimension_scores, 'economics'),
      viability: getDimScore(v.dimension_scores, 'viability'),
      support: getDimScore(v.dimension_scores, 'support'),
      strengths: v.strengths.join(', '),
      weaknesses: v.weaknesses.join(', '),
      red_flags: v.red_flags.join(', '),
      tco_estimate: v.tco_estimate !== null ? String(v.tco_estimate) : '',
    });
    setDialogOpen(true);
  };

  // ---- Save ----
  const handleSave = (): void => {
    if (!form.vendor_name.trim()) return;
    if (editingId) {
      const updated = vendors.map((v) =>
        v.id === editingId ? buildVendor(editingId) : v,
      );
      setVendors(updated);
      persist(updated);
    } else {
      const newV = buildVendor();
      const updated = [...vendors, newV];
      setVendors(updated);
      persist(updated);
    }
    setDialogOpen(false);
  };

  // ---- Delete ----
  const handleDelete = (id: string): void => {
    const updated = vendors.filter((v) => v.id !== id);
    setVendors(updated);
    if (expandedId === id) setExpandedId(null);
    persist(updated);
  };

  // ---- Export ----
  const handleExport = (): void => {
    const blob = new Blob([JSON.stringify(vendors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor-evaluation-${projectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Executive Summary ----
  const handleExecutiveSummary = (): void => {
    const sortedVendors = [...vendors].sort((a, b) => b.overall_score - a.overall_score);
    const lines: string[] = [
      'VENDOR EVALUATION - EXECUTIVE SUMMARY',
      '='.repeat(50),
      '',
      `Total Vendors Evaluated: ${vendors.length}`,
      `Recommended: ${vendors.filter((v) => v.recommendation === 'recommended').length}`,
      `Alternative: ${vendors.filter((v) => v.recommendation === 'alternative').length}`,
      `Not Recommended: ${vendors.filter((v) => v.recommendation === 'not_recommended').length}`,
      '',
      'RANKING:',
      '-'.repeat(30),
    ];

    sortedVendors.forEach((v, idx) => {
      lines.push(`${idx + 1}. ${v.vendor_name} - Score: ${v.overall_score}/100 (${recommendationLabel(v.recommendation)})`);
      if (v.strengths.length > 0) {
        lines.push(`   Strengths: ${v.strengths.join(', ')}`);
      }
      if (v.red_flags.length > 0) {
        lines.push(`   Red Flags: ${v.red_flags.join(', ')}`);
      }
      if (v.tco_estimate !== null) {
        lines.push(`   TCO Estimate: $${(v.tco_estimate / 1000).toFixed(0)}K/yr`);
      }
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor-eval-summary-${projectId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Computed ----
  const sorted = React.useMemo(
    () => [...vendors].sort((a, b) => b.overall_score - a.overall_score),
    [vendors],
  );
  const recommendedCount = vendors.filter((v) => v.recommendation === 'recommended').length;
  const avgScore = vendors.length > 0 ? Math.round(vendors.reduce((s, v) => s + v.overall_score, 0) / vendors.length) : 0;

  // ---- Preview Score ----
  const previewScores: VendorScore[] = VENDOR_DIMENSIONS.map((d) => ({
    dimension: d.key,
    score: form[d.key as keyof VendorForm] as number,
    max_score: 100,
    notes: '',
  }));
  const previewOverall = calculateOverallScore(previewScores);
  const previewRecommendation = assignRecommendation(previewOverall);

  // ---- Empty State ----
  if (vendors.length === 0 && !dialogOpen) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vendor Evaluation Matrix
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Evaluate AI coding tool vendors across 7 dimensions for a comprehensive, data-driven vendor selection.
          </p>
        </div>
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Store className="h-12 w-12 text-slate-300 mb-4" />
            <h2 className="text-lg font-semibold text-slate-700 mb-2">No Vendors Evaluated Yet</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md">
              Add your first vendor to begin the evaluation process. Each vendor is scored across 7 dimensions with an auto-calculated recommendation.
            </p>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add First Vendor
            </Button>
          </CardContent>
        </Card>

        {/* Dialog still needs to render */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white border-slate-200 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Add Vendor</DialogTitle>
              <DialogDescription className="text-slate-500">
                Evaluate a vendor across 7 dimensions. Overall score and recommendation are auto-calculated.
              </DialogDescription>
            </DialogHeader>
            <VendorFormFields
              form={form}
              setForm={setForm}
              previewOverall={previewOverall}
              previewRecommendation={previewRecommendation}
            />
            <DialogFooter>
              <Button variant="outline" className="border-slate-200 text-slate-700" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleSave}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vendor Evaluation Matrix
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Evaluate AI coding tool vendors across 7 dimensions for a comprehensive, data-driven vendor selection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={handleExecutiveSummary}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Executive Summary
          </Button>
          <Button
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button
            className="bg-slate-900 text-white hover:bg-slate-800"
            onClick={openAdd}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-slate-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Vendors</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{vendors.length}</p>
              </div>
              <Store className="h-5 w-5 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Recommended</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{recommendedCount}</p>
              </div>
              <CircleCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Avg Score</p>
                <p className={cn('mt-1 text-2xl font-bold', scoreColor(avgScore))}>{avgScore}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Top Score</p>
                <p className={cn('mt-1 text-2xl font-bold', sorted.length > 0 ? scoreColor(sorted[0].overall_score) : 'text-slate-400')}>
                  {sorted.length > 0 ? sorted[0].overall_score : '-'}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-violet-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Cards */}
      <div className="space-y-4">
        {sorted.map((vendor, rank) => (
          <Card
            key={vendor.id}
            className={cn(
              'transition-all',
              rank === 0 && vendor.recommendation === 'recommended'
                ? 'border-emerald-200 bg-emerald-50/30'
                : 'border-slate-200',
            )}
          >
            <CardContent className="p-0">
              {/* Main Row */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === vendor.id ? null : vendor.id)
                }
              >
                {/* Rank */}
                <div
                  className={cn(
                    'flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold shrink-0',
                    rank === 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : rank === 1
                        ? 'bg-blue-100 text-blue-700'
                        : rank === 2
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600',
                  )}
                >
                  #{rank + 1}
                </div>

                {/* Name + Recommendation */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-semibold text-slate-900">
                      {vendor.vendor_name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs flex items-center gap-1',
                        recommendationBadgeColor(vendor.recommendation),
                      )}
                    >
                      {recommendationIcon(vendor.recommendation)}
                      {recommendationLabel(vendor.recommendation)}
                    </Badge>
                  </div>
                  {/* Dimension bars - compact */}
                  <div className="mt-2 flex items-center gap-1">
                    {vendor.dimension_scores.map((ds) => (
                      <div
                        key={ds.dimension}
                        className="flex-1 group relative"
                        title={`${VENDOR_DIMENSIONS.find((d) => d.key === ds.dimension)?.label}: ${ds.score}`}
                      >
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              dimensionBarColor(ds.dimension),
                            )}
                            style={{ width: `${ds.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={cn('text-2xl font-bold', scoreColor(vendor.overall_score))}>
                    {vendor.overall_score}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                    Overall
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(vendor.id);
                    }}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(vendor.id);
                    }}
                    className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedId === vendor.id && (
                <div className="border-t border-slate-200 p-5 bg-white">
                  {/* Dimension Scores Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    {vendor.dimension_scores.map((ds) => {
                      const dim = VENDOR_DIMENSIONS.find(
                        (d) => d.key === ds.dimension,
                      );
                      return (
                        <div
                          key={ds.dimension}
                          className="rounded-lg border border-slate-200 p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              {dimensionIcon(ds.dimension)}
                              <span className="text-xs font-semibold text-slate-700">
                                {dim?.label ?? ds.dimension}
                              </span>
                            </div>
                            <span
                              className={cn(
                                'text-sm font-bold',
                                scoreColor(ds.score),
                              )}
                            >
                              {ds.score}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                dimensionBarColor(ds.dimension),
                              )}
                              style={{ width: `${ds.score}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-[10px] text-slate-400">
                            {dim?.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Strengths / Weaknesses / Red Flags */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1">
                        <CircleCheck className="h-3.5 w-3.5" />
                        Strengths
                      </h4>
                      {vendor.strengths.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          None listed
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {vendor.strengths.map((s, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-700 flex items-start gap-1.5"
                            >
                              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Weaknesses
                      </h4>
                      {vendor.weaknesses.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          None listed
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {vendor.weaknesses.map((w, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-700 flex items-start gap-1.5"
                            >
                              <span className="h-1.5 w-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1">
                        <CircleX className="h-3.5 w-3.5" />
                        Red Flags
                      </h4>
                      {vendor.red_flags.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          None listed
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {vendor.red_flags.map((rf, i) => (
                            <li
                              key={i}
                              className="text-xs text-red-700 font-medium flex items-start gap-1.5"
                            >
                              <span className="h-1.5 w-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                              {rf}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* TCO */}
                  {vendor.tco_estimate !== null && vendor.tco_estimate > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500">
                        Estimated TCO:
                      </span>
                      <span className="font-semibold text-slate-900">
                        ${(vendor.tco_estimate / 1000).toFixed(0)}K/yr
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      {vendors.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Side-by-Side Comparison
            </CardTitle>
            <CardDescription className="text-slate-500">
              Compare all evaluated vendors dimension by dimension.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Dimension
                    </th>
                    {sorted.map((v) => (
                      <th
                        key={v.id}
                        className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {v.vendor_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VENDOR_DIMENSIONS.map((dim) => {
                    const scores = sorted.map((v) =>
                      getDimScore(v.dimension_scores, dim.key),
                    );
                    const maxScore = Math.max(...scores);
                    return (
                      <tr
                        key={dim.key}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {dim.icon}
                            <span className="font-medium text-slate-700">
                              {dim.label}
                            </span>
                          </div>
                        </td>
                        {sorted.map((v) => {
                          const s = getDimScore(
                            v.dimension_scores,
                            dim.key,
                          );
                          const isBest = s === maxScore && scores.filter((x) => x === maxScore).length === 1;
                          return (
                            <td
                              key={v.id}
                              className="py-3 px-4 text-center"
                            >
                              <span
                                className={cn(
                                  'text-sm font-semibold',
                                  isBest ? 'text-emerald-700' : scoreColor(s),
                                )}
                              >
                                {s}
                                {isBest && (
                                  <span className="ml-1 text-[10px] text-emerald-500 font-medium">
                                    BEST
                                  </span>
                                )}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {/* Overall Row */}
                  <tr className="border-t-2 border-slate-300 bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      Overall Score
                    </td>
                    {sorted.map((v) => (
                      <td
                        key={v.id}
                        className="py-3 px-4 text-center"
                      >
                        <span
                          className={cn(
                            'text-lg font-bold',
                            scoreColor(v.overall_score),
                          )}
                        >
                          {v.overall_score}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* Recommendation Row */}
                  <tr className="bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      Recommendation
                    </td>
                    {sorted.map((v) => (
                      <td
                        key={v.id}
                        className="py-3 px-4 text-center"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            recommendationBadgeColor(v.recommendation),
                          )}
                        >
                          {recommendationLabel(v.recommendation)}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingId ? 'Edit Vendor' : 'Add Vendor'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Evaluate a vendor across 7 dimensions. Overall score and recommendation are auto-calculated.
            </DialogDescription>
          </DialogHeader>
          <VendorFormFields
            form={form}
            setForm={setForm}
            previewOverall={previewOverall}
            previewRecommendation={previewRecommendation}
          />
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-700" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleSave}>
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form Fields                                                        */
/* ------------------------------------------------------------------ */

function VendorFormFields({
  form,
  setForm,
  previewOverall,
  previewRecommendation,
}: {
  form: VendorForm;
  setForm: React.Dispatch<React.SetStateAction<VendorForm>>;
  previewOverall: number;
  previewRecommendation: VendorRecommendation;
}): React.ReactElement {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700">Vendor Name</Label>
          <Input
            value={form.vendor_name}
            onChange={(e) => setForm((f) => ({ ...f, vendor_name: e.target.value }))}
            placeholder="e.g., Claude Code (Anthropic)"
            className="border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700">TCO Estimate ($)</Label>
          <Input
            type="number"
            value={form.tco_estimate}
            onChange={(e) => setForm((f) => ({ ...f, tco_estimate: e.target.value }))}
            placeholder="e.g., 120000"
            className="border-slate-200"
          />
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="space-y-3">
        <Label className="text-slate-700 text-sm font-semibold">Dimension Scores (0-100)</Label>

        {VENDOR_DIMENSIONS.map((dim) => (
          <div key={dim.key} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-28 shrink-0">
              {dim.icon}
              <span className="text-xs font-medium text-slate-700">{dim.label}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={form[dim.key as keyof VendorForm] as number}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  [dim.key]: parseInt(e.target.value, 10),
                }))
              }
              className="flex-1 h-2 accent-slate-700"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={form[dim.key as keyof VendorForm] as number}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  [dim.key]: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
                }))
              }
              className="w-16 text-center border-slate-200 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Live Preview */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-center gap-4 flex-wrap text-sm">
        <span className="text-slate-500">Preview:</span>
        <span className={cn('font-bold text-lg', scoreColor(previewOverall))}>
          {previewOverall}
        </span>
        <Badge
          variant="outline"
          className={cn(
            'text-xs flex items-center gap-1',
            recommendationBadgeColor(previewRecommendation),
          )}
        >
          {recommendationIcon(previewRecommendation)}
          {recommendationLabel(previewRecommendation)}
        </Badge>
        <span className="text-xs text-slate-400">
          (&ge;80 Recommended, &ge;60 Alternative, &lt;60 Not Recommended)
        </span>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Strengths (comma-separated)</Label>
        <Textarea
          value={form.strengths}
          onChange={(e) => setForm((f) => ({ ...f, strengths: e.target.value }))}
          placeholder="e.g., Best-in-class code generation, Strong security model, Excellent documentation"
          className="border-slate-200"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Weaknesses (comma-separated)</Label>
        <Textarea
          value={form.weaknesses}
          onChange={(e) => setForm((f) => ({ ...f, weaknesses: e.target.value }))}
          placeholder="e.g., Higher pricing tier, Limited IDE support"
          className="border-slate-200"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Red Flags (comma-separated)</Label>
        <Textarea
          value={form.red_flags}
          onChange={(e) => setForm((f) => ({ ...f, red_flags: e.target.value }))}
          placeholder="e.g., No SOC2 Type II, Data residency concerns"
          className="border-slate-200"
        />
      </div>
    </div>
  );
}
