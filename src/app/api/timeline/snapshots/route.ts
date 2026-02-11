import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, TimelineSnapshot } from '@/types';

const createSnapshotSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  name: z.string().min(1, 'Snapshot name is required').max(255),
  description: z.string().max(2000).optional().nullable(),
});

const DEMO_SNAPSHOTS: TimelineSnapshot[] = [
  {
    id: 'snap-demo-001',
    project_id: 'proj-demo-001',
    name: 'Initial Baseline',
    description: 'Original project schedule established at kickoff meeting.',
    snapshot_data: {
      total_tasks: 12,
      completed_tasks: 0,
      projected_end_date: '2025-10-15',
      critical_path_length_days: 75,
      milestones: [
        { title: 'Discovery Complete', date: '2025-07-14' },
        { title: 'Gate 1 Review', date: '2025-08-01' },
        { title: 'Pilot Kickoff', date: '2025-08-15' },
        { title: 'Gate 3 Approval', date: '2025-10-15' },
      ],
    },
    captured_at: '2025-06-30T10:00:00Z',
    captured_by: 'Alice Johnson',
  },
  {
    id: 'snap-demo-002',
    project_id: 'proj-demo-001',
    name: 'Post-Discovery Update',
    description: 'Schedule revised after completing discovery questionnaire analysis.',
    snapshot_data: {
      total_tasks: 14,
      completed_tasks: 3,
      projected_end_date: '2025-10-22',
      critical_path_length_days: 80,
      milestones: [
        { title: 'Discovery Complete', date: '2025-07-14', status: 'completed' },
        { title: 'Gate 1 Review', date: '2025-08-11' },
        { title: 'Pilot Kickoff', date: '2025-08-18' },
        { title: 'Gate 3 Approval', date: '2025-10-22' },
      ],
      variance_days: 7,
    },
    captured_at: '2025-07-15T14:30:00Z',
    captured_by: 'Bob Smith',
  },
  {
    id: 'snap-demo-003',
    project_id: 'proj-demo-001',
    name: 'Mid-Governance Checkpoint',
    description: 'Snapshot taken during governance policy drafting for variance tracking.',
    snapshot_data: {
      total_tasks: 14,
      completed_tasks: 5,
      projected_end_date: '2025-10-20',
      critical_path_length_days: 78,
      milestones: [
        { title: 'Discovery Complete', date: '2025-07-14', status: 'completed' },
        { title: 'Gate 1 Review', date: '2025-08-08' },
        { title: 'Pilot Kickoff', date: '2025-08-15' },
        { title: 'Gate 3 Approval', date: '2025-10-20' },
      ],
      variance_days: 5,
    },
    captured_at: '2025-07-25T09:15:00Z',
    captured_by: 'Alice Johnson',
  },
];

/**
 * GET /api/timeline/snapshots
 * List timeline snapshots for a project. Requires ?projectId= query parameter.
 * Returns demo data when Supabase is not configured.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TimelineSnapshot[]>>> {
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
      const filtered = DEMO_SNAPSHOTS.filter(
        (s) => s.project_id === projectId || projectId === 'proj-demo-001',
      );
      return NextResponse.json({ data: filtered });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('timeline_snapshots')
      .select('*')
      .eq('project_id', projectId)
      .order('captured_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch snapshots', message: error.message },
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
 * POST /api/timeline/snapshots
 * Create a new timeline snapshot for a project.
 * Captures the current state of all tasks and milestones at this point in time.
 * Requires authentication when Supabase is configured.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TimelineSnapshot>>> {
  try {
    const body = await request.json();
    const parsed = createSnapshotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    // Demo mode: return a fabricated snapshot
    if (!isServerSupabaseConfigured()) {
      const demoSnapshot: TimelineSnapshot = {
        id: `snap-demo-${Date.now()}`,
        project_id: parsed.data.project_id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        snapshot_data: {
          total_tasks: 5,
          completed_tasks: 1,
          projected_end_date: '2025-10-15',
          critical_path_length_days: 75,
          captured_from: 'demo_mode',
        },
        captured_at: now,
        captured_by: 'Demo User',
      };
      return NextResponse.json({ data: demoSnapshot }, { status: 201 });
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

    // Capture current task and milestone state for the snapshot
    const { data: tasks } = await supabase
      .from('workflow_tasks')
      .select('id, title, phase, start_date, end_date, duration_days, status, progress_percent, is_critical_path')
      .eq('project_id', parsed.data.project_id);

    const { data: milestones } = await supabase
      .from('timeline_milestones')
      .select('id, title, date, status, gate_number')
      .eq('project_id', parsed.data.project_id);

    const taskList = tasks ?? [];
    const milestoneList = milestones ?? [];

    const snapshotData = {
      total_tasks: taskList.length,
      completed_tasks: taskList.filter((t: Record<string, unknown>) => t.status === 'complete').length,
      tasks: taskList,
      milestones: milestoneList,
      captured_at: now,
    };

    const { data: snapshot, error } = await supabase
      .from('timeline_snapshots')
      .insert({
        project_id: parsed.data.project_id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        snapshot_data: snapshotData,
        captured_at: now,
        captured_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create snapshot', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: snapshot }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
