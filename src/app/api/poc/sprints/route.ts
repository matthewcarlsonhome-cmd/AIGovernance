import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, PocSprint } from '@/types';

/* ------------------------------------------------------------------ */
/*  Zod Schemas                                                        */
/* ------------------------------------------------------------------ */

const createSprintSchema = z.object({
  poc_project_id: z.string().uuid('Invalid PoC project ID'),
  sprint_number: z.number().int().min(1, 'Sprint number must be at least 1'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(['planned', 'active', 'completed']).optional().default('planned'),
  goals: z.array(z.string()).optional().default([]),
  velocity: z.number().optional().nullable(),
  satisfaction: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

/* ------------------------------------------------------------------ */
/*  GET /api/poc/sprints?pocProjectId=...                              */
/*  List sprints for a PoC project.                                    */
/* ------------------------------------------------------------------ */

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PocSprint[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const pocProjectId = searchParams.get('pocProjectId');

    if (!pocProjectId) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'pocProjectId query parameter is required' },
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
      .from('poc_sprints')
      .select('*')
      .eq('poc_project_id', pocProjectId)
      .order('sprint_number', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch PoC sprints', message: error.message },
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
/*  POST /api/poc/sprints                                              */
/*  Create a new sprint for a PoC project.                             */
/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PocSprint>>> {
  try {
    const body = await request.json();
    const parsed = createSprintSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return a mock sprint matching the PocSprint interface
    if (!isServerSupabaseConfigured()) {
      const demoSprint: PocSprint = {
        id: `sprint-demo-${Date.now()}`,
        poc_project_id: parsed.data.poc_project_id,
        sprint_number: parsed.data.sprint_number,
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
        status: parsed.data.status ?? 'planned',
        goals: parsed.data.goals ?? [],
        velocity: parsed.data.velocity ?? null,
        satisfaction: parsed.data.satisfaction ?? null,
        notes: parsed.data.notes ?? null,
      };
      return NextResponse.json({ data: demoSprint }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: sprint, error } = await supabase
      .from('poc_sprints')
      .insert({
        poc_project_id: parsed.data.poc_project_id,
        sprint_number: parsed.data.sprint_number,
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
        status: parsed.data.status ?? 'planned',
        goals: parsed.data.goals ?? [],
        velocity: parsed.data.velocity ?? null,
        satisfaction: parsed.data.satisfaction ?? null,
        notes: parsed.data.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create PoC sprint', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: sprint }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
