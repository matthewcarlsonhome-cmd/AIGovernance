'use client';

import { useMemo } from 'react';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import { timelineKeys } from '@/hooks/use-timeline';

// ---------------------------------------------------------------------------
// Timeline-specific real-time subscription hook
// ---------------------------------------------------------------------------

interface UseRealtimeTimelineOptions {
  /** The project ID to scope the real-time subscription to. */
  projectId: string;
  /** Whether the subscription should be active. Defaults to true. */
  enabled?: boolean;
}

interface UseRealtimeTimelineReturn {
  /** Whether the real-time channel for timeline tasks is connected. */
  isConnected: boolean;
}

/**
 * Subscribe to real-time changes on `workflow_tasks` for the given project.
 *
 * When a task is created, updated, or deleted the `timeline-tasks` TanStack
 * Query cache is automatically invalidated, causing the Gantt chart and other
 * timeline views to re-render with fresh data.
 *
 * Usage:
 * ```tsx
 * const { isConnected } = useRealtimeTimeline({ projectId });
 * ```
 */
export function useRealtimeTimeline({
  projectId,
  enabled = true,
}: UseRealtimeTimelineOptions): UseRealtimeTimelineReturn {
  // Memoize the query keys array to avoid re-creating the subscription on
  // every render.
  const queryKeysToInvalidate = useMemo(
    () => [
      timelineKeys.tasks(projectId),
      timelineKeys.milestones(projectId),
    ],
    [projectId],
  );

  const { isConnected } = useRealtimeSubscription({
    table: 'workflow_tasks',
    filter: `project_id=eq.${projectId}`,
    queryKeysToInvalidate,
    enabled: enabled && Boolean(projectId),
  });

  return { isConnected };
}
