import { createServerSupabaseClient } from '@/lib/supabase/server';
import type {
  ReportTemplate,
  GeneratedReport,
  ReportStatus,
} from '@/types';

// ---------------------------------------------------------------------------
// Report Templates
// ---------------------------------------------------------------------------

/**
 * Fetch all available report templates.
 * Templates are global resources not scoped to a single project.
 */
export async function getReportTemplates(): Promise<ReportTemplate[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('report_templates')
    .select('*')
    .order('persona', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Generated Reports
// ---------------------------------------------------------------------------

/**
 * Fetch all generated reports for a project, newest first.
 */
export async function getGeneratedReports(
  projectId: string
): Promise<GeneratedReport[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('generated_reports')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Save a new generated report record.
 * Typically called when report generation starts; the `file_url` and
 * `file_size` are populated later via `updateReportStatus`.
 */
export async function saveGeneratedReport(
  data: Pick<GeneratedReport, 'project_id' | 'persona' | 'title'> &
    Partial<
      Pick<
        GeneratedReport,
        'template_id' | 'status' | 'content' | 'file_url' | 'file_size' | 'generated_by'
      >
    >
): Promise<GeneratedReport> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: created, error } = await supabase
    .from('generated_reports')
    .insert({
      project_id: data.project_id,
      template_id: data.template_id ?? null,
      persona: data.persona,
      title: data.title,
      status: data.status ?? 'generating',
      content: data.content ?? null,
      file_url: data.file_url ?? null,
      file_size: data.file_size ?? null,
      generated_by: data.generated_by ?? user?.id ?? null,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Update the status (and optionally the file reference) of a generated report.
 * Common transitions: generating -> draft -> review -> final.
 */
export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  updates?: Partial<Pick<GeneratedReport, 'file_url' | 'file_size' | 'content'>>
): Promise<GeneratedReport> {
  const supabase = await createServerSupabaseClient();
  const { data: updated, error } = await supabase
    .from('generated_reports')
    .update({
      status,
      ...(updates?.file_url !== undefined && { file_url: updates.file_url }),
      ...(updates?.file_size !== undefined && { file_size: updates.file_size }),
      ...(updates?.content !== undefined && { content: updates.content }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}
