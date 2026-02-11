import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { generateAllConfigFiles } from '@/lib/config-gen/generator';
import type { ApiResponse, ConfigFile, SandboxConfig } from '@/types';

const createConfigSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  cloud_provider: z.enum(['aws', 'gcp', 'azure', 'on_premises']),
  sandbox_model: z.enum(['cloud_native', 'codespaces', 'docker', 'hybrid']),
  vpc_cidr: z.string().optional(),
  region: z.string().optional(),
  ai_provider: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).default({}),
});

interface GenerateConfigResult {
  sandbox_config: SandboxConfig;
  config_files: ConfigFile[];
}

/**
 * POST /api/configs
 * Generate sandbox configuration files based on the provided config data.
 * Creates a sandbox_config record and generates all associated config files.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<GenerateConfigResult>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const demoConfigId = `cfg-demo-${Date.now()}`;
      return NextResponse.json({
        data: {
          sandbox_config: {
            id: demoConfigId,
            project_id: body.project_id ?? 'proj-demo-001',
            cloud_provider: body.cloud_provider ?? 'aws',
            sandbox_model: body.sandbox_model ?? 'docker',
            vpc_cidr: body.vpc_cidr ?? null,
            region: body.region ?? null,
            ai_provider: body.ai_provider ?? null,
            settings: body.settings ?? {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as SandboxConfig,
          config_files: [],
        },
      }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Verify the project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', parsed.data.project_id)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', message: 'The specified project does not exist or has been deleted' },
        { status: 404 },
      );
    }

    // Create the sandbox config record
    const { data: sandboxConfig, error: configError } = await supabase
      .from('sandbox_configs')
      .insert({
        project_id: parsed.data.project_id,
        cloud_provider: parsed.data.cloud_provider,
        sandbox_model: parsed.data.sandbox_model,
        vpc_cidr: parsed.data.vpc_cidr ?? null,
        region: parsed.data.region ?? null,
        ai_provider: parsed.data.ai_provider ?? null,
        settings: parsed.data.settings,
      })
      .select()
      .single();

    if (configError) {
      return NextResponse.json(
        { error: 'Failed to create sandbox config', message: configError.message },
        { status: 500 },
      );
    }

    // Generate all config files using the config-gen module
    const typedConfig: SandboxConfig = sandboxConfig;
    const configFiles = generateAllConfigFiles(typedConfig, project.name);

    // Persist generated config files to the database
    const filesToInsert = configFiles.map((file) => ({
      id: file.id,
      sandbox_config_id: file.sandbox_config_id,
      filename: file.filename,
      file_type: file.file_type,
      content: file.content,
      description: file.description,
    }));

    const { data: savedFiles, error: filesError } = await supabase
      .from('config_files')
      .insert(filesToInsert)
      .select();

    if (filesError) {
      return NextResponse.json(
        { error: 'Failed to save config files', message: filesError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: {
          sandbox_config: typedConfig,
          config_files: savedFiles ?? configFiles,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
