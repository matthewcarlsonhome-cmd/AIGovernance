import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, ChangeManagementPlan } from '@/types';

const changeManagementPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  readiness_score: z.number().min(0).max(100),
  readiness_factors: z.array(z.object({
    factor: z.string().min(1),
    score: z.number().min(0).max(100),
    weight: z.number().min(0).max(1),
    notes: z.string(),
  })),
  stakeholder_groups: z.array(z.object({
    group: z.string().min(1),
    influence: z.enum(['high', 'medium', 'low']),
    impact: z.enum(['high', 'medium', 'low']),
    current_position: z.enum(['champion', 'advocate', 'supporter', 'neutral', 'skeptic', 'resistant']),
    target_position: z.enum(['champion', 'advocate', 'supporter', 'neutral']),
    strategy: z.string(),
  })),
  communication_channels: z.array(z.object({
    audience: z.string(),
    message_theme: z.string(),
    channel: z.string(),
    frequency: z.string(),
    owner: z.string(),
  })),
  training_modules: z.array(z.object({
    module: z.string(),
    audience: z.string(),
    format: z.string(),
    duration: z.string(),
    prerequisites: z.string(),
  })),
  resistance_risks: z.array(z.object({
    type: z.string(),
    indicators: z.string(),
    root_cause: z.string(),
    response_strategy: z.string(),
    intensity: z.enum(['passive', 'skeptical', 'active', 'aggressive']),
  })),
  adoption_metrics: z.array(z.object({
    category: z.enum(['awareness', 'adoption', 'sustainability']),
    metric: z.string(),
    target: z.string(),
    measurement_method: z.string(),
  })),
});

const demoChangeManagementData: ChangeManagementPlan = {
  id: 'cm-demo-001',
  project_id: 'proj-demo-001',
  readiness_score: 62,
  readiness_factors: [
    { factor: 'Leadership Sponsorship', score: 80, weight: 0.25, notes: 'CTO actively championing AI adoption' },
    { factor: 'Culture & Openness', score: 55, weight: 0.20, notes: 'Mixed sentiment; engineering positive, legal cautious' },
    { factor: 'Technical Readiness', score: 72, weight: 0.20, notes: 'Modern tech stack, CI/CD in place' },
    { factor: 'Resource Availability', score: 50, weight: 0.15, notes: 'Limited dedicated change management staff' },
    { factor: 'Prior Change Success', score: 60, weight: 0.20, notes: 'Recent cloud migration was moderately successful' },
  ],
  stakeholder_groups: [
    {
      group: 'Engineering Team',
      influence: 'high',
      impact: 'high',
      current_position: 'advocate',
      target_position: 'champion',
      strategy: 'Involve in pilot selection and provide early access to tools',
    },
    {
      group: 'Legal & Compliance',
      influence: 'high',
      impact: 'medium',
      current_position: 'skeptic',
      target_position: 'supporter',
      strategy: 'Address IP and liability concerns with documented policies and vendor agreements',
    },
    {
      group: 'Executive Leadership',
      influence: 'high',
      impact: 'low',
      current_position: 'supporter',
      target_position: 'champion',
      strategy: 'Present ROI data and competitive benchmarks monthly',
    },
  ],
  communication_channels: [
    {
      audience: 'All Staff',
      message_theme: 'AI Governance Vision & Benefits',
      channel: 'Town Hall + Email',
      frequency: 'Monthly',
      owner: 'CTO',
    },
    {
      audience: 'Engineering',
      message_theme: 'Tool rollout updates and best practices',
      channel: 'Slack channel + Wiki',
      frequency: 'Weekly',
      owner: 'Engineering Manager',
    },
  ],
  training_modules: [
    {
      module: 'AI Fundamentals for Everyone',
      audience: 'All staff',
      format: 'Self-paced e-learning',
      duration: '2 hours',
      prerequisites: 'None',
    },
    {
      module: 'AI Coding Assistants Workshop',
      audience: 'Engineering teams',
      format: 'Instructor-led workshop',
      duration: '4 hours',
      prerequisites: 'AI Fundamentals module',
    },
  ],
  resistance_risks: [
    {
      type: 'Job displacement fear',
      indicators: 'Decreased morale, increased attrition inquiries',
      root_cause: 'Lack of clarity on how AI augments rather than replaces roles',
      response_strategy: 'Publish role evolution guides and share success stories from pilot teams',
      intensity: 'skeptical',
    },
    {
      type: 'Quality concerns',
      indicators: 'Refusal to use AI suggestions, reverting AI-generated code',
      root_cause: 'Lack of trust in AI output accuracy',
      response_strategy: 'Share metrics from pilot showing quality improvements and establish review workflows',
      intensity: 'active',
    },
  ],
  adoption_metrics: [
    { category: 'awareness', metric: 'Staff who completed AI Fundamentals training', target: '90% within 3 months', measurement_method: 'LMS completion tracking' },
    { category: 'adoption', metric: 'Engineers actively using AI coding tools', target: '70% within 6 months', measurement_method: 'Tool usage analytics' },
    { category: 'sustainability', metric: 'Sustained weekly active usage rate', target: '60% after 12 months', measurement_method: 'Monthly usage dashboards' },
  ],
  created_at: '2025-06-01T10:00:00Z',
  updated_at: '2025-06-14T16:45:00Z',
};

/**
 * GET /api/change-management
 * Fetch change management plan for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ChangeManagementPlan | null>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoChangeManagementData });
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
      .from('change_management_plans')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch change management plan', message: error.message },
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
 * POST /api/change-management
 * Create or update a change management plan for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ChangeManagementPlan>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `cm-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          readiness_score: body.readiness_score ?? 62,
          readiness_factors: body.readiness_factors ?? [],
          stakeholder_groups: body.stakeholder_groups ?? [],
          communication_channels: body.communication_channels ?? [],
          training_modules: body.training_modules ?? [],
          resistance_risks: body.resistance_risks ?? [],
          adoption_metrics: body.adoption_metrics ?? [],
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
    const parsed = changeManagementPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('change_management_plans')
      .upsert(
        {
          project_id: parsed.data.project_id,
          readiness_score: parsed.data.readiness_score,
          readiness_factors: parsed.data.readiness_factors,
          stakeholder_groups: parsed.data.stakeholder_groups,
          communication_channels: parsed.data.communication_channels,
          training_modules: parsed.data.training_modules,
          resistance_risks: parsed.data.resistance_risks,
          adoption_metrics: parsed.data.adoption_metrics,
          updated_at: now,
        },
        { onConflict: 'project_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save change management plan', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
