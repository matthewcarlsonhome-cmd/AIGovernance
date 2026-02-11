import type {
  DataReadinessDimension,
  DataReadinessLevel,
  DataReadinessDimensionScore,
  DataQualityMetric,
  DataAsset,
  DataReadinessAudit,
} from '@/types';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * All six data readiness dimensions in evaluation order.
 */
export const READINESS_DIMENSIONS: DataReadinessDimension[] = [
  'availability',
  'quality',
  'accessibility',
  'governance',
  'security',
  'operations',
];

/**
 * Weights for each dimension in the overall readiness calculation.
 * Sum = 1.0 (100%).
 */
export const DIMENSION_WEIGHTS: Record<DataReadinessDimension, number> = {
  availability: 0.25,
  quality: 0.25,
  accessibility: 0.20,
  governance: 0.15,
  security: 0.10,
  operations: 0.05,
} satisfies Record<DataReadinessDimension, number>;

/**
 * Human-readable labels for each readiness level.
 */
export const READINESS_LEVEL_LABELS: Record<DataReadinessLevel, string> = {
  optimized: 'Optimized',
  managed: 'Managed',
  defined: 'Defined',
  developing: 'Developing',
  initial: 'Initial',
} satisfies Record<DataReadinessLevel, string>;

/**
 * Human-readable labels for each readiness dimension.
 */
export const DIMENSION_LABELS: Record<DataReadinessDimension, string> = {
  availability: 'Availability',
  quality: 'Quality',
  accessibility: 'Accessibility',
  governance: 'Governance',
  security: 'Security',
  operations: 'Operations',
} satisfies Record<DataReadinessDimension, string>;

/**
 * The six quality dimensions evaluated in data quality audits.
 */
export const QUALITY_DIMENSIONS: Array<DataQualityMetric['dimension']> = [
  'accuracy',
  'completeness',
  'consistency',
  'timeliness',
  'validity',
  'uniqueness',
];

/**
 * Human-readable labels for each quality dimension.
 */
export const QUALITY_DIMENSION_LABELS: Record<DataQualityMetric['dimension'], string> = {
  accuracy: 'Accuracy',
  completeness: 'Completeness',
  consistency: 'Consistency',
  timeliness: 'Timeliness',
  validity: 'Validity',
  uniqueness: 'Uniqueness',
} satisfies Record<DataQualityMetric['dimension'], string>;

/* -------------------------------------------------------------------------- */
/*  Remediation templates per dimension                                        */
/* -------------------------------------------------------------------------- */

const REMEDIATION_TEMPLATES: Record<
  DataReadinessDimension,
  { quick_wins: string[]; foundation: string[]; advanced: string[] }
> = {
  availability: {
    quick_wins: [
      'Catalog existing data sources and document current availability SLAs',
      'Identify and resolve stale or orphaned data connections',
    ],
    foundation: [
      'Implement automated data availability monitoring with alerting',
      'Establish redundant data pipelines for critical AI training datasets',
    ],
    advanced: [
      'Deploy multi-region data replication for high-availability AI workloads',
      'Implement predictive availability monitoring using anomaly detection',
    ],
  },
  quality: {
    quick_wins: [
      'Run data profiling on top-priority datasets to quantify quality baseline',
      'Fix known null-value and duplicate issues in critical tables',
    ],
    foundation: [
      'Implement automated data quality checks in ETL/ELT pipelines',
      'Establish data quality scorecards with dimension-level tracking',
    ],
    advanced: [
      'Deploy ML-based anomaly detection for continuous quality monitoring',
      'Implement data quality feedback loops from AI model performance metrics',
    ],
  },
  accessibility: {
    quick_wins: [
      'Document data access request procedures and current approval workflows',
      'Create a shared data catalog with search and discovery capabilities',
    ],
    foundation: [
      'Implement self-service data access with role-based permissions',
      'Deploy a unified data API layer for standardized programmatic access',
    ],
    advanced: [
      'Build a feature store for ML-ready data serving at low latency',
      'Implement data mesh patterns with domain-owned data products',
    ],
  },
  governance: {
    quick_wins: [
      'Assign data owners for all datasets used in AI initiatives',
      'Document data classification levels and handling requirements',
    ],
    foundation: [
      'Implement data lineage tracking across the AI data pipeline',
      'Establish a data governance council with defined charter and cadence',
    ],
    advanced: [
      'Deploy automated policy enforcement for data usage compliance',
      'Implement consent management and purpose limitation tracking',
    ],
  },
  security: {
    quick_wins: [
      'Audit current encryption-at-rest and in-transit for AI data stores',
      'Review and tighten access controls on sensitive training data',
    ],
    foundation: [
      'Implement column-level encryption for PII in AI training datasets',
      'Deploy data masking and tokenization for non-production environments',
    ],
    advanced: [
      'Implement differential privacy techniques for AI model training',
      'Deploy confidential computing for sensitive AI inference workloads',
    ],
  },
  operations: {
    quick_wins: [
      'Document current data pipeline schedules and failure handling procedures',
      'Set up basic monitoring dashboards for data pipeline health',
    ],
    foundation: [
      'Implement DataOps practices with CI/CD for data pipeline deployments',
      'Establish SLAs for data freshness tied to AI model retraining schedules',
    ],
    advanced: [
      'Deploy automated data pipeline orchestration with self-healing capabilities',
      'Implement cost optimization for data storage and compute resources',
    ],
  },
} satisfies Record<DataReadinessDimension, { quick_wins: string[]; foundation: string[]; advanced: string[] }>;

