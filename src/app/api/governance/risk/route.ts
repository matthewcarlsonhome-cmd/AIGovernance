import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, RiskClassification } from '@/types';

const createRiskSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Title is required').max(500),
  category: z.string().min(1, 'Category is required'),
  likelihood: z.string().min(1, 'Likelihood is required'),
  impact: z.string().min(1, 'Impact is required'),
  tier: z.string().min(1, 'Tier is required'),
  mitigation: z.string().optional(),
});

/**
 * GET /api/governance/risk
 * Fetch risk classifications for a project. Requires ?projectId= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<RiskClassification[]>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: [] });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'projectId query parameter is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('risk_classifications')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch risk classifications', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * POST /api/governance/risk
 * Create a new risk classification for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<RiskClassification>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `risk-${Date.now()}`,
          project_id: body.project_id ?? '',
          category: body.category ?? '',
          description: body.title ?? '',
          tier: body.tier ?? 'medium',
          likelihood: Number(body.likelihood) || 0,
          impact: Number(body.impact) || 0,
          mitigation: body.mitigation ?? '',
          owner: null,
          status: 'open',
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
    const parsed = createRiskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: parsed.error.flatten().fieldErrors.toString() },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: risk, error } = await supabase
      .from('risk_classifications')
      .insert({
        project_id: parsed.data.project_id,
        category: parsed.data.category,
        description: parsed.data.title,
        tier: parsed.data.tier,
        likelihood: Number(parsed.data.likelihood),
        impact: Number(parsed.data.impact),
        mitigation: parsed.data.mitigation ?? '',
        status: 'open',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create risk classification', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: risk }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
