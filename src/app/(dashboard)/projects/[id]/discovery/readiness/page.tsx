'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  AlertTriangle,
  ListChecks,
  Server,
  Shield,
  Scale,
  Code2,
  Briefcase,
  Lightbulb,
  AlertCircle,
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
import { Separator } from '@/components/ui/separator';
import { useAssessmentScores } from '@/hooks/use-assessments';
import {
  calculateFeasibilityScore,
  DOMAIN_WEIGHTS,
} from '@/lib/scoring/engine';
import type { ScoreDomain, FeasibilityScore, DomainScore } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Domain metadata                                                            */
/* -------------------------------------------------------------------------- */

const DOMAIN_META: Record<ScoreDomain, { label: string; icon: React.ElementType; threshold: number }> = {
  infrastructure: { label: 'Infrastructure', icon: Server, threshold: 60 },
  security: { label: 'Security', icon: Shield, threshold: 60 },
  governance: { label: 'Governance', icon: Scale, threshold: 50 },
  engineering: { label: 'Engineering', icon: Code2, threshold: 50 },
  business: { label: 'Business', icon: Briefcase, threshold: 50 },
};

/* -------------------------------------------------------------------------- */
/*  Fallback demo data for when no scores exist                                */
/* -------------------------------------------------------------------------- */

