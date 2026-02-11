import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, GeneratedReport } from '@/types';

/* ------------------------------------------------------------------ */
/*  Zod Schemas                                                        */
/* ------------------------------------------------------------------ */

const generateReportSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  template_id: z.string().uuid('Invalid template ID'),
  persona: z.enum(['executive', 'legal', 'it_security', 'engineering', 'marketing']),
});

/* ------------------------------------------------------------------ */
/*  POST /api/reports/generate                                         */
/*  Generate a new report for a project using a template.              */
/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<GeneratedReport>>> {
  try {
    const body = await request.json();
    const parsed = generateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return a mock generated report matching the GeneratedReport interface
    if (!isServerSupabaseConfigured()) {
      const now = new Date().toISOString();
      const demoReport: GeneratedReport = {
        id: `rpt-gen-demo-${Date.now()}`,
        project_id: parsed.data.project_id,
        template_id: parsed.data.template_id,
        persona: parsed.data.persona,
        title: `${parsed.data.persona.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Report`,
        status: 'complete' as GeneratedReport['status'],
        content: null,
        file_url: null,
        file_size: null,
        generated_by: 'demo-user',
        generated_at: now,
        updated_at: now,
      };
      return NextResponse.json({ data: demoReport }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    };

    const personaLabel = parsed.data.persona
      .replace('_', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // Create the generated report record
    const now = new Date().toISOString();
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        project_id: parsed.data.project_id,
        template_id: parsed.data.template_id,
        persona: parsed.data.persona,
        title: `${personaLabel} Report - ${project.name}`,
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

    // Mark report as final (generation complete)
    const { data: updatedReport, error: updateError } = await supabase
      .from('generated_reports')
      .update({ status: 'final', updated_at: new Date().toISOString() })
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
