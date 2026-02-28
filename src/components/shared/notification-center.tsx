'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Shield,
  FileText,
  AlertTriangle,
  Wrench,
  BarChart3,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  phaseTag: string;
  read: boolean;
  icon: React.ElementType;
}

interface NotificationCenterProps {
  role: UserRole | undefined;
}

/* -------------------------------------------------------------------------- */
/*  Demo Notification Data by Role                                             */
/* -------------------------------------------------------------------------- */

function generateNotifications(role: UserRole | undefined): Notification[] {
  const base: Record<string, Notification[]> = {
    executive: [
      { id: 'exec-1', title: 'Gate review awaiting your approval', description: 'Gate 2 (Pilot Launch) requires executive sign-off. 2 of 3 approvers have signed.', timestamp: '15 minutes ago', phaseTag: 'Governance', read: false, icon: Shield },
      { id: 'exec-2', title: 'Exception request pending', description: 'Engineering has requested a data classification exception for the sandbox environment.', timestamp: '2 hours ago', phaseTag: 'Risk', read: false, icon: AlertTriangle },
      { id: 'exec-3', title: 'Decision brief ready for review', description: 'The executive decision brief has been generated with a "Conditional Go" recommendation.', timestamp: '1 day ago', phaseTag: 'Decision', read: true, icon: FileText },
    ],
    legal: [
      { id: 'legal-1', title: 'Policy review assigned', description: 'The Acceptable Use Policy (v2) has been submitted for your legal review.', timestamp: '30 minutes ago', phaseTag: 'Governance', read: false, icon: FileText },
      { id: 'legal-2', title: 'Compliance gap identified', description: 'HIPAA control mapping has 3 unaddressed requirements in the data handling category.', timestamp: '4 hours ago', phaseTag: 'Compliance', read: false, icon: AlertTriangle },
      { id: 'legal-3', title: 'Ethics review scheduled', description: 'A bias assessment review has been scheduled for next Tuesday with the ethics board.', timestamp: '1 day ago', phaseTag: 'Governance', read: true, icon: Shield },
    ],
    it: [
      { id: 'it-1', title: 'Security control check failed', description: 'Egress filtering control failed validation. DLP rules need to be updated for the sandbox.', timestamp: '10 minutes ago', phaseTag: 'Security', read: false, icon: AlertTriangle },
      { id: 'it-2', title: 'Sandbox validation needed', description: 'New infrastructure configuration generated. Please run the validation suite.', timestamp: '3 hours ago', phaseTag: 'Sandbox', read: false, icon: Wrench },
      { id: 'it-3', title: 'Data classification pending', description: '5 data assets are awaiting classification review before sandbox access can be granted.', timestamp: '1 day ago', phaseTag: 'Data', read: true, icon: Shield },
    ],
    engineering: [
      { id: 'eng-1', title: 'Sprint task assigned', description: 'You have been assigned "Configure Claude Code workspace settings" for Sprint 2.', timestamp: '1 hour ago', phaseTag: 'Pilot', read: false, icon: Wrench },
      { id: 'eng-2', title: 'Sandbox ready for configuration', description: 'The sandbox environment has passed security validation and is ready for tool setup.', timestamp: '5 hours ago', phaseTag: 'Sandbox', read: false, icon: Check },
      { id: 'eng-3', title: 'Pilot metrics due', description: 'Sprint 1 metrics collection closes tomorrow. Please submit velocity and defect rate data.', timestamp: '1 day ago', phaseTag: 'Pilot', read: true, icon: BarChart3 },
    ],
    marketing: [
      { id: 'mktg-1', title: 'Communications draft requested', description: 'A stakeholder communication for the engineering team about AI tool rollout is due this week.', timestamp: '2 hours ago', phaseTag: 'Communications', read: false, icon: MessageSquare },
      { id: 'mktg-2', title: 'Change management update needed', description: 'The change management plan needs to be updated to reflect the revised pilot timeline.', timestamp: '6 hours ago', phaseTag: 'Communications', read: false, icon: FileText },
    ],
    consultant: [
      { id: 'con-1', title: 'Phase 1 completed', description: 'Discovery & Assessment phase has been marked as complete. All prerequisites are met.', timestamp: '30 minutes ago', phaseTag: 'Discovery', read: false, icon: Check },
      { id: 'con-2', title: 'Bottleneck detected: Legal reviews', description: 'Legal/Compliance has 4 overdue review items. Consider following up with the legal team.', timestamp: '3 hours ago', phaseTag: 'Governance', read: false, icon: AlertTriangle },
      { id: 'con-3', title: 'Weekly summary available', description: 'The weekly project digest is ready, covering 12 completed tasks and 3 new risks.', timestamp: '1 day ago', phaseTag: 'Overview', read: true, icon: BarChart3 },
    ],
    admin: [
      { id: 'admin-1', title: 'Phase 1 completed', description: 'Discovery & Assessment phase has been marked as complete. All prerequisites are met.', timestamp: '30 minutes ago', phaseTag: 'Discovery', read: false, icon: Check },
      { id: 'admin-2', title: 'Bottleneck detected: Legal reviews', description: 'Legal/Compliance has 4 overdue review items. Consider following up with the legal team.', timestamp: '3 hours ago', phaseTag: 'Governance', read: false, icon: AlertTriangle },
      { id: 'admin-3', title: 'Weekly summary available', description: 'The weekly project digest is ready, covering 12 completed tasks and 3 new risks.', timestamp: '1 day ago', phaseTag: 'Overview', read: true, icon: BarChart3 },
    ],
  };

  const effectiveRole = role ?? 'consultant';
  return base[effectiveRole] ?? base.consultant;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function NotificationCenter({ role }: NotificationCenterProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(generateNotifications(role));
  }, [role]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleNotificationClick = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    console.log('Notification clicked:', id);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          isOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[360px] bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3',
                      !notification.read && 'bg-blue-50/50',
                    )}
                  >
                    {/* Unread indicator */}
                    <div className="flex flex-col items-center pt-1 shrink-0">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        notification.read ? 'bg-transparent' : 'bg-blue-500',
                      )} />
                    </div>

                    {/* Icon */}
                    <div className="flex items-start pt-0.5 shrink-0">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center',
                        notification.read ? 'bg-slate-100' : 'bg-slate-200',
                      )}>
                        <Icon className={cn(
                          'h-3.5 w-3.5',
                          notification.read ? 'text-slate-400' : 'text-slate-600',
                        )} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm leading-snug',
                        notification.read ? 'text-slate-600' : 'text-slate-900 font-medium',
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500 border-slate-200">
                          {notification.phaseTag}
                        </Badge>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="h-2.5 w-2.5" />
                          {notification.timestamp}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
