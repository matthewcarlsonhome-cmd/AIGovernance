import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, StakeholderCommunicationPackage, CommunicationItem, CommunicationCalendarEntry } from '@/types';

const communicationsPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  communications: z.array(z.object({
    id: z.string().min(1),
    type: z.enum(['board_presentation', 'executive_briefing', 'employee_announcement', 'employee_faq', 'manager_talking_points', 'customer_announcement', 'customer_faq', 'crisis_communication']),
    title: z.string().min(1),
    audience: z.string().min(1),
    key_messages: z.array(z.string()),
    content: z.string(),
    tone: z.enum(['formal', 'professional', 'casual']),
    status: z.enum(['draft', 'review', 'approved', 'sent']),
    scheduled_date: z.string().nullable().optional(),
  })).optional(),
  calendar: z.array(z.object({
    id: z.string().min(1),
    milestone: z.string().min(1),
    date: z.string().min(1),
    communications: z.array(z.string()),
    owner: z.string().min(1),
    status: z.enum(['planned', 'in_progress', 'completed']),
  })).optional(),
  crisis_framework: z.string().nullable().optional(),
});

const demoCommunications: CommunicationItem[] = [
  {
    id: 'comm-001',
    type: 'executive_briefing',
    title: 'AI Coding Assistant Initiative - Executive Update',
    audience: 'C-Suite and VP-level leadership',
    key_messages: [
      'AI coding assistant pilot demonstrated 32% productivity improvement',
      'Security review completed with no critical findings',
      'Phased rollout plan ready for board approval',
    ],
    content: 'This briefing summarizes the outcomes of our 8-week AI coding assistant pilot program, including productivity metrics, security audit results, and the proposed enterprise rollout timeline.',
    tone: 'formal',
    status: 'review',
    scheduled_date: '2025-07-15T09:00:00Z',
  },
  {
    id: 'comm-002',
    type: 'employee_announcement',
    title: 'Introducing AI-Assisted Development Tools',
    audience: 'All engineering staff',
    key_messages: [
      'New AI coding tools available starting August 1st',
      'Mandatory training sessions scheduled for all teams',
      'AI usage governed by new Acceptable Use Policy',
    ],
    content: 'We are excited to announce the rollout of AI-assisted development tools across our engineering organization. These tools have been thoroughly evaluated for security and compliance, and will be available to all engineering teams starting August 1st.',
    tone: 'professional',
    status: 'draft',
    scheduled_date: '2025-07-22T10:00:00Z',
  },
  {
    id: 'comm-003',
    type: 'employee_faq',
    title: 'AI Coding Tools - Frequently Asked Questions',
    audience: 'All engineering and product staff',
    key_messages: [
      'Clear guidance on what data can and cannot be shared with AI tools',
      'Training resources and support channels available',
      'Feedback mechanism in place for continuous improvement',
    ],
    content: 'This FAQ document addresses the most common questions about our new AI coding tools, including data handling policies, approved use cases, and how to get help.',
    tone: 'casual',
    status: 'draft',
    scheduled_date: null,
  },
  {
    id: 'comm-004',
    type: 'board_presentation',
    title: 'AI Governance Program - Board Review Q3',
    audience: 'Board of Directors',
    key_messages: [
      'Governance framework fully operational across 3 business units',
      'Risk posture improved from moderate to low after control implementation',
      'ROI projection on track with 18-month payback period',
    ],
    content: 'Quarterly board presentation covering AI governance program status, risk management outcomes, compliance posture, and financial projections for the enterprise AI initiative.',
    tone: 'formal',
    status: 'approved',
    scheduled_date: '2025-08-10T14:00:00Z',
  },
];

const demoCalendar: CommunicationCalendarEntry[] = [
  {
    id: 'cal-001',
    milestone: 'Pilot Completion & Results',
    date: '2025-07-15',
    communications: ['comm-001'],
    owner: 'VP Engineering',
    status: 'in_progress',
  },
  {
    id: 'cal-002',
    milestone: 'Engineering Rollout Announcement',
    date: '2025-07-22',
    communications: ['comm-002', 'comm-003'],
    owner: 'Engineering Communications Lead',
    status: 'planned',
  },
  {
    id: 'cal-003',
    milestone: 'Q3 Board Review',
    date: '2025-08-10',
    communications: ['comm-004'],
    owner: 'CTO',
    status: 'planned',
  },
];

const demoCommunicationsData: StakeholderCommunicationPackage = {
  id: 'commpkg-demo-001',
  project_id: 'proj-demo-001',
  communications: demoCommunications,
  calendar: demoCalendar,
  crisis_framework: 'In the event of an AI-related incident (data leak, model misuse, or compliance violation), the crisis communication plan activates a 3-tier response: (1) Immediate internal notification to CISO and Legal within 1 hour, (2) Stakeholder briefing within 24 hours, (3) External disclosure if required within 72 hours per regulatory obligations.',
  created_at: '2025-06-01T10:00:00Z',
  updated_at: '2025-07-01T14:00:00Z',
};

/**
 * GET /api/communications
 * Fetch stakeholder communication package for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<StakeholderCommunicationPackage | null>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoCommunicationsData });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'project_id query parameter is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('stakeholder_communications')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch communication package', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * POST /api/communications
 * Create or update stakeholder communication items for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<StakeholderCommunicationPackage>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `commpkg-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          communications: body.communications ?? demoCommunications,
          calendar: body.calendar ?? demoCalendar,
          crisis_framework: body.crisis_framework ?? null,
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
    const parsed = communicationsPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('stakeholder_communications')
      .upsert(
        {
          project_id: parsed.data.project_id,
          communications: parsed.data.communications ?? [],
          calendar: parsed.data.calendar ?? [],
          crisis_framework: parsed.data.crisis_framework ?? null,
          updated_at: now,
        },
        { onConflict: 'project_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save communication package', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
