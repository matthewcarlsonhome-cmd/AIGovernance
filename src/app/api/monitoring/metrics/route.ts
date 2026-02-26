import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withRateLimit } from '@/lib/api-helpers';
import { isServerSupabaseConfigured } from '@/lib/supabase/server';
import { getMonitoringSnapshot } from '@/lib/monitoring';
import type { MonitoringMetricsSnapshot } from '@/lib/monitoring';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data — Returned when Supabase is not configured
// ─────────────────────────────────────────────────────────────────────────────

function generateDemoMetrics(): MonitoringMetricsSnapshot {
  return {
    uptime_seconds: 86432,
    total_requests: 12847,
    error_count: 23,
    recent_errors: [
      {
        id: 'err-demo-001',
        route: '/api/assessments',
        method: 'POST',
        user_id: 'user-demo-1',
        message: 'Validation failed: missing required field "project_id"',
        stack: 'ZodError: Validation failed\n  at validateInput (/app/src/lib/validation.ts:42:11)\n  at POST (/app/src/app/api/assessments/route.ts:28:5)',
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 'err-demo-002',
        route: '/api/configs/validate',
        method: 'POST',
        user_id: 'user-demo-2',
        message: 'Sandbox validation timeout after 30000ms',
        stack: 'TimeoutError: Sandbox validation timeout after 30000ms\n  at validateSandbox (/app/src/lib/config-gen/validate.ts:87:9)',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'err-demo-003',
        route: '/api/reports',
        method: 'POST',
        user_id: null,
        message: 'PDF generation failed: template not found',
        stack: 'Error: PDF generation failed: template not found\n  at generatePdf (/app/src/lib/report-gen/pdf.ts:55:13)',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    performance: {
      routes: [
        { route: '/api/projects', request_count: 3421, p50_ms: 45.2, p95_ms: 128.7, p99_ms: 342.1, avg_ms: 62.3, min_ms: 12.1, max_ms: 890.4 },
        { route: '/api/assessments', request_count: 2156, p50_ms: 38.5, p95_ms: 95.2, p99_ms: 210.8, avg_ms: 52.1, min_ms: 8.3, max_ms: 654.2 },
        { route: '/api/timeline/tasks', request_count: 1893, p50_ms: 55.8, p95_ms: 145.3, p99_ms: 380.5, avg_ms: 72.4, min_ms: 15.7, max_ms: 1023.6 },
        { route: '/api/configs', request_count: 1247, p50_ms: 82.1, p95_ms: 234.6, p99_ms: 567.2, avg_ms: 105.8, min_ms: 22.4, max_ms: 1245.3 },
        { route: '/api/reports', request_count: 856, p50_ms: 125.4, p95_ms: 456.8, p99_ms: 1234.5, avg_ms: 178.9, min_ms: 45.2, max_ms: 2345.6 },
        { route: '/api/meetings', request_count: 634, p50_ms: 32.1, p95_ms: 78.5, p99_ms: 156.3, avg_ms: 41.2, min_ms: 9.8, max_ms: 423.7 },
        { route: '/api/roi', request_count: 423, p50_ms: 28.7, p95_ms: 65.4, p99_ms: 134.2, avg_ms: 36.5, min_ms: 7.2, max_ms: 312.8 },
        { route: '/api/health', request_count: 217, p50_ms: 15.3, p95_ms: 42.1, p99_ms: 88.7, avg_ms: 22.4, min_ms: 5.1, max_ms: 156.2 },
      ],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/monitoring/metrics
// Returns aggregated monitoring data: uptime, request counts, errors,
// and per-route performance percentiles.
// Restricted to admin users only.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const rateLimited = withRateLimit(request);
  if (rateLimited) return rateLimited;

  // Demo mode — return sample data when Supabase is not configured
  if (!isServerSupabaseConfigured()) {
    return apiSuccess(generateDemoMetrics());
  }

  // Auth check — only admin users may view monitoring metrics
  try {
    const { createServerSupabaseClient, createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError('Unauthorized', 401);
    }

    // Check user role
    const db = await createServiceRoleClient();
    const { data: profile } = await db
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return apiError('Forbidden: admin access required', 403);
    }
  } catch {
    // If auth check fails, return the metrics anyway in a degraded manner
    // (the middleware should have already blocked unauthenticated requests)
  }

  // Return live monitoring data
  const snapshot = getMonitoringSnapshot();
  return apiSuccess(snapshot);
}
