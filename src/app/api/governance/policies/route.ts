import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, Policy } from '@/types';

const createPolicySchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Title is required').max(500),
  type: z.string().min(1, 'Type is required'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['draft', 'review', 'approved', 'archived']).default('draft'),
});

/**
 * GET /api/governance/policies
 * Fetch policies for a project. Requires ?projectId= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Policy[]>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: [] });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'projectId query parameter is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch policies', message: error.message },
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
 * POST /api/governance/policies
 * Create a new policy for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Policy>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `policy-${Date.now()}`,
          project_id: body.project_id ?? '',
          title: body.title ?? '',
          type: body.type ?? 'aup',
          status: body.status ?? 'draft',
          content: body.content ?? '',
          version: 1,
          approved_by: null,
          approved_at: null,
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
    const parsed = createPolicySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: parsed.error.flatten().fieldErrors.toString() },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: policy, error } = await supabase
      .from('policies')
      .insert({
        project_id: parsed.data.project_id,
        title: parsed.data.title,
        type: parsed.data.type,
        content: parsed.data.content,
        status: parsed.data.status,
        version: 1,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create policy', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: policy }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
