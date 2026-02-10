import { createServerSupabaseClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'approve'
  | 'sign_in'
  | 'sign_out';

export interface AuditLogEntry {
  id: string;
  organization_id: string;
  user_id: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface LogAuditParams {
  action: AuditAction;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  userId: string;
  orgId: string;
  ipAddress?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Insert an audit log entry.
 *
 * This is a fire-and-forget helper -- callers may `await` it but failures are
 * logged rather than thrown so that primary operations are not blocked by
 * audit logging errors.
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('audit_logs') as any).insert({
      organization_id: params.orgId,
      user_id: params.userId,
      action: params.action,
      resource_type: params.resource_type,
      resource_id: params.resource_id ?? null,
      details: params.details ?? {},
      ip_address: params.ipAddress ?? null,
    });

    if (error) {
      console.error('[audit] Failed to write audit log:', error.message);
    }
  } catch (err) {
    console.error(
      '[audit] Unexpected error writing audit log:',
      err instanceof Error ? err.message : err,
    );
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Retrieve audit log entries for an organization with optional filters.
 *
 * Results are ordered by `created_at DESC` (most recent first).
 */
export async function getAuditLogs(
  orgId: string,
  filters: AuditLogFilters = {},
): Promise<{ data: AuditLogEntry[]; count: number }> {
  const supabase = await createServerSupabaseClient();

  const {
    userId,
    action,
    resourceType,
    from,
    to,
    limit = 50,
    offset = 0,
  } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('audit_logs') as any)
    .select('*', { count: 'exact' })
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (userId) {
    query = query.eq('user_id', userId);
  }
  if (action) {
    query = query.eq('action', action);
  }
  if (resourceType) {
    query = query.eq('resource_type', resourceType);
  }
  if (from) {
    query = query.gte('created_at', from);
  }
  if (to) {
    query = query.lte('created_at', to);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: (data ?? []) as AuditLogEntry[],
    count: count ?? 0,
  };
}
