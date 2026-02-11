import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, EthicsReview } from '@/types';

const ethicsPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  system_name: z.string().min(1, 'System name is required'),
  system_purpose: z.string().min(1, 'System purpose is required'),
  risk_classification: z.enum(['critical', 'high', 'medium', 'low']),
  bias_assessments: z.array(z.object({
    type: z.enum(['historical', 'representation', 'measurement', 'aggregation', 'evaluation']),
    risk_level: z.enum(['critical', 'high', 'medium', 'low']),
    evidence: z.string(),
    mitigation: z.string(),
  })),
  fairness_metrics: z.array(z.object({
    type: z.enum(['demographic_parity', 'equalized_odds', 'predictive_parity', 'individual_fairness']),
    target: z.string(),
    current: z.string().nullable(),
    status: z.enum(['compliant', 'partial', 'non_compliant', 'needs_review', 'not_applicable']),
  })),
  privacy_items: z.array(z.object({
    id: z.string(),
    data_type: z.string(),
    purpose: z.string(),
    legal_basis: z.string(),
    retention: z.string(),
    access: z.string(),
    risk_level: z.enum(['critical', 'high', 'medium', 'low']),
  })),
  transparency_level: z.enum(['black_box', 'interpretable', 'explainable']),
  human_oversight_controls: z.array(z.string()),
  recommendations: z.array(z.string()),
});

const demoEthicsData: EthicsReview = {
  id: 'ethics-demo-001',
  project_id: 'proj-demo-001',
  system_name: 'AI Code Review Assistant',
  system_purpose: 'Automated code review and vulnerability detection for engineering teams',
  risk_classification: 'medium',
  bias_assessments: [
    {
      type: 'historical',
      risk_level: 'medium',
      evidence: 'Training data primarily from open-source repos which skew toward certain coding styles',
      mitigation: 'Diversify training data sources and include internal codebase samples',
    },
    {
      type: 'representation',
      risk_level: 'low',
      evidence: 'Model covers major programming languages used in org',
      mitigation: 'Monitor for language-specific performance gaps quarterly',
    },
  ],
  fairness_metrics: [
    {
      type: 'demographic_parity',
      target: 'Equal false-positive rate across team members',
      current: '0.92 consistency score',
      status: 'compliant',
    },
    {
      type: 'individual_fairness',
      target: 'Similar code patterns receive similar review outcomes',
      current: null,
      status: 'needs_review',
    },
  ],
  privacy_items: [
    {
      id: 'pi-001',
      data_type: 'Source code',
      purpose: 'Code quality analysis and vulnerability detection',
      legal_basis: 'Legitimate interest',
      retention: '90 days',
      access: 'Engineering team leads and security',
      risk_level: 'medium',
    },
    {
      id: 'pi-002',
      data_type: 'Developer metadata',
      purpose: 'Attribution and review assignment',
      legal_basis: 'Contractual obligation',
      retention: '1 year',
      access: 'Engineering managers',
      risk_level: 'low',
    },
  ],
  transparency_level: 'explainable',
  human_oversight_controls: [
    'All AI suggestions require human approval before merge',
    'Weekly review of false positive/negative rates',
    'Escalation path for disputed AI recommendations',
  ],
  recommendations: [
    'Establish quarterly bias audits for the code review model',
    'Implement individual fairness testing before next release',
    'Add transparency reports for developer-facing AI decisions',
  ],
  created_at: '2025-06-01T10:00:00Z',
  updated_at: '2025-06-12T09:15:00Z',
};

/**
 * GET /api/ethics
 * Fetch ethics review for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<EthicsReview | null>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoEthicsData });
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
      .from('ethics_reviews')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch ethics review', message: error.message },
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
 * POST /api/ethics
 * Create or update an ethics review for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<EthicsReview>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `ethics-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          system_name: body.system_name ?? 'AI Code Review Assistant',
          system_purpose: body.system_purpose ?? 'Automated code review',
          risk_classification: body.risk_classification ?? 'medium',
          bias_assessments: body.bias_assessments ?? [],
          fairness_metrics: body.fairness_metrics ?? [],
          privacy_items: body.privacy_items ?? [],
          transparency_level: body.transparency_level ?? 'explainable',
          human_oversight_controls: body.human_oversight_controls ?? [],
          recommendations: body.recommendations ?? [],
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
    const parsed = ethicsPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('ethics_reviews')
      .upsert(
        {
          project_id: parsed.data.project_id,
          system_name: parsed.data.system_name,
          system_purpose: parsed.data.system_purpose,
          risk_classification: parsed.data.risk_classification,
          bias_assessments: parsed.data.bias_assessments,
          fairness_metrics: parsed.data.fairness_metrics,
          privacy_items: parsed.data.privacy_items,
          transparency_level: parsed.data.transparency_level,
          human_oversight_controls: parsed.data.human_oversight_controls,
          recommendations: parsed.data.recommendations,
          updated_at: now,
        },
        { onConflict: 'project_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save ethics review', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
