import { describe, it, expect } from 'vitest';
import { hasPermission, getPermissions, canPerformAction, getRolesWithPermission } from '@/lib/rbac';

describe('RBAC Service', () => {
  it('should grant admin all permissions', () => {
    expect(hasPermission('admin', 'project:create')).toBe(true);
    expect(hasPermission('admin', 'gate:approve')).toBe(true);
    expect(hasPermission('admin', 'settings:manage')).toBe(true);
  });

  it('should restrict marketing role', () => {
    expect(hasPermission('marketing', 'project:read')).toBe(true);
    expect(hasPermission('marketing', 'report:generate')).toBe(true);
    expect(hasPermission('marketing', 'gate:approve')).toBe(false);
    expect(hasPermission('marketing', 'project:delete')).toBe(false);
  });

  it('should enforce tenant isolation', () => {
    const result = canPerformAction('admin', 'project:read', 'org-other', 'org-mine');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Cross-tenant');
  });

  it('should allow same-tenant access with permission', () => {
    const result = canPerformAction('admin', 'project:read', 'org-1', 'org-1');
    expect(result.allowed).toBe(true);
  });

  it('should find roles with gate:approve permission', () => {
    const roles = getRolesWithPermission('gate:approve');
    expect(roles).toContain('admin');
    expect(roles).toContain('executive');
    expect(roles).not.toContain('marketing');
  });

  it('should return permissions for a role', () => {
    const perms = getPermissions('engineering');
    expect(perms.length).toBeGreaterThan(0);
    expect(perms).toContain('project:read');
    expect(perms).toContain('control:run');
  });
});
