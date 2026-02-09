'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  AlertTriangle,
  XCircle,
  ListChecks,
  Server,
  Shield,
  Scale,
  Code2,
  Briefcase,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ScoreDomain } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Demo Data                                                                  */
/* -------------------------------------------------------------------------- */

interface DomainResult {
  domain: ScoreDomain;
  label: string;
  icon: React.ElementType;
  score: number;
  passed: boolean;
  color: string;
  bgColor: string;
  recommendations: string[];
}

const DOMAIN_RESULTS: DomainResult[] = [
  {
    domain: 'infrastructure',
    label: 'Infrastructure',
    icon: Server,
    score: 78,
    passed: true,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    recommendations: [
      'Implement micro-segmentation for AI workload isolation',
      'Standardize developer environments using cloud workstations',
    ],
  },
  {
    domain: 'security',
    label: 'Security',
    icon: Shield,
    score: 65,
    passed: true,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    recommendations: [
      'Deploy endpoint DLP before enabling AI agents on developer machines',
      'Migrate from environment variables to a dedicated secrets vault',
      'Schedule incident response plan tabletop exercise within 30 days',
    ],
  },
  {
    domain: 'governance',
    label: 'Governance',
    icon: Scale,
    score: 58,
    passed: false,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    recommendations: [
      'Draft and approve an AI-specific acceptable use policy before pilot',
      'Formalize vendor risk assessment scoring for AI tool vendors',
      'Establish a change advisory board process for AI-related changes',
    ],
  },
  {
    domain: 'engineering',
    label: 'Engineering',
    icon: Code2,
    score: 82,
    passed: true,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    recommendations: [
      'Add AI-specific review checklist items to PR templates',
      'Increase test coverage target to >80% for AI-touched repositories',
    ],
  },
  {
    domain: 'business',
    label: 'Business',
    icon: Briefcase,
    score: 71,
    passed: true,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    recommendations: [
      'Define quantified ROI metrics and baseline measurements',
      'Secure formal budget allocation for the pilot phase',
    ],
  },
];

const OVERALL_SCORE = 72;
const RATING = 'Moderate Feasibility';

const TOP_RECOMMENDATIONS = [
  {
    id: '1',
    priority: 'High',
    text: 'Draft and distribute an AI Acceptable Use Policy (AUP) before proceeding to sandbox setup.',
    domain: 'governance' as ScoreDomain,
  },
  {
    id: '2',
    priority: 'High',
    text: 'Deploy endpoint DLP solution on all developer workstations that will run AI coding agents.',
    domain: 'security' as ScoreDomain,
  },
  {
    id: '3',
    priority: 'High',
    text: 'Migrate secrets management from environment variables to HashiCorp Vault or AWS Secrets Manager.',
    domain: 'security' as ScoreDomain,
  },
  {
    id: '4',
    priority: 'Medium',
    text: 'Conduct an incident response tabletop exercise that includes an AI-specific breach scenario.',
    domain: 'security' as ScoreDomain,
  },
  {
    id: '5',
    priority: 'Medium',
    text: 'Establish formal vendor risk assessment scoring criteria for Anthropic and OpenAI.',
    domain: 'governance' as ScoreDomain,
  },
  {
    id: '6',
    priority: 'Low',
    text: 'Define measurable ROI targets (e.g., 20% velocity increase) and establish baseline metrics before pilot.',
    domain: 'business' as ScoreDomain,
  },
];

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

function priorityColor(priority: string): 'destructive' | 'secondary' | 'outline' {
  if (priority === 'High') return 'destructive';
  if (priority === 'Medium') return 'secondary';
  return 'outline';
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ---------------------------------------------------------------- */}
      {/*  Page header                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Readiness Assessment Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI governance feasibility results based on your assessment responses
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Overall score hero                                               */}
      {/* ---------------------------------------------------------------- */}
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-center sm:gap-12">
          {/* Score ring */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'flex h-36 w-36 items-center justify-center rounded-full border-[6px]',
                scoreBorderColor(OVERALL_SCORE)
              )}
            >
              <div className="text-center">
                <span className={cn('text-5xl font-bold', scoreColor(OVERALL_SCORE))}>
                  {OVERALL_SCORE}
                </span>
                <span className="block text-xs text-muted-foreground mt-1">out of 100</span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-sm px-3 py-1"
            >
              {RATING}
            </Badge>
          </div>

          {/* Domain horizontal bars */}
          <div className="w-full max-w-md space-y-3">
            {DOMAIN_RESULTS.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.domain} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{d.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('font-semibold', d.color)}>{d.score}</span>
                      <span className="text-muted-foreground">/100</span>
                      {d.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full transition-all', d.bgColor)}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/*  Domain Detail Cards                                              */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Domain Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAIN_RESULTS.map((d) => {
            const Icon = d.icon;
            return (
              <Card key={d.domain}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', d.passed ? 'bg-emerald-100' : 'bg-orange-100')}>
                        <Icon className={cn('h-5 w-5', d.passed ? 'text-emerald-600' : 'text-orange-600')} />
                      </div>
                      <CardTitle className="text-base">{d.label}</CardTitle>
                    </div>
                    <span className={cn('text-2xl font-bold', d.color)}>{d.score}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex items-center gap-2">
                    {d.passed ? (
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
                    <span className="text-xs text-muted-foreground">
                      Threshold: 60
                    </span>
                  </div>
                  <Separator className="mb-3" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Key Recommendations
                    </p>
                    <ul className="space-y-1.5">
                      {d.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                          <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Recommendations Panel                                            */}
      {/* ---------------------------------------------------------------- */}
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
            {TOP_RECOMMENDATIONS.map((rec, idx) => (
              <div
                key={rec.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-foreground">{rec.text}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityColor(rec.priority)} className="text-xs">
                      {rec.priority} Priority
                    </Badge>
                    <span className="text-xs capitalize text-muted-foreground">
                      {rec.domain}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/*  Action Buttons                                                   */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2">
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
          <Button className="gap-2">
            Continue to Governance
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
