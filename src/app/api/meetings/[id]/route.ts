import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse, MeetingNote } from '@/types';

const attendeeSchema = z.object({
  user_id: z.string().uuid().optional(),
  name: z.string().min(1),
  role: z.string().optional(),
  email: z.string().email().optional(),
});

const updateMeetingSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  meeting_date: z.string().optional(),
  meeting_type: z
    .enum([
      'discovery',
      'gate_review',
      'executive_briefing',
      'sprint_review',
      'general',
      'kickoff',
      'retrospective',
    ])
    .optional(),
  attendees: z.array(attendeeSchema).min(1).optional(),
  notes: z.string().max(50000).optional().nullable(),
  summary: z.string().max(10000).optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/meetings/[id]
 * Fetch a single meeting by ID including its action items.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<MeetingNote>>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('meeting_notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Meeting not found', message: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * PUT /api/meetings/[id]
 * Update a meeting's details, attendees, notes, or summary.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<MeetingNote>>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateMeetingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.meeting_date !== undefined) updateData.meeting_date = parsed.data.meeting_date;
    if (parsed.data.meeting_type !== undefined) updateData.meeting_type = parsed.data.meeting_type;
    if (parsed.data.attendees !== undefined) updateData.attendees = parsed.data.attendees;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
    if (parsed.data.summary !== undefined) updateData.summary = parsed.data.summary;

    const { data: updated, error } = await supabase
      .from('meeting_notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update meeting', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * DELETE /api/meetings/[id]
 * Delete a meeting and its associated action items.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete associated action items first
    const { error: actionsError } = await supabase
      .from('action_items')
      .delete()
      .eq('meeting_id', id);

    if (actionsError) {
      return NextResponse.json(
        { error: 'Failed to delete action items', message: actionsError.message },
        { status: 500 },
      );
    }

    // Delete the meeting
    const { error } = await supabase
      .from('meeting_notes')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete meeting', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
