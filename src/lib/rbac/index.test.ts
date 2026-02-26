import { describe, it, expect } from 'vitest';
import type { UserRole } from '@/types';
import {
  hasPermission,
  getPermissions,
  canPerformAction,
  getRolesWithPermission,
} from './index';
import type { Permission } from './index';

// ---------------------------------------------------------------------------
// All roles used in tests
// ---------------------------------------------------------------------------

const ALL_ROLES: UserRole[] = ['admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing'];

// ---------------------------------------------------------------------------
// hasPermission — per-role coverage
// ---------------------------------------------------------------------------

describe('hasPermission', () => {
  describe('admin role', () => {
    it('should have all 27 permissions', () => {
      const perms = getPermissions('admin');
      expect(perms.length).toBe(27);
    });

    it('should have project CRUD permissions', () => {
      expect(hasPermission('admin', 'project:create')).toBe(true);
      expect(hasPermission('admin', 'project:read')).toBe(true);
      expect(hasPermission('admin', 'project:update')).toBe(true);
      expect(hasPermission('admin', 'project:delete')).toBe(true);
    });

    it('should have gate management permissions', () => {
      expect(hasPermission('admin', 'gate:submit')).toBe(true);
      expect(hasPermission('admin', 'gate:approve')).toBe(true);
      expect(hasPermission('admin', 'gate:reject')).toBe(true);
    });

    it('should have settings and team management', () => {
      expect(hasPermission('admin', 'settings:manage')).toBe(true);
      expect(hasPermission('admin', 'team:manage')).toBe(true);
    });
  });

  describe('consultant role', () => {
    it('should be able to create and update projects', () => {
      expect(hasPermission('consultant', 'project:create')).toBe(true);
      expect(hasPermission('consultant', 'project:update')).toBe(true);
    });

    it('should NOT be able to delete projects', () => {
      expect(hasPermission('consultant', 'project:delete')).toBe(false);
    });

    it('should be able to submit gates but NOT approve them', () => {
      expect(hasPermission('consultant', 'gate:submit')).toBe(true);
      expect(hasPermission('consultant', 'gate:approve')).toBe(false);
    });

    it('should have audit view access', () => {
      expect(hasPermission('consultant', 'audit:view')).toBe(true);
    });

    it('should NOT manage settings', () => {
      expect(hasPermission('consultant', 'settings:manage')).toBe(false);
    });
  });

  describe('executive role', () => {
    it('should be able to approve and reject gates', () => {
      expect(hasPermission('executive', 'gate:approve')).toBe(true);
      expect(hasPermission('executive', 'gate:reject')).toBe(true);
    });

    it('should be able to approve policies and exceptions', () => {
      expect(hasPermission('executive', 'policy:approve')).toBe(true);
      expect(hasPermission('executive', 'exception:approve')).toBe(true);
    });

    it('should NOT create projects', () => {
      expect(hasPermission('executive', 'project:create')).toBe(false);
    });

    it('should NOT manage settings', () => {
      expect(hasPermission('executive', 'settings:manage')).toBe(false);
    });

    it('should be able to accept risks and approve data', () => {
      expect(hasPermission('executive', 'risk:accept')).toBe(true);
      expect(hasPermission('executive', 'data:approve')).toBe(true);
    });
  });

  describe('it role', () => {
    it('should be able to run and remediate controls', () => {
      expect(hasPermission('it', 'control:run')).toBe(true);
      expect(hasPermission('it', 'control:remediate')).toBe(true);
    });

    it('should be able to classify and approve data', () => {
      expect(hasPermission('it', 'data:classify')).toBe(true);
      expect(hasPermission('it', 'data:approve')).toBe(true);
    });

    it('should be able to submit and approve gates', () => {
      expect(hasPermission('it', 'gate:submit')).toBe(true);
      expect(hasPermission('it', 'gate:approve')).toBe(true);
    });

    it('should NOT create projects', () => {
      expect(hasPermission('it', 'project:create')).toBe(false);
    });

    it('should NOT manage settings or teams', () => {
      expect(hasPermission('it', 'settings:manage')).toBe(false);
      expect(hasPermission('it', 'team:manage')).toBe(false);
    });
  });

  describe('legal role', () => {
    it('should be able to draft and approve policies', () => {
      expect(hasPermission('legal', 'policy:draft')).toBe(true);
      expect(hasPermission('legal', 'policy:approve')).toBe(true);
    });

    it('should be able to accept risks and approve exceptions', () => {
      expect(hasPermission('legal', 'risk:accept')).toBe(true);
      expect(hasPermission('legal', 'exception:approve')).toBe(true);
    });

    it('should NOT export reports', () => {
      expect(hasPermission('legal', 'report:export')).toBe(false);
    });

    it('should be able to classify and approve data', () => {
      expect(hasPermission('legal', 'data:classify')).toBe(true);
      expect(hasPermission('legal', 'data:approve')).toBe(true);
    });
  });

  describe('engineering role', () => {
    it('should have project:read', () => {
      expect(hasPermission('engineering', 'project:read')).toBe(true);
    });

    it('should be able to run controls', () => {
      expect(hasPermission('engineering', 'control:run')).toBe(true);
    });

    it('should NOT approve gates or policies', () => {
      expect(hasPermission('engineering', 'gate:approve')).toBe(false);
      expect(hasPermission('engineering', 'policy:approve')).toBe(false);
    });

    it('should NOT manage settings or team', () => {
      expect(hasPermission('engineering', 'settings:manage')).toBe(false);
      expect(hasPermission('engineering', 'team:manage')).toBe(false);
    });

    it('should be able to generate reports', () => {
      expect(hasPermission('engineering', 'report:generate')).toBe(true);
    });
  });

  describe('marketing role', () => {
    it('should have only project:read, report:generate, report:export', () => {
      const perms = getPermissions('marketing');
      expect(perms).toHaveLength(3);
      expect(perms).toContain('project:read');
      expect(perms).toContain('report:generate');
      expect(perms).toContain('report:export');
    });

    it('should NOT be able to approve gates or manage projects', () => {
      expect(hasPermission('marketing', 'gate:approve')).toBe(false);
      expect(hasPermission('marketing', 'project:create')).toBe(false);
      expect(hasPermission('marketing', 'project:delete')).toBe(false);
    });

    it('should NOT have any control or policy permissions', () => {
      expect(hasPermission('marketing', 'control:run')).toBe(false);
      expect(hasPermission('marketing', 'policy:draft')).toBe(false);
      expect(hasPermission('marketing', 'risk:create')).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// getPermissions
// ---------------------------------------------------------------------------

describe('getPermissions', () => {
  it('should return an array for each role', () => {
    for (const role of ALL_ROLES) {
      const perms = getPermissions(role);
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBeGreaterThan(0);
    }
  });

  it('should return a superset for admin vs marketing', () => {
    const adminPerms = getPermissions('admin');
    const marketingPerms = getPermissions('marketing');
    for (const perm of marketingPerms) {
      expect(adminPerms).toContain(perm);
    }
  });

  it('should return empty array for unknown role', () => {
    const perms = getPermissions('nonexistent' as UserRole);
    expect(perms ?? []).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// canPerformAction — tenant isolation
// ---------------------------------------------------------------------------

describe('canPerformAction — tenant isolation', () => {
  it('should deny cross-tenant access even for admin', () => {
    const result = canPerformAction('admin', 'project:read', 'org-other', 'org-mine');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Cross-tenant');
  });

  it('should deny cross-tenant access for all roles', () => {
    for (const role of ALL_ROLES) {
      const result = canPerformAction(role, 'project:read', 'org-a', 'org-b');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Cross-tenant');
    }
  });

  it('should allow same-tenant access when role has permission', () => {
    const result = canPerformAction('admin', 'project:read', 'org-1', 'org-1');
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('should deny same-tenant access when role lacks permission', () => {
    const result = canPerformAction('marketing', 'project:delete', 'org-1', 'org-1');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('does not have permission');
  });

  it('should return reason including the role and permission name', () => {
    const result = canPerformAction('engineering', 'settings:manage', 'org-1', 'org-1');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('engineering');
    expect(result.reason).toContain('settings:manage');
  });
});

// ---------------------------------------------------------------------------
// getRolesWithPermission
// ---------------------------------------------------------------------------

describe('getRolesWithPermission', () => {
  it('should return only admin for settings:manage', () => {
    const roles = getRolesWithPermission('settings:manage');
    expect(roles).toEqual(['admin']);
  });

  it('should return admin, executive for gate:approve along with it and legal', () => {
    const roles = getRolesWithPermission('gate:approve');
    expect(roles).toContain('admin');
    expect(roles).toContain('executive');
    expect(roles).toContain('it');
    expect(roles).toContain('legal');
    expect(roles).not.toContain('marketing');
    expect(roles).not.toContain('engineering');
  });

  it('should include all 7 roles for project:read', () => {
    const roles = getRolesWithPermission('project:read');
    expect(roles).toHaveLength(7);
    for (const role of ALL_ROLES) {
      expect(roles).toContain(role);
    }
  });

  it('should return admin only for project:delete', () => {
    const roles = getRolesWithPermission('project:delete');
    expect(roles).toEqual(['admin']);
  });

  it('should return multiple roles for report:generate', () => {
    const roles = getRolesWithPermission('report:generate');
    expect(roles.length).toBeGreaterThanOrEqual(5);
    expect(roles).toContain('admin');
    expect(roles).toContain('consultant');
    expect(roles).toContain('marketing');
  });

  it('should return admin only for team:manage', () => {
    const roles = getRolesWithPermission('team:manage');
    expect(roles).toEqual(['admin']);
  });

  it('should return admin only for integration:configure', () => {
    const roles = getRolesWithPermission('integration:configure');
    expect(roles).toEqual(['admin']);
  });
});
