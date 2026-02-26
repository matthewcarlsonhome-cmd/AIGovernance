import { describe, it, expect } from 'vitest';
import type { ProjectStateForActions } from '@/lib/progress/next-actions';
import type { ProjectPhase } from '@/lib/tasks/role-assignment';
import {
  PHASE_EXIT_CRITERIA,
  evaluatePhaseStatus,
  evaluateAllPhases,
  getActivePhase,
  canAdvancePhase,
  getPhaseForProjectStatus,
} from './phase-gating';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProjectState(overrides: Partial<ProjectStateForActions> = {}): ProjectStateForActions {
  return {
    projectId: 'proj-test',
    currentPhase: 'discovery',
    questionnaireComplete: false,
    readinessScored: false,
    dataReadinessReviewed: false,
    prerequisitesComplete: false,
    policiesDrafted: false,
    complianceMapped: false,
    riskClassified: false,
    raciDefined: false,
    ethicsReviewed: false,
    gates: [],
    securityPassRate: 0,
    criticalSecurityFailures: 0,
    sandboxConfigCreated: false,
    sandboxValidated: false,
    pilotDesigned: false,
    pilotLaunched: false,
    metricsCollected: false,
    dataClassificationComplete: false,
    reportsGenerated: false,
    roiCalculated: false,
    teamAssigned: false,
    ...overrides,
  };
}

function makeCompletePhase1State(): Partial<ProjectStateForActions> {
  return {
    questionnaireComplete: true,
    readinessScored: true,
    teamAssigned: true,
    prerequisitesComplete: true,
  };
}

function makeCompletePhase2State(): Partial<ProjectStateForActions> {
  return {
    ...makeCompletePhase1State(),
    policiesDrafted: true,
    complianceMapped: true,
    riskClassified: true,
    dataClassificationComplete: true,
    raciDefined: true,
  };
}

function makeCompletePhase3State(): Partial<ProjectStateForActions> {
  return {
    ...makeCompletePhase2State(),
    gates: [
      { gate_type: 'design_review', decision: 'approved' },
      { gate_type: 'data_approval', decision: 'approved' },
      { gate_type: 'security_review', decision: 'approved' },
    ],
    criticalSecurityFailures: 0,
  };
}

function makeCompletePhase4State(): Partial<ProjectStateForActions> {
  return {
    ...makeCompletePhase3State(),
    sandboxConfigCreated: true,
    sandboxValidated: true,
    pilotDesigned: true,
    pilotLaunched: true,
  };
}

function makeAllPhasesCompleteState(): Partial<ProjectStateForActions> {
  return {
    ...makeCompletePhase4State(),
    metricsCollected: true,
    roiCalculated: true,
    reportsGenerated: true,
    gates: [
      { gate_type: 'design_review', decision: 'approved' },
      { gate_type: 'data_approval', decision: 'approved' },
      { gate_type: 'security_review', decision: 'approved' },
      { gate_type: 'launch_review', decision: 'approved' },
    ],
  };
}

// ---------------------------------------------------------------------------
// PHASE_EXIT_CRITERIA
// ---------------------------------------------------------------------------

