import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Organization, User } from '@/types';

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

/**
 * Fetch an organization by its ID.
 */
export async function getOrganization(id: string): Promise<Organization> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing organization. Only the provided fields are modified.
 */
export async function updateOrganization(
  id: string,
  data: Partial<
    Pick<Organization, 'name' | 'slug' | 'industry' | 'size' | 'logo_url' | 'settings'>
  >
): Promise<Organization> {
  const supabase = await createServerSupabaseClient();
  const { data: updated, error } = await supabase
    .from('organizations')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

// ---------------------------------------------------------------------------
// Organization Members
// ---------------------------------------------------------------------------

/**
 * Fetch all users belonging to an organization, ordered alphabetically.
 */
export async function getOrgMembers(orgId: string): Promise<User[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
