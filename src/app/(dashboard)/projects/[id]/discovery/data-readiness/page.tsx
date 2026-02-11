'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Database,
  BarChart3,
  Shield,
  Eye,
  Settings2,
  Server,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Target,
  Zap,
  Rocket,
  Clock,
  FileSearch,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
  DataReadinessDimension,
  DataReadinessLevel,
  DataReadinessDimensionScore,
  DataQualityMetric,
  DataAsset,
  DataReadinessAudit,
} from '@/types';
import {
  calculateOverallReadiness,
  classifyReadinessLevel,
  calculateDataQuality,
  generateRemediationRoadmap,
  READINESS_LEVEL_LABELS,
  DIMENSION_LABELS,
  DIMENSION_WEIGHTS,
  QUALITY_DIMENSION_LABELS,
} from '@/lib/scoring/data-readiness-engine';

/* -------------------------------------------------------------------------- */
/*  Tab definitions                                                            */
/* -------------------------------------------------------------------------- */

type TabId = 'overview' | 'dimensions' | 'quality' | 'assets' | 'roadmap';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Target },
  { id: 'dimensions', label: 'Dimensions', icon: Layers },
  { id: 'quality', label: 'Quality', icon: BarChart3 },
  { id: 'assets', label: 'Assets', icon: Database },
  { id: 'roadmap', label: 'Roadmap', icon: Rocket },
];

/* -------------------------------------------------------------------------- */
/*  Dimension icons                                                            */
/* -------------------------------------------------------------------------- */

const DIMENSION_ICONS: Record<DataReadinessDimension, React.ElementType> = {
  availability: Server,
  quality: BarChart3,
  accessibility: Eye,
  governance: FileSearch,
  security: Shield,
  operations: Settings2,
};

/* -------------------------------------------------------------------------- */
/*  Demo data                                                                  */
/* -------------------------------------------------------------------------- */

const DEMO_DIMENSION_SCORES: DataReadinessDimensionScore[] = [
  {
    dimension: 'availability',
    score: 72,
    weight: 0.25,
    findings: [
      'Primary data warehouse has 99.5% uptime SLA',
      'Real-time streaming pipeline covers 60% of key events',
      'Backup and recovery tested quarterly',
    ],
    recommendations: [
      'Extend streaming coverage to remaining customer event types',
      'Implement automated failover for data pipeline components',
    ],
  },
  {
    dimension: 'quality',
    score: 58,
    weight: 0.25,
    findings: [
      'Customer data has 12% null rate in critical fields',
      'Product catalog consistency issues across 3 source systems',
      'No automated quality checks in current ETL pipelines',
    ],
    recommendations: [
      'Implement data quality gates in ETL pipelines',
      'Resolve customer data null values through source system fixes',
      'Establish data quality SLAs per domain',
    ],
  },
  {
    dimension: 'accessibility',
    score: 65,
    weight: 0.20,
    findings: [
      'Self-service analytics covers 40% of data consumers',
      'API access available for structured data only',
      'Average data access request takes 5 business days',
    ],
    recommendations: [
      'Deploy a unified data catalog with self-service discovery',
      'Reduce data access provisioning to under 24 hours',
    ],
  },
  {
    dimension: 'governance',
    score: 48,
    weight: 0.15,
    findings: [
      'Data ownership defined for 35% of critical datasets',
      'No formal data lineage tracking in place',
      'Classification policy exists but enforcement is manual',
    ],
    recommendations: [
      'Assign data owners for all AI-relevant datasets',
      'Implement automated data lineage tracking',
      'Enforce classification through automated tagging',
    ],
  },
  {
    dimension: 'security',
    score: 78,
    weight: 0.10,
    findings: [
      'Encryption at rest enabled for all production databases',
      'Role-based access controls in place for data warehouse',
      'PII detection scanning runs weekly',
    ],
    recommendations: [
      'Increase PII scanning frequency to daily',
      'Implement column-level encryption for sensitive AI training data',
    ],
  },
  {
    dimension: 'operations',
    score: 45,
    weight: 0.05,
    findings: [
      'Data pipelines managed manually with cron jobs',
      'No CI/CD for data pipeline deployments',
      'Monitoring limited to basic uptime checks',
    ],
    recommendations: [
      'Adopt DataOps practices with version-controlled pipelines',
      'Implement comprehensive data pipeline monitoring and alerting',
      'Establish runbooks for common data incident scenarios',
    ],
  },
];

