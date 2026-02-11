'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Policy,
  GateReview,
  ComplianceMapping,
  RiskClassification,
  ApiResponse,
} from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const governanceKeys = {
  all: ['governance'] as const,

  // Policies
  policies: (projectId: string) =>
    [...governanceKeys.all, 'policies', projectId] as const,

  // Gate reviews
  gateReviews: (projectId: string) =>
    [...governanceKeys.all, 'gate-reviews', projectId] as const,

  // Compliance
  complianceMappings: (projectId: string, framework?: string) =>
    [...governanceKeys.all, 'compliance', projectId, framework ?? 'all'] as const,

  // Risk
  riskClassifications: (projectId: string) =>
    [...governanceKeys.all, 'risk', projectId] as const,
};

// ---------------------------------------------------------------------------
// Fetchers — gracefully return empty data on any error
// ---------------------------------------------------------------------------
async function fetchPolicies(projectId: string): Promise<Policy[]> {
  try {
    const res = await fetch(
      `/api/governance/policies?projectId=${encodeURIComponent(projectId)}`,
    );
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<Policy[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchGateReviews(projectId: string): Promise<GateReview[]> {
  try {
    const res = await fetch(
      `/api/governance/gates?projectId=${encodeURIComponent(projectId)}`,
    );
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<GateReview[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchComplianceMappings(
  projectId: string,
  framework?: string,
): Promise<ComplianceMapping[]> {
  try {
    const params = new URLSearchParams({ projectId });
    if (framework) params.set('framework', framework);

    const res = await fetch(`/api/governance/compliance?${params.toString()}`);
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<ComplianceMapping[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchRiskClassifications(
  projectId: string,
): Promise<RiskClassification[]> {
  try {
    const res = await fetch(
      `/api/governance/risk?projectId=${encodeURIComponent(projectId)}`,
    );
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<RiskClassification[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all policies for a project. */
export function usePolicies(projectId: string) {
  return useQuery({
    queryKey: governanceKeys.policies(projectId),
    queryFn: () => fetchPolicies(projectId),
    enabled: Boolean(projectId),
  });
}

/** Fetch gate reviews for a project. */
export function useGateReviews(projectId: string) {
  return useQuery({
    queryKey: governanceKeys.gateReviews(projectId),
    queryFn: () => fetchGateReviews(projectId),
    enabled: Boolean(projectId),
  });
}

/** Fetch compliance mappings for a project, optionally filtered by framework. */
export function useComplianceMappings(projectId: string, framework?: string) {
  return useQuery({
    queryKey: governanceKeys.complianceMappings(projectId, framework),
    queryFn: () => fetchComplianceMappings(projectId, framework),
    enabled: Boolean(projectId),
  });
}

/** Fetch risk classifications for a project. */
export function useRiskClassifications(projectId: string) {
  return useQuery({
    queryKey: governanceKeys.riskClassifications(projectId),
    queryFn: () => fetchRiskClassifications(projectId),
    enabled: Boolean(projectId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create or update a policy. */
export function useSavePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<Policy, 'id' | 'version' | 'created_at' | 'updated_at'> & { id?: string },
    ) => {
      const isUpdate = Boolean(data.id);
      const url = isUpdate ? `/api/governance/policies/${data.id}` : '/api/governance/policies';
      const res = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save policy');
      }
      const json: ApiResponse<Policy> = await res.json();
      return json.data as Policy;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: governanceKeys.policies(variables.project_id),
      });
    },
  });
}

/** Create or update a gate review. */
export function useSaveGateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<GateReview, 'id' | 'created_at' | 'updated_at'> & { id?: string },
    ) => {
      const isUpdate = Boolean(data.id);
      const url = isUpdate ? `/api/governance/gates/${data.id}` : '/api/governance/gates';
      const res = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save gate review');
      }
      const json: ApiResponse<GateReview> = await res.json();
      return json.data as GateReview;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: governanceKeys.gateReviews(variables.project_id),
      });
    },
  });
}

/** Create or update a compliance mapping. */
export function useSaveComplianceMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<ComplianceMapping, 'id' | 'created_at' | 'updated_at'> & { id?: string },
    ) => {
      const isUpdate = Boolean(data.id);
      const url = isUpdate
        ? `/api/governance/compliance/${data.id}`
        : '/api/governance/compliance';
      const res = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save compliance mapping');
      }
      const json: ApiResponse<ComplianceMapping> = await res.json();
      return json.data as ComplianceMapping;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: governanceKeys.complianceMappings(variables.project_id),
      });
    },
  });
}

/** Create or update a risk classification. */
export function useSaveRiskClassification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<RiskClassification, 'id' | 'created_at' | 'updated_at'> & { id?: string },
    ) => {
      const isUpdate = Boolean(data.id);
      const url = isUpdate ? `/api/governance/risk/${data.id}` : '/api/governance/risk';
      const res = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save risk classification');
      }
      const json: ApiResponse<RiskClassification> = await res.json();
      return json.data as RiskClassification;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: governanceKeys.riskClassifications(variables.project_id),
      });
    },
  });
}
