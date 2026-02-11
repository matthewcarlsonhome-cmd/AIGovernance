import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, TimelineMilestone } from '@/types';

const createMilestoneSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Milestone title is required').max(500),
  target_date: z.string().min(1, 'Target date is required'),
  status: z
    .enum(['pending', 'completed', 'missed', 'at_risk'])
    .optional()
    .default('pending'),
});

const DEMO_MILESTONES: TimelineMilestone[] = [
  {
    id: 'ms-demo-001',
    project_id: 'proj-demo-001',
    title: 'Discovery Phase Complete',
    description: 'All stakeholder assessments gathered and feasibility score calculated.',
    date: '2025-07-14',
    status: 'completed',
    gate_number: null,
  },
  {
    id: 'ms-demo-002',
    project_id: 'proj-demo-001',
    title: 'Gate 1 - Sandbox Readiness',
    description: 'Formal approval to proceed with sandbox environment provisioning.',
    date: '2025-08-01',
    status: 'at_risk',
    gate_number: 1,
  },
  {
    id: 'ms-demo-003',
    project_id: 'proj-demo-001',
    title: 'Pilot Kickoff',
    description: 'Begin first pilot sprint with engineering team using AI coding tools.',
    date: '2025-08-15',
    status: 'pending',
    gate_number: null,
  },
  {
    id: 'ms-demo-004',
    project_id: 'proj-demo-001',
    title: 'Gate 2 - Pilot Evaluation',
    description: 'Review pilot metrics and decide on broader rollout scope.',
    date: '2025-09-15',
    status: 'pending',
    gate_number: 2,
  },
  {
    id: 'ms-demo-005',
    project_id: 'proj-demo-001',
    title: 'Gate 3 - Production Approval',
    description: 'Final gate review for full production deployment authorization.',
    date: '2025-10-15',
    status: 'pending',
    gate_number: 3,
  },
];

/**
 * GET /api/timeline/milestones
 * List milestones for a project. Requires ?projectId= query parameter.
 * Returns demo data when Supabase is not configured.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TimelineMilestone[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'projectId query parameter is required' },
        { status: 400 },
      );
    }

    // Return demo data when Supabase is not configured
    if (!isServerSupabaseConfigured()) {
      const filtered = DEMO_MILESTONES.filter(
        (m) => m.project_id === projectId || projectId === 'proj-demo-001',
      );
      return NextResponse.json({ data: filtered });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('timeline_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch milestones', message: error.message },
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
 * POST /api/timeline/milestones
 * Create a new milestone for a project.
 * Requires authentication when Supabase is configured.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TimelineMilestone>>> {
  try {
    const body = await request.json();
    const parsed = createMilestoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return a fabricated milestone
    if (!isServerSupabaseConfigured()) {
      const demoMilestone: TimelineMilestone = {
        id: `ms-demo-${Date.now()}`,
        project_id: parsed.data.project_id,
        title: parsed.data.title,
        description: null,
        date: parsed.data.target_date,
        status: parsed.data.status ?? 'pending',
        gate_number: null,
      };
      return NextResponse.json({ data: demoMilestone }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', parsed.data.project_id)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', message: 'The specified project does not exist or has been deleted' },
        { status: 404 },
      );
    }

    const now = new Date().toISOString();
    const { data: milestone, error } = await supabase
      .from('timeline_milestones')
      .insert({
        project_id: parsed.data.project_id,
        title: parsed.data.title,
        date: parsed.data.target_date,
        status: parsed.data.status ?? 'pending',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create milestone', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: milestone }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
