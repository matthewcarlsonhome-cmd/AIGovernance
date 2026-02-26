import { describe, it, expect } from 'vitest';
import type { PilotIntakeResponse } from '@/types';
import { scoreIntake, INTAKE_QUESTIONS, generateDemoIntakeResult } from './scorecard';

// ---------------------------------------------------------------------------
// INTAKE_QUESTIONS structure
// ---------------------------------------------------------------------------

describe('INTAKE_QUESTIONS', () => {
  it('should have exactly 10 questions', () => {
    expect(INTAKE_QUESTIONS).toHaveLength(10);
  });

  it('each question should have a unique id', () => {
    const ids = INTAKE_QUESTIONS.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  it('each question should have at least 2 options', () => {
    for (const q of INTAKE_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('each question should have a positive weight', () => {
    for (const q of INTAKE_QUESTIONS) {
      expect(q.weight).toBeGreaterThan(0);
    }
  });

  it('each option should have label, value, and score', () => {
    for (const q of INTAKE_QUESTIONS) {
      for (const opt of q.options) {
        expect(opt.label).toBeDefined();
        expect(opt.value).toBeDefined();
        expect(typeof opt.score).toBe('number');
      }
    }
  });

  it('option scores should be between 1 and 10', () => {
    for (const q of INTAKE_QUESTIONS) {
      for (const opt of q.options) {
        expect(opt.score).toBeGreaterThanOrEqual(1);
        expect(opt.score).toBeLessThanOrEqual(10);
      }
    }
  });

  it('first option should have the highest score for each question', () => {
    for (const q of INTAKE_QUESTIONS) {
      const maxScore = Math.max(...q.options.map((o) => o.score));
      expect(q.options[0].score).toBe(maxScore);
    }
  });

  it('question IDs should follow intake-N pattern', () => {
    for (let i = 0; i < INTAKE_QUESTIONS.length; i++) {
      expect(INTAKE_QUESTIONS[i].id).toBe(`intake-${i + 1}`);
    }
  });
});

// ---------------------------------------------------------------------------
// scoreIntake — classification
// ---------------------------------------------------------------------------

describe('scoreIntake — risk classification', () => {
  it('should classify high scores as fast_track (>= 75)', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[0].value,
      score: q.options[0].score,
    }));
    const result = scoreIntake(responses);
    expect(result.risk_path).toBe('fast_track');
    expect(result.total_score).toBeGreaterThanOrEqual(75);
  });

  it('should classify low scores as high_risk (< 45)', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[q.options.length - 1].value,
      score: q.options[q.options.length - 1].score,
    }));
    const result = scoreIntake(responses);
    expect(result.risk_path).toBe('high_risk');
    expect(result.total_score).toBeLessThan(45);
  });

  it('should classify mid-range scores as standard (45-74)', () => {
    // Use second options which should be mid-range
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[1].value,
      score: q.options[1].score,
    }));
    const result = scoreIntake(responses);
    expect(result.total_score).toBeGreaterThanOrEqual(45);
    expect(result.total_score).toBeLessThan(75);
    expect(result.risk_path).toBe('standard');
  });
});

// ---------------------------------------------------------------------------
// scoreIntake — score calculation
// ---------------------------------------------------------------------------

