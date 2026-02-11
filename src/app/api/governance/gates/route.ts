import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, GateReview } from '@/types';

const createGateReviewSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  gate_number: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  status: z.enum(['pending', 'in_review', 'approved', 'rejected']).default('pending'),
  evidence: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/governance/gates
 * Fetch gate reviews for a project. Requires ?projectId= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GateReview[]>>> {
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
      .from('gate_reviews')
      .select('*')
      .eq('project_id', projectId)
      .order('gate_number', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch gate reviews', message: error.message },
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
 * POST /api/governance/gates
 * Create a new gate review for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<GateReview>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `gate-${Date.now()}`,
          project_id: body.project_id ?? '',
          gate_number: body.gate_number ?? 1,
          status: body.status ?? 'pending',
          evidence_checklist: [],
          approvers: [],
          notes: body.notes ?? null,
          reviewed_at: null,
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
    const parsed = createGateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: parsed.error.flatten().fieldErrors.toString() },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: gateReview, error } = await supabase
      .from('gate_reviews')
      .insert({
        project_id: parsed.data.project_id,
        gate_number: parsed.data.gate_number,
        status: parsed.data.status,
        evidence_checklist: [],
        approvers: [],
        notes: parsed.data.notes ?? null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create gate review', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: gateReview }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
