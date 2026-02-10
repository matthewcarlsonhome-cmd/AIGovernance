import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ActionItem, ApiResponse } from '@/types';

const createActionItemSchema = z.object({
  title: z.string().min(1, 'Action item title is required').max(500),
  description: z.string().max(2000).optional(),
  assigned_to: z.string().uuid('Invalid user ID').optional(),
  assigned_to_name: z.string().max(255).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().optional().nullable(),
  linked_task_id: z.string().uuid().optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/meetings/[id]/actions
 * Fetch all action items for a specific meeting.
 * Supports ?status= filter (open, in_progress, complete, cancelled).
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<ActionItem[]>>> {
  try {
    const { id: meetingId } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('action_items')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch action items', message: error.message },
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
 * POST /api/meetings/[id]/actions
 * Create a new action item for a specific meeting.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<ActionItem>>> {
  try {
    const { id: meetingId } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createActionItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    // Verify the meeting exists and get its project_id
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_notes')
      .select('id, project_id')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found', message: 'The specified meeting does not exist' },
        { status: 404 },
      );
    }

    const now = new Date().toISOString();
    const { data: actionItem, error } = await supabase
      .from('action_items')
      .insert({
        meeting_id: meetingId,
        project_id: meeting.project_id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        assigned_to: parsed.data.assigned_to ?? null,
        assigned_to_name: parsed.data.assigned_to_name ?? null,
        status: 'open',
        priority: parsed.data.priority,
        due_date: parsed.data.due_date ?? null,
        linked_task_id: parsed.data.linked_task_id ?? null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create action item', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: actionItem }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
