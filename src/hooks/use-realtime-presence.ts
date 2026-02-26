'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/use-auth';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A user currently viewing a project, as tracked by Supabase Presence. */
export interface PresenceUser {
  /** Supabase user ID. */
  id: string;
  /** Display name. */
  name: string;
  /** User role within the project / organization. */
  role: UserRole;
  /** Avatar URL (nullable). */
  avatar_url: string | null;
  /** ISO timestamp of last heartbeat. */
  last_seen: string;
}

interface UseProjectPresenceReturn {
  /** List of users currently viewing the project (excluding the current user). */
  viewers: PresenceUser[];
  /** Whether the presence channel is connected. */
  isConnected: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Track which users are currently viewing a project using Supabase Presence.
 *
 * The hook:
 * - Joins a presence channel scoped to the project ID.
 * - Broadcasts the current user's identity on join and on heartbeat.
 * - Returns the list of other users currently viewing the project.
 * - Gracefully returns empty data when Supabase is not configured.
 * - Cleans up the channel on unmount.
 *
 * Usage:
 * ```tsx
 * const { viewers, isConnected } = useProjectPresence(projectId);
 * ```
 */
export function useProjectPresence(projectId: string): UseProjectPresenceReturn {
  const [viewers, setViewers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { data: currentUser } = useCurrentUser();

  /**
   * Extract all PresenceUser entries from a presence state map,
   * excluding the current user.
   */
  const syncViewers = useCallback(
    (presenceState: Record<string, unknown[]>) => {
      const users: PresenceUser[] = [];
      const seen = new Set<string>();

      for (const key of Object.keys(presenceState)) {
        const presences = presenceState[key] as Array<Record<string, unknown>>;
        for (const presence of presences) {
          const id = presence.id as string;
          // Skip current user and duplicates
          if (id === currentUser?.id || seen.has(id)) continue;
          seen.add(id);
          users.push({
            id,
            name: (presence.name as string) ?? 'Unknown',
            role: (presence.role as UserRole) ?? 'engineering',
            avatar_url: (presence.avatar_url as string | null) ?? null,
            last_seen: (presence.last_seen as string) ?? new Date().toISOString(),
          });
        }
      }

      setViewers(users);
    },
    [currentUser?.id],
  );

  useEffect(() => {
    // Guard: no project ID, no Supabase, or no current user
    if (!projectId || !isSupabaseConfigured() || !currentUser) {
      setIsConnected(false);
      setViewers([]);
      return;
    }

    const supabase = createClient();
    const channelName = `presence:project:${projectId}`;

    const channel = supabase.channel(channelName, {
      config: { presence: { key: currentUser.id } },
    });

    // Listen for presence sync events (full state)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<string, unknown[]>;
      syncViewers(state);
    });

    // Listen for join events
    channel.on('presence', { event: 'join' }, () => {
      const state = channel.presenceState() as Record<string, unknown[]>;
      syncViewers(state);
    });

    // Listen for leave events
    channel.on('presence', { event: 'leave' }, () => {
      const state = channel.presenceState() as Record<string, unknown[]>;
      syncViewers(state);
    });

    // Subscribe and track the current user's presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        await channel.track({
          id: currentUser.id,
          name: currentUser.full_name,
          role: currentUser.role,
          avatar_url: currentUser.avatar_url,
          last_seen: new Date().toISOString(),
        });
      } else {
        setIsConnected(false);
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
      setViewers([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, currentUser?.id]);

  return { viewers, isConnected };
}
