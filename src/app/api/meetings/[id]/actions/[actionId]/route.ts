import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, ActionItem } from '@/types';

/* ------------------------------------------------------------------ */
/*  Zod Schemas                                                        */
/* ------------------------------------------------------------------ */

const updateActionItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  assigned_to: z.string().uuid('Invalid user ID').optional().nullable(),
  assigned_to_name: z.string().max(255).optional().nullable(),
  status: z.enum(['open', 'in_progress', 'complete', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().optional().nullable(),
  linked_task_id: z.string().uuid().optional().nullable(),
});

/* ------------------------------------------------------------------ */
/*  Route Context (nested params)                                      */
/* ------------------------------------------------------------------ */

type RouteContext = { params: Promise<{ id: string; actionId: string }> };

/* ------------------------------------------------------------------ */
/*  PATCH /api/meetings/[id]/actions/[actionId]                        */
/*  Update an action item with partial fields.                         */
/* ------------------------------------------------------------------ */

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<ActionItem>>> {
  try {
    const { id: meetingId, actionId } = await context.params;
    const body = await request.json();
    const parsed = updateActionItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Ensure at least one field is being updated
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'At least one field must be provided for update' },
        { status: 400 },
      );
    }

    // Demo mode: return a mock updated action item
    if (!isServerSupabaseConfigured()) {
      const now = new Date().toISOString();
      const demoActionItem: ActionItem = {
        id: actionId,
        meeting_id: meetingId,
        project_id: 'proj-demo-001',
        title: parsed.data.title ?? 'Review sandbox configuration',
        description: parsed.data.description !== undefined ? parsed.data.description : 'Review and approve the sandbox environment configuration before deployment.',
        assigned_to: parsed.data.assigned_to !== undefined ? parsed.data.assigned_to : 'usr-004',
        assigned_to_name: parsed.data.assigned_to_name !== undefined ? parsed.data.assigned_to_name : 'David Park',
        status: parsed.data.status ?? 'in_progress',
        priority: parsed.data.priority ?? 'high',
        due_date: parsed.data.due_date !== undefined ? parsed.data.due_date : '2025-02-28T00:00:00Z',
        linked_task_id: parsed.data.linked_task_id !== undefined ? parsed.data.linked_task_id : null,
        completed_at: parsed.data.status === 'complete' ? now : null,
        created_at: '2025-01-20T10:00:00Z',
        updated_at: now,
      };
      return NextResponse.json({ data: demoActionItem });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build update payload from parsed fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.assigned_to !== undefined) updateData.assigned_to = parsed.data.assigned_to;
    if (parsed.data.assigned_to_name !== undefined) updateData.assigned_to_name = parsed.data.assigned_to_name;
    if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
    if (parsed.data.due_date !== undefined) updateData.due_date = parsed.data.due_date;
    if (parsed.data.linked_task_id !== undefined) updateData.linked_task_id = parsed.data.linked_task_id;

    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status;
      // Automatically set completed_at when status transitions to 'complete'
      if (parsed.data.status === 'complete') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
    }

    const { data: updated, error } = await supabase
      .from('action_items')
      .update(updateData)
      .eq('id', actionId)
      .eq('meeting_id', meetingId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update action item', message: error.message },
        { status: 500 },
      );
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Action item not found', message: `No action item found with id ${actionId} in meeting ${meetingId}` },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/meetings/[id]/actions/[actionId]                       */
/*  Delete an action item.                                             */
/* ------------------------------------------------------------------ */

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { id: meetingId, actionId } = await context.params;

    // Demo mode: return success
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: { deleted: true } });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the action item belongs to the specified meeting before deleting
    const { data: existing } = await supabase
      .from('action_items')
      .select('id')
      .eq('id', actionId)
      .eq('meeting_id', meetingId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Action item not found', message: `No action item found with id ${actionId} in meeting ${meetingId}` },
        { status: 404 },
      );
    }

    const { error } = await supabase
      .from('action_items')
      .delete()
      .eq('id', actionId)
      .eq('meeting_id', meetingId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete action item', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
