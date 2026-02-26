import { describe, it, expect } from 'vitest';
import type { UserRole } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Type matching project-plan page PlanTask
// ─────────────────────────────────────────────────────────────────────────────

type PlanTaskStatus = 'complete' | 'in_progress' | 'not_started' | 'blocked';
type PhaseStatus = 'complete' | 'in_progress' | 'not_started';

interface PlanTask {
  id: string;
  title: string;
  assignedRole: string;
  roleKey: UserRole | 'multiple';
  dueDate: string;
  completionDate?: string;
  status: PlanTaskStatus;
  blockedBy?: string;
}

interface Phase {
  number: number;
  name: string;
  status: PhaseStatus;
  completionDate?: string;
  tasks: PlanTask[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Replicate buildPhases for testing
// ─────────────────────────────────────────────────────────────────────────────

function buildPhases(): Phase[] {
  const today = new Date();
  const d = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString();
  };

  return [
    {
      number: 1, name: 'Scope & Assess', status: 'in_progress',
      tasks: [
        { id: 'p1-1', title: 'Invite team members and assign roles', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(3), status: 'not_started' },
        { id: 'p1-2', title: 'Complete pilot intake scorecard', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(5), status: 'not_started' },
        { id: 'p1-3', title: 'Complete readiness questionnaire (5 domains)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(5), status: 'not_started' },
        { id: 'p1-4', title: 'Review readiness results and prioritize gaps', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(7), status: 'not_started' },
        { id: 'p1-5', title: 'Track prerequisite completion', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(10), status: 'not_started' },
        { id: 'p1-6', title: 'Review project scope and risk classification', assignedRole: 'Executive Sponsor', roleKey: 'executive', dueDate: d(7), status: 'not_started' },
        { id: 'p1-7', title: 'Define pilot project scope and success criteria', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(12), status: 'not_started' },
        { id: 'p1-8', title: 'Capture baseline development metrics', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(14), status: 'not_started' },
      ],
    },
    {
      number: 2, name: 'Classify & Govern', status: 'not_started',
      tasks: [
        { id: 'p2-1', title: 'Complete data classification workflow', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(10), status: 'not_started' },
        { id: 'p2-2', title: 'Review security controls (9 categories)', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(14), status: 'not_started' },
        { id: 'p2-3', title: 'Draft Acceptable Use Policy', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(14), status: 'not_started', blockedBy: 'Readiness assessment' },
        { id: 'p2-4', title: 'Draft Incident Response Plan addendum', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(16), status: 'not_started' },
        { id: 'p2-5', title: 'Draft Data Classification Policy', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(16), status: 'not_started' },
        { id: 'p2-6', title: 'Map compliance controls (SOC 2, HIPAA, NIST, GDPR)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(18), status: 'not_started' },
        { id: 'p2-7', title: 'Review AUP and provide legal sign-off', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(16), status: 'not_started' },
        { id: 'p2-8', title: 'Review risk register and approve mitigations', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(18), status: 'not_started' },
        { id: 'p2-9', title: 'Complete compliance framework mapping review', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(18), status: 'not_started' },
        { id: 'p2-10', title: 'Build RACI matrix for all stakeholders', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(14), status: 'not_started' },
        { id: 'p2-11', title: 'Draft stakeholder communication plan', assignedRole: 'Communications Lead', roleKey: 'marketing', dueDate: d(14), status: 'not_started' },
      ],
    },
    {
      number: 3, name: 'Gate Reviews', status: 'not_started',
      tasks: [
        { id: 'p3-1', title: 'Prepare evidence package for Gate 1', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(20), status: 'not_started', blockedBy: 'Phase 2 artifacts' },
        { id: 'p3-2', title: 'Gate 1: Design Review sign-off', assignedRole: 'Executive Sponsor', roleKey: 'executive', dueDate: d(21), status: 'not_started' },
        { id: 'p3-3', title: 'Gate 2: Data & Security sign-off', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(22), status: 'not_started', blockedBy: 'Gate 1 approval' },
        { id: 'p3-4', title: 'Review IP and licensing terms', assignedRole: 'Legal / Compliance Lead', roleKey: 'legal', dueDate: d(24), status: 'not_started' },
        { id: 'p3-5', title: 'Gate 3: Launch Authorization', assignedRole: 'Executive Sponsor', roleKey: 'executive', dueDate: d(25), status: 'not_started', blockedBy: 'Gate 2 approval' },
        { id: 'p3-6', title: 'Schedule gate review meetings', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(20), status: 'not_started' },
      ],
    },
    {
      number: 4, name: 'Sandbox & Pilot', status: 'not_started',
      tasks: [
        { id: 'p4-1', title: 'Configure sandbox environment', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(28), status: 'not_started', blockedBy: 'Gate 3 approval' },
        { id: 'p4-2', title: 'Run sandbox validation checks (20+ checks)', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(30), status: 'not_started' },
        { id: 'p4-3', title: 'Set up developer tooling access', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(30), status: 'not_started' },
        { id: 'p4-4', title: 'Run Sprint 1 evaluation', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(35), status: 'not_started' },
        { id: 'p4-5', title: 'Run Sprint 2 evaluation', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(42), status: 'not_started' },
        { id: 'p4-6', title: 'Complete tool comparison (Claude Code vs. others)', assignedRole: 'Engineering Lead', roleKey: 'engineering', dueDate: d(42), status: 'not_started' },
        { id: 'p4-7', title: 'Monitor pilot security metrics', assignedRole: 'IT / Security Lead', roleKey: 'it', dueDate: d(42), status: 'not_started' },
        { id: 'p4-8', title: 'Prepare FAQ document', assignedRole: 'Communications Lead', roleKey: 'marketing', dueDate: d(30), status: 'not_started' },
        { id: 'p4-9', title: 'Create pilot announcement materials', assignedRole: 'Communications Lead', roleKey: 'marketing', dueDate: d(28), status: 'not_started' },
      ],
    },
    {
      number: 5, name: 'Evaluate & Decide', status: 'not_started',
      tasks: [
        { id: 'p5-1', title: 'Record outcome metrics (11 KPIs)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(45), status: 'not_started' },
        { id: 'p5-2', title: 'Generate executive decision brief', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(48), status: 'not_started' },
        { id: 'p5-3', title: 'Calculate ROI (NPV, IRR, scenario analysis)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(48), status: 'not_started' },
        { id: 'p5-4', title: 'Review executive brief and make go/no-go decision', assignedRole: 'Executive Sponsor', roleKey: 'executive', dueDate: d(50), status: 'not_started' },
        { id: 'p5-5', title: 'Generate persona-specific reports (PDF/DOCX)', assignedRole: 'Governance Consultant', roleKey: 'consultant', dueDate: d(50), status: 'not_started' },
        { id: 'p5-6', title: 'Prepare post-pilot summary for leadership', assignedRole: 'Communications Lead', roleKey: 'marketing', dueDate: d(52), status: 'not_started' },
        { id: 'p5-7', title: 'Archive project and export final documentation', assignedRole: 'Project Administrator', roleKey: 'admin', dueDate: d(55), status: 'not_started' },
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Project Plan — Phase Task Data', () => {
  const phases = buildPhases();

  it('should have exactly 5 phases', () => {
    expect(phases).toHaveLength(5);
  });

  it('should have correct phase names', () => {
    expect(phases[0].name).toBe('Scope & Assess');
    expect(phases[1].name).toBe('Classify & Govern');
    expect(phases[2].name).toBe('Gate Reviews');
    expect(phases[3].name).toBe('Sandbox & Pilot');
    expect(phases[4].name).toBe('Evaluate & Decide');
  });

  it('should have Phase 1 as in_progress', () => {
    expect(phases[0].status).toBe('in_progress');
  });

  it('should have remaining phases as not_started', () => {
    for (let i = 1; i < phases.length; i++) {
      expect(phases[i].status).toBe('not_started');
    }
  });

  it('every phase should have tasks', () => {
    for (const phase of phases) {
      expect(phase.tasks.length).toBeGreaterThan(0);
    }
  });

  it('all task IDs should be globally unique', () => {
    const allIds = phases.flatMap((p) => p.tasks.map((t) => t.id));
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('should distribute tasks across all 7 roles', () => {
    const allRoles = new Set(phases.flatMap((p) => p.tasks.map((t) => t.roleKey)));
    const expectedRoles: Array<UserRole> = ['admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing'];
    for (const role of expectedRoles) {
      expect(allRoles.has(role)).toBe(true);
    }
  });

  it('total task count should be 41', () => {
    const total = phases.reduce((sum, p) => sum + p.tasks.length, 0);
    expect(total).toBe(41);
  });

  it('Phase 1 should have tasks for admin, consultant, executive, and engineering', () => {
    const p1Roles = new Set(phases[0].tasks.map((t) => t.roleKey));
    expect(p1Roles.has('admin')).toBe(true);
    expect(p1Roles.has('consultant')).toBe(true);
    expect(p1Roles.has('executive')).toBe(true);
    expect(p1Roles.has('engineering')).toBe(true);
  });

  it('Phase 2 should include legal, IT, and marketing tasks', () => {
    const p2Roles = new Set(phases[1].tasks.map((t) => t.roleKey));
    expect(p2Roles.has('legal')).toBe(true);
    expect(p2Roles.has('it')).toBe(true);
    expect(p2Roles.has('marketing')).toBe(true);
  });

  it('Phase 3 (Gate Reviews) should include executive sign-offs', () => {
    const execTasks = phases[2].tasks.filter((t) => t.roleKey === 'executive');
    expect(execTasks.length).toBeGreaterThanOrEqual(2);
    expect(execTasks.some((t) => t.title.includes('Gate 1'))).toBe(true);
    expect(execTasks.some((t) => t.title.includes('Gate 3'))).toBe(true);
  });

  it('Phase 4 (Sandbox & Pilot) should include engineering and IT tasks', () => {
    const p4Roles = new Set(phases[3].tasks.map((t) => t.roleKey));
    expect(p4Roles.has('engineering')).toBe(true);
    expect(p4Roles.has('it')).toBe(true);
  });

  it('Phase 5 (Evaluate & Decide) should include consultant, executive, and admin', () => {
    const p5Roles = new Set(phases[4].tasks.map((t) => t.roleKey));
    expect(p5Roles.has('consultant')).toBe(true);
    expect(p5Roles.has('executive')).toBe(true);
    expect(p5Roles.has('admin')).toBe(true);
  });

  it('all due dates should be valid ISO strings', () => {
    for (const phase of phases) {
      for (const task of phase.tasks) {
        const parsed = new Date(task.dueDate);
        expect(isNaN(parsed.getTime())).toBe(false);
      }
    }
  });

  it('due dates within each phase should span a reasonable range', () => {
    for (const phase of phases) {
      const dates = phase.tasks.map((t) => new Date(t.dueDate).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const rangeInDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
      // Tasks within a phase should span at most 30 days
      expect(rangeInDays).toBeLessThanOrEqual(30);
    }
  });

  it('blocked tasks should have blockedBy description', () => {
    for (const phase of phases) {
      for (const task of phase.tasks) {
        if (task.status === 'blocked') {
          expect(task.blockedBy).toBeDefined();
        }
      }
    }
  });
});
