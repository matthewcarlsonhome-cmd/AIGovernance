/**
 * Notification system — in-memory notification store with typed notification
 * creation helpers and demo data generation.
 */

import type { UserRole } from '@/types';
import type { ProjectPhase } from '@/lib/tasks/role-assignment';
import { PHASE_LABELS } from '@/lib/tasks/role-assignment';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_blocked'
  | 'phase_transition'
  | 'gate_scheduled'
  | 'gate_completed'
  | 'exception_expiring'
  | 'approval_needed'
  | 'weekly_digest';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  project_id: string;
  phase?: ProjectPhase;
  target_roles: UserRole[];
  target_user_id?: string;
  created_at: string;
  read: boolean;
  href?: string;
}

/* -------------------------------------------------------------------------- */
/*  ID generator                                                               */
/* -------------------------------------------------------------------------- */

let notificationIdCounter = 0;

function generateId(): string {
  notificationIdCounter += 1;
  return `notif-${Date.now()}-${notificationIdCounter}`;
}

/* -------------------------------------------------------------------------- */
/*  NotificationStore                                                          */
/* -------------------------------------------------------------------------- */

const MAX_NOTIFICATIONS = 100;

export class NotificationStore {
  private notifications: Notification[] = [];

  /**
   * Add a new notification to the store.
   * Trims oldest entries if the store exceeds MAX_NOTIFICATIONS.
   */
  add(
    notification: Omit<Notification, 'id' | 'created_at' | 'read'>,
  ): Notification {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      created_at: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(newNotification);

    // Trim to max size
    if (this.notifications.length > MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS);
    }

    return newNotification;
  }

  /**
   * Get notifications relevant to a given role, optionally limited.
   */
  getForRole(role: UserRole, limit?: number): Notification[] {
    const filtered = this.notifications.filter(
      (n) => n.target_roles.includes(role),
    );
    return limit !== undefined ? filtered.slice(0, limit) : filtered;
  }

  /**
   * Count unread notifications for a given role.
   */
  getUnreadCount(role: UserRole): number {
    return this.notifications.filter(
      (n) => n.target_roles.includes(role) && !n.read,
    ).length;
  }

  /**
   * Mark a specific notification as read.
   */
  markRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications for a given role as read.
   */
  markAllRead(role: UserRole): void {
    for (const notification of this.notifications) {
      if (notification.target_roles.includes(role)) {
        notification.read = true;
      }
    }
  }

  /**
   * Get all notifications (for testing/debugging).
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Clear all notifications (for testing).
   */
  clear(): void {
    this.notifications = [];
  }
}

/* -------------------------------------------------------------------------- */
/*  Notification factory functions                                             */
/* -------------------------------------------------------------------------- */

/**
 * Create a notification for a newly assigned or updated task.
 */
export function createTaskNotification(
  taskTitle: string,
  projectId: string,
  targetRoles: UserRole[],
  href: string,
): Notification {
  return {
    id: generateId(),
    type: 'task_assigned',
    title: `New task: ${taskTitle}`,
    description: `You have been assigned to "${taskTitle}". Review the task details and take action.`,
    project_id: projectId,
    target_roles: targetRoles,
    created_at: new Date().toISOString(),
    read: false,
    href,
  };
}

/**
 * Create a notification for a phase transition.
 */
