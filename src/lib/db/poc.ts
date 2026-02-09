import { createServerSupabaseClient } from '@/lib/supabase/server';
import type {
  PocProject,
  PocCriterion,
  PocSprint,
  PocMetric,
  ToolEvaluation,
} from '@/types';

// ---------------------------------------------------------------------------
// PoC Projects
// ---------------------------------------------------------------------------

/**
 * Fetch all PoC projects under a parent governance project.
 */
export async function getPocProjects(
  projectId: string
): Promise<PocProject[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('poc_projects')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a PoC project.
 */
export async function savePocProject(
  data: Pick<PocProject, 'project_id' | 'name' | 'description' | 'tool'> &
    Partial<Pick<PocProject, 'id' | 'status' | 'selection_score' | 'criteria'>>
): Promise<PocProject> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('poc_projects')
      .update({
        name: data.name,
        description: data.description,
        tool: data.tool,
        status: data.status ?? 'planned',
        selection_score: data.selection_score ?? null,
        criteria: data.criteria ?? null,
        updated_at: now,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('poc_projects')
    .insert({
      project_id: data.project_id,
      name: data.name,
      description: data.description,
      tool: data.tool,
      status: data.status ?? 'planned',
      selection_score: data.selection_score ?? null,
      criteria: data.criteria ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Sprints
// ---------------------------------------------------------------------------

/**
 * Fetch all sprints for a PoC project, ordered by sprint number.
 */
export async function getSprints(
  pocProjectId: string
): Promise<PocSprint[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('poc_sprints')
    .select('*')
    .eq('poc_project_id', pocProjectId)
    .order('sprint_number', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a sprint within a PoC project.
 */
export async function saveSprint(
  data: Pick<PocSprint, 'poc_project_id' | 'sprint_number' | 'start_date' | 'end_date' | 'goals'> &
    Partial<Pick<PocSprint, 'id' | 'status' | 'velocity' | 'satisfaction' | 'notes'>>
): Promise<PocSprint> {
  const supabase = await createServerSupabaseClient();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('poc_sprints')
      .update({
        sprint_number: data.sprint_number,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status ?? 'planned',
        goals: data.goals,
        velocity: data.velocity ?? null,
        satisfaction: data.satisfaction ?? null,
        notes: data.notes ?? null,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('poc_sprints')
    .insert({
      poc_project_id: data.poc_project_id,
      sprint_number: data.sprint_number,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status ?? 'planned',
      goals: data.goals,
      velocity: data.velocity ?? null,
      satisfaction: data.satisfaction ?? null,
      notes: data.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/**
 * Fetch all metrics captured during a sprint.
 */
export async function getMetrics(sprintId: string): Promise<PocMetric[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('poc_metrics')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('metric_type', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Save a metric entry for a sprint.
 * Uses upsert on (sprint_id, metric_type) so re-submissions overwrite.
 */
export async function saveMetric(
  data: Pick<PocMetric, 'sprint_id' | 'metric_type' | 'baseline_value' | 'ai_assisted_value' | 'unit'> &
    Partial<Pick<PocMetric, 'id' | 'notes'>>
): Promise<PocMetric> {
  const supabase = await createServerSupabaseClient();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('poc_metrics')
      .update({
        metric_type: data.metric_type,
        baseline_value: data.baseline_value,
        ai_assisted_value: data.ai_assisted_value,
        unit: data.unit,
        notes: data.notes ?? null,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('poc_metrics')
    .upsert(
      {
        sprint_id: data.sprint_id,
        metric_type: data.metric_type,
        baseline_value: data.baseline_value,
        ai_assisted_value: data.ai_assisted_value,
        unit: data.unit,
        notes: data.notes ?? null,
      },
      { onConflict: 'sprint_id,metric_type' }
    )
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Tool Evaluations
// ---------------------------------------------------------------------------

/**
 * Fetch all tool evaluation entries for a project.
 */
export async function getToolEvaluations(
  projectId: string
): Promise<ToolEvaluation[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('tool_evaluations')
    .select('*')
    .eq('project_id', projectId)
    .order('tool_name', { ascending: true })
    .order('category', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a tool evaluation entry.
 */
export async function saveToolEvaluation(
  data: Pick<ToolEvaluation, 'project_id' | 'tool_name' | 'category' | 'score' | 'max_score'> &
    Partial<Pick<ToolEvaluation, 'id' | 'notes'>>
): Promise<ToolEvaluation> {
  const supabase = await createServerSupabaseClient();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('tool_evaluations')
      .update({
        tool_name: data.tool_name,
        category: data.category,
        score: data.score,
        max_score: data.max_score,
        notes: data.notes ?? null,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('tool_evaluations')
    .insert({
      project_id: data.project_id,
      tool_name: data.tool_name,
      category: data.category,
      score: data.score,
      max_score: data.max_score,
      notes: data.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}
