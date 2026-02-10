import { describe, it, expect } from 'vitest';
import {
  calculateFeasibilityScore,
  calculateDomainScore,
  getOverallRating,
  generateRecommendations,
  generateRemediationTasks,
  scoreResponse,
  DOMAIN_WEIGHTS,
  PASS_THRESHOLDS,
  DOMAINS,
} from '@/lib/scoring/engine';
import { ASSESSMENT_QUESTIONS } from '@/lib/scoring/questions';
import type { AssessmentQuestion, AssessmentResponse, DomainScore } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResponse(questionId: string, value: string | string[] | number): AssessmentResponse {
  return {
    id: `r-${questionId}`,
    project_id: 'test-project',
    question_id: questionId,
    value,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function makeBestResponses(questions: AssessmentQuestion[]): AssessmentResponse[] {
  return questions.map((q) => {
    if (q.scoring) {
      let bestOption = q.options?.[0] || '';
      let bestScore = -1;
      for (const [opt, s] of Object.entries(q.scoring)) {
        if (s > bestScore) {
          bestScore = s;
          bestOption = opt;
        }
      }
      return makeResponse(q.id, bestOption);
    }
    if (q.type === 'number') return makeResponse(q.id, 100);
    return makeResponse(q.id, q.options?.[0] || '');
  });
}

function makeWorstResponses(questions: AssessmentQuestion[]): AssessmentResponse[] {
  return questions.map((q) => {
    if (q.scoring) {
      let worstOption = q.options?.[0] || '';
      let worstScore = Infinity;
      for (const [opt, s] of Object.entries(q.scoring)) {
        if (s < worstScore) {
          worstScore = s;
          worstOption = opt;
        }
      }
      return makeResponse(q.id, worstOption);
    }
    if (q.type === 'number') return makeResponse(q.id, 0);
    return makeResponse(q.id, '');
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Scoring Engine - Extended', () => {
  describe('getOverallRating', () => {
    it('should return "high" for scores >= 80', () => {
      expect(getOverallRating(80)).toBe('high');
      expect(getOverallRating(95)).toBe('high');
      expect(getOverallRating(100)).toBe('high');
    });

    it('should return "moderate" for scores 60-79', () => {
      expect(getOverallRating(60)).toBe('moderate');
      expect(getOverallRating(70)).toBe('moderate');
      expect(getOverallRating(79)).toBe('moderate');
    });

    it('should return "conditional" for scores 40-59', () => {
      expect(getOverallRating(40)).toBe('conditional');
      expect(getOverallRating(50)).toBe('conditional');
      expect(getOverallRating(59)).toBe('conditional');
    });

    it('should return "not_ready" for scores < 40', () => {
      expect(getOverallRating(0)).toBe('not_ready');
      expect(getOverallRating(20)).toBe('not_ready');
      expect(getOverallRating(39)).toBe('not_ready');
    });

    it('should handle boundary values exactly', () => {
      expect(getOverallRating(40)).toBe('conditional');
      expect(getOverallRating(60)).toBe('moderate');
      expect(getOverallRating(80)).toBe('high');
    });
  });

  describe('calculateFeasibilityScore', () => {
    it('should return all required fields', () => {
      const result = calculateFeasibilityScore([], ASSESSMENT_QUESTIONS);
      expect(result).toHaveProperty('domain_scores');
      expect(result).toHaveProperty('overall_score');
      expect(result).toHaveProperty('rating');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('remediation_tasks');
    });

    it('should return 5 domain scores', () => {
      const result = calculateFeasibilityScore([], ASSESSMENT_QUESTIONS);
      expect(result.domain_scores).toHaveLength(5);
    });

    it('should return 0 overall score with no responses', () => {
      const result = calculateFeasibilityScore([], ASSESSMENT_QUESTIONS);
      expect(result.overall_score).toBe(0);
      expect(result.rating).toBe('not_ready');
    });

    it('should return high score with best responses', () => {
      const best = makeBestResponses(ASSESSMENT_QUESTIONS);
      const result = calculateFeasibilityScore(best, ASSESSMENT_QUESTIONS);
      expect(result.overall_score).toBeGreaterThanOrEqual(80);
      expect(result.rating).toBe('high');
    });

    it('should return low score with worst responses', () => {
      const worst = makeWorstResponses(ASSESSMENT_QUESTIONS);
      const result = calculateFeasibilityScore(worst, ASSESSMENT_QUESTIONS);
      expect(result.overall_score).toBeLessThan(40);
      expect(result.rating).toBe('not_ready');
    });

    it('should produce overall_score as weighted sum of domain percentages', () => {
      const best = makeBestResponses(ASSESSMENT_QUESTIONS);
      const result = calculateFeasibilityScore(best, ASSESSMENT_QUESTIONS);

      const manualOverall = result.domain_scores.reduce(
        (acc, ds) => acc + ds.percentage * DOMAIN_WEIGHTS[ds.domain],
        0,
      );
      expect(result.overall_score).toBe(Math.round(manualOverall));
    });

    it('should have domain scores between 0 and 100', () => {
      const best = makeBestResponses(ASSESSMENT_QUESTIONS);
      const result = calculateFeasibilityScore(best, ASSESSMENT_QUESTIONS);
      result.domain_scores.forEach((ds) => {
        expect(ds.percentage).toBeGreaterThanOrEqual(0);
        expect(ds.percentage).toBeLessThanOrEqual(100);
      });
    });

    it('should include recommendations when domains fail', () => {
      const result = calculateFeasibilityScore([], ASSESSMENT_QUESTIONS);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should include remediation tasks when domains fail', () => {
      const result = calculateFeasibilityScore([], ASSESSMENT_QUESTIONS);
      expect(result.remediation_tasks.length).toBeGreaterThan(0);
    });
  });

  describe('generateRecommendations', () => {
    it('should return empty array for empty input', () => {
      const result = generateRecommendations([]);
      expect(result).toEqual([]);
    });

    it('should aggregate recommendations from multiple domain scores', () => {
      const domainScores: DomainScore[] = DOMAINS.map((domain) => ({
        domain,
        score: 0,
        maxScore: 50,
        percentage: 20,
        passThreshold: PASS_THRESHOLDS[domain],
        passed: false,
        recommendations: [`${domain} recommendation`],
        remediation_tasks: [],
      }));
      const result = generateRecommendations(domainScores);
      expect(result).toHaveLength(5);
    });

    it('should deduplicate recommendations', () => {
      const domainScores: DomainScore[] = [
        {
          domain: 'infrastructure',
          score: 0,
          maxScore: 50,
          percentage: 20,
          passThreshold: 60,
          passed: false,
          recommendations: ['Fix networking'],
          remediation_tasks: [],
        },
        {
          domain: 'security',
          score: 0,
          maxScore: 50,
          percentage: 20,
          passThreshold: 60,
          passed: false,
          recommendations: ['Fix networking'],
          remediation_tasks: [],
        },
      ];
      const result = generateRecommendations(domainScores);
      expect(result).toHaveLength(1);
    });

    it('should sort with weakest domains first', () => {
      const domainScores: DomainScore[] = [
        {
          domain: 'infrastructure',
          score: 40,
          maxScore: 50,
          percentage: 80,
          passThreshold: 60,
          passed: true,
          recommendations: ['Strong infra rec'],
          remediation_tasks: [],
        },
        {
          domain: 'security',
          score: 10,
          maxScore: 50,
          percentage: 20,
          passThreshold: 60,
          passed: false,
          recommendations: ['Weak security rec'],
          remediation_tasks: [],
        },
      ];
      const result = generateRecommendations(domainScores);
      expect(result[0]).toBe('Weak security rec');
    });
  });

  describe('generateRemediationTasks', () => {
    it('should return empty array for empty input', () => {
      const result = generateRemediationTasks([]);
      expect(result).toEqual([]);
    });

    it('should aggregate tasks from multiple domain scores', () => {
      const domainScores: DomainScore[] = DOMAINS.map((domain) => ({
        domain,
        score: 0,
        maxScore: 50,
        percentage: 20,
        passThreshold: PASS_THRESHOLDS[domain],
        passed: false,
        recommendations: [],
        remediation_tasks: [`${domain} task`],
      }));
      const result = generateRemediationTasks(domainScores);
      expect(result).toHaveLength(5);
    });

    it('should deduplicate tasks', () => {
      const domainScores: DomainScore[] = [
        {
          domain: 'infrastructure',
          score: 0,
          maxScore: 50,
          percentage: 20,
          passThreshold: 60,
          passed: false,
          recommendations: [],
          remediation_tasks: ['Provision VPC'],
        },
        {
          domain: 'security',
          score: 0,
          maxScore: 50,
          percentage: 20,
          passThreshold: 60,
          passed: false,
          recommendations: [],
          remediation_tasks: ['Provision VPC'],
        },
      ];
      const result = generateRemediationTasks(domainScores);
      expect(result).toHaveLength(1);
    });
  });

  describe('scoreResponse - edge cases', () => {
    it('should clamp numeric values above 100 to weight', () => {
      const question: AssessmentQuestion = {
        id: 'q-num',
        section: 'test',
        domain: 'infrastructure',
        text: 'High number',
        type: 'number',
        weight: 1,
        required: true,
        order: 1,
      };
      expect(scoreResponse(question, makeResponse('q-num', 200))).toBe(1);
    });

    it('should clamp negative numeric values to 0', () => {
      const question: AssessmentQuestion = {
        id: 'q-neg',
        section: 'test',
        domain: 'infrastructure',
        text: 'Negative number',
        type: 'number',
        weight: 1,
        required: true,
        order: 1,
      };
      expect(scoreResponse(question, makeResponse('q-neg', -50))).toBe(0);
    });

    it('should return 0 for empty multi_select array', () => {
      const question: AssessmentQuestion = {
        id: 'q-empty-multi',
        section: 'test',
        domain: 'security',
        text: 'Empty multi',
        type: 'multi_select',
        options: ['A', 'B'],
        weight: 1,
        scoring: { A: 100, B: 50 },
        required: true,
        order: 1,
      };
      expect(scoreResponse(question, makeResponse('q-empty-multi', []))).toBe(0);
    });

    it('should handle string value not in scoring map', () => {
      const question: AssessmentQuestion = {
        id: 'q-unknown',
        section: 'test',
        domain: 'infrastructure',
        text: 'Unknown option',
        type: 'single_select',
        options: ['Known'],
        weight: 1,
        scoring: { Known: 100 },
        required: true,
        order: 1,
      };
      // value not in scoring map should return 0 (falls through to text case)
      expect(scoreResponse(question, makeResponse('q-unknown', 'Unknown'))).toBe(0);
    });

    it('should handle multi_select with values not in scoring map', () => {
      const question: AssessmentQuestion = {
        id: 'q-partial-multi',
        section: 'test',
        domain: 'security',
        text: 'Partial multi',
        type: 'multi_select',
        options: ['A', 'B', 'C'],
        weight: 2,
        scoring: { A: 100, B: 0 },
        required: true,
        order: 1,
      };
      // 'C' is not in scoring so contributes 0, avg = (100+0)/2 = 50
      const score = scoreResponse(question, makeResponse('q-partial-multi', ['A', 'C']));
      expect(score).toBeCloseTo(1); // (50/100)*2 = 1
    });
  });

  describe('calculateDomainScore - edge cases', () => {
    it('should return 0 maxScore when no questions exist for domain', () => {
      const result = calculateDomainScore('infrastructure', [], []);
      expect(result.maxScore).toBe(0);
      expect(result.score).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('should mark domain as passed when percentage meets threshold', () => {
      // Create a simple question set where we can control the outcome
      const questions: AssessmentQuestion[] = [
        {
          id: 'test-q1',
          section: 'Test',
          domain: 'business',
          text: 'Test',
          type: 'single_select',
          options: ['Yes', 'No'],
          weight: 1,
          scoring: { Yes: 100, No: 0 },
          required: true,
          order: 1,
        },
      ];
      const responses = [makeResponse('test-q1', 'Yes')];
      const result = calculateDomainScore('business', responses, questions);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('should mark domain as failed when percentage is below threshold', () => {
      const questions: AssessmentQuestion[] = [
        {
          id: 'test-q1',
          section: 'Test',
          domain: 'infrastructure',
          text: 'Test',
          type: 'single_select',
          options: ['Yes', 'No'],
          weight: 1,
          scoring: { Yes: 100, No: 0 },
          required: true,
          order: 1,
        },
      ];
      const responses = [makeResponse('test-q1', 'No')];
      const result = calculateDomainScore('infrastructure', responses, questions);
      expect(result.percentage).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('should return recommendations for low scoring domains', () => {
      const result = calculateDomainScore('infrastructure', [], ASSESSMENT_QUESTIONS);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should return remediation tasks for low scoring domains', () => {
      const result = calculateDomainScore('security', [], ASSESSMENT_QUESTIONS);
      expect(result.remediation_tasks.length).toBeGreaterThan(0);
    });
  });
});
