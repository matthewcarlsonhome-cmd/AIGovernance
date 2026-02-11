import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, MonitoringDashboard, MonitoringMetric, MonitoringAlert, DriftDetection } from '@/types';

const monitoringPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  health_score: z.number().min(0).max(100),
  metrics: z.array(z.object({
    id: z.string().min(1),
    tier: z.enum(['executive', 'model_performance', 'operational', 'data_quality', 'business_impact']),
    name: z.string().min(1),
    value: z.number(),
    target: z.number(),
    unit: z.string().min(1),
    trend: z.enum(['up', 'down', 'stable']),
    status: z.enum(['healthy', 'degraded', 'critical']),
    last_updated: z.string(),
  })).optional(),
  alerts: z.array(z.object({
    id: z.string().min(1),
    severity: z.enum(['critical', 'warning', 'info']),
    metric_id: z.string().min(1),
    message: z.string().min(1),
    threshold: z.number(),
    current_value: z.number(),
    triggered_at: z.string(),
    acknowledged: z.boolean(),
  })).optional(),
  drift_detections: z.array(z.object({
    id: z.string().min(1),
    drift_type: z.enum(['data_drift', 'concept_drift', 'feature_drift']),
    feature: z.string().min(1),
    score: z.number(),
    threshold: z.number(),
    detected_at: z.string(),
    status: z.enum(['active', 'resolved', 'investigating']),
  })).optional(),
});

const demoMetrics: MonitoringMetric[] = [
  { id: 'mm-001', tier: 'executive', name: 'AI System Uptime', value: 99.7, target: 99.9, unit: '%', trend: 'stable', status: 'healthy', last_updated: '2025-07-01T12:00:00Z' },
  { id: 'mm-002', tier: 'model_performance', name: 'Model Accuracy', value: 94.2, target: 95.0, unit: '%', trend: 'down', status: 'degraded', last_updated: '2025-07-01T12:00:00Z' },
  { id: 'mm-003', tier: 'model_performance', name: 'Inference Latency (p95)', value: 245, target: 300, unit: 'ms', trend: 'up', status: 'healthy', last_updated: '2025-07-01T12:00:00Z' },
  { id: 'mm-004', tier: 'operational', name: 'Daily Request Volume', value: 12450, target: 15000, unit: 'requests', trend: 'up', status: 'healthy', last_updated: '2025-07-01T12:00:00Z' },
  { id: 'mm-005', tier: 'operational', name: 'Error Rate', value: 1.2, target: 2.0, unit: '%', trend: 'stable', status: 'healthy', last_updated: '2025-07-01T12:00:00Z' },
  { id: 'mm-006', tier: 'data_quality', name: 'Input Data Completeness', value: 96.5, target: 98.0, unit: '%', trend: 'down', status: 'degraded', last_updated: '2025-07-01T12:00:00Z' },
  { id: 'mm-007', tier: 'data_quality', name: 'Feature Freshness', value: 98.1, target: 99.0, unit: '%', trend: 'stable', status: 'healthy', last_updated: '2025-07-01T12:00:00Z' },
  { id: 'mm-008', tier: 'business_impact', name: 'Code Review Turnaround', value: 2.3, target: 4.0, unit: 'hours', trend: 'down', status: 'healthy', last_updated: '2025-07-01T12:00:00Z' },
];

const demoAlerts: MonitoringAlert[] = [
  { id: 'ma-001', severity: 'warning', metric_id: 'mm-002', message: 'Model accuracy dropped below 95% threshold for 3 consecutive hours', threshold: 95.0, current_value: 94.2, triggered_at: '2025-07-01T09:15:00Z', acknowledged: false },
  { id: 'ma-002', severity: 'info', metric_id: 'mm-006', message: 'Input data completeness trending downward over the past 7 days', threshold: 98.0, current_value: 96.5, triggered_at: '2025-06-30T18:00:00Z', acknowledged: true },
  { id: 'ma-003', severity: 'critical', metric_id: 'mm-005', message: 'Error rate spike detected during peak hours', threshold: 2.0, current_value: 3.8, triggered_at: '2025-07-01T11:45:00Z', acknowledged: false },
];

const demoDriftDetections: DriftDetection[] = [
  { id: 'dd-001', drift_type: 'data_drift', feature: 'user_session_length', score: 0.72, threshold: 0.65, detected_at: '2025-06-28T14:00:00Z', status: 'investigating' },
  { id: 'dd-002', drift_type: 'concept_drift', feature: 'code_completion_acceptance_rate', score: 0.58, threshold: 0.50, detected_at: '2025-06-25T10:30:00Z', status: 'active' },
];

const demoMonitoringData: MonitoringDashboard = {
  id: 'monitoring-demo-001',
  project_id: 'proj-demo-001',
  health_score: 87,
  metrics: demoMetrics,
  alerts: demoAlerts,
  drift_detections: demoDriftDetections,
  created_at: '2025-06-01T10:00:00Z',
  updated_at: '2025-07-01T12:00:00Z',
};

/**
 * GET /api/monitoring
 * Fetch monitoring dashboard data for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<MonitoringDashboard | null>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoMonitoringData });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'project_id query parameter is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('monitoring_dashboards')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch monitoring dashboard', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * POST /api/monitoring
 * Create or update monitoring dashboard metrics for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<MonitoringDashboard>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `monitoring-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          health_score: body.health_score ?? 87,
          metrics: body.metrics ?? demoMetrics,
          alerts: body.alerts ?? demoAlerts,
          drift_detections: body.drift_detections ?? demoDriftDetections,
          created_at: now,
          updated_at: now,
        },
      }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = monitoringPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('monitoring_dashboards')
      .upsert(
        {
          project_id: parsed.data.project_id,
          health_score: parsed.data.health_score,
          metrics: parsed.data.metrics ?? [],
          alerts: parsed.data.alerts ?? [],
          drift_detections: parsed.data.drift_detections ?? [],
          updated_at: now,
        },
        { onConflict: 'project_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save monitoring dashboard', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
