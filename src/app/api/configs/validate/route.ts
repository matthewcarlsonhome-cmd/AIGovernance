import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { runValidation } from '@/lib/sandbox-validation/engine';
import type { SandboxConfig, ConfigFile } from '@/types';

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

/**
 * GET /api/configs/validate?projectId=...
 *
 * Runs the sandbox validation engine against a project's configuration.
 * Loads the sandbox_config and config_files from the database, runs all
 * validation checks, optionally persists results, and returns the full
 * validation run result.
 *
 * When Supabase is not configured, generates validation results from
 * demo/default data so the UI is functional for demos.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      projectId: searchParams.get('projectId'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { projectId } = parsed.data;

    // If Supabase is configured, load real data from the database
    if (isServerSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Load sandbox config for this project
      const { data: sandboxConfig } = await supabase
        .from('sandbox_configs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Load config files if a sandbox config exists
      let configFiles: ConfigFile[] = [];
      if (sandboxConfig) {
        const { data: files } = await supabase
          .from('config_files')
          .select('*')
          .eq('sandbox_config_id', sandboxConfig.id);

        configFiles = (files ?? []) as ConfigFile[];
      }

      // Run validation
      const result = runValidation(
        projectId,
        sandboxConfig as SandboxConfig | null,
        configFiles,
      );

      // Persist validation results to environment_validations table
      try {
        const validationRecords = result.checks.map((check) => ({
          project_id: projectId,
          check_name: check.name,
          check_category: check.category,
          status: check.status === 'passed' ? 'pass' : check.status === 'warning' ? 'warning' : 'fail',
          message: check.recommendation ?? null,
          details: { items: check.details },
          validated_at: result.validatedAt,
        }));

        await supabase
          .from('environment_validations')
          .insert(validationRecords);
      } catch {
        // Non-fatal: log but don't fail the validation
        console.warn('Failed to persist validation results - table may not exist yet');
      }

      return NextResponse.json({ data: result });
    }

    // Demo mode: run validation with no config (all checks will report "not configured")
    // This shows the user what the validation engine checks for
    const result = runValidation(projectId, null, []);

    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * POST /api/configs/validate
 *
 * Run validation with inline configuration data (no database required).
 * Used when the user wants to validate config before saving to database,
 * or for testing purposes.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const body = await request.json();

    const postSchema = z.object({
      projectId: z.string(),
      config: z.object({
        cloud_provider: z.string(),
        sandbox_model: z.string(),
        vpc_cidr: z.string().nullable().optional(),
        region: z.string().nullable().optional(),
        ai_provider: z.string().nullable().optional(),
        settings: z.record(z.string(), z.unknown()).default({}),
      }).nullable().optional(),
      configFiles: z.array(z.object({
        filename: z.string(),
        content: z.string(),
        file_type: z.string().optional(),
      })).default([]),
    });

    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { projectId, config, configFiles } = parsed.data;

    // Build SandboxConfig-shaped object
    const sandboxConfig = config
      ? {
          id: 'inline',
          project_id: projectId,
          cloud_provider: config.cloud_provider as SandboxConfig['cloud_provider'],
          sandbox_model: config.sandbox_model as SandboxConfig['sandbox_model'],
          vpc_cidr: config.vpc_cidr ?? null,
          region: config.region ?? null,
          ai_provider: config.ai_provider ?? null,
          settings: config.settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } satisfies SandboxConfig
      : null;

    // Build ConfigFile-shaped objects
    const typedFiles: ConfigFile[] = configFiles.map((f, i) => ({
      id: `inline-${i}`,
      sandbox_config_id: 'inline',
      filename: f.filename,
      file_type: (f.file_type ?? 'json') as ConfigFile['file_type'],
      content: f.content,
      description: '',
      created_at: new Date().toISOString(),
    }));

    const result = runValidation(projectId, sandboxConfig, typedFiles);

    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
