import type { FeasibilityScore, DomainScore, Project } from '@/types';

export interface ReadinessReportData {
  project: Pick<Project, 'name' | 'organization_id' | 'status'>;
  score: FeasibilityScore;
  generatedAt: string;
  preparedBy: string;
  clientOrg: string;
}

export function generateReadinessReportContent(data: ReadinessReportData): ReportContent {
  const { project, score, generatedAt, preparedBy, clientOrg } = data;

  return {
    title: 'AI Readiness Assessment Report',
    subtitle: project.name,
    metadata: {
      preparedFor: clientOrg,
      preparedBy,
      date: generatedAt,
      confidentiality: 'CONFIDENTIAL',
    },
    sections: [
      {
        title: 'Executive Summary',
        content: generateExecutiveSummary(score),
      },
      {
        title: 'Overall Feasibility Score',
        content: generateOverallScore(score),
      },
      {
        title: 'Domain Analysis',
        subsections: score.domain_scores.map(ds => ({
          title: formatDomainName(ds.domain),
          content: generateDomainSection(ds),
        })),
      },
      {
        title: 'Top Recommendations',
        content: generateRecommendations(score.recommendations),
      },
      {
        title: 'Remediation Roadmap',
        content: generateRemediation(score.remediation_tasks),
      },
      {
        title: 'Next Steps',
        content: generateNextSteps(score),
      },
    ],
  };
}

function generateExecutiveSummary(score: FeasibilityScore): string {
  const rating = score.rating;
  const ratingText = {
    high: 'highly ready for AI coding agent adoption',
    moderate: 'moderately ready for AI coding agent adoption with some areas needing attention',
    conditional: 'conditionally ready, with significant gaps that must be addressed before proceeding',
    not_ready: 'not yet ready for AI coding agent adoption and requires substantial preparation',
  }[rating];

  const passedDomains = score.domain_scores.filter(d => d.passed).length;
  const totalDomains = score.domain_scores.length;

  return `Based on our comprehensive assessment across ${totalDomains} domains, your organization is ${ratingText}. ` +
    `The overall feasibility score is ${score.overall_score.toFixed(1)}%, with ${passedDomains} of ${totalDomains} domains meeting the minimum threshold. ` +
    `${score.recommendations.length} recommendations and ${score.remediation_tasks.length} remediation tasks have been identified.`;
}

function generateOverallScore(score: FeasibilityScore): string {
  return JSON.stringify({
    type: 'score_display',
    overall: score.overall_score,
    rating: score.rating,
    domains: score.domain_scores.map(d => ({
      name: formatDomainName(d.domain),
      score: d.percentage,
      passed: d.passed,
      threshold: d.passThreshold,
    })),
  });
}

function generateDomainSection(ds: DomainScore): string {
  const status = ds.passed ? 'PASS' : 'NEEDS ATTENTION';
  let text = `Score: ${ds.percentage.toFixed(1)}% (Threshold: ${ds.passThreshold}%) — ${status}\n\n`;

  if (ds.recommendations.length > 0) {
    text += 'Recommendations:\n';
    ds.recommendations.forEach((r, i) => { text += `${i + 1}. ${r}\n`; });
  }

  if (ds.remediation_tasks.length > 0) {
    text += '\nRemediation Tasks:\n';
    ds.remediation_tasks.forEach((t, i) => { text += `${i + 1}. ${t}\n`; });
  }

  return text;
}

function generateRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return 'No additional recommendations at this time.';
  return recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');
}

function generateRemediation(tasks: string[]): string {
  if (tasks.length === 0) return 'No remediation tasks required.';
  return tasks.map((t, i) => `${i + 1}. ${t}`).join('\n');
}

function generateNextSteps(score: FeasibilityScore): string {
  if (score.rating === 'high') {
    return 'Proceed to sandbox configuration and pilot planning. Schedule Gate 1 review within 2 weeks.';
  } else if (score.rating === 'moderate') {
    return 'Address the identified gaps in the remediation roadmap. Re-assess in 2-4 weeks. Target Gate 1 review within 4-6 weeks.';
  } else if (score.rating === 'conditional') {
    return 'Prioritize critical remediation tasks before proceeding. Establish a 30-60 day improvement plan. Schedule follow-up assessment.';
  }
  return 'Significant preparation needed. Recommend a dedicated readiness improvement initiative before re-assessment in 60-90 days.';
}

function formatDomainName(domain: string): string {
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

export interface ReportContent {
  title: string;
  subtitle: string;
  metadata: {
    preparedFor: string;
    preparedBy: string;
    date: string;
    confidentiality: string;
  };
  sections: ContentSection[];
}

export interface ContentSection {
  title: string;
  content?: string;
  subsections?: ContentSection[];
}
