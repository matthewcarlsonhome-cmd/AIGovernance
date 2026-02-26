import { describe, it, expect } from 'vitest';
import { parseISO, differenceInCalendarDays, addDays } from 'date-fns';
import type { ProjectPhase } from '@/lib/tasks/role-assignment';
import {
  calculatePhaseDueDates,
  calculateTaskDueDate,
  getDueStatus,
  generateDemoDueDates,
} from './due-dates';
import type { PhaseDateRange } from './due-dates';

// ---------------------------------------------------------------------------
// calculatePhaseDueDates
// ---------------------------------------------------------------------------

describe('calculatePhaseDueDates', () => {
  const projectStart = '2025-07-01';
  const projectEnd = '2025-09-28'; // 89 days

  it('should return date ranges for all 5 phases', () => {
    const result = calculatePhaseDueDates(projectStart, projectEnd);
    const phases: ProjectPhase[] = [
      'scope_assess',
      'classify_govern',
      'approve_gate',
      'build_test',
      'evaluate_decide',
    ];
    for (const phase of phases) {
      expect(result[phase]).toBeDefined();
      expect(result[phase].start).toBeDefined();
      expect(result[phase].end).toBeDefined();
    }
  });

  it('first phase should start on projectStart', () => {
    const result = calculatePhaseDueDates(projectStart, projectEnd);
    expect(result.scope_assess.start).toBe(projectStart);
  });

  it('last phase should end on projectEnd', () => {
    const result = calculatePhaseDueDates(projectStart, projectEnd);
    expect(result.evaluate_decide.end).toBe(projectEnd);
  });

  it('phases should be in chronological order', () => {
    const result = calculatePhaseDueDates(projectStart, projectEnd);
    const phases: ProjectPhase[] = [
      'scope_assess',
      'classify_govern',
      'approve_gate',
      'build_test',
      'evaluate_decide',
    ];

    for (let i = 1; i < phases.length; i++) {
      const prevEnd = parseISO(result[phases[i - 1]].end);
      const currentStart = parseISO(result[phases[i]].start);
      // Current phase start should be after previous phase end
      expect(currentStart.getTime()).toBeGreaterThan(prevEnd.getTime());
    }
  });

  it('build_test (weight 0.30) should have the longest duration', () => {
    const result = calculatePhaseDueDates(projectStart, projectEnd);
    const phaseDurations = Object.entries(result).map(([phase, range]) => ({
      phase,
      days: differenceInCalendarDays(parseISO(range.end), parseISO(range.start)),
    }));
    const buildTest = phaseDurations.find((p) => p.phase === 'build_test');
    for (const p of phaseDurations) {
      if (p.phase !== 'build_test') {
        expect(buildTest!.days).toBeGreaterThanOrEqual(p.days);
      }
    }
  });

  it('should handle a very short timeline (7 days)', () => {
    const start = '2025-07-01';
    const end = '2025-07-08';
    const result = calculatePhaseDueDates(start, end);
    // All phases should still have valid date ranges
    for (const range of Object.values(result)) {
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
    }
  });

  it('total coverage should span the full project duration', () => {
    const result = calculatePhaseDueDates(projectStart, projectEnd);
    const firstStart = result.scope_assess.start;
    const lastEnd = result.evaluate_decide.end;
    expect(firstStart).toBe(projectStart);
    expect(lastEnd).toBe(projectEnd);
  });

  it('dates should be in ISO date format (YYYY-MM-DD)', () => {
    const result = calculatePhaseDueDates(projectStart, projectEnd);
    for (const range of Object.values(result)) {
      expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// calculateTaskDueDate
// ---------------------------------------------------------------------------

describe('calculateTaskDueDate', () => {
  const phaseDates: PhaseDateRange = {
    start: '2025-07-01',
    end: '2025-07-31', // 30 days
  };

  it('should return phase end date when only 1 task in phase', () => {
    const dueDate = calculateTaskDueDate('scope_assess', 0, 1, phaseDates);
    expect(dueDate).toBe('2025-07-31');
  });

  it('should return phase end date when totalTasksInPhase <= 0', () => {
    const dueDate = calculateTaskDueDate('scope_assess', 0, 0, phaseDates);
    expect(dueDate).toBe('2025-07-31');
  });

  it('should distribute tasks evenly across the phase', () => {
    const dates = [];
    for (let i = 0; i < 3; i++) {
      dates.push(calculateTaskDueDate('scope_assess', i, 3, phaseDates));
    }
    // All dates should be different
    expect(new Set(dates).size).toBe(3);
    // Dates should be in chronological order
    for (let i = 1; i < dates.length; i++) {
      expect(parseISO(dates[i]).getTime()).toBeGreaterThanOrEqual(
        parseISO(dates[i - 1]).getTime(),
      );
    }
  });

  it('last task should be near or at phase end', () => {
    const dueDate = calculateTaskDueDate('scope_assess', 4, 5, phaseDates);
    const due = parseISO(dueDate);
    const phaseEnd = parseISO(phaseDates.end);
    const diffDays = differenceInCalendarDays(phaseEnd, due);
    expect(diffDays).toBeLessThanOrEqual(1); // Within 1 day of phase end
  });

  it('first task should be within the phase', () => {
    const dueDate = calculateTaskDueDate('scope_assess', 0, 5, phaseDates);
    const due = parseISO(dueDate);
    const phaseStart = parseISO(phaseDates.start);
    const phaseEnd = parseISO(phaseDates.end);
    expect(due.getTime()).toBeGreaterThanOrEqual(phaseStart.getTime());
    expect(due.getTime()).toBeLessThanOrEqual(phaseEnd.getTime());
  });

  it('should return date in ISO format (YYYY-MM-DD)', () => {
    const dueDate = calculateTaskDueDate('scope_assess', 0, 3, phaseDates);
    expect(dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ---------------------------------------------------------------------------
// getDueStatus
// ---------------------------------------------------------------------------

describe('getDueStatus', () => {
  it('should return "no_date" for empty string', () => {
    expect(getDueStatus('')).toBe('no_date');
  });

  it('should return "overdue" when due date is in the past', () => {
    const pastDate = '2020-01-01';
    const now = new Date('2025-06-15');
    expect(getDueStatus(pastDate, now)).toBe('overdue');
  });

  it('should return "due_soon" when due date is within 3 days', () => {
    const now = new Date('2025-06-15');
    const soonDate = '2025-06-17'; // 2 days away
    expect(getDueStatus(soonDate, now)).toBe('due_soon');
  });

  it('should return "due_soon" when due date is exactly 3 days away', () => {
    const now = new Date('2025-06-15');
    const exactlyThree = '2025-06-18'; // 3 days away
    expect(getDueStatus(exactlyThree, now)).toBe('due_soon');
  });

  it('should return "on_track" when due date is more than 3 days away', () => {
    const now = new Date('2025-06-15');
    const futureDate = '2025-06-25'; // 10 days away
    expect(getDueStatus(futureDate, now)).toBe('on_track');
  });

  it('should return "due_soon" when due is today', () => {
    const now = new Date('2025-06-15');
    const today = '2025-06-15'; // 0 days away
    expect(getDueStatus(today, now)).toBe('due_soon');
  });

  it('should return "overdue" when due was yesterday', () => {
    const now = new Date('2025-06-15');
    const yesterday = '2025-06-14';
    expect(getDueStatus(yesterday, now)).toBe('overdue');
  });

  it('should return "on_track" when due is 4 days away', () => {
    const now = new Date('2025-06-15');
    const fourDays = '2025-06-19'; // 4 days away
    expect(getDueStatus(fourDays, now)).toBe('on_track');
  });
});

// ---------------------------------------------------------------------------
// generateDemoDueDates
// ---------------------------------------------------------------------------

describe('generateDemoDueDates', () => {
  it('should return a non-empty record', () => {
    const dates = generateDemoDueDates('proj-test');
    expect(Object.keys(dates).length).toBeGreaterThan(0);
  });

  it('all values should be valid ISO date strings', () => {
    const dates = generateDemoDueDates('proj-test');
    for (const dateStr of Object.values(dates)) {
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Should be parseable
      const parsed = parseISO(dateStr);
      expect(parsed.getTime()).not.toBeNaN();
    }
  });

  it('should include tasks from multiple phases', () => {
    const dates = generateDemoDueDates('proj-test');
    const keys = Object.keys(dates);
    // Should include phase 1 tasks
    expect(keys).toContain('complete_intake_scorecard');
    expect(keys).toContain('complete_questionnaire');
    // Should include phase 5 tasks
    expect(keys).toContain('generate_reports');
    expect(keys).toContain('go_no_go_decision');
  });

  it('phase 1 tasks should have earlier dates than phase 5 tasks', () => {
    const dates = generateDemoDueDates('proj-test');
    const phase1Date = parseISO(dates['complete_intake_scorecard']);
    const phase5Date = parseISO(dates['generate_reports']);
    expect(phase1Date.getTime()).toBeLessThan(phase5Date.getTime());
  });

  it('all dates should be within the 90-day project window', () => {
    const dates = generateDemoDueDates('proj-test');
    const today = new Date();
    const endDate = addDays(today, 91); // Buffer of 1 day

    for (const dateStr of Object.values(dates)) {
      const d = parseISO(dateStr);
      expect(d.getTime()).toBeGreaterThanOrEqual(today.getTime() - 24 * 60 * 60 * 1000); // Allow 1 day buffer
      expect(d.getTime()).toBeLessThanOrEqual(endDate.getTime());
    }
  });
});
