import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse, AssessmentQuestion, AssessmentResponse } from '@/types';

const saveResponseSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  question_id: z.string().min(1, 'Question ID is required'),
  value: z.union([
    z.string(),
    z.array(z.string()),
    z.number(),
  ]),
});

/**
 * GET /api/assessments
 * Fetch assessment questions. Supports optional ?domain= and ?template_id= filters.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AssessmentQuestion[]>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const templateId = searchParams.get('template_id');

    let query = supabase
      .from('assessment_questions')
      .select('*')
      .order('order', { ascending: true });

    if (domain) {
      query = query.eq('domain', domain);
    }

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch assessment questions', message: error.message },
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
 * POST /api/assessments
 * Save a single assessment response. Uses upsert on (project_id, question_id).
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AssessmentResponse>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = saveResponseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const { data: saved, error } = await supabase
      .from('assessment_responses')
      .upsert(
        {
          project_id: parsed.data.project_id,
          question_id: parsed.data.question_id,
          value: parsed.data.value,
          responded_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,question_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save response', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