const FALLBACK_SCORES: FeasibilityScore = {
  overall_score: 72,
  rating: 'moderate',
  domain_scores: [
    { domain: 'infrastructure', score: 78, maxScore: 100, percentage: 78, passThreshold: 60, passed: true, recommendations: ['Implement micro-segmentation for AI workload isolation', 'Standardize developer environments using cloud workstations'], remediation_tasks: [] },
    { domain: 'security', score: 65, maxScore: 100, percentage: 65, passThreshold: 60, passed: true, recommendations: ['Deploy endpoint DLP before enabling AI agents', 'Migrate from environment variables to a secrets vault', 'Schedule incident response tabletop exercise within 30 days'], remediation_tasks: [] },
    { domain: 'governance', score: 58, maxScore: 100, percentage: 58, passThreshold: 60, passed: false, recommendations: ['Draft and approve an AI-specific acceptable use policy', 'Formalize vendor risk assessment scoring', 'Establish a change advisory board process'], remediation_tasks: [] },
    { domain: 'engineering', score: 82, maxScore: 100, percentage: 82, passThreshold: 60, passed: true, recommendations: ['Add AI-specific review checklist items to PR templates', 'Increase test coverage to >80% for AI-touched repositories'], remediation_tasks: [] },
    { domain: 'business', score: 71, maxScore: 100, percentage: 71, passThreshold: 60, passed: true, recommendations: ['Define quantified ROI metrics and baseline measurements', 'Secure formal budget allocation for pilot phase'], remediation_tasks: [] },
  ],
  recommendations: [],
  remediation_tasks: [],
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

function scoreBarColor(score: number): string {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function ratingLabel(rating: string): string {
  const labels: Record<string, string> = {
    high: 'High Feasibility',
    moderate: 'Moderate Feasibility',
    conditional: 'Conditional Feasibility',
    not_ready: 'Not Ready',
  };
  return labels[rating] || rating;
}

function priorityColor(priority: string): 'destructive' | 'secondary' | 'outline' {
  if (priority === 'High') return 'destructive';
  if (priority === 'Medium') return 'secondary';
  return 'outline';
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton                                                           */
/* -------------------------------------------------------------------------- */

function ReadinessSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse space-y-8">
      <div>
        <div className="h-7 w-72 bg-slate-200 rounded" />
        <div className="h-4 w-96 bg-slate-100 rounded mt-2" />
      </div>
      <Card><CardContent className="h-64" /></Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map(i => <Card key={i}><CardContent className="h-40" /></Card>)}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ReadinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = use(params);
  const { data: scores, isLoading, error } = useAssessmentScores(id);

  if (isLoading) return <ReadinessSkeleton />;

  // If no assessment scores exist, show empty state
  if (!scores && !isLoading && !error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-slate-900" />
            Readiness Assessment
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete the assessment questionnaire to see your readiness scores.
          </p>
        </div>
        <Card className="flex flex-col items-center justify-center py-16">
          <CardContent className="text-center">
            <ListChecks className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No Assessment Data Yet</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md">
              Complete the discovery questionnaire first to generate your feasibility scores and readiness assessment across all five domains.
            </p>
            <Link href={`/projects/${id}/discovery/questionnaire`}>
              <Button className="bg-slate-900 text-white hover:bg-slate-800 gap-2">
                Start Questionnaire <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const feasibility = scores || FALLBACK_SCORES;
  const overallScore = feasibility.overall_score;
  const domainScores = feasibility.domain_scores || [];
  const isDemo = !scores;

  // Build radar chart data
  const radarData = domainScores.map((ds: DomainScore) => ({
    domain: DOMAIN_META[ds.domain]?.label || ds.domain,
    score: ds.score,
    fullMark: 100,
  }));

  // Collect all recommendations with priorities
  const allRecommendations = domainScores.flatMap((ds: DomainScore) =>
    (ds.recommendations || []).map((rec: string, i: number) => ({
      id: `${ds.domain}-${i}`,
      text: rec,
      domain: ds.domain,
      priority: ds.score < 50 ? 'High' : ds.score < 70 ? 'Medium' : 'Low',
    }))
  ).sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return (order[a.priority as keyof typeof order] || 2) - (order[b.priority as keyof typeof order] || 2);
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Readiness Assessment Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          AI governance feasibility results based on your assessment responses
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load scores</p>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      )}

      {/* Demo data notice */}
      {isDemo && !error && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800">
            Showing sample data. Complete the assessment questionnaire to see your actual readiness scores.
          </p>
        </div>
      )}

      {/* Overall score hero + Radar chart */}
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-6 py-10 lg:flex-row lg:justify-center lg:gap-12">
          {/* Score ring */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'flex h-36 w-36 items-center justify-center rounded-full border-[6px]',
                scoreBorderColor(overallScore)
              )}
            >
              <div className="text-center">
                <span className={cn('text-5xl font-bold', scoreColor(overallScore))}>
                  {overallScore}
                </span>
                <span className="block text-xs text-slate-500 mt-1">out of 100</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {ratingLabel(feasibility.rating)}
            </Badge>
          </div>

          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className="w-full max-w-xs h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12, fill: '#64748b' }} />
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
          )}

          {/* Domain horizontal bars */}
          <div className="w-full max-w-md space-y-3">
            {domainScores.map((ds: DomainScore) => {
              const meta = DOMAIN_META[ds.domain];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <div key={ds.domain} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('font-semibold', scoreColor(ds.score))}>{ds.score}</span>
                      <span className="text-slate-400">/100</span>
                      {ds.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn('h-full rounded-full transition-all', scoreBarColor(ds.score))}
                      style={{ width: `${ds.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Domain Detail Cards */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Domain Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domainScores.map((ds: DomainScore) => {
            const meta = DOMAIN_META[ds.domain];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <Card key={ds.domain}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', ds.passed ? 'bg-emerald-100' : 'bg-orange-100')}>
                        <Icon className={cn('h-5 w-5', ds.passed ? 'text-emerald-600' : 'text-orange-600')} />
                      </div>
                      <CardTitle className="text-base">{meta.label}</CardTitle>
                    </div>
                    <span className={cn('text-2xl font-bold', scoreColor(ds.score))}>{ds.score}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex items-center gap-2">
                    {ds.passed ? (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Pass
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Needs Improvement
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500">
                      Threshold: {meta.threshold}
                    </span>
                  </div>
                  <Separator className="mb-3" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Key Recommendations
                    </p>
                    <ul className="space-y-1.5">
                      {(ds.recommendations || []).slice(0, 3).map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                          <span>{rec}</span>
                        </li>
                      ))}
                      {(!ds.recommendations || ds.recommendations.length === 0) && (
                        <li className="text-xs text-slate-400">No recommendations — domain passed threshold.</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recommendations Panel */}
      {allRecommendations.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Prioritized Recommendations
            </CardTitle>
            <CardDescription>
              Actionable items ranked by impact on your readiness score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allRecommendations.slice(0, 8).map((rec, idx) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-4 rounded-lg border bg-slate-50 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{rec.text}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={priorityColor(rec.priority)} className="text-xs">
                        {rec.priority} Priority
                      </Badge>
                      <span className="text-xs capitalize text-slate-500">
                        {rec.domain}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={() => {
            const blob = new Blob(['Readiness Assessment Report\n==========================\n\nThis is a demo export. In production, the full PDF report would be generated using @react-pdf/renderer.\n\nOverall Score: See dashboard for current scores.\nDomains: Infrastructure, Security, Governance, Engineering, Business'], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'readiness-assessment-report.txt';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Link href={`/projects/${id}/discovery/prerequisites`}>
            <Button variant="outline" className="gap-2">
              <ListChecks className="h-4 w-4" />
              View Remediation Tasks
            </Button>
          </Link>
        </div>
        <Link href={`/projects/${id}/governance/policies`}>
          <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
            Continue to Governance
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
