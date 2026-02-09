import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse, GeneratedReport } from '@/types';

const updateReportSchema = z.object({
  status: z.enum(['draft', 'generating', 'review', 'final']).optional(),
  title: z.string().min(1).max(255).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  file_url: z.string().url().optional().nullable(),
  file_size: z.number().min(0).optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/reports/[id]
 * Fetch a single generated report by ID, including its content.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<GeneratedReport>>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Report not found', message: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * PUT /api/reports/[id]
 * Update a generated report's status, content, or file reference.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<GeneratedReport>>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.content !== undefined) updateData.content = parsed.data.content;
    if (parsed.data.file_url !== undefined) updateData.file_url = parsed.data.file_url;
    if (parsed.data.file_size !== undefined) updateData.file_size = parsed.data.file_size;

    const { data: updated, error } = await supabase
      .from('generated_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update report', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
