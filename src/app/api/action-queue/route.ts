import { NextRequest } from 'next/server';
import { apiSuccess, withRateLimit } from '@/lib/api-helpers';
import { isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ActionQueueItem } from '@/types';

function generateDemoActionQueue(projectId: string): ActionQueueItem[] {
  const now = Date.now();
  return [
    {
      id: 'aq-1',
      project_id: projectId,
      project_name: 'AI Coding Assistant Pilot',
      type: 'control_failure',
      title: 'Fix failed DLP egress control',
      description: 'DLP scanning control check is failing. Remediate before security gate.',
      priority: 'critical',
      due_date: new Date(now + 2 * 86400000).toISOString(),
      assigned_to: 'user-1',
      assigned_to_name: 'Sarah Chen',
      resource_type: 'control_check',
      resource_id: 'ctrl-dlp-001',
      href: `/projects/${projectId}/governance/security-controls`,
      created_at: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'aq-2',
      project_id: projectId,
      project_name: 'AI Coding Assistant Pilot',
      type: 'gate_review',
      title: 'Data Approval gate pending review',
      description: 'Data classification complete. Awaiting approver action.',
      priority: 'high',
      due_date: new Date(now + 3 * 86400000).toISOString(),
      assigned_to: 'user-2',
      assigned_to_name: 'James Wright',
      resource_type: 'gate',
      resource_id: 'gate-data-001',
      href: `/projects/${projectId}/governance/gates`,
      created_at: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: 'aq-3',
      project_id: projectId,
      project_name: 'AI Coding Assistant Pilot',
      type: 'risk_exception',
      title: 'Exception expiring: DLP scanning gap',
      description: 'Approved exception expires in 5 days. Renew or remediate.',
      priority: 'high',
      due_date: new Date(now + 5 * 86400000).toISOString(),
      assigned_to: 'user-1',
      assigned_to_name: 'Sarah Chen',
      resource_type: 'exception',
      resource_id: 'exc-001',
      href: `/projects/${projectId}/governance/exceptions`,
      created_at: new Date(now - 5 * 86400000).toISOString(),
    },
    {
      id: 'aq-4',
      project_id: projectId,
      project_name: 'AI Coding Assistant Pilot',
      type: 'sla_breach',
      title: 'SLA warning: Security review overdue',
      description: 'Security gate review exceeded warning threshold (5 of 7 days).',
      priority: 'medium',
      due_date: new Date(now + 2 * 86400000).toISOString(),
      assigned_to: 'user-3',
      assigned_to_name: 'Maria Lopez',
      resource_type: 'sla',
      resource_id: 'sla-gate-review',
      href: `/projects/${projectId}/governance/gates`,
      created_at: new Date(now - 5 * 86400000).toISOString(),
    },
  ];
}

export async function GET(request: NextRequest) {
  const rateLimited = withRateLimit(request);
  if (rateLimited) return rateLimited;

  const projectId = request.nextUrl.searchParams.get('project_id') ?? 'proj-demo-001';

  if (!isServerSupabaseConfigured()) {
    const queue = generateDemoActionQueue(projectId);
    return apiSuccess({ items: queue, total: queue.length });
  }

  return apiSuccess({ items: [], total: 0 });
}
