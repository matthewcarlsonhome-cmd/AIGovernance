import { describe, it, expect } from 'vitest';
import type { ProjectState, GovernanceGateType, GovernanceGateDecision, UserRole } from '@/types';
import {
  STATE_TRANSITIONS,
  STATE_ORDER,
  STATE_LABELS,
  getAvailableTransitions,
  canTransition,
  getStateProgress,
  getBlockers,
} from './index';
import type { TransitionGuardContext } from './index';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('State Machine Constants', () => {
  it('STATE_ORDER should have 7 states', () => {
    expect(STATE_ORDER).toHaveLength(7);
  });

  it('STATE_ORDER should start with draft and end with decision_finalized', () => {
    expect(STATE_ORDER[0]).toBe('draft');
    expect(STATE_ORDER[STATE_ORDER.length - 1]).toBe('decision_finalized');
  });

  it('STATE_LABELS should have labels for all 7 states', () => {
    for (const state of STATE_ORDER) {
      expect(STATE_LABELS[state]).toBeDefined();
      expect(STATE_LABELS[state].length).toBeGreaterThan(0);
    }
  });

  it('STATE_TRANSITIONS should define 6 transitions (7 states - 1)', () => {
    expect(STATE_TRANSITIONS).toHaveLength(6);
  });

  it('Each transition should have from, to, required_role, required_gates', () => {
    for (const t of STATE_TRANSITIONS) {
      expect(t.from).toBeDefined();
      expect(t.to).toBeDefined();
      expect(Array.isArray(t.required_role)).toBe(true);
      expect(Array.isArray(t.required_gates)).toBe(true);
      expect(t.label).toBeDefined();
      expect(t.description).toBeDefined();
    }
  });

  it('Transitions should form a sequential chain matching STATE_ORDER', () => {
    for (let i = 0; i < STATE_TRANSITIONS.length; i++) {
      expect(STATE_TRANSITIONS[i].from).toBe(STATE_ORDER[i]);
      expect(STATE_TRANSITIONS[i].to).toBe(STATE_ORDER[i + 1]);
    }
  });
});

// ---------------------------------------------------------------------------
// getAvailableTransitions
// ---------------------------------------------------------------------------

