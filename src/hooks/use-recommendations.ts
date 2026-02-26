'use client';

import { useMutation } from '@tanstack/react-query';
import type {
  ApiResponse,
  Recommendation,
  RecommendationResponse,
  RecommendationType,
} from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseRecommendationsResult {
  /** The generated recommendations (empty array until generate() is called). */
  recommendations: Recommendation[];
  /** Whether a request is currently in flight. */
  isLoading: boolean;
  /** Error from the most recent request, if any. */
  error: Error | null;
  /** Trigger recommendation generation. */
  generate: (type: RecommendationType, context: Record<string, unknown>) => void;
  /** Reset state back to initial. */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function fetchRecommendations(
  type: RecommendationType,
  context: Record<string, unknown>,
): Promise<Recommendation[]> {
  const res = await fetch('/api/ai/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, context }),
  });

  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to generate recommendations (${res.status})`);
  }

  const json: ApiResponse<RecommendationResponse> = await res.json();
  return json.data?.recommendations ?? [];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Client-side hook for generating AI-powered recommendations.
 *
 * Uses TanStack Query's `useMutation` so the request is only fired when the
 * caller invokes `generate()`.
 *
 * @example
 * ```tsx
 * const { recommendations, isLoading, generate } = useRecommendations();
 * generate('remediation', { scores: domainScores, responses });
 * ```
 */
export function useRecommendations(): UseRecommendationsResult {
  const mutation = useMutation<
    Recommendation[],
    Error,
    { type: RecommendationType; context: Record<string, unknown> }
  >({
    mutationFn: ({ type, context }) => fetchRecommendations(type, context),
  });

  return {
    recommendations: mutation.data ?? [],
    isLoading: mutation.isPending,
    error: mutation.error ?? null,
    generate: (type: RecommendationType, context: Record<string, unknown>) => {
      mutation.mutate({ type, context });
    },
    reset: () => {
      mutation.reset();
    },
  };
}