const DEMO_QUALITY_METRICS: DataQualityMetric[] = [
  // Customer domain
  { dimension: 'accuracy', score: 82, target: 95, domain: 'Customer', notes: 'Address validation reduces accuracy in international records' },
  { dimension: 'completeness', score: 71, target: 90, domain: 'Customer', notes: '12% null rate in phone and secondary email fields' },
  { dimension: 'consistency', score: 65, target: 90, domain: 'Customer', notes: 'Name format inconsistencies across CRM and billing systems' },
  { dimension: 'timeliness', score: 78, target: 85, domain: 'Customer', notes: 'Profile updates propagate within 4 hours on average' },
  { dimension: 'validity', score: 88, target: 95, domain: 'Customer', notes: 'Strong schema validation on intake forms' },
  { dimension: 'uniqueness', score: 74, target: 95, domain: 'Customer', notes: '3.2% estimated duplicate rate across merged accounts' },
  // Product domain
  { dimension: 'accuracy', score: 91, target: 95, domain: 'Product', notes: 'Well-maintained product catalog with automated checks' },
  { dimension: 'completeness', score: 85, target: 90, domain: 'Product', notes: 'Minor gaps in legacy product attribute fields' },
  { dimension: 'consistency', score: 68, target: 90, domain: 'Product', notes: 'Category taxonomy differs between e-commerce and ERP' },
  { dimension: 'timeliness', score: 92, target: 85, domain: 'Product', notes: 'Real-time sync from PIM system' },
  { dimension: 'validity', score: 90, target: 95, domain: 'Product', notes: 'Strong schema enforcement on product data entry' },
  { dimension: 'uniqueness', score: 95, target: 95, domain: 'Product', notes: 'SKU-based deduplication is reliable' },
  // Transaction domain
  { dimension: 'accuracy', score: 96, target: 98, domain: 'Transaction', notes: 'Financial data highly accurate with reconciliation checks' },
  { dimension: 'completeness', score: 94, target: 98, domain: 'Transaction', notes: 'Rare missing fields due to payment gateway timeouts' },
  { dimension: 'consistency', score: 88, target: 95, domain: 'Transaction', notes: 'Currency handling consistent after recent normalization' },
  { dimension: 'timeliness', score: 85, target: 90, domain: 'Transaction', notes: 'Settlement data may lag 24-48 hours' },
  { dimension: 'validity', score: 97, target: 98, domain: 'Transaction', notes: 'Strict validation on all financial records' },
  { dimension: 'uniqueness', score: 99, target: 99, domain: 'Transaction', notes: 'Idempotency keys prevent duplicates' },
  // Behavioral domain
  { dimension: 'accuracy', score: 72, target: 90, domain: 'Behavioral', notes: 'Bot traffic filtering reduces accuracy of clickstream data' },
  { dimension: 'completeness', score: 61, target: 85, domain: 'Behavioral', notes: 'Ad blockers cause 20% event loss on web channels' },
  { dimension: 'consistency', score: 55, target: 85, domain: 'Behavioral', notes: 'Event schemas differ between web, mobile, and IoT' },
  { dimension: 'timeliness', score: 90, target: 90, domain: 'Behavioral', notes: 'Near-real-time event streaming operational' },
  { dimension: 'validity', score: 68, target: 90, domain: 'Behavioral', notes: 'Schema validation not enforced on all event producers' },
  { dimension: 'uniqueness', score: 80, target: 95, domain: 'Behavioral', notes: 'Session deduplication functional but imperfect across devices' },
];

