import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

const pdfExportSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  reportType: z.enum(['executive', 'legal', 'it_security', 'engineering', 'marketing']),
  reportId: z.string().uuid('Invalid report ID').optional(),
});

interface PdfExportData {
  serverSideGeneration: true;
  format: 'pdf';
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
 * POST /api/export/pdf
 * Generate PDF export data for a given project and report type.
 * Returns structured JSON data that will be consumed by the
 * @react-pdf/renderer on the client or during server-side rendering.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<PdfExportData>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = pdfExportSchema.safeParse(body);

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

    // Gather persona-specific data based on reportType
    const additionalData = await gatherPersonaData(supabase, projectId, reportType);

    const exportData: PdfExportData = {
      serverSideGeneration: true,
      format: 'pdf',
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
 * Gather additional data relevant to the specific persona report type.
 */
async function gatherPersonaData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  projectId: string,
  reportType: string,
): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};

  switch (reportType) {
    case 'executive': {
      // Include ROI calculations
      const { data: roi } = await supabase
        .from('roi_calculations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data.roi = roi ?? null;

      // Include risk classifications for heat map
      const { data: risks } = await supabase
        .from('risk_classifications')
        .select('*')
        .eq('project_id', projectId);
      data.risks = risks ?? [];
      break;
    }
    case 'legal': {
      // Include policies
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
      break;
    }
    case 'it_security': {
      // Include sandbox configurations
      const { data: configs } = await supabase
        .from('sandbox_configs')
        .select('*, config_files(*)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data.sandbox_config = configs ?? null;

      // Include environment validations
      const { data: validations } = await supabase
        .from('environment_validations')
        .select('*')
        .eq('project_id', projectId);
      data.validations = validations ?? [];
      break;
    }
    case 'engineering': {
      // Include PoC metrics and tool evaluations
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
      break;
    }
    case 'marketing': {
      // Include project overview data for messaging guides
      const { data: team } = await supabase
        .from('team_members')
        .select('*, user:users(*)')
        .eq('project_id', projectId);
      data.team = team ?? [];
      break;
    }
  }

  return data;
}
