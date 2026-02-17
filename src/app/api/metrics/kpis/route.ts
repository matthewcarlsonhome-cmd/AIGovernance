import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isServerSupabaseConfigured, createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess, generateTraceId } from '@/lib/api-helpers';
import { evaluateProjectKpis, KPI_CATALOG } from '@/lib/metrics';
import type { ApiResponse, KpiDefinition, KpiSnapshot } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_KPIS: KpiDefinition[] = [
  {
    id: 'kpi-001',
    project_id: 'proj-demo-001',
    category: 'time_saved',
    name: 'Developer Time Saved',
    description: 'Hours per week saved by developers using AI coding assistants',
    unit: 'hours/week',
    baseline_value: 0,
    target_value: 8,
    current_value: 5.2,
    measurement_method: 'Time tracking survey + PR cycle time comparison',
    owner_id: 'user-001',
    owner_name: 'Sarah Chen',
    frequency: 'weekly',
    status: 'tracking',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-002',
    project_id: 'proj-demo-001',
    category: 'quality_lift',
    name: 'Test Coverage Improvement',
    description: 'Increase in automated test coverage across pilot repositories',
    unit: '%',
    baseline_value: 62,
    target_value: 77,
    current_value: 74,
    measurement_method: 'Coverage tool delta (before vs after pilot)',
    owner_id: 'user-002',
    owner_name: 'James Rodriguez',
    frequency: 'monthly',
    status: 'tracking',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-003',
    project_id: 'proj-demo-001',
    category: 'adoption',
    name: 'Active Pilot Users',
    description: 'Number of developers actively using AI assistant daily',
    unit: 'users',
    baseline_value: 0,
    target_value: 10,
    current_value: 12,
    measurement_method: 'Provider usage dashboard / license analytics',
    owner_id: 'user-001',
    owner_name: 'Sarah Chen',
    frequency: 'weekly',
    status: 'met',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-004',
    project_id: 'proj-demo-001',
    category: 'error_rate',
    name: 'Defect Rate Change',
    description: 'Change in defects per 1000 lines of code during pilot',
    unit: 'defects/KLOC',
    baseline_value: 4.5,
    target_value: 2.5,
    current_value: 3.1,
    measurement_method: 'Bug tracker + KLOC from VCS',
    owner_id: 'user-003',
    owner_name: 'Maya Patel',
    frequency: 'monthly',
    status: 'tracking',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-005',
    project_id: 'proj-demo-001',
    category: 'satisfaction',
    name: 'Developer Satisfaction Score',
    description: 'Developer NPS for AI tools',
    unit: 'NPS',
    baseline_value: null,
    target_value: 40,
    current_value: 52,
    measurement_method: 'Anonymous survey',
    owner_id: 'user-001',
    owner_name: 'Sarah Chen',
    frequency: 'monthly',
    status: 'met',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-08-01T14:00:00Z',
  },
  {
    id: 'kpi-006',
    project_id: 'proj-demo-001',
    category: 'cost_reduction',
    name: 'Cost Per Feature',
    description: 'Average cost to deliver a story point or feature during pilot',
    unit: 'USD',
    baseline_value: 1200,
    target_value: 800,
    current_value: 920,
    measurement_method: 'Sprint cost allocation / story points delivered',
    owner_id: 'user-002',
    owner_name: 'James Rodriguez',
    frequency: 'monthly',
    status: 'at_risk',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-08-01T14:00:00Z',
  },
];

