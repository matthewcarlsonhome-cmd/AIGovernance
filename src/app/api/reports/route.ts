import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, GeneratedReport, ReportTemplate } from '@/types';

const generateReportSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  template_id: z.string().uuid('Invalid template ID').optional(),
  persona: z.enum(['executive', 'legal', 'it_security', 'engineering', 'marketing']),
  title: z.string().min(1, 'Report title is required').max(255),
  sections: z.array(z.string()).optional(),
});

interface ReportsListData {
  templates: ReportTemplate[];
  reports: GeneratedReport[];
}

/**
 * GET /api/reports
 * Fetch report templates and previously generated reports.
 * Supports ?project_id= to filter generated reports by project.
 * Supports ?persona= to filter templates by persona.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ReportsListData>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: { templates: [], reports: [] } });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const persona = searchParams.get('persona');

    // Fetch report templates
    let templatesQuery = supabase
      .from('report_templates')
      .select('*')
      .order('persona', { ascending: true });

    if (persona) {
      templatesQuery = templatesQuery.eq('persona', persona);
    }

    const { data: templates, error: templatesError } = await templatesQuery;

    if (templatesError) {
      return NextResponse.json(
        { error: 'Failed to fetch report templates', message: templatesError.message },
        { status: 500 },
      );
    }

    // Fetch generated reports
    let reportsQuery = supabase
      .from('generated_reports')
      .select('*')
      .order('generated_at', { ascending: false });

    if (projectId) {
      reportsQuery = reportsQuery.eq('project_id', projectId);
    }

    if (persona) {
      reportsQuery = reportsQuery.eq('persona', persona);
    }

    const { data: reports, error: reportsError } = await reportsQuery;

    if (reportsError) {
      return NextResponse.json(
        { error: 'Failed to fetch generated reports', message: reportsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        templates: templates ?? [],
        reports: reports ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * POST /api/reports
 * Trigger generation of a new report.
 * Creates a generated_reports record with 'generating' status,
 * gathers project data, and constructs the report content.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<GeneratedReport>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `rpt-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          template_id: body.template_id ?? null,
          persona: body.persona ?? 'executive',
          title: body.title ?? 'Demo Report',
          status: 'draft',
          content: {},
          generated_by: 'demo-user',
          generated_at: now,
          file_url: null,
          file_size: null,
          created_at: now,
          updated_at: now,
        },
      }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = generateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Verify the project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, status, feasibility_score')
      .eq('id', parsed.data.project_id)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', message: 'The specified project does not exist or has been deleted' },
        { status: 404 },
      );
    }

    // Fetch the latest feasibility scores for report content
    const { data: scores } = await supabase
      .from('feasibility_scores')
      .select('*')
      .eq('project_id', parsed.data.project_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build report content with project data
    const reportContent: Record<string, unknown> = {
      project_name: project.name,
      project_status: project.status,
      feasibility_score: project.feasibility_score,
      domain_scores: scores?.domain_scores ?? null,
      overall_score: scores?.overall_score ?? null,
      rating: scores?.rating ?? null,
      recommendations: scores?.recommendations ?? [],
      remediation_tasks: scores?.remediation_tasks ?? [],
      persona: parsed.data.persona,
      generated_at: new Date().toISOString(),
      sections: parsed.data.sections ?? [],
    };

    // Create the generated report record
    const now = new Date().toISOString();
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        project_id: parsed.data.project_id,
        template_id: parsed.data.template_id ?? null,
        persona: parsed.data.persona,
        title: parsed.data.title,
        status: 'generating',
        content: reportContent,
        generated_by: user.id,
        generated_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (reportError) {
      return NextResponse.json(
        { error: 'Failed to create report', message: reportError.message },
        { status: 500 },
      );
    }

    // Mark report as draft (generation complete for now; actual PDF/DOCX
    // rendering happens via the /api/export endpoints)
    const { data: updatedReport, error: updateError } = await supabase
      .from('generated_reports')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', report.id)
      .select()
      .single();

    if (updateError) {
      // Non-critical: report was created, just couldn't update status
      console.error('Failed to update report status:', updateError.message);
      return NextResponse.json({ data: report }, { status: 201 });
    }

    return NextResponse.json({ data: updatedReport }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
