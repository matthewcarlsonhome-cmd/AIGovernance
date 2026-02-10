'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MeetingNote, ActionItem, ApiResponse } from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const meetingKeys = {
  all: ['meetings'] as const,
  lists: (projectId: string) =>
    [...meetingKeys.all, 'list', projectId] as const,
  detail: (id: string) => [...meetingKeys.all, 'detail', id] as const,
  actionItems: (projectId: string, meetingId?: string) =>
    [...meetingKeys.all, 'action-items', projectId, meetingId ?? 'all'] as const,
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
async function fetchMeetings(projectId: string): Promise<MeetingNote[]> {
  const res = await fetch(
    `/api/meetings?projectId=${encodeURIComponent(projectId)}`,
  );
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch meetings');
  }
  const json: ApiResponse<MeetingNote[]> = await res.json();
  return json.data ?? [];
}

async function fetchMeeting(id: string): Promise<MeetingNote> {
  const res = await fetch(`/api/meetings/${id}`);
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch meeting');
  }
  const json: ApiResponse<MeetingNote> = await res.json();
  if (!json.data) throw new Error('Meeting not found');
  return json.data;
}

async function fetchActionItems(
  projectId: string,
  meetingId?: string,
): Promise<ActionItem[]> {
  const params = new URLSearchParams({ projectId });
  if (meetingId) params.set('meetingId', meetingId);

  const res = await fetch(`/api/meetings/action-items?${params.toString()}`);
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch action items');
  }
  const json: ApiResponse<ActionItem[]> = await res.json();
  return json.data ?? [];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all meetings for a project. */
export function useMeetings(projectId: string) {
  return useQuery({
    queryKey: meetingKeys.lists(projectId),
    queryFn: () => fetchMeetings(projectId),
    enabled: Boolean(projectId),
  });
}

/** Fetch a single meeting by id. */
export function useMeeting(id: string) {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: () => fetchMeeting(id),
    enabled: Boolean(id),
  });
}

/** Fetch action items, optionally scoped to a specific meeting. */
export function useActionItems(projectId: string, meetingId?: string) {
  return useQuery({
    queryKey: meetingKeys.actionItems(projectId, meetingId),
    queryFn: () => fetchActionItems(projectId, meetingId),
    enabled: Boolean(projectId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new meeting. */
export function useSaveMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<MeetingNote, 'id' | 'created_at' | 'updated_at'>,
    ) => {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save meeting');
      }
      const json: ApiResponse<MeetingNote> = await res.json();
      return json.data as MeetingNote;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: meetingKeys.lists(variables.project_id),
      });
    },
  });
}

/** Update an existing meeting. */
export function useUpdateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<MeetingNote> & { id: string; project_id: string }) => {
      const res = await fetch(`/api/meetings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update meeting');
      }
      const json: ApiResponse<MeetingNote> = await res.json();
      return json.data as MeetingNote;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: meetingKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: meetingKeys.lists(variables.project_id),
      });
    },
  });
}

/** Delete a meeting. */
export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const res = await fetch(`/api/meetings/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete meeting');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: meetingKeys.lists(variables.projectId),
      });
    },
  });
}

/** Create a new action item. */
export function useSaveActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<ActionItem, 'id' | 'created_at' | 'updated_at'>,
    ) => {
      const res = await fetch('/api/meetings/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save action item');
      }
      const json: ApiResponse<ActionItem> = await res.json();
      return json.data as ActionItem;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: meetingKeys.actionItems(variables.project_id, variables.meeting_id),
      });
      queryClient.invalidateQueries({
        queryKey: meetingKeys.actionItems(variables.project_id),
      });
    },
  });
}

/** Update an existing action item (e.g. status change, reassignment). */
export function useUpdateActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<ActionItem> & { id: string; project_id: string; meeting_id: string }) => {
      const res = await fetch(`/api/meetings/action-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update action item');
      }
      const json: ApiResponse<ActionItem> = await res.json();
      return json.data as ActionItem;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: meetingKeys.actionItems(variables.project_id, variables.meeting_id),
      });
      queryClient.invalidateQueries({
        queryKey: meetingKeys.actionItems(variables.project_id),
      });
    },
  });
}
