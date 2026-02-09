import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Project, ProjectStatus } from '@/types';

/**
 * Fetch all projects for the current user's organization.
 * Results are ordered by creation date (newest first) and exclude soft-deleted rows.
 */
export async function getProjects(): Promise<Project[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch a single project by its ID.
 * Throws if the project is not found or has been soft-deleted.
 */
export async function getProject(id: string): Promise<Project> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new project within an organization.
 */
export async function createProject(
  data: Pick<Project, 'name' | 'description' | 'organization_id'> &
    Partial<Pick<Project, 'status' | 'start_date' | 'target_end_date'>>
): Promise<Project> {
  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from('projects')
    .insert({
      name: data.name,
      description: data.description,
      organization_id: data.organization_id,
      status: data.status ?? 'discovery',
      start_date: data.start_date ?? null,
      target_end_date: data.target_end_date ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Update an existing project. Only the provided fields are modified.
 */
export async function updateProject(
  id: string,
  data: Partial<
    Pick<
      Project,
      | 'name'
      | 'description'
      | 'status'
      | 'feasibility_score'
      | 'start_date'
      | 'target_end_date'
      | 'actual_end_date'
    >
  >
): Promise<Project> {
  const supabase = await createServerSupabaseClient();
  const { data: updated, error } = await supabase
    .from('projects')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Soft-delete a project by setting `deleted_at` to the current timestamp.
 */
export async function deleteProject(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) throw error;
}
