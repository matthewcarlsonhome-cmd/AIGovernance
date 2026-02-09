import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse, MeetingNote } from '@/types';

const attendeeSchema = z.object({
  user_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Attendee name is required'),
  role: z.string().optional(),
  email: z.string().email().optional(),
});

const createMeetingSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Meeting title is required').max(255),
  meeting_date: z.string().min(1, 'Meeting date is required'),
  meeting_type: z.enum([
    'discovery',
    'gate_review',
    'executive_briefing',
    'sprint_review',
    'general',
    'kickoff',
    'retrospective',
  ]),
  attendees: z.array(attendeeSchema).min(1, 'At least one attendee is required'),
  notes: z.string().max(50000).optional(),
  summary: z.string().max(10000).optional(),
});

/**
 * GET /api/meetings
 * List meetings for a project. Requires ?project_id= query parameter.
 * Supports ?meeting_type= and ?limit= for filtering.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<MeetingNote[]>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const meetingType = searchParams.get('meeting_type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'project_id query parameter is required' },
        { status: 400 },
      );
    }

    let query = supabase
      .from('meeting_notes')
      .select('*')
      .eq('project_id', projectId)
      .order('meeting_date', { ascending: false })
      .limit(limit);

    if (meetingType) {
      query = query.eq('meeting_type', meetingType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch meetings', message: error.message },
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
 * POST /api/meetings
 * Create a new meeting note for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<MeetingNote>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createMeetingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
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
    const { data: meeting, error } = await supabase
      .from('meeting_notes')
      .insert({
        project_id: parsed.data.project_id,
        title: parsed.data.title,
        meeting_date: parsed.data.meeting_date,
        meeting_type: parsed.data.meeting_type,
        attendees: parsed.data.attendees,
        notes: parsed.data.notes ?? null,
        summary: parsed.data.summary ?? null,
        created_by: user.id,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create meeting', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: meeting }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
