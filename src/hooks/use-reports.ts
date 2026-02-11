'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ReportTemplate,
  GeneratedReport,
  ReportPersona,
  ApiResponse,
} from '@/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const reportKeys = {
  all: ['reports'] as const,
  templates: () => [...reportKeys.all, 'templates'] as const,
  generated: (projectId: string) =>
    [...reportKeys.all, 'generated', projectId] as const,
};

// ---------------------------------------------------------------------------
// Fetchers — gracefully return empty data on any error
// ---------------------------------------------------------------------------
interface ReportsListData {
  templates: ReportTemplate[];
  reports: GeneratedReport[];
}

async function fetchTemplates(): Promise<ReportTemplate[]> {
  try {
    const res = await fetch('/api/reports');
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<ReportsListData> = await res.json();
    return json.data?.templates ?? [];
  } catch {
    return [];
  }
}

async function fetchGeneratedReports(projectId: string): Promise<GeneratedReport[]> {
  try {
    const res = await fetch(
      `/api/reports?project_id=${encodeURIComponent(projectId)}`,
    );
    if (!res.ok) {
      return [];
    }
    const json: ApiResponse<ReportsListData> = await res.json();
    return json.data?.reports ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all available report templates. */
export function useReportTemplates() {
  return useQuery({
    queryKey: reportKeys.templates(),
    queryFn: fetchTemplates,
    staleTime: 1000 * 60 * 30, // templates rarely change
  });
}

/** Fetch previously generated reports for a project. */
export function useGeneratedReports(projectId: string) {
  return useQuery({
    queryKey: reportKeys.generated(projectId),
    queryFn: () => fetchGeneratedReports(projectId),
    enabled: Boolean(projectId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export interface GenerateReportInput {
  projectId: string;
  templateId?: string;
  persona: ReportPersona;
  title: string;
  sections?: string[];
}

/** Trigger server-side report generation. */
export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GenerateReportInput) => {
      // The /api/reports POST route expects snake_case keys:
      // project_id, template_id, persona, title, sections
      const payload = {
        project_id: data.projectId,
        template_id: data.templateId,
        persona: data.persona,
        title: data.title,
        sections: data.sections,
      };
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to generate report');
      }
      const json: ApiResponse<GeneratedReport> = await res.json();
      return json.data as GeneratedReport;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reportKeys.generated(variables.projectId),
      });
    },
  });
}

export interface ExportInput {
  reportId: string;
  projectId: string;
}

/** Export a report as PDF. Returns the download URL. */
export function useExportPdf() {
  return useMutation({
    mutationFn: async ({ reportId }: ExportInput) => {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to export PDF');
      }
      const json: ApiResponse<{ url: string }> = await res.json();
      if (!json.data?.url) throw new Error('No download URL returned');
      return json.data.url;
    },
  });
}

/** Export a report as DOCX. Returns the download URL. */
export function useExportDocx() {
  return useMutation({
    mutationFn: async ({ reportId }: ExportInput) => {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to export DOCX');
      }
      const json: ApiResponse<{ url: string }> = await res.json();
      if (!json.data?.url) throw new Error('No download URL returned');
      return json.data.url;
    },
  });
}