export function createPhaseTransitionNotification(
  fromPhase: ProjectPhase,
  toPhase: ProjectPhase,
  projectId: string,
): Notification {
  const fromLabel = PHASE_LABELS[fromPhase];
  const toLabel = PHASE_LABELS[toPhase];

  return {
    id: generateId(),
    type: 'phase_transition',
    title: `Phase advanced: ${toLabel}`,
    description: `The project has moved from "${fromLabel}" to "${toLabel}". Review new tasks and responsibilities.`,
    project_id: projectId,
    phase: toPhase,
    target_roles: ['admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing'],
    created_at: new Date().toISOString(),
    read: false,
    href: `/projects/${projectId}/overview`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Demo data generator                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Generates 5-8 realistic notifications for the given role and project.
 */
export function generateDemoNotifications(
  projectId: string,
  role: UserRole,
): Notification[] {
  const now = new Date();
  const notifications: Notification[] = [];

  // Common helper to offset dates
  function hoursAgo(hours: number): string {
    return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  }

  const p = (path: string) => `/projects/${projectId}${path}`;

  // Notification pool by role relevance
  const allNotifications: Notification[] = [
    // Task assignments
    {
      id: generateId(),
      type: 'task_assigned',
      title: 'New task: Draft governance policies',
      description: 'You have been assigned to draft the Acceptable Use Policy and Incident Response Plan.',
      project_id: projectId,
      phase: 'classify_govern',
      target_roles: ['consultant', 'legal'],
      created_at: hoursAgo(2),
      read: false,
      href: p('/governance/policies'),
    },
    {
      id: generateId(),
      type: 'task_assigned',
      title: 'New task: Classify data assets',
      description: 'Tag all data assets with classification levels before the data approval gate.',
      project_id: projectId,
      phase: 'classify_govern',
      target_roles: ['it'],
      created_at: hoursAgo(4),
      read: false,
      href: p('/governance/policies'),
    },
    {
      id: generateId(),
      type: 'task_assigned',
      title: 'New task: Configure sandbox environment',
      description: 'Set up the sandbox infrastructure configuration for the pilot phase.',
      project_id: projectId,
      phase: 'build_test',
      target_roles: ['it', 'engineering'],
      created_at: hoursAgo(6),
      read: false,
      href: p('/sandbox/configure'),
    },

    // Gate notifications
    {
      id: generateId(),
      type: 'gate_scheduled',
      title: 'Gate review scheduled: Data Approval',
      description: 'The Data Approval gate review is scheduled for this week. Ensure all artifacts are ready.',
      project_id: projectId,
      phase: 'approve_gate',
      target_roles: ['executive', 'admin', 'consultant'],
      created_at: hoursAgo(8),
      read: false,
      href: p('/governance/gates'),
    },
    {
      id: generateId(),
      type: 'gate_completed',
      title: 'Gate passed: Design Review',
      description: 'The Design Review gate has been approved. You may proceed to the next phase.',
      project_id: projectId,
      phase: 'approve_gate',
      target_roles: ['admin', 'consultant', 'executive'],
      created_at: hoursAgo(24),
      read: true,
      href: p('/governance/gates'),
    },

    // Phase transition
    {
      id: generateId(),
      type: 'phase_transition',
      title: 'Phase advanced: Classify & Govern',
      description: 'The project has moved from "Scope & Assess" to "Classify & Govern". Review new tasks.',
      project_id: projectId,
      phase: 'classify_govern',
      target_roles: ['admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing'],
      created_at: hoursAgo(48),
      read: true,
      href: p('/overview'),
    },

    // Approval needed
    {
      id: generateId(),
      type: 'approval_needed',
      title: 'Approval needed: Risk exception request',
      description: 'A risk exception has been requested for "Third-party API data retention". Review and approve.',
      project_id: projectId,
      phase: 'classify_govern',
      target_roles: ['executive', 'legal'],
      created_at: hoursAgo(3),
      read: false,
      href: p('/governance/risk'),
    },

    // Task blocked
    {
      id: generateId(),
      type: 'task_blocked',
      title: 'Task blocked: Validate sandbox environment',
      description: 'Sandbox validation is blocked until the sandbox configuration is complete.',
      project_id: projectId,
      phase: 'build_test',
      target_roles: ['it', 'engineering'],
      created_at: hoursAgo(1),
      read: false,
      href: p('/sandbox/validate'),
    },

    // Task completed
    {
      id: generateId(),
      type: 'task_completed',
      title: 'Task completed: Assessment questionnaire',
      description: 'The feasibility assessment questionnaire has been completed with a score of 72%.',
      project_id: projectId,
      phase: 'scope_assess',
      target_roles: ['admin', 'consultant'],
      created_at: hoursAgo(72),
      read: true,
      href: p('/discovery/readiness'),
    },

    // Exception expiring
    {
      id: generateId(),
      type: 'exception_expiring',
      title: 'Exception expiring in 5 days',
      description: 'The risk exception for "Cloud storage geo-restriction" expires in 5 days. Review or renew.',
      project_id: projectId,
      phase: 'classify_govern',
      target_roles: ['executive', 'legal', 'it'],
      created_at: hoursAgo(12),
      read: false,
      href: p('/governance/risk'),
    },

    // Weekly digest
    {
      id: generateId(),
      type: 'weekly_digest',
      title: 'Weekly project digest',
      description: 'Your weekly summary: 3 tasks completed, 2 pending reviews, 1 blocker. Overall progress: 45%.',
      project_id: projectId,
      target_roles: ['admin', 'consultant', 'executive'],
      created_at: hoursAgo(168),
      read: true,
      href: p('/overview'),
    },
  ];

  // Filter to notifications relevant to this role and take 5-8
  const relevant = allNotifications.filter((n) =>
    n.target_roles.includes(role),
  );

  // Take up to 8, minimum 5 (pad with general ones if needed)
  const target = Math.min(8, Math.max(5, relevant.length));
  for (let i = 0; i < target && i < relevant.length; i++) {
    notifications.push(relevant[i]);
  }

  return notifications;
}
