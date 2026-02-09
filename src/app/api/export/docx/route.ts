import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

const docxExportSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  reportType: z.enum(['executive', 'legal', 'it_security', 'engineering', 'marketing']),
  reportId: z.string().uuid('Invalid report ID').optional(),
});

interface DocxExportData {
  serverSideGeneration: true;
  format: 'docx';
  reportType: string;
  project: {
    id: string;
    name: string;
    status: string;
    feasibility_score: number | null;
  };
  feasibility: {
    domain_scores: unknown[] | null;
    overall_score: number | null;
    rating: string | null;
    recommendations: string[];
    remediation_tasks: string[];
  };
  reportContent: Record<string, unknown> | null;
  generatedAt: string;
}

/**
 * POST /api/export/docx
 * Generate DOCX export data for a given project and report type.
 * Returns structured JSON data that will be consumed by the
 * docx-js renderer to produce an editable Word document.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<DocxExportData>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = docxExportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const { projectId, reportType, reportId } = parsed.data;

    // Fetch the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, status, feasibility_score')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', message: 'The specified project does not exist or has been deleted' },
        { status: 404 },
      );
    }

    // Fetch the latest feasibility scores
    const { data: scores } = await supabase
      .from('feasibility_scores')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Optionally fetch existing report content
    let reportContent: Record<string, unknown> | null = null;
    if (reportId) {
      const { data: report } = await supabase
        .from('generated_reports')
        .select('content')
        .eq('id', reportId)
        .single();
      reportContent = report?.content ?? null;
    }

    // Gather persona-specific data
    const additionalData = await gatherDocxData(supabase, projectId, reportType);

    const exportData: DocxExportData = {
      serverSideGeneration: true,
      format: 'docx',
      reportType,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        feasibility_score: project.feasibility_score,
      },
      feasibility: {
        domain_scores: scores?.domain_scores ?? null,
        overall_score: scores?.overall_score ?? null,
        rating: scores?.rating ?? null,
        recommendations: scores?.recommendations ?? [],
        remediation_tasks: scores?.remediation_tasks ?? [],
      },
      reportContent: {
        ...reportContent,
        ...additionalData,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: exportData });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * Gather additional data relevant to the DOCX report type.
 * DOCX reports are typically editable (legal, marketing) so we include
 * richer text content that users will want to modify.
 */
async function gatherDocxData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  projectId: string,
  reportType: string,
): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};

  switch (reportType) {
    case 'legal': {
      // Include full policy content for editable contract analysis
      const { data: policies } = await supabase
        .from('policies')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      data.policies = policies ?? [];

      // Include compliance mappings
      const { data: compliance } = await supabase
        .from('compliance_mappings')
        .select('*')
        .eq('project_id', projectId);
      data.compliance_mappings = compliance ?? [];

      // Include gate reviews for approval status
      const { data: gates } = await supabase
        .from('gate_reviews')
        .select('*')
        .eq('project_id', projectId)
        .order('gate_number', { ascending: true });
      data.gate_reviews = gates ?? [];
      break;
    }
    case 'marketing': {
      // Include project overview and team data for messaging guide
      const { data: team } = await supabase
        .from('team_members')
        .select('*, user:users(*)')
        .eq('project_id', projectId);
      data.team = team ?? [];

      // Include PoC results for success stories
      const { data: pocProjects } = await supabase
        .from('poc_projects')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'completed');
      data.completed_pocs = pocProjects ?? [];

      // Include ROI data for value messaging
      const { data: roi } = await supabase
        .from('roi_calculations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data.roi = roi ?? null;
      break;
    }
    case 'executive': {
      // Include ROI and risk data
      const { data: roi } = await supabase
        .from('roi_calculations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data.roi = roi ?? null;

      const { data: risks } = await supabase
        .from('risk_classifications')
        .select('*')
        .eq('project_id', projectId);
      data.risks = risks ?? [];

      const { data: milestones } = await supabase
        .from('timeline_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: true });
      data.milestones = milestones ?? [];
      break;
    }
    case 'it_security': {
      // Include sandbox configs and validations
      const { data: configs } = await supabase
        .from('sandbox_configs')
        .select('*, config_files(*)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data.sandbox_config = configs ?? null;

      const { data: validations } = await supabase
        .from('environment_validations')
        .select('*')
        .eq('project_id', projectId);
      data.validations = validations ?? [];
      break;
    }
    case 'engineering': {
      // Include PoC metrics and tool comparison data
      const { data: pocProjects } = await supabase
        .from('poc_projects')
        .select('*, poc_sprints(*)')
        .eq('project_id', projectId);
      data.poc_projects = pocProjects ?? [];

      const { data: evaluations } = await supabase
        .from('tool_evaluations')
        .select('*')
        .eq('project_id', projectId);
      data.tool_evaluations = evaluations ?? [];

      // Include sandbox config for setup guides
      const { data: configs } = await supabase
        .from('sandbox_configs')
        .select('*, config_files(*)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data.sandbox_config = configs ?? null;
      break;
    }
  }

  return data;
}
