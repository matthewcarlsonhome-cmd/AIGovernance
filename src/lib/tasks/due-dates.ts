/**
 * Due-date calculation engine — distributes task due dates across project
 * phases with weighted durations. Pure functions, no side effects.
 */

import { addDays, differenceInCalendarDays, parseISO, isBefore, startOfDay } from 'date-fns';
import type { ProjectPhase } from '@/lib/tasks/role-assignment';
import { TASK_PHASE_MAP } from '@/lib/tasks/role-assignment';
import type { TaskTypeId } from '@/lib/tasks/role-assignment';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type DueStatus = 'overdue' | 'due_soon' | 'on_track' | 'no_date';

export interface PhaseDateRange {
  start: string;
  end: string;
}

/* -------------------------------------------------------------------------- */
/*  Phase weight distribution                                                  */
/* -------------------------------------------------------------------------- */

const PHASE_WEIGHTS: Record<ProjectPhase, number> = {
  scope_assess: 0.15,
  classify_govern: 0.25,
  approve_gate: 0.15,
  build_test: 0.30,
  evaluate_decide: 0.15,
};

const PHASE_ORDER: ProjectPhase[] = [
  'scope_assess',
  'classify_govern',
  'approve_gate',
  'build_test',
  'evaluate_decide',
];

/* -------------------------------------------------------------------------- */
/*  Public functions                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Divides a project timeline into 5 phases with weighted durations.
 *
 * @param projectStartDate - ISO date string for the project start
 * @param projectEndDate - ISO date string for the project target end
 * @returns A record mapping each phase to its start/end ISO date strings
 */
export function calculatePhaseDueDates(
  projectStartDate: string,
  projectEndDate: string,
): Record<ProjectPhase, PhaseDateRange> {
  const start = parseISO(projectStartDate);
  const end = parseISO(projectEndDate);
  const totalDays = differenceInCalendarDays(end, start);

  const result = {} as Record<ProjectPhase, PhaseDateRange>;
  let currentStart = start;

  for (let i = 0; i < PHASE_ORDER.length; i++) {
    const phase = PHASE_ORDER[i];
    const weight = PHASE_WEIGHTS[phase];
    const phaseDays = Math.round(totalDays * weight);

    // Last phase absorbs any rounding differences
    const phaseEnd = i === PHASE_ORDER.length - 1
      ? end
      : addDays(currentStart, phaseDays);

    result[phase] = {
      start: currentStart.toISOString().split('T')[0],
      end: phaseEnd.toISOString().split('T')[0],
    };

    currentStart = addDays(phaseEnd, 1);
  }

  return result;
}

/**
 * Distributes a task's due date evenly within its phase date range.
 *
 * @param taskPhase - The phase this task belongs to
 * @param taskIndex - Zero-based index of the task within the phase
 * @param totalTasksInPhase - Total number of tasks in the phase
 * @param phaseDates - The start/end date range for the phase
 * @returns ISO date string for the task's due date
 */
export function calculateTaskDueDate(
  taskPhase: ProjectPhase,
  taskIndex: number,
  totalTasksInPhase: number,
  phaseDates: PhaseDateRange,
): string {
  // Guard against division by zero or invalid indices
  if (totalTasksInPhase <= 0) {
    return phaseDates.end;
  }

  const phaseStart = parseISO(phaseDates.start);
  const phaseEnd = parseISO(phaseDates.end);
  const phaseDays = differenceInCalendarDays(phaseEnd, phaseStart);

  if (totalTasksInPhase === 1) {
    return phaseDates.end;
  }

  // Distribute tasks evenly across the phase
  const interval = phaseDays / (totalTasksInPhase);
  const daysFromStart = Math.round(interval * (taskIndex + 1));
  const dueDate = addDays(phaseStart, Math.min(daysFromStart, phaseDays));

  return dueDate.toISOString().split('T')[0];
}

/**
 * Determines the due status of a task based on its due date.
 *
 * @param dueDate - ISO date string of the task's due date
 * @param now - Optional current date (defaults to new Date())
 * @returns The due status: overdue, due_soon (within 3 days), on_track, or no_date
 */
export function getDueStatus(dueDate: string, now?: Date): DueStatus {
  if (!dueDate) {
    return 'no_date';
  }

  const today = startOfDay(now ?? new Date());
  const due = startOfDay(parseISO(dueDate));
  const daysUntilDue = differenceInCalendarDays(due, today);

  if (isBefore(due, today)) {
    return 'overdue';
  }

  if (daysUntilDue <= 3) {
    return 'due_soon';
  }

  return 'on_track';
}

/**
 * Generates demo due dates for all standard tasks based on a 90-day project
 * starting from today.
 *
 * @param _projectId - The project ID (used for namespacing in future persistence)
 * @returns A record mapping task type IDs to ISO date strings
 */
export function generateDemoDueDates(
  _projectId: string,
): Record<string, string> {
  const today = new Date();
  const projectStart = today.toISOString().split('T')[0];
  const projectEnd = addDays(today, 90).toISOString().split('T')[0];

  const phaseDates = calculatePhaseDueDates(projectStart, projectEnd);

  // Group tasks by phase
  const tasksByPhase: Record<ProjectPhase, TaskTypeId[]> = {
    scope_assess: [],
    classify_govern: [],
    approve_gate: [],
    build_test: [],
    evaluate_decide: [],
  };

  for (const [taskId, phase] of Object.entries(TASK_PHASE_MAP)) {
    tasksByPhase[phase].push(taskId as TaskTypeId);
  }

  // Calculate due dates for each task
  const dueDates: Record<string, string> = {};

  for (const phase of PHASE_ORDER) {
    const tasks = tasksByPhase[phase];
    const dateRange = phaseDates[phase];

    tasks.forEach((taskId, index) => {
      dueDates[taskId] = calculateTaskDueDate(
        phase,
        index,
        tasks.length,
        dateRange,
      );
    });
  }

  return dueDates;
}
