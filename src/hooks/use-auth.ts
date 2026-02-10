'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, UserRole, ApiResponse } from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'current-user'] as const,
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch('/api/auth/me');
  if (res.status === 401) return null;
  if (!res.ok) {
    const body: ApiResponse = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to fetch current user');
  }
  const json: ApiResponse<User> = await res.json();
  return json.data ?? null;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch the currently authenticated user.
 * Returns `null` when the user is not signed in (instead of throwing).
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // re-validate every 5 minutes
    retry: false, // don't retry 401s
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export interface SignInInput {
  email: string;
  password: string;
}

/** Sign in with email and password. */
export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: SignInInput) => {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Sign in failed');
      }
      const json: ApiResponse<User> = await res.json();
      return json.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
  });
}

export interface SignUpInput {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
}

/** Register a new user account. */
export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password, full_name, role }: SignUpInput) => {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name, role }),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Sign up failed');
      }
      const json: ApiResponse<User> = await res.json();
      return json.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
  });
}

/** Sign out the current user. */
export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/sign-out', {
        method: 'POST',
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Sign out failed');
      }
    },
    onSuccess: () => {
      // Clear all cached data on sign-out
      queryClient.clear();
    },
  });
}
