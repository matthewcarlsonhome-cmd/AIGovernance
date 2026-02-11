import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, ConfigFile } from '@/types';

const updateConfigFileSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  description: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/configs/[id]
 * Fetch config files for a given sandbox_config ID.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<ConfigFile[]>>> {
  try {
    const { id } = await context.params;

    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: [] });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('config_files')
      .select('*')
      .eq('sandbox_config_id', id)
      .order('filename', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch config files', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * PUT /api/configs/[id]
 * Update a single config file by its ID.
 * Used when users manually edit generated config files.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<ConfigFile>>> {
  try {
    const { id } = await context.params;

    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      return NextResponse.json({
        data: {
          id,
          sandbox_config_id: 'cfg-demo-001',
          filename: 'config.json',
          file_type: 'json',
          content: body.content ?? '{}',
          description: body.description ?? 'Demo config file',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateConfigFileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {
      content: parsed.data.content,
    };

    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description;
    }

    const { data: updated, error } = await supabase
      .from('config_files')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update config file', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
