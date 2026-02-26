'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import type { Project, ProjectStatus, ApiResponse } from '@/types';

/**
 * Input for creating a new project.
 * Only `name` and `description` are required; all other fields are optional.
 */
export interface CreateProjectInput {
  name: string;
  description: string;
  organization_id?: string;
  status?: ProjectStatus;
  start_date?: string | null;
  target_end_date?: string | null;
}

/**
 * Input for updating an existing project.
 * Requires `id`; all other fields are optional partial updates.
 */
export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  feasibility_score?: number;
  start_date?: string | null;
  target_end_date?: string | null;
  actual_end_date?: string | null;
}

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects');
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch projects');
  }
  const json: ApiResponse<Project[]> = await res.json();
  return json.data ?? [];
}

async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch project');
  }
  const json: ApiResponse<Project> = await res.json();
  if (!json.data) throw new Error('Project not found');
  return json.data;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all projects visible to the current user. */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: fetchProjects,
  });
}

/** Fetch a single project by id. */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new project. */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create project');
      }
      const json: ApiResponse<Project> = await res.json();
      return json.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/** Update an existing project. */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateProjectInput) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update project');
      }
      const json: ApiResponse<Project> = await res.json();
      return json.data as Project;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/** Soft-delete a project. */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete project');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Real-time enabled queries
// ---------------------------------------------------------------------------

/**
 * Fetch all projects with real-time auto-refresh.
 *
 * Subscribes to INSERT, UPDATE, and DELETE events on the `projects` table.
 * When another user creates, edits, or deletes a project the project list
 * is automatically re-fetched via TanStack Query cache invalidation.
 *
 * Falls back to standard polling when Supabase is not configured (demo mode).
 */
export function useProjectsRealtime() {
  const query = useProjects();

  const queryKeysToInvalidate = useMemo(
    () => [projectKeys.lists()],
    [],
  );

  const { isConnected } = useRealtimeSubscription({
    table: 'projects',
    queryKeysToInvalidate,
  });

  return { ...query, isRealtimeConnected: isConnected };
}

/**
 * Fetch a single project with real-time auto-refresh.
 *
 * Subscribes to changes on the `projects` table filtered by the project ID.
 * When another user edits this project the data is automatically refetched.
 */
export function useProjectRealtime(id: string) {
  const query = useProject(id);

  const queryKeysToInvalidate = useMemo(
    () => [projectKeys.detail(id), projectKeys.lists()],
    [id],
  );

  const { isConnected } = useRealtimeSubscription({
    table: 'projects',
    filter: `id=eq.${id}`,
    queryKeysToInvalidate,
    enabled: Boolean(id),
  });

  return { ...query, isRealtimeConnected: isConnected };
}
