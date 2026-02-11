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
import {
  Award,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Download,
  Eye,
  Flag,
  Layers,
  Lock,
  AlertTriangle,
  Shield,
  Star,
  ThumbsUp,
  Users,
  Zap,
} from 'lucide-react';
import type {
  VendorEvaluation,
  VendorDimension,
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
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_VENDORS: VendorEvaluation[] = [
  {
    id: 'v-001',
    project_id: 'proj-001',
    vendor_name: 'Anthropic Claude Code',
    dimension_scores: [
      { dimension: 'capabilities', score: 82, max_score: 100, notes: 'Strong agentic coding with multi-file editing, terminal access, and autonomous iteration. Excellent at complex refactoring tasks.' },
      { dimension: 'security', score: 92, max_score: 100, notes: 'Enterprise-grade data isolation. No training on customer data. SOC 2 Type II certified. Configurable data retention policies.' },
      { dimension: 'compliance', score: 90, max_score: 100, notes: 'Strong compliance posture with GDPR, CCPA, and HIPAA support. Clear data processing agreements. Regular third-party audits.' },
      { dimension: 'integration', score: 78, max_score: 100, notes: 'CLI-first workflow integrates with any IDE via terminal. Git-native. API available for custom toolchain integration.' },
      { dimension: 'economics', score: 80, max_score: 100, notes: 'Usage-based pricing with enterprise volume discounts. Predictable cost model. No per-seat licensing for API usage.' },
      { dimension: 'viability', score: 88, max_score: 100, notes: 'Strong funding (Series D), rapid product iteration, growing enterprise customer base. Clear product roadmap.' },
      { dimension: 'support', score: 85, max_score: 100, notes: 'Dedicated enterprise support team. Slack-based support channel. Comprehensive documentation and onboarding guides.' },
    ],
    overall_score: 85,
    recommendation: 'recommended',
    red_flags: [],
    strengths: [
      'Industry-leading security and data privacy controls',
      'No customer data used for model training',
      'Strong autonomous coding capabilities with agentic workflow',
      'Transparent compliance documentation and audit trail',
      'Active enterprise support with dedicated account team',
    ],
    weaknesses: [
      'Smaller ecosystem compared to GitHub-integrated tools',
      'CLI-first approach requires developer adjustment period',
      'Fewer IDE-native integrations than competitors',
    ],
    tco_estimate: 284000,
    created_at: '2025-10-15T09:00:00Z',
    updated_at: '2025-11-20T14:30:00Z',
  },
  {
    id: 'v-002',
    project_id: 'proj-001',
    vendor_name: 'GitHub Copilot',
    dimension_scores: [
      { dimension: 'capabilities', score: 88, max_score: 100, notes: 'Excellent inline code completion, chat interface, and workspace agent. Strong across many languages with broad training data.' },
      { dimension: 'security', score: 72, max_score: 100, notes: 'Enterprise plan offers content exclusions and IP indemnity. Some concerns around telemetry data collection scope.' },
      { dimension: 'compliance', score: 64, max_score: 100, notes: 'GDPR compliant but limited data residency options. Training data provenance concerns for regulated industries.' },
      { dimension: 'integration', score: 90, max_score: 100, notes: 'Deep VS Code and JetBrains integration. GitHub-native workflows. Seamless PR review and code suggestions.' },
      { dimension: 'economics', score: 74, max_score: 100, notes: 'Per-seat licensing at $19-39/user/month. Costs scale linearly with team size. Enterprise plan required for compliance features.' },
      { dimension: 'viability', score: 85, max_score: 100, notes: 'Microsoft/GitHub backing ensures long-term viability. Largest market share. Risk of vendor lock-in to GitHub ecosystem.' },
      { dimension: 'support', score: 70, max_score: 100, notes: 'Standard GitHub Enterprise support. Community forums active. Enterprise support tiers available at additional cost.' },
    ],
    overall_score: 76,
    recommendation: 'alternative',
    red_flags: [
      'Training data provenance unclear for IP-sensitive codebases',
      'Telemetry data collection scope broader than competitors',
    ],
    strengths: [
      'Best-in-class IDE integration and developer experience',
      'Largest market share with extensive community knowledge',
      'Strong code completion accuracy across many languages',
      'Native GitHub ecosystem integration for PR workflows',
    ],
    weaknesses: [
      'Lower compliance posture for regulated industries',
      'Per-seat pricing scales poorly for large organizations',
      'Telemetry and data handling raise security review concerns',
      'Limited data residency and sovereignty options',
    ],
    tco_estimate: 312000,
    created_at: '2025-10-15T09:00:00Z',
    updated_at: '2025-11-18T11:15:00Z',
  },
  {
    id: 'v-003',
    project_id: 'proj-001',
    vendor_name: 'Amazon CodeWhisperer',
    dimension_scores: [
      { dimension: 'capabilities', score: 70, max_score: 100, notes: 'Good code completion with growing agentic features. Strong for AWS-centric development. Improving but trails leaders in complex tasks.' },
      { dimension: 'security', score: 78, max_score: 100, notes: 'Runs within AWS security perimeter. VPC support. IAM integration. Data stays within customer AWS account for Professional tier.' },
      { dimension: 'compliance', score: 74, max_score: 100, notes: 'Inherits AWS compliance certifications. FedRAMP available. Good fit for organizations already on AWS GovCloud.' },
      { dimension: 'integration', score: 82, max_score: 100, notes: 'Excellent AWS service integration (Lambda, CDK, CloudFormation). Good IDE support. Limited outside AWS ecosystem.' },
      { dimension: 'economics', score: 68, max_score: 100, notes: 'Free tier available. Professional tier bundled with AWS spend. Cost tracking complex when combined with infrastructure billing.' },
      { dimension: 'viability', score: 75, max_score: 100, notes: 'Amazon backing ensures continuity. Product direction influenced by AWS platform strategy. Risk of deprioritization vs. core AWS services.' },
      { dimension: 'support', score: 62, max_score: 100, notes: 'Standard AWS support tiers apply. Documentation adequate. Community smaller than competitors. Enterprise support through AWS agreements.' },
    ],
    overall_score: 71,
    recommendation: 'alternative',
    red_flags: [
      'Feature development pace lags behind top competitors',
      'Support quality inconsistent outside core AWS services',
    ],
    strengths: [
      'Seamless integration with AWS services and infrastructure',
      'Inherits existing AWS security and compliance certifications',
      'Cost-effective for teams already invested in AWS',
      'FedRAMP availability for government use cases',
    ],
    weaknesses: [
      'Capabilities trail Claude Code and Copilot for complex tasks',
      'Limited value outside AWS-centric development workflows',
      'Smaller community and ecosystem of extensions',
      'Complex pricing when bundled with AWS infrastructure costs',
      'Support experience inferior to dedicated AI coding tool vendors',
    ],
    tco_estimate: 246000,
    created_at: '2025-10-15T09:00:00Z',
    updated_at: '2025-11-19T16:45:00Z',
  },
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

/* ------------------------------------------------------------------ */
/*  Summary Cards                                                      */
/* ------------------------------------------------------------------ */

function SummaryCards({ vendors }: { vendors: VendorEvaluation[] }): React.ReactElement {
  const totalVendors = vendors.length;
  const recommendedCount = vendors.filter((v) => v.recommendation === 'recommended').length;
  const avgScore = Math.round(
    vendors.reduce((sum, v) => sum + v.overall_score, 0) / vendors.length
  );
  const topVendor = vendors.reduce((best, v) =>
    v.overall_score > best.overall_score ? v : best
  );

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
              <p className="mt-1 text-lg font-bold leading-tight text-slate-900">
                {topVendor.vendor_name}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {topVendor.overall_score}/100
              </p>
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
                      <span className="text-slate-500">
                        {DIMENSION_ICONS[dim]}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {DIMENSION_LABELS[dim]}
                      </span>
                    </div>
                  </td>
                  {vendors.map((v) => {
                    const ds = v.dimension_scores.find(
                      (s) => s.dimension === dim
                    );
                    if (!ds) {
                      return (
                        <td
                          key={v.id}
                          className="px-3 py-3.5 text-sm text-slate-400"
                        >
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
                  <span className="text-sm font-bold text-slate-900">
                    Overall Score
                  </span>
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

const VENDOR_BAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-teal-500'];
const VENDOR_DOT_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-teal-500'];
const VENDOR_TEXT_COLORS = ['text-blue-600', 'text-violet-600', 'text-teal-600'];

function ScoreVisualization({
  vendors,
}: {
  vendors: VendorEvaluation[];
}): React.ReactElement {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-900">
          Score Visualization
        </CardTitle>
        <CardDescription className="text-slate-500">
          Horizontal bar chart comparison across all dimensions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4">
          {vendors.map((v, i) => (
            <div key={v.id} className="flex items-center gap-2">
              <div
                className={cn('h-3 w-3 rounded-full', VENDOR_DOT_COLORS[i])}
              />
              <span
                className={cn('text-sm font-medium', VENDOR_TEXT_COLORS[i])}
              >
                {v.vendor_name}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {DIMENSION_ORDER.map((dim) => (
            <div key={dim}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-slate-500">
                  {DIMENSION_ICONS[dim]}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {DIMENSION_LABELS[dim]}
                </span>
              </div>
              <div className="space-y-1.5">
                {vendors.map((v, i) => {
                  const ds = v.dimension_scores.find(
                    (s) => s.dimension === dim
                  );
                  const pct = ds
                    ? Math.round((ds.score / ds.max_score) * 100)
                    : 0;
                  return (
                    <div key={v.id} className="flex items-center gap-2">
                      <div className="w-full">
                        <div className="h-5 w-full rounded bg-slate-100">
                          <div
                            className={cn(
                              'flex h-5 items-center justify-end rounded pr-2 transition-all',
                              VENDOR_BAR_COLORS[i]
                            )}
                            style={{
                              width: `${pct}%`,
                              minWidth: pct > 0 ? '2.5rem' : '0',
                            }}
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

function TcoComparison({
  vendors,
}: {
  vendors: VendorEvaluation[];
}): React.ReactElement {
  const vendorsWithTco = vendors.filter(
    (v): v is VendorEvaluation & { tco_estimate: number } =>
      v.tco_estimate !== null
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
          Estimated total cost including licenses, implementation, and ongoing
          support
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
                      <span className="text-sm font-medium text-slate-700">
                        {v.vendor_name}
                      </span>
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
                      className={cn(
                        'h-4 rounded transition-all',
                        isLowest ? 'bg-emerald-500' : 'bg-slate-400'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            TCO estimates include licensing, implementation services, training,
            and estimated ongoing operational costs over a 3-year period for a
            team of 50 developers.
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
}: {
  vendor: VendorEvaluation;
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
              <CardTitle className="text-lg text-slate-900">
                {vendor.vendor_name}
              </CardTitle>
              {getRecommendationBadge(vendor.recommendation)}
            </div>
            <CardDescription className="mt-1.5 text-slate-500">
              Overall Score:{' '}
              <span
                className={cn(
                  'font-bold',
                  getScoreTextColor(vendor.overall_score)
                )}
              >
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
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Compact dimension score bars */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DIMENSION_ORDER.map((dim) => {
            const ds = vendor.dimension_scores.find(
              (s) => s.dimension === dim
            );
            if (!ds) return null;
            return (
              <div key={dim} className="flex items-center gap-2">
                <span className="text-slate-400">
                  {DIMENSION_ICONS[dim]}
                </span>
                <span className="w-24 shrink-0 text-xs font-medium text-slate-600">
                  {DIMENSION_LABELS[dim]}
                </span>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-2 rounded-full',
                        getScoreColor(ds.score)
                      )}
                      style={{
                        width: `${(ds.score / ds.max_score) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span
                  className={cn(
                    'min-w-[2rem] text-right text-xs font-semibold',
                    getScoreTextColor(ds.score)
                  )}
                >
                  {ds.score}
                </span>
              </div>
            );
          })}
        </div>

        {/* Expandable detail section */}
        {expanded && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            {/* Strengths */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {vendor.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Weaknesses
              </h4>
              <ul className="space-y-1.5">
                {vendor.weaknesses.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* Red flags */}
            {vendor.red_flags.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Flag className="h-4 w-4 text-red-500" />
                  Red Flags
                </h4>
                <ul className="space-y-1.5">
                  {vendor.red_flags.map((rf, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-red-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      {rf}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed dimension notes */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                Dimension Notes
              </h4>
              <div className="space-y-2">
                {DIMENSION_ORDER.map((dim) => {
                  const ds = vendor.dimension_scores.find(
                    (s) => s.dimension === dim
                  );
                  if (!ds) return null;
                  return (
                    <div key={dim} className="rounded-lg bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-slate-500">
                          {DIMENSION_ICONS[dim]}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {DIMENSION_LABELS[dim]}
                        </span>
                        <span
                          className={cn(
                            'ml-auto text-xs font-bold',
                            getScoreTextColor(ds.score)
                          )}
                        >
                          {ds.score}/{ds.max_score}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600">
                        {ds.notes}
                      </p>
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

export default function VendorEvaluationPage(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<'comparison' | 'detail'>(
    'comparison'
  );

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vendor Evaluation Matrix
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive side-by-side evaluation of AI coding assistant vendors
            across security, compliance, capabilities, and cost dimensions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" />
            Executive Summary
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards vendors={DEMO_VENDORS} />

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
          <ComparisonTable vendors={DEMO_VENDORS} />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ScoreVisualization vendors={DEMO_VENDORS} />
            <TcoComparison vendors={DEMO_VENDORS} />
          </div>
        </div>
      )}

      {activeTab === 'detail' && (
        <div className="space-y-4">
          {DEMO_VENDORS.map((vendor) => (
            <VendorDetailCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                Evaluation Methodology
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Vendors are evaluated across 7 dimensions using a standardized
                scoring rubric. Scores are based on publicly available
                documentation, vendor interviews, hands-on testing, and
                third-party security assessments. Recommendations account for
                your organization&apos;s specific compliance requirements,
                existing infrastructure, and risk tolerance as captured in the
                governance assessment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
