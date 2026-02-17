import { describe, it, expect } from 'vitest';
import {
  createRiskException,
  approveException,
  denyException,
  checkExpirations,
  getDemoExceptions,
} from '@/lib/exceptions';

describe('Risk Exception Workflow', () => {
  it('should create an exception with requested status', () => {
    const exc = createRiskException({
      project_id: 'proj-1',
      organization_id: 'org-1',
      title: 'Test exception',
      justification: 'Testing',
      compensating_controls: ['Manual review'],
      requested_by: 'user-1',
      duration_days: 30,
    });
    expect(exc.status).toBe('requested');
    expect(exc.approved_by).toBeNull();
    expect(exc.compensating_controls).toHaveLength(1);
  });

  it('should approve an exception', () => {
    const exc = createRiskException({
      project_id: 'proj-1',
      organization_id: 'org-1',
      title: 'Test',
      justification: 'Testing',
      compensating_controls: ['Control 1'],
      requested_by: 'user-1',
      duration_days: 30,
    });
    const approved = approveException(exc, 'admin-1');
    expect(approved.status).toBe('approved');
    expect(approved.approved_by).toBe('admin-1');
  });

  it('should deny an exception', () => {
    const exc = createRiskException({
      project_id: 'proj-1',
      organization_id: 'org-1',
      title: 'Test',
      justification: 'Testing',
      compensating_controls: ['Control 1'],
      requested_by: 'user-1',
      duration_days: 30,
    });
    const denied = denyException(exc, 'admin-1', 'Insufficient controls');
    expect(denied.status).toBe('denied');
    expect(denied.notes).toBe('Insufficient controls');
  });

  it('should detect expired exceptions', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const exc = createRiskException({
      project_id: 'proj-1',
      organization_id: 'org-1',
      title: 'Expired test',
      justification: 'Testing',
      compensating_controls: ['Control 1'],
      requested_by: 'user-1',
      duration_days: 0, // Expires immediately
    });
    // Force to approved status with past expiry
    const approvedExc = { ...approveException(exc, 'admin-1'), expires_at: yesterday.toISOString() };

    const { expired, expiring_soon } = checkExpirations([approvedExc]);
    expect(expired).toHaveLength(1);
  });

  it('should generate demo exceptions', () => {
    const exceptions = getDemoExceptions('proj-test');
    expect(exceptions.length).toBeGreaterThan(0);
    expect(exceptions.every((e) => e.project_id === 'proj-test')).toBe(true);
  });
});
