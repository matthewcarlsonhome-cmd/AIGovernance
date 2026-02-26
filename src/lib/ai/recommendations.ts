/**
 * AI Recommendations Engine
 *
 * Pure functions that generate structured prompts for the Claude API and parse
 * the responses into typed Recommendation objects.
 *
 * These functions are consumed by the `/api/ai/recommendations` route to
 * generate context-aware recommendations for remediation, policy drafting,
 * and risk mitigation.
 */

import type {
  AssessmentResponse,
  DomainScore,
  Recommendation,
  RiskItem,
} from '@/types';

// ---------------------------------------------------------------------------
// Prompt Builders
// ---------------------------------------------------------------------------

/**
 * Build a system prompt and user message for remediation recommendations
 * based on feasibility domain scores and assessment responses.
 *
 * @param scores    - Per-domain feasibility scores
 * @param responses - Raw assessment responses for additional context
 * @returns Combined prompt string with system instruction and user context
 */
export function generateRemediationRecommendations(
  scores: DomainScore[],
  responses: AssessmentResponse[],
): string {
  const systemInstruction = [
    'You are a Senior AI Governance Consultant specializing in enterprise AI readiness.',
    'Analyze the provided assessment scores and responses to generate actionable remediation recommendations.',
    '',
    'For each recommendation you MUST return a JSON array of objects with exactly these fields:',
    '- id: a unique kebab-case identifier (e.g., "rem-infra-001")',
    '- title: a concise action title (max 80 characters)',
    '- description: a detailed description of the remediation step (2-4 sentences)',
    '- priority: one of "critical", "high", "medium", "low"',
    '- category: the domain or area this addresses (e.g., "infrastructure", "security", "governance", "engineering", "business")',
    '- effort_estimate: one of "hours", "days", "weeks", "months"',
    '- impact: one of "high", "medium", "low"',
    '- status: always "pending"',
    '- rationale: why this recommendation matters in context of the scores',
    '',
    'Return ONLY a valid JSON array. No markdown, no code fences, no preamble.',
    'Order recommendations by priority (critical first) then by impact (high first).',
    'Generate between 3 and 8 recommendations focused on the weakest domains.',
  ].join('\n');

  const failingDomains = scores
    .filter((s) => !s.passed)
    .map((s) => `${s.domain}: ${s.percentage}% (threshold: ${s.passThreshold}%)`)
    .join('\n  ');

  const passingDomains = scores
    .filter((s) => s.passed)
    .map((s) => `${s.domain}: ${s.percentage}%`)
    .join('\n  ');

  const responseCount = responses.length;

  const userMessage = [
    '## Assessment Results',
    '',
    `Total assessment responses: ${responseCount}`,
    '',
    '### Failing Domains',
    failingDomains || '  (none)',
    '',
    '### Passing Domains',
    passingDomains || '  (none)',
    '',
    '### Domain Details',
    ...scores.map((s) => [
      `**${s.domain}** (${s.percentage}%):`,
      `  Existing recommendations: ${s.recommendations.join('; ') || 'none'}`,
      `  Existing remediation tasks: ${s.remediation_tasks.join('; ') || 'none'}`,
    ].join('\n')),
    '',
    'Generate AI-powered remediation recommendations that build upon the existing ones above.',
    'Focus on the most impactful actions that will move failing domains past their thresholds.',
  ].join('\n');

  return `${systemInstruction}\n\n---\n\n${userMessage}`;
}

/**
 * Build a prompt for policy content recommendations based on policy type
 * and optional industry context.
 *
 * @param policyType - The type of policy (e.g., "aup", "irp", "data_classification")
 * @param industry   - Optional industry for regulatory context
 * @returns Combined prompt string
 */
