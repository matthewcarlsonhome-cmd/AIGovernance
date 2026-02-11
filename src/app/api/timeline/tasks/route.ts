import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, TimelineTask } from '@/types';

const createTaskSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Task title is required').max(500),
  phase: z.string().min(1, 'Phase is required').max(255),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  duration_days: z.number().int().min(1, 'Duration must be at least 1 day'),
  assigned_to: z.string().max(255).optional().nullable(),
  status: z.enum(['not_started', 'in_progress', 'blocked', 'complete']).optional().default('not_started'),
});

const DEMO_TASKS: TimelineTask[] = [
  {
    id: 'task-demo-001',
    project_id: 'proj-demo-001',
    title: 'Complete Discovery Questionnaire',
    description: 'Gather initial responses from all stakeholders via the assessment wizard.',
    phase: 'Discovery',
    start_date: '2025-07-01',
    end_date: '2025-07-14',
    duration_days: 10,
    assigned_to: 'Alice Johnson',
    status: 'complete',
    dependencies: [],
    progress_percent: 100,
    is_milestone: false,
    is_critical_path: true,
    gate_review_id: null,
    color: '#3b82f6',
  },
  {
    id: 'task-demo-002',
    project_id: 'proj-demo-001',
    title: 'Draft Acceptable Use Policy',
    description: 'Create initial AUP document for AI coding assistant usage.',
    phase: 'Governance',
    start_date: '2025-07-15',
    end_date: '2025-07-25',
    duration_days: 9,
    assigned_to: 'Bob Smith',
    status: 'in_progress',
    dependencies: [{ task_id: 'task-demo-001', type: 'FS' }],
    progress_percent: 60,
    is_milestone: false,
    is_critical_path: true,
    gate_review_id: null,
    color: '#8b5cf6',
  },
  {
    id: 'task-demo-003',
    project_id: 'proj-demo-001',
    title: 'Configure Sandbox Environment',
    description: 'Provision cloud sandbox with network isolation and DLP rules.',
    phase: 'Sandbox',
    start_date: '2025-07-28',
    end_date: '2025-08-08',
    duration_days: 10,
    assigned_to: 'Carol Lee',
    status: 'not_started',
    dependencies: [{ task_id: 'task-demo-002', type: 'FS' }],
    progress_percent: 0,
    is_milestone: false,
    is_critical_path: true,
    gate_review_id: null,
    color: '#10b981',
  },
  {
    id: 'task-demo-004',
    project_id: 'proj-demo-001',
    title: 'Gate 1 Review',
    description: 'Formal review to approve sandbox readiness before pilot.',
    phase: 'Governance',
    start_date: '2025-08-11',
    end_date: '2025-08-11',
    duration_days: 1,
    assigned_to: null,
    status: 'not_started',
    dependencies: [{ task_id: 'task-demo-003', type: 'FS' }],
    progress_percent: 0,
    is_milestone: true,
    is_critical_path: true,
    gate_review_id: 'gate-demo-001',
    color: '#f59e0b',
  },
  {
    id: 'task-demo-005',
    project_id: 'proj-demo-001',
    title: 'Execute Pilot Sprint 1',
    description: 'First two-week sprint with AI coding assistants on selected project.',
    phase: 'Pilot',
    start_date: '2025-08-12',
    end_date: '2025-08-25',
    duration_days: 10,
    assigned_to: 'David Park',
    status: 'not_started',
    dependencies: [{ task_id: 'task-demo-004', type: 'FS' }],
    progress_percent: 0,
    is_milestone: false,
    is_critical_path: true,
    gate_review_id: null,
    color: '#ef4444',
  },
];

/**
 * GET /api/timeline/tasks
 * List timeline tasks for a project. Requires ?projectId= query parameter.
 * Returns demo data when Supabase is not configured.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TimelineTask[]>>> {
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
      const filtered = DEMO_TASKS.filter((t) => t.project_id === projectId || projectId === 'proj-demo-001');
      return NextResponse.json({ data: filtered });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('workflow_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch timeline tasks', message: error.message },
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
 * POST /api/timeline/tasks
 * Create a new timeline task for a project.
 * Requires authentication when Supabase is configured.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TimelineTask>>> {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return a fabricated task
    if (!isServerSupabaseConfigured()) {
      const demoTask: TimelineTask = {
        id: `task-demo-${Date.now()}`,
        project_id: parsed.data.project_id,
        title: parsed.data.title,
        description: null,
        phase: parsed.data.phase,
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
        duration_days: parsed.data.duration_days,
        assigned_to: parsed.data.assigned_to ?? null,
        status: parsed.data.status ?? 'not_started',
        dependencies: [],
        progress_percent: 0,
        is_milestone: false,
        is_critical_path: false,
        gate_review_id: null,
        color: null,
      };
      return NextResponse.json({ data: demoTask }, { status: 201 });
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
    const { data: task, error } = await supabase
      .from('workflow_tasks')
      .insert({
        project_id: parsed.data.project_id,
        title: parsed.data.title,
        phase: parsed.data.phase,
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
        duration_days: parsed.data.duration_days,
        assigned_to: parsed.data.assigned_to ?? null,
        status: parsed.data.status ?? 'not_started',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create task', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