/* -------------------------------------------------------------------------- */
/*  Pure scoring functions                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Normalize a raw score for a given dimension to the 0-100 scale.
 *
 * Clamps the result to [0, 100] after rounding.
 *
 * @param _dimension - The dimension being scored (reserved for future
 *   dimension-specific normalization curves).
 * @param rawScore - The raw score value (assumed 0-100 input range).
 * @returns A normalized integer score between 0 and 100.
 */
export function calculateDimensionScore(
  _dimension: DataReadinessDimension,
  rawScore: number
): number {
  const clamped = Math.max(0, Math.min(100, rawScore));
  return Math.round(clamped);
}

/**
 * Calculate the weighted overall readiness score from individual dimension scores.
 *
 * Uses the configured DIMENSION_WEIGHTS for each dimension. If a dimension is
 * missing from the input array, its weight is redistributed proportionally
 * among the present dimensions.
 *
 * @param dimensionScores - Array of dimension score objects.
 * @returns A weighted average score between 0 and 100.
 */
export function calculateOverallReadiness(
  dimensionScores: DataReadinessDimensionScore[]
): number {
  if (dimensionScores.length === 0) {
    return 0;
  }

  // Sum the weights of dimensions that are present
  const totalWeight = dimensionScores.reduce(
    (sum, ds) => sum + (DIMENSION_WEIGHTS[ds.dimension] ?? 0),
    0
  );

  if (totalWeight === 0) {
    return 0;
  }

  // Weighted sum, normalized by the total present weight
  const weightedSum = dimensionScores.reduce((sum, ds) => {
    const weight = DIMENSION_WEIGHTS[ds.dimension] ?? 0;
    return sum + ds.score * (weight / totalWeight);
  }, 0);

  return Math.round(weightedSum);
}

/**
 * Classify a numeric readiness score (0-100) into a qualitative readiness level.
 *
 * | Score Range | Level       |
 * |-------------|-------------|
 * | 85-100      | Optimized   |
 * | 70-84       | Managed     |
 * | 55-69       | Defined     |
 * | 40-54       | Developing  |
 * | 0-39        | Initial     |
 *
 * @param score - A numeric score between 0 and 100.
 * @returns The corresponding DataReadinessLevel.
 */
export function classifyReadinessLevel(score: number): DataReadinessLevel {
  if (score >= 85) return 'optimized';
  if (score >= 70) return 'managed';
  if (score >= 55) return 'defined';
  if (score >= 40) return 'developing';
  return 'initial';
}

/**
 * Calculate the average quality score from an array of quality metrics.
 *
 * Computes the arithmetic mean of all metric scores. Returns 0 if the array
 * is empty.
 *
 * @param metrics - Array of data quality metric measurements.
 * @returns The average quality score between 0 and 100.
 */
export function calculateDataQuality(metrics: DataQualityMetric[]): number {
  if (metrics.length === 0) {
    return 0;
  }

  const sum = metrics.reduce((acc, metric) => acc + metric.score, 0);
  return Math.round(sum / metrics.length);
}

/**
 * Generate a phased remediation roadmap based on dimension scores.
 *
 * Dimensions scoring below thresholds receive remediation items organized
 * into three phases:
 * - **quick_wins** — Immediate actions (0-4 weeks) for dimensions < 70
 * - **foundation** — Medium-term improvements (1-3 months) for dimensions < 60
 * - **advanced** — Strategic enhancements (3-6 months) for dimensions < 50
 *
 * Items are deduplicated and sorted by the weakest dimensions first.
 *
 * @param dimensionScores - Array of dimension score objects.
 * @returns An array of roadmap phases with action items.
 */
export function generateRemediationRoadmap(
  dimensionScores: DataReadinessDimensionScore[]
): DataReadinessAudit['remediation_roadmap'] {
  const quickWins: string[] = [];
  const foundation: string[] = [];
  const advanced: string[] = [];

  // Sort by score ascending so the weakest dimensions contribute first
  const sorted = [...dimensionScores].sort((a, b) => a.score - b.score);

  for (const ds of sorted) {
    const templates = REMEDIATION_TEMPLATES[ds.dimension];
    if (!templates) continue;

    // Dimensions below 70 get quick wins
    if (ds.score < 70) {
      for (const item of templates.quick_wins) {
        if (!quickWins.includes(item)) {
          quickWins.push(item);
        }
      }
    }

    // Dimensions below 60 get foundation items
    if (ds.score < 60) {
      for (const item of templates.foundation) {
        if (!foundation.includes(item)) {
          foundation.push(item);
        }
      }
    }

    // Dimensions below 50 get advanced items
    if (ds.score < 50) {
      for (const item of templates.advanced) {
        if (!advanced.includes(item)) {
          advanced.push(item);
        }
      }
    }
  }

  return [
    { phase: 'quick_wins', items: quickWins },
    { phase: 'foundation', items: foundation },
    { phase: 'advanced', items: advanced },
  ];
}
