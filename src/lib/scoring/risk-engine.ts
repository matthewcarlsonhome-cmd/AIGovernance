import type {
  RiskAssessmentSummary,
  RiskCategory,
  RiskClassification,
  RiskHeatMapCell,
  RiskTier,
} from '@/types';

/**
 * All seven risk categories in evaluation order.
 */
export const RISK_CATEGORIES: RiskCategory[] = [
  'model_algorithm',
  'operational',
  'ethical_fairness',
  'regulatory_compliance',
  'security_privacy',
  'strategic_business',
  'third_party',
];

/**
 * Human-readable display names for each risk category.
 */
export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  model_algorithm: 'Model & Algorithm',
  operational: 'Operational',
  ethical_fairness: 'Ethical & Fairness',
  regulatory_compliance: 'Regulatory & Compliance',
  security_privacy: 'Security & Privacy',
  strategic_business: 'Strategic & Business',
  third_party: 'Third Party',
} satisfies Record<RiskCategory, string>;

// ---------------------------------------------------------------------------
// Pure scoring functions
// ---------------------------------------------------------------------------

/**
 * Calculate the composite risk score for a single risk entry.
 *
 * Formula: score = likelihood * impact * (1 - controlEffectiveness)
 *
 * @param likelihood - Likelihood rating on a 1-5 scale.
 * @param impact - Impact rating on a 1-5 scale.
 * @param controlEffectiveness - Optional control effectiveness as a decimal
 *   between 0 and 1 (0 = no controls, 1 = fully mitigated). Defaults to 0.
 * @returns The composite risk score (range 0-25).
 */
export function calculateRiskScore(
  likelihood: number,
  impact: number,
  controlEffectiveness?: number
): number {
  const effectiveness = controlEffectiveness ?? 0;
  const clampedEffectiveness = Math.min(Math.max(effectiveness, 0), 1);
  const clampedLikelihood = Math.min(Math.max(likelihood, 1), 5);
  const clampedImpact = Math.min(Math.max(impact, 1), 5);

  const score = clampedLikelihood * clampedImpact * (1 - clampedEffectiveness);
  return Math.round(score * 100) / 100;
}

/**
 * Map a composite risk score to its corresponding risk tier.
 *
 * | Score Range | Tier     |
 * |------------|----------|
 * | 1-4        | low      |
 * | 5-9        | medium   |
 * | 10-15      | high     |
 * | 16-25      | critical |
 */
export function getRiskTier(score: number): RiskTier {
  if (score >= 16) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

/**
 * Build a 5x5 risk heat map matrix from a list of risk classifications.
 * Rows represent likelihood (index 0 = likelihood 1, index 4 = likelihood 5).
 * Columns represent impact (index 0 = impact 1, index 4 = impact 5).
 *
 * Each cell contains the raw score, the risk tier rating, and a list of
 * risk descriptions that fall into that cell.
 *
 * @param risks - Array of risk classifications to plot on the heat map.
 * @returns A 5x5 matrix of RiskHeatMapCell objects.
 */
export function buildHeatMap(risks: RiskClassification[]): RiskHeatMapCell[][] {
  // Initialize the 5x5 matrix
  const matrix: RiskHeatMapCell[][] = [];

  for (let row = 0; row < 5; row++) {
    const rowCells: RiskHeatMapCell[] = [];
    for (let col = 0; col < 5; col++) {
      const likelihood = row + 1;
      const impact = col + 1;
      const score = likelihood * impact;
      rowCells.push({
        likelihood,
        impact,
        score,
        rating: getRiskTier(score),
        risks: [],
      });
    }
    matrix.push(rowCells);
  }

  // Place each risk into its corresponding cell
  for (const risk of risks) {
    const rowIdx = Math.min(Math.max(risk.likelihood, 1), 5) - 1;
    const colIdx = Math.min(Math.max(risk.impact, 1), 5) - 1;
    matrix[rowIdx][colIdx].risks.push(risk.description);
  }

  return matrix;
}

/**
 * Produce a comprehensive summary of all risk classifications.
 *
 * The summary includes:
 * - Total risk count
 * - Counts by risk tier (critical, high, medium, low)
 * - Counts by risk category
 * - A 5x5 heat map matrix
 * - The top 5 risks sorted by raw score (likelihood * impact) descending
 *
 * @param risks - Array of risk classifications to summarize.
 * @returns A RiskAssessmentSummary object.
 */
export function summarizeRisks(
  risks: RiskClassification[]
): RiskAssessmentSummary {
  // Count by tier
  const byTier: Record<RiskTier, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const risk of risks) {
    const score = risk.likelihood * risk.impact;
    const tier = getRiskTier(score);
    byTier[tier]++;
  }

  // Count by category
  const byCategory: Record<RiskCategory, number> = {
    model_algorithm: 0,
    operational: 0,
    ethical_fairness: 0,
    regulatory_compliance: 0,
    security_privacy: 0,
    strategic_business: 0,
    third_party: 0,
  };

  for (const risk of risks) {
    const cat = risk.category as RiskCategory;
    if (cat in byCategory) {
      byCategory[cat]++;
    }
  }

  // Build heat map
  const heatMap = buildHeatMap(risks);

  // Top 5 risks sorted by raw score descending
  const sorted = [...risks].sort(
    (a, b) => b.likelihood * b.impact - a.likelihood * a.impact
  );
  const topRisks = sorted.slice(0, 5);

  return {
    total_risks: risks.length,
    by_tier: byTier,
    by_category: byCategory,
    heat_map: heatMap,
    top_risks: topRisks,
  };
}
