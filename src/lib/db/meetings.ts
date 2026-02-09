import { createServerSupabaseClient } from '@/lib/supabase/server';
import type {
  MeetingNote,
  MeetingType,
  MeetingAttendee,
  ActionItem,
  ActionItemStatus,
  ActionItemPriority,
} from '@/types';

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

/**
 * Fetch all meetings for a project, ordered by meeting date (newest first).
 */
export async function getMeetings(projectId: string): Promise<MeetingNote[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('meeting_notes')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('meeting_date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch a single meeting by ID.
 */
export async function getMeeting(id: string): Promise<MeetingNote> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('meeting_notes')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new meeting record.
 */
export async function saveMeeting(
  data: Pick<MeetingNote, 'project_id' | 'title' | 'meeting_date' | 'meeting_type' | 'attendees'> &
    Partial<Pick<MeetingNote, 'notes' | 'summary' | 'created_by'>>
): Promise<MeetingNote> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: created, error } = await supabase
    .from('meeting_notes')
    .insert({
      project_id: data.project_id,
      title: data.title,
      meeting_date: data.meeting_date,
      meeting_type: data.meeting_type,
      attendees: data.attendees,
      notes: data.notes ?? null,
      summary: data.summary ?? null,
      created_by: data.created_by ?? user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Update an existing meeting. Only the provided fields are modified.
 */
export async function updateMeeting(
  id: string,
  data: Partial<
    Pick<
      MeetingNote,
      'title' | 'meeting_date' | 'meeting_type' | 'attendees' | 'notes' | 'summary'
    >
  >
): Promise<MeetingNote> {
  const supabase = await createServerSupabaseClient();
  const { data: updated, error } = await supabase
    .from('meeting_notes')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Soft-delete a meeting and its associated action items.
 */
export async function deleteMeeting(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  // Soft-delete associated action items first.
  const { error: actionErr } = await supabase
    .from('action_items')
    .update({ deleted_at: now, updated_at: now })
    .eq('meeting_id', id)
    .is('deleted_at', null);

  if (actionErr) throw actionErr;

  // Soft-delete the meeting itself.
  const { error } = await supabase
    .from('meeting_notes')
    .update({ deleted_at: now, updated_at: now })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Action Items
// ---------------------------------------------------------------------------

/**
 * Fetch action items for a project, optionally scoped to a specific meeting.
 * Items are ordered by priority (urgent first) then due date.
 */
export async function getActionItems(
  projectId: string,
  meetingId?: string
): Promise<ActionItem[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('action_items')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('priority', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false });

  if (meetingId) {
    query = query.eq('meeting_id', meetingId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Create a new action item linked to a meeting and project.
 */
export async function saveActionItem(
  data: Pick<ActionItem, 'meeting_id' | 'project_id' | 'title'> &
    Partial<
      Pick<
        ActionItem,
        | 'description'
        | 'assigned_to'
        | 'assigned_to_name'
        | 'status'
        | 'priority'
        | 'due_date'
        | 'linked_task_id'
      >
    >
): Promise<ActionItem> {
  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from('action_items')
    .insert({
      meeting_id: data.meeting_id,
      project_id: data.project_id,
      title: data.title,
      description: data.description ?? null,
      assigned_to: data.assigned_to ?? null,
      assigned_to_name: data.assigned_to_name ?? null,
      status: data.status ?? 'open',
      priority: data.priority ?? 'medium',
      due_date: data.due_date ?? null,
      linked_task_id: data.linked_task_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Update an existing action item. Automatically sets `completed_at` when
 * the status transitions to 'complete'.
 */
export async function updateActionItem(
  id: string,
  data: Partial<
    Pick<
      ActionItem,
      | 'title'
      | 'description'
      | 'assigned_to'
      | 'assigned_to_name'
      | 'status'
      | 'priority'
      | 'due_date'
      | 'linked_task_id'
    >
  >
): Promise<ActionItem> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  const updatePayload: Record<string, unknown> = {
    ...data,
    updated_at: now,
  };

  // Auto-set completed_at when marking complete; clear it otherwise.
  if (data.status === 'complete') {
    updatePayload.completed_at = now;
  } else if (data.status) {
    updatePayload.completed_at = null;
  }

  const { data: updated, error } = await supabase
    .from('action_items')
    .update(updatePayload)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) throw error;
  return updated;
}
