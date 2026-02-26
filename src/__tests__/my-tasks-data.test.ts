import { describe, it, expect } from 'vitest';
import type { UserRole } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Type matching the DemoTask from my-tasks page
// ─────────────────────────────────────────────────────────────────────────────

type TaskPriority = 'required' | 'recommended' | 'optional';
type TaskStatus = 'action_needed' | 'upcoming' | 'completed';

interface DemoTask {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  dueDate: string;
  completedDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  ctaLabel?: string;
  ctaHref?: string;
  blocking?: string;
  blockedBy?: string;
  scheduledPhase?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Replicate the getTasksForRole logic for testability
// (In production, this would be extracted to a shared lib module)
// ─────────────────────────────────────────────────────────────────────────────

function getTasksForRole(role: UserRole): DemoTask[] {
  const today = new Date();
  const d = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString();
  };

  const tasksByRole: Record<UserRole, DemoTask[]> = {
    admin: [
      { id: 'a-1', title: 'Invite team members and assign roles', description: '', assignedBy: 'System', dueDate: d(3), priority: 'required', status: 'action_needed', ctaLabel: 'Manage Team', ctaHref: 'team', blocking: 'All role-specific tasks depend on team setup' },
      { id: 'a-2', title: 'Complete pilot intake scorecard', description: '', assignedBy: 'System', dueDate: d(5), priority: 'required', status: 'action_needed', ctaLabel: 'Start Intake', ctaHref: 'intake' },
      { id: 'a-3', title: 'Review project setup checklist', description: '', assignedBy: 'System', dueDate: d(7), priority: 'recommended', status: 'action_needed', ctaLabel: 'View Setup', ctaHref: 'setup' },
      { id: 'a-4', title: 'Schedule gate review meetings', description: '', assignedBy: 'System', dueDate: d(21), priority: 'recommended', status: 'upcoming', scheduledPhase: 3 },
      { id: 'a-5', title: 'Archive project and generate final report', description: '', assignedBy: 'System', dueDate: d(60), priority: 'optional', status: 'upcoming', scheduledPhase: 5 },
    ],
    consultant: [
      { id: 'c-1', title: 'Complete readiness questionnaire', description: '', assignedBy: 'Project Admin', dueDate: d(5), priority: 'required', status: 'action_needed', ctaLabel: 'Start Assessment', ctaHref: 'discovery/questionnaire', blocking: 'Readiness score blocks Phase 2 activities' },
      { id: 'c-2', title: 'Review readiness results and identify gaps', description: '', assignedBy: 'Project Admin', dueDate: d(7), priority: 'required', status: 'action_needed', ctaLabel: 'View Readiness', ctaHref: 'discovery/readiness' },
      { id: 'c-3', title: 'Track prerequisite completion', description: '', assignedBy: 'Project Admin', dueDate: d(10), priority: 'recommended', status: 'action_needed', ctaLabel: 'Prerequisites', ctaHref: 'discovery/prerequisites' },
      { id: 'c-4', title: 'Draft governance policies', description: '', assignedBy: 'Project Admin', dueDate: d(14), priority: 'required', status: 'upcoming', blockedBy: 'Readiness assessment completion', scheduledPhase: 2 },
      { id: 'c-5', title: 'Map compliance controls', description: '', assignedBy: 'Project Admin', dueDate: d(18), priority: 'required', status: 'upcoming', scheduledPhase: 2 },
      { id: 'c-6', title: 'Prepare evidence package for gate reviews', description: '', assignedBy: 'Project Admin', dueDate: d(25), priority: 'required', status: 'upcoming', scheduledPhase: 3 },
    ],
    executive: [
      { id: 'e-1', title: 'Review project scope and risk classification', description: '', assignedBy: 'Project Admin', dueDate: d(7), priority: 'required', status: 'action_needed', ctaLabel: 'View Overview', ctaHref: 'overview' },
      { id: 'e-2', title: 'Approve Gate 1: Design Review', description: '', assignedBy: 'Governance Consultant', dueDate: d(21), priority: 'required', status: 'upcoming', blockedBy: 'Phase 2 governance artifacts', scheduledPhase: 3 },
      { id: 'e-3', title: 'Approve Gate 3: Launch Authorization', description: '', assignedBy: 'Governance Consultant', dueDate: d(45), priority: 'required', status: 'upcoming', scheduledPhase: 3 },
      { id: 'e-4', title: 'Review executive decision brief', description: '', assignedBy: 'System', dueDate: d(50), priority: 'required', status: 'upcoming', scheduledPhase: 5 },
    ],
    it: [
      { id: 'i-1', title: 'Complete data classification', description: '', assignedBy: 'Project Admin', dueDate: d(10), priority: 'required', status: 'action_needed', ctaLabel: 'Classify Data', ctaHref: 'governance/compliance', blocking: 'Blocks sandbox configuration' },
      { id: 'i-2', title: 'Review security controls', description: '', assignedBy: 'Governance Consultant', dueDate: d(14), priority: 'required', status: 'action_needed', ctaLabel: 'Review Controls', ctaHref: 'controls' },
      { id: 'i-3', title: 'Configure sandbox environment', description: '', assignedBy: 'Project Admin', dueDate: d(25), priority: 'required', status: 'upcoming', blockedBy: 'Data classification and security review', scheduledPhase: 4 },
      { id: 'i-4', title: 'Run sandbox validation checks', description: '', assignedBy: 'Project Admin', dueDate: d(28), priority: 'required', status: 'upcoming', scheduledPhase: 4 },
      { id: 'i-5', title: 'Monitor pilot security metrics', description: '', assignedBy: 'Project Admin', dueDate: d(40), priority: 'recommended', status: 'upcoming', scheduledPhase: 4 },
    ],
    legal: [
      { id: 'l-1', title: 'Review Acceptable Use Policy draft', description: '', assignedBy: 'Governance Consultant', dueDate: d(14), priority: 'required', status: 'action_needed', ctaLabel: 'Review Policies', ctaHref: 'governance/policies', blocking: 'Gate 1 approval requires policy sign-off' },
      { id: 'l-2', title: 'Complete compliance framework mapping', description: '', assignedBy: 'Governance Consultant', dueDate: d(16), priority: 'required', status: 'action_needed', ctaLabel: 'Compliance Map', ctaHref: 'governance/compliance' },
      { id: 'l-3', title: 'Review risk register', description: '', assignedBy: 'Governance Consultant', dueDate: d(18), priority: 'required', status: 'action_needed', ctaLabel: 'Risk Register', ctaHref: 'governance/risk' },
      { id: 'l-4', title: 'Sign off on Gate 2: Data & Security', description: '', assignedBy: 'Project Admin', dueDate: d(22), priority: 'required', status: 'upcoming', blockedBy: 'Policy reviews and compliance mapping', scheduledPhase: 3 },
      { id: 'l-5', title: 'Review IP and licensing terms', description: '', assignedBy: 'Project Admin', dueDate: d(30), priority: 'recommended', status: 'upcoming', scheduledPhase: 3 },
    ],
    engineering: [
      { id: 'eng-1', title: 'Define pilot project scope', description: '', assignedBy: 'Project Admin', dueDate: d(12), priority: 'required', status: 'action_needed', ctaLabel: 'PoC Projects', ctaHref: 'poc/projects' },
      { id: 'eng-2', title: 'Capture baseline metrics', description: '', assignedBy: 'Governance Consultant', dueDate: d(14), priority: 'required', status: 'action_needed', ctaLabel: 'View Metrics', ctaHref: 'poc/metrics' },
      { id: 'eng-3', title: 'Set up sandbox environment', description: '', assignedBy: 'IT / Security Lead', dueDate: d(28), priority: 'required', status: 'upcoming', blockedBy: 'Sandbox configuration and validation', scheduledPhase: 4 },
      { id: 'eng-4', title: 'Run sprint evaluations', description: '', assignedBy: 'Project Admin', dueDate: d(35), priority: 'required', status: 'upcoming', scheduledPhase: 4 },
      { id: 'eng-5', title: 'Complete tool comparison', description: '', assignedBy: 'Project Admin', dueDate: d(42), priority: 'recommended', status: 'upcoming', scheduledPhase: 4 },
    ],
    marketing: [
      { id: 'm-1', title: 'Draft stakeholder communication plan', description: '', assignedBy: 'Project Admin', dueDate: d(14), priority: 'required', status: 'action_needed', ctaLabel: 'View Reports', ctaHref: 'reports/generate' },
      { id: 'm-2', title: 'Prepare FAQ document', description: '', assignedBy: 'Project Admin', dueDate: d(18), priority: 'recommended', status: 'action_needed', ctaLabel: 'Generate Reports', ctaHref: 'reports/generate' },
      { id: 'm-3', title: 'Create pilot announcement materials', description: '', assignedBy: 'Project Admin', dueDate: d(28), priority: 'recommended', status: 'upcoming', scheduledPhase: 4 },
      { id: 'm-4', title: 'Prepare post-pilot summary for leadership', description: '', assignedBy: 'Executive Sponsor', dueDate: d(50), priority: 'recommended', status: 'upcoming', scheduledPhase: 5 },
    ],
  };

