import { describe, it, expect } from 'vitest';
import {
  ASSESSMENT_QUESTIONS,
  getQuestionsByDomain,
  getQuestionsBySection,
  getSections,
  getQuestionById,
} from '@/lib/scoring/questions';

describe('Questions Module', () => {
  describe('getQuestionsByDomain', () => {
    it('should return 6 infrastructure questions', () => {
      const questions = getQuestionsByDomain('infrastructure');
      expect(questions).toHaveLength(6);
      questions.forEach((q) => expect(q.domain).toBe('infrastructure'));
    });

    it('should return 6 security questions', () => {
      const questions = getQuestionsByDomain('security');
      expect(questions).toHaveLength(6);
      questions.forEach((q) => expect(q.domain).toBe('security'));
    });

    it('should return 6 governance questions', () => {
      const questions = getQuestionsByDomain('governance');
      expect(questions).toHaveLength(6);
      questions.forEach((q) => expect(q.domain).toBe('governance'));
    });

    it('should return 6 engineering questions', () => {
      const questions = getQuestionsByDomain('engineering');
      expect(questions).toHaveLength(6);
      questions.forEach((q) => expect(q.domain).toBe('engineering'));
    });

    it('should return 6 business questions', () => {
      const questions = getQuestionsByDomain('business');
      expect(questions).toHaveLength(6);
      questions.forEach((q) => expect(q.domain).toBe('business'));
    });

    it('should return empty array for unknown domain', () => {
      const questions = getQuestionsByDomain('nonexistent');
      expect(questions).toHaveLength(0);
    });
  });

  describe('getQuestionsBySection', () => {
    it('should return questions for "Infrastructure Readiness" section', () => {
      const questions = getQuestionsBySection('Infrastructure Readiness');
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => expect(q.section).toBe('Infrastructure Readiness'));
    });

    it('should return questions for "Security Posture" section', () => {
      const questions = getQuestionsBySection('Security Posture');
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => expect(q.section).toBe('Security Posture'));
    });

    it('should return empty array for unknown section', () => {
      const questions = getQuestionsBySection('Unknown Section');
      expect(questions).toHaveLength(0);
    });
  });

  describe('getSections', () => {
    it('should return 5 unique sections', () => {
      const sections = getSections();
      expect(sections).toHaveLength(5);
    });

    it('should include all expected section names', () => {
      const sections = getSections();
      expect(sections).toContain('Infrastructure Readiness');
      expect(sections).toContain('Security Posture');
      expect(sections).toContain('Governance Maturity');
      expect(sections).toContain('Engineering Culture');
      expect(sections).toContain('Business Alignment');
    });

    it('should preserve display order', () => {
      const sections = getSections();
      expect(sections[0]).toBe('Infrastructure Readiness');
      expect(sections[4]).toBe('Business Alignment');
    });
  });

  describe('getQuestionById', () => {
    it('should return a question for a valid ID', () => {
      const question = getQuestionById('infra-001');
      expect(question).toBeDefined();
      expect(question?.id).toBe('infra-001');
      expect(question?.domain).toBe('infrastructure');
    });

    it('should return undefined for an invalid ID', () => {
      const question = getQuestionById('nonexistent-id');
      expect(question).toBeUndefined();
    });

    it('should return the correct question for each domain prefix', () => {
      expect(getQuestionById('infra-001')?.domain).toBe('infrastructure');
      expect(getQuestionById('sec-001')?.domain).toBe('security');
      expect(getQuestionById('gov-001')?.domain).toBe('governance');
      expect(getQuestionById('eng-001')?.domain).toBe('engineering');
      expect(getQuestionById('biz-001')?.domain).toBe('business');
    });
  });

  describe('ASSESSMENT_QUESTIONS data integrity', () => {
    it('should have 30 total questions (6 per domain)', () => {
      expect(ASSESSMENT_QUESTIONS).toHaveLength(30);
    });

    it('should have unique IDs for every question', () => {
      const ids = ASSESSMENT_QUESTIONS.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique order values', () => {
      const orders = ASSESSMENT_QUESTIONS.map((q) => q.order);
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBe(orders.length);
    });

    it('should have positive weights on all questions', () => {
      ASSESSMENT_QUESTIONS.forEach((q) => {
        expect(q.weight).toBeGreaterThan(0);
      });
    });

    it('should have scoring maps for all select-type questions', () => {
      ASSESSMENT_QUESTIONS.filter(
        (q) => q.type === 'single_select' || q.type === 'multi_select',
      ).forEach((q) => {
        expect(q.scoring).toBeDefined();
        expect(Object.keys(q.scoring!).length).toBeGreaterThan(0);
      });
    });

    it('should have scoring values between 0 and 100', () => {
      ASSESSMENT_QUESTIONS.forEach((q) => {
        if (q.scoring) {
          Object.values(q.scoring).forEach((score) => {
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
          });
        }
      });
    });

    it('should have all required questions marked as required', () => {
      ASSESSMENT_QUESTIONS.forEach((q) => {
        expect(q.required).toBe(true);
      });
    });
  });
});
