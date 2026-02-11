import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, Project } from '@/types';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-demo-001',
    name: 'Enterprise AI Coding Pilot',
    description: 'Evaluate Claude Code and OpenAI Codex for enterprise-wide adoption across engineering teams. Includes sandbox setup, security review, and 8-week pilot with 3 teams.',
    organization_id: 'org-demo-001',
    status: 'sandbox',
    feasibility_score: 74,
    start_date: '2025-06-01T00:00:00Z',
    target_end_date: '2025-12-31T00:00:00Z',
    created_at: '2025-06-01T09:00:00Z',
    updated_at: '2025-07-20T14:30:00Z',
  },
  {
    id: 'proj-demo-002',
    name: 'Legal Document Assistant',
    description: 'Deploy AI coding assistant for legal tech team to automate contract template generation and clause extraction workflows.',
    organization_id: 'org-demo-001',
    status: 'governance',
    feasibility_score: 58,
    start_date: '2025-07-15T00:00:00Z',
    target_end_date: '2026-03-31T00:00:00Z',
    created_at: '2025-07-15T10:00:00Z',
    updated_at: '2025-08-01T11:00:00Z',
  },
  {
    id: 'proj-demo-003',
    name: 'DevOps Automation PoC',
    description: 'Proof of concept for using AI coding agents to generate Terraform modules, CI/CD pipelines, and infrastructure-as-code templates.',
    organization_id: 'org-demo-001',
    status: 'discovery',
    feasibility_score: null,
    start_date: '2025-08-01T00:00:00Z',
    target_end_date: null,
    created_at: '2025-08-01T08:00:00Z',
    updated_at: '2025-08-05T16:00:00Z',
  },
];

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().max(2000).optional().default(''),
  organization_id: z.string().uuid('Invalid organization ID').optional(),
  status: z
    .enum(['discovery', 'governance', 'sandbox', 'pilot', 'evaluation', 'production', 'completed'])
    .optional()
    .default('discovery'),
  start_date: z.string().datetime().optional().nullable(),
  target_end_date: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/projects
 * List all projects for the authenticated user's organization.
 * Supports optional query params: ?status=discovery&limit=20&offset=0
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Project[]>>> {
  try {
    // Demo mode: return hardcoded projects when Supabase is not configured
    if (!isServerSupabaseConfigured()) {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const filtered = status
        ? DEMO_PROJECTS.filter((p) => p.status === status)
        : DEMO_PROJECTS;
      return NextResponse.json({ data: filtered });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // First try with deleted_at filter; fall back to without it if column doesn't exist
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    let { data, error } = await query;

    // If the query failed (e.g., table doesn't exist), log and return error
    if (error) {
      console.error('[GET /api/projects] Supabase error:', error.message, error.code);
      return NextResponse.json(
        { error: 'Failed to fetch projects', message: error.message },
        { status: 500 },
      );
    }

    // Filter out soft-deleted projects in JS if deleted_at column exists
    if (data && data.length > 0 && 'deleted_at' in data[0]) {
      data = data.filter((p: Record<string, unknown>) => p.deleted_at == null);
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * POST /api/projects
 * Create a new project within an organization.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return a mock created project
    if (!isServerSupabaseConfigured()) {
      const now = new Date().toISOString();
      const demoProject: Project = {
        id: `proj-demo-${Date.now()}`,
        name: parsed.data.name,
        description: parsed.data.description || '',
        organization_id: parsed.data.organization_id ?? 'org-demo-001',
        status: parsed.data.status ?? 'discovery',
        feasibility_score: null,
        start_date: parsed.data.start_date ?? null,
        target_end_date: parsed.data.target_end_date ?? null,
        created_at: now,
        updated_at: now,
      };
      return NextResponse.json({ data: demoProject }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve organization_id: use provided value, or look up from user profile
    let organizationId = parsed.data.organization_id;
    if (!organizationId) {
      const { data: userProfile, error: profileErr } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      if (profileErr) {
        console.error('[POST /api/projects] User profile lookup failed:', profileErr.message);
      }
      organizationId = userProfile?.organization_id ?? undefined;
    }

    // If still no org, try to find any organization the user has access to
    if (!organizationId) {
      const { data: orgs, error: orgErr } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single();
      if (orgErr) {
        console.error('[POST /api/projects] Org lookup failed:', orgErr.message);
      }
      organizationId = orgs?.id ?? undefined;
    }

    // Build insert payload — only include columns we know exist
    const insertPayload: Record<string, unknown> = {
      name: parsed.data.name,
      description: parsed.data.description || '',
      status: parsed.data.status,
    };
    if (organizationId) {
      insertPayload.organization_id = organizationId;
    }
    if (parsed.data.start_date !== undefined) {
      insertPayload.start_date = parsed.data.start_date ?? null;
    }
    if (parsed.data.target_end_date !== undefined) {
      insertPayload.target_end_date = parsed.data.target_end_date ?? null;
    }

    const { data: created, error } = await supabase
      .from('projects')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[POST /api/projects] Insert failed:', error.message, error.code, error.details);
      return NextResponse.json(
        { error: 'Failed to create project', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
