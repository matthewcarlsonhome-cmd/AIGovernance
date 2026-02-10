import { createServerSupabaseClient } from '@/lib/supabase/server';
import type {
  TimelineTask,
  TaskStatus,
  TaskDependency,
  DependencyType,
  TimelineMilestone,
  TimelineSnapshot,
} from '@/types';

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

/**
 * Fetch all tasks for a project, ordered by start date.
 * Includes dependency information embedded in each task row.
 */
export async function getTasks(projectId: string): Promise<TimelineTask[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('workflow_tasks')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create a new timeline task.
 */
export async function saveTask(
  data: Pick<
    TimelineTask,
    'project_id' | 'title' | 'phase' | 'start_date' | 'end_date' | 'duration_days'
  > &
    Partial<
      Pick<
        TimelineTask,
        | 'description'
        | 'assigned_to'
        | 'status'
        | 'dependencies'
        | 'progress_percent'
        | 'is_milestone'
        | 'is_critical_path'
        | 'gate_review_id'
        | 'color'
      >
    >
): Promise<TimelineTask> {
  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from('workflow_tasks')
    .insert({
      project_id: data.project_id,
      title: data.title,
      description: data.description ?? null,
      phase: data.phase,
      start_date: data.start_date,
      end_date: data.end_date,
      duration_days: data.duration_days,
      assigned_to: data.assigned_to ?? null,
      status: data.status ?? 'not_started',
      dependencies: data.dependencies ?? [],
      progress_percent: data.progress_percent ?? 0,
      is_milestone: data.is_milestone ?? false,
      is_critical_path: data.is_critical_path ?? false,
      gate_review_id: data.gate_review_id ?? null,
      color: data.color ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Update an existing timeline task. Only the provided fields are modified.
 */
export async function updateTask(
  id: string,
  data: Partial<
    Pick<
      TimelineTask,
      | 'title'
      | 'description'
      | 'phase'
      | 'start_date'
      | 'end_date'
      | 'duration_days'
      | 'assigned_to'
      | 'status'
      | 'dependencies'
      | 'progress_percent'
      | 'is_milestone'
      | 'is_critical_path'
      | 'gate_review_id'
      | 'color'
    >
  >
): Promise<TimelineTask> {
  const supabase = await createServerSupabaseClient();
  const { data: updated, error } = await supabase
    .from('workflow_tasks')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Soft-delete a timeline task.
 */
export async function deleteTask(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('workflow_tasks')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

/**
 * Fetch all task-to-task dependencies for a project.
 * Dependencies are stored in a dedicated junction table.
 */
export async function getDependencies(
  projectId: string
): Promise<
  Array<{
    id: string;
    source_task_id: string;
    target_task_id: string;
    type: DependencyType;
    created_at: string;
  }>
> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('timeline_dependencies')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create a new dependency link between two tasks.
 */
export async function saveDependency(
  data: {
    project_id: string;
    source_task_id: string;
    target_task_id: string;
    type: DependencyType;
  }
): Promise<{
  id: string;
  source_task_id: string;
  target_task_id: string;
  type: DependencyType;
  created_at: string;
}> {
  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from('timeline_dependencies')
    .insert({
      project_id: data.project_id,
      source_task_id: data.source_task_id,
      target_task_id: data.target_task_id,
      type: data.type,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

/**
 * Fetch all milestones for a project, ordered by date.
 */
export async function getMilestones(
  projectId: string
): Promise<TimelineMilestone[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('timeline_milestones')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a milestone.
 */
export async function saveMilestone(
  data: Pick<TimelineMilestone, 'project_id' | 'title' | 'date'> &
    Partial<Pick<TimelineMilestone, 'id' | 'description' | 'status' | 'gate_number'>>
): Promise<TimelineMilestone> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('timeline_milestones')
      .update({
        title: data.title,
        description: data.description ?? null,
        date: data.date,
        status: data.status ?? 'pending',
        gate_number: data.gate_number ?? null,
        updated_at: now,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('timeline_milestones')
    .insert({
      project_id: data.project_id,
      title: data.title,
      description: data.description ?? null,
      date: data.date,
      status: data.status ?? 'pending',
      gate_number: data.gate_number ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Snapshots
// ---------------------------------------------------------------------------

/**
 * Fetch all schedule snapshots for a project, ordered newest first.
 */
export async function getSnapshots(
  projectId: string
): Promise<TimelineSnapshot[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('timeline_snapshots')
    .select('*')
    .eq('project_id', projectId)
    .order('captured_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Capture a new schedule snapshot.
 * Typically called before a baseline reset or major reschedule.
 */
export async function saveSnapshot(
  data: Pick<TimelineSnapshot, 'project_id' | 'name' | 'snapshot_data'> &
    Partial<Pick<TimelineSnapshot, 'description' | 'captured_by'>>
): Promise<TimelineSnapshot> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: created, error } = await supabase
    .from('timeline_snapshots')
    .insert({
      project_id: data.project_id,
      name: data.name,
      description: data.description ?? null,
      snapshot_data: data.snapshot_data,
      captured_at: new Date().toISOString(),
      captured_by: data.captured_by ?? user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}
