'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AssessmentQuestion,
  AssessmentResponse,
  FeasibilityScore,
  ApiResponse,
} from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const assessmentKeys = {
  all: ['assessments'] as const,
  questions: () => [...assessmentKeys.all, 'questions'] as const,
  responses: (projectId: string) =>
    [...assessmentKeys.all, 'responses', projectId] as const,
  scores: (projectId: string) =>
    [...assessmentKeys.all, 'scores', projectId] as const,
};

// ---------------------------------------------------------------------------
// Fetchers — gracefully return empty/fallback data on any error
// ---------------------------------------------------------------------------
async function fetchQuestions(): Promise<AssessmentQuestion[]> {
  try {
    const res = await fetch('/api/assessments');
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<AssessmentQuestion[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchResponses(projectId: string): Promise<AssessmentResponse[]> {
  try {
    const res = await fetch(`/api/assessments/${encodeURIComponent(projectId)}`);
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<AssessmentResponse[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchScores(projectId: string): Promise<FeasibilityScore | null> {
  try {
    const res = await fetch('/api/assessments/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    });
    if (!res.ok) {
      return null;
    }
    const json: ApiResponse<FeasibilityScore> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all assessment questions from the template. */
export function useAssessmentQuestions() {
  return useQuery({
    queryKey: assessmentKeys.questions(),
    queryFn: fetchQuestions,
    staleTime: 1000 * 60 * 30, // questions rarely change, cache for 30 minutes
  });
}

/** Fetch assessment responses for a specific project. */
export function useAssessmentResponses(projectId: string) {
  return useQuery({
    queryKey: assessmentKeys.responses(projectId),
    queryFn: () => fetchResponses(projectId),
    enabled: Boolean(projectId),
  });
}

/** Fetch computed feasibility scores for a specific project. */
export function useAssessmentScores(projectId: string) {
  return useQuery({
    queryKey: assessmentKeys.scores(projectId),
    queryFn: () => fetchScores(projectId),
    enabled: Boolean(projectId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Save or update a single assessment response. */
export function useSaveResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<AssessmentResponse, 'id' | 'created_at' | 'updated_at'> & { id?: string },
    ) => {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save response');
      }
      const json: ApiResponse<AssessmentResponse> = await res.json();
      return json.data as AssessmentResponse;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.responses(variables.project_id),
      });
      // Scores may be affected by a new response
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.scores(variables.project_id),
      });
    },
  });
}

/** Trigger server-side score recalculation for a project. */
export function useRecalculateScores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch('/api/assessments/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to recalculate scores');
      }
      const json: ApiResponse<FeasibilityScore> = await res.json();
      return json.data as FeasibilityScore;
    },
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.scores(projectId),
      });
    },
  });
}
