'use client';

import { useQuery } from '@tanstack/react-query';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  supabase_configured: boolean;
  service_role_configured: boolean;
  database_connected: boolean;
  auth_working: boolean;
  user_profile_exists: boolean;
  organization_exists: boolean;
  tables_accessible: Record<string, boolean>;
  errors: string[];
  user_email?: string;
  user_id?: string;
  organization_id?: string;
}

async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  const json = await res.json();
  return json.data;
}

/**
 * Fetch the system health status.
 * Runs once on mount and caches for 60 seconds.
 */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 1000 * 60,
    retry: false,
  });
}
