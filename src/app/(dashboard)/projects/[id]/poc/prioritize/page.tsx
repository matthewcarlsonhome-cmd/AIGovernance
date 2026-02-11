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
} from 'lucide-react';
import type {
  UseCasePriority,
  UseCaseDimensionScore,
  PortfolioQuadrant,
  PriorityDimension,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_USE_CASES: UseCasePriority[] = [
  {
    id: 'uc-001',
    project_id: 'proj-001',
    name: 'Code Review Automation',
    description:
      'AI-powered code review assistant that identifies bugs, security issues, and style violations before human review.',
    sponsor: 'Sarah Chen',
    department: 'Engineering',
    dimension_scores: [
      { dimension: 'strategic_value', score: 92, weight: 30, notes: 'Directly aligns with engineering productivity OKR' },
      { dimension: 'technical_feasibility', score: 88, weight: 25, notes: 'Well-proven pattern with existing tool integrations' },
      { dimension: 'implementation_risk', score: 82, weight: 25, notes: 'Low risk; sandboxed in CI pipeline' },
      { dimension: 'time_to_value', score: 85, weight: 20, notes: 'Can deliver in 4-week sprint' },
    ],
    composite_score: 87,
    quadrant: 'strategic_imperative',
    implementation_wave: 1,
    dependencies: ['Sandbox environment setup', 'CI/CD integration approval'],
    roi_estimate: 420000,
    created_at: '2025-10-01T00:00:00Z',
    updated_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 'uc-002',
    project_id: 'proj-001',
    name: 'Test Generation',
    description:
      'Generate unit and integration tests from existing code with target coverage thresholds.',
    sponsor: 'Marcus Rodriguez',
    department: 'Engineering',
    dimension_scores: [
      { dimension: 'strategic_value', score: 85, weight: 30, notes: 'Addresses persistent test coverage gaps' },
      { dimension: 'technical_feasibility', score: 90, weight: 25, notes: 'Strong model capabilities for test generation' },
      { dimension: 'implementation_risk', score: 80, weight: 25, notes: 'Minimal production risk; tests are additive' },
      { dimension: 'time_to_value', score: 88, weight: 20, notes: 'Quick wins available within 2 weeks' },
    ],
    composite_score: 86,
    quadrant: 'high_value',
    implementation_wave: 1,
    dependencies: ['Code review automation validated'],
    roi_estimate: 310000,
    created_at: '2025-10-05T00:00:00Z',
    updated_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 'uc-003',
    project_id: 'proj-001',
    name: 'Documentation Generation',
    description:
      'Auto-generate API documentation, README files, and inline code comments from source code.',
    sponsor: 'Priya Patel',
    department: 'Engineering',
    dimension_scores: [
      { dimension: 'strategic_value', score: 68, weight: 30, notes: 'Improves onboarding but not a direct revenue driver' },
      { dimension: 'technical_feasibility', score: 92, weight: 25, notes: 'Straightforward summarization task' },
      { dimension: 'implementation_risk', score: 90, weight: 25, notes: 'Very low risk; output is always human-reviewed' },
      { dimension: 'time_to_value', score: 95, weight: 20, notes: 'Can demo in 1 week' },
    ],
    composite_score: 85,
    quadrant: 'foundation_builder',
    implementation_wave: 1,
    dependencies: [],
    roi_estimate: 180000,
    created_at: '2025-10-08T00:00:00Z',
    updated_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 'uc-004',
    project_id: 'proj-001',
    name: 'Security Scanning',
    description:
      'AI-assisted static analysis that detects vulnerabilities, insecure patterns, and compliance issues in real time.',
    sponsor: 'David Park',
    department: 'Security',
    dimension_scores: [
      { dimension: 'strategic_value', score: 95, weight: 30, notes: 'Critical for compliance and risk posture' },
      { dimension: 'technical_feasibility', score: 78, weight: 25, notes: 'Requires integration with SAST/DAST toolchain' },
      { dimension: 'implementation_risk', score: 72, weight: 25, notes: 'False positives could slow development if untuned' },
      { dimension: 'time_to_value', score: 70, weight: 20, notes: '6-8 weeks for baseline tuning' },
    ],
    composite_score: 80,
    quadrant: 'strategic_imperative',
    implementation_wave: 2,
    dependencies: ['Code review automation deployed', 'Security team sign-off'],
    roi_estimate: 380000,
    created_at: '2025-10-10T00:00:00Z',
    updated_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 'uc-005',
    project_id: 'proj-001',
    name: 'Bug Prediction',
    description:
      'ML-powered analysis of code changes to predict areas most likely to introduce defects, enabling targeted review.',
    sponsor: 'Elena Vasquez',
    department: 'Engineering',
    dimension_scores: [
      { dimension: 'strategic_value', score: 82, weight: 30, notes: 'Reduces defect escape rate to production' },
      { dimension: 'technical_feasibility', score: 75, weight: 25, notes: 'Needs historical defect data and model training' },
      { dimension: 'implementation_risk', score: 68, weight: 25, notes: 'Requires careful calibration to avoid noise' },
      { dimension: 'time_to_value', score: 65, weight: 20, notes: '8-10 weeks for initial model accuracy' },
    ],
    composite_score: 74,
    quadrant: 'high_value',
    implementation_wave: 2,
    dependencies: ['Defect data pipeline', 'Test generation in production'],
    roi_estimate: 270000,
    created_at: '2025-10-12T00:00:00Z',
    updated_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 'uc-006',
    project_id: 'proj-001',
    name: 'Customer Support Chatbot',
    description:
      'AI assistant for support agents to draft responses, summarize tickets, and suggest knowledge base articles.',
    sponsor: 'James O\'Brien',
    department: 'Customer Success',
    dimension_scores: [
      { dimension: 'strategic_value', score: 70, weight: 30, notes: 'Reduces resolution time but carries reputation risk' },
      { dimension: 'technical_feasibility', score: 55, weight: 25, notes: 'Requires RAG pipeline and knowledge base indexing' },
      { dimension: 'implementation_risk', score: 48, weight: 25, notes: 'Customer-facing outputs carry brand risk' },
      { dimension: 'time_to_value', score: 45, weight: 20, notes: '12-16 weeks for production-ready MVP' },
    ],
    composite_score: 56,
    quadrant: 'watch_list',
    implementation_wave: 3,
    dependencies: ['Data classification complete', 'RAG infrastructure', 'Legal review'],
    roi_estimate: 550000,
    created_at: '2025-10-15T00:00:00Z',
    updated_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 'uc-007',
    project_id: 'proj-001',
    name: 'Legacy Code Migration',
    description:
      'AI-assisted refactoring and migration of legacy codebases to modern frameworks and patterns.',
    sponsor: 'Ava Kim',
    department: 'Engineering',
    dimension_scores: [
      { dimension: 'strategic_value', score: 78, weight: 30, notes: 'Reduces technical debt and maintenance burden' },
      { dimension: 'technical_feasibility', score: 72, weight: 25, notes: 'Complex transformations need careful validation' },
      { dimension: 'implementation_risk', score: 65, weight: 25, notes: 'Risk of subtle behavior changes in migrated code' },
      { dimension: 'time_to_value', score: 60, weight: 20, notes: '10-12 weeks per major migration batch' },
    ],
    composite_score: 70,
    quadrant: 'high_value',
    implementation_wave: 2,
    dependencies: ['Test generation deployed', 'Legacy codebase inventory complete'],
    roi_estimate: 340000,
    created_at: '2025-10-18T00:00:00Z',
    updated_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 'uc-008',
    project_id: 'proj-001',
    name: 'Requirements Analysis',
    description:
      'AI-powered extraction and analysis of requirements from documents, user stories, and stakeholder inputs.',
    sponsor: 'Tom Nguyen',
    department: 'Product',
    dimension_scores: [
      { dimension: 'strategic_value', score: 65, weight: 30, notes: 'Useful but not mission-critical for initial rollout' },
      { dimension: 'technical_feasibility', score: 80, weight: 25, notes: 'NLP capabilities are mature for text analysis' },
      { dimension: 'implementation_risk', score: 75, weight: 25, notes: 'Low risk; human validation always in loop' },
      { dimension: 'time_to_value', score: 70, weight: 20, notes: '4-6 weeks for usable prototype' },
    ],
    composite_score: 72,
    quadrant: 'foundation_builder',
    implementation_wave: 3,
    dependencies: ['Requirements template standardization', 'Product team training'],
    roi_estimate: 160000,
    created_at: '2025-10-20T00:00:00Z',
    updated_at: '2025-11-15T00:00:00Z',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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
}: {
  useCases: UseCasePriority[];
  selectedId: string;
  onSelect: (id: string) => void;
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
      {/* Axis labels */}
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
                          <span
                            className={cn('text-xs font-bold', q.scoreColor)}
                          >
                            {uc.composite_score}
                          </span>
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

      {/* Selected use case detail */}
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
}: {
  useCases: UseCasePriority[];
  selectedId: string;
  onSelect: (id: string) => void;
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected use case detail */}
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
                      {/* Mini dimension bars */}
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
                      {uc.roi_estimate && (
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
}): React.ReactElement {
  const uc = useCases.find((u) => u.id === selectedId) ?? useCases[0];

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

        {/* Summary row */}
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
          {uc.roi_estimate && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Est. ROI:</span>
              <span className="font-semibold text-slate-900">
                ${(uc.roi_estimate / 1000).toFixed(0)}K/yr
              </span>
            </>
          )}
        </div>

        {/* Dependencies */}
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
  const { id: _projectId } = React.use(params);

  const [selectedId, setSelectedId] = React.useState<string>(
    DEMO_USE_CASES[0].id,
  );

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
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Use Case
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards useCases={DEMO_USE_CASES} />

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
            useCases={DEMO_USE_CASES}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </TabsContent>

        <TabsContent value="table">
          <TableView
            useCases={DEMO_USE_CASES}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </TabsContent>

        <TabsContent value="waves">
          <WavePlanView
            useCases={DEMO_USE_CASES}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Export Framework
        </Button>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          Save Prioritization
        </Button>
      </div>
    </div>
  );
}
