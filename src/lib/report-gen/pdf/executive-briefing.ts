import type { FeasibilityScore, RoiResults, RiskClassification, Project } from '@/types';
import type { ReportContent, ContentSection } from './readiness-report';

export interface ExecutiveBriefingData {
  project: Pick<Project, 'name' | 'status'>;
  score: FeasibilityScore;
  roi?: RoiResults;
  topRisks: RiskClassification[];
  timelineSummary: { phase: string; weeks: number; status: string }[];
  generatedAt: string;
  preparedBy: string;
  clientOrg: string;
}

export function generateExecutiveBriefingContent(data: ExecutiveBriefingData): ReportContent {
  const { project, score, roi, topRisks, timelineSummary, generatedAt, preparedBy, clientOrg } = data;

  return {
    title: 'Executive Briefing',
    subtitle: `AI Coding Agent Adoption — ${project.name}`,
    metadata: {
      preparedFor: clientOrg,
      preparedBy,
      date: generatedAt,
      confidentiality: 'CONFIDENTIAL — EXECUTIVE DISTRIBUTION ONLY',
    },
    sections: [
      generateSlide1(score),
      generateSlide2(score),
      generateSlide3(topRisks),
      generateSlide4(roi, timelineSummary),
      generateSlide5(score, roi),
    ],
  };
}

function generateSlide1(score: FeasibilityScore): ContentSection {
  const ratingLabel = {
    high: 'HIGH READINESS',
    moderate: 'MODERATE READINESS',
    conditional: 'CONDITIONAL',
    not_ready: 'NOT READY',
  }[score.rating];

  return {
    title: 'Slide 1: Feasibility Score',
    content: JSON.stringify({
      type: 'slide',
      layout: 'score_hero',
      score: score.overall_score,
      rating: ratingLabel,
      passedDomains: score.domain_scores.filter(d => d.passed).length,
      totalDomains: score.domain_scores.length,
      talkingPoints: [
        `Overall score: ${score.overall_score.toFixed(1)}% — rated ${ratingLabel}`,
        `${score.domain_scores.filter(d => d.passed).length} of ${score.domain_scores.length} domains meet minimum thresholds`,
        score.rating === 'high' || score.rating === 'moderate'
          ? 'Organization is positioned to proceed with controlled pilot'
          : 'Key gaps need to be addressed before proceeding',
      ],
    }),
  };
}

function generateSlide2(score: FeasibilityScore): ContentSection {
  return {
    title: 'Slide 2: Domain Gap Analysis',
    content: JSON.stringify({
      type: 'slide',
      layout: 'domain_bars',
      domains: score.domain_scores.map(d => ({
        name: d.domain.charAt(0).toUpperCase() + d.domain.slice(1),
        score: d.percentage,
        threshold: d.passThreshold,
        passed: d.passed,
        topGap: d.recommendations[0] || 'No gaps identified',
      })),
      talkingPoints: [
        `Strongest domain: ${getBestDomain(score)}`,
        `Weakest domain: ${getWeakestDomain(score)}`,
        `${score.recommendations.length} total recommendations across all domains`,
      ],
    }),
  };
}

function generateSlide3(risks: RiskClassification[]): ContentSection {
  const criticalCount = risks.filter(r => r.tier === 'critical').length;
  const highCount = risks.filter(r => r.tier === 'high').length;

  return {
    title: 'Slide 3: Risk Heat Map',
    content: JSON.stringify({
      type: 'slide',
      layout: 'risk_heatmap',
      risks: risks.slice(0, 10).map(r => ({
        category: r.category,
        tier: r.tier,
        likelihood: r.likelihood,
        impact: r.impact,
        mitigation: r.mitigation,
      })),
      summary: { critical: criticalCount, high: highCount, total: risks.length },
      talkingPoints: [
        `${criticalCount} critical and ${highCount} high-priority risks identified`,
        risks.length > 0
          ? `Top risk: ${risks[0].category} — ${risks[0].description.substring(0, 100)}`
          : 'No critical risks identified',
        'All risks have documented mitigation strategies',
      ],
    }),
  };
}

function generateSlide4(roi: RoiResults | undefined, timeline: { phase: string; weeks: number; status: string }[]): ContentSection {
  return {
    title: 'Slide 4: Timeline & ROI',
    content: JSON.stringify({
      type: 'slide',
      layout: 'timeline_roi',
      timeline,
      roi: roi ? {
        annualSavings: roi.annual_savings,
        totalCost: roi.total_annual_cost,
        netBenefit: roi.net_annual_benefit,
        paybackMonths: roi.payback_months,
        threeYearNpv: roi.three_year_npv,
        roiPercent: roi.roi_percentage,
      } : null,
      talkingPoints: [
        `Total implementation timeline: ${timeline.reduce((sum, t) => sum + t.weeks, 0)} weeks`,
        roi ? `Projected annual savings: $${(roi.annual_savings / 1000).toFixed(0)}K` : 'ROI analysis pending',
        roi ? `Payback period: ${roi.payback_months} months` : '',
      ].filter(Boolean),
    }),
  };
}

function generateSlide5(score: FeasibilityScore, roi?: RoiResults): ContentSection {
  const recommendation = score.rating === 'high' || score.rating === 'moderate' ? 'GO' : 'CONDITIONAL';
  const conditions = score.domain_scores
    .filter(d => !d.passed)
    .map(d => `${d.domain.charAt(0).toUpperCase() + d.domain.slice(1)} domain must reach ${d.passThreshold}% threshold`);

  return {
    title: 'Slide 5: Go/No-Go Recommendation',
    content: JSON.stringify({
      type: 'slide',
      layout: 'recommendation',
      recommendation,
      conditions,
      nextSteps: [
        score.rating === 'high' ? 'Proceed to sandbox configuration immediately' : 'Address critical gaps within 30 days',
        'Schedule Gate 1 review',
        'Begin pilot team selection',
        roi ? `Secure budget approval for $${(roi.total_annual_cost / 1000).toFixed(0)}K annual investment` : 'Complete ROI analysis',
      ],
      talkingPoints: [
        `Recommendation: ${recommendation} — with ${conditions.length} conditions`,
        'Conditions must be met before Gate 1 approval',
        'Pilot scope: 1-2 teams, 4-week evaluation period',
      ],
    }),
  };
}

function getBestDomain(score: FeasibilityScore): string {
  const best = [...score.domain_scores].sort((a, b) => b.percentage - a.percentage)[0];
  return `${best.domain.charAt(0).toUpperCase() + best.domain.slice(1)} (${best.percentage.toFixed(1)}%)`;
}

function getWeakestDomain(score: FeasibilityScore): string {
  const weakest = [...score.domain_scores].sort((a, b) => a.percentage - b.percentage)[0];
  return `${weakest.domain.charAt(0).toUpperCase() + weakest.domain.slice(1)} (${weakest.percentage.toFixed(1)}%)`;
}
