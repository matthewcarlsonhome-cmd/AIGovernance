'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Award,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Download,
  Edit2,
  Flag,
  Layers,
  Lock,
  AlertTriangle,
  PackageSearch,
  Pencil,
  Plus,
  Shield,
  Star,
  Trash2,
  ThumbsUp,
  Users,
  Zap,
} from 'lucide-react';
import type {
  VendorEvaluation,
  VendorDimension,
  VendorScore,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DIMENSION_LABELS: Record<VendorDimension, string> = {
  capabilities: 'Capabilities',
  security: 'Security',
  compliance: 'Compliance',
  integration: 'Integration',
  economics: 'Economics',
  viability: 'Viability',
  support: 'Support',
};

const DIMENSION_ICONS: Record<VendorDimension, React.ReactNode> = {
  capabilities: <Zap className="h-4 w-4" />,
  security: <Lock className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  integration: <Layers className="h-4 w-4" />,
  economics: <DollarSign className="h-4 w-4" />,
  viability: <Building2 className="h-4 w-4" />,
  support: <Users className="h-4 w-4" />,
};

const DIMENSION_ORDER: VendorDimension[] = [
  'capabilities',
  'security',
  'compliance',
  'integration',
  'economics',
  'viability',
  'support',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getRecommendationBadge(rec: VendorEvaluation['recommendation']): React.ReactElement {
  switch (rec) {
    case 'recommended':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Recommended
        </span>
      );
    case 'alternative':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          <Star className="h-3.5 w-3.5" />
          Alternative
        </span>
      );
    case 'not_recommended':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
          <AlertTriangle className="h-3.5 w-3.5" />
          Not Recommended
        </span>
      );
  }
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-amber-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 85) return 'text-emerald-700';
  if (score >= 70) return 'text-amber-700';
  if (score >= 50) return 'text-orange-700';
  return 'text-red-700';
}

function getScoreBgColor(score: number): string {
  if (score >= 85) return 'bg-emerald-50';
  if (score >= 70) return 'bg-amber-50';
  if (score >= 50) return 'bg-orange-50';
  return 'bg-red-50';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculateOverallScore(scores: VendorScore[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, s) => sum + (s.score / s.max_score) * 100, 0);
  return Math.round(total / scores.length);
}

function autoRecommendation(overallScore: number): VendorEvaluation['recommendation'] {
  if (overallScore >= 80) return 'recommended';
  if (overallScore >= 60) return 'alternative';
  return 'not_recommended';
}

/* ------------------------------------------------------------------ */
/*  Vendor Form Dialog                                                 */
/* ------------------------------------------------------------------ */

interface VendorFormData {
  vendor_name: string;
  dimension_scores: VendorScore[];
  strengths: string[];
  weaknesses: string[];
  red_flags: string[];
  tco_estimate: number | null;
}

function emptyFormData(): VendorFormData {
  return {
    vendor_name: '',
    dimension_scores: DIMENSION_ORDER.map((dim) => ({
      dimension: dim,
      score: 0,
      max_score: 100,
      notes: '',
    })),
    strengths: [],
    weaknesses: [],
    red_flags: [],
    tco_estimate: null,
  };
}

function vendorToFormData(v: VendorEvaluation): VendorFormData {
  return {
    vendor_name: v.vendor_name,
    dimension_scores: DIMENSION_ORDER.map((dim) => {
      const existing = v.dimension_scores.find((s) => s.dimension === dim);
      return existing ?? { dimension: dim, score: 0, max_score: 100, notes: '' };
    }),
    strengths: [...v.strengths],
    weaknesses: [...v.weaknesses],
    red_flags: [...v.red_flags],
    tco_estimate: v.tco_estimate,
  };
}

