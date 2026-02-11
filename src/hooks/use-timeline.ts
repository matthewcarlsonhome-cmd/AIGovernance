'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TimelineTask,
  TimelineMilestone,
  TimelineSnapshot,
  ApiResponse,
} from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const timelineKeys = {
  all: ['timeline'] as const,
  tasks: (projectId: string) =>
    [...timelineKeys.all, 'tasks', projectId] as const,
  milestones: (projectId: string) =>
    [...timelineKeys.all, 'milestones', projectId] as const,
  snapshots: (projectId: string) =>
    [...timelineKeys.all, 'snapshots', projectId] as const,
};

// ---------------------------------------------------------------------------
// Fetchers — gracefully return empty data on any error
// ---------------------------------------------------------------------------
async function fetchTasks(projectId: string): Promise<TimelineTask[]> {
  try {
    const res = await fetch(
      `/api/timeline/tasks?projectId=${encodeURIComponent(projectId)}`,
    );
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<TimelineTask[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchMilestones(projectId: string): Promise<TimelineMilestone[]> {
  try {
    const res = await fetch(
      `/api/timeline/milestones?projectId=${encodeURIComponent(projectId)}`,
    );
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<TimelineMilestone[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchSnapshots(projectId: string): Promise<TimelineSnapshot[]> {
  try {
    const res = await fetch(
      `/api/timeline/snapshots?projectId=${encodeURIComponent(projectId)}`,
    );
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<TimelineSnapshot[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all timeline tasks for a project. */
export function useTimelineTasks(projectId: string) {
  return useQuery({
    queryKey: timelineKeys.tasks(projectId),
    queryFn: () => fetchTasks(projectId),
    enabled: Boolean(projectId),
  });
}

/** Fetch all milestones for a project. */
export function useMilestones(projectId: string) {
  return useQuery({
    queryKey: timelineKeys.milestones(projectId),
    queryFn: () => fetchMilestones(projectId),
    enabled: Boolean(projectId),
  });
}

/** Fetch all schedule snapshots for a project. */
export function useSnapshots(projectId: string) {
  return useQuery({
    queryKey: timelineKeys.snapshots(projectId),
    queryFn: () => fetchSnapshots(projectId),
    enabled: Boolean(projectId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new timeline task. */
export function useSaveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<TimelineTask, 'id'> & { id?: string },
    ) => {
      const isUpdate = Boolean(data.id);
      const url = isUpdate ? `/api/timeline/tasks/${data.id}` : '/api/timeline/tasks';
      const res = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save task');
      }
      const json: ApiResponse<TimelineTask> = await res.json();
      return json.data as TimelineTask;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: timelineKeys.tasks(variables.project_id),
      });
    },
  });
}

/** Update an existing timeline task (e.g. drag-drop date change). */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      ...data
    }: Partial<TimelineTask> & { id: string; projectId: string }) => {
      const res = await fetch(`/api/timeline/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update task');
      }
      const json: ApiResponse<TimelineTask> = await res.json();
      return json.data as TimelineTask;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: timelineKeys.tasks(variables.projectId),
      });
    },
  });
}

/** Delete a timeline task. */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const res = await fetch(`/api/timeline/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete task');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: timelineKeys.tasks(variables.projectId),
      });
    },
  });
}

/** Create or update a milestone. */
export function useSaveMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<TimelineMilestone, 'id'> & { id?: string },
    ) => {
      const isUpdate = Boolean(data.id);
      const url = isUpdate
        ? `/api/timeline/milestones/${data.id}`
        : '/api/timeline/milestones';
      const res = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save milestone');
      }
      const json: ApiResponse<TimelineMilestone> = await res.json();
      return json.data as TimelineMilestone;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: timelineKeys.milestones(variables.project_id),
      });
    },
  });
}

/** Capture a point-in-time schedule snapshot. */
export function useSaveSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<TimelineSnapshot, 'id' | 'captured_at'> & { id?: string },
    ) => {
      const res = await fetch('/api/timeline/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save snapshot');
      }
      const json: ApiResponse<TimelineSnapshot> = await res.json();
      return json.data as TimelineSnapshot;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: timelineKeys.snapshots(variables.project_id),
      });
    },
  });
}
