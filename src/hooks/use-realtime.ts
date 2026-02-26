'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Generic real-time subscription hook (options-based API)
// ---------------------------------------------------------------------------

interface UseRealtimeSubscriptionOptions {
  /**
   * The Supabase table name to subscribe to.
   * Must match the actual Postgres table name (snake_case, plural).
   */
  table: string;
  /**
   * Optional Postgres change filter in the format `column=eq.value`.
   * Example: `project_id=eq.abc-123`
   */
  filter?: string;
  /**
   * TanStack Query keys to invalidate when a change event is received.
   * When omitted, no automatic cache invalidation occurs.
   */
  queryKeysToInvalidate?: readonly (readonly unknown[])[];
  /**
   * When true the subscription is enabled (default: true).
   * Set to false to temporarily pause the subscription.
   */
  enabled?: boolean;
}

interface UseRealtimeSubscriptionReturn {
  /** Whether the real-time channel is currently connected. */
  isConnected: boolean;
}

/**
 * Subscribe to Supabase Realtime changes on a table.
 *
 * On INSERT, UPDATE, or DELETE events the hook invalidates the specified
 * TanStack Query keys so data is automatically refetched.
 *
 * The subscription is properly cleaned up when the component unmounts or
 * when the `enabled` flag becomes false.
 */
export function useRealtimeSubscription({
  table,
  filter,
  queryKeysToInvalidate = [],
  enabled = true,
}: UseRealtimeSubscriptionOptions): UseRealtimeSubscriptionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(() => {
    for (const key of queryKeysToInvalidate) {
      queryClient.invalidateQueries({ queryKey: key as unknown[] });
    }
  }, [queryClient, queryKeysToInvalidate]);

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();

    // Build a unique channel name based on the table + filter
    const channelName = filter
      ? `realtime:${table}:${filter}`
      : `realtime:${table}`;

    // Build the Postgres Changes subscription config
    const subscriptionConfig: {
      event: '*';
      schema: 'public';
      table: string;
      filter?: string;
    } = {
      event: '*',
      schema: 'public',
      table,
    };

    if (filter) {
      subscriptionConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as 'system',
        subscriptionConfig as unknown as { event: 'system' },
        () => {
          // On any change (INSERT, UPDATE, DELETE) invalidate queries
          invalidateQueries();
        },
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, enabled]);

  return { isConnected };
}

// ---------------------------------------------------------------------------
// Simplified positional-parameter API
// ---------------------------------------------------------------------------

/**
 * Simplified real-time subscription hook with positional parameters.
 *
 * Subscribes to INSERT, UPDATE, and DELETE events on the specified table.
 * On any change, the provided TanStack Query key is invalidated so the
 * relevant query automatically refetches.
 *
 * Gracefully returns early when Supabase is not configured (demo mode).
 * Cleans up the subscription on unmount.
 *
 * @param table    - The Postgres table name to subscribe to.
 * @param queryKey - The TanStack Query key to invalidate on changes.
 * @param filter   - Optional column filter to scope the subscription.
 */
export function useRealtimeTable(
  table: string,
  queryKey: readonly unknown[],
  filter?: { column: string; value: string },
): UseRealtimeSubscriptionReturn {
  // Memoize the query keys array to prevent re-subscriptions on every render
  const queryKeysToInvalidate = useMemo(() => [queryKey], [queryKey]);

  // Convert the structured filter to Supabase's filter string format
  const filterString = filter ? `${filter.column}=eq.${filter.value}` : undefined;

  return useRealtimeSubscription({
    table,
    filter: filterString,
    queryKeysToInvalidate,
    enabled: true,
  });
}