export function generatePolicyRecommendations(
  policyType: string,
  industry?: string,
): string {
  const policyLabels: Record<string, string> = {
    aup: 'Acceptable Use Policy for AI Coding Tools',
    irp: 'Incident Response Plan Addendum for AI Systems',
    data_classification: 'Data Classification Policy for AI Workloads',
    risk_framework: 'Risk Management Framework for AI Adoption',
  };

  const policyLabel = policyLabels[policyType] || policyType;

  const systemInstruction = [
    'You are a Senior AI Governance Policy Advisor with expertise in enterprise policy frameworks.',
    `Generate actionable recommendations for creating or improving a ${policyLabel}.`,
    '',
    'For each recommendation you MUST return a JSON array of objects with exactly these fields:',
    '- id: a unique kebab-case identifier (e.g., "pol-aup-001")',
    '- title: a concise recommendation title (max 80 characters)',
    '- description: detailed guidance on what the policy section should cover (2-4 sentences)',
    '- priority: one of "critical", "high", "medium", "low"',
    '- category: the policy area (e.g., "scope", "definitions", "requirements", "enforcement", "compliance")',
    '- effort_estimate: one of "hours", "days", "weeks", "months"',
    '- impact: one of "high", "medium", "low"',
    '- status: always "pending"',
    '- rationale: why this section or clause is important',
    '',
    'Return ONLY a valid JSON array. No markdown, no code fences, no preamble.',
    'Order recommendations by priority (critical first).',
    'Generate between 4 and 8 recommendations covering the essential sections of the policy.',
  ].join('\n');

  const industryContext = industry
    ? `Industry Context: ${industry}. Include industry-specific regulatory considerations (e.g., HIPAA for healthcare, SOX for financial services, FERPA for education).`
    : 'No specific industry context provided. Use general enterprise best practices.';

  const userMessage = [
    `## Policy Type: ${policyLabel}`,
    '',
    industryContext,
    '',
    'Generate recommendations for the key sections, clauses, and considerations',
    'that should be included in this policy. Each recommendation should represent',
    'a distinct policy element or improvement area.',
  ].join('\n');

  return `${systemInstruction}\n\n---\n\n${userMessage}`;
}

/**
 * Build a prompt for risk mitigation strategy recommendations.
 *
 * @param riskItems - Array of identified risks requiring mitigation strategies
 * @returns Combined prompt string
 */
export function generateRiskMitigations(riskItems: RiskItem[]): string {
  const systemInstruction = [
    'You are a Senior AI Risk Management Consultant with expertise in NIST AI RMF and ISO 31000.',
    'Analyze the provided risk items and generate targeted mitigation recommendations.',
    '',
    'For each recommendation you MUST return a JSON array of objects with exactly these fields:',
    '- id: a unique kebab-case identifier (e.g., "risk-mit-001")',
    '- title: a concise mitigation action title (max 80 characters)',
    '- description: detailed mitigation strategy (2-4 sentences)',
    '- priority: one of "critical", "high", "medium", "low" — should align with the risk tier',
    '- category: the risk category being addressed',
    '- effort_estimate: one of "hours", "days", "weeks", "months"',
    '- impact: one of "high", "medium", "low"',
    '- status: always "pending"',
    '- rationale: why this mitigation is effective for the specific risk',
    '',
    'Return ONLY a valid JSON array. No markdown, no code fences, no preamble.',
    'Order recommendations by priority (critical first).',
    'Generate 1-2 mitigation recommendations per risk item, up to 10 total.',
  ].join('\n');

  const riskSummary = riskItems
    .map(
      (r) =>
        `- [${r.tier.toUpperCase()}] ${r.category}: ${r.description} (likelihood: ${r.likelihood}/5, impact: ${r.impact}/5, current mitigation: ${r.mitigation || 'none'}, status: ${r.status})`,
    )
    .join('\n');

  const userMessage = [
    '## Risk Items Requiring Mitigation',
    '',
    `Total risks: ${riskItems.length}`,
    '',
    riskSummary,
    '',
    'For each risk, suggest specific, actionable mitigation strategies that go',
    'beyond the current mitigations already in place. Focus on reducing both',
    'likelihood and impact where possible.',
  ].join('\n');

  return `${systemInstruction}\n\n---\n\n${userMessage}`;
}

// ---------------------------------------------------------------------------
// Response Parser
// ---------------------------------------------------------------------------

/**
 * Parse a Claude API text response into typed Recommendation objects.
 *
 * The function handles common response quirks:
 * - Strips markdown code fences if present
 * - Validates required fields exist on each object
 * - Falls back to empty array on parse failure
 *
 * @param response - Raw text response from Claude
 * @returns Array of validated Recommendation objects
 */