describe('getAvailableTransitions', () => {
  it('should return one transition from "draft"', () => {
    const transitions = getAvailableTransitions('draft');
    expect(transitions).toHaveLength(1);
    expect(transitions[0].to).toBe('scoped');
  });

  it('should return one transition from each intermediate state', () => {
    const intermediateStates: ProjectState[] = [
      'scoped',
      'data_approved',
      'security_approved',
      'pilot_running',
      'review_complete',
    ];
    for (const state of intermediateStates) {
      const transitions = getAvailableTransitions(state);
      expect(transitions).toHaveLength(1);
    }
  });

  it('should return no transitions from "decision_finalized"', () => {
    const transitions = getAvailableTransitions('decision_finalized');
    expect(transitions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// canTransition — valid transitions
// ---------------------------------------------------------------------------

describe('canTransition — valid transitions', () => {
  it('should allow draft → scoped for admin with no gates required', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'draft',
      target_state: 'scoped',
      actor_role: 'admin',
      gate_decisions: [],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.transition).not.toBeNull();
  });

  it('should allow scoped → data_approved when data_approval gate is approved', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'scoped',
      target_state: 'data_approved',
      actor_role: 'admin',
      gate_decisions: [{ gate_type: 'data_approval', decision: 'approved' }],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(true);
  });

  it('should allow transition with conditionally_approved gate', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'scoped',
      target_state: 'data_approved',
      actor_role: 'consultant',
      gate_decisions: [{ gate_type: 'data_approval', decision: 'conditionally_approved' }],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(true);
  });

  it('should allow security_approved → pilot_running with launch_review gate approved', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'security_approved',
      target_state: 'pilot_running',
      actor_role: 'executive',
      gate_decisions: [{ gate_type: 'launch_review', decision: 'approved' }],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(true);
  });

  it('should allow review_complete → decision_finalized for executive', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'review_complete',
      target_state: 'decision_finalized',
      actor_role: 'executive',
      gate_decisions: [],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// canTransition — invalid transitions
// ---------------------------------------------------------------------------

describe('canTransition — invalid transitions', () => {
  it('should reject non-existent transition (skipping states)', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'draft',
      target_state: 'pilot_running',
      actor_role: 'admin',
      gate_decisions: [],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('No valid transition');
  });

  it('should reject backward transition', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'scoped',
      target_state: 'draft',
      actor_role: 'admin',
      gate_decisions: [],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('No valid transition');
  });

  it('should reject same-state transition', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'draft',
      target_state: 'draft',
      actor_role: 'admin',
      gate_decisions: [],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// canTransition — role-based guards
// ---------------------------------------------------------------------------

describe('canTransition — role-based guards', () => {
  it('should reject marketing role for draft → scoped', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'draft',
      target_state: 'scoped',
      actor_role: 'marketing',
      gate_decisions: [],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Role "marketing"');
    expect(result.reason).toContain('not authorized');
  });

  it('should reject engineering role for review_complete → decision_finalized', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'review_complete',
      target_state: 'decision_finalized',
      actor_role: 'engineering',
      gate_decisions: [],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Role "engineering"');
  });

  it('should reject legal for draft → scoped (not in required_role list)', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'draft',
      target_state: 'scoped',
      actor_role: 'legal',
      gate_decisions: [],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
  });

  it('should accept IT role for scoped → data_approved when gate approved', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'scoped',
      target_state: 'data_approved',
      actor_role: 'it',
      gate_decisions: [{ gate_type: 'data_approval', decision: 'approved' }],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// canTransition — gate-based guards
// ---------------------------------------------------------------------------

describe('canTransition — gate requirement guards', () => {
  it('should reject when required gate has not been submitted', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'scoped',
      target_state: 'data_approved',
      actor_role: 'admin',
      gate_decisions: [], // no gate decisions at all
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('data_approval');
    expect(result.reason).toContain('has not been submitted');
  });

  it('should reject when required gate is rejected', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'scoped',
      target_state: 'data_approved',
      actor_role: 'admin',
      gate_decisions: [{ gate_type: 'data_approval', decision: 'rejected' }],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('rejected');
  });

  it('should reject when required gate is deferred', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'scoped',
      target_state: 'data_approved',
      actor_role: 'admin',
      gate_decisions: [{ gate_type: 'data_approval', decision: 'deferred' }],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
  });

  it('should reject when required gate is pending', () => {
    const ctx: TransitionGuardContext = {
      current_state: 'data_approved',
      target_state: 'security_approved',
      actor_role: 'admin',
      gate_decisions: [{ gate_type: 'security_review', decision: 'pending' }],
    };
    const result = canTransition(ctx);
    expect(result.allowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStateProgress
// ---------------------------------------------------------------------------

describe('getStateProgress', () => {
  it('should return 0% for draft', () => {
    expect(getStateProgress('draft')).toBe(0);
  });

  it('should return 100% for decision_finalized', () => {
    expect(getStateProgress('decision_finalized')).toBe(100);
  });

  it('should return values between 0 and 100 for intermediate states', () => {
    const intermediateStates: ProjectState[] = [
      'scoped',
      'data_approved',
      'security_approved',
      'pilot_running',
      'review_complete',
    ];
    let prev = 0;
    for (const state of intermediateStates) {
      const progress = getStateProgress(state);
      expect(progress).toBeGreaterThan(prev);
      expect(progress).toBeLessThan(100);
      prev = progress;
    }
  });

  it('should return 0 for unknown state', () => {
    expect(getStateProgress('nonexistent' as ProjectState)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getBlockers
// ---------------------------------------------------------------------------

describe('getBlockers', () => {
  it('should return empty array from decision_finalized (no transitions)', () => {
    const blockers = getBlockers('decision_finalized', 'admin', []);
    expect(blockers).toEqual([]);
  });

  it('should return blockers when role is not authorized', () => {
    const blockers = getBlockers('draft', 'marketing', []);
    expect(blockers.length).toBeGreaterThan(0);
    expect(blockers[0]).toContain('marketing');
  });

  it('should return gate-related blockers when required gate is missing', () => {
    const blockers = getBlockers('scoped', 'admin', []);
    expect(blockers.length).toBeGreaterThan(0);
    expect(blockers.some((b) => b.includes('data_approval'))).toBe(true);
  });

  it('should return empty array when all conditions are met for next transition', () => {
    const blockers = getBlockers('draft', 'admin', []);
    // draft → scoped requires admin (met) and no gates
    expect(blockers).toEqual([]);
  });
});
