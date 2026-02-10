'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types';

export async function addTeamMember(projectId: string, userId: string, role: UserRole) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('team_members')
    .insert({ user_id: userId, project_id: projectId, role })
    .select('*, user:users(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function removeTeamMember(memberId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

export async function updateTeamMemberRole(memberId: string, role: UserRole) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('id', memberId)
    .select('*, user:users(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function inviteUser(data: {
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  project_id?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Invite via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(data.email, {
    data: { full_name: data.full_name, role: data.role },
  });

  if (authError) throw authError;

  // Create user record
  if (authData.user) {
    await supabase.from('users').insert({
      id: authData.user.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      organization_id: data.organization_id,
    });

    // Add to project if specified
    if (data.project_id) {
      await supabase.from('team_members').insert({
        user_id: authData.user.id,
        project_id: data.project_id,
        role: data.role,
      });
    }
  }

  return authData;
}
