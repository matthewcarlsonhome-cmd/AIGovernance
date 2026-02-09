import type {
  AssessmentQuestion,
  AssessmentResponse,
  DomainScore,
  FeasibilityRating,
  FeasibilityScore,
  ScoreDomain,
} from '@/types';

/**
 * Domain weights used in overall feasibility score calculation.
 * Weights must sum to 1.0.
 */
export const DOMAIN_WEIGHTS: Record<ScoreDomain, number> = {
  infrastructure: 0.25,
  security: 0.25,
  governance: 0.20,
  engineering: 0.15,
  business: 0.15,
} satisfies Record<ScoreDomain, number>;

/**
 * Minimum passing percentage (0-100) per domain.
 * A domain is considered "passed" if its percentage meets or exceeds its threshold.
 */
export const PASS_THRESHOLDS: Record<ScoreDomain, number> = {
  infrastructure: 60,
  security: 60,
  governance: 50,
  engineering: 50,
  business: 50,
} satisfies Record<ScoreDomain, number>;

/**
 * All five scoring domains in display order.
 */
export const DOMAINS: ScoreDomain[] = [
  'infrastructure',
  'security',
  'governance',
  'engineering',
  'business',
];

// ---------------------------------------------------------------------------
// Pure helper: resolve the numeric score for a single response
// ---------------------------------------------------------------------------

function scoreResponse(
  question: AssessmentQuestion,
  response: AssessmentResponse | undefined
): number {
  if (!response) return 0;

  const { value } = response;
  const { scoring, weight } = question;

  // If the question has a scoring map, use it to derive a normalised 0-1 factor
  if (scoring && typeof value === 'string') {
    const rawScore = scoring[value];
    if (rawScore !== undefined) {
      // scoring values are assumed to be on a 0-100 scale
      return (rawScore / 100) * weight;
    }
  }

  // Multi-select: average of matched scoring values
  if (scoring && Array.isArray(value)) {
    if (value.length === 0) return 0;
    const total = value.reduce((sum, v) => {
      const s = scoring[v];
      return sum + (s !== undefined ? s : 0);
    }, 0);
    const avg = total / value.length;
    return (avg / 100) * weight;
  }

  // Numeric direct value (0-100 expected)
  if (typeof value === 'number') {
    return (Math.min(Math.max(value, 0), 100) / 100) * weight;
  }

  // Text responses without scoring maps are informational-only (score 0)
  return 0;
}

// ---------------------------------------------------------------------------
// Domain Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the score for a single domain.
 *
 * @param domain  - The domain to score
 * @param responses - All assessment responses for the project
 * @param questions - Full question bank
 * @returns A DomainScore object
 */
export function calculateDomainScore(
  domain: ScoreDomain,
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): DomainScore {
  const domainQuestions = questions.filter((q) => q.domain === domain);

  if (domainQuestions.length === 0) {
    return {
      domain,
      score: 0,
      maxScore: 0,
      percentage: 0,
      passThreshold: PASS_THRESHOLDS[domain],
      passed: false,
      recommendations: [],
      remediation_tasks: [],
    };
  }

  const responseMap = new Map(responses.map((r) => [r.question_id, r]));

  let totalScore = 0;
  let maxScore = 0;

  for (const question of domainQuestions) {
    const response = responseMap.get(question.id);
    totalScore += scoreResponse(question, response);
    maxScore += question.weight;
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    domain,
    score: Math.round(totalScore * 100) / 100,
    maxScore,
    percentage,
    passThreshold: PASS_THRESHOLDS[domain],
    passed: percentage >= PASS_THRESHOLDS[domain],
    recommendations: generateDomainRecommendations(domain, percentage),
    remediation_tasks: generateDomainRemediationTasks(domain, percentage),
  };
}

// ---------------------------------------------------------------------------
// Overall Feasibility Score
// ---------------------------------------------------------------------------

/**
 * Calculate the full feasibility score across all domains.
 *
 * @param responses - All assessment responses for the project
 * @param questions - Full question bank
 * @returns A FeasibilityScore object
 */
