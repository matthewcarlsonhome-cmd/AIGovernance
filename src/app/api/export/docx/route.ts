import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withRateLimit } from '@/lib/api-helpers';
import { RATE_LIMIT_EXPORT, RATE_LIMIT_WINDOW_MS } from '@/lib/rate-limit';
import { generateProposalContent } from '@/lib/report-gen/docx/proposal-generator';
import { generateLegalReportContent } from '@/lib/report-gen/docx/legal-report';
import { generateMeetingSummaryContent } from '@/lib/report-gen/docx/meeting-summary';
import { renderProposalDocument } from '@/lib/report-gen/docx/proposal-renderer';
import { renderLegalDocument } from '@/lib/report-gen/docx/legal-renderer';
import { renderMeetingDocument } from '@/lib/report-gen/docx/meeting-renderer';
import type { ApiResponse, DomainScore } from '@/types';
import type {
  FeasibilityScore,
  RoiResults,
  Policy,
  ComplianceMapping,
  RiskClassification,
  TimelineTask,
  MeetingNote,
  ActionItem,
} from '@/types';

/** Supabase client type used throughout this module's helper functions. */
type TypedSupabaseClient = SupabaseClient;

// ────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────

const docxExportSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  reportType: z.enum(['proposal', 'legal', 'meeting']),
  // Optional overrides for data not stored in the database
  clientOrg: z.string().optional(),
  consultantName: z.string().optional(),
  consultantFirm: z.string().optional(),
  // For meeting reports, the specific meeting to export
  meetingId: z.string().uuid('Invalid meeting ID').optional(),
});

