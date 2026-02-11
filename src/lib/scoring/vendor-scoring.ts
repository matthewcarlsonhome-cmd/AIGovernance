import type { VendorDimension, VendorScore, VendorEvaluation } from '@/types';

/**
 * Vendor Evaluation Scoring Engine
 *
 * Pure functions for scoring and comparing AI tool vendors across seven
 * standardised dimensions.  All functions are side-effect free and operate
 * solely on the types defined in `@/types`.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * All vendor evaluation dimensions in display order.
 */
export const VENDOR_DIMENSIONS: VendorDimension[] = [
  'capabilities',
  'security',
  'compliance',
  'integration',
  'economics',
  'viability',
  'support',
];

/**
 * Dimension weights used in overall vendor score calculation.
 * Weights must sum to 1.0.
 */
export const VENDOR_DIMENSION_WEIGHTS: Record<VendorDimension, number> = {
  capabilities: 0.25,
  security: 0.25,
  compliance: 0.20,
  integration: 0.15,
  economics: 0.10,
  viability: 0.03,
  support: 0.02,
} satisfies Record<VendorDimension, number>;

/**
 * Human-readable labels for each vendor dimension.
 */
export const VENDOR_DIMENSION_LABELS: Record<VendorDimension, string> = {
  capabilities: 'Technical Capabilities',
  security: 'Security Posture',
  compliance: 'Compliance Coverage',
  integration: 'Integration Ease',
  economics: 'Cost & Economics',
  viability: 'Vendor Viability',
  support: 'Support Quality',
} satisfies Record<VendorDimension, string>;

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Calculate the weighted overall vendor score from individual dimension scores.
 *
 * Each dimension score is normalised to a 0-100 percentage (score / max_score * 100)
 * then multiplied by its weight.  The result is a 0-100 composite score.
 *
 * @param scores - Array of VendorScore objects (one per dimension).
 * @returns A number in the range 0-100.
 */
export function calculateVendorScore(scores: VendorScore[]): number {
  if (scores.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const entry of scores) {
    const weight = VENDOR_DIMENSION_WEIGHTS[entry.dimension];
    if (weight === undefined) continue;

    const percentage = entry.max_score > 0
      ? (entry.score / entry.max_score) * 100
      : 0;

    weightedSum += percentage * weight;
    totalWeight += weight;
  }

  // Normalise in case not all dimensions are present
  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Recommendation
// ---------------------------------------------------------------------------

/**
 * Map an overall vendor score (0-100) to a recommendation tier.
 *
 * - >= 70  -> recommended
 * - >= 50  -> alternative
 * - <  50  -> not_recommended
 */
export function getVendorRecommendation(
  score: number
): 'recommended' | 'alternative' | 'not_recommended' {
  if (score >= 70) return 'recommended';
  if (score >= 50) return 'alternative';
  return 'not_recommended';
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

/**
 * Compare an array of vendor evaluations by computing overall scores,
 * assigning recommendation tiers, and returning the list sorted by
 * overall_score descending (best first).
 *
 * This function returns a new array — the original is not mutated.
 *
 * @param vendors - Array of VendorEvaluation objects.
 * @returns A new sorted array with `overall_score` and `recommendation` populated.
 */
export function compareVendors(vendors: VendorEvaluation[]): VendorEvaluation[] {
  return vendors
    .map((vendor) => {
      const overall_score = calculateVendorScore(vendor.dimension_scores);
      const recommendation = getVendorRecommendation(overall_score);
      return { ...vendor, overall_score, recommendation };
    })
    .sort((a, b) => b.overall_score - a.overall_score);
}
