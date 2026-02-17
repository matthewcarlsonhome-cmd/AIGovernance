'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ActionQueueItem, ActionQueueItemType, RiskTier } from '@/types';
import { AlertTriangle, Clock, Shield, FileCheck, AlertCircle, ChevronRight, Filter } from 'lucide-react';

const DEMO_ACTIONS: ActionQueueItem[] = [
  {
    id: 'aq-1', project_id: 'proj-1', project_name: 'AI Coding Assistant Pilot',
    type: 'control_failure', title: 'Fix failed DLP egress control', description: 'DLP scanning control check is failing. Remediate before security gate can proceed.',
    priority: 'critical', due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    assigned_to: 'user-1', assigned_to_name: 'Sarah Chen', resource_type: 'control_check', resource_id: 'ctrl-dlp-001',
    href: '/projects/proj-1/governance/security-controls', created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'aq-2', project_id: 'proj-1', project_name: 'AI Coding Assistant Pilot',
    type: 'gate_review', title: 'Data Approval gate pending review', description: 'Data classification is complete. Gate review submission awaiting approver action.',
    priority: 'high', due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    assigned_to: 'user-2', assigned_to_name: 'James Wright', resource_type: 'gate', resource_id: 'gate-data-001',
    href: '/projects/proj-1/governance/gates', created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'aq-3', project_id: 'proj-1', project_name: 'AI Coding Assistant Pilot',
    type: 'risk_exception', title: 'Exception expiring: DLP scanning gap', description: 'Approved risk exception for DLP scanning gap expires in 5 days. Renew or remediate.',
    priority: 'high', due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    assigned_to: 'user-1', assigned_to_name: 'Sarah Chen', resource_type: 'exception', resource_id: 'exc-001',
    href: '/projects/proj-1/governance/risk', created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'aq-4', project_id: 'proj-1', project_name: 'AI Coding Assistant Pilot',
    type: 'sla_breach', title: 'SLA warning: Security review overdue', description: 'Security gate review has exceeded warning threshold (5 of 7 days).',
    priority: 'medium', due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    assigned_to: 'user-3', assigned_to_name: 'Maria Lopez', resource_type: 'sla', resource_id: 'sla-gate-review',
    href: '/projects/proj-1/governance/gates', created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'aq-5', project_id: 'proj-1', project_name: 'AI Coding Assistant Pilot',
    type: 'approval_request', title: 'Policy draft awaiting legal review', description: 'Acceptable Use Policy v2 submitted for legal team review and approval.',
    priority: 'medium', due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    assigned_to: 'user-4', assigned_to_name: 'David Kim', resource_type: 'policy', resource_id: 'policy-aup-001',
    href: '/projects/proj-1/governance/policies', created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'aq-6', project_id: 'proj-1', project_name: 'AI Coding Assistant Pilot',
    type: 'task_overdue', title: 'Sandbox validation overdue', description: 'Sandbox environment health checks were due 2 days ago.',
    priority: 'low', due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    assigned_to: 'user-1', assigned_to_name: 'Sarah Chen', resource_type: 'task', resource_id: 'task-sandbox-001',
    href: '/projects/proj-1/sandbox/validate', created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const TYPE_ICONS: Record<ActionQueueItemType, React.ReactNode> = {
  gate_review: <FileCheck className="h-4 w-4" />,
  risk_exception: <AlertTriangle className="h-4 w-4" />,
  control_failure: <Shield className="h-4 w-4" />,
  sla_breach: <Clock className="h-4 w-4" />,
  approval_request: <FileCheck className="h-4 w-4" />,
  task_overdue: <AlertCircle className="h-4 w-4" />,
};

const TYPE_LABELS: Record<ActionQueueItemType, string> = {
  gate_review: 'Gate Review',
  risk_exception: 'Exception',
  control_failure: 'Control Failure',
  sla_breach: 'SLA Breach',
  approval_request: 'Approval',
  task_overdue: 'Overdue Task',
};

const PRIORITY_COLORS: Record<RiskTier, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  const due = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
}

export default function ActionQueuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: _projectId } = React.use(params);
  const [filterType, setFilterType] = useState<ActionQueueItemType | 'all'>('all');

  const actions = DEMO_ACTIONS
    .filter((a) => filterType === 'all' || a.type === filterType)
    .sort((a, b) => {
      const priorityOrder: Record<RiskTier, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      return 0;
    });

  const criticalCount = DEMO_ACTIONS.filter((a) => a.priority === 'critical').length;
  const highCount = DEMO_ACTIONS.filter((a) => a.priority === 'high').length;

  const filterTypes: (ActionQueueItemType | 'all')[] = ['all', 'control_failure', 'gate_review', 'risk_exception', 'sla_breach', 'approval_request', 'task_overdue'];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Action Queue</h1>
          <p className="text-slate-500 mt-1">All pending actions ordered by priority and due date.</p>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <Badge className="bg-red-100 text-red-800 border-red-200">{criticalCount} Critical</Badge>
          )}
          {highCount > 0 && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">{highCount} High</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400" />
        {filterTypes.map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
            className={filterType === type ? 'bg-slate-900 text-white' : 'text-slate-600'}
          >
            {type === 'all' ? 'All' : TYPE_LABELS[type]}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {actions.map((action) => {
          const isOverdue = action.due_date !== null && new Date(action.due_date) < new Date();
          return (
            <Card key={action.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${action.priority === 'critical' ? 'bg-red-100 text-red-700' : action.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                      {TYPE_ICONS[action.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-900 truncate">{action.title}</h3>
                        <Badge className={PRIORITY_COLORS[action.priority]} variant="outline">{action.priority}</Badge>
                        <Badge variant="outline" className="text-slate-500 border-slate-200">{TYPE_LABELS[action.type]}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{action.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{formatDueDate(action.due_date)}</span>
                        {action.assigned_to_name && <span>Assigned to {action.assigned_to_name}</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {actions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No actions matching the current filter.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