const DEMO_DATA_ASSETS: DataAsset[] = [
  { id: 'da-1', name: 'Customer Master Database', type: 'database', domain: 'Customer', owner: 'Data Engineering', classification: 'confidential', ai_relevance: 'both', quality_score: 76 },
  { id: 'da-2', name: 'Product Catalog Service', type: 'api', domain: 'Product', owner: 'Product Team', classification: 'internal', ai_relevance: 'inference', quality_score: 87 },
  { id: 'da-3', name: 'Transaction Data Warehouse', type: 'database', domain: 'Transaction', owner: 'Finance Data Team', classification: 'restricted', ai_relevance: 'training', quality_score: 93 },
  { id: 'da-4', name: 'Clickstream Event Lake', type: 'data_lake', domain: 'Behavioral', owner: 'Analytics Engineering', classification: 'internal', ai_relevance: 'training', quality_score: 62 },
  { id: 'da-5', name: 'Customer Support Tickets', type: 'database', domain: 'Customer', owner: 'Support Operations', classification: 'confidential', ai_relevance: 'both', quality_score: 71 },
  { id: 'da-6', name: 'Real-time Events Stream', type: 'streaming', domain: 'Behavioral', owner: 'Platform Engineering', classification: 'internal', ai_relevance: 'inference', quality_score: 68 },
  { id: 'da-7', name: 'ML Feature Store', type: 'feature_store', domain: 'Product', owner: 'ML Platform Team', classification: 'internal', ai_relevance: 'both', quality_score: 82 },
  { id: 'da-8', name: 'Document Repository', type: 'file_system', domain: 'Customer', owner: 'Legal Operations', classification: 'restricted', ai_relevance: 'training', quality_score: 55 },
  { id: 'da-9', name: 'Marketing Analytics Lake', type: 'data_lake', domain: 'Behavioral', owner: 'Marketing Analytics', classification: 'internal', ai_relevance: 'training', quality_score: 64 },
  { id: 'da-10', name: 'Inventory Management API', type: 'api', domain: 'Product', owner: 'Supply Chain', classification: 'internal', ai_relevance: 'inference', quality_score: 79 },
];

const DEMO_DATAOPS_MATURITY = 3.2;

/* -------------------------------------------------------------------------- */
/*  Computed demo audit                                                        */
/* -------------------------------------------------------------------------- */

const overallScore = calculateOverallReadiness(DEMO_DIMENSION_SCORES);
const readinessLevel = classifyReadinessLevel(overallScore);
const avgQuality = calculateDataQuality(DEMO_QUALITY_METRICS);
const roadmap = generateRemediationRoadmap(DEMO_DIMENSION_SCORES);

