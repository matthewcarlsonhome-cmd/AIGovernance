'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import type { TeamMember, UserRole, ApiResponse } from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const teamKeys = {
  all: ['team-members'] as const,
  list: (projectId: string) => [...teamKeys.all, projectId] as const,
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchTeamMembers(projectId: string): Promise<TeamMember[]> {
  const res = await fetch(`/api/projects/${projectId}/team`);
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch team members');
  }
  const json: ApiResponse<TeamMember[]> = await res.json();
  return json.data ?? [];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch team members for a project. */
export function useTeamMembers(projectId: string) {
  return useQuery({
    queryKey: teamKeys.list(projectId),
    queryFn: () => fetchTeamMembers(projectId),
    enabled: Boolean(projectId),
  });
}

/**
 * Fetch team members with real-time auto-refresh.
 *
 * Subscribes to INSERT, UPDATE, and DELETE events on the `team_members` table
 * filtered by project ID. When another user adds or removes a team member
 * the list is automatically re-fetched.
 *
 * Falls back gracefully when Supabase is not configured (demo mode).
 */
export function useTeamMembersRealtime(projectId: string) {
  const query = useTeamMembers(projectId);

  const queryKeysToInvalidate = useMemo(
    () => [teamKeys.list(projectId)],
    [projectId],
  );

  const { isConnected } = useRealtimeSubscription({
    table: 'team_members',
    filter: `project_id=eq.${projectId}`,
    queryKeysToInvalidate,
    enabled: Boolean(projectId),
  });

  return { ...query, isRealtimeConnected: isConnected };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export interface AddTeamMemberInput {
  projectId: string;
  name: string;
  email?: string;
  user_id?: string;
  role: UserRole;
}

/** Add a team member to a project. */
export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...data }: AddTeamMemberInput) => {
      const res = await fetch(`/api/projects/${projectId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to add team member');
      }
      const json: ApiResponse<TeamMember> = await res.json();
      return json.data as TeamMember;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.projectId) });
    },
  });
}

export interface RemoveTeamMemberInput {
  projectId: string;
  memberId: string;
}

/** Remove a team member from a project. */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, memberId }: RemoveTeamMemberInput) => {
      const res = await fetch(`/api/projects/${projectId}/team`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId }),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to remove team member');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.projectId) });
    },
  });
}
