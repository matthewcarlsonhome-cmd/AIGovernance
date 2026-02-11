import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, MaturityAssessment, MaturityDimensionScore, MaturityLevel } from '@/types';

const maturityPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  dimension_scores: z.array(z.object({
    dimension: z.enum(['policy_standards', 'risk_management', 'data_governance', 'access_controls', 'vendor_management', 'training_awareness']),
    level: z.number().int().min(1).max(5) as z.ZodType<MaturityLevel>,
    score: z.number().min(0).max(100),
    subscores: z.object({
      documentation: z.number().min(0).max(100),
      implementation: z.number().min(0).max(100),
      enforcement: z.number().min(0).max(100),
      measurement: z.number().min(0).max(100),
      improvement: z.number().min(0).max(100),
    }),
    key_gap: z.string().min(1, 'Key gap is required'),
  })),
  overall_score: z.number().min(0).max(100),
  overall_level: z.number().int().min(1).max(5) as z.ZodType<MaturityLevel>,
  industry: z.enum(['financial_services', 'healthcare', 'government', 'technology', 'manufacturing', 'retail', 'education', 'other']).nullable().optional(),
});

const demoMaturityData: MaturityAssessment = {
  id: 'maturity-demo-001',
  project_id: 'proj-demo-001',
  dimension_scores: [
    {
      dimension: 'policy_standards',
      level: 3,
      score: 62,
      subscores: { documentation: 75, implementation: 60, enforcement: 55, measurement: 50, improvement: 70 },
      key_gap: 'Enforcement mechanisms not consistently applied across departments',
    },
    {
      dimension: 'risk_management',
      level: 2,
      score: 45,
      subscores: { documentation: 55, implementation: 40, enforcement: 35, measurement: 45, improvement: 50 },
      key_gap: 'No formal AI-specific risk assessment process in place',
    },
    {
      dimension: 'data_governance',
      level: 3,
      score: 58,
      subscores: { documentation: 70, implementation: 55, enforcement: 50, measurement: 55, improvement: 60 },
      key_gap: 'Data lineage tracking incomplete for AI training data',
    },
    {
      dimension: 'access_controls',
      level: 4,
      score: 78,
      subscores: { documentation: 85, implementation: 80, enforcement: 75, measurement: 70, improvement: 80 },
      key_gap: 'Periodic access reviews for AI model endpoints not automated',
    },
    {
      dimension: 'vendor_management',
      level: 2,
      score: 40,
      subscores: { documentation: 50, implementation: 35, enforcement: 30, measurement: 40, improvement: 45 },
      key_gap: 'No standardized AI vendor assessment criteria defined',
    },
    {
      dimension: 'training_awareness',
      level: 2,
      score: 42,
      subscores: { documentation: 50, implementation: 40, enforcement: 35, measurement: 40, improvement: 45 },
      key_gap: 'AI ethics training not yet rolled out to all staff',
    },
  ] satisfies MaturityDimensionScore[],
  overall_score: 54,
  overall_level: 3,
  industry: 'technology',
  created_at: '2025-06-01T10:00:00Z',
  updated_at: '2025-06-15T14:30:00Z',
};

/**
 * GET /api/maturity
 * Fetch maturity assessment for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<MaturityAssessment | null>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoMaturityData });
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
      .from('maturity_assessments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch maturity assessment', message: error.message },
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
 * POST /api/maturity
 * Create or update a maturity assessment for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<MaturityAssessment>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `maturity-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          dimension_scores: body.dimension_scores ?? demoMaturityData.dimension_scores,
          overall_score: body.overall_score ?? 54,
          overall_level: body.overall_level ?? 3,
          industry: body.industry ?? null,
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
    const parsed = maturityPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('maturity_assessments')
      .upsert(
        {
          project_id: parsed.data.project_id,
          dimension_scores: parsed.data.dimension_scores,
          overall_score: parsed.data.overall_score,
          overall_level: parsed.data.overall_level,
          industry: parsed.data.industry ?? null,
          updated_at: now,
        },
        { onConflict: 'project_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save maturity assessment', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
