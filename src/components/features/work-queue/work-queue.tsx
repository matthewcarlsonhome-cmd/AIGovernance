'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  PartyPopper,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface WorkQueueItem {
  id: string;
  title: string;
  description: string;
  href: string;
  priority: 'high' | 'medium' | 'low';
  type: 'approval' | 'action' | 'review' | 'input_needed';
  roles: UserRole[];
  assignee?: string;
}

/* -------------------------------------------------------------------------- */
/*  Demo work queue builder                                                    */
/* -------------------------------------------------------------------------- */

export function buildWorkQueue(projectId: string): WorkQueueItem[] {
  const p = (path: string) => `/projects/${projectId}${path}`;
  return [
    {
      id: 'wq-1',
      title: 'Gate 2 needs your sign-off',
      description: 'The pilot gate is waiting for security approval. Unblock the team!',
      href: p('/governance/gates'),
      priority: 'high',
      type: 'approval',
      roles: ['admin', 'consultant', 'it', 'executive'],
      assignee: 'Sarah Chen',
    },
    {
      id: 'wq-2',
      title: 'DLP rules are missing',
      description: 'No DLP? No Gate 2. Configure sandbox rules to keep things moving.',
      href: p('/sandbox/configure'),
      priority: 'high',
      type: 'action',
      roles: ['admin', 'consultant', 'it'],
      assignee: 'Alex Rivera',
    },
    {
      id: 'wq-3',
      title: 'Sprint 2 metrics are due',
      description: 'Log your velocity, defect rate, and satisfaction scores while they\'re fresh.',
      href: p('/poc/sprints'),
      priority: 'medium',
      type: 'input_needed',
      roles: ['admin', 'consultant', 'engineering'],
      assignee: 'Jordan Lee',
    },
    {
      id: 'wq-4',
      title: 'Compliance gaps to fill',
      description: '2 of 5 frameworks mapped. HIPAA and GDPR are still waiting for you.',
      href: p('/governance/compliance'),
      priority: 'medium',
      type: 'action',
      roles: ['admin', 'consultant', 'legal', 'it'],
      assignee: 'Lisa Park',
    },
    {
      id: 'wq-5',
      title: 'Data readiness check',
      description: 'Is the data pilot-ready? Review quality and classification before launch.',
      href: p('/discovery/data-readiness'),
      priority: 'medium',
      type: 'review',
      roles: ['admin', 'consultant', 'it', 'engineering'],
    },
    {
      id: 'wq-6',
      title: 'Pen test report needed',
      description: 'Gate 2 won\'t close without it. Schedule the test and upload results.',
      href: p('/sandbox/validate'),
      priority: 'high',
      type: 'action',
      roles: ['admin', 'it'],
      assignee: 'Marcus Johnson',
    },
    {
      id: 'wq-7',
      title: 'RACI matrix is bare',
      description: 'Who owns what? Assign roles for key deliverables across all phases.',
      href: p('/governance/raci'),
      priority: 'low',
      type: 'action',
      roles: ['admin', 'consultant'],
    },
    {
      id: 'wq-8',
      title: 'Comms plan needs a start',
      description: 'Craft the stakeholder messaging guide and FAQ for the big rollout.',
      href: p('/reports/communications'),
      priority: 'low',
      type: 'action',
      roles: ['admin', 'consultant', 'marketing'],
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function priorityColor(priority: WorkQueueItem['priority']): string {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50/50';
    case 'medium':
      return 'border-l-amber-500 bg-amber-50/50';
    case 'low':
      return 'border-l-slate-300 bg-slate-50/50';
  }
}

function typeLabel(type: WorkQueueItem['type']): { text: string; className: string } {
  switch (type) {
    case 'approval':
      return { text: 'Sign Off', className: 'bg-red-100 text-red-700' };
    case 'action':
      return { text: 'Do This', className: 'bg-blue-100 text-blue-700' };
    case 'review':
      return { text: 'Eyes On', className: 'bg-amber-100 text-amber-700' };
    case 'input_needed':
      return { text: 'Your Input', className: 'bg-violet-100 text-violet-700' };
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function WorkQueue({
  projectId,
  userRole,
  maxItems = 6,
}: {
  projectId: string;
  userRole?: UserRole;
  maxItems?: number;
}): React.ReactElement {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(`govai_dismissed_queue_${projectId}`);
      if (dismissed) setDismissedIds(new Set(JSON.parse(dismissed)));
    } catch { /* ignore */ }
  }, [projectId]);

  const allQueueItems = buildWorkQueue(projectId);
  const myQueueItems = allQueueItems.filter(
    (item) => !dismissedIds.has(item.id) && (!userRole || item.roles.includes(userRole))
  );

  const dismissItem = (itemId: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(itemId);
      localStorage.setItem(`govai_dismissed_queue_${projectId}`, JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Your Quest Log
            </CardTitle>
            <CardDescription className="text-slate-500">
              {myQueueItems.length} {myQueueItems.length === 1 ? 'quest' : 'quests'} awaiting your attention
              {userRole && (
                <span className="ml-1 text-slate-400">
                  (for your role)
                </span>
              )}
            </CardDescription>
          </div>
          {dismissedIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400"
              onClick={() => {
                setDismissedIds(new Set());
                localStorage.removeItem(`govai_dismissed_queue_${projectId}`);
              }}
            >
              Show all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {myQueueItems.length === 0 ? (
          <div className="text-center py-8">
            <PartyPopper className="h-10 w-10 mx-auto mb-3 text-emerald-400" />
            <p className="text-sm font-medium text-slate-700 mb-1">Quest log clear!</p>
            <p className="text-xs text-slate-400">Nothing pending for your role. Go grab a coffee &mdash; you&apos;ve earned it.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myQueueItems.slice(0, maxItems).map((item) => {
              const tl = typeLabel(item.type);
              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border-l-4 p-3 transition-all hover:shadow-sm group',
                    priorityColor(item.priority),
                  )}
                >
                  <Link href={item.href} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.title}
                      </p>
                      <Badge variant="outline" className={cn('text-[10px] shrink-0', tl.className)}>
                        {tl.text}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                    {item.assignee && (
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Users className="h-2.5 w-2.5" /> Assigned to {item.assignee}
                      </p>
                    )}
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => dismissItem(item.id)}
                      title="Dismiss"
                      className="p-1 rounded text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <Link href={item.href}>
                      <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] text-slate-400 text-center pt-1">
              Hit the checkmark to mark a quest as done
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
