import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { RaciMatrix, RaciEntry, RaciAssignment } from '@/types';

/**
 * Validation error returned by `validateRaciMatrix`.
 */
export interface RaciValidationError {
  task_name: string;
  error_type: 'missing_accountable' | 'multiple_accountable' | 'missing_responsible' | 'orphan_entry';
  message: string;
}

// ---------------------------------------------------------------------------
// RACI Matrices
// ---------------------------------------------------------------------------

/**
 * Fetch all RACI matrices for a project.
 */
export async function getRaciMatrices(
  projectId: string
): Promise<RaciMatrix[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('raci_matrices')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('phase', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch a single RACI matrix by ID.
 */
export async function getRaciMatrix(id: string): Promise<RaciMatrix> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('raci_matrices')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create or update a RACI matrix.
 */
export async function saveRaciMatrix(
  data: Pick<RaciMatrix, 'project_id' | 'phase'> &
    Partial<Pick<RaciMatrix, 'id'>>
): Promise<RaciMatrix> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('raci_matrices')
      .update({
        phase: data.phase,
        updated_at: now,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('raci_matrices')
    .insert({
      project_id: data.project_id,
      phase: data.phase,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// RACI Entries
// ---------------------------------------------------------------------------

/**
 * Fetch all entries for a RACI matrix, ordered by task name then user.
 */
export async function getRaciEntries(matrixId: string): Promise<RaciEntry[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('raci_entries')
    .select('*')
    .eq('matrix_id', matrixId)
    .is('deleted_at', null)
    .order('task_name', { ascending: true })
    .order('user_name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create a new RACI entry.
 */
export async function saveRaciEntry(
  data: Pick<RaciEntry, 'matrix_id' | 'task_name' | 'user_name' | 'assignment'> &
    Partial<Pick<RaciEntry, 'task_id' | 'user_id'>>
): Promise<RaciEntry> {
  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from('raci_entries')
    .insert({
      matrix_id: data.matrix_id,
      task_name: data.task_name,
      task_id: data.task_id ?? null,
      user_id: data.user_id ?? null,
      user_name: data.user_name,
      assignment: data.assignment,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Update an existing RACI entry (e.g. change assignment level).
 */
export async function updateRaciEntry(
  id: string,
  data: Partial<
    Pick<RaciEntry, 'task_name' | 'task_id' | 'user_id' | 'user_name' | 'assignment'>
  >
): Promise<RaciEntry> {
  const supabase = await createServerSupabaseClient();
  const { data: updated, error } = await supabase
    .from('raci_entries')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Soft-delete a RACI entry.
 */
export async function deleteRaciEntry(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('raci_entries')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a RACI matrix for completeness and correctness.
 *
 * Rules enforced:
 * 1. Every task must have exactly ONE Accountable (A) person.
 * 2. Every task must have at least one Responsible (R) person.
 * 3. No entry should reference a task_name that does not appear in at least
 *    one other entry (orphan detection -- warns about single-entry tasks).
 *
 * Returns an array of validation errors. An empty array indicates the matrix
 * passes all checks.
 */
export async function validateRaciMatrix(
  matrixId: string
): Promise<RaciValidationError[]> {
  const entries = await getRaciEntries(matrixId);
  const errors: RaciValidationError[] = [];

  // Group entries by task_name.
  const taskMap = new Map<string, RaciEntry[]>();
  for (const entry of entries) {
    const existing = taskMap.get(entry.task_name) ?? [];
    existing.push(entry);
    taskMap.set(entry.task_name, existing);
  }

  for (const [taskName, taskEntries] of taskMap) {
    const accountableEntries = taskEntries.filter((e) => e.assignment === 'A');
    const responsibleEntries = taskEntries.filter((e) => e.assignment === 'R');

    // Rule 1: Exactly one Accountable per task.
    if (accountableEntries.length === 0) {
      errors.push({
        task_name: taskName,
        error_type: 'missing_accountable',
        message: `Task "${taskName}" has no Accountable (A) person assigned. Each task must have exactly one.`,
      });
    } else if (accountableEntries.length > 1) {
      errors.push({
        task_name: taskName,
        error_type: 'multiple_accountable',
        message: `Task "${taskName}" has ${accountableEntries.length} Accountable (A) persons. Only one is allowed.`,
      });
    }

    // Rule 2: At least one Responsible per task.
    if (responsibleEntries.length === 0) {
      errors.push({
        task_name: taskName,
        error_type: 'missing_responsible',
        message: `Task "${taskName}" has no Responsible (R) person assigned. At least one is required.`,
      });
    }

    // Rule 3: Flag tasks with only a single entry (likely incomplete).
    if (taskEntries.length === 1) {
      errors.push({
        task_name: taskName,
        error_type: 'orphan_entry',
        message: `Task "${taskName}" has only one RACI entry. Consider assigning additional roles.`,
      });
    }
  }

  return errors;
}
