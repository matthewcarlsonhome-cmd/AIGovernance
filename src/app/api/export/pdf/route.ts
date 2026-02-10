import React, { type ReactElement } from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withRateLimit } from '@/lib/api-helpers';
import { RATE_LIMIT_EXPORT, RATE_LIMIT_WINDOW_MS } from '@/lib/rate-limit';
import type { FeasibilityScore, RiskClassification, RoiResults } from '@/types';
import {
  generateReadinessReportContent,
  type ReadinessReportData,
} from '@/lib/report-gen/pdf/readiness-report';
import {
  generateExecutiveBriefingContent,
  type ExecutiveBriefingData,
} from '@/lib/report-gen/pdf/executive-briefing';
import { ReportDocument } from '@/lib/report-gen/pdf/renderer';
import { ExecutiveBriefingDocument } from '@/lib/report-gen/pdf/executive-renderer';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const pdfExportSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  reportType: z.enum(['readiness', 'executive']),
  /** Optional: override prepared-by name */
  preparedBy: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

/**
 * POST /api/export/pdf
 *
 * Generate a PDF report and return it as a downloadable binary file.
 *
 * Body:
 *   - projectId: uuid
 *   - reportType: 'readiness' | 'executive'
 *   - preparedBy?: string
 *
 * Returns: application/pdf binary with Content-Disposition header.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limit: export endpoints
  const rateLimitResponse = withRateLimit(request, RATE_LIMIT_EXPORT, RATE_LIMIT_WINDOW_MS);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // ---- Auth ----
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ---- Parse body ----
    const body = await request.json();
    const parsed = pdfExportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { projectId, reportType, preparedBy } = parsed.data;

    // ---- Fetch project ----
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, status, feasibility_score, organization_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        {
          error: 'Project not found',
          message: 'The specified project does not exist or has been deleted',
        },
        { status: 404 },
      );
    }

    // ---- Fetch organization name ----
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', project.organization_id)
      .single();

    const clientOrg = org?.name ?? 'Organization';

    // ---- Fetch feasibility scores ----
    const { data: scores } = await supabase
      .from('feasibility_scores')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build a FeasibilityScore object (fallback to empty defaults)
    const feasibilityScore: FeasibilityScore = {
      domain_scores: scores?.domain_scores ?? [],
      overall_score: scores?.overall_score ?? 0,
      rating: scores?.rating ?? 'not_ready',
      recommendations: scores?.recommendations ?? [],
      remediation_tasks: scores?.remediation_tasks ?? [],
    };

    // ---- Fetch user display name ----
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const authorName =
      preparedBy ?? userProfile?.full_name ?? user.email ?? 'GovAI Studio';

    const generatedAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // ---- Generate report content & render PDF ----
    let pdfBuffer: Buffer;
    let filename: string;

    if (reportType === 'readiness') {
      const reportData: ReadinessReportData = {
        project: {
          name: project.name,
          organization_id: project.organization_id,
          status: project.status,
        },
        score: feasibilityScore,
        generatedAt,
        preparedBy: authorName,
        clientOrg,
      };

      const content = generateReadinessReportContent(reportData);
      const doc = React.createElement(ReportDocument, { content }) as unknown as ReactElement<DocumentProps>;
      pdfBuffer = await renderToBuffer(doc);
      filename = `${sanitizeFilename(project.name)}-readiness-report.pdf`;
    } else {
      // executive
      // Fetch additional data for executive briefing
      const { data: roiCalc } = await supabase
        .from('roi_calculations')
        .select('results')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const roi: RoiResults | undefined = roiCalc?.results ?? undefined;

      const { data: risks } = await supabase
        .from('risk_classifications')
        .select('*')
        .eq('project_id', projectId)
        .order('tier', { ascending: true });

      const topRisks: RiskClassification[] = risks ?? [];

      // Build a simple timeline summary from workflow phases
      const { data: phases } = await supabase
        .from('workflow_phases')
        .select('name, duration_weeks, status')
        .eq('project_id', projectId)
        .order('order', { ascending: true });

      const timelineSummary: { phase: string; weeks: number; status: string }[] =
        (phases ?? []).map(
          (p: { name: string; duration_weeks: number; status: string }) => ({
            phase: p.name,
            weeks: p.duration_weeks ?? 2,
            status: p.status ?? 'planned',
          }),
        );

      // Fallback timeline if no phases exist
      const effectiveTimeline =
        timelineSummary.length > 0
          ? timelineSummary
          : [
              { phase: 'Discovery & Assessment', weeks: 2, status: 'completed' },
              { phase: 'Governance Setup', weeks: 3, status: 'active' },
              { phase: 'Sandbox Configuration', weeks: 2, status: 'planned' },
              { phase: 'Pilot Execution', weeks: 4, status: 'planned' },
              { phase: 'Evaluation & Gate Review', weeks: 2, status: 'planned' },
            ];

      const briefingData: ExecutiveBriefingData = {
        project: { name: project.name, status: project.status },
        score: feasibilityScore,
        roi,
        topRisks,
        timelineSummary: effectiveTimeline,
        generatedAt,
        preparedBy: authorName,
        clientOrg,
      };

      const content = generateExecutiveBriefingContent(briefingData);
      const doc = React.createElement(ExecutiveBriefingDocument, { content }) as unknown as ReactElement<DocumentProps>;
      pdfBuffer = await renderToBuffer(doc);
      filename = `${sanitizeFilename(project.name)}-executive-briefing.pdf`;
    }

    // ---- Return PDF binary ----
    const responseBody = new Uint8Array(pdfBuffer);
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    console.error('[PDF Export Error]', error);
    return NextResponse.json(
      { error: 'PDF generation failed', message },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sanitize a string for use as a filename */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}
