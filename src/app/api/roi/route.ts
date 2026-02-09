import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateRoi, calculateSensitivity } from '@/lib/scoring/roi-calculator';
import type { ApiResponse, RoiCalculation } from '@/types';

const roiInputsSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  inputs: z.object({
    team_size: z.number().int().min(1, 'Team size must be at least 1').max(10000),
    avg_salary: z.number().min(0, 'Average salary must be non-negative'),
    current_velocity: z.number().min(0, 'Current velocity must be non-negative'),
    projected_velocity_lift: z.number().min(0).max(200, 'Velocity lift must be between 0 and 200'),
    license_cost_per_user: z.number().min(0, 'License cost must be non-negative'),
    implementation_cost: z.number().min(0, 'Implementation cost must be non-negative'),
    training_cost: z.number().min(0, 'Training cost must be non-negative'),
  }),
});

/**
 * GET /api/roi
 * Fetch the most recent ROI calculation for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<RoiCalculation | null>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'project_id query parameter is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('roi_calculations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch ROI calculation', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * POST /api/roi
 * Calculate and save ROI for a project.
 * Uses the roi-calculator engine to compute results and sensitivity analysis.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<RoiCalculation>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = roiInputsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const { project_id, inputs } = parsed.data;

    // Verify the project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', message: 'The specified project does not exist or has been deleted' },
        { status: 404 },
      );
    }

    // Run the ROI calculation engine
    const results = calculateRoi(inputs);

    // Run sensitivity analysis across different velocity lift scenarios
    const sensitivityData = calculateSensitivity(inputs);

    // Save the calculation to the database
    const now = new Date().toISOString();
    const { data: calculation, error: insertError } = await supabase
      .from('roi_calculations')
      .insert({
        project_id,
        inputs,
        results,
        sensitivity_data: sensitivityData,
        calculated_by: user.id,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save ROI calculation', message: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: calculation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
