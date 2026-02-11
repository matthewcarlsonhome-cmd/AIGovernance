import type {
  MaturityDimension,
  MaturityDimensionScore,
  MaturityLevel,
  MaturitySubScores,
} from '@/types';

/**
 * All six governance maturity dimensions in evaluation order.
 */
export const MATURITY_DIMENSIONS: MaturityDimension[] = [
  'policy_standards',
  'risk_management',
  'data_governance',
  'access_controls',
  'vendor_management',
  'training_awareness',
];

/**
 * Human-readable labels for each maturity level (1-5).
 */
export const MATURITY_LEVEL_LABELS: Record<MaturityLevel, string> = {
  1: 'Ad Hoc',
  2: 'Developing',
  3: 'Defined',
  4: 'Managed',
  5: 'Optimized',
} satisfies Record<MaturityLevel, string>;

/**
 * Human-readable display names for each maturity dimension.
 */
export const MATURITY_DIMENSION_LABELS: Record<MaturityDimension, string> = {
  policy_standards: 'Policy & Standards',
  risk_management: 'Risk Management',
  data_governance: 'Data Governance',
  access_controls: 'Access Controls',
  vendor_management: 'Vendor Management',
  training_awareness: 'Training & Awareness',
} satisfies Record<MaturityDimension, string>;

// ---------------------------------------------------------------------------
// Recommendation templates per dimension (used for dimensions below level 3)
// ---------------------------------------------------------------------------

const DIMENSION_RECOMMENDATIONS: Record<MaturityDimension, string[]> = {
  policy_standards: [
    'Establish formal AI governance policies with clear ownership and review cadence',
    'Create an AI Acceptable Use Policy and circulate for stakeholder approval',
    'Define standards for AI-generated code review and acceptance criteria',
  ],
  risk_management: [
    'Implement a structured AI risk assessment framework aligned to NIST AI RMF',
    'Create a risk register specifically for AI/ML model risks and operational failures',
    'Establish risk escalation procedures and thresholds for AI-related incidents',
  ],
  data_governance: [
    'Classify all data assets that interact with AI systems by sensitivity level',
    'Implement data lineage tracking for AI training and inference data flows',
    'Define data retention and deletion policies for AI-processed information',
  ],
  access_controls: [
    'Implement role-based access controls for all AI tools and model endpoints',
    'Establish least-privilege access patterns for AI sandbox environments',
    'Deploy multi-factor authentication for AI platform administration',
  ],
  vendor_management: [
    'Develop a vendor assessment questionnaire specific to AI/ML service providers',
    'Review and negotiate data processing agreements with all AI tool vendors',
    'Establish contractual requirements for model transparency and audit rights',
  ],
  training_awareness: [
    'Develop an AI literacy training program for all employees handling AI tools',
    'Create role-specific training modules for developers using AI coding assistants',
    'Establish a recurring AI governance awareness campaign with measurable outcomes',
  ],
} satisfies Record<MaturityDimension, string[]>;

// ---------------------------------------------------------------------------
// Pure scoring functions
// ---------------------------------------------------------------------------

/**
 * Map a numeric score (0-100) to a maturity level (1-5).
 *
 * | Score Range | Level |
 * |------------|-------|
 * | 0-19       | 1     |
 * | 20-39      | 2     |
 * | 40-59      | 3     |
 * | 60-79      | 4     |
 * | 80-100     | 5     |
 */
export function calculateMaturityLevel(score: number): MaturityLevel {
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

/**
 * Calculate the aggregate score for a single maturity dimension from its five
 * subscores. Each subscore ranges from 0-20, giving a total range of 0-100.
 *
 * @param subscores - The five subscores (documentation, implementation,
 *   enforcement, measurement, improvement), each 0-20.
 * @returns An object containing the aggregate score (0-100) and the
 *   corresponding maturity level (1-5).
 */
export function calculateDimensionScore(
  subscores: MaturitySubScores
): { score: number; level: MaturityLevel } {
  const total =
    subscores.documentation +
    subscores.implementation +
    subscores.enforcement +
    subscores.measurement +
    subscores.improvement;

  // Average of 5 subscores, each on 0-20 scale, yields 0-100 total
  const score = Math.round(total);

  return {
    score,
    level: calculateMaturityLevel(score),
  };
}

/**
 * Calculate the overall maturity score from all dimension scores.
 * All dimensions are equally weighted (1/6 each).
 *
 * @param dimensions - Array of scored maturity dimensions.
 * @returns An object containing the weighted average score (0-100) and the
 *   corresponding maturity level (1-5).
 */
export function calculateOverallMaturity(
  dimensions: MaturityDimensionScore[]
): { score: number; level: MaturityLevel } {
  if (dimensions.length === 0) {
    return { score: 0, level: 1 };
  }

  const weight = 1 / dimensions.length;
  const weightedSum = dimensions.reduce(
    (acc, dim) => acc + dim.score * weight,
    0
  );

  const score = Math.round(weightedSum);

  return {
    score,
    level: calculateMaturityLevel(score),
  };
}

/**
 * Generate actionable recommendations for any maturity dimension that is
 * currently below level 3 ("Defined"). Dimensions at level 3 or above are
 * considered sufficiently mature and yield no recommendations.
 *
 * @param dimensions - Array of scored maturity dimensions.
 * @returns An array of recommendation strings, ordered by weakest dimension first.
 */
export function getMaturityRecommendations(
  dimensions: MaturityDimensionScore[]
): string[] {
  const recommendations: string[] = [];

  // Sort dimensions by score ascending so the weakest areas appear first
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);

  for (const dim of sorted) {
    if (dim.level < 3) {
      const dimRecs = DIMENSION_RECOMMENDATIONS[dim.dimension];
      for (const rec of dimRecs) {
        if (!recommendations.includes(rec)) {
          recommendations.push(rec);
        }
      }
    }
  }

  return recommendations;
}
