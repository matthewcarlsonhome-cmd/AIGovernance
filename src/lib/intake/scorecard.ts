// Pilot Intake Scorecard (Design Doc v3 §5.1A)
// 10-question intake to determine business viability + risk tier.
// Outputs: recommended path (Fast Track / Standard / High-Risk).

import type { PilotIntakeQuestion, PilotIntakeResponse, PilotIntakeResult, IntakeRiskPath } from '@/types';

export const INTAKE_QUESTIONS: PilotIntakeQuestion[] = [
  {
    id: 'intake-1',
    question: 'What type of data will the AI system process?',
    options: [
      { label: 'Public/non-sensitive data only', value: 'public', score: 10 },
      { label: 'Internal business data', value: 'internal', score: 7 },
      { label: 'Confidential customer data', value: 'confidential', score: 3 },
      { label: 'Restricted/regulated data (PII, PHI, financial)', value: 'restricted', score: 1 },
    ],
    weight: 1.5,
  },
  {
    id: 'intake-2',
    question: 'What is the primary use case for this AI pilot?',
    options: [
      { label: 'Code generation / developer tooling', value: 'code_gen', score: 9 },
      { label: 'Document drafting / content creation', value: 'document', score: 8 },
      { label: 'Data analysis / reporting', value: 'analysis', score: 7 },
      { label: 'Customer-facing automation', value: 'customer_facing', score: 4 },
    ],
    weight: 1.0,
  },
  {
    id: 'intake-3',
    question: 'How many users will participate in the pilot?',
    options: [
      { label: '1-5 users', value: 'small', score: 10 },
      { label: '6-20 users', value: 'medium', score: 7 },
      { label: '21-50 users', value: 'large', score: 5 },
      { label: '50+ users', value: 'enterprise', score: 3 },
    ],
    weight: 0.8,
  },
  {
    id: 'intake-4',
    question: 'Does your organization have existing AI governance policies?',
    options: [
      { label: 'Yes, comprehensive and enforced', value: 'comprehensive', score: 10 },
      { label: 'Yes, but in draft or partial', value: 'partial', score: 6 },
      { label: 'No, but we have general IT policies', value: 'it_only', score: 4 },
      { label: 'No governance policies exist', value: 'none', score: 1 },
    ],
    weight: 1.2,
  },
  {
    id: 'intake-5',
    question: 'What is the expected duration of the pilot?',
    options: [
      { label: '2-4 weeks', value: 'short', score: 9 },
      { label: '1-2 months', value: 'medium', score: 7 },
      { label: '3-6 months', value: 'long', score: 5 },
      { label: '6+ months', value: 'extended', score: 3 },
    ],
    weight: 0.8,
  },
  {
    id: 'intake-6',
    question: 'Does the pilot involve cross-border data transfers?',
    options: [
      { label: 'No, data stays within one jurisdiction', value: 'none', score: 10 },
      { label: 'Yes, within same regulatory framework (e.g., EU-EU)', value: 'same_framework', score: 7 },
      { label: 'Yes, across different regulatory frameworks', value: 'cross_framework', score: 3 },
      { label: 'Unknown', value: 'unknown', score: 2 },
    ],
    weight: 1.3,
  },
  {
    id: 'intake-7',
    question: 'What level of executive sponsorship exists?',
    options: [
      { label: 'C-level sponsor actively engaged', value: 'c_level', score: 10 },
      { label: 'VP-level sponsor assigned', value: 'vp_level', score: 8 },
      { label: 'Director-level sponsor', value: 'director', score: 5 },
      { label: 'No executive sponsor yet', value: 'none', score: 2 },
    ],
    weight: 1.0,
  },
  {
    id: 'intake-8',
    question: 'Are there defined success criteria and KPIs?',
    options: [
      { label: 'Yes, quantitative KPIs with baselines', value: 'quantitative', score: 10 },
      { label: 'Yes, qualitative goals defined', value: 'qualitative', score: 7 },
      { label: 'Partially defined', value: 'partial', score: 4 },
      { label: 'No success criteria defined', value: 'none', score: 1 },
    ],
    weight: 1.0,
  },
  {
    id: 'intake-9',
    question: 'What is the current security control maturity?',
    options: [
      { label: 'SOC 2 / ISO 27001 certified', value: 'certified', score: 10 },
      { label: 'Security program in place, not certified', value: 'program', score: 7 },
      { label: 'Basic security controls only', value: 'basic', score: 4 },
      { label: 'Minimal security infrastructure', value: 'minimal', score: 1 },
    ],
    weight: 1.2,
  },
  {
    id: 'intake-10',
    question: 'Will AI outputs be directly used in production decisions?',
    options: [
      { label: 'No, human review required for all outputs', value: 'human_review', score: 10 },
      { label: 'Some outputs reviewed, some automated', value: 'mixed', score: 6 },
      { label: 'Most outputs automated with spot checks', value: 'mostly_auto', score: 3 },
      { label: 'Fully automated, no human review', value: 'fully_auto', score: 1 },
    ],
    weight: 1.2,
  },
];