  return tasksByRole[role] ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

const ALL_ROLES: UserRole[] = ['admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing'];

describe('My Tasks — Role-Specific Task Generation', () => {
  it('should return non-empty task lists for every role', () => {
    for (const role of ALL_ROLES) {
      const tasks = getTasksForRole(role);
      expect(tasks.length).toBeGreaterThan(0);
    }
  });

  it('should have unique task IDs within each role', () => {
    for (const role of ALL_ROLES) {
      const tasks = getTasksForRole(role);
      const ids = tasks.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('should have at least one action_needed task for every role', () => {
    for (const role of ALL_ROLES) {
      const tasks = getTasksForRole(role);
      const actionTasks = tasks.filter((t) => t.status === 'action_needed');
      expect(actionTasks.length).toBeGreaterThan(0);
    }
  });

  it('should have CTA links on action_needed tasks', () => {
    for (const role of ALL_ROLES) {
      const tasks = getTasksForRole(role);
      const actionTasks = tasks.filter((t) => t.status === 'action_needed');
      for (const task of actionTasks) {
        expect(task.ctaLabel).toBeDefined();
        expect(task.ctaHref).toBeDefined();
        expect(task.ctaHref!.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have valid due dates (ISO strings) on all tasks', () => {
    for (const role of ALL_ROLES) {
      const tasks = getTasksForRole(role);
      for (const task of tasks) {
        const parsed = new Date(task.dueDate);
        expect(isNaN(parsed.getTime())).toBe(false);
      }
    }
  });

  it('admin should have team management as first task', () => {
    const tasks = getTasksForRole('admin');
    expect(tasks[0].title).toContain('team members');
    expect(tasks[0].ctaHref).toBe('team');
  });

  it('consultant should have readiness questionnaire as first task', () => {
    const tasks = getTasksForRole('consultant');
    expect(tasks[0].title).toContain('readiness questionnaire');
    expect(tasks[0].ctaHref).toContain('questionnaire');
  });

  it('executive should have scope review as first task', () => {
    const tasks = getTasksForRole('executive');
    expect(tasks[0].title).toContain('scope');
  });

  it('IT should have data classification as first task', () => {
    const tasks = getTasksForRole('it');
    expect(tasks[0].title).toContain('data classification');
  });

  it('legal should have policy review as first task', () => {
    const tasks = getTasksForRole('legal');
    expect(tasks[0].title).toContain('Acceptable Use Policy');
  });

  it('engineering should have pilot scope as first task', () => {
    const tasks = getTasksForRole('engineering');
    expect(tasks[0].title).toContain('pilot project scope');
  });

  it('marketing should have communication plan as first task', () => {
    const tasks = getTasksForRole('marketing');
    expect(tasks[0].title).toContain('communication plan');
  });

  it('upcoming tasks should have scheduledPhase or blockedBy', () => {
    for (const role of ALL_ROLES) {
      const tasks = getTasksForRole(role);
      const upcoming = tasks.filter((t) => t.status === 'upcoming');
      for (const task of upcoming) {
        const hasContext = task.scheduledPhase !== undefined || task.blockedBy !== undefined;
        expect(hasContext).toBe(true);
      }
    }
  });

  it('task priorities should be valid values', () => {
    const validPriorities: TaskPriority[] = ['required', 'recommended', 'optional'];
    for (const role of ALL_ROLES) {
      const tasks = getTasksForRole(role);
      for (const task of tasks) {
        expect(validPriorities).toContain(task.priority);
      }
    }
  });

  it('each role should have at least one required task', () => {
    for (const role of ALL_ROLES) {
      const tasks = getTasksForRole(role);
      const required = tasks.filter((t) => t.priority === 'required');
      expect(required.length).toBeGreaterThan(0);
    }
  });

  it('most roles should have a mix of priorities', () => {
    let rolesWithMix = 0;
    for (const role of ALL_ROLES) {
      const tasks = getTasksForRole(role);
      const required = tasks.filter((t) => t.priority === 'required');
      if (tasks.length > required.length) rolesWithMix++;
    }
    expect(rolesWithMix).toBeGreaterThanOrEqual(5);
  });
});