export function parseRecommendationResponse(response: string): Recommendation[] {
  // Strip markdown code fences if the model included them
  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    // Remove opening fence (possibly with language tag)
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
    // Remove closing fence
    cleaned = cleaned.replace(/\n?```\s*$/, '');
  }

  // Attempt to extract JSON array from the response
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart === -1 || arrayEnd === -1 || arrayEnd <= arrayStart) {
    console.error('[recommendations] No JSON array found in response');
    return [];
  }

  const jsonStr = cleaned.slice(arrayStart, arrayEnd + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    console.error('[recommendations] Failed to parse JSON response:', err);
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.error('[recommendations] Parsed value is not an array');
    return [];
  }

  const VALID_PRIORITIES = new Set(['critical', 'high', 'medium', 'low']);
  const VALID_EFFORTS = new Set(['hours', 'days', 'weeks', 'months']);
  const VALID_IMPACTS = new Set(['high', 'medium', 'low']);
  const VALID_STATUSES = new Set(['pending', 'in_progress', 'completed', 'dismissed']);

  const recommendations: Recommendation[] = [];

  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue;

    const rec = item as Record<string, unknown>;

    // Validate required string fields
    if (
      typeof rec.id !== 'string' ||
      typeof rec.title !== 'string' ||
      typeof rec.description !== 'string' ||
      typeof rec.category !== 'string' ||
      typeof rec.rationale !== 'string'
    ) {
      continue;
    }

    const priority = typeof rec.priority === 'string' && VALID_PRIORITIES.has(rec.priority)
      ? (rec.priority as Recommendation['priority'])
      : 'medium';

    const effort_estimate = typeof rec.effort_estimate === 'string' && VALID_EFFORTS.has(rec.effort_estimate)
      ? (rec.effort_estimate as Recommendation['effort_estimate'])
      : 'days';

    const impact = typeof rec.impact === 'string' && VALID_IMPACTS.has(rec.impact)
      ? (rec.impact as Recommendation['impact'])
      : 'medium';

    const status = typeof rec.status === 'string' && VALID_STATUSES.has(rec.status)
      ? (rec.status as Recommendation['status'])
      : 'pending';

    recommendations.push({
      id: rec.id,
      title: rec.title,
      description: rec.description,
      priority,
      category: rec.category,
      effort_estimate,
      impact,
      status,
      rationale: rec.rationale,
    });
  }

  return recommendations;
}

// ---------------------------------------------------------------------------
// Demo / Sample Data
// ---------------------------------------------------------------------------

/**
 * Return sample recommendations for demo mode when the Anthropic API is not configured.
 * These cover a representative spread across types and priorities.
 */
export function getSampleRecommendations(type: string): Recommendation[] {
  const samplesByType: Record<string, Recommendation[]> = {
    remediation: [
      {
        id: 'rem-sec-001',
        title: 'Implement data classification for AI-accessible repositories',
        description:
          'Conduct a thorough data classification exercise across all code repositories and data stores that will be accessible to AI coding tools. Label each asset with its sensitivity level (public, internal, confidential, restricted) and enforce access controls accordingly.',
        priority: 'critical',
        category: 'security',
        effort_estimate: 'weeks',
        impact: 'high',
        status: 'pending',
        rationale:
          'The security domain scored below the passing threshold. Without proper data classification, AI tools may inadvertently access or transmit sensitive data, creating compliance and security risks.',
      },
      {
        id: 'rem-infra-001',
        title: 'Provision isolated sandbox environment with network segmentation',
        description:
          'Set up a dedicated VPC or virtual network segment for AI tool experimentation, with strict egress rules limiting outbound traffic to approved AI API endpoints only. Use infrastructure-as-code to ensure reproducibility.',
        priority: 'high',
        category: 'infrastructure',
        effort_estimate: 'days',
        impact: 'high',
        status: 'pending',
        rationale:
          'Infrastructure readiness is below the required threshold. An isolated sandbox prevents unintended interaction between AI workloads and production systems.',
      },
      {
        id: 'rem-gov-001',
        title: 'Draft and ratify Acceptable Use Policy for AI coding tools',
        description:
          'Create a comprehensive AUP that defines permitted uses, prohibited activities, data handling requirements, and consequences for policy violations. Route through legal review and obtain executive sign-off.',
        priority: 'high',
        category: 'governance',
        effort_estimate: 'weeks',
        impact: 'high',
        status: 'pending',
        rationale:
          'Governance frameworks require formal policies before AI tools can be deployed at scale. An AUP establishes the organizational guardrails for safe usage.',
      },
      {
        id: 'rem-eng-001',
        title: 'Establish baseline code quality metrics before AI tool pilot',
        description:
          'Measure current test coverage, cyclomatic complexity, defect density, and code review turnaround time across pilot repositories. These baselines will enable objective measurement of AI tool impact.',
        priority: 'medium',
        category: 'engineering',
        effort_estimate: 'days',
        impact: 'medium',
        status: 'pending',
        rationale:
          'Without baseline metrics, it will be impossible to objectively evaluate whether AI-assisted development improves or degrades code quality.',
      },
      {
        id: 'rem-bus-001',
        title: 'Secure executive sponsorship with defined success criteria',
        description:
          'Present the feasibility assessment results to executive leadership and obtain formal sponsorship with clearly defined success metrics, budget allocation, and a go/no-go decision timeline.',
        priority: 'medium',
        category: 'business',
        effort_estimate: 'days',
        impact: 'high',
        status: 'pending',
        rationale:
          'Business alignment ensures the AI adoption initiative has organizational support and accountability, which is critical for sustained momentum.',
      },
    ],
    policy: [
      {
        id: 'pol-scope-001',
        title: 'Define clear scope and applicability section',
        description:
          'Establish which teams, tools, environments, and data types are covered by this policy. Include explicit inclusion and exclusion criteria, and specify the approval process for exceptions.',
        priority: 'critical',
        category: 'scope',
        effort_estimate: 'hours',
        impact: 'high',
        status: 'pending',
        rationale:
          'A well-defined scope prevents ambiguity about who must comply and under what circumstances, reducing the risk of inconsistent enforcement.',
      },
      {
        id: 'pol-data-001',
        title: 'Include data handling and classification requirements',
        description:
          'Specify which data classification levels are permitted for use with AI tools, how data should be sanitized before AI processing, and the procedures for handling AI-generated outputs that may contain sensitive information.',
        priority: 'critical',
        category: 'requirements',
        effort_estimate: 'days',
        impact: 'high',
        status: 'pending',
        rationale:
          'Data handling is the highest-risk area in AI tool adoption. Clear classification requirements prevent data leakage and regulatory violations.',
      },
      {
        id: 'pol-enforce-001',
        title: 'Establish enforcement and violation response procedures',
        description:
          'Define the escalation path for policy violations, consequences for non-compliance, and the process for reporting suspected violations. Include both automated enforcement mechanisms and human review processes.',
        priority: 'high',
        category: 'enforcement',
        effort_estimate: 'days',
        impact: 'medium',
        status: 'pending',
        rationale:
          'Policies without enforcement mechanisms become aspirational documents. Clear consequences and processes ensure organizational compliance.',
      },
      {
        id: 'pol-review-001',
        title: 'Add policy review and update cadence',
        description:
          'Establish a quarterly review cycle for the policy, with triggers for ad-hoc reviews when new AI tools are adopted, regulatory changes occur, or security incidents are reported.',
        priority: 'medium',
        category: 'compliance',
        effort_estimate: 'hours',
        impact: 'medium',
        status: 'pending',
        rationale:
          'The AI landscape evolves rapidly. A regular review cadence ensures the policy remains current with technological and regulatory developments.',
      },
    ],
    risk: [
      {
        id: 'risk-mit-001',
        title: 'Deploy DLP controls for AI API traffic monitoring',
        description:
          'Implement Data Loss Prevention rules specifically targeting AI API endpoints to detect and block transmission of sensitive data patterns (PII, credentials, proprietary code) to external AI services.',
        priority: 'critical',
        category: 'security_privacy',
        effort_estimate: 'weeks',
        impact: 'high',
        status: 'pending',
        rationale:
          'DLP controls are the primary technical safeguard against data exfiltration through AI tools. Without them, sensitive data may be transmitted to third-party AI providers.',
      },
      {
        id: 'risk-mit-002',
        title: 'Implement prompt injection detection and filtering',
        description:
          'Deploy input validation and content filtering mechanisms to detect and neutralize prompt injection attempts in AI coding tool interactions. Include logging of flagged inputs for security review.',
        priority: 'high',
        category: 'prompt_injection',
        effort_estimate: 'weeks',
        impact: 'high',
        status: 'pending',
        rationale:
          'Prompt injection is a well-documented attack vector against AI systems. Proactive detection reduces the risk of AI tools being manipulated to produce harmful or unauthorized outputs.',
      },
      {
        id: 'risk-mit-003',
        title: 'Establish AI output review requirements for critical paths',
        description:
          'Require human review of all AI-generated code that touches authentication, authorization, data persistence, or external API integration modules. Implement automated checks in the CI pipeline to flag these areas.',
        priority: 'high',
        category: 'model_misuse',
        effort_estimate: 'days',
        impact: 'high',
        status: 'pending',
        rationale:
          'AI-generated code in security-critical paths carries elevated risk. Human oversight ensures that subtle vulnerabilities are caught before deployment.',
      },
      {
        id: 'risk-mit-004',
        title: 'Create vendor contingency plan for AI service disruptions',
        description:
          'Document fallback procedures for scenarios where the primary AI coding tool becomes unavailable, changes terms of service, or experiences a data breach. Include alternative tool evaluation and data portability steps.',
        priority: 'medium',
        category: 'third_party',
        effort_estimate: 'days',
        impact: 'medium',
        status: 'pending',
        rationale:
          'Vendor lock-in and service dependency are strategic risks. A contingency plan ensures business continuity if the AI tool provider relationship changes.',
      },
    ],
  };

  return samplesByType[type] ?? samplesByType.remediation;
}
