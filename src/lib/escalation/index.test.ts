import { describe, it, expect } from 'vitest';
import type { SlaPolicy, EscalationRecord, EscalationLevel } from '@/types';
import {
  DEFAULT_SLA_POLICIES,
  computeSlaStatus,
  computeEscalationLevel,
  evaluateEscalations,
  createEscalationRecord,
  getEscalationLevelLabel,
  getNextEscalationLevel,
} from './index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePolicy(overrides: Partial<SlaPolicy> = {}): SlaPolicy {
  return {
    id: 'sla-test',
    name: 'Test SLA',
    description: 'Test SLA policy',
    target_days: 14,
    warning_days: 10,
    applies_to: 'risk',
    escalation_chain: ['l1_owner', 'l2_manager', 'l3_director', 'l4_executive'],
    organization_id: 'org-test',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeEscalationRecord(overrides: Partial<EscalationRecord> = {}): EscalationRecord {
  return {
    id: 'esc-test',
    sla_policy_id: 'sla-test',
    resource_type: 'risk',
    resource_id: 'risk-1',
    project_id: 'proj-1',
    organization_id: 'org-test',
    current_level: 'l1_owner',
    status: 'within',
    opened_at: '2025-06-01T00:00:00Z',
    due_at: '2025-06-15T00:00:00Z',
    escalated_at: null,
    resolved_at: null,
    assigned_to: null,
    notes: null,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// DEFAULT_SLA_POLICIES
// ---------------------------------------------------------------------------

describe('DEFAULT_SLA_POLICIES', () => {
  it('should have 4 default policies', () => {
    expect(DEFAULT_SLA_POLICIES).toHaveLength(4);
  });

  it('each policy should have required fields', () => {
    for (const policy of DEFAULT_SLA_POLICIES) {
      expect(policy.id).toBeDefined();
      expect(policy.name).toBeDefined();
      expect(policy.target_days).toBeGreaterThan(0);
      expect(policy.warning_days).toBeLessThan(policy.target_days);
      expect(policy.escalation_chain.length).toBeGreaterThan(0);
    }
  });

  it('should include policies for risk, gate_review, control_failure, incident', () => {
    const applyTypes = DEFAULT_SLA_POLICIES.map((p) => p.applies_to);
    expect(applyTypes).toContain('risk');
    expect(applyTypes).toContain('gate_review');
    expect(applyTypes).toContain('control_failure');
    expect(applyTypes).toContain('incident');
  });

  it('incident SLA should have the shortest target_days (3)', () => {
    const incident = DEFAULT_SLA_POLICIES.find((p) => p.applies_to === 'incident');
    expect(incident?.target_days).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// computeSlaStatus
// ---------------------------------------------------------------------------

describe('computeSlaStatus', () => {
  const policy = makePolicy({ target_days: 14, warning_days: 10 });

  it('should return "within" when elapsed < warning_days', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-05T00:00:00Z'); // 4 days elapsed
    expect(computeSlaStatus(policy, openedAt, now)).toBe('within');
  });

  it('should return "warning" when elapsed >= warning_days but < target_days', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-11T00:00:00Z'); // 10 days elapsed
    expect(computeSlaStatus(policy, openedAt, now)).toBe('warning');
  });

  it('should return "warning" at exactly warning_days', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-11T00:00:00Z'); // exactly 10 days
    expect(computeSlaStatus(policy, openedAt, now)).toBe('warning');
  });

  it('should return "breached" when elapsed >= target_days', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-15T00:00:00Z'); // 14 days elapsed
    expect(computeSlaStatus(policy, openedAt, now)).toBe('breached');
  });

  it('should return "breached" when well past target_days', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-07-01T00:00:00Z'); // 30 days elapsed
    expect(computeSlaStatus(policy, openedAt, now)).toBe('breached');
  });

  it('should return "within" at day 0', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-01T00:00:00Z'); // 0 days
    expect(computeSlaStatus(policy, openedAt, now)).toBe('within');
  });
});

// ---------------------------------------------------------------------------
// computeEscalationLevel
// ---------------------------------------------------------------------------

describe('computeEscalationLevel', () => {
  const policy = makePolicy({
    target_days: 12,
    escalation_chain: ['l1_owner', 'l2_manager', 'l3_director', 'l4_executive'],
  });
  // 12 days / 4 levels = 3 days per level

  it('should return l1_owner in first segment (0-2 days)', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-02T00:00:00Z'); // 1 day
    expect(computeEscalationLevel(policy, openedAt, now)).toBe('l1_owner');
  });

  it('should return l2_manager in second segment (3-5 days)', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-04T00:00:00Z'); // 3 days
    expect(computeEscalationLevel(policy, openedAt, now)).toBe('l2_manager');
  });

  it('should return l3_director in third segment (6-8 days)', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-07T00:00:00Z'); // 6 days
    expect(computeEscalationLevel(policy, openedAt, now)).toBe('l3_director');
  });

  it('should return l4_executive in fourth segment (9-11 days)', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-10T00:00:00Z'); // 9 days
    expect(computeEscalationLevel(policy, openedAt, now)).toBe('l4_executive');
  });

  it('should cap at last level when past target_days', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-07-01T00:00:00Z'); // 30 days (way past)
    expect(computeEscalationLevel(policy, openedAt, now)).toBe('l4_executive');
  });

  it('should return l1_owner at day 0', () => {
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-01T00:00:00Z'); // 0 days
    expect(computeEscalationLevel(policy, openedAt, now)).toBe('l1_owner');
  });

  it('should handle policies with shorter escalation chain (3 levels)', () => {
    const shortPolicy = makePolicy({
      target_days: 9,
      escalation_chain: ['l1_owner', 'l2_manager', 'l3_director'],
    });
    // 9 days / 3 levels = 3 days per level
    const openedAt = '2025-06-01T00:00:00Z';

    expect(computeEscalationLevel(shortPolicy, openedAt, new Date('2025-06-02T00:00:00Z'))).toBe('l1_owner');
    expect(computeEscalationLevel(shortPolicy, openedAt, new Date('2025-06-04T00:00:00Z'))).toBe('l2_manager');
    expect(computeEscalationLevel(shortPolicy, openedAt, new Date('2025-06-07T00:00:00Z'))).toBe('l3_director');
  });

  it('should return l1_owner for empty escalation chain', () => {
    const emptyPolicy = makePolicy({ escalation_chain: [] });
    const openedAt = '2025-06-01T00:00:00Z';
    const now = new Date('2025-06-10T00:00:00Z');
    expect(computeEscalationLevel(emptyPolicy, openedAt, now)).toBe('l1_owner');
  });
});

