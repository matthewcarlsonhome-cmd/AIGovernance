import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse, RaciMatrix } from '@/types';

const createMatrixSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  phase: z.string().min(1, 'Phase name is required').max(255),
});

/**
 * GET /api/raci
 * List RACI matrices for a project. Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<RaciMatrix[]>>> {
  try {
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
      .from('raci_matrices')
      .select('*')
      .eq('project_id', projectId)
      .order('phase', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch RACI matrices', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * POST /api/raci
 * Create a new RACI matrix for a project phase.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<RaciMatrix>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createMatrixSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Verify the project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', parsed.data.project_id)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', message: 'The specified project does not exist or has been deleted' },
        { status: 404 },
      );
    }

    // Check for duplicate phase within the same project
    const { data: existing } = await supabase
      .from('raci_matrices')
      .select('id')
      .eq('project_id', parsed.data.project_id)
      .eq('phase', parsed.data.phase)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Duplicate matrix', message: `A RACI matrix for phase "${parsed.data.phase}" already exists in this project` },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const { data: matrix, error } = await supabase
      .from('raci_matrices')
      .insert({
        project_id: parsed.data.project_id,
        phase: parsed.data.phase,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create RACI matrix', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: matrix }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
