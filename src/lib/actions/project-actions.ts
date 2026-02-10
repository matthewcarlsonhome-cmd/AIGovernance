'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ProjectStatus } from '@/types';

export async function createProject(data: {
  name: string;
  description: string;
  start_date?: string;
  target_end_date?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get user's org
  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!userData) throw new Error('User profile not found');

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name: data.name,
      description: data.description,
      organization_id: userData.organization_id,
      status: 'discovery' as ProjectStatus,
      start_date: data.start_date,
      target_end_date: data.target_end_date,
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-add creator as team member
  await supabase
    .from('team_members')
    .insert({
      user_id: user.id,
      project_id: project.id,
      role: 'consultant',
    });

  return project;
}

export async function updateProject(
  projectId: string,
  data: Partial<{ name: string; description: string; status: ProjectStatus; start_date: string; target_end_date: string }>
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: project, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return project;
}

export async function deleteProject(projectId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) throw error;
}