const DEMO_AUDIT: DataReadinessAudit = {
  id: 'dra-demo-001',
  project_id: 'proj-demo-001',
  overall_score: overallScore,
  readiness_level: readinessLevel,
  dimension_scores: DEMO_DIMENSION_SCORES,
  data_assets: DEMO_DATA_ASSETS,
  quality_metrics: DEMO_QUALITY_METRICS,
  dataops_maturity: DEMO_DATAOPS_MATURITY,
  remediation_roadmap: roadmap,
  created_at: '2025-12-15T10:30:00Z',
  updated_at: '2025-12-15T10:30:00Z',
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function scoreBorderColor(score: number): string {
  if (score >= 75) return 'border-emerald-500';
  if (score >= 60) return 'border-amber-500';
  if (score >= 40) return 'border-orange-500';
  return 'border-red-500';
}

function scoreBarBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function levelBadgeClasses(level: DataReadinessLevel): string {
  const map: Record<DataReadinessLevel, string> = {
    optimized: 'bg-emerald-100 text-emerald-700',
    managed: 'bg-blue-100 text-blue-700',
    defined: 'bg-amber-100 text-amber-700',
    developing: 'bg-orange-100 text-orange-700',
    initial: 'bg-red-100 text-red-700',
  };
  return map[level];
}

function classificationBadgeClasses(classification: DataAsset['classification']): string {
  const map: Record<DataAsset['classification'], string> = {
    public: 'bg-green-100 text-green-700',
    internal: 'bg-blue-100 text-blue-700',
    confidential: 'bg-amber-100 text-amber-700',
    restricted: 'bg-red-100 text-red-700',
  };
  return map[classification];
}

function aiRelevanceLabel(relevance: DataAsset['ai_relevance']): string {
  const map: Record<DataAsset['ai_relevance'], string> = {
    training: 'Training',
    inference: 'Inference',
    both: 'Training & Inference',
    none: 'None',
  };
  return map[relevance];
}

function assetTypeLabel(type: DataAsset['type']): string {
  const map: Record<DataAsset['type'], string> = {
    database: 'Database',
    data_lake: 'Data Lake',
    api: 'API',
    file_system: 'File System',
    streaming: 'Streaming',
    feature_store: 'Feature Store',
  };
  return map[type];
}

function phaseLabel(phase: 'quick_wins' | 'foundation' | 'advanced'): string {
  const map = {
    quick_wins: 'Quick Wins',
    foundation: 'Foundation',
    advanced: 'Advanced',
  };
  return map[phase];
}

function phaseDescription(phase: 'quick_wins' | 'foundation' | 'advanced'): string {
  const map = {
    quick_wins: 'Immediate actions achievable within 0-4 weeks',
    foundation: 'Medium-term improvements over 1-3 months',
    advanced: 'Strategic enhancements planned for 3-6 months',
  };
  return map[phase];
}

function phaseIcon(phase: 'quick_wins' | 'foundation' | 'advanced'): React.ElementType {
  const map = {
    quick_wins: Zap,
    foundation: Layers,
    advanced: Rocket,
  };
  return map[phase];
}

function phaseBorderColor(phase: 'quick_wins' | 'foundation' | 'advanced'): string {
  const map = {
    quick_wins: 'border-l-emerald-500',
    foundation: 'border-l-blue-500',
    advanced: 'border-l-violet-500',
  };
  return map[phase];
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function OverviewTab({ audit }: { audit: DataReadinessAudit }): React.ReactElement {
  const radarData = audit.dimension_scores.map((ds) => ({
    dimension: DIMENSION_LABELS[ds.dimension],
    score: ds.score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Hero: Score + Maturity + DataOps */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Overall Score */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="mb-3 text-sm font-medium text-slate-500">Overall Readiness</p>
            <div
              className={cn(
                'flex h-32 w-32 items-center justify-center rounded-full border-[6px]',
                scoreBorderColor(audit.overall_score)
              )}
            >
              <div className="text-center">
                <span className={cn('text-4xl font-bold', scoreColor(audit.overall_score))}>
                  {audit.overall_score}
                </span>
                <span className="block text-xs text-slate-500 mt-1">/ 100</span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn('mt-4 text-sm px-3 py-1', levelBadgeClasses(audit.readiness_level))}
            >
              {READINESS_LEVEL_LABELS[audit.readiness_level]}
            </Badge>
          </CardContent>
        </Card>

        {/* DataOps Maturity */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="mb-3 text-sm font-medium text-slate-500">DataOps Maturity</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-slate-900">
                {audit.dataops_maturity.toFixed(1)}
              </span>
              <span className="text-lg text-slate-400">/ 5</span>
            </div>
            <div className="mt-4 flex w-full max-w-[180px] gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-2 flex-1 rounded-full',
                    level <= Math.floor(audit.dataops_maturity)
                      ? 'bg-blue-500'
                      : level <= Math.ceil(audit.dataops_maturity)
                        ? 'bg-blue-300'
                        : 'bg-slate-200'
                  )}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {audit.dataops_maturity >= 4 ? 'Advanced' : audit.dataops_maturity >= 3 ? 'Intermediate' : audit.dataops_maturity >= 2 ? 'Basic' : 'Ad Hoc'} DataOps practices
            </p>
          </CardContent>
        </Card>

        {/* Data Quality Average */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="mb-3 text-sm font-medium text-slate-500">Avg. Data Quality</p>
            <div
              className={cn(
                'flex h-32 w-32 items-center justify-center rounded-full border-[6px]',
                scoreBorderColor(avgQuality)
              )}
            >
              <div className="text-center">
                <span className={cn('text-4xl font-bold', scoreColor(avgQuality))}>
                  {avgQuality}
                </span>
                <span className="block text-xs text-slate-500 mt-1">/ 100</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Across {DEMO_QUALITY_METRICS.length} metrics in 4 domains
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dimension Radar</CardTitle>
          <CardDescription className="text-slate-500">
            Scores across all 6 data readiness dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mx-auto h-80 w-full max-w-lg">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#64748b' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dimension summary bars */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dimension Scores</CardTitle>
          <CardDescription className="text-slate-500">
            Weighted contribution to overall readiness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {audit.dimension_scores.map((ds) => {
            const Icon = DIMENSION_ICONS[ds.dimension];
            return (
              <div key={ds.dimension} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{DIMENSION_LABELS[ds.dimension]}</span>
                    <span className="text-xs text-slate-400">
                      ({(DIMENSION_WEIGHTS[ds.dimension] * 100).toFixed(0)}% weight)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('font-semibold', scoreColor(ds.score))}>
                      {ds.score}
                    </span>
                    <span className="text-slate-400">/ 100</span>
                    {ds.score >= 70 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full transition-all', scoreBarBg(ds.score))}
                    style={{ width: `${ds.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function DimensionsTab({ audit }: { audit: DataReadinessAudit }): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {audit.dimension_scores.map((ds) => {
        const Icon = DIMENSION_ICONS[ds.dimension];
        return (
          <Card key={ds.dimension}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      ds.score >= 70 ? 'bg-emerald-100' : ds.score >= 50 ? 'bg-amber-100' : 'bg-red-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        ds.score >= 70 ? 'text-emerald-600' : ds.score >= 50 ? 'text-amber-600' : 'text-red-600'
                      )}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{DIMENSION_LABELS[ds.dimension]}</CardTitle>
                    <p className="text-xs text-slate-500">
                      Weight: {(ds.weight * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <span className={cn('text-3xl font-bold', scoreColor(ds.score))}>
                  {ds.score}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full transition-all', scoreBarBg(ds.score))}
                    style={{ width: `${ds.score}%` }}
                  />
                </div>
              </div>

              {/* Findings */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Key Findings
                </p>
                <ul className="space-y-1.5">
                  {ds.findings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recommendations
                </p>
                <ul className="space-y-1.5">
                  {ds.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function QualityTab({ audit }: { audit: DataReadinessAudit }): React.ReactElement {
  // Aggregate quality scores by dimension (average across all domains)
  const qualityByDimension = QUALITY_DIMENSION_LABELS;
  const aggregated = Object.keys(qualityByDimension).map((dim) => {
    const dimKey = dim as DataQualityMetric['dimension'];
    const metrics = audit.quality_metrics.filter((m) => m.dimension === dimKey);
    const avg = metrics.length > 0
      ? Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length)
      : 0;
    const avgTarget = metrics.length > 0
      ? Math.round(metrics.reduce((s, m) => s + m.target, 0) / metrics.length)
      : 0;
    return {
      name: QUALITY_DIMENSION_LABELS[dimKey],
      score: avg,
      target: avgTarget,
    };
  });

  // Unique domains
  const domains = Array.from(new Set(audit.quality_metrics.map((m) => m.domain)));

  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quality Dimensions Overview</CardTitle>
          <CardDescription className="text-slate-500">
            Average scores vs. targets across all data domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregated} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="score" name="Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-domain breakdown */}
      {domains.map((domain) => {
        const domainMetrics = audit.quality_metrics.filter((m) => m.domain === domain);
        const domainAvg = Math.round(
          domainMetrics.reduce((s, m) => s + m.score, 0) / domainMetrics.length
        );

        return (
          <Card key={domain}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{domain} Domain</CardTitle>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    domainAvg >= 85 ? 'bg-emerald-100 text-emerald-700' :
                    domainAvg >= 70 ? 'bg-blue-100 text-blue-700' :
                    domainAvg >= 55 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  )}
                >
                  Avg: {domainAvg}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">
                        Dimension
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">
                        Score
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">
                        Target
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">
                        Gap
                      </th>
                      <th className="pb-2 text-left text-xs font-medium text-slate-500">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainMetrics.map((metric, idx) => {
                      const gap = metric.target - metric.score;
                      return (
                        <tr
                          key={`${metric.dimension}-${idx}`}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-2.5 pr-4 font-medium capitalize">
                            {QUALITY_DIMENSION_LABELS[metric.dimension]}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={cn('font-semibold', scoreColor(metric.score))}>
                              {metric.score}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4 text-slate-500">{metric.target}</td>
                          <td className="py-2.5 pr-4">
                            {gap > 0 ? (
                              <span className="text-red-600">-{gap}</span>
                            ) : (
                              <span className="text-emerald-600">+{Math.abs(gap)}</span>
                            )}
                          </td>
                          <td className="py-2.5 text-xs text-slate-500">{metric.notes}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AssetsTab({ audit }: { audit: DataReadinessAudit }): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Asset Inventory</CardTitle>
        <CardDescription className="text-slate-500">
          {audit.data_assets.length} data assets cataloged across the organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">Name</th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">Type</th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">Domain</th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">Owner</th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">Classification</th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-slate-500">AI Relevance</th>
                <th className="pb-2 text-left text-xs font-medium text-slate-500">Quality</th>
              </tr>
            </thead>
            <tbody>
              {audit.data_assets.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{assetTypeLabel(asset.type)}</td>
                  <td className="py-3 pr-4 text-slate-600">{asset.domain}</td>
                  <td className="py-3 pr-4 text-slate-600">{asset.owner}</td>
                  <td className="py-3 pr-4">
                    <Badge
                      variant="secondary"
                      className={cn('text-xs capitalize', classificationBadgeClasses(asset.classification))}
                    >
                      {asset.classification}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-slate-600 text-xs">
                    {aiRelevanceLabel(asset.ai_relevance)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-semibold', scoreColor(asset.quality_score))}>
                        {asset.quality_score}
                      </span>
                      <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            scoreBarBg(asset.quality_score)
                          )}
                          style={{ width: `${asset.quality_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function RoadmapTab({ audit }: { audit: DataReadinessAudit }): React.ReactElement {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Remediation Roadmap</CardTitle>
          <CardDescription className="text-slate-500">
            Phased action plan to improve data readiness for AI initiatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-4 text-sm">
            <Clock className="h-5 w-5 text-slate-400 shrink-0" />
            <p className="text-slate-600">
              This roadmap is generated from your dimension scores. Lower-scoring
              dimensions produce more remediation items across all three phases.
            </p>
          </div>
        </CardContent>
      </Card>

      {audit.remediation_roadmap.map((phase) => {
        const PhaseIcon = phaseIcon(phase.phase);
        return (
          <Card
            key={phase.phase}
            className={cn('border-l-4', phaseBorderColor(phase.phase))}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    phase.phase === 'quick_wins'
                      ? 'bg-emerald-100'
                      : phase.phase === 'foundation'
                        ? 'bg-blue-100'
                        : 'bg-violet-100'
                  )}
                >
                  <PhaseIcon
                    className={cn(
                      'h-5 w-5',
                      phase.phase === 'quick_wins'
                        ? 'text-emerald-600'
                        : phase.phase === 'foundation'
                          ? 'text-blue-600'
                          : 'text-violet-600'
                    )}
                  />
                </div>
                <div>
                  <CardTitle className="text-base">{phaseLabel(phase.phase)}</CardTitle>
                  <p className="text-xs text-slate-500">{phaseDescription(phase.phase)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {phase.items.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No remediation items needed for this phase. All relevant dimensions are above threshold.
                </p>
              ) : (
                <ul className="space-y-3">
                  {phase.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600 border border-slate-200">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function DataReadinessPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const audit = DEMO_AUDIT;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Data Readiness Audit
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Assess your organization&apos;s data maturity for AI initiatives across 6 dimensions
        </p>
      </div>

      {/* Demo notice */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Database className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Showing sample audit data. Connect your data sources and complete the assessment to see actual readiness scores.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab audit={audit} />}
      {activeTab === 'dimensions' && <DimensionsTab audit={audit} />}
      {activeTab === 'quality' && <QualityTab audit={audit} />}
      {activeTab === 'assets' && <AssetsTab audit={audit} />}
      {activeTab === 'roadmap' && <RoadmapTab audit={audit} />}

      {/* Footer actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            const blob = new Blob(
              [
                `Data Readiness Audit Report\n${'='.repeat(28)}\n\n` +
                `Overall Score: ${audit.overall_score}/100\n` +
                `Readiness Level: ${READINESS_LEVEL_LABELS[audit.readiness_level]}\n` +
                `DataOps Maturity: ${audit.dataops_maturity}/5\n\n` +
                `Dimension Scores:\n${audit.dimension_scores
                  .map(
                    (ds) =>
                      `  ${DIMENSION_LABELS[ds.dimension]}: ${ds.score}/100 (${(ds.weight * 100).toFixed(0)}% weight)`
                  )
                  .join('\n')}\n\n` +
                `Data Assets: ${audit.data_assets.length} cataloged\n` +
                `Quality Metrics: ${audit.quality_metrics.length} measurements\n`,
              ],
              { type: 'text/plain' }
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data-readiness-audit-report.txt';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>
  );
}
