import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, TimelineTask } from '@/types';

type RouteContext = { params: Promise<{ id: string }> };

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  phase: z.string().min(1).max(255).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  duration_days: z.number().int().min(1).optional(),
  assigned_to: z.string().max(255).optional().nullable(),
  status: z.enum(['not_started', 'in_progress', 'blocked', 'complete']).optional(),
  progress_percent: z.number().int().min(0).max(100).optional(),
  is_milestone: z.boolean().optional(),
  is_critical_path: z.boolean().optional(),
  color: z.string().max(50).optional().nullable(),
  dependencies: z
    .array(
      z.object({
        task_id: z.string(),
        type: z.enum(['FS', 'SS', 'FF', 'SF']),
      }),
    )
    .optional(),
});

/**
 * PATCH /api/timeline/tasks/[id]
 * Update a timeline task by ID. Accepts partial fields.
 * Requires authentication when Supabase is configured.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<TimelineTask>>> {
  try {
    const { id } = await context.params;

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return a simulated updated task
    if (!isServerSupabaseConfigured()) {
      const demoUpdated: TimelineTask = {
        id,
        project_id: 'proj-demo-001',
        title: parsed.data.title ?? 'Updated Demo Task',
        description: parsed.data.description ?? null,
        phase: parsed.data.phase ?? 'Discovery',
        start_date: parsed.data.start_date ?? '2025-07-01',
        end_date: parsed.data.end_date ?? '2025-07-14',
        duration_days: parsed.data.duration_days ?? 10,
        assigned_to: parsed.data.assigned_to ?? null,
        status: parsed.data.status ?? 'not_started',
        dependencies: parsed.data.dependencies ?? [],
        progress_percent: parsed.data.progress_percent ?? 0,
        is_milestone: parsed.data.is_milestone ?? false,
        is_critical_path: parsed.data.is_critical_path ?? false,
        gate_review_id: null,
        color: parsed.data.color ?? null,
      };
      return NextResponse.json({ data: demoUpdated });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.phase !== undefined) updateData.phase = parsed.data.phase;
    if (parsed.data.start_date !== undefined) updateData.start_date = parsed.data.start_date;
    if (parsed.data.end_date !== undefined) updateData.end_date = parsed.data.end_date;
    if (parsed.data.duration_days !== undefined) updateData.duration_days = parsed.data.duration_days;
    if (parsed.data.assigned_to !== undefined) updateData.assigned_to = parsed.data.assigned_to;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.progress_percent !== undefined) updateData.progress_percent = parsed.data.progress_percent;
    if (parsed.data.is_milestone !== undefined) updateData.is_milestone = parsed.data.is_milestone;
    if (parsed.data.is_critical_path !== undefined) updateData.is_critical_path = parsed.data.is_critical_path;
    if (parsed.data.color !== undefined) updateData.color = parsed.data.color;
    if (parsed.data.dependencies !== undefined) updateData.dependencies = parsed.data.dependencies;

    const { data: updated, error } = await supabase
      .from('workflow_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update task', message: error.message },
        { status: 500 },
      );
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Task not found', message: `No task found with id ${id}` },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * DELETE /api/timeline/tasks/[id]
 * Delete a timeline task by ID.
 * Requires authentication when Supabase is configured.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { id } = await context.params;

    // Demo mode: return success
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: { deleted: true } });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete any dependency references to this task first
    try {
      await supabase
        .from('timeline_dependencies')
        .delete()
        .or(`source_task_id.eq.${id},target_task_id.eq.${id}`);
    } catch {
      // Non-fatal: dependency table may not exist yet
    }

    const { error } = await supabase
      .from('workflow_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete task', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
