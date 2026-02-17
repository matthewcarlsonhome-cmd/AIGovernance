// RBAC Hardening Service (Design Doc v3 §8.4)
// Role-based access control with permission checking and tenant isolation.

import type { UserRole } from '@/types';

export type Permission =
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'project:transition_state'
  | 'gate:submit'
  | 'gate:approve'
  | 'gate:reject'
  | 'policy:draft'
  | 'policy:approve'
  | 'risk:create'
  | 'risk:update'
  | 'risk:accept'
  | 'exception:request'
  | 'exception:approve'
  | 'exception:revoke'
  | 'control:run'
  | 'control:remediate'
  | 'data:classify'
  | 'data:approve'
  | 'report:generate'
  | 'report:export'
  | 'evidence:generate'
  | 'team:manage'
  | 'settings:manage'
  | 'audit:view'
  | 'integration:configure';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'project:create', 'project:read', 'project:update', 'project:delete', 'project:transition_state',
    'gate:submit', 'gate:approve', 'gate:reject',
    'policy:draft', 'policy:approve',
    'risk:create', 'risk:update', 'risk:accept',
    'exception:request', 'exception:approve', 'exception:revoke',
    'control:run', 'control:remediate',
    'data:classify', 'data:approve',
    'report:generate', 'report:export',
    'evidence:generate',
    'team:manage', 'settings:manage', 'audit:view', 'integration:configure',
  ],
  consultant: [
    'project:create', 'project:read', 'project:update', 'project:transition_state',
    'gate:submit',
    'policy:draft',
    'risk:create', 'risk:update',
    'exception:request',
    'control:run',
    'data:classify',
    'report:generate', 'report:export',
    'evidence:generate',
    'team:manage', 'audit:view',
  ],
  executive: [
    'project:read', 'project:transition_state',
    'gate:approve', 'gate:reject',
    'policy:approve',
    'risk:accept',
    'exception:approve', 'exception:revoke',
    'data:approve',
    'report:generate', 'report:export',
    'audit:view',
  ],
  it: [
    'project:read',
    'gate:submit', 'gate:approve',
    'risk:create', 'risk:update',
    'exception:request',
    'control:run', 'control:remediate',
    'data:classify', 'data:approve',
    'report:generate',
    'audit:view',
  ],
  legal: [
    'project:read',
    'gate:submit', 'gate:approve',
    'policy:draft', 'policy:approve',
    'risk:create', 'risk:update', 'risk:accept',
    'exception:request', 'exception:approve',
    'data:classify', 'data:approve',
    'report:generate',
    'audit:view',
  ],
  engineering: [
    'project:read',
    'gate:submit',
    'risk:create',
    'exception:request',
    'control:run',
    'data:classify',
    'report:generate',
  ],
  marketing: [
    'project:read',
    'report:generate', 'report:export',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function canPerformAction(
  role: UserRole,
  action: Permission,
  resourceOrgId: string,
  userOrgId: string,
): { allowed: boolean; reason: string | null } {
  // Tenant isolation check
  if (resourceOrgId !== userOrgId) {
    return { allowed: false, reason: 'Cross-tenant access denied' };
  }

  // Permission check
  if (!hasPermission(role, action)) {
    return { allowed: false, reason: `Role "${role}" does not have permission "${action}"` };
  }

  return { allowed: true, reason: null };
}

export function getRolesWithPermission(permission: Permission): UserRole[] {
  const roles: UserRole[] = ['admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing'];
  return roles.filter((role) => hasPermission(role, permission));
}
