// Domain Event Bus (Design Doc §8.2)
// In-process event bus for emitting and handling domain events.
// Events are persisted to the audit trail and can trigger side effects.

import type { DomainEvent, DomainEventType, DomainEventPayload } from './types';
import type { UserRole } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type EventHandler<T extends DomainEventType = DomainEventType> = (
  event: DomainEvent<T>,
) => void | Promise<void>;

export interface EmitOptions {
  organization_id: string;
  project_id?: string | null;
  actor: { id: string; name: string; role: UserRole };
  trace_id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Bus
// ─────────────────────────────────────────────────────────────────────────────

const handlers = new Map<DomainEventType | '*', EventHandler[]>();

/** In-memory event log for evidence timeline reconstruction. */
const eventLog: DomainEvent[] = [];

/** Maximum events kept in memory (bounded to avoid leaks). */
const MAX_EVENT_LOG_SIZE = 5000;

/**
 * Subscribe to a specific event type or '*' for all events.
 * Returns an unsubscribe function.
 */
export function subscribe<T extends DomainEventType>(
  eventType: T | '*',
  handler: EventHandler<T>,
): () => void {
  const existing = handlers.get(eventType) ?? [];
  existing.push(handler as EventHandler);
  handlers.set(eventType, existing);

  return () => {
    const list = handlers.get(eventType);
    if (list) {
      const idx = list.indexOf(handler as EventHandler);
      if (idx >= 0) list.splice(idx, 1);
    }
  };
}

/**
 * Emit a typed domain event.
 * Dispatches to all registered handlers (type-specific + wildcard).
 * Events are logged in the in-memory event log for evidence snapshots.
 */
export async function emit<T extends DomainEventType>(
  type: T,
  payload: DomainEventPayload[T],
  options: EmitOptions,
): Promise<DomainEvent<T>> {
  const event: DomainEvent<T> = {
    id: crypto.randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    organization_id: options.organization_id,
    project_id: options.project_id ?? null,
    actor: options.actor,
    payload,
    trace_id: options.trace_id ?? crypto.randomUUID(),
  };

  // Persist to in-memory log (bounded)
  eventLog.push(event as DomainEvent);
  if (eventLog.length > MAX_EVENT_LOG_SIZE) {
    eventLog.splice(0, eventLog.length - MAX_EVENT_LOG_SIZE);
  }

  // Dispatch to type-specific handlers
  const typeHandlers = handlers.get(type) ?? [];
  for (const handler of typeHandlers) {
    try {
      await handler(event as DomainEvent);
    } catch (err) {
      console.error(`[EventBus] Handler error for ${type}:`, err);
    }
  }

  // Dispatch to wildcard handlers
  const wildcardHandlers = handlers.get('*') ?? [];
  for (const handler of wildcardHandlers) {
    try {
      await handler(event as DomainEvent);
    } catch (err) {
      console.error(`[EventBus] Wildcard handler error for ${type}:`, err);
    }
  }

  return event;
}

/**
 * Query the in-memory event log.
 * Useful for building evidence snapshots from recent events.
 */
export function queryEvents(filters?: {
  project_id?: string;
  organization_id?: string;
  event_types?: DomainEventType[];
  since?: string;
  limit?: number;
}): DomainEvent[] {
  let results = [...eventLog];

  if (filters?.project_id) {
    results = results.filter((e) => e.project_id === filters.project_id);
  }
  if (filters?.organization_id) {
    results = results.filter((e) => e.organization_id === filters.organization_id);
  }
  if (filters?.event_types?.length) {
    const types = new Set(filters.event_types);
    results = results.filter((e) => types.has(e.type));
  }
  if (filters?.since) {
    const sinceDate = new Date(filters.since).getTime();
    results = results.filter((e) => new Date(e.timestamp).getTime() >= sinceDate);
  }

  // Most recent first
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filters?.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

/**
 * Get total event count (useful for metrics).
 */
export function getEventCount(): number {
  return eventLog.length;
}

/**
 * Clear all handlers and event log. Useful for testing.
 */
export function resetEventBus(): void {
  handlers.clear();
  eventLog.length = 0;
}
