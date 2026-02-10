import { createServerSupabaseClient } from '@/lib/supabase/server';
import type {
  SandboxConfig,
  CloudProvider,
  SandboxModel,
  ConfigFile,
  EnvironmentValidation,
} from '@/types';

// ---------------------------------------------------------------------------
// Sandbox Configurations
// ---------------------------------------------------------------------------

/**
 * Fetch the sandbox configuration for a project.
 * Returns null if no configuration exists yet.
 */
export async function getSandboxConfig(
  projectId: string
): Promise<SandboxConfig | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('sandbox_configs')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Create or update the sandbox configuration for a project.
 * If `id` is provided the existing row is updated; otherwise a new row is created.
 */
export async function saveSandboxConfig(
  data: Pick<SandboxConfig, 'project_id' | 'cloud_provider' | 'sandbox_model' | 'settings'> &
    Partial<Pick<SandboxConfig, 'id' | 'vpc_cidr' | 'region' | 'ai_provider'>>
): Promise<SandboxConfig> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('sandbox_configs')
      .update({
        cloud_provider: data.cloud_provider,
        sandbox_model: data.sandbox_model,
        vpc_cidr: data.vpc_cidr ?? null,
        region: data.region ?? null,
        ai_provider: data.ai_provider ?? null,
        settings: data.settings,
        updated_at: now,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('sandbox_configs')
    .insert({
      project_id: data.project_id,
      cloud_provider: data.cloud_provider,
      sandbox_model: data.sandbox_model,
      vpc_cidr: data.vpc_cidr ?? null,
      region: data.region ?? null,
      ai_provider: data.ai_provider ?? null,
      settings: data.settings,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Config Files
// ---------------------------------------------------------------------------

/**
 * Fetch all generated config files associated with a sandbox configuration.
 */
export async function getConfigFiles(
  sandboxConfigId: string
): Promise<ConfigFile[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('config_files')
    .select('*')
    .eq('sandbox_config_id', sandboxConfigId)
    .order('filename', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a generated config file.
 * Uses upsert keyed on (sandbox_config_id, filename) so regenerating
 * a config file replaces the existing one.
 */
export async function saveConfigFile(
  data: Pick<ConfigFile, 'sandbox_config_id' | 'filename' | 'file_type' | 'content' | 'description'> &
    Partial<Pick<ConfigFile, 'id'>>
): Promise<ConfigFile> {
  const supabase = await createServerSupabaseClient();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('config_files')
      .update({
        filename: data.filename,
        file_type: data.file_type,
        content: data.content,
        description: data.description,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('config_files')
    .upsert(
      {
        sandbox_config_id: data.sandbox_config_id,
        filename: data.filename,
        file_type: data.file_type,
        content: data.content,
        description: data.description,
      },
      { onConflict: 'sandbox_config_id,filename' }
    )
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Environment Validations
// ---------------------------------------------------------------------------

/**
 * Fetch all validation results for a project, ordered newest first.
 */
export async function getValidations(
  projectId: string
): Promise<EnvironmentValidation[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('environment_validations')
    .select('*')
    .eq('project_id', projectId)
    .order('validated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Save a new environment validation result.
 */
export async function saveValidation(
  data: Pick<
    EnvironmentValidation,
    'project_id' | 'check_name' | 'check_category' | 'status'
  > &
    Partial<Pick<EnvironmentValidation, 'message' | 'details'>>
): Promise<EnvironmentValidation> {
  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from('environment_validations')
    .insert({
      project_id: data.project_id,
      check_name: data.check_name,
      check_category: data.check_category,
      status: data.status,
      message: data.message ?? null,
      details: data.details ?? null,
      validated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}