const DEMO_SNAPSHOTS: KpiSnapshot[] = [
  { id: 'snap-001', kpi_id: 'kpi-001', value: 3.1, confidence: 'medium', notes: 'Week 2 measurement', captured_at: '2025-07-01T10:00:00Z' },
  { id: 'snap-002', kpi_id: 'kpi-001', value: 4.8, confidence: 'high', notes: 'Week 4 measurement', captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-003', kpi_id: 'kpi-001', value: 5.2, confidence: 'high', notes: 'Week 6 measurement', captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-004', kpi_id: 'kpi-002', value: 67, confidence: 'high', notes: 'Month 1', captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-005', kpi_id: 'kpi-002', value: 74, confidence: 'high', notes: 'Month 2', captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-006', kpi_id: 'kpi-003', value: 7, confidence: 'high', notes: null, captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-007', kpi_id: 'kpi-003', value: 12, confidence: 'high', notes: null, captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-008', kpi_id: 'kpi-004', value: 3.8, confidence: 'medium', notes: null, captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-009', kpi_id: 'kpi-004', value: 3.1, confidence: 'medium', notes: null, captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-010', kpi_id: 'kpi-005', value: 38, confidence: 'medium', notes: 'First survey', captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-011', kpi_id: 'kpi-005', value: 52, confidence: 'high', notes: 'Second survey', captured_at: '2025-08-01T10:00:00Z' },
  { id: 'snap-012', kpi_id: 'kpi-006', value: 1050, confidence: 'low', notes: null, captured_at: '2025-07-15T10:00:00Z' },
  { id: 'snap-013', kpi_id: 'kpi-006', value: 920, confidence: 'medium', notes: null, captured_at: '2025-08-01T10:00:00Z' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

const createKpiSchema = z.object({
  project_id: z.string().min(1),
  category: z.enum(['time_saved', 'quality_lift', 'error_rate', 'adoption', 'cost_reduction', 'satisfaction']),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional().default(''),
  unit: z.string().min(1).max(50),
  baseline_value: z.number().nullable().optional().default(null),
  target_value: z.number(),
  measurement_method: z.string().min(1),
  owner_id: z.string().nullable().optional().default(null),
  owner_name: z.string().nullable().optional().default(null),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
});

const recordSnapshotSchema = z.object({
  kpi_id: z.string().min(1),
  value: z.number(),
  confidence: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  notes: z.string().nullable().optional().default(null),
});

/**
 * GET /api/metrics/kpis?project_id=xxx
 * Returns KPIs with evaluation summary for a project.
 * Optional: ?catalog=true returns the KPI catalog instead.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const catalog = searchParams.get('catalog');

    // Return catalog of standard KPIs
    if (catalog === 'true') {
      return apiSuccess({ catalog: KPI_CATALOG });
    }

    if (!projectId) {
      return apiError('project_id query parameter is required', 400);
    }

    // Demo mode
    if (!isServerSupabaseConfigured()) {
      const projectKpis = DEMO_KPIS.filter((k) => k.project_id === projectId);
      const projectSnapshots = DEMO_SNAPSHOTS.filter((s) =>
        projectKpis.some((k) => k.id === s.kpi_id),
      );
      const summary = evaluateProjectKpis(projectKpis, projectSnapshots);
      return apiSuccess({ kpis: projectKpis, snapshots: projectSnapshots, summary });
    }

    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    return apiSuccess({ kpis: [], snapshots: [], summary: null }, 200, 'No KPIs configured yet');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(message, 500);
  }
}

/**
 * POST /api/metrics/kpis
 * Create a new KPI or record a snapshot.
 * Body: { action: 'create_kpi', ...kpiData } or { action: 'record_snapshot', ...snapshotData }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action;

    if (action === 'record_snapshot') {
      const parsed = recordSnapshotSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json<ApiResponse>(
          { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors), traceId: generateTraceId() },
          { status: 400 },
        );
      }

      if (!isServerSupabaseConfigured()) {
        const snapshot: KpiSnapshot = {
          id: `snap-${Date.now()}`,
          kpi_id: parsed.data.kpi_id,
          value: parsed.data.value,
          confidence: parsed.data.confidence,
          notes: parsed.data.notes,
          captured_at: new Date().toISOString(),
        };
        return apiSuccess(snapshot, 201, 'Snapshot recorded');
      }

      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return apiError('Unauthorized', 401);

      return apiSuccess(null, 201, 'Snapshot recorded');
    }

    // Default: create KPI
    const parsed = createKpiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors), traceId: generateTraceId() },
        { status: 400 },
      );
    }

    if (!isServerSupabaseConfigured()) {
      const now = new Date().toISOString();
      const kpi: KpiDefinition = {
        id: `kpi-${Date.now()}`,
        ...parsed.data,
        current_value: null,
        status: 'not_started',
        created_at: now,
        updated_at: now,
      };
      return apiSuccess(kpi, 201, 'KPI created');
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('Unauthorized', 401);

    return apiSuccess(null, 201, 'KPI created');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(message, 500);
  }
}
