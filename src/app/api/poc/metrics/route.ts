import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, PocMetric } from '@/types';

/* ------------------------------------------------------------------ */
/*  Zod Schemas                                                        */
/* ------------------------------------------------------------------ */

const createMetricSchema = z.object({
  sprint_id: z.string().uuid('Invalid sprint ID'),
  metric_type: z.enum(['velocity', 'defect_rate', 'cycle_time', 'satisfaction', 'code_quality']),
  baseline_value: z.number(),
  ai_assisted_value: z.number(),
  unit: z.string().min(1, 'Unit is required').max(100),
  notes: z.string().max(2000).optional().nullable(),
});

/* ------------------------------------------------------------------ */
/*  GET /api/poc/metrics?sprintId=...                                  */
/*  List metrics for a sprint.                                         */
/* ------------------------------------------------------------------ */

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PocMetric[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const sprintId = searchParams.get('sprintId');

    if (!sprintId) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'sprintId query parameter is required' },
        { status: 400 },
      );
    }

    // Demo mode: return empty array
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: [] });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('poc_metrics')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('metric_type', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch PoC metrics', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/poc/metrics                                              */
/*  Create a new metric record for a sprint.                           */
/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PocMetric>>> {
  try {
    const body = await request.json();
    const parsed = createMetricSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return a mock metric matching the PocMetric interface
    if (!isServerSupabaseConfigured()) {
      const demoMetric: PocMetric = {
        id: `metric-demo-${Date.now()}`,
        sprint_id: parsed.data.sprint_id,
        metric_type: parsed.data.metric_type,
        baseline_value: parsed.data.baseline_value,
        ai_assisted_value: parsed.data.ai_assisted_value,
        unit: parsed.data.unit,
        notes: parsed.data.notes ?? null,
      };
      return NextResponse.json({ data: demoMetric }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: metric, error } = await supabase
      .from('poc_metrics')
      .insert({
        sprint_id: parsed.data.sprint_id,
        metric_type: parsed.data.metric_type,
        baseline_value: parsed.data.baseline_value,
        ai_assisted_value: parsed.data.ai_assisted_value,
        unit: parsed.data.unit,
        notes: parsed.data.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create PoC metric', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: metric }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
