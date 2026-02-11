import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, ClientBrief, ObjectionScript, TalkingPoint } from '@/types';

const clientBriefPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  client_industry: z.enum(['financial_services', 'healthcare', 'government', 'technology', 'manufacturing', 'retail', 'education', 'other']),
  risk_posture: z.enum(['conservative', 'moderate', 'progressive']),
  executive_summary: z.string().min(1, 'Executive summary is required'),
  governance_framework_summary: z.string().min(1, 'Governance framework summary is required'),
  risk_mitigation_table: z.array(z.object({
    risk: z.string().min(1),
    mitigation: z.string().min(1),
    status: z.string().min(1),
  })).optional(),
  objection_scripts: z.array(z.object({
    objection: z.string().min(1),
    acknowledge: z.string().min(1),
    counter: z.string().min(1),
    evidence: z.string().min(1),
  })).optional(),
  talking_points: z.array(z.object({
    role: z.enum(['c_suite', 'legal', 'it', 'security', 'engineering', 'hr']),
    points: z.array(z.string()),
    concerns: z.array(z.string()),
    benefits: z.array(z.string()),
  })).optional(),
  faq_items: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).optional(),
  transparency_statement: z.string().optional(),
  available_upon_request: z.array(z.string()).optional(),
});

const demoObjectionScripts: ObjectionScript[] = [
  {
    objection: 'AI tools will introduce security vulnerabilities into our codebase',
    acknowledge: 'Security is a valid and top-priority concern. Any new tool in the development pipeline must meet our security standards.',
    counter: 'Our governance framework includes mandatory code review gates, DLP rules that prevent sensitive data from reaching AI services, and sandbox isolation that mirrors production security controls.',
    evidence: 'The 8-week pilot processed 4,200 code suggestions with zero security incidents. Our SAST/DAST scans showed no increase in vulnerability density compared to the pre-pilot baseline.',
  },
  {
    objection: 'We cannot guarantee AI-generated code meets our compliance requirements',
    acknowledge: 'Compliance is non-negotiable, especially in our regulated industry. Every line of code must meet the same standards regardless of its origin.',
    counter: 'AI-generated code passes through the same CI/CD pipeline, code review process, and compliance checks as human-written code. The AI tool is configured to follow our coding standards and security policies.',
    evidence: 'Our compliance mapping shows 100% coverage of SOC2 controls relevant to code development. The AI-assisted code actually showed 15% fewer compliance flags during review compared to the control group.',
  },
  {
    objection: 'The ROI projections seem optimistic and unproven at scale',
    acknowledge: 'Healthy skepticism about ROI projections is warranted. We should rely on measured results rather than vendor promises.',
    counter: 'Our projections are based on actual pilot data from our own teams, not industry benchmarks. We use conservative scenario modeling with a 15% haircut on all productivity gains.',
    evidence: 'Pilot data shows 32% improvement in code review turnaround and 28% increase in sprint velocity. Even our pessimistic scenario (50% of measured gains) shows positive ROI within 24 months.',
  },
];

const demoTalkingPoints: TalkingPoint[] = [
  {
    role: 'c_suite',
    points: [
      'AI coding tools represent a strategic investment in engineering productivity and talent retention',
      'Governance-first approach minimizes risk while maximizing competitive advantage',
      'Phased rollout ensures measurable ROI at each stage before scaling',
    ],
    concerns: [
      'Total cost of ownership including training and infrastructure',
      'Intellectual property implications of AI-generated code',
      'Market perception and competitive positioning',
    ],
    benefits: [
      '28% projected improvement in engineering velocity',
      'Reduced time-to-market for new features',
      'Enhanced ability to attract and retain top engineering talent',
    ],
  },
  {
    role: 'legal',
    points: [
      'Comprehensive Acceptable Use Policy governs all AI tool interactions',
      'Data classification rules prevent sensitive data exposure to AI services',
      'Vendor contracts include zero-retention clauses and data processing addendums',
    ],
    concerns: [
      'IP ownership of AI-assisted code outputs',
      'Liability for AI-generated code defects',
      'Regulatory compliance across jurisdictions',
    ],
    benefits: [
      'Proactive governance reduces future legal exposure',
      'Documented compliance framework simplifies audit processes',
      'Clear policies reduce ambiguity in employee conduct',
    ],
  },
  {
    role: 'security',
    points: [
      'Sandbox environment isolated from production with full DLP controls',
      'All AI API traffic routed through corporate proxy with logging',
      'Secret scanning and code filtering applied before any AI service interaction',
    ],
    concerns: [
      'Data exfiltration risk through AI service APIs',
      'Supply chain security of AI-generated dependencies',
      'Monitoring and incident response for AI-specific threats',
    ],
    benefits: [
      'AI tools can accelerate security code review and vulnerability detection',
      'Automated compliance checking reduces manual security review burden',
      'Centralized governance improves visibility into AI tool usage patterns',
    ],
  },
];

