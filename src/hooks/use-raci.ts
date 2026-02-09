'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RaciMatrix, RaciEntry, ApiResponse } from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const raciKeys = {
  all: ['raci'] as const,
  matrices: (projectId: string) =>
    [...raciKeys.all, 'matrices', projectId] as const,
  matrix: (id: string) => [...raciKeys.all, 'matrix', id] as const,
  entries: (matrixId: string) =>
    [...raciKeys.all, 'entries', matrixId] as const,
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
async function fetchMatrices(projectId: string): Promise<RaciMatrix[]> {
  const res = await fetch(
    `/api/raci?projectId=${encodeURIComponent(projectId)}`,
  );
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch RACI matrices');
  }
  const json: ApiResponse<RaciMatrix[]> = await res.json();
  return json.data ?? [];
}

async function fetchMatrix(id: string): Promise<RaciMatrix> {
  const res = await fetch(`/api/raci/${id}`);
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch RACI matrix');
  }
  const json: ApiResponse<RaciMatrix> = await res.json();
  if (!json.data) throw new Error('RACI matrix not found');
  return json.data;
}

async function fetchEntries(matrixId: string): Promise<RaciEntry[]> {
  const res = await fetch(
    `/api/raci/entries?matrixId=${encodeURIComponent(matrixId)}`,
  );
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch RACI entries');
  }
  const json: ApiResponse<RaciEntry[]> = await res.json();
  return json.data ?? [];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all RACI matrices for a project. */
export function useRaciMatrices(projectId: string) {
  return useQuery({
    queryKey: raciKeys.matrices(projectId),
    queryFn: () => fetchMatrices(projectId),
    enabled: Boolean(projectId),
  });
}

/** Fetch a single RACI matrix by id. */
export function useRaciMatrix(id: string) {
  return useQuery({
    queryKey: raciKeys.matrix(id),
    queryFn: () => fetchMatrix(id),
    enabled: Boolean(id),
  });
}

/** Fetch all entries for a specific RACI matrix. */
export function useRaciEntries(matrixId: string) {
  return useQuery({
    queryKey: raciKeys.entries(matrixId),
    queryFn: () => fetchEntries(matrixId),
    enabled: Boolean(matrixId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new RACI matrix. */
export function useSaveRaciMatrix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<RaciMatrix, 'id' | 'created_at' | 'updated_at'>,
    ) => {
      const res = await fetch('/api/raci', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save RACI matrix');
      }
      const json: ApiResponse<RaciMatrix> = await res.json();
      return json.data as RaciMatrix;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: raciKeys.matrices(variables.project_id),
      });
    },
  });
}

/** Create a new RACI entry. */
export function useSaveRaciEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<RaciEntry, 'id' | 'created_at' | 'updated_at'>,
    ) => {
      const res = await fetch('/api/raci/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save RACI entry');
      }
      const json: ApiResponse<RaciEntry> = await res.json();
      return json.data as RaciEntry;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: raciKeys.entries(variables.matrix_id),
      });
    },
  });
}

/** Update an existing RACI entry (e.g. change assignment). */
export function useUpdateRaciEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<RaciEntry> & { id: string; matrix_id: string }) => {
      const res = await fetch(`/api/raci/entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update RACI entry');
      }
      const json: ApiResponse<RaciEntry> = await res.json();
      return json.data as RaciEntry;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: raciKeys.entries(variables.matrix_id),
      });
    },
  });
}

/** Delete a RACI entry. */
export function useDeleteRaciEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, matrixId }: { id: string; matrixId: string }) => {
      const res = await fetch(`/api/raci/entries/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete RACI entry');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: raciKeys.entries(variables.matrixId),
      });
    },
  });
}
