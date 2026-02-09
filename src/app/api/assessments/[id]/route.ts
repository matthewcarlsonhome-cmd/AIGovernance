import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse, AssessmentResponse } from '@/types';

const updateResponseSchema = z.object({
  value: z.union([
    z.string(),
    z.array(z.string()),
    z.number(),
  ]),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/assessments/[id]
 * Fetch all assessment responses for a given project ID.
 * The [id] here represents the project_id for which responses are being fetched.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<AssessmentResponse[]>>> {
  try {
    const { id: projectId } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch responses', message: error.message },
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
 * PUT /api/assessments/[id]
 * Update a single assessment response by its response ID.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<AssessmentResponse>>> {
  try {
    const { id: responseId } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateResponseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const { data: updated, error } = await supabase
      .from('assessment_responses')
      .update({
        value: parsed.data.value,
        responded_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', responseId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update response', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