// ---------------------------------------------------------------------------
// evaluateEscalations
// ---------------------------------------------------------------------------

describe('evaluateEscalations', () => {
  it('should skip resolved records', () => {
    const resolved = makeEscalationRecord({ resolved_at: '2025-06-10T00:00:00Z' });
    const policies = [makePolicy()];
    const now = new Date('2025-06-15T00:00:00Z');

    const results = evaluateEscalations([resolved], policies, now);
    expect(results).toHaveLength(0);
  });

  it('should update status and level for open records', () => {
    const record = makeEscalationRecord({
      opened_at: '2025-06-01T00:00:00Z',
      resolved_at: null,
      current_level: 'l1_owner',
      status: 'within',
    });
    const policy = makePolicy({
      id: 'sla-test',
      target_days: 14,
      warning_days: 10,
    });
    const now = new Date('2025-06-12T00:00:00Z'); // 11 days

    const results = evaluateEscalations([record], [policy], now);
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('warning');
    expect(results[0].current_level).not.toBe('l1_owner'); // Should have escalated
  });

  it('should mark status as breached when past target_days', () => {
    const record = makeEscalationRecord({
      opened_at: '2025-06-01T00:00:00Z',
      resolved_at: null,
    });
    const policy = makePolicy({ id: 'sla-test', target_days: 14, warning_days: 10 });
    const now = new Date('2025-06-20T00:00:00Z'); // 19 days

    const results = evaluateEscalations([record], [policy], now);
    expect(results[0].status).toBe('breached');
  });

  it('should not mutate the original records', () => {
    const record = makeEscalationRecord({
      opened_at: '2025-06-01T00:00:00Z',
      resolved_at: null,
    });
    const policy = makePolicy({ id: 'sla-test' });
    const now = new Date('2025-06-20T00:00:00Z');

    const originalLevel = record.current_level;
    evaluateEscalations([record], [policy], now);
    expect(record.current_level).toBe(originalLevel);
  });

  it('should return record unchanged if policy is not found', () => {
    const record = makeEscalationRecord({
      sla_policy_id: 'nonexistent',
      resolved_at: null,
    });
    const results = evaluateEscalations([record], [], new Date());
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(record.id);
  });

  it('should set escalated_at when level changes', () => {
    const record = makeEscalationRecord({
      opened_at: '2025-06-01T00:00:00Z',
      resolved_at: null,
      current_level: 'l1_owner',
      escalated_at: null,
    });
    const policy = makePolicy({
      id: 'sla-test',
      target_days: 12,
      escalation_chain: ['l1_owner', 'l2_manager', 'l3_director', 'l4_executive'],
    });
    // After 5 days with 3-day segments, should be at l2
    const now = new Date('2025-06-06T00:00:00Z');

    const results = evaluateEscalations([record], [policy], now);
    expect(results[0].current_level).not.toBe('l1_owner');
    expect(results[0].escalated_at).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// createEscalationRecord
// ---------------------------------------------------------------------------

describe('createEscalationRecord', () => {
  it('should create a record with correct fields', () => {
    const policy = makePolicy();
    const record = createEscalationRecord(policy, 'risk', 'risk-1', 'proj-1', 'user-1');

    expect(record.sla_policy_id).toBe(policy.id);
    expect(record.resource_type).toBe('risk');
    expect(record.resource_id).toBe('risk-1');
    expect(record.project_id).toBe('proj-1');
    expect(record.organization_id).toBe(policy.organization_id);
    expect(record.assigned_to).toBe('user-1');
    expect(record.status).toBe('within');
    expect(record.current_level).toBe('l1_owner');
    expect(record.resolved_at).toBeNull();
    expect(record.escalated_at).toBeNull();
    expect(record.notes).toBeNull();
  });

  it('should set due_at to target_days from now', () => {
    const policy = makePolicy({ target_days: 7 });
    const record = createEscalationRecord(policy, 'gate_review', 'gate-1', 'proj-1');

    const opened = new Date(record.opened_at);
    const due = new Date(record.due_at);
    const diffDays = (due.getTime() - opened.getTime()) / (1000 * 60 * 60 * 24);
    expect(Math.round(diffDays)).toBe(7);
  });

  it('should generate a unique id starting with "esc-"', () => {
    const policy = makePolicy();
    const record = createEscalationRecord(policy, 'risk', 'risk-1', 'proj-1');
    expect(record.id).toMatch(/^esc-/);
  });

  it('should handle null assignedTo', () => {
    const policy = makePolicy();
    const record = createEscalationRecord(policy, 'risk', 'risk-1', 'proj-1');
    expect(record.assigned_to).toBeNull();
  });

  it('should use first level in chain as current_level', () => {
    const policy = makePolicy({ escalation_chain: ['l2_manager', 'l3_director'] });
    const record = createEscalationRecord(policy, 'risk', 'risk-1', 'proj-1');
    expect(record.current_level).toBe('l2_manager');
  });
});

// ---------------------------------------------------------------------------
// getEscalationLevelLabel
// ---------------------------------------------------------------------------

describe('getEscalationLevelLabel', () => {
  it('should return "Owner" for l1_owner', () => {
    expect(getEscalationLevelLabel('l1_owner')).toBe('Owner');
  });

  it('should return "Manager" for l2_manager', () => {
    expect(getEscalationLevelLabel('l2_manager')).toBe('Manager');
  });

  it('should return "Director" for l3_director', () => {
    expect(getEscalationLevelLabel('l3_director')).toBe('Director');
  });

  it('should return "Executive" for l4_executive', () => {
    expect(getEscalationLevelLabel('l4_executive')).toBe('Executive');
  });
});

// ---------------------------------------------------------------------------
// getNextEscalationLevel
// ---------------------------------------------------------------------------

describe('getNextEscalationLevel', () => {
  it('should return l2_manager from l1_owner', () => {
    expect(getNextEscalationLevel('l1_owner')).toBe('l2_manager');
  });

  it('should return l3_director from l2_manager', () => {
    expect(getNextEscalationLevel('l2_manager')).toBe('l3_director');
  });

  it('should return l4_executive from l3_director', () => {
    expect(getNextEscalationLevel('l3_director')).toBe('l4_executive');
  });

  it('should return null from l4_executive (already at max)', () => {
    expect(getNextEscalationLevel('l4_executive')).toBeNull();
  });
});