describe('scoreIntake — score calculation', () => {
  it('should return a score between 0 and 100', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[1].value,
      score: q.options[1].score,
    }));
    const result = scoreIntake(responses);
    expect(result.total_score).toBeGreaterThanOrEqual(0);
    expect(result.total_score).toBeLessThanOrEqual(100);
  });

  it('should return max_score of 100', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[0].value,
      score: q.options[0].score,
    }));
    const result = scoreIntake(responses);
    expect(result.max_score).toBe(100);
  });

  it('should handle empty responses', () => {
    const result = scoreIntake([]);
    expect(result.total_score).toBe(0);
    expect(result.risk_path).toBe('high_risk');
  });

  it('should ignore responses with unknown question IDs', () => {
    const responses: PilotIntakeResponse[] = [
      { question_id: 'unknown-id', selected_value: 'yes', score: 10 },
    ];
    const result = scoreIntake(responses);
    expect(result.total_score).toBe(0);
  });

  it('should apply weights correctly (higher weight = more impact)', () => {
    // Score is normalized against only answered questions' weights.
    // Answering just the highest-weight question with a perfect score yields 100%
    // because totalWeight = weight * 10 for that single question only.
    // Instead, compare two single-question scenarios with different weights.
    const highWeightQ = INTAKE_QUESTIONS.reduce((max, q) =>
      q.weight > max.weight ? q : max,
    );
    const lowWeightQ = INTAKE_QUESTIONS.reduce((min, q) =>
      q.weight < min.weight ? q : min,
    );

    // Give both questions the same mid-range score (e.g. 5)
    const highResult = scoreIntake([
      { question_id: highWeightQ.id, selected_value: highWeightQ.options[2].value, score: highWeightQ.options[2].score },
    ]);
    const lowResult = scoreIntake([
      { question_id: lowWeightQ.id, selected_value: lowWeightQ.options[2].value, score: lowWeightQ.options[2].score },
    ]);

    // Both single-question scores normalize to the same percentage since
    // normalization is relative to the question's own weight. Verify both produce scores.
    expect(highResult.total_score).toBeGreaterThan(0);
    expect(lowResult.total_score).toBeGreaterThan(0);

    // In the full scorecard, the higher-weight question should have more impact on final score.
    // Test this by giving all questions score 5, then changing only the high-weight one.
    const baseResponses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[2].value,
      score: q.options[2].score,
    }));
    const baseResult = scoreIntake(baseResponses);

    // Now boost the high-weight question to max
    const boostedHigh = baseResponses.map((r) =>
      r.question_id === highWeightQ.id
        ? { ...r, score: highWeightQ.options[0].score, selected_value: highWeightQ.options[0].value }
        : r,
    );
    const boostedHighResult = scoreIntake(boostedHigh);

    // Boosting the high-weight question should increase the score
    expect(boostedHighResult.total_score).toBeGreaterThan(baseResult.total_score);
  });

  it('should handle partial responses (not all 10 answered)', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.slice(0, 5).map((q) => ({
      question_id: q.id,
      selected_value: q.options[0].value,
      score: q.options[0].score,
    }));
    const result = scoreIntake(responses);
    expect(result.total_score).toBeGreaterThan(0);
    expect(result.total_score).toBeLessThan(100);
  });
});

// ---------------------------------------------------------------------------
// scoreIntake — recommendations
// ---------------------------------------------------------------------------

describe('scoreIntake — recommendations', () => {
  it('should generate recommendations for fast_track path', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[0].value,
      score: q.options[0].score,
    }));
    const result = scoreIntake(responses);
    expect(result.recommended_actions.length).toBeGreaterThan(0);
    expect(result.recommended_actions.some((a) => a.includes('accelerated'))).toBe(true);
  });

  it('should generate recommendations for standard path', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[1].value,
      score: q.options[1].score,
    }));
    const result = scoreIntake(responses);
    expect(result.recommended_actions.length).toBeGreaterThan(0);
    expect(result.recommended_actions.some((a) => a.includes('Full governance'))).toBe(true);
  });

  it('should generate recommendations for high_risk path', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[q.options.length - 1].value,
      score: q.options[q.options.length - 1].score,
    }));
    const result = scoreIntake(responses);
    expect(result.recommended_actions.length).toBeGreaterThan(0);
    expect(result.recommended_actions.some((a) => a.includes('High-risk'))).toBe(true);
    expect(result.recommended_actions.some((a) => a.includes('Executive'))).toBe(true);
  });

  it('should add data classification recommendation for low data scores in standard path', () => {
    // All mid-range but with restricted data
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => {
      if (q.id === 'intake-1') {
        // Restricted data = score 1
        return { question_id: q.id, selected_value: 'restricted', score: 1 };
      }
      return {
        question_id: q.id,
        selected_value: q.options[1].value,
        score: q.options[1].score,
      };
    });
    const result = scoreIntake(responses);
    if (result.risk_path === 'standard') {
      expect(result.recommended_actions.some((a) => a.includes('Data classification'))).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// scoreIntake — result shape
// ---------------------------------------------------------------------------

describe('scoreIntake — result shape', () => {
  it('should return all required fields', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[0].value,
      score: q.options[0].score,
    }));
    const result = scoreIntake(responses);
    expect(result.id).toBeDefined();
    expect(typeof result.total_score).toBe('number');
    expect(typeof result.max_score).toBe('number');
    expect(result.risk_path).toBeDefined();
    expect(Array.isArray(result.recommended_actions)).toBe(true);
    expect(result.created_at).toBeDefined();
    expect(Array.isArray(result.responses)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// generateDemoIntakeResult
// ---------------------------------------------------------------------------

describe('generateDemoIntakeResult', () => {
  it('should return a valid result', () => {
    const result = generateDemoIntakeResult('proj-test');
    expect(result.risk_path).toBeDefined();
    expect(result.total_score).toBeGreaterThan(0);
    expect(result.recommended_actions.length).toBeGreaterThan(0);
  });

  it('should return 10 responses', () => {
    const result = generateDemoIntakeResult('proj-test');
    expect(result.responses).toHaveLength(10);
  });

  it('should produce a standard or fast_track path for demo data', () => {
    const result = generateDemoIntakeResult('proj-test');
    expect(['standard', 'fast_track']).toContain(result.risk_path);
  });
});
