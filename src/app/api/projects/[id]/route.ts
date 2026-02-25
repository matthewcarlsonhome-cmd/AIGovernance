import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, createServiceRoleClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, Project } from '@/types';

/* ------------------------------------------------------------------ */
/*  Demo Data (shared with /api/projects)                              */
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

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(2000).optional(),
  status: z
    .enum(['discovery', 'governance', 'sandbox', 'pilot', 'evaluation', 'production', 'completed'])
    .optional(),
  feasibility_score: z.number().min(0).max(100).optional(),
  start_date: z.string().datetime().optional().nullable(),
  target_end_date: z.string().datetime().optional().nullable(),
  actual_end_date: z.string().datetime().optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]
 * Fetch a single project by ID.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const { id } = await context.params;

    // Demo mode: find the project in hardcoded data
    if (!isServerSupabaseConfigured()) {
      const demoProject = DEMO_PROJECTS.find((p) => p.id === id);
      if (demoProject) {
        return NextResponse.json({ data: demoProject });
      }
      // For any unknown ID in demo mode, return the first demo project with the requested ID
      return NextResponse.json({
        data: { ...DEMO_PROJECTS[0], id },
      });
    }

    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await createServiceRoleClient();

    // Resolve user's organization for tenant isolation
    const { data: userProfile } = await db
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();

    const orgId = userProfile?.organization_id;

    const { data, error } = await db
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[GET /api/projects/[id]] Supabase error:', error.message, error.code);
      return NextResponse.json(
        { error: 'Project not found', message: error.message },
        { status: 404 },
      );
    }

    // Tenant isolation: verify project belongs to user's organization
    if (orgId && data?.organization_id && data.organization_id !== orgId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 },
      );
    }

    // Check for soft-deleted projects if column exists
    if (data && 'deleted_at' in data && data.deleted_at != null) {
      return NextResponse.json(
        { error: 'Project not found', message: 'This project has been deleted' },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * PUT /api/projects/[id]
 * Update a single project.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return merged update
    if (!isServerSupabaseConfigured()) {
      const existing = DEMO_PROJECTS.find((p) => p.id === id) ?? DEMO_PROJECTS[0];
      return NextResponse.json({
        data: { ...existing, ...parsed.data, id, updated_at: new Date().toISOString() },
      });
    }

    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await createServiceRoleClient();

    // Resolve user's organization for tenant isolation
    const { data: userProfile } = await db
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();

    const orgId = userProfile?.organization_id;

    // Verify project belongs to user's org before allowing update
    if (orgId) {
      const { data: existing } = await db
        .from('projects')
        .select('organization_id')
        .eq('id', id)
        .maybeSingle();

      if (existing?.organization_id && existing.organization_id !== orgId) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 },
        );
      }
    }

    const { data: updated, error } = await db
      .from('projects')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/projects/[id]] Update failed:', error.message, error.code);
      return NextResponse.json(
        { error: 'Failed to update project', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]
 * Soft-delete a project (or hard-delete if deleted_at column doesn't exist).
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { id } = await context.params;

    // Demo mode: return success
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: { deleted: true } });
    }

    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await createServiceRoleClient();

    // Resolve user's organization for tenant isolation
    const { data: userProfile } = await db
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();

    const orgId = userProfile?.organization_id;

    // Verify project belongs to user's org before allowing delete
    if (orgId) {
      const { data: existing } = await db
        .from('projects')
        .select('organization_id')
        .eq('id', id)
        .maybeSingle();

      if (existing?.organization_id && existing.organization_id !== orgId) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 },
        );
      }
    }

    // Try soft-delete first, fall back to hard-delete
    const now = new Date().toISOString();
    const { error: softErr } = await db
      .from('projects')
      .update({ deleted_at: now, updated_at: now })
      .eq('id', id);

    if (softErr) {
      // Soft-delete failed (maybe no deleted_at column), try hard delete
      console.error('[DELETE /api/projects/[id]] Soft-delete failed:', softErr.message);
      const { error: hardErr } = await db
        .from('projects')
        .delete()
        .eq('id', id);

      if (hardErr) {
        console.error('[DELETE /api/projects/[id]] Hard-delete failed:', hardErr.message);
        return NextResponse.json(
          { error: 'Failed to delete project', message: hardErr.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
