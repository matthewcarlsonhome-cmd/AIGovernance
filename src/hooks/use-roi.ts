'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculateRoi, calculateSensitivity } from '@/lib/scoring/roi-calculator';
import type {
  RoiCalculation,
  RoiInputs,
  RoiResults,
  SensitivityRow,
  ApiResponse,
} from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const roiKeys = {
  all: ['roi'] as const,
  calculation: (projectId: string) =>
    [...roiKeys.all, 'calculation', projectId] as const,
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
async function fetchRoiCalculation(projectId: string): Promise<RoiCalculation | null> {
  const res = await fetch(
    `/api/roi?projectId=${encodeURIComponent(projectId)}`,
  );
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch ROI calculation');
  }
  const json: ApiResponse<RoiCalculation> = await res.json();
  return json.data ?? null;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch the most recent ROI calculation for a project. */
export function useRoiCalculation(projectId: string) {
  return useQuery({
    queryKey: roiKeys.calculation(projectId),
    queryFn: () => fetchRoiCalculation(projectId),
    enabled: Boolean(projectId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Persist an ROI calculation to the server. */
export function useSaveRoiCalculation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<RoiCalculation, 'id' | 'created_at' | 'updated_at'>,
    ) => {
      const res = await fetch('/api/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save ROI calculation');
      }
      const json: ApiResponse<RoiCalculation> = await res.json();
      return json.data as RoiCalculation;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: roiKeys.calculation(variables.project_id),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Client-side calculation (pure function, no API call)
// ---------------------------------------------------------------------------

export interface CalculateRoiResult {
  results: RoiResults;
  sensitivity: SensitivityRow[];
}

/**
 * Run the ROI calculation engine entirely client-side.
 * This does NOT persist anything -- call useSaveRoiCalculation() afterwards.
 *
 * Returns a mutation so the caller can track loading/error state in the UI
 * and call `mutate(inputs)` when the user clicks "Calculate".
 */
export function useCalculateRoi() {
  return useMutation({
    mutationFn: async (inputs: RoiInputs): Promise<CalculateRoiResult> => {
      // The engine is a pure function so we can run it synchronously,
      // but wrapping in a mutation keeps the pattern consistent.
      const results = calculateRoi(inputs);
      const sensitivity = calculateSensitivity(inputs);
      return { results, sensitivity };
    },
  });
}
