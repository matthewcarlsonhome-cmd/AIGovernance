import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, PilotDesign } from '@/types';

const pilotDesignPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  pilot_type: z.enum(['poc', 'pov', 'limited_pilot', 'full_pilot']),
  objectives: z.array(z.object({
    category: z.enum(['technical', 'business', 'user', 'operational', 'strategic']),
    description: z.string().min(1),
    priority: z.enum(['must_have', 'should_have', 'nice_to_have']),
  })),
  participant_criteria: z.array(z.object({
    criterion: z.string().min(1),
    weight: z.number().min(0).max(1),
    ideal_profile: z.string(),
  })),
  success_criteria: z.array(z.object({
    criteria: z.string().min(1),
    type: z.enum(['must_have', 'should_have', 'could_have']),
    threshold: z.string(),
    status: z.enum(['not_measured', 'met', 'not_met', 'partial']),
    evidence: z.string(),
  })),
  quantitative_metrics: z.array(z.object({
    metric: z.string(),
    baseline: z.string(),
    target: z.string(),
    actual: z.string().nullable(),
    method: z.string(),
  })),
  go_nogo_gates: z.array(z.object({
    criteria: z.string(),
    threshold: z.string(),
    status: z.enum(['pass', 'fail', 'pending']),
    evidence: z.string(),
  })),
  risk_register: z.array(z.object({
    risk: z.string(),
    likelihood: z.enum(['critical', 'high', 'medium', 'low']),
    impact: z.enum(['critical', 'high', 'medium', 'low']),
    mitigation: z.string(),
    contingency: z.string(),
  })),
  kill_switch_criteria: z.array(z.string()),
  scale_recommendation: z.enum(['full_scale', 'phased', 'extended', 'pivot', 'discontinue']).nullable().optional(),
});

const demoPilotDesignData: PilotDesign = {
  id: 'pilot-demo-001',
  project_id: 'proj-demo-001',
  pilot_type: 'limited_pilot',
  objectives: [
    { category: 'technical', description: 'Validate AI coding assistant integration with existing CI/CD pipeline', priority: 'must_have' },
    { category: 'business', description: 'Measure productivity improvement in code review turnaround time', priority: 'must_have' },
    { category: 'user', description: 'Assess developer satisfaction and adoption willingness', priority: 'should_have' },
    { category: 'operational', description: 'Evaluate security posture impact of AI-generated code', priority: 'must_have' },
  ],
  participant_criteria: [
    { criterion: 'Development experience', weight: 0.3, ideal_profile: '3+ years in primary tech stack' },
    { criterion: 'Team diversity', weight: 0.25, ideal_profile: 'Mix of junior, mid, and senior engineers' },
    { criterion: 'Project type variety', weight: 0.25, ideal_profile: 'Both greenfield and maintenance projects' },
    { criterion: 'Willingness to provide feedback', weight: 0.2, ideal_profile: 'Committed to weekly surveys and retrospectives' },
  ],
  success_criteria: [
    { criteria: 'Code review cycle time reduction', type: 'must_have', threshold: '20% reduction', status: 'not_measured', evidence: '' },
    { criteria: 'No critical security vulnerabilities introduced', type: 'must_have', threshold: 'Zero critical findings', status: 'not_measured', evidence: '' },
    { criteria: 'Developer NPS above baseline', type: 'should_have', threshold: 'NPS > 30', status: 'not_measured', evidence: '' },
  ],
  quantitative_metrics: [
    { metric: 'Lines of code per sprint', baseline: '1,200 avg', target: '1,500 avg', actual: null, method: 'Git analytics' },
    { metric: 'Defect rate', baseline: '2.1 per 100 LOC', target: '1.5 per 100 LOC', actual: null, method: 'Bug tracker analysis' },
    { metric: 'PR merge time', baseline: '18 hours avg', target: '12 hours avg', actual: null, method: 'GitHub metrics' },
  ],
  go_nogo_gates: [
    { criteria: 'Security scan passes', threshold: 'No high/critical findings in AI-generated code', status: 'pending', evidence: '' },
    { criteria: 'Data privacy compliance', threshold: 'Zero data leakage incidents', status: 'pending', evidence: '' },
    { criteria: 'Participant satisfaction', threshold: 'Satisfaction score above 3.5/5', status: 'pending', evidence: '' },
  ],
  risk_register: [
    {
      risk: 'AI-generated code introduces subtle security vulnerabilities',
      likelihood: 'medium',
      impact: 'high',
      mitigation: 'Mandatory security scans on all AI-assisted PRs',
      contingency: 'Revert to manual-only workflow and conduct security audit',
    },
    {
      risk: 'Developer over-reliance on AI suggestions reduces learning',
      likelihood: 'medium',
      impact: 'medium',
      mitigation: 'Require developers to review and explain AI suggestions before accepting',
      contingency: 'Introduce AI-free coding days for skill maintenance',
    },
  ],
  kill_switch_criteria: [
    'Any confirmed data breach involving AI-processed code',
    'Security vulnerability rated critical traced to AI-generated code',
    'Developer satisfaction drops below 2.0/5 for two consecutive surveys',
  ],
  scale_recommendation: null,
  created_at: '2025-06-01T10:00:00Z',
  updated_at: '2025-06-13T11:20:00Z',
};

/**
 * GET /api/pilot-design
 * Fetch pilot design for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PilotDesign | null>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoPilotDesignData });
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
      .from('pilot_designs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch pilot design', message: error.message },
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
 * POST /api/pilot-design
 * Create or update a pilot design for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<PilotDesign>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `pilot-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          pilot_type: body.pilot_type ?? 'limited_pilot',
          objectives: body.objectives ?? [],
          participant_criteria: body.participant_criteria ?? [],
          success_criteria: body.success_criteria ?? [],
          quantitative_metrics: body.quantitative_metrics ?? [],
          go_nogo_gates: body.go_nogo_gates ?? [],
          risk_register: body.risk_register ?? [],
          kill_switch_criteria: body.kill_switch_criteria ?? [],
          scale_recommendation: body.scale_recommendation ?? null,
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
    const parsed = pilotDesignPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('pilot_designs')
      .upsert(
        {
          project_id: parsed.data.project_id,
          pilot_type: parsed.data.pilot_type,
          objectives: parsed.data.objectives,
          participant_criteria: parsed.data.participant_criteria,
          success_criteria: parsed.data.success_criteria,
          quantitative_metrics: parsed.data.quantitative_metrics,
          go_nogo_gates: parsed.data.go_nogo_gates,
          risk_register: parsed.data.risk_register,
          kill_switch_criteria: parsed.data.kill_switch_criteria,
          scale_recommendation: parsed.data.scale_recommendation ?? null,
          updated_at: now,
        },
        { onConflict: 'project_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save pilot design', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
