import { describe, it, expect } from 'vitest';
import {
  scoreResponse,
  calculateDomainScore,
  DOMAIN_WEIGHTS,
  PASS_THRESHOLDS,
  DOMAINS,
} from '@/lib/scoring/engine';
import { ASSESSMENT_QUESTIONS } from '@/lib/scoring/questions';
import type { AssessmentQuestion, AssessmentResponse } from '@/types';

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

describe('Scoring Engine', () => {
  describe('DOMAIN_WEIGHTS', () => {
    it('should have weights for all 5 domains', () => {
      expect(Object.keys(DOMAIN_WEIGHTS)).toHaveLength(5);
      expect(DOMAIN_WEIGHTS.infrastructure).toBe(0.25);
      expect(DOMAIN_WEIGHTS.security).toBe(0.25);
      expect(DOMAIN_WEIGHTS.governance).toBe(0.20);
      expect(DOMAIN_WEIGHTS.engineering).toBe(0.15);
      expect(DOMAIN_WEIGHTS.business).toBe(0.15);
    });

    it('should sum to 1.0', () => {
      const total = Object.values(DOMAIN_WEIGHTS).reduce((sum, w) => sum + w, 0);
      expect(total).toBeCloseTo(1.0);
    });
  });

  describe('PASS_THRESHOLDS', () => {
    it('should have thresholds for all 5 domains', () => {
      expect(Object.keys(PASS_THRESHOLDS)).toHaveLength(5);
    });

    it('infrastructure and security should have higher thresholds', () => {
      expect(PASS_THRESHOLDS.infrastructure).toBeGreaterThanOrEqual(PASS_THRESHOLDS.business);
      expect(PASS_THRESHOLDS.security).toBeGreaterThanOrEqual(PASS_THRESHOLDS.business);
    });
  });

  describe('DOMAINS', () => {
    it('should list all 5 domains', () => {
      expect(DOMAINS).toHaveLength(5);
      expect(DOMAINS).toContain('infrastructure');
      expect(DOMAINS).toContain('security');
      expect(DOMAINS).toContain('governance');
      expect(DOMAINS).toContain('engineering');
      expect(DOMAINS).toContain('business');
    });
  });

  describe('scoreResponse', () => {
    it('should return 0 for undefined response', () => {
      const question: AssessmentQuestion = {
        id: 'q1', section: 'test', domain: 'infrastructure', text: 'Test',
        type: 'single_select', options: ['A'], weight: 1, scoring: { 'A': 100 },
        required: true, order: 1,
      };
      expect(scoreResponse(question, undefined)).toBe(0);
    });

    it('should score a single_select response using scoring map', () => {
      const question: AssessmentQuestion = {
        id: 'q1', section: 'test', domain: 'infrastructure', text: 'Test',
        type: 'single_select', options: ['Option A', 'Option B', 'Option C'],
        weight: 1, scoring: { 'Option A': 100, 'Option B': 50, 'Option C': 0 },
        required: true, order: 1,
      };

      expect(scoreResponse(question, makeResponse('q1', 'Option A'))).toBe(1);
      expect(scoreResponse(question, makeResponse('q1', 'Option B'))).toBe(0.5);
      expect(scoreResponse(question, makeResponse('q1', 'Option C'))).toBe(0);
    });

    it('should apply weight to scoring', () => {
      const question: AssessmentQuestion = {
        id: 'q1', section: 'test', domain: 'infrastructure', text: 'Test',
        type: 'single_select', options: ['A'], weight: 2,
        scoring: { 'A': 100 }, required: true, order: 1,
      };
      expect(scoreResponse(question, makeResponse('q1', 'A'))).toBe(2);
    });

    it('should score multi_select by averaging matched scores', () => {
      const question: AssessmentQuestion = {
        id: 'q1', section: 'test', domain: 'security', text: 'Test multi',
        type: 'multi_select', options: ['A', 'B', 'C', 'D'],
        weight: 1, scoring: { 'A': 100, 'B': 100, 'C': 100, 'D': 100 },
        required: true, order: 1,
      };
      const score = scoreResponse(question, makeResponse('q1', ['A', 'B']));
      expect(score).toBeGreaterThan(0);
    });

    it('should normalize numeric responses', () => {
      const question: AssessmentQuestion = {
        id: 'q1', section: 'test', domain: 'infrastructure', text: 'Pct',
        type: 'number', weight: 1, required: true, order: 1,
      };
      const score = scoreResponse(question, makeResponse('q1', 75));
      expect(score).toBeCloseTo(0.75);
    });

    it('should return 0 for text responses without scoring map', () => {
      const question: AssessmentQuestion = {
        id: 'q1', section: 'test', domain: 'infrastructure', text: 'Free text',
        type: 'text', weight: 1, required: true, order: 1,
      };
      expect(scoreResponse(question, makeResponse('q1', 'any text'))).toBe(0);
    });
  });

  describe('calculateDomainScore', () => {
    const infraQuestions = ASSESSMENT_QUESTIONS.filter(q => q.domain === 'infrastructure');

    it('should return a domain score object with required fields', () => {
      const responses: AssessmentResponse[] = infraQuestions.map(q =>
        makeResponse(q.id, q.options?.[0] || '')
      );
      const score = calculateDomainScore('infrastructure', responses, infraQuestions);

      expect(score).toHaveProperty('domain', 'infrastructure');
      expect(score).toHaveProperty('score');
      expect(score).toHaveProperty('maxScore');
      expect(score).toHaveProperty('percentage');
      expect(score).toHaveProperty('passThreshold');
      expect(score).toHaveProperty('passed');
      expect(score).toHaveProperty('recommendations');
      expect(score).toHaveProperty('remediation_tasks');
      expect(score.percentage).toBeGreaterThanOrEqual(0);
      expect(score.percentage).toBeLessThanOrEqual(100);
    });

    it('should return 0% when no responses', () => {
      const score = calculateDomainScore('infrastructure', [], infraQuestions);
      expect(score.percentage).toBe(0);
      expect(score.passed).toBe(false);
    });

    it('should score higher for best answers than worst answers', () => {
      const bestResponses = infraQuestions.map(q => {
        let bestOption = q.options?.[0] || '';
        let bestScore = 0;
        if (q.scoring) {
          for (const [opt, s] of Object.entries(q.scoring)) {
            if (s > bestScore) { bestScore = s; bestOption = opt; }
          }
        }
        return makeResponse(q.id, bestOption);
      });

      const worstResponses = infraQuestions.map(q => {
        let worstOption = q.options?.[0] || '';
        let worstScore = Infinity;
        if (q.scoring) {
          for (const [opt, s] of Object.entries(q.scoring)) {
            if (s < worstScore) { worstScore = s; worstOption = opt; }
          }
        }
        return makeResponse(q.id, worstOption);
      });

      const bestScore = calculateDomainScore('infrastructure', bestResponses, infraQuestions);
      const worstScore = calculateDomainScore('infrastructure', worstResponses, infraQuestions);
      expect(bestScore.percentage).toBeGreaterThan(worstScore.percentage);
    });
  });

  describe('ASSESSMENT_QUESTIONS', () => {
    it('should have questions for all 5 domains', () => {
      const domains = new Set(ASSESSMENT_QUESTIONS.map(q => q.domain));
      expect(domains.size).toBe(5);
      DOMAINS.forEach(d => expect(domains.has(d)).toBe(true));
    });

    it('should have required fields on every question', () => {
      ASSESSMENT_QUESTIONS.forEach(q => {
        expect(q.id).toBeTruthy();
        expect(q.domain).toBeTruthy();
        expect(q.text).toBeTruthy();
        expect(q.type).toBeTruthy();
        expect(typeof q.weight).toBe('number');
        expect(typeof q.required).toBe('boolean');
      });
    });

    it('should have options for select-type questions', () => {
      ASSESSMENT_QUESTIONS.filter(
        q => q.type === 'single_select' || q.type === 'multi_select'
      ).forEach(q => {
        expect(q.options).toBeDefined();
        expect(q.options!.length).toBeGreaterThan(0);
      });
    });
  });
});