// ────────────────────────────────────────────────────────────
// POST /api/export/docx
// Generate a DOCX file and return it as a downloadable binary.
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limit: export endpoints
  const rateLimitResponse = withRateLimit(request, RATE_LIMIT_EXPORT, RATE_LIMIT_WINDOW_MS);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' } satisfies ApiResponse,
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = docxExportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: parsed.error.issues.map((i) => i.message).join(', '),
        } satisfies ApiResponse,
        { status: 400 },
      );
    }

    const input = parsed.data;

    // Fetch the project (RLS enforced)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, description, status, feasibility_score, organization_id')
      .eq('id', input.projectId)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        {
          error: 'Project not found',
          message: 'The specified project does not exist or has been deleted',
        } satisfies ApiResponse,
        { status: 404 },
      );
    }

    // Fetch organization name for branding
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', project.organization_id)
      .single();

    const clientOrg = input.clientOrg ?? org?.name ?? 'Client Organization';
    const generatedAt = new Date().toISOString().split('T')[0];

    // Generate the DOCX buffer based on report type
    let buffer: Buffer;
    let filename: string;

    switch (input.reportType) {
      case 'proposal': {
        const { score, roi, tasks } = await gatherProposalData(supabase, input.projectId);
        const content = generateProposalContent({
          project: {
            name: project.name,
            description: project.description ?? '',
            status: project.status,
          },
          score,
          roi,
          tasks,
          clientOrg,
          consultantName: input.consultantName ?? user.user_metadata?.full_name ?? 'Consultant',
          consultantFirm: input.consultantFirm ?? 'GovAI Studio',
          generatedAt,
        });
        buffer = await renderProposalDocument(content);
        filename = `${sanitizeFilename(project.name)}_Proposal_${generatedAt}.docx`;
        break;
      }

      case 'legal': {
        const { policies, complianceMappings, risks } = await gatherLegalData(
          supabase,
          input.projectId,
        );
        const content = generateLegalReportContent({
          project: { name: project.name },
          policies,
          complianceMappings,
          risks,
          clientOrg,
          preparedBy:
            input.consultantName ?? user.user_metadata?.full_name ?? 'Legal Review Team',
          generatedAt,
        });
        buffer = await renderLegalDocument(content);
        filename = `${sanitizeFilename(project.name)}_Legal_Review_${generatedAt}.docx`;
        break;
      }

      case 'meeting': {
        const { meeting, actionItems } = await gatherMeetingData(
          supabase,
          input.projectId,
          input.meetingId,
        );
        const content = generateMeetingSummaryContent({
          meeting,
          actionItems,
          projectName: project.name,
          generatedAt,
        });
        buffer = await renderMeetingDocument(content);
        const meetingDate = meeting.meeting_date.replace(/\//g, '-');
        filename = `${sanitizeFilename(project.name)}_Meeting_${meetingDate}.docx`;
        break;
      }

      default: {
        return NextResponse.json(
          { error: 'Unsupported report type' } satisfies ApiResponse,
          { status: 400 },
        );
      }
    }

    // Return the DOCX binary with proper Content-Type and Content-Disposition
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const responseBody = new Uint8Array(buffer);
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[DOCX Export Error]', message);
    return NextResponse.json(
      { error: 'Internal server error', message } satisfies ApiResponse,
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────
// Data-gathering helpers
// ────────────────────────────────────────────────────────────

async function gatherProposalData(
  supabase: TypedSupabaseClient,
  projectId: string,
): Promise<{
  score: FeasibilityScore;
  roi?: RoiResults;
  tasks: TimelineTask[];
}> {
  // Feasibility scores
  const { data: scores } = await supabase
    .from('feasibility_scores')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const score: FeasibilityScore = scores
    ? {
        domain_scores: (scores.domain_scores ?? []) as DomainScore[],
        overall_score: scores.overall_score ?? 0,
        rating: scores.rating ?? 'not_ready',
        recommendations: (scores.recommendations ?? []) as string[],
        remediation_tasks: (scores.remediation_tasks ?? []) as string[],
      }
    : {
        domain_scores: [],
        overall_score: 0,
        rating: 'not_ready',
        recommendations: [],
        remediation_tasks: [],
      };

  // ROI calculation
  const { data: roiCalc } = await supabase
    .from('roi_calculations')
    .select('results')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const roi: RoiResults | undefined = (roiCalc?.results as RoiResults) ?? undefined;

  // Timeline tasks
  const { data: tasks } = await supabase
    .from('workflow_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('start_date', { ascending: true });

  return { score, roi, tasks: (tasks ?? []) as TimelineTask[] };
}

async function gatherLegalData(
  supabase: TypedSupabaseClient,
  projectId: string,
): Promise<{
  policies: Policy[];
  complianceMappings: ComplianceMapping[];
  risks: RiskClassification[];
}> {
  const [policiesRes, complianceRes, risksRes] = await Promise.all([
    supabase
      .from('policies')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
    supabase
      .from('compliance_mappings')
      .select('*')
      .eq('project_id', projectId),
    supabase
      .from('risk_classifications')
      .select('*')
      .eq('project_id', projectId),
  ]);

  return {
    policies: (policiesRes.data ?? []) as Policy[],
    complianceMappings: (complianceRes.data ?? []) as ComplianceMapping[],
    risks: (risksRes.data ?? []) as RiskClassification[],
  };
}

async function gatherMeetingData(
  supabase: TypedSupabaseClient,
  projectId: string,
  meetingId?: string,
): Promise<{
  meeting: MeetingNote;
  actionItems: ActionItem[];
}> {
  // Fetch a specific meeting or the most recent one
  let meetingQuery = supabase
    .from('meeting_notes')
    .select('*')
    .eq('project_id', projectId);

  if (meetingId) {
    meetingQuery = meetingQuery.eq('id', meetingId);
  } else {
    meetingQuery = meetingQuery.order('meeting_date', { ascending: false }).limit(1);
  }

  const { data: meetings } = await meetingQuery;
  const meeting: MeetingNote = (meetings?.[0] as MeetingNote) ?? {
    id: '',
    project_id: projectId,
    title: 'Meeting Summary',
    meeting_date: new Date().toISOString().split('T')[0],
    meeting_type: 'general' as const,
    attendees: [],
    notes: 'No meeting notes found for this project.',
    summary: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Fetch action items linked to the meeting
  const { data: actionItems } = await supabase
    .from('action_items')
    .select('*')
    .eq('meeting_id', meeting.id)
    .order('priority', { ascending: true });

  return { meeting, actionItems: (actionItems ?? []) as ActionItem[] };
}

// ────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────

/**
 * Sanitize a string for safe use as a filename.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 80);
}
