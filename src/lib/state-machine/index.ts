// Canonical Project State Machine (Design Doc §6.2, Redesign §6.2)
// Enforces ordered state transitions with role and gate guards.
// Every transition emits an audit event via the domain event bus.

import type {
  ProjectState,
  StateTransition,
  UserRole,
  GovernanceGateType,
  GovernanceGateDecision,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Transition Definitions
// ─────────────────────────────────────────────────────────────────────────────

export const STATE_TRANSITIONS: StateTransition[] = [
  {
    from: 'draft',
    to: 'scoped',
    required_role: ['admin', 'consultant', 'executive'],
    required_gates: [],
    label: 'Scope Approved',
    description: 'Pilot scope, success metrics, and owners are defined.',
  },
  {
    from: 'scoped',
    to: 'data_approved',
    required_role: ['admin', 'consultant', 'it', 'legal'],
    required_gates: ['data_approval'],
    label: 'Data Approved',
    description: 'Data classification and handling rules have been approved.',
  },
  {
    from: 'data_approved',
    to: 'security_approved',
    required_role: ['admin', 'consultant', 'it'],
    required_gates: ['security_review'],
    label: 'Security Approved',
    description: 'Security baseline checks pass or exceptions are documented.',
  },
  {
    from: 'security_approved',
    to: 'pilot_running',
    required_role: ['admin', 'consultant', 'executive'],
    required_gates: ['launch_review'],
    label: 'Pilot Launched',
    description: 'All governance gates pass; pilot is approved to run.',
  },
  {
    from: 'pilot_running',
    to: 'review_complete',
    required_role: ['admin', 'consultant', 'executive'],
    required_gates: [],
    label: 'Review Complete',
    description: 'Pilot outcomes have been evaluated against success criteria.',
  },
  {
    from: 'review_complete',
    to: 'decision_finalized',
    required_role: ['admin', 'executive'],
    required_gates: [],
    label: 'Decision Finalized',
    description: 'Go/no-go decision has been made and documented.',
  },
];

export const STATE_ORDER: ProjectState[] = [
  'draft',
  'scoped',
  'data_approved',
  'security_approved',
  'pilot_running',
  'review_complete',
  'decision_finalized',
];

export const STATE_LABELS: Record<ProjectState, string> = {
  draft: 'Draft',
  scoped: 'Scoped',
  data_approved: 'Data Approved',
  security_approved: 'Security Approved',
  pilot_running: 'Pilot Running',
  review_complete: 'Review Complete',
  decision_finalized: 'Decision Finalized',
};

// ─────────────────────────────────────────────────────────────────────────────
// Guard Context (what we check before allowing a transition)
// ─────────────────────────────────────────────────────────────────────────────

export interface TransitionGuardContext {
  current_state: ProjectState;
  target_state: ProjectState;
  actor_role: UserRole;
  /** Gate decisions that have been made for this project */
  gate_decisions: { gate_type: GovernanceGateType; decision: GovernanceGateDecision }[];
}

export interface TransitionResult {
  allowed: boolean;
  reason: string | null;
  transition: StateTransition | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get available transitions from a given state.
 */
export function getAvailableTransitions(currentState: ProjectState): StateTransition[] {
  return STATE_TRANSITIONS.filter((t) => t.from === currentState);
}

/**
 * Check whether a specific transition is allowed.
 * Returns a result with reason if denied.
 */
export function canTransition(ctx: TransitionGuardContext): TransitionResult {
  const transition = STATE_TRANSITIONS.find(
    (t) => t.from === ctx.current_state && t.to === ctx.target_state,
  );

  if (!transition) {
    return {
      allowed: false,
      reason: `No valid transition from "${ctx.current_state}" to "${ctx.target_state}".`,
      transition: null,
    };
  }

  // Role check
  if (!transition.required_role.includes(ctx.actor_role)) {
    return {
      allowed: false,
      reason: `Role "${ctx.actor_role}" is not authorized. Required: ${transition.required_role.join(', ')}.`,
      transition,
    };
  }

  // Gate check: all required gates must have an approved/conditional decision
  const acceptableDecisions: GovernanceGateDecision[] = ['approved', 'conditionally_approved'];
  for (const requiredGate of transition.required_gates) {
    const gateDecision = ctx.gate_decisions.find((g) => g.gate_type === requiredGate);
    if (!gateDecision) {
      return {
        allowed: false,
        reason: `Required gate "${requiredGate}" has not been submitted.`,
        transition,
      };
    }
    if (!acceptableDecisions.includes(gateDecision.decision)) {
      return {
        allowed: false,
        reason: `Gate "${requiredGate}" was ${gateDecision.decision}. Must be approved.`,
        transition,
      };
    }
  }

  return { allowed: true, reason: null, transition };
}

/**
 * Get the completion percentage based on current state position.
 */
export function getStateProgress(state: ProjectState): number {
  const idx = STATE_ORDER.indexOf(state);
  if (idx < 0) return 0;
  return Math.round((idx / (STATE_ORDER.length - 1)) * 100);
}

/**
 * Get blockers preventing the next transition.
 */
export function getBlockers(
  currentState: ProjectState,
  actorRole: UserRole,
  gateDecisions: { gate_type: GovernanceGateType; decision: GovernanceGateDecision }[],
): string[] {
  const nextTransitions = getAvailableTransitions(currentState);
  if (nextTransitions.length === 0) return [];

  const blockers: string[] = [];
  for (const transition of nextTransitions) {
    const result = canTransition({
      current_state: currentState,
      target_state: transition.to,
      actor_role: actorRole,
      gate_decisions: gateDecisions,
    });
    if (!result.allowed && result.reason) {
      blockers.push(result.reason);
    }
  }
  return blockers;
}
