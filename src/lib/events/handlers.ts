// Default Event Handlers (Design Doc §8.2)
// Wire up built-in side effects: audit logging, evidence capture, etc.

import { subscribe } from './bus';
import type { DomainEvent } from './types';
import { logAudit } from '@/lib/db/audit';

/**
 * Register all default event handlers.
 * Call once during server initialization.
 */
export function registerDefaultHandlers(): void {
  // Wildcard handler: persist every event to audit log
  subscribe('*', async (event: DomainEvent) => {
    try {
      await logAudit({
        orgId: event.organization_id,
        userId: event.actor.id,
        action: mapEventToAuditAction(event.type),
        resource_type: extractResourceType(event.type),
        resource_id: extractResourceId(event) ?? undefined,
        details: {
          event_type: event.type,
          trace_id: event.trace_id,
          payload: event.payload,
        },
      });
    } catch (err) {
      // Audit logging is fire-and-forget; never block the caller
      console.error('[EventHandler] Audit log failed:', err);
    }
  });

  // Gate approvals: log specifically for compliance trail
  subscribe('gate.approved', async (event) => {
    console.log(
      `[Governance] Gate ${event.payload.gate_type} approved for project ${event.project_id} by ${event.actor.name}`,
    );
  });

  subscribe('gate.rejected', async (event) => {
    console.log(
      `[Governance] Gate ${event.payload.gate_type} rejected for project ${event.project_id}: ${event.payload.rationale}`,
    );
  });

  // Security control failures: flag for immediate attention
  subscribe('control.check_failed', async (event) => {
    console.warn(
      `[Security] Control ${event.payload.control_id} FAILED for project ${event.project_id}: ${event.payload.control_name}`,
    );
  });

  // Risk escalation: alert
  subscribe('risk.escalated', async (event) => {
    console.warn(
      `[Risk] Risk ${event.payload.risk_id} escalated to ${event.payload.escalated_to} for project ${event.project_id}`,
    );
  });

  // Incident creation: alert
  subscribe('incident.created', async (event) => {
    console.warn(
      `[Incident] ${event.payload.severity} incident created: ${event.payload.title} (project ${event.project_id})`,
    );
  });

  // Project state transitions: log for timeline
  subscribe('project.state_changed', async (event) => {
    console.log(
      `[Project] ${event.project_id} transitioned from ${event.payload.from_state} → ${event.payload.to_state}`,
    );
  });

  // KPI threshold breach: alert
  subscribe('metric.threshold_breached', async (event) => {
    console.warn(
      `[Metrics] KPI ${event.payload.kpi_id} breached threshold: ${event.payload.value} (threshold: ${event.payload.threshold})`,
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mapEventToAuditAction(eventType: string): 'create' | 'update' | 'delete' | 'view' | 'export' | 'approve' | 'sign_in' | 'sign_out' {
  if (eventType.includes('created') || eventType.includes('drafted')) return 'create';
  if (eventType.includes('approved') || eventType.includes('granted')) return 'approve';
  if (eventType.includes('archived') || eventType.includes('removed') || eventType.includes('deprecated')) return 'delete';
  if (eventType.includes('generated') || eventType.includes('export')) return 'export';
  return 'update';
}

function extractResourceType(eventType: string): string {
  const prefix = eventType.split('.')[0];
  const mapping: Record<string, string> = {
    project: 'project',
    gate: 'gate_review',
    policy: 'policy',
    risk: 'risk_classification',
    data: 'data_asset',
    control: 'control_check',
    incident: 'security_incident',
    evidence: 'evidence_package',
    metric: 'kpi',
    auth: 'user',
    team: 'team_member',
  };
  return mapping[prefix] ?? prefix;
}

function extractResourceId(event: DomainEvent): string | null {
  const payload = event.payload as Record<string, unknown>;
  // Try common ID field patterns
  for (const key of ['gate_id', 'policy_id', 'risk_id', 'asset_id', 'incident_id', 'package_id', 'kpi_id', 'user_id', 'control_id']) {
    if (payload[key] && typeof payload[key] === 'string') {
      return payload[key] as string;
    }
  }
  return event.project_id;
}
