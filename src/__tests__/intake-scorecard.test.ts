import { describe, it, expect } from 'vitest';
import { scoreIntake, INTAKE_QUESTIONS, generateDemoIntakeResult } from '@/lib/intake/scorecard';
import type { PilotIntakeResponse } from '@/types';

describe('Pilot Intake Scorecard', () => {
  it('should have exactly 10 questions', () => {
    expect(INTAKE_QUESTIONS).toHaveLength(10);
  });

  it('should classify high scores as fast_track', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[0].value,
      score: q.options[0].score, // First option is always highest score
    }));
    const result = scoreIntake(responses);
    expect(result.risk_path).toBe('fast_track');
    expect(result.total_score).toBeGreaterThanOrEqual(75);
  });

  it('should classify low scores as high_risk', () => {
    const responses: PilotIntakeResponse[] = INTAKE_QUESTIONS.map((q) => ({
      question_id: q.id,
      selected_value: q.options[q.options.length - 1].value,
      score: q.options[q.options.length - 1].score, // Last option is lowest score
    }));
    const result = scoreIntake(responses);
    expect(result.risk_path).toBe('high_risk');
    expect(result.total_score).toBeLessThan(45);
  });

  it('should generate recommendations based on risk path', () => {
    const result = generateDemoIntakeResult('proj-test');
    expect(result.recommended_actions.length).toBeGreaterThan(0);
    expect(result.risk_path).toBeDefined();
  });

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

  it('should handle empty responses', () => {
    const result = scoreIntake([]);
    expect(result.total_score).toBe(0);
    expect(result.risk_path).toBe('high_risk');
  });
});
