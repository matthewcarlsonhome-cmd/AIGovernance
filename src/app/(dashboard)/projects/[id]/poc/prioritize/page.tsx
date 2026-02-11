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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  LayoutGrid,
  Table2,
  Layers,
  Plus,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Crosshair,
  Target,
  BarChart3,
  Zap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ChevronRight,
  Pencil,
  Trash2,
  Info,
} from 'lucide-react';
import type {
  UseCasePriority,
  UseCaseDimensionScore,
  PortfolioQuadrant,
  PriorityDimension,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'govai_use_case_prioritization';

const DIMENSION_WEIGHTS: Record<PriorityDimension, number> = {
  strategic_value: 30,
  technical_feasibility: 25,
  implementation_risk: 25,
  time_to_value: 20,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId(): string {
  return `uc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function calculateCompositeScore(scores: UseCaseDimensionScore[]): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
  return Math.round(weightedSum / totalWeight);
}

function assignQuadrant(compositeScore: number, strategicValue: number): PortfolioQuadrant {
  if (compositeScore >= 80 && strategicValue >= 80) return 'strategic_imperative';
  if (compositeScore >= 70) return 'high_value';
  if (compositeScore >= 55) return 'foundation_builder';
  return 'watch_list';
}

function assignWave(compositeScore: number): 1 | 2 | 3 {
  if (compositeScore >= 80) return 1;
  if (compositeScore >= 65) return 2;
  return 3;
}

function quadrantLabel(q: PortfolioQuadrant): string {
  switch (q) {
    case 'strategic_imperative':
      return 'Strategic Imperative';
    case 'high_value':
      return 'High Value';
    case 'foundation_builder':
      return 'Foundation Builder';
    case 'watch_list':
      return 'Watch List';
  }
}

function quadrantBadgeColor(q: PortfolioQuadrant): string {
  switch (q) {
    case 'strategic_imperative':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'high_value':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'foundation_builder':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'watch_list':
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function waveBadgeColor(wave: 1 | 2 | 3): string {
  switch (wave) {
    case 1:
      return 'bg-violet-100 text-violet-700 border-violet-200';
    case 2:
      return 'bg-sky-100 text-sky-700 border-sky-200';
    case 3:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function dimensionLabel(d: PriorityDimension): string {
  switch (d) {
    case 'strategic_value':
      return 'Strategic Value';
    case 'technical_feasibility':
      return 'Technical Feasibility';
    case 'implementation_risk':
      return 'Implementation Risk';
    case 'time_to_value':
      return 'Time to Value';
  }
}

function dimensionIcon(d: PriorityDimension): React.ReactElement {
  switch (d) {
    case 'strategic_value':
      return <Star className="h-4 w-4 text-amber-500" />;
    case 'technical_feasibility':
      return <TrendingUp className="h-4 w-4 text-blue-500" />;
    case 'implementation_risk':
      return <Shield className="h-4 w-4 text-orange-500" />;
    case 'time_to_value':
      return <Clock className="h-4 w-4 text-emerald-500" />;
  }
}

function dimensionBarColor(d: PriorityDimension): string {
  switch (d) {
    case 'strategic_value':
      return 'bg-amber-500';
    case 'technical_feasibility':
      return 'bg-blue-500';
    case 'implementation_risk':
      return 'bg-orange-500';
    case 'time_to_value':
      return 'bg-emerald-500';
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-700';
  if (score >= 60) return 'text-amber-700';
  return 'text-red-600';
}

function getQuadrantUseCases(
  useCases: UseCasePriority[],
  quadrant: PortfolioQuadrant,
): UseCasePriority[] {
  return useCases.filter((uc) => uc.quadrant === quadrant);
}

function getWaveUseCases(
  useCases: UseCasePriority[],
  wave: 1 | 2 | 3,
): UseCasePriority[] {
  return useCases.filter((uc) => uc.implementation_wave === wave);
}

function getDimensionScore(
  scores: UseCaseDimensionScore[],
  dim: PriorityDimension,
): number {
  return scores.find((s) => s.dimension === dim)?.score ?? 0;
}

/* ------------------------------------------------------------------ */
/*  Form Type                                                          */
/* ------------------------------------------------------------------ */

interface UseCaseForm {
  name: string;
  description: string;
  sponsor: string;
  department: string;
  strategic_value: number;
  technical_feasibility: number;
  implementation_risk: number;
  time_to_value: number;
  dependencies: string;
  roi_estimate: string;
}

const EMPTY_FORM: UseCaseForm = {
  name: '',
  description: '',
  sponsor: '',
  department: '',
  strategic_value: 50,
  technical_feasibility: 50,
  implementation_risk: 50,
  time_to_value: 50,
  dependencies: '',
  roi_estimate: '',
};

/* ------------------------------------------------------------------ */
/*  Summary Stats                                                      */
/* ------------------------------------------------------------------ */

function computeSummary(useCases: UseCasePriority[]) {
  const total = useCases.length;
  const strategicCount = useCases.filter(
    (uc) => uc.quadrant === 'strategic_imperative',
  ).length;
  const avgScore =
    total > 0
      ? Math.round(
          useCases.reduce((sum, uc) => sum + uc.composite_score, 0) / total,
        )
      : 0;
  const wave1Count = useCases.filter(
    (uc) => uc.implementation_wave === 1,
  ).length;
  return { total, strategicCount, avgScore, wave1Count };
}

/* ------------------------------------------------------------------ */
/*  Sub-Components                                                     */
/* ------------------------------------------------------------------ */

function SummaryCards({
  useCases,
}: {
  useCases: UseCasePriority[];
}): React.ReactElement {
  const { total, strategicCount, avgScore, wave1Count } =
    computeSummary(useCases);

  const cards = [
    {
      label: 'Total Use Cases',
      value: total,
      icon: <Layers className="h-5 w-5 text-slate-500" />,
      accent: 'border-l-slate-500',
    },
    {
      label: 'Strategic Imperatives',
      value: strategicCount,
      icon: <Target className="h-5 w-5 text-emerald-600" />,
      accent: 'border-l-emerald-500',
    },
    {
      label: 'Avg Composite Score',
      value: avgScore,
      icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
      accent: 'border-l-blue-500',
    },
    {
      label: 'Wave 1 Items',
      value: wave1Count,
      icon: <Zap className="h-5 w-5 text-violet-600" />,
      accent: 'border-l-violet-500',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className={cn('border-l-4', c.accent)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {c.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {c.value}
                </p>
              </div>
              {c.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---- Matrix View ---- */

function MatrixView({
  useCases,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  useCases: UseCasePriority[];
  selectedId: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): React.ReactElement {
  const quadrants: {
    key: PortfolioQuadrant;
    title: string;
    subtitle: string;
    bg: string;
    border: string;
    headerColor: string;
    dotColor: string;
    scoreColor: string;
    icon: React.ReactElement;
  }[] = [
    {
      key: 'strategic_imperative',
      title: 'Strategic Imperative',
      subtitle: 'High Value + High Feasibility',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      headerColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      scoreColor: 'text-emerald-700',
      icon: <Star className="h-3.5 w-3.5" />,
    },
    {
      key: 'high_value',
      title: 'High Value',
      subtitle: 'High Value + Moderate Feasibility',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      headerColor: 'text-blue-700',
      dotColor: 'bg-blue-500',
      scoreColor: 'text-blue-700',
      icon: <TrendingUp className="h-3.5 w-3.5" />,
    },
    {
      key: 'foundation_builder',
      title: 'Foundation Builder',
      subtitle: 'Moderate Value + Builds Capability',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      headerColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
      scoreColor: 'text-amber-700',
      icon: <Layers className="h-3.5 w-3.5" />,
    },
    {
      key: 'watch_list',
      title: 'Watch List',
      subtitle: 'Lower Priority + Higher Risk',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      headerColor: 'text-slate-500',
      dotColor: 'bg-slate-400',
      scoreColor: 'text-slate-500',
      icon: <Clock className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap hidden md:block"
          style={{ left: '-36px' }}
        >
          Strategic Value
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quadrants.map((q) => {
            const items = getQuadrantUseCases(useCases, q.key);
            return (
              <div
                key={q.key}
                className={cn(
                  'rounded-xl border p-4 min-h-[180px]',
                  q.bg,
                  q.border,
                )}
              >
                <h4
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5',
                    q.headerColor,
                  )}
                >
                  {q.icon}
                  {q.title}
                </h4>
                <p
                  className={cn(
                    'text-[10px] mb-3',
                    q.headerColor,
                    'opacity-70',
                  )}
                >
                  {q.subtitle}
                </p>
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No use cases in this quadrant
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((uc) => (
                      <div
                        key={uc.id}
                        onClick={() => onSelect(uc.id)}
                        className={cn(
                          'rounded-lg bg-white border px-3 py-2.5 cursor-pointer transition-all',
                          q.border,
                          selectedId === uc.id
                            ? 'ring-2 ring-violet-400 shadow-sm'
                            : 'hover:shadow-sm',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full flex-shrink-0',
                                q.dotColor,
                              )}
                            />
                            <span className="text-xs font-medium text-slate-900">
                              {uc.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn('text-xs font-bold', q.scoreColor)}
                            >
                              {uc.composite_score}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); onEdit(uc.id); }}
                              className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDelete(uc.id); }}
                              className="p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-2 pl-4">
                          <span className="text-[10px] text-slate-400">
                            {uc.department}
                          </span>
                          <span className="text-[10px] text-slate-300">|</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-1.5 py-0 h-4',
                              waveBadgeColor(uc.implementation_wave),
                            )}
                          >
                            Wave {uc.implementation_wave}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center mt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:block">
          Technical Feasibility
        </div>
      </div>

      <UseCaseDetail useCases={useCases} selectedId={selectedId} />
    </div>
  );
}

/* ---- Table View ---- */

type SortField = 'composite_score' | 'name' | 'department';
type SortDir = 'asc' | 'desc';

function TableView({
  useCases,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  useCases: UseCasePriority[];
  selectedId: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): React.ReactElement {
  const [sortField, setSortField] = React.useState<SortField>('composite_score');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'composite_score' ? 'desc' : 'asc');
    }
  };

  const sorted = React.useMemo(() => {
    const copy = [...useCases];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'composite_score':
          cmp = a.composite_score - b.composite_score;
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'department':
          cmp = a.department.localeCompare(b.department);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [useCases, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }): React.ReactElement => {
    if (sortField !== field)
      return <ArrowUpDown className="h-3 w-3 ml-1 text-slate-300" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1 text-violet-600" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 text-violet-600" />
    );
  };

  const dimensions: PriorityDimension[] = [
    'strategic_value',
    'technical_feasibility',
    'implementation_risk',
    'time_to_value',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th
                    className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <span className="inline-flex items-center">
                      Use Case
                      <SortIcon field="name" />
                    </span>
                  </th>
                  <th
                    className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => handleSort('department')}
                  >
                    <span className="inline-flex items-center">
                      Department
                      <SortIcon field="department" />
                    </span>
                  </th>
                  {dimensions.map((dim) => (
                    <th
                      key={dim}
                      className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                    >
                      <div className="flex items-center justify-center gap-1">
                        {dimensionIcon(dim)}
                        <span className="hidden xl:inline">
                          {dimensionLabel(dim).split(' ')[0]}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th
                    className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => handleSort('composite_score')}
                  >
                    <span className="inline-flex items-center">
                      Score
                      <SortIcon field="composite_score" />
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Quadrant
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Wave
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((uc, idx) => (
                  <tr
                    key={uc.id}
                    onClick={() => onSelect(uc.id)}
                    className={cn(
                      'border-b border-slate-100 cursor-pointer transition-colors',
                      selectedId === uc.id
                        ? 'bg-violet-50'
                        : idx % 2 === 0
                          ? 'bg-white hover:bg-slate-50'
                          : 'bg-slate-50/30 hover:bg-slate-100/50',
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {selectedId === uc.id && (
                          <ChevronRight className="h-3.5 w-3.5 text-violet-600 flex-shrink-0" />
                        )}
                        <span className="font-medium text-slate-900">
                          {uc.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {uc.department}
                    </td>
                    {dimensions.map((dim) => {
                      const s = getDimensionScore(uc.dimension_scores, dim);
                      return (
                        <td key={dim} className="py-3 px-3 text-center">
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              scoreColor(s),
                            )}
                          >
                            {s}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          'text-sm font-bold',
                          scoreColor(uc.composite_score),
                        )}
                      >
                        {uc.composite_score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          quadrantBadgeColor(uc.quadrant),
                        )}
                      >
                        {quadrantLabel(uc.quadrant)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          waveBadgeColor(uc.implementation_wave),
                        )}
                      >
                        Wave {uc.implementation_wave}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(uc.id); }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(uc.id); }}
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
        </CardContent>
      </Card>

      <UseCaseDetail useCases={useCases} selectedId={selectedId} />
    </div>
  );
}

/* ---- Wave Plan View ---- */

function WavePlanView({
  useCases,
  selectedId,
  onSelect,
}: {
  useCases: UseCasePriority[];
  selectedId: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  const waveConfig = [
    {
      wave: 1 as const,
      title: 'Wave 1 -- Quick Wins',
      timeline: 'Weeks 1-6',
      description:
        'High-confidence, low-risk use cases to build momentum and demonstrate value.',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      headerBg: 'bg-violet-100',
      headerColor: 'text-violet-800',
      barColor: 'bg-violet-500',
    },
    {
      wave: 2 as const,
      title: 'Wave 2 -- Scale & Deepen',
      timeline: 'Weeks 7-14',
      description:
        'Higher-complexity use cases that build on Wave 1 foundations.',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      headerBg: 'bg-sky-100',
      headerColor: 'text-sky-800',
      barColor: 'bg-sky-500',
    },
    {
      wave: 3 as const,
      title: 'Wave 3 -- Transform',
      timeline: 'Weeks 15-24',
      description:
        'Ambitious use cases requiring mature infrastructure and organizational readiness.',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      headerBg: 'bg-slate-100',
      headerColor: 'text-slate-700',
      barColor: 'bg-slate-400',
    },
  ];

  return (
    <div className="space-y-6">
      {waveConfig.map((wc) => {
        const items = getWaveUseCases(useCases, wc.wave);
        const totalRoi = items.reduce(
          (sum, uc) => sum + (uc.roi_estimate ?? 0),
          0,
        );
        const avgScore =
          items.length > 0
            ? Math.round(
                items.reduce((sum, uc) => sum + uc.composite_score, 0) /
                  items.length,
              )
            : 0;

        return (
          <Card key={wc.wave} className={cn('border', wc.border)}>
            <CardHeader className={cn('rounded-t-xl', wc.headerBg)}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle
                    className={cn(
                      'flex items-center gap-2 text-lg',
                      wc.headerColor,
                    )}
                  >
                    <Layers className="h-5 w-5" />
                    {wc.title}
                  </CardTitle>
                  <CardDescription
                    className={cn('mt-1', wc.headerColor, 'opacity-70')}
                  >
                    {wc.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      Timeline
                    </p>
                    <p className={cn('font-semibold', wc.headerColor)}>
                      {wc.timeline}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      Avg Score
                    </p>
                    <p className={cn('font-semibold', scoreColor(avgScore))}>
                      {avgScore}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      Est. ROI
                    </p>
                    <p className="font-semibold text-slate-900">
                      ${(totalRoi / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className={cn('p-4', wc.bg)}>
              {items.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4 text-center">
                  No use cases assigned to this wave
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((uc) => (
                    <div
                      key={uc.id}
                      onClick={() => onSelect(uc.id)}
                      className={cn(
                        'rounded-lg bg-white border p-4 cursor-pointer transition-all',
                        wc.border,
                        selectedId === uc.id
                          ? 'ring-2 ring-violet-400 shadow-md'
                          : 'hover:shadow-sm',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {uc.name}
                        </h4>
                        <span
                          className={cn(
                            'text-sm font-bold flex-shrink-0',
                            scoreColor(uc.composite_score),
                          )}
                        >
                          {uc.composite_score}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                        {uc.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] mb-3">
                        <span className="text-slate-400">
                          {uc.department} -- {uc.sponsor}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-1.5 py-0 h-4',
                            quadrantBadgeColor(uc.quadrant),
                          )}
                        >
                          {quadrantLabel(uc.quadrant)}
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        {uc.dimension_scores.map((ds) => (
                          <div
                            key={ds.dimension}
                            className="flex items-center gap-2"
                          >
                            <span className="text-[10px] text-slate-400 w-8 text-right flex-shrink-0">
                              {ds.score}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
                      {uc.dependencies.length > 0 && (
                        <p className="mt-2 text-[10px] text-slate-400">
                          {uc.dependencies.length} dependenc
                          {uc.dependencies.length === 1 ? 'y' : 'ies'}
                        </p>
                      )}
                      {uc.roi_estimate !== null && uc.roi_estimate > 0 && (
                        <p className="mt-1 text-[10px] font-medium text-slate-500">
                          Est. ROI: ${(uc.roi_estimate / 1000).toFixed(0)}K/yr
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ---- Use Case Detail Panel ---- */

function UseCaseDetail({
  useCases,
  selectedId,
}: {
  useCases: UseCasePriority[];
  selectedId: string;
}): React.ReactElement | null {
  const uc = useCases.find((u) => u.id === selectedId);
  if (!uc) return null;

  return (
    <Card className="border-violet-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Crosshair className="h-5 w-5 text-violet-600" />
          Dimension Scores: {uc.name}
        </CardTitle>
        <CardDescription className="text-slate-500">
          {uc.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {uc.dimension_scores.map((ds) => (
            <div
              key={ds.dimension}
              className="rounded-lg border border-slate-200 p-4 bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {dimensionIcon(ds.dimension)}
                  <span className="text-sm font-semibold text-slate-900">
                    {dimensionLabel(ds.dimension)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Weight: {ds.weight}%
                  </span>
                  <span
                    className={cn('text-sm font-bold', scoreColor(ds.score))}
                  >
                    {ds.score}
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    dimensionBarColor(ds.dimension),
                  )}
                  style={{ width: `${ds.score}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">{ds.notes}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 flex-wrap text-sm border-t border-slate-100 pt-4">
          <span className="text-slate-500">Composite Score:</span>
          <span
            className={cn(
              'text-lg font-bold',
              scoreColor(uc.composite_score),
            )}
          >
            {uc.composite_score}/100
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Quadrant:</span>
          <Badge
            variant="outline"
            className={cn('text-xs', quadrantBadgeColor(uc.quadrant))}
          >
            {quadrantLabel(uc.quadrant)}
          </Badge>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Sponsor:</span>
          <span className="font-medium text-slate-900">{uc.sponsor}</span>
          {uc.roi_estimate !== null && uc.roi_estimate > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Est. ROI:</span>
              <span className="font-semibold text-slate-900">
                ${(uc.roi_estimate / 1000).toFixed(0)}K/yr
              </span>
            </>
          )}
        </div>

        {uc.dependencies.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1.5">
              Dependencies
            </p>
            <div className="flex flex-wrap gap-1.5">
              {uc.dependencies.map((dep) => (
                <Badge
                  key={dep}
                  variant="outline"
                  className="text-[11px] bg-slate-50 text-slate-600 border-slate-200"
                >
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function UseCasePrioritizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: projectId } = React.use(params);

  const [useCases, setUseCases] = React.useState<UseCasePriority[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<UseCaseForm>(EMPTY_FORM);
  const [showFormula, setShowFormula] = React.useState(false);

  // ---- Load from localStorage ----
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${projectId}`);
      if (stored) {
        const data = JSON.parse(stored) as UseCasePriority[];
        setUseCases(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      }
    } catch {
      // ignore
    }
  }, [projectId]);

  // ---- Persist ----
  const persist = (data: UseCasePriority[]): void => {
    localStorage.setItem(`${STORAGE_KEY}_${projectId}`, JSON.stringify(data));
  };

  // ---- Build Use Case from Form ----
  const buildUseCase = (existingId?: string): UseCasePriority => {
    const scores: UseCaseDimensionScore[] = [
      { dimension: 'strategic_value', score: form.strategic_value, weight: DIMENSION_WEIGHTS.strategic_value, notes: '' },
      { dimension: 'technical_feasibility', score: form.technical_feasibility, weight: DIMENSION_WEIGHTS.technical_feasibility, notes: '' },
      { dimension: 'implementation_risk', score: form.implementation_risk, weight: DIMENSION_WEIGHTS.implementation_risk, notes: '' },
      { dimension: 'time_to_value', score: form.time_to_value, weight: DIMENSION_WEIGHTS.time_to_value, notes: '' },
    ];
    const compositeScore = calculateCompositeScore(scores);
    const quadrant = assignQuadrant(compositeScore, form.strategic_value);
    const wave = assignWave(compositeScore);
    const deps = form.dependencies
      .split(',')
      .map((d) => d.trim())
      .filter((d): d is string => d.length > 0);
    const roi = form.roi_estimate ? parseInt(form.roi_estimate, 10) : null;

    return {
      id: existingId ?? generateId(),
      project_id: projectId,
      name: form.name,
      description: form.description,
      sponsor: form.sponsor,
      department: form.department,
      dimension_scores: scores,
      composite_score: compositeScore,
      quadrant,
      implementation_wave: wave,
      dependencies: deps,
      roi_estimate: isNaN(roi as number) ? null : roi,
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
    const uc = useCases.find((u) => u.id === id);
    if (!uc) return;
    setEditingId(id);
    setForm({
      name: uc.name,
      description: uc.description,
      sponsor: uc.sponsor,
      department: uc.department,
      strategic_value: getDimensionScore(uc.dimension_scores, 'strategic_value'),
      technical_feasibility: getDimensionScore(uc.dimension_scores, 'technical_feasibility'),
      implementation_risk: getDimensionScore(uc.dimension_scores, 'implementation_risk'),
      time_to_value: getDimensionScore(uc.dimension_scores, 'time_to_value'),
      dependencies: uc.dependencies.join(', '),
      roi_estimate: uc.roi_estimate !== null ? String(uc.roi_estimate) : '',
    });
    setDialogOpen(true);
  };

  // ---- Save ----
  const handleSave = (): void => {
    if (!form.name.trim()) return;
    if (editingId) {
      const updated = useCases.map((uc) =>
        uc.id === editingId ? buildUseCase(editingId) : uc,
      );
      setUseCases(updated);
      persist(updated);
    } else {
      const newUc = buildUseCase();
      const updated = [...useCases, newUc];
      setUseCases(updated);
      setSelectedId(newUc.id);
      persist(updated);
    }
    setDialogOpen(false);
  };

  // ---- Delete ----
  const handleDelete = (id: string): void => {
    const updated = useCases.filter((uc) => uc.id !== id);
    setUseCases(updated);
    if (selectedId === id && updated.length > 0) {
      setSelectedId(updated[0].id);
    } else if (updated.length === 0) {
      setSelectedId('');
    }
    persist(updated);
  };

  // ---- Export ----
  const handleExport = (): void => {
    const blob = new Blob([JSON.stringify(useCases, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `use-case-prioritization-${projectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Live preview score ----
  const previewComposite = calculateCompositeScore([
    { dimension: 'strategic_value', score: form.strategic_value, weight: DIMENSION_WEIGHTS.strategic_value, notes: '' },
    { dimension: 'technical_feasibility', score: form.technical_feasibility, weight: DIMENSION_WEIGHTS.technical_feasibility, notes: '' },
    { dimension: 'implementation_risk', score: form.implementation_risk, weight: DIMENSION_WEIGHTS.implementation_risk, notes: '' },
    { dimension: 'time_to_value', score: form.time_to_value, weight: DIMENSION_WEIGHTS.time_to_value, notes: '' },
  ]);
  const previewQuadrant = assignQuadrant(previewComposite, form.strategic_value);
  const previewWave = assignWave(previewComposite);

  // ---- Empty State ----
  if (useCases.length === 0 && !dialogOpen) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Use Case Prioritization Framework
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Score, prioritize, and sequence AI use cases across your
            organization for maximum impact and manageable risk.
          </p>
        </div>
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="h-12 w-12 text-slate-300 mb-4" />
            <h2 className="text-lg font-semibold text-slate-700 mb-2">No Use Cases Yet</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md">
              Add your first use case to begin scoring and prioritizing AI initiatives.
              Each use case is scored across 4 dimensions to determine its priority wave and quadrant.
            </p>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add First Use Case
            </Button>
          </CardContent>
        </Card>

        {/* Dialog still needs to render when open */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white border-slate-200 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Add Use Case</DialogTitle>
              <DialogDescription className="text-slate-500">
                Define a use case with dimension scores. The composite score, quadrant, and wave are auto-calculated.
              </DialogDescription>
            </DialogHeader>
            <UseCaseFormFields
              form={form}
              setForm={setForm}
              previewComposite={previewComposite}
              previewQuadrant={previewQuadrant}
              previewWave={previewWave}
              showFormula={showFormula}
              setShowFormula={setShowFormula}
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
            Use Case Prioritization Framework
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Score, prioritize, and sequence AI use cases across your
            organization for maximum impact and manageable risk.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            Add Use Case
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards useCases={useCases} />

      {/* Tab Navigation */}
      <Tabs defaultValue="matrix" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger
            value="matrix"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 rounded-md px-4 py-1.5 text-sm font-medium"
          >
            <LayoutGrid className="h-4 w-4 mr-1.5" />
            Matrix View
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 rounded-md px-4 py-1.5 text-sm font-medium"
          >
            <Table2 className="h-4 w-4 mr-1.5" />
            Table View
          </TabsTrigger>
          <TabsTrigger
            value="waves"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 rounded-md px-4 py-1.5 text-sm font-medium"
          >
            <Layers className="h-4 w-4 mr-1.5" />
            Wave Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <MatrixView
            useCases={useCases}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="table">
          <TableView
            useCases={useCases}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="waves">
          <WavePlanView
            useCases={useCases}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </TabsContent>
      </Tabs>

      {/* Use Case Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingId ? 'Edit Use Case' : 'Add Use Case'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a use case with dimension scores. The composite score, quadrant, and wave are auto-calculated.
            </DialogDescription>
          </DialogHeader>
          <UseCaseFormFields
            form={form}
            setForm={setForm}
            previewComposite={previewComposite}
            previewQuadrant={previewQuadrant}
            previewWave={previewWave}
            showFormula={showFormula}
            setShowFormula={setShowFormula}
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
/*  Form Fields (extracted for reuse in empty state + main)            */
/* ------------------------------------------------------------------ */

function UseCaseFormFields({
  form,
  setForm,
  previewComposite,
  previewQuadrant,
  previewWave,
  showFormula,
  setShowFormula,
}: {
  form: UseCaseForm;
  setForm: React.Dispatch<React.SetStateAction<UseCaseForm>>;
  previewComposite: number;
  previewQuadrant: PortfolioQuadrant;
  previewWave: 1 | 2 | 3;
  showFormula: boolean;
  setShowFormula: React.Dispatch<React.SetStateAction<boolean>>;
}): React.ReactElement {
  const dimensions: { key: PriorityDimension; formKey: keyof UseCaseForm }[] = [
    { key: 'strategic_value', formKey: 'strategic_value' },
    { key: 'technical_feasibility', formKey: 'technical_feasibility' },
    { key: 'implementation_risk', formKey: 'implementation_risk' },
    { key: 'time_to_value', formKey: 'time_to_value' },
  ];

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700">Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g., Code Review Automation"
            className="border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700">Department</Label>
          <Input
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            placeholder="e.g., Engineering"
            className="border-slate-200"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700">Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Describe the use case..."
          className="border-slate-200"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700">Sponsor</Label>
          <Input
            value={form.sponsor}
            onChange={(e) => setForm((f) => ({ ...f, sponsor: e.target.value }))}
            placeholder="e.g., Sarah Chen"
            className="border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700">ROI Estimate ($)</Label>
          <Input
            type="number"
            value={form.roi_estimate}
            onChange={(e) => setForm((f) => ({ ...f, roi_estimate: e.target.value }))}
            placeholder="e.g., 420000"
            className="border-slate-200"
          />
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-slate-700 text-sm font-semibold">Dimension Scores (0-100)</Label>
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <Info className="h-3 w-3" />
            {showFormula ? 'Hide formula' : 'Show formula'}
          </button>
        </div>

        {showFormula && (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">Composite Score Formula:</p>
            <p className="font-mono">
              Score = (Strategic Value x 30% + Technical Feasibility x 25% + Implementation Risk x 25% + Time to Value x 20%) / 100
            </p>
            <p className="mt-1">
              <span className="font-semibold">Quadrant:</span> Strategic Imperative (score &ge; 80 AND strategic &ge; 80), High Value (score &ge; 70), Foundation Builder (score &ge; 55), Watch List (below 55)
            </p>
            <p>
              <span className="font-semibold">Wave:</span> Wave 1 (score &ge; 80), Wave 2 (score &ge; 65), Wave 3 (below 65)
            </p>
          </div>
        )}

        {dimensions.map(({ key, formKey }) => (
          <div key={key} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-40 shrink-0">
              {dimensionIcon(key)}
              <span className="text-xs font-medium text-slate-700">{dimensionLabel(key)}</span>
              <span className="text-[10px] text-slate-400">({DIMENSION_WEIGHTS[key]}%)</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={form[formKey] as number}
              onChange={(e) => setForm((f) => ({ ...f, [formKey]: parseInt(e.target.value, 10) }))}
              className="flex-1 h-2 accent-slate-700"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={form[formKey] as number}
              onChange={(e) => setForm((f) => ({ ...f, [formKey]: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)) }))}
              className="w-16 text-center border-slate-200 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Live Preview */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-center gap-4 flex-wrap text-sm">
        <span className="text-slate-500">Preview:</span>
        <span className={cn('font-bold text-lg', scoreColor(previewComposite))}>
          {previewComposite}
        </span>
        <Badge variant="outline" className={cn('text-xs', quadrantBadgeColor(previewQuadrant))}>
          {quadrantLabel(previewQuadrant)}
        </Badge>
        <Badge variant="outline" className={cn('text-xs', waveBadgeColor(previewWave))}>
          Wave {previewWave}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Dependencies (comma-separated)</Label>
        <Input
          value={form.dependencies}
          onChange={(e) => setForm((f) => ({ ...f, dependencies: e.target.value }))}
          placeholder="e.g., Sandbox setup, CI/CD approval"
          className="border-slate-200"
        />
      </div>
    </div>
  );
}
