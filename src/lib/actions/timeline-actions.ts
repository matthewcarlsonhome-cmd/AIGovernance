'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { TaskStatus, DependencyType } from '@/types';

export async function saveTask(data: {
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  phase: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  assigned_to?: string;
  status?: TaskStatus;
  is_milestone?: boolean;
  is_critical_path?: boolean;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (data.id) {
    const { data: task, error } = await supabase
      .from('timeline_tasks')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;

    // Record status change
    if (data.status) {
      await supabase.from('task_status_history').insert({
        task_id: data.id,
        new_status: data.status,
        changed_by: user.id,
      });
    }

    return task;
  }

  const { data: task, error } = await supabase
    .from('timeline_tasks')
    .insert({ ...data, status: data.status || 'not_started' })
    .select()
    .single();
  if (error) throw error;
  return task;
}

export async function updateTaskDates(
  taskId: string,
  startDate: string,
  endDate: string,
  durationDays: number
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('timeline_tasks')
    .update({ start_date: startDate, end_date: endDate, duration_days: durationDays })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, progressPercent?: number) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const updates: Record<string, unknown> = { status };
  if (progressPercent !== undefined) updates.progress_percent = progressPercent;

  const { data, error } = await supabase
    .from('timeline_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  await supabase.from('task_status_history').insert({
    task_id: taskId,
    new_status: status,
    changed_by: user.id,
  });

  return data;
}

export async function deleteTask(taskId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Remove dependencies first
  await supabase.from('timeline_dependencies').delete().or(`source_task_id.eq.${taskId},target_task_id.eq.${taskId}`);

  const { error } = await supabase.from('timeline_tasks').delete().eq('id', taskId);
  if (error) throw error;
}

export async function saveDependency(data: {
  source_task_id: string;
  target_task_id: string;
  type: DependencyType;
  lag_days?: number;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: dep, error } = await supabase
    .from('timeline_dependencies')
    .upsert(
      { ...data, lag_days: data.lag_days || 0 },
      { onConflict: 'source_task_id,target_task_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return dep;
}

export async function saveMilestone(data: {
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  date: string;
  status?: string;
  gate_number?: number;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (data.id) {
    const { data: ms, error } = await supabase
      .from('timeline_milestones')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return ms;
  }

  const { data: ms, error } = await supabase
    .from('timeline_milestones')
    .insert({ ...data, status: data.status || 'pending' })
    .select()
    .single();
  if (error) throw error;
  return ms;
}

export async function saveSnapshot(projectId: string, name: string, snapshotData: Record<string, unknown>) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('timeline_snapshots')
    .insert({
      project_id: projectId,
      name,
      snapshot_data: snapshotData,
      captured_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
