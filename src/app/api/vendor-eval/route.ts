import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, VendorEvaluation } from '@/types';

const vendorEvalPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  vendor_name: z.string().min(1, 'Vendor name is required'),
  dimension_scores: z.array(z.object({
    dimension: z.enum(['capabilities', 'security', 'compliance', 'integration', 'economics', 'viability', 'support']),
    score: z.number().min(0).max(100),
    max_score: z.number().min(0).max(100),
    notes: z.string(),
  })),
  overall_score: z.number().min(0).max(100),
  recommendation: z.enum(['recommended', 'alternative', 'not_recommended']),
  red_flags: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  tco_estimate: z.number().nullable().optional(),
});

const demoVendorData: VendorEvaluation[] = [
  {
    id: 'vendor-demo-001',
    project_id: 'proj-demo-001',
    vendor_name: 'Anthropic Claude',
    dimension_scores: [
      { dimension: 'capabilities', score: 92, max_score: 100, notes: 'Strong code generation, reasoning, and multi-file editing' },
      { dimension: 'security', score: 88, max_score: 100, notes: 'SOC2 Type II, zero-retention option, enterprise SSO' },
      { dimension: 'compliance', score: 85, max_score: 100, notes: 'GDPR-ready, data processing addendum available' },
      { dimension: 'integration', score: 80, max_score: 100, notes: 'CLI-native, IDE extensions, API access' },
      { dimension: 'economics', score: 75, max_score: 100, notes: 'Usage-based pricing, volume discounts available' },
      { dimension: 'viability', score: 90, max_score: 100, notes: 'Well-funded, strong market position, growing enterprise adoption' },
      { dimension: 'support', score: 82, max_score: 100, notes: 'Enterprise support tier, dedicated CSM for large accounts' },
    ],
    overall_score: 85,
    recommendation: 'recommended',
    red_flags: [],
    strengths: [
      'Best-in-class code reasoning and generation quality',
      'Strong security posture with zero-retention API option',
      'Active enterprise feature development',
    ],
    weaknesses: [
      'Higher per-token cost compared to some alternatives',
      'Fewer IDE integrations than some competitors',
    ],
    tco_estimate: 180000,
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-10T15:30:00Z',
  },
  {
    id: 'vendor-demo-002',
    project_id: 'proj-demo-001',
    vendor_name: 'OpenAI Codex',
    dimension_scores: [
      { dimension: 'capabilities', score: 88, max_score: 100, notes: 'Strong code generation, wide language support' },
      { dimension: 'security', score: 80, max_score: 100, notes: 'SOC2 Type II, enterprise data handling policies' },
      { dimension: 'compliance', score: 78, max_score: 100, notes: 'GDPR support, standard DPA terms' },
      { dimension: 'integration', score: 90, max_score: 100, notes: 'Deep VS Code integration, GitHub Copilot ecosystem' },
      { dimension: 'economics', score: 82, max_score: 100, notes: 'Competitive per-seat pricing, bundled with GitHub Enterprise' },
      { dimension: 'viability', score: 92, max_score: 100, notes: 'Market leader, Microsoft backing, largest developer adoption' },
      { dimension: 'support', score: 78, max_score: 100, notes: 'Standard enterprise support, community resources' },
    ],
    overall_score: 84,
    recommendation: 'recommended',
    red_flags: [
      'Training data opt-out process requires manual configuration per organization',
    ],
    strengths: [
      'Largest ecosystem and IDE integration depth',
      'Strong brand recognition drives developer adoption',
      'Competitive bundle pricing with GitHub Enterprise',
    ],
    weaknesses: [
      'Data handling policies less transparent than some competitors',
      'Training data opt-out not default for all tiers',
    ],
    tco_estimate: 156000,
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-10T15:30:00Z',
  },
  {
    id: 'vendor-demo-003',
    project_id: 'proj-demo-001',
    vendor_name: 'Acme AI Assistant',
    dimension_scores: [
      { dimension: 'capabilities', score: 65, max_score: 100, notes: 'Basic code completion, limited multi-file support' },
      { dimension: 'security', score: 60, max_score: 100, notes: 'SOC2 Type I only, no zero-retention option' },
      { dimension: 'compliance', score: 55, max_score: 100, notes: 'GDPR status unclear, no formal DPA available' },
      { dimension: 'integration', score: 70, max_score: 100, notes: 'VS Code only, API in beta' },
      { dimension: 'economics', score: 90, max_score: 100, notes: 'Lowest cost option, generous free tier' },
      { dimension: 'viability', score: 45, max_score: 100, notes: 'Early-stage startup, limited funding visibility' },
      { dimension: 'support', score: 50, max_score: 100, notes: 'Community-only support, no enterprise tier' },
    ],
    overall_score: 62,
    recommendation: 'not_recommended',
    red_flags: [
      'No SOC2 Type II certification',
      'No formal data processing agreement available',
      'Limited funding runway raises viability concerns',
    ],
    strengths: [
      'Most affordable pricing option',
      'Simple integration for basic use cases',
    ],
    weaknesses: [
      'Insufficient security certifications for enterprise use',
      'No enterprise support offering',
      'Limited model capabilities compared to leaders',
      'Startup viability risk',
    ],
    tco_estimate: 72000,
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-10T15:30:00Z',
  },
];

/**
 * GET /api/vendor-eval
 * Fetch vendor evaluations for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<VendorEvaluation[]>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoVendorData });
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
      .from('vendor_evaluations')
      .select('*')
      .eq('project_id', projectId)
      .order('overall_score', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch vendor evaluations', message: error.message },
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
 * POST /api/vendor-eval
 * Create a new vendor evaluation for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<VendorEvaluation>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `vendor-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          vendor_name: body.vendor_name ?? 'New Vendor',
          dimension_scores: body.dimension_scores ?? [],
          overall_score: body.overall_score ?? 0,
          recommendation: body.recommendation ?? 'not_recommended',
          red_flags: body.red_flags ?? [],
          strengths: body.strengths ?? [],
          weaknesses: body.weaknesses ?? [],
          tco_estimate: body.tco_estimate ?? null,
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
    const parsed = vendorEvalPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('vendor_evaluations')
      .insert({
        project_id: parsed.data.project_id,
        vendor_name: parsed.data.vendor_name,
        dimension_scores: parsed.data.dimension_scores,
        overall_score: parsed.data.overall_score,
        recommendation: parsed.data.recommendation,
        red_flags: parsed.data.red_flags,
        strengths: parsed.data.strengths,
        weaknesses: parsed.data.weaknesses,
        tco_estimate: parsed.data.tco_estimate ?? null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create vendor evaluation', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
