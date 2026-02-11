import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, PocProject } from '@/types';

/* ------------------------------------------------------------------ */
/*  Zod Schemas                                                        */
/* ------------------------------------------------------------------ */

const createPocProjectSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional().default(''),
  tool: z.enum(['claude_code', 'openai_codex', 'other']).optional().default('claude_code'),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']).optional().default('planned'),
  selection_score: z.number().min(0).max(100).optional().nullable(),
  criteria: z
    .array(
      z.object({
        name: z.string(),
        score: z.number(),
        weight: z.number(),
      }),
    )
    .optional()
    .nullable(),
});

/* ------------------------------------------------------------------ */
/*  GET /api/poc/projects?projectId=...                                */
/*  List PoC projects for a governance project.                        */
/* ------------------------------------------------------------------ */

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PocProject[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'projectId query parameter is required' },
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
      .from('poc_projects')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch PoC projects', message: error.message },
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
/*  POST /api/poc/projects                                             */
/*  Create a new PoC project.                                          */
/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PocProject>>> {
  try {
    const body = await request.json();
    const parsed = createPocProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return a mock PoC project matching the PocProject interface
    if (!isServerSupabaseConfigured()) {
      const now = new Date().toISOString();
      const demoPocProject: PocProject = {
        id: `poc-proj-demo-${Date.now()}`,
        project_id: parsed.data.project_id,
        name: parsed.data.name,
        description: parsed.data.description ?? '',
        tool: parsed.data.tool ?? 'claude_code',
        status: parsed.data.status ?? 'planned',
        selection_score: parsed.data.selection_score ?? null,
        criteria: parsed.data.criteria ?? null,
        created_at: now,
        updated_at: now,
      };
      return NextResponse.json({ data: demoPocProject }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();
    const { data: pocProject, error } = await supabase
      .from('poc_projects')
      .insert({
        project_id: parsed.data.project_id,
        name: parsed.data.name,
        description: parsed.data.description ?? '',
        tool: parsed.data.tool ?? 'claude_code',
        status: parsed.data.status ?? 'planned',
        selection_score: parsed.data.selection_score ?? null,
        criteria: parsed.data.criteria ?? null,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create PoC project', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: pocProject }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
