// Risk Exception and Acceptance Workflow (Design Doc v3 §5.1D)
// Time-bound exceptions with compensating controls, expiry reminders, and escalation.

import type { RiskException, ExceptionStatus } from '@/types';

export interface CreateExceptionInput {
  project_id: string;
  organization_id: string;
  risk_id?: string;
  control_id?: string;
  title: string;
  justification: string;
  compensating_controls: string[];
  requested_by: string;
  duration_days: number;
}

export function createRiskException(input: CreateExceptionInput): RiskException {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + input.duration_days);

  return {
    id: crypto.randomUUID(),
    project_id: input.project_id,
    organization_id: input.organization_id,
    risk_id: input.risk_id ?? null,
    control_id: input.control_id ?? null,
    title: input.title,
    justification: input.justification,
    compensating_controls: input.compensating_controls,
    requested_by: input.requested_by,
    requested_at: now.toISOString(),
    approved_by: null,
    approved_at: null,
    expires_at: expiresAt.toISOString(),
    status: 'requested',
    expiry_reminder_sent: false,
    notes: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

export function approveException(
  exception: RiskException,
  approvedBy: string,
): RiskException {
  return {
    ...exception,
    status: 'approved',
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function denyException(
  exception: RiskException,
  deniedBy: string,
  reason: string,
): RiskException {
  return {
    ...exception,
    status: 'denied',
    approved_by: deniedBy,
    approved_at: new Date().toISOString(),
    notes: reason,
    updated_at: new Date().toISOString(),
  };
}

export function revokeException(
  exception: RiskException,
  revokedBy: string,
  reason: string,
): RiskException {
  return {
    ...exception,
    status: 'revoked',
    notes: `Revoked by ${revokedBy}: ${reason}`,
    updated_at: new Date().toISOString(),
  };
}

export function checkExpirations(
  exceptions: RiskException[],
  now: Date = new Date(),
): { expired: RiskException[]; expiring_soon: RiskException[] } {
  const expired: RiskException[] = [];
  const expiring_soon: RiskException[] = [];
  const warningDays = 7;

  for (const exc of exceptions) {
    if (exc.status !== 'approved') continue;

    const expiresAt = new Date(exc.expires_at);
    if (expiresAt <= now) {
      expired.push({ ...exc, status: 'expired', updated_at: now.toISOString() });
    } else {
      const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry <= warningDays) {
        expiring_soon.push(exc);
      }
    }
  }

  return { expired, expiring_soon };
}

export function getDemoExceptions(projectId: string): RiskException[] {
  const now = new Date();
  const twoWeeksFromNow = new Date(now);
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      id: 'exc-001',
      project_id: projectId,
      organization_id: 'org-demo-001',
      risk_id: 'risk-001',
      control_id: null,
      title: 'Temporary exception for DLP scanning gap',
      justification: 'DLP vendor migration in progress. Manual code review in place as compensating control.',
      compensating_controls: ['Manual code review on all PRs', 'Restricted repository access', 'Weekly audit of AI interactions'],
      requested_by: 'user-001',
      requested_at: '2025-06-01T10:00:00Z',
      approved_by: 'user-002',
      approved_at: '2025-06-01T14:00:00Z',
      expires_at: twoWeeksFromNow.toISOString(),
      status: 'approved',
      expiry_reminder_sent: false,
      notes: null,
      created_at: '2025-06-01T10:00:00Z',
      updated_at: '2025-06-01T14:00:00Z',
    },
    {
      id: 'exc-002',
      project_id: projectId,
      organization_id: 'org-demo-001',
      risk_id: null,
      control_id: 'ctrl-audit-log',
      title: 'Audit logging partial coverage exception',
      justification: 'New logging infrastructure deploying next sprint. Current logs capture 80% of events.',
      compensating_controls: ['Manual audit trail via ticket system', 'Daily log review by security team'],
      requested_by: 'user-003',
      requested_at: '2025-06-10T08:00:00Z',
      approved_by: null,
      approved_at: null,
      expires_at: threeDaysFromNow.toISOString(),
      status: 'requested',
      expiry_reminder_sent: false,
      notes: null,
      created_at: '2025-06-10T08:00:00Z',
      updated_at: '2025-06-10T08:00:00Z',
    },
    {
      id: 'exc-003',
      project_id: projectId,
      organization_id: 'org-demo-001',
      risk_id: 'risk-003',
      control_id: null,
      title: 'Cross-border data transfer temporary allowance',
      justification: 'Vendor API endpoint migration to EU region scheduled for next month.',
      compensating_controls: ['Standard Contractual Clauses in place', 'Data minimization policy enforced', 'Encryption in transit and at rest'],
      requested_by: 'user-001',
      requested_at: '2025-05-15T09:00:00Z',
      approved_by: 'user-002',
      approved_at: '2025-05-15T16:00:00Z',
      expires_at: yesterday.toISOString(),
      status: 'approved',
      expiry_reminder_sent: true,
      notes: null,
      created_at: '2025-05-15T09:00:00Z',
      updated_at: '2025-05-15T16:00:00Z',
    },
  ];
}
