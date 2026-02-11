import type {
  PriorityDimension,
  PortfolioQuadrant,
  UseCaseDimensionScore,
  UseCasePriority,
} from '@/types';

/**
 * Use Case Prioritization Engine
 *
 * Pure functions for scoring, classifying, and ranking AI use cases across
 * four prioritization dimensions.  All functions are side-effect free and
 * operate solely on the types defined in `@/types`.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * All prioritization dimensions in evaluation order.
 */
export const PRIORITY_DIMENSIONS: PriorityDimension[] = [
  'strategic_value',
  'technical_feasibility',
  'implementation_risk',
  'time_to_value',
];

/**
 * Dimension weights used in composite score calculation.
 * Weights must sum to 1.0.
 */
export const PRIORITY_DIMENSION_WEIGHTS: Record<PriorityDimension, number> = {
  strategic_value: 0.40,
  technical_feasibility: 0.25,
  implementation_risk: 0.20,
  time_to_value: 0.15,
} satisfies Record<PriorityDimension, number>;

/**
 * Human-readable labels for each prioritization dimension.
 */
export const PRIORITY_DIMENSION_LABELS: Record<PriorityDimension, string> = {
  strategic_value: 'Strategic Value',
  technical_feasibility: 'Technical Feasibility',
  implementation_risk: 'Implementation Risk',
  time_to_value: 'Time to Value',
} satisfies Record<PriorityDimension, string>;

/**
 * Human-readable labels for each portfolio quadrant.
 */
export const QUADRANT_LABELS: Record<PortfolioQuadrant, string> = {
  strategic_imperative: 'Strategic Imperative',
  high_value: 'High-Value Opportunity',
  foundation_builder: 'Foundation Builder',
  watch_list: 'Watch List',
} satisfies Record<PortfolioQuadrant, string>;

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Calculate a weighted composite score from individual dimension scores.
 *
 * Each dimension score is expected to be on a 0-10 scale.  The composite
 * result is also on a 0-10 scale.
 *
 * @param scores - Array of UseCaseDimensionScore objects (one per dimension).
 * @returns A number in the range 0-10.
 */
export function calculateCompositeScore(scores: UseCaseDimensionScore[]): number {
  if (scores.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const entry of scores) {
    const weight = PRIORITY_DIMENSION_WEIGHTS[entry.dimension];
    if (weight === undefined) continue;

    // Clamp individual scores to 0-10
    const clamped = Math.min(Math.max(entry.score, 0), 10);

    weightedSum += clamped * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;

  // Normalise in case not all dimensions are present
  const raw = weightedSum / totalWeight;
  return Math.round(raw * 100) / 100;
}

// ---------------------------------------------------------------------------
// Quadrant Classification
// ---------------------------------------------------------------------------

/**
 * Map a composite score (0-10) to a portfolio quadrant.
 *
 * - >= 8.0  -> strategic_imperative
 * - >= 6.5  -> high_value
 * - >= 5.0  -> foundation_builder
 * - <  5.0  -> watch_list
 */
export function getQuadrant(score: number): PortfolioQuadrant {
  if (score >= 8.0) return 'strategic_imperative';
  if (score >= 6.5) return 'high_value';
  if (score >= 5.0) return 'foundation_builder';
  return 'watch_list';
}

// ---------------------------------------------------------------------------
// Implementation Wave
// ---------------------------------------------------------------------------

/**
 * Determine the implementation wave (rollout phase) for a use case based on
 * its composite score.
 *
 * - >= 7.0  -> Wave 1 (immediate priority)
 * - >= 5.0  -> Wave 2 (near-term)
 * - <  5.0  -> Wave 3 (future consideration)
 */
export function getImplementationWave(score: number): 1 | 2 | 3 {
  if (score >= 7.0) return 1;
  if (score >= 5.0) return 2;
  return 3;
}

// ---------------------------------------------------------------------------
// Prioritization
// ---------------------------------------------------------------------------

/**
 * Prioritise an array of use cases by computing composite scores, assigning
 * quadrants and implementation waves, then returning the list sorted by
 * composite_score descending (highest priority first).
 *
 * This function returns a new array — the original is not mutated.
 *
 * @param cases - Array of UseCasePriority objects.
 * @returns A new sorted array with `composite_score`, `quadrant`, and
 *          `implementation_wave` populated.
 */
export function prioritizeUseCases(cases: UseCasePriority[]): UseCasePriority[] {
  return cases
    .map((useCase) => {
      const composite_score = calculateCompositeScore(useCase.dimension_scores);
      const quadrant = getQuadrant(composite_score);
      const implementation_wave = getImplementationWave(composite_score);
      return { ...useCase, composite_score, quadrant, implementation_wave };
    })
    .sort((a, b) => b.composite_score - a.composite_score);
}