export function scoreIntake(responses: PilotIntakeResponse[]): PilotIntakeResult {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const response of responses) {
    const question = INTAKE_QUESTIONS.find((q) => q.id === response.question_id);
    if (!question) continue;
    totalWeightedScore += response.score * question.weight;
    totalWeight += question.weight * 10; // Max score per question is 10
  }

  const normalizedScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
  const riskPath = classifyRiskPath(normalizedScore);
  const recommendedActions = generateIntakeRecommendations(riskPath, responses);

  return {
    id: crypto.randomUUID(),
    project_id: '',
    responses,
    total_score: normalizedScore,
    max_score: 100,
    risk_path: riskPath,
    recommended_actions: recommendedActions,
    created_at: new Date().toISOString(),
  };
}

function classifyRiskPath(score: number): IntakeRiskPath {
  if (score >= 75) return 'fast_track';
  if (score >= 45) return 'standard';
  return 'high_risk';
}

function generateIntakeRecommendations(path: IntakeRiskPath, responses: PilotIntakeResponse[]): string[] {
  const recommendations: string[] = [];

  if (path === 'fast_track') {
    recommendations.push('Eligible for accelerated governance path (2-week target)');
    recommendations.push('Streamlined gate reviews — design review + launch review only');
    recommendations.push('Standard security controls sufficient');
  } else if (path === 'standard') {
    recommendations.push('Full governance workflow required (4-6 week target)');
    recommendations.push('All four governance gates must be completed');
    recommendations.push('Enhanced security review with evidence documentation');

    const dataResponse = responses.find((r) => r.question_id === 'intake-1');
    if (dataResponse && dataResponse.score <= 3) {
      recommendations.push('Data classification review required before data approval gate');
    }

    const policyResponse = responses.find((r) => r.question_id === 'intake-4');
    if (policyResponse && policyResponse.score <= 4) {
      recommendations.push('Governance policy drafting should begin immediately');
    }
  } else {
    recommendations.push('High-risk path: extended governance review (8-12 week target)');
    recommendations.push('All governance gates required with additional evidence');
    recommendations.push('Executive steering committee review mandatory');
    recommendations.push('Legal and compliance teams must be engaged from day one');
    recommendations.push('Consider phased rollout with smaller scope first');

    const crossBorderResponse = responses.find((r) => r.question_id === 'intake-6');
    if (crossBorderResponse && crossBorderResponse.score <= 3) {
      recommendations.push('Cross-border data transfer impact assessment required');
    }
  }

  return recommendations;
}

export function generateDemoIntakeResult(projectId: string): PilotIntakeResult {
  return scoreIntake([
    { question_id: 'intake-1', selected_value: 'internal', score: 7 },
    { question_id: 'intake-2', selected_value: 'code_gen', score: 9 },
    { question_id: 'intake-3', selected_value: 'medium', score: 7 },
    { question_id: 'intake-4', selected_value: 'partial', score: 6 },
    { question_id: 'intake-5', selected_value: 'medium', score: 7 },
    { question_id: 'intake-6', selected_value: 'none', score: 10 },
    { question_id: 'intake-7', selected_value: 'vp_level', score: 8 },
    { question_id: 'intake-8', selected_value: 'quantitative', score: 10 },
    { question_id: 'intake-9', selected_value: 'program', score: 7 },
    { question_id: 'intake-10', selected_value: 'human_review', score: 10 },
  ]);
}
