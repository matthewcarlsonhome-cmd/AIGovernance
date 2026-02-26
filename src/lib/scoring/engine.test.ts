import { describe, it, expect } from 'vitest';
import type {
  AssessmentQuestion,
  AssessmentResponse,
  ScoreDomain,
  DomainScore,
} from '@/types';
import {
  scoreResponse,
  calculateDomainScore,
  calculateFeasibilityScore,
  getOverallRating,
  generateRecommendations,
  generateRemediationTasks,
  DOMAIN_WEIGHTS,
  PASS_THRESHOLDS,
  DOMAINS,
} from './engine';

// ---------------------------------------------------------------------------
// Helpers: build test questions and responses
// ---------------------------------------------------------------------------

function makeQuestion(overrides: Partial<AssessmentQuestion> = {}): AssessmentQuestion {
  return {
    id: 'q-1',
    section: 'Test Section',
    domain: 'infrastructure' as ScoreDomain,
    text: 'Test question?',
    type: 'single_select',
    options: ['yes', 'no'],
    weight: 10,
    scoring: { yes: 100, no: 0 },
    branches: null,
    help_text: null,
    required: true,
    order: 1,
    ...overrides,
  };
}

function makeResponse(overrides: Partial<AssessmentResponse> = {}): AssessmentResponse {
  return {
    id: 'r-1',
    project_id: 'proj-1',
    question_id: 'q-1',
    value: 'yes',
    responded_by: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('Scoring Engine Constants', () => {
  it('DOMAIN_WEIGHTS should sum to 1.0', () => {
    const sum = Object.values(DOMAIN_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0);
  });

  it('DOMAINS should contain all 5 domains', () => {
    expect(DOMAINS).toHaveLength(5);
    expect(DOMAINS).toContain('infrastructure');
    expect(DOMAINS).toContain('security');
    expect(DOMAINS).toContain('governance');
    expect(DOMAINS).toContain('engineering');
    expect(DOMAINS).toContain('business');
  });

  it('PASS_THRESHOLDS should have entries for all domains', () => {
    for (const domain of DOMAINS) {
      expect(PASS_THRESHOLDS[domain]).toBeDefined();
      expect(PASS_THRESHOLDS[domain]).toBeGreaterThan(0);
      expect(PASS_THRESHOLDS[domain]).toBeLessThanOrEqual(100);
    }
  });

  it('Infrastructure and Security have higher weights (0.25 each)', () => {
    expect(DOMAIN_WEIGHTS.infrastructure).toBe(0.25);
    expect(DOMAIN_WEIGHTS.security).toBe(0.25);
  });

  it('Engineering and Business have lower weights (0.15 each)', () => {
    expect(DOMAIN_WEIGHTS.engineering).toBe(0.15);
    expect(DOMAIN_WEIGHTS.business).toBe(0.15);
  });
});

// ---------------------------------------------------------------------------
// scoreResponse
// ---------------------------------------------------------------------------

describe('scoreResponse', () => {
  it('should return 0 when response is undefined', () => {
    const q = makeQuestion();
    expect(scoreResponse(q, undefined)).toBe(0);
  });

  it('should score a single_select string response using scoring map', () => {
    const q = makeQuestion({ weight: 10, scoring: { yes: 100, no: 0 } });
    const rYes = makeResponse({ value: 'yes' });
    expect(scoreResponse(q, rYes)).toBe(10); // (100/100)*10

    const rNo = makeResponse({ value: 'no' });
    expect(scoreResponse(q, rNo)).toBe(0); // (0/100)*10
  });

  it('should score a partial value correctly', () => {
    const q = makeQuestion({ weight: 10, scoring: { partial: 50 } });
    const r = makeResponse({ value: 'partial' });
    expect(scoreResponse(q, r)).toBe(5); // (50/100)*10
  });

  it('should score multi-select responses as average', () => {
    const q = makeQuestion({
      weight: 10,
      scoring: { a: 100, b: 50, c: 0 },
      type: 'multi_select',
    });
    const r = makeResponse({ value: ['a', 'b'] });
    // avg = (100+50)/2 = 75 => (75/100)*10 = 7.5
    expect(scoreResponse(q, r)).toBe(7.5);
  });

  it('should return 0 for empty multi-select', () => {
    const q = makeQuestion({
      weight: 10,
      scoring: { a: 100 },
      type: 'multi_select',
    });
    const r = makeResponse({ value: [] });
    expect(scoreResponse(q, r)).toBe(0);
  });

  it('should score numeric values directly (clamped 0-100)', () => {
    const q = makeQuestion({ weight: 10, scoring: null });
    const r = makeResponse({ value: 75 });
    expect(scoreResponse(q, r)).toBe(7.5); // (75/100)*10
  });

  it('should clamp numeric values to 0-100 range', () => {
    const q = makeQuestion({ weight: 10, scoring: null });

    const rHigh = makeResponse({ value: 150 });
    expect(scoreResponse(q, rHigh)).toBe(10); // clamped to 100 => (100/100)*10

    const rLow = makeResponse({ value: -20 });
    expect(scoreResponse(q, rLow)).toBe(0); // clamped to 0 => (0/100)*10
  });

  it('should return 0 for text responses without scoring map', () => {
    const q = makeQuestion({ scoring: null, type: 'text' });
    const r = makeResponse({ value: 'some text answer' });
    expect(scoreResponse(q, r)).toBe(0);
  });

  it('should return 0 for unknown scoring key', () => {
    const q = makeQuestion({ scoring: { yes: 100, no: 0 } });
    const r = makeResponse({ value: 'unknown_key' });
    expect(scoreResponse(q, r)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateDomainScore
// ---------------------------------------------------------------------------

describe('calculateDomainScore', () => {
  it('should return zero score when no questions exist for the domain', () => {
    const result = calculateDomainScore('business', [], []);
    expect(result.domain).toBe('business');
    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.recommendations).toEqual([]);
    expect(result.remediation_tasks).toEqual([]);
  });

  it('should calculate 100% when all questions answered perfectly', () => {
    const questions: AssessmentQuestion[] = [
      makeQuestion({ id: 'q-1', domain: 'infrastructure', weight: 10, scoring: { yes: 100 } }),
      makeQuestion({ id: 'q-2', domain: 'infrastructure', weight: 10, scoring: { yes: 100 } }),
    ];
    const responses: AssessmentResponse[] = [
      makeResponse({ question_id: 'q-1', value: 'yes' }),
      makeResponse({ id: 'r-2', question_id: 'q-2', value: 'yes' }),
    ];

    const result = calculateDomainScore('infrastructure', responses, questions);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(20);
    expect(result.maxScore).toBe(20);
  });

  it('should calculate 0% when all questions answered with lowest score', () => {
    const questions: AssessmentQuestion[] = [
      makeQuestion({ id: 'q-1', domain: 'security', weight: 10, scoring: { no: 0 } }),
    ];
    const responses: AssessmentResponse[] = [
      makeResponse({ question_id: 'q-1', value: 'no' }),
    ];

    const result = calculateDomainScore('security', responses, questions);
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('should handle missing responses (unanswered questions)', () => {
    const questions: AssessmentQuestion[] = [
      makeQuestion({ id: 'q-1', domain: 'governance', weight: 10, scoring: { yes: 100 } }),
      makeQuestion({ id: 'q-2', domain: 'governance', weight: 10, scoring: { yes: 100 } }),
    ];
    // Only answer one of two questions
    const responses: AssessmentResponse[] = [
      makeResponse({ question_id: 'q-1', value: 'yes' }),
    ];

    const result = calculateDomainScore('governance', responses, questions);
    expect(result.percentage).toBe(50);
    expect(result.maxScore).toBe(20);
  });

  it('should correctly mark domain as passed when percentage >= threshold', () => {
    const questions: AssessmentQuestion[] = [
      makeQuestion({ id: 'q-1', domain: 'engineering', weight: 10, scoring: { ok: 50 } }),
    ];
    const responses: AssessmentResponse[] = [
      makeResponse({ question_id: 'q-1', value: 'ok' }),
    ];

    const result = calculateDomainScore('engineering', responses, questions);
    // percentage = 50%, PASS_THRESHOLDS.engineering = 50
    expect(result.percentage).toBe(50);
    expect(result.passed).toBe(true);
  });

  it('should correctly mark domain as failed when percentage < threshold', () => {
    const questions: AssessmentQuestion[] = [
      makeQuestion({ id: 'q-1', domain: 'infrastructure', weight: 10, scoring: { low: 30 } }),
    ];
    const responses: AssessmentResponse[] = [
      makeResponse({ question_id: 'q-1', value: 'low' }),
    ];

    const result = calculateDomainScore('infrastructure', responses, questions);
    // percentage = 30%, PASS_THRESHOLDS.infrastructure = 60
    expect(result.percentage).toBe(30);
    expect(result.passed).toBe(false);
  });

  it('should generate recommendations based on score percentage', () => {
    const questions: AssessmentQuestion[] = [
      makeQuestion({ id: 'q-1', domain: 'business', weight: 10, scoring: { low: 10 } }),
    ];
    const responses: AssessmentResponse[] = [
      makeResponse({ question_id: 'q-1', value: 'low' }),
    ];

    const result = calculateDomainScore('business', responses, questions);
    expect(result.percentage).toBe(10);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.remediation_tasks.length).toBeGreaterThan(0);
  });

  it('should ignore questions from other domains', () => {
    const questions: AssessmentQuestion[] = [
      makeQuestion({ id: 'q-1', domain: 'infrastructure', weight: 10 }),
      makeQuestion({ id: 'q-2', domain: 'security', weight: 10 }),
    ];
    const responses: AssessmentResponse[] = [
      makeResponse({ question_id: 'q-1', value: 'yes' }),
      makeResponse({ id: 'r-2', question_id: 'q-2', value: 'yes' }),
    ];

    const infraResult = calculateDomainScore('infrastructure', responses, questions);
    expect(infraResult.maxScore).toBe(10); // Only 1 infrastructure question
  });
});

// ---------------------------------------------------------------------------
// calculateFeasibilityScore
// ---------------------------------------------------------------------------

describe('calculateFeasibilityScore', () => {
  it('should return all zeros when no questions/responses exist', () => {
    const result = calculateFeasibilityScore([], []);
    expect(result.overall_score).toBe(0);
    expect(result.rating).toBe('not_ready');
    expect(result.domain_scores).toHaveLength(5);
    for (const ds of result.domain_scores) {
      expect(ds.percentage).toBe(0);
      expect(ds.passed).toBe(false);
    }
  });

  it('should return 100 when all domains score 100%', () => {
    const questions: AssessmentQuestion[] = DOMAINS.map((domain, i) =>
      makeQuestion({
        id: `q-${i}`,
        domain,
        weight: 10,
        scoring: { perfect: 100 },
      }),
    );
    const responses: AssessmentResponse[] = DOMAINS.map((_, i) =>
      makeResponse({
        id: `r-${i}`,
        question_id: `q-${i}`,
        value: 'perfect',
      }),
    );

    const result = calculateFeasibilityScore(responses, questions);
    expect(result.overall_score).toBe(100);
    expect(result.rating).toBe('high');
    for (const ds of result.domain_scores) {
      expect(ds.percentage).toBe(100);
      expect(ds.passed).toBe(true);
    }
  });

  it('should apply domain weights correctly to overall score', () => {
    // Give infrastructure 100% and everything else 0%
    const questions: AssessmentQuestion[] = [
      makeQuestion({ id: 'q-infra', domain: 'infrastructure', weight: 10, scoring: { yes: 100 } }),
      makeQuestion({ id: 'q-sec', domain: 'security', weight: 10, scoring: { no: 0 } }),
      makeQuestion({ id: 'q-gov', domain: 'governance', weight: 10, scoring: { no: 0 } }),
      makeQuestion({ id: 'q-eng', domain: 'engineering', weight: 10, scoring: { no: 0 } }),
      makeQuestion({ id: 'q-biz', domain: 'business', weight: 10, scoring: { no: 0 } }),
    ];
    const responses: AssessmentResponse[] = [
      makeResponse({ id: 'r-1', question_id: 'q-infra', value: 'yes' }),
      makeResponse({ id: 'r-2', question_id: 'q-sec', value: 'no' }),
      makeResponse({ id: 'r-3', question_id: 'q-gov', value: 'no' }),
      makeResponse({ id: 'r-4', question_id: 'q-eng', value: 'no' }),
      makeResponse({ id: 'r-5', question_id: 'q-biz', value: 'no' }),
    ];

    const result = calculateFeasibilityScore(responses, questions);
    // Only infrastructure contributes: 100 * 0.25 = 25
    expect(result.overall_score).toBe(25);
  });

  it('should produce domain_scores array of length 5', () => {
    const result = calculateFeasibilityScore([], []);
    expect(result.domain_scores).toHaveLength(5);
    const domainNames = result.domain_scores.map((d) => d.domain);
    expect(domainNames).toEqual(DOMAINS);
  });

  it('should include recommendations and remediation tasks', () => {
    const result = calculateFeasibilityScore([], []);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(Array.isArray(result.remediation_tasks)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getOverallRating
// ---------------------------------------------------------------------------

describe('getOverallRating', () => {
  it('should return "high" for scores >= 80', () => {
    expect(getOverallRating(80)).toBe('high');
    expect(getOverallRating(100)).toBe('high');
    expect(getOverallRating(95)).toBe('high');
  });

  it('should return "moderate" for scores 60-79', () => {
    expect(getOverallRating(60)).toBe('moderate');
    expect(getOverallRating(79)).toBe('moderate');
    expect(getOverallRating(70)).toBe('moderate');
  });

  it('should return "conditional" for scores 40-59', () => {
    expect(getOverallRating(40)).toBe('conditional');
    expect(getOverallRating(59)).toBe('conditional');
    expect(getOverallRating(50)).toBe('conditional');
  });

  it('should return "not_ready" for scores < 40', () => {
    expect(getOverallRating(0)).toBe('not_ready');
    expect(getOverallRating(39)).toBe('not_ready');
    expect(getOverallRating(20)).toBe('not_ready');
  });
});

// ---------------------------------------------------------------------------
// generateRecommendations
// ---------------------------------------------------------------------------

describe('generateRecommendations', () => {
  it('should deduplicate recommendations', () => {
    const domainScores: DomainScore[] = [
      {
        domain: 'infrastructure',
        score: 0,
        maxScore: 10,
        percentage: 10,
        passThreshold: 60,
        passed: false,
        recommendations: ['Fix A', 'Fix B'],
        remediation_tasks: [],
      },
      {
        domain: 'security',
        score: 0,
        maxScore: 10,
        percentage: 10,
        passThreshold: 60,
        passed: false,
        recommendations: ['Fix A', 'Fix C'], // 'Fix A' duplicated
        remediation_tasks: [],
      },
    ];

    const recs = generateRecommendations(domainScores);
    const fixACount = recs.filter((r) => r === 'Fix A').length;
    expect(fixACount).toBe(1);
  });

  it('should sort by weakest domains first', () => {
    const domainScores: DomainScore[] = [
      {
        domain: 'infrastructure',
        score: 8,
        maxScore: 10,
        percentage: 80,
        passThreshold: 60,
        passed: true,
        recommendations: ['Strong infra'],
        remediation_tasks: [],
      },
      {
        domain: 'security',
        score: 2,
        maxScore: 10,
        percentage: 20,
        passThreshold: 60,
        passed: false,
        recommendations: ['Weak security'],
        remediation_tasks: [],
      },
    ];

    const recs = generateRecommendations(domainScores);
    expect(recs[0]).toBe('Weak security');
  });

  it('should return empty array when no recommendations exist', () => {
    const domainScores: DomainScore[] = [
      {
        domain: 'infrastructure',
        score: 10,
        maxScore: 10,
        percentage: 100,
        passThreshold: 60,
        passed: true,
        recommendations: [],
        remediation_tasks: [],
      },
    ];

    const recs = generateRecommendations(domainScores);
    expect(recs).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// generateRemediationTasks
// ---------------------------------------------------------------------------

describe('generateRemediationTasks', () => {
  it('should deduplicate remediation tasks', () => {
    const domainScores: DomainScore[] = [
      {
        domain: 'infrastructure',
        score: 0,
        maxScore: 10,
        percentage: 10,
        passThreshold: 60,
        passed: false,
        recommendations: [],
        remediation_tasks: ['Task A', 'Task B'],
      },
      {
        domain: 'security',
        score: 0,
        maxScore: 10,
        percentage: 10,
        passThreshold: 60,
        passed: false,
        recommendations: [],
        remediation_tasks: ['Task A', 'Task C'],
      },
    ];

    const tasks = generateRemediationTasks(domainScores);
    const taskACount = tasks.filter((t) => t === 'Task A').length;
    expect(taskACount).toBe(1);
  });

  it('should return empty array for high-scoring domains', () => {
    const domainScores: DomainScore[] = [
      {
        domain: 'infrastructure',
        score: 10,
        maxScore: 10,
        percentage: 100,
        passThreshold: 60,
        passed: true,
        recommendations: [],
        remediation_tasks: [],
      },
    ];

    const tasks = generateRemediationTasks(domainScores);
    expect(tasks).toEqual([]);
  });
});