describe('PHASE_EXIT_CRITERIA', () => {
  it('should define exit criteria for all 5 phases', () => {
    expect(PHASE_EXIT_CRITERIA).toHaveLength(5);
    const phases = PHASE_EXIT_CRITERIA.map((ec) => ec.phase);
    expect(phases).toContain('scope_assess');
    expect(phases).toContain('classify_govern');
    expect(phases).toContain('approve_gate');
    expect(phases).toContain('build_test');
    expect(phases).toContain('evaluate_decide');
  });

  it('each phase should have at least one criterion', () => {
    for (const ec of PHASE_EXIT_CRITERIA) {
      expect(ec.criteria.length).toBeGreaterThan(0);
    }
  });

  it('each criterion should have required fields', () => {
    for (const ec of PHASE_EXIT_CRITERIA) {
      for (const c of ec.criteria) {
        expect(c.id).toBeDefined();
        expect(c.label).toBeDefined();
        expect(c.description).toBeDefined();
        expect(typeof c.check).toBe('function');
        expect(typeof c.required).toBe('boolean');
        expect(Array.isArray(c.assigned_roles)).toBe(true);
      }
    }
  });

  it('Phase 1 (scope_assess) should have 4 criteria', () => {
    const p1 = PHASE_EXIT_CRITERIA.find((ec) => ec.phase === 'scope_assess');
    expect(p1?.criteria).toHaveLength(4);
  });

  it('Phase 3 (approve_gate) should require gate approvals', () => {
    const p3 = PHASE_EXIT_CRITERIA.find((ec) => ec.phase === 'approve_gate');
    const labels = p3?.criteria.map((c) => c.label) ?? [];
    expect(labels.some((l) => l.includes('Design Review'))).toBe(true);
    expect(labels.some((l) => l.includes('Data Approval'))).toBe(true);
    expect(labels.some((l) => l.includes('Security Review'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluatePhaseStatus — Phase 1 (scope_assess)
// ---------------------------------------------------------------------------

describe('evaluatePhaseStatus — Phase 1 (scope_assess)', () => {
  it('should be active with no criteria met for a fresh project', () => {
    const state = makeProjectState();
    const status = evaluatePhaseStatus('scope_assess', state);
    expect(status.status).toBe('active');
    expect(status.criteria_met).toBe(0);
    expect(status.percentage).toBe(0);
    expect(status.blockers.length).toBeGreaterThan(0);
  });

  it('should be complete when all required criteria are met', () => {
    const state = makeProjectState(makeCompletePhase1State());
    const status = evaluatePhaseStatus('scope_assess', state);
    expect(status.status).toBe('complete');
    expect(status.criteria_met).toBe(4);
    expect(status.percentage).toBe(100);
    expect(status.blockers).toHaveLength(0);
  });

  it('should remain active when only some required criteria are met', () => {
    const state = makeProjectState({
      questionnaireComplete: true,
      readinessScored: true,
      teamAssigned: false,
    });
    const status = evaluatePhaseStatus('scope_assess', state);
    expect(status.status).toBe('active');
    expect(status.criteria_met).toBe(2);
    expect(status.blockers).toContain('Team assigned');
  });

  it('should show partial percentage', () => {
    const state = makeProjectState({
      questionnaireComplete: true,
      readinessScored: false,
      teamAssigned: false,
    });
    const status = evaluatePhaseStatus('scope_assess', state);
    // 1 of 4 criteria met = 25%
    expect(status.percentage).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// evaluatePhaseStatus — Phase 2 (classify_govern)
// ---------------------------------------------------------------------------

describe('evaluatePhaseStatus — Phase 2 (classify_govern)', () => {
  it('should be locked when Phase 1 required criteria not met', () => {
    const state = makeProjectState();
    const status = evaluatePhaseStatus('classify_govern', state);
    expect(status.status).toBe('locked');
  });

  it('should be active when Phase 1 is complete', () => {
    const state = makeProjectState({
      ...makeCompletePhase1State(),
      policiesDrafted: false,
    });
    const status = evaluatePhaseStatus('classify_govern', state);
    expect(status.status).toBe('active');
  });

  it('should be complete when all required criteria met', () => {
    const state = makeProjectState(makeCompletePhase2State());
    const status = evaluatePhaseStatus('classify_govern', state);
    expect(status.status).toBe('complete');
  });
});

// ---------------------------------------------------------------------------
// evaluatePhaseStatus — Phase 3 (approve_gate)
// ---------------------------------------------------------------------------

describe('evaluatePhaseStatus — Phase 3 (approve_gate)', () => {
  it('should require all three gate approvals', () => {
    const state = makeProjectState({
      ...makeCompletePhase2State(),
      gates: [],
    });
    const status = evaluatePhaseStatus('approve_gate', state);
    expect(status.blockers.length).toBeGreaterThan(0);
  });

  it('should accept conditionally_approved gates', () => {
    const state = makeProjectState({
      ...makeCompletePhase2State(),
      gates: [
        { gate_type: 'design_review', decision: 'conditionally_approved' },
        { gate_type: 'data_approval', decision: 'approved' },
        { gate_type: 'security_review', decision: 'approved' },
      ],
      criticalSecurityFailures: 0,
    });
    const status = evaluatePhaseStatus('approve_gate', state);
    expect(status.status).toBe('complete');
  });

  it('should block when critical security failures > 0', () => {
    const state = makeProjectState({
      ...makeCompletePhase2State(),
      gates: [
        { gate_type: 'design_review', decision: 'approved' },
        { gate_type: 'data_approval', decision: 'approved' },
        { gate_type: 'security_review', decision: 'approved' },
      ],
      criticalSecurityFailures: 2,
    });
    const status = evaluatePhaseStatus('approve_gate', state);
    expect(status.blockers).toContain('No critical security failures');
  });
});

// ---------------------------------------------------------------------------
// evaluatePhaseStatus — Phase 4 and 5
// ---------------------------------------------------------------------------

describe('evaluatePhaseStatus — Phase 4 (build_test)', () => {
  it('should require sandbox and pilot configuration', () => {
    const state = makeProjectState(makeCompletePhase3State());
    const status = evaluatePhaseStatus('build_test', state);
    expect(status.blockers).toContain('Sandbox configured');
    expect(status.blockers).toContain('Sandbox validated');
    expect(status.blockers).toContain('Pilot designed');
    expect(status.blockers).toContain('Pilot launched');
  });

  it('should be complete when all sandbox + pilot criteria met', () => {
    const state = makeProjectState(makeCompletePhase4State());
    const status = evaluatePhaseStatus('build_test', state);
    expect(status.status).toBe('complete');
  });
});

describe('evaluatePhaseStatus — Phase 5 (evaluate_decide)', () => {
  it('should require metrics, ROI, reports, and launch gate', () => {
    const state = makeProjectState(makeCompletePhase4State());
    const status = evaluatePhaseStatus('evaluate_decide', state);
    expect(status.blockers).toContain('Metrics collected');
    expect(status.blockers).toContain('ROI calculated');
    expect(status.blockers).toContain('Reports generated');
    expect(status.blockers).toContain('Decision recorded');
  });

  it('should be complete when all criteria met including launch_review gate', () => {
    const state = makeProjectState(makeAllPhasesCompleteState());
    const status = evaluatePhaseStatus('evaluate_decide', state);
    expect(status.status).toBe('complete');
  });
});

// ---------------------------------------------------------------------------
// evaluateAllPhases
// ---------------------------------------------------------------------------

describe('evaluateAllPhases', () => {
  it('should return statuses for all 5 phases', () => {
    const state = makeProjectState();
    const statuses = evaluateAllPhases(state);
    expect(statuses).toHaveLength(5);
  });

  it('fresh project: Phase 1 active, phases 2-5 locked', () => {
    const state = makeProjectState();
    const statuses = evaluateAllPhases(state);
    expect(statuses[0].status).toBe('active');
    for (let i = 1; i < statuses.length; i++) {
      expect(statuses[i].status).toBe('locked');
    }
  });

  it('all complete: all 5 phases should be complete', () => {
    const state = makeProjectState(makeAllPhasesCompleteState());
    const statuses = evaluateAllPhases(state);
    for (const s of statuses) {
      expect(s.status).toBe('complete');
    }
  });
});

// ---------------------------------------------------------------------------
// getActivePhase
// ---------------------------------------------------------------------------

describe('getActivePhase', () => {
  it('should return scope_assess for a fresh project', () => {
    const state = makeProjectState();
    expect(getActivePhase(state)).toBe('scope_assess');
  });

  it('should return classify_govern when Phase 1 is complete', () => {
    const state = makeProjectState(makeCompletePhase1State());
    expect(getActivePhase(state)).toBe('classify_govern');
  });

  it('should return approve_gate when Phases 1-2 are complete', () => {
    const state = makeProjectState(makeCompletePhase2State());
    expect(getActivePhase(state)).toBe('approve_gate');
  });

  it('should return build_test when Phases 1-3 are complete', () => {
    const state = makeProjectState(makeCompletePhase3State());
    expect(getActivePhase(state)).toBe('build_test');
  });

  it('should return evaluate_decide when Phases 1-4 are complete', () => {
    const state = makeProjectState(makeCompletePhase4State());
    expect(getActivePhase(state)).toBe('evaluate_decide');
  });

  it('should return evaluate_decide when all phases are complete', () => {
    const state = makeProjectState(makeAllPhasesCompleteState());
    expect(getActivePhase(state)).toBe('evaluate_decide');
  });
});

// ---------------------------------------------------------------------------
// canAdvancePhase
// ---------------------------------------------------------------------------

describe('canAdvancePhase', () => {
  it('should NOT advance scope_assess when required criteria are missing', () => {
    const state = makeProjectState();
    const result = canAdvancePhase('scope_assess', state);
    expect(result.canAdvance).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it('should advance scope_assess when all required criteria met', () => {
    const state = makeProjectState(makeCompletePhase1State());
    const result = canAdvancePhase('scope_assess', state);
    expect(result.canAdvance).toBe(true);
    expect(result.blockers).toHaveLength(0);
  });

  it('should report specific blockers for missing criteria', () => {
    const state = makeProjectState({
      questionnaireComplete: true,
      readinessScored: false,
      teamAssigned: false,
    });
    const result = canAdvancePhase('scope_assess', state);
    expect(result.canAdvance).toBe(false);
    expect(result.blockers).toContain('Readiness assessed');
    expect(result.blockers).toContain('Team assigned');
  });

  it('should not include optional criteria in blockers', () => {
    const state = makeProjectState({
      questionnaireComplete: true,
      readinessScored: true,
      teamAssigned: true,
      prerequisitesComplete: false, // This is optional in Phase 1
    });
    const result = canAdvancePhase('scope_assess', state);
    expect(result.canAdvance).toBe(true);
    expect(result.blockers).not.toContain('Prerequisites started');
  });
});

// ---------------------------------------------------------------------------
// getPhaseForProjectStatus
// ---------------------------------------------------------------------------

describe('getPhaseForProjectStatus', () => {
  it('should map discovery to scope_assess', () => {
    expect(getPhaseForProjectStatus('discovery')).toBe('scope_assess');
  });

  it('should map governance to classify_govern', () => {
    expect(getPhaseForProjectStatus('governance')).toBe('classify_govern');
  });

  it('should map sandbox to approve_gate', () => {
    expect(getPhaseForProjectStatus('sandbox')).toBe('approve_gate');
  });

  it('should map pilot to build_test', () => {
    expect(getPhaseForProjectStatus('pilot')).toBe('build_test');
  });

  it('should map evaluation to evaluate_decide', () => {
    expect(getPhaseForProjectStatus('evaluation')).toBe('evaluate_decide');
  });

  it('should map production to evaluate_decide', () => {
    expect(getPhaseForProjectStatus('production')).toBe('evaluate_decide');
  });

  it('should map completed to evaluate_decide', () => {
    expect(getPhaseForProjectStatus('completed')).toBe('evaluate_decide');
  });
});