const demoClientBriefData: ClientBrief = {
  id: 'brief-demo-001',
  project_id: 'proj-demo-001',
  client_industry: 'technology',
  risk_posture: 'moderate',
  executive_summary: 'This client brief summarizes the AI governance framework, implementation roadmap, and risk management strategy for the enterprise AI coding assistant initiative. The technology industry context demands a balance between rapid innovation adoption and responsible AI governance. Our moderate risk posture approach enables competitive advantage while maintaining robust security and compliance controls.',
  governance_framework_summary: 'The governance framework follows a three-gate model: Gate 1 (Discovery & Assessment) validates organizational readiness, Gate 2 (Sandbox & Pilot) proves value in a controlled environment, and Gate 3 (Production Rollout) ensures enterprise-grade controls are in place before scaling. Each gate requires sign-off from IT Security, Legal, and Engineering leadership.',
  risk_mitigation_table: [
    { risk: 'Data exposure to AI provider', mitigation: 'Zero-retention API contracts, DLP rules, data classification enforcement', status: 'Implemented' },
    { risk: 'IP contamination from AI training data', mitigation: 'Enterprise license with indemnification, code provenance tracking', status: 'Implemented' },
    { risk: 'Developer over-reliance on AI suggestions', mitigation: 'Mandatory code review gates, quality metrics monitoring, training program', status: 'In Progress' },
    { risk: 'Regulatory non-compliance', mitigation: 'Compliance mapping to SOC2/GDPR, regular audit cycles, automated control testing', status: 'Implemented' },
  ],
  objection_scripts: demoObjectionScripts,
  talking_points: demoTalkingPoints,
  faq_items: [
    { question: 'Will AI replace our developers?', answer: 'No. AI coding tools augment developer capabilities by handling routine tasks, allowing engineers to focus on architecture, design, and complex problem-solving. Our pilot data shows developers using AI tools report higher job satisfaction.' },
    { question: 'What data is shared with the AI service?', answer: 'Only code context within approved repositories is shared. Personal data, credentials, and restricted-classification data are automatically filtered by our DLP rules before reaching the AI service. The vendor operates under a zero-retention agreement.' },
    { question: 'How do we ensure code quality with AI assistance?', answer: 'AI-generated code goes through the same review pipeline as human-written code: automated tests, SAST/DAST scanning, peer review, and compliance checks. Our pilot showed AI-assisted code had equivalent or better quality metrics.' },
  ],
  transparency_statement: 'Our organization is committed to responsible AI adoption. We maintain full transparency about how AI tools are used in our development process, what data they access, and how we govern their usage. This commitment extends to our customers, employees, and regulatory stakeholders.',
  available_upon_request: [
    'Full security audit report for AI sandbox environment',
    'Vendor data processing agreement and security certifications',
    'Compliance mapping documentation (SOC2, GDPR)',
    'Pilot program detailed metrics and methodology',
    'Acceptable Use Policy (full document)',
  ],
  created_at: '2025-06-01T10:00:00Z',
  updated_at: '2025-06-28T11:00:00Z',
};

/**
 * GET /api/client-brief
 * Fetch client brief for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ClientBrief | null>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoClientBriefData });
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
      .from('client_briefs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch client brief', message: error.message },
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
 * POST /api/client-brief
 * Create or update a client brief for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ClientBrief>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `brief-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          client_industry: body.client_industry ?? 'technology',
          risk_posture: body.risk_posture ?? 'moderate',
          executive_summary: body.executive_summary ?? demoClientBriefData.executive_summary,
          governance_framework_summary: body.governance_framework_summary ?? demoClientBriefData.governance_framework_summary,
          risk_mitigation_table: body.risk_mitigation_table ?? [],
          objection_scripts: body.objection_scripts ?? demoObjectionScripts,
          talking_points: body.talking_points ?? demoTalkingPoints,
          faq_items: body.faq_items ?? [],
          transparency_statement: body.transparency_statement ?? '',
          available_upon_request: body.available_upon_request ?? [],
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
    const parsed = clientBriefPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('client_briefs')
      .upsert(
        {
          project_id: parsed.data.project_id,
          client_industry: parsed.data.client_industry,
          risk_posture: parsed.data.risk_posture,
          executive_summary: parsed.data.executive_summary,
          governance_framework_summary: parsed.data.governance_framework_summary,
          risk_mitigation_table: parsed.data.risk_mitigation_table ?? [],
          objection_scripts: parsed.data.objection_scripts ?? [],
          talking_points: parsed.data.talking_points ?? [],
          faq_items: parsed.data.faq_items ?? [],
          transparency_statement: parsed.data.transparency_statement ?? '',
          available_upon_request: parsed.data.available_upon_request ?? [],
          updated_at: now,
        },
        { onConflict: 'project_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save client brief', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
