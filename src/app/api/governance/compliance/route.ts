import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, ComplianceMapping } from '@/types';

const createComplianceMappingSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  framework: z.string().min(1, 'Framework is required'),
  control_id: z.string().min(1, 'Control ID is required'),
  control_name: z.string().min(1, 'Control name is required'),
  status: z.enum(['not_started', 'in_progress', 'implemented', 'verified', 'not_applicable']).default('not_started'),
  notes: z.string().optional(),
});

/**
 * GET /api/governance/compliance
 * Fetch compliance mappings for a project. Requires ?projectId= query parameter.
 * Supports optional ?framework= filter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ComplianceMapping[]>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: [] });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const framework = searchParams.get('framework');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'projectId query parameter is required' },
        { status: 400 },
      );
    }

    let query = supabase
      .from('compliance_mappings')
      .select('*')
      .eq('project_id', projectId);

    if (framework) {
      query = query.eq('framework', framework);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch compliance mappings', message: error.message },
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
 * POST /api/governance/compliance
 * Create a new compliance mapping for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ComplianceMapping>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `compliance-${Date.now()}`,
          project_id: body.project_id ?? '',
          framework: body.framework ?? '',
          control_id: body.control_id ?? '',
          control_name: body.control_name ?? '',
          description: '',
          status: body.status ?? 'not_started',
          evidence: null,
          notes: body.notes ?? null,
          created_at: now,
          updated_at: now,
        },
      }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createComplianceMappingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: parsed.error.flatten().fieldErrors.toString() },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: mapping, error } = await supabase
      .from('compliance_mappings')
      .insert({
        project_id: parsed.data.project_id,
        framework: parsed.data.framework,
        control_id: parsed.data.control_id,
        control_name: parsed.data.control_name,
        status: parsed.data.status,
        notes: parsed.data.notes ?? null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create compliance mapping', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: mapping }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
