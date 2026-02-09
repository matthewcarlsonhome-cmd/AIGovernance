'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  PocProject,
  PocSprint,
  PocMetric,
  ToolEvaluation,
  ApiResponse,
} from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const pocKeys = {
  all: ['poc'] as const,
  projects: (projectId: string) =>
    [...pocKeys.all, 'projects', projectId] as const,
  sprints: (pocProjectId: string) =>
    [...pocKeys.all, 'sprints', pocProjectId] as const,
  metrics: (sprintId: string) =>
    [...pocKeys.all, 'metrics', sprintId] as const,
  toolEvals: (projectId: string) =>
    [...pocKeys.all, 'tool-evaluations', projectId] as const,
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
async function fetchPocProjects(projectId: string): Promise<PocProject[]> {
  const res = await fetch(
    `/api/poc/projects?projectId=${encodeURIComponent(projectId)}`,
  );
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch PoC projects');
  }
  const json: ApiResponse<PocProject[]> = await res.json();
  return json.data ?? [];
}

async function fetchSprints(pocProjectId: string): Promise<PocSprint[]> {
  const res = await fetch(
    `/api/poc/sprints?pocProjectId=${encodeURIComponent(pocProjectId)}`,
  );
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch sprints');
  }
  const json: ApiResponse<PocSprint[]> = await res.json();
  return json.data ?? [];
}

async function fetchMetrics(sprintId: string): Promise<PocMetric[]> {
  const res = await fetch(
    `/api/poc/metrics?sprintId=${encodeURIComponent(sprintId)}`,
  );
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch PoC metrics');
  }
  const json: ApiResponse<PocMetric[]> = await res.json();
  return json.data ?? [];
}

async function fetchToolEvaluations(projectId: string): Promise<ToolEvaluation[]> {
  const res = await fetch(
    `/api/poc/tool-evaluations?projectId=${encodeURIComponent(projectId)}`,
  );
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch tool evaluations');
  }
  const json: ApiResponse<ToolEvaluation[]> = await res.json();
  return json.data ?? [];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all PoC projects linked to a governance project. */
export function usePocProjects(projectId: string) {
  return useQuery({
    queryKey: pocKeys.projects(projectId),
    queryFn: () => fetchPocProjects(projectId),
    enabled: Boolean(projectId),
  });
}

/** Fetch sprints for a specific PoC project. */
export function useSprints(pocProjectId: string) {
  return useQuery({
    queryKey: pocKeys.sprints(pocProjectId),
    queryFn: () => fetchSprints(pocProjectId),
    enabled: Boolean(pocProjectId),
  });
}

/** Fetch metrics for a specific sprint. */
export function usePocMetrics(sprintId: string) {
  return useQuery({
    queryKey: pocKeys.metrics(sprintId),
    queryFn: () => fetchMetrics(sprintId),
    enabled: Boolean(sprintId),
  });
}

/** Fetch tool evaluations (Claude Code vs Codex etc.) for a project. */
export function useToolEvaluations(projectId: string) {
  return useQuery({
    queryKey: pocKeys.toolEvals(projectId),
    queryFn: () => fetchToolEvaluations(projectId),
    enabled: Boolean(projectId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create or update a PoC project. */
export function useSavePocProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<PocProject, 'id' | 'created_at' | 'updated_at'> & { id?: string },
    ) => {
      const isUpdate = Boolean(data.id);
      const url = isUpdate ? `/api/poc/projects/${data.id}` : '/api/poc/projects';
      const res = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save PoC project');
      }
      const json: ApiResponse<PocProject> = await res.json();
      return json.data as PocProject;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pocKeys.projects(variables.project_id),
      });
    },
  });
}

/** Create or update a sprint. */
export function useSaveSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<PocSprint, 'id'> & { id?: string },
    ) => {
      const isUpdate = Boolean(data.id);
      const url = isUpdate ? `/api/poc/sprints/${data.id}` : '/api/poc/sprints';
      const res = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save sprint');
      }
      const json: ApiResponse<PocSprint> = await res.json();
      return json.data as PocSprint;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pocKeys.sprints(variables.poc_project_id),
      });
    },
  });
}

/** Create or update a PoC metric. */
export function useSaveMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<PocMetric, 'id'> & { id?: string },
    ) => {
      const isUpdate = Boolean(data.id);
      const url = isUpdate ? `/api/poc/metrics/${data.id}` : '/api/poc/metrics';
      const res = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save metric');
      }
      const json: ApiResponse<PocMetric> = await res.json();
      return json.data as PocMetric;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pocKeys.metrics(variables.sprint_id),
      });
    },
  });
}