export function calculateFeasibilityScore(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): FeasibilityScore {
  const domainScores = DOMAINS.map((domain) =>
    calculateDomainScore(domain, responses, questions)
  );

  const overallScore = domainScores.reduce((acc, ds) => {
    return acc + ds.percentage * DOMAIN_WEIGHTS[ds.domain];
  }, 0);

  const roundedOverall = Math.round(overallScore);

  return {
    domain_scores: domainScores,
    overall_score: roundedOverall,
    rating: getOverallRating(roundedOverall),
    recommendations: generateRecommendations(domainScores),
    remediation_tasks: generateRemediationTasks(domainScores),
  };
}

// ---------------------------------------------------------------------------
// Rating
// ---------------------------------------------------------------------------

/**
 * Map an overall numeric score (0-100) to a human-readable rating.
 */
export function getOverallRating(score: number): FeasibilityRating {
  if (score >= 80) return 'high';
  if (score >= 60) return 'moderate';
  if (score >= 40) return 'conditional';
  return 'not_ready';
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

const DOMAIN_RECOMMENDATION_MAP: Record<ScoreDomain, { low: string[]; mid: string[]; high: string[] }> = {
  infrastructure: {
    low: [
      'Establish dedicated cloud environment with network segmentation before AI tool deployment',
      'Implement a forward proxy to control and audit AI model API traffic',
      'Adopt Infrastructure-as-Code practices for reproducible sandbox environments',
    ],
    mid: [
      'Strengthen network segmentation between AI sandbox and production systems',
      'Automate infrastructure provisioning to reduce configuration drift',
    ],
    high: [
      'Infrastructure is well-positioned; consider advanced observability for AI workloads',
    ],
  },
  security: {
    low: [
      'Perform a data classification exercise before introducing AI coding tools',
      'Deploy DLP controls to prevent sensitive data from reaching external AI models',
      'Establish an AI-specific incident response playbook',
      'Implement secrets management solution (e.g., HashiCorp Vault) for all credentials',
    ],
    mid: [
      'Enhance DLP rules to cover AI-specific data exfiltration vectors',
      'Integrate AI tool activity logs into existing SIEM platform',
    ],
    high: [
      'Security posture is strong; schedule periodic AI-focused penetration testing',
    ],
  },
  governance: {
    low: [
      'Draft and ratify an Acceptable Use Policy (AUP) for AI coding assistants',
      'Map AI tool usage to existing compliance frameworks (SOC 2, HIPAA, etc.)',
      'Establish a vendor risk assessment process for AI tool providers',
      'Create a formal change management process for AI tool rollout',
    ],
    mid: [
      'Formalize the three-gate review process for phased AI tool adoption',
      'Expand compliance mappings to cover AI-specific regulatory requirements',
    ],
    high: [
      'Governance framework is mature; consider publishing internal AI governance playbook',
    ],
  },
  engineering: {
    low: [
      'Establish baseline CI/CD pipelines before introducing AI-generated code',
      'Implement mandatory code review processes for all contributions',
      'Increase automated test coverage to at least 60% before AI tool pilots',
    ],
    mid: [
      'Add AI-specific linting rules and code quality gates to CI pipelines',
      'Train development teams on effective AI pair-programming practices',
    ],
    high: [
      'Engineering practices are solid; pilot AI tools with advanced use cases',
    ],
  },
  business: {
    low: [
      'Secure executive sponsorship with clear success metrics for AI adoption',
      'Define measurable business outcomes tied to AI tool deployment',
      'Allocate dedicated budget for AI tool licensing and infrastructure',
    ],
    mid: [
      'Refine ROI model with pilot data to strengthen the business case',
      'Develop a communication plan for broader organizational buy-in',
    ],
    high: [
      'Business alignment is strong; proceed with confidence to production rollout',
    ],
  },
};

function generateDomainRecommendations(domain: ScoreDomain, percentage: number): string[] {
  const bucket = DOMAIN_RECOMMENDATION_MAP[domain];
  if (percentage < 40) return bucket.low;
  if (percentage < 70) return bucket.mid;
  return bucket.high;
}

/**
 * Aggregate recommendations from all domains, prioritising failing domains.
 */
export function generateRecommendations(domainScores: DomainScore[]): string[] {
  const recommendations: string[] = [];

  // Sort domains by percentage ascending so the weakest areas appear first
  const sorted = [...domainScores].sort((a, b) => a.percentage - b.percentage);

  for (const ds of sorted) {
    for (const rec of ds.recommendations) {
      if (!recommendations.includes(rec)) {
        recommendations.push(rec);
      }
    }
  }

  return recommendations;
}

// ---------------------------------------------------------------------------
// Remediation Tasks
// ---------------------------------------------------------------------------

const DOMAIN_REMEDIATION_MAP: Record<ScoreDomain, { low: string[]; mid: string[]; high: string[] }> = {
  infrastructure: {
    low: [
      'Provision isolated VPC/VNet for AI sandbox environment',
      'Deploy forward proxy (e.g., Squid, Zscaler) with allowlist for AI API endpoints',
      'Set up package manager proxy (Artifactory/Nexus) for dependency control',
      'Create Terraform/Pulumi modules for repeatable sandbox deployment',
      'Configure network monitoring and traffic logging for sandbox egress',
    ],
    mid: [
      'Harden network segmentation rules between sandbox and corporate networks',
      'Implement automated drift detection for infrastructure configurations',
    ],
    high: [],
  },
  security: {
    low: [
      'Complete data classification for all repositories accessible to AI tools',
      'Deploy DLP agent on developer workstations with AI-specific rules',
      'Integrate AI tool audit logs into SIEM (Splunk/Sentinel/Datadog)',
      'Migrate all secrets to a centralized vault; rotate credentials',
      'Draft AI-specific incident response runbook and conduct tabletop exercise',
    ],
    mid: [
      'Configure automated alerts for anomalous AI API usage patterns',
      'Add content scanning for AI-generated code in pull request checks',
    ],
    high: [],
  },
  governance: {
    low: [
      'Draft Acceptable Use Policy for AI coding tools with legal review',
      'Create compliance control mapping spreadsheet for primary framework',
      'Establish AI vendor risk assessment questionnaire and scoring rubric',
      'Define three-gate review criteria with evidence checklists',
      'Set up policy version control and approval workflow',
    ],
    mid: [
      'Conduct gap analysis between current policies and AI tool requirements',
      'Schedule quarterly governance review cadence',
    ],
    high: [],
  },
  engineering: {
    low: [
      'Set up CI/CD pipeline with automated testing for pilot repositories',
      'Implement branch protection rules requiring code review approval',
      'Establish baseline code quality metrics (coverage, complexity, defect rate)',
      'Create developer onboarding guide for AI coding tool usage',
      'Configure pre-commit hooks for security scanning of AI-generated code',
    ],
    mid: [
      'Add AI attribution tracking to version control workflow',
      'Develop custom linting rules for common AI code generation patterns',
    ],
    high: [],
  },
  business: {
    low: [
      'Schedule executive briefing to secure formal sponsorship and budget approval',
      'Define 3-5 measurable KPIs for AI tool pilot evaluation',
      'Create preliminary ROI model with conservative productivity assumptions',
      'Identify 2-3 pilot teams with high readiness and willingness',
      'Develop stakeholder communication plan with role-specific messaging',
    ],
    mid: [
      'Refine ROI model with actual pilot metrics and expand business case',
      'Survey pilot participants for satisfaction and adoption feedback',
    ],
    high: [],
  },
};

function generateDomainRemediationTasks(domain: ScoreDomain, percentage: number): string[] {
  const bucket = DOMAIN_REMEDIATION_MAP[domain];
  if (percentage < 40) return bucket.low;
  if (percentage < 70) return bucket.mid;
  return bucket.high;
}

/**
 * Aggregate remediation tasks from all domains, prioritising failing domains.
 */
export function generateRemediationTasks(domainScores: DomainScore[]): string[] {
  const tasks: string[] = [];

  const sorted = [...domainScores].sort((a, b) => a.percentage - b.percentage);

  for (const ds of sorted) {
    for (const task of ds.remediation_tasks) {
      if (!tasks.includes(task)) {
        tasks.push(task);
      }
    }
  }

  return tasks;
}