function VendorFormDialog({
  open,
  onClose,
  onSave,
  initial,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: VendorFormData) => void;
  initial: VendorFormData;
  title: string;
}): React.ReactElement {
  const [form, setForm] = React.useState<VendorFormData>(initial);
  const [newStrength, setNewStrength] = React.useState('');
  const [newWeakness, setNewWeakness] = React.useState('');
  const [newRedFlag, setNewRedFlag] = React.useState('');
  const [step, setStep] = React.useState<'basic' | 'scores' | 'analysis'>('basic');

  React.useEffect(() => {
    if (open) {
      setForm(initial);
      setStep('basic');
      setNewStrength('');
      setNewWeakness('');
      setNewRedFlag('');
    }
  }, [open, initial]);

  const updateDimensionScore = (dim: VendorDimension, score: number) => {
    setForm((prev) => ({
      ...prev,
      dimension_scores: prev.dimension_scores.map((s) =>
        s.dimension === dim ? { ...s, score: Math.min(100, Math.max(0, score)) } : s
      ),
    }));
  };

  const updateDimensionNotes = (dim: VendorDimension, notes: string) => {
    setForm((prev) => ({
      ...prev,
      dimension_scores: prev.dimension_scores.map((s) =>
        s.dimension === dim ? { ...s, notes } : s
      ),
    }));
  };

  const addListItem = (field: 'strengths' | 'weaknesses' | 'red_flags', value: string) => {
    if (!value.trim()) return;
    setForm((prev) => ({ ...prev, [field]: [...prev[field], value.trim()] }));
  };

  const removeListItem = (field: 'strengths' | 'weaknesses' | 'red_flags', index: number) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const overall = calculateOverallScore(form.dimension_scores);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {step === 'basic' && 'Enter vendor details and cost estimate'}
            {step === 'scores' && 'Score each evaluation dimension (0-100)'}
            {step === 'analysis' && 'Add strengths, weaknesses, and red flags'}
          </DialogDescription>
        </DialogHeader>

        {step === 'basic' && (
          <div className="space-y-4 py-2">
            <div>
              <Label>Vendor Name *</Label>
              <Input
                value={form.vendor_name}
                onChange={(e) => setForm((prev) => ({ ...prev, vendor_name: e.target.value }))}
                placeholder="e.g., Anthropic Claude Code"
              />
            </div>
            <div>
              <Label>3-Year TCO Estimate ($)</Label>
              <Input
                type="number"
                value={form.tco_estimate ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tco_estimate: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="e.g., 284000"
              />
              <p className="mt-1 text-xs text-slate-500">
                Total estimated cost over 3 years including licenses, implementation, and support
              </p>
            </div>
          </div>
        )}

        {step === 'scores' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-sm font-medium text-slate-700">Calculated Overall Score</span>
              <span className={cn('text-lg font-bold', getScoreTextColor(overall))}>
                {overall}/100
              </span>
            </div>
            {DIMENSION_ORDER.map((dim) => {
              const ds = form.dimension_scores.find((s) => s.dimension === dim);
              const score = ds?.score ?? 0;
              return (
                <div key={dim} className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{DIMENSION_ICONS[dim]}</span>
                      <span className="text-sm font-medium text-slate-700">
                        {DIMENSION_LABELS[dim]}
                      </span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={score}
                      onChange={(e) => updateDimensionScore(dim, Number(e.target.value))}
                      className="w-20 text-right"
                    />
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={cn('h-2 rounded-full transition-all', getScoreColor(score))}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <Textarea
                    value={ds?.notes ?? ''}
                    onChange={(e) => updateDimensionNotes(dim, e.target.value)}
                    placeholder={`Notes for ${DIMENSION_LABELS[dim]}...`}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              );
            })}
          </div>
        )}

        {step === 'analysis' && (
          <div className="space-y-5 py-2">
            {/* Strengths */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Strengths
              </Label>
              <div className="space-y-1.5 mb-2">
                {form.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="flex-1">{s}</span>
                    <button onClick={() => removeListItem('strengths', i)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  placeholder="Add a strength..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addListItem('strengths', newStrength);
                      setNewStrength('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addListItem('strengths', newStrength);
                    setNewStrength('');
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Weaknesses
              </Label>
              <div className="space-y-1.5 mb-2">
                {form.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="flex-1">{w}</span>
                    <button onClick={() => removeListItem('weaknesses', i)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newWeakness}
                  onChange={(e) => setNewWeakness(e.target.value)}
                  placeholder="Add a weakness..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addListItem('weaknesses', newWeakness);
                      setNewWeakness('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addListItem('weaknesses', newWeakness);
                    setNewWeakness('');
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Red Flags */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Flag className="h-4 w-4 text-red-500" />
                Red Flags
              </Label>
              <div className="space-y-1.5 mb-2">
                {form.red_flags.map((rf, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                    <span className="flex-1">{rf}</span>
                    <button onClick={() => removeListItem('red_flags', i)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newRedFlag}
                  onChange={(e) => setNewRedFlag(e.target.value)}
                  placeholder="Add a red flag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addListItem('red_flags', newRedFlag);
                      setNewRedFlag('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addListItem('red_flags', newRedFlag);
                    setNewRedFlag('');
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-1">
            {(['basic', 'scores', 'analysis'] as const).map((s, i) => (
              <div
                key={s}
                className={cn(
                  'h-2 w-8 rounded-full',
                  step === s ? 'bg-slate-900' : 'bg-slate-200'
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step !== 'basic' && (
              <Button
                variant="outline"
                onClick={() => setStep(step === 'analysis' ? 'scores' : 'basic')}
              >
                Back
              </Button>
            )}
            {step !== 'analysis' ? (
              <Button
                onClick={() => setStep(step === 'basic' ? 'scores' : 'analysis')}
                disabled={step === 'basic' && !form.vendor_name.trim()}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() => onSave(form)}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                Save Vendor
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary Cards                                                      */
/* ------------------------------------------------------------------ */

function SummaryCards({ vendors }: { vendors: VendorEvaluation[] }): React.ReactElement {
  const totalVendors = vendors.length;
  const recommendedCount = vendors.filter((v) => v.recommendation === 'recommended').length;
  const avgScore = totalVendors > 0
    ? Math.round(vendors.reduce((sum, v) => sum + v.overall_score, 0) / totalVendors)
    : 0;
  const topVendor = vendors.length > 0
    ? vendors.reduce((best, v) => (v.overall_score > best.overall_score ? v : best))
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Vendors Evaluated</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{totalVendors}</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2.5">
              <BarChart3 className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Recommended</p>
              <p className="mt-1 text-3xl font-bold text-emerald-700">{recommendedCount}</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-2.5">
              <ThumbsUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Average Score</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {avgScore}
                <span className="text-lg font-normal text-slate-400">/100</span>
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-2.5">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Top Vendor</p>
              {topVendor ? (
                <>
                  <p className="mt-1 text-lg font-bold leading-tight text-slate-900">
                    {topVendor.vendor_name}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {topVendor.overall_score}/100
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-400">No vendors yet</p>
              )}
            </div>
            <div className="rounded-lg bg-amber-100 p-2.5">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Bar                                                          */
/* ------------------------------------------------------------------ */

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }): React.ReactElement {
  const pct = Math.round((score / maxScore) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="h-2.5 w-full rounded-full bg-slate-100">
          <div
            className={cn('h-2.5 rounded-full transition-all', getScoreColor(pct))}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span
        className={cn(
          'min-w-[3rem] text-right text-sm font-semibold',
          getScoreTextColor(pct)
        )}
      >
        {score}/{maxScore}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparison Table                                                   */
/* ------------------------------------------------------------------ */

function ComparisonTable({ vendors }: { vendors: VendorEvaluation[] }): React.ReactElement {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-900">
          Dimension-by-Dimension Comparison
        </CardTitle>
        <CardDescription className="text-slate-500">
          Side-by-side scoring across all evaluation dimensions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="min-w-[160px] pb-3 pr-4 text-left text-sm font-semibold text-slate-700">
                  Dimension
                </th>
                {vendors.map((v) => (
                  <th
                    key={v.id}
                    className="min-w-[200px] px-3 pb-3 text-left text-sm font-semibold text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      {v.vendor_name}
                      {v.recommendation === 'recommended' && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                          Top Pick
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSION_ORDER.map((dim, idx) => (
                <tr
                  key={dim}
                  className={cn(
                    'border-b border-slate-100',
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  )}
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-500">{DIMENSION_ICONS[dim]}</span>
                      <span className="text-sm font-medium text-slate-700">
                        {DIMENSION_LABELS[dim]}
                      </span>
                    </div>
                  </td>
                  {vendors.map((v) => {
                    const ds = v.dimension_scores.find((s) => s.dimension === dim);
                    if (!ds) {
                      return (
                        <td key={v.id} className="px-3 py-3.5 text-sm text-slate-400">
                          N/A
                        </td>
                      );
                    }
                    return (
                      <td key={v.id} className="px-3 py-3.5">
                        <ScoreBar score={ds.score} maxScore={ds.max_score} />
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Overall row */}
              <tr className="bg-slate-100/70">
                <td className="py-3.5 pr-4">
                  <span className="text-sm font-bold text-slate-900">Overall Score</span>
                </td>
                {vendors.map((v) => (
                  <td key={v.id} className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm font-bold',
                          getScoreBgColor(v.overall_score),
                          getScoreTextColor(v.overall_score)
                        )}
                      >
                        {v.overall_score}/100
                      </span>
                      {getRecommendationBadge(v.recommendation)}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Visualization (horizontal bar chart)                         */
/* ------------------------------------------------------------------ */

const VENDOR_BAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-cyan-500'];
const VENDOR_DOT_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-cyan-500'];
const VENDOR_TEXT_COLORS = ['text-blue-600', 'text-violet-600', 'text-teal-600', 'text-rose-600', 'text-cyan-600'];

function ScoreVisualization({ vendors }: { vendors: VendorEvaluation[] }): React.ReactElement {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-900">Score Visualization</CardTitle>
        <CardDescription className="text-slate-500">
          Horizontal bar chart comparison across all dimensions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap gap-4">
          {vendors.map((v, i) => (
            <div key={v.id} className="flex items-center gap-2">
              <div className={cn('h-3 w-3 rounded-full', VENDOR_DOT_COLORS[i % VENDOR_DOT_COLORS.length])} />
              <span className={cn('text-sm font-medium', VENDOR_TEXT_COLORS[i % VENDOR_TEXT_COLORS.length])}>
                {v.vendor_name}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {DIMENSION_ORDER.map((dim) => (
            <div key={dim}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-slate-500">{DIMENSION_ICONS[dim]}</span>
                <span className="text-sm font-medium text-slate-700">{DIMENSION_LABELS[dim]}</span>
              </div>
              <div className="space-y-1.5">
                {vendors.map((v, i) => {
                  const ds = v.dimension_scores.find((s) => s.dimension === dim);
                  const pct = ds ? Math.round((ds.score / ds.max_score) * 100) : 0;
                  return (
                    <div key={v.id} className="flex items-center gap-2">
                      <div className="w-full">
                        <div className="h-5 w-full rounded bg-slate-100">
                          <div
                            className={cn(
                              'flex h-5 items-center justify-end rounded pr-2 transition-all',
                              VENDOR_BAR_COLORS[i % VENDOR_BAR_COLORS.length]
                            )}
                            style={{ width: `${pct}%`, minWidth: pct > 0 ? '2.5rem' : '0' }}
                          >
                            <span className="text-[11px] font-semibold text-white">
                              {ds?.score ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  TCO Comparison                                                     */
/* ------------------------------------------------------------------ */

function TcoComparison({ vendors }: { vendors: VendorEvaluation[] }): React.ReactElement {
  const vendorsWithTco = vendors.filter(
    (v): v is VendorEvaluation & { tco_estimate: number } => v.tco_estimate !== null
  );
  if (vendorsWithTco.length === 0) return <></>;

  const maxTco = Math.max(...vendorsWithTco.map((v) => v.tco_estimate));
  const minTco = Math.min(...vendorsWithTco.map((v) => v.tco_estimate));

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-900">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-slate-600" />
            Total Cost of Ownership (3-Year Estimate)
          </div>
        </CardTitle>
        <CardDescription className="text-slate-500">
          Estimated total cost including licenses, implementation, and ongoing support
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vendorsWithTco
            .sort((a, b) => a.tco_estimate - b.tco_estimate)
            .map((v) => {
              const pct = Math.round((v.tco_estimate / maxTco) * 100);
              const isLowest = v.tco_estimate === minTco;
              return (
                <div key={v.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{v.vendor_name}</span>
                      {isLowest && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Lowest TCO
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(v.tco_estimate)}
                    </span>
                  </div>
                  <div className="h-4 w-full rounded bg-slate-100">
                    <div
                      className={cn('h-4 rounded transition-all', isLowest ? 'bg-emerald-500' : 'bg-slate-400')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            TCO estimates include licensing, implementation services, training, and estimated
            ongoing operational costs over a 3-year period for a team of 50 developers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Vendor Detail Card                                                 */
/* ------------------------------------------------------------------ */

function VendorDetailCard({
  vendor,
  onEdit,
  onDelete,
}: {
  vendor: VendorEvaluation;
  onEdit: () => void;
  onDelete: () => void;
}): React.ReactElement {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card
      className={cn(
        'border-slate-200 bg-white',
        vendor.recommendation === 'recommended' && 'ring-1 ring-emerald-200'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-lg text-slate-900">{vendor.vendor_name}</CardTitle>
              {getRecommendationBadge(vendor.recommendation)}
            </div>
            <CardDescription className="mt-1.5 text-slate-500">
              Overall Score:{' '}
              <span className={cn('font-bold', getScoreTextColor(vendor.overall_score))}>
                {vendor.overall_score}/100
              </span>
              {vendor.tco_estimate !== null && (
                <span className="ml-3">
                  3-Year TCO:{' '}
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(vendor.tco_estimate)}
                  </span>
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit} className="text-slate-500 hover:text-slate-700">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-slate-500 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DIMENSION_ORDER.map((dim) => {
            const ds = vendor.dimension_scores.find((s) => s.dimension === dim);
            if (!ds) return null;
            return (
              <div key={dim} className="flex items-center gap-2">
                <span className="text-slate-400">{DIMENSION_ICONS[dim]}</span>
                <span className="w-24 shrink-0 text-xs font-medium text-slate-600">
                  {DIMENSION_LABELS[dim]}
                </span>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={cn('h-2 rounded-full', getScoreColor(ds.score))}
                      style={{ width: `${(ds.score / ds.max_score) * 100}%` }}
                    />
                  </div>
                </div>
                <span
                  className={cn('min-w-[2rem] text-right text-xs font-semibold', getScoreTextColor(ds.score))}
                >
                  {ds.score}
                </span>
              </div>
            );
          })}
        </div>

        {expanded && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            {vendor.strengths.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Strengths
                </h4>
                <ul className="space-y-1.5">
                  {vendor.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vendor.weaknesses.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Weaknesses
                </h4>
                <ul className="space-y-1.5">
                  {vendor.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vendor.red_flags.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Flag className="h-4 w-4 text-red-500" />
                  Red Flags
                </h4>
                <ul className="space-y-1.5">
                  {vendor.red_flags.map((rf, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      {rf}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Dimension Notes</h4>
              <div className="space-y-2">
                {DIMENSION_ORDER.map((dim) => {
                  const ds = vendor.dimension_scores.find((s) => s.dimension === dim);
                  if (!ds || !ds.notes) return null;
                  return (
                    <div key={dim} className="rounded-lg bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-slate-500">{DIMENSION_ICONS[dim]}</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {DIMENSION_LABELS[dim]}
                        </span>
                        <span
                          className={cn('ml-auto text-xs font-bold', getScoreTextColor(ds.score))}
                        >
                          {ds.score}/{ds.max_score}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600">{ds.notes}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {!expanded && (
        <CardFooter className="border-t border-slate-100 pt-3">
          <button
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
            onClick={() => setExpanded(true)}
          >
            View full details
          </button>
        </CardFooter>
      )}
    </Card>
  );
}

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
  const [activeTab, setActiveTab] = React.useState<'comparison' | 'detail'>('comparison');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<VendorEvaluation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const handleSave = React.useCallback(
    (data: VendorFormData) => {
      const overall = calculateOverallScore(data.dimension_scores);
      const rec = autoRecommendation(overall);
      const now = new Date().toISOString();

      if (editingVendor) {
        setVendors((prev) =>
          prev.map((v) =>
            v.id === editingVendor.id
              ? {
                  ...v,
                  vendor_name: data.vendor_name,
                  dimension_scores: data.dimension_scores,
                  overall_score: overall,
                  recommendation: rec,
                  strengths: data.strengths,
                  weaknesses: data.weaknesses,
                  red_flags: data.red_flags,
                  tco_estimate: data.tco_estimate,
                  updated_at: now,
                }
              : v
          )
        );
      } else {
        const newVendor: VendorEvaluation = {
          id: `vendor-${Date.now()}`,
          project_id: projectId,
          vendor_name: data.vendor_name,
          dimension_scores: data.dimension_scores,
          overall_score: overall,
          recommendation: rec,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          red_flags: data.red_flags,
          tco_estimate: data.tco_estimate,
          created_at: now,
          updated_at: now,
        };
        setVendors((prev) => [...prev, newVendor]);
      }
      setDialogOpen(false);
      setEditingVendor(null);
    },
    [editingVendor, projectId]
  );

  const handleDelete = React.useCallback((vendorId: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    setDeleteConfirm(null);
  }, []);

  const openAdd = React.useCallback(() => {
    setEditingVendor(null);
    setDialogOpen(true);
  }, []);

  const openEdit = React.useCallback((vendor: VendorEvaluation) => {
    setEditingVendor(vendor);
    setDialogOpen(true);
  }, []);

  const handleExport = React.useCallback(() => {
    if (vendors.length === 0) return;
    const blob = new Blob([JSON.stringify(vendors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor-evaluation-${projectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [vendors, projectId]);

  /* -- Empty state -- */
  if (vendors.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Evaluation Matrix</h1>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive side-by-side evaluation of AI coding assistant vendors across security,
            compliance, capabilities, and cost dimensions.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-16 border-slate-200">
          <PackageSearch className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No Vendors Evaluated Yet</h2>
          <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
            Add vendors to evaluate them across 7 dimensions: capabilities, security, compliance,
            integration, economics, viability, and support. Scores are auto-calculated.
          </p>
          <Button onClick={openAdd} className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            Add First Vendor
          </Button>
        </Card>

        <VendorFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          initial={emptyFormData()}
          title="Add Vendor Evaluation"
        />
      </div>
    );
  }

  /* -- Main content -- */
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Evaluation Matrix</h1>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive side-by-side evaluation of AI coding assistant vendors across security,
            compliance, capabilities, and cost dimensions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="bg-slate-900 text-white hover:bg-slate-800"
            onClick={openAdd}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards vendors={vendors} />

      {/* Tab navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            className={cn(
              'border-b-2 pb-3 text-sm font-medium transition-colors',
              activeTab === 'comparison'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            )}
            onClick={() => setActiveTab('comparison')}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparison View
            </div>
          </button>
          <button
            className={cn(
              'border-b-2 pb-3 text-sm font-medium transition-colors',
              activeTab === 'detail'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            )}
            onClick={() => setActiveTab('detail')}
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Detail View
            </div>
          </button>
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <ComparisonTable vendors={vendors} />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ScoreVisualization vendors={vendors} />
            <TcoComparison vendors={vendors} />
          </div>
        </div>
      )}

      {activeTab === 'detail' && (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <VendorDetailCard
              key={vendor.id}
              vendor={vendor}
              onEdit={() => openEdit(vendor)}
              onDelete={() => setDeleteConfirm(vendor.id)}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">Evaluation Methodology</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Vendors are evaluated across 7 dimensions using a standardized scoring rubric.
                Scores are based on publicly available documentation, vendor interviews, hands-on
                testing, and third-party security assessments. Recommendations are auto-calculated
                based on overall score (80+ = Recommended, 60-79 = Alternative, below 60 = Not
                Recommended).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor form dialog */}
      <VendorFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingVendor(null);
        }}
        onSave={handleSave}
        initial={editingVendor ? vendorToFormData(editingVendor) : emptyFormData()}
        title={editingVendor ? `Edit ${editingVendor.vendor_name}` : 'Add Vendor Evaluation'}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor Evaluation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vendor evaluation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
