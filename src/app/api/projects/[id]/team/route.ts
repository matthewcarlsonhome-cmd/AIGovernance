import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, TeamMember, UserRole } from '@/types';

/* ------------------------------------------------------------------ */
/*  Zod Schemas                                                        */
/* ------------------------------------------------------------------ */

const addMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID').optional(),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(1, 'Name is required').max(255),
  role: z.enum(['admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing']),
}).refine(
  (data) => data.user_id || data.email,
  { message: 'Either user_id or email must be provided' },
);

const removeMemberSchema = z.object({
  member_id: z.string().uuid('Invalid member ID'),
});

/* ------------------------------------------------------------------ */
/*  Route Context                                                      */
/* ------------------------------------------------------------------ */

type RouteContext = { params: Promise<{ id: string }> };

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

function getDemoTeamMembers(projectId: string): TeamMember[] {
  return [
    {
      id: 'tm-001',
      user_id: 'usr-001',
      project_id: projectId,
      role: 'admin' as UserRole,
      user: {
        id: 'usr-001',
        email: 'sarah.chen@acme.com',
        full_name: 'Sarah Chen',
        role: 'admin' as UserRole,
        organization_id: 'org-001',
        avatar_url: null,
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-01-15T09:00:00Z',
      },
      created_at: '2025-01-15T09:00:00Z',
    },
    {
      id: 'tm-002',
      user_id: 'usr-002',
      project_id: projectId,
      role: 'consultant' as UserRole,
      user: {
        id: 'usr-002',
        email: 'james.wilson@acme.com',
        full_name: 'James Wilson',
        role: 'consultant' as UserRole,
        organization_id: 'org-001',
        avatar_url: null,
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-01-15T09:00:00Z',
      },
      created_at: '2025-01-16T10:30:00Z',
    },
    {
      id: 'tm-003',
      user_id: 'usr-003',
      project_id: projectId,
      role: 'executive' as UserRole,
      user: {
        id: 'usr-003',
        email: 'maria.garcia@acme.com',
        full_name: 'Maria Garcia',
        role: 'executive' as UserRole,
        organization_id: 'org-001',
        avatar_url: null,
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-01-15T09:00:00Z',
      },
      created_at: '2025-01-17T14:00:00Z',
    },
    {
      id: 'tm-004',
      user_id: 'usr-004',
      project_id: projectId,
      role: 'it' as UserRole,
      user: {
        id: 'usr-004',
        email: 'david.park@acme.com',
        full_name: 'David Park',
        role: 'it' as UserRole,
        organization_id: 'org-001',
        avatar_url: null,
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-01-15T09:00:00Z',
      },
      created_at: '2025-01-18T08:15:00Z',
    },
    {
      id: 'tm-005',
      user_id: 'usr-005',
      project_id: projectId,
      role: 'legal' as UserRole,
      user: {
        id: 'usr-005',
        email: 'emily.thompson@acme.com',
        full_name: 'Emily Thompson',
        role: 'legal' as UserRole,
        organization_id: 'org-001',
        avatar_url: null,
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-01-15T09:00:00Z',
      },
      created_at: '2025-01-19T11:45:00Z',
    },
    {
      id: 'tm-006',
      user_id: 'usr-006',
      project_id: projectId,
      role: 'engineering' as UserRole,
      user: {
        id: 'usr-006',
        email: 'alex.kumar@acme.com',
        full_name: 'Alex Kumar',
        role: 'engineering' as UserRole,
        organization_id: 'org-001',
        avatar_url: null,
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-01-15T09:00:00Z',
      },
      created_at: '2025-01-20T09:30:00Z',
    },
    {
      id: 'tm-007',
      user_id: 'usr-007',
      project_id: projectId,
      role: 'marketing' as UserRole,
      user: {
        id: 'usr-007',
        email: 'rachel.martinez@acme.com',
        full_name: 'Rachel Martinez',
        role: 'marketing' as UserRole,
        organization_id: 'org-001',
        avatar_url: null,
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-01-15T09:00:00Z',
      },
      created_at: '2025-01-21T13:00:00Z',
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  GET /api/projects/[id]/team                                        */
/*  List team members for a project.                                   */
/* ------------------------------------------------------------------ */

export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<TeamMember[]>>> {
  try {
    const { id: projectId } = await context.params;

    // Demo mode: return hardcoded team data
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: getDemoTeamMembers(projectId) });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('team_members')
      .select('*, user:users(*)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch team members', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/projects/[id]/team                                       */
/*  Add a team member to a project.                                    */
/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<TeamMember>>> {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    const parsed = addMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return a mock created member
    if (!isServerSupabaseConfigured()) {
      const now = new Date().toISOString();
      const demoMember: TeamMember = {
        id: `tm-${Date.now()}`,
        user_id: parsed.data.user_id ?? `usr-${Date.now()}`,
        project_id: projectId,
        role: parsed.data.role,
        user: {
          id: parsed.data.user_id ?? `usr-${Date.now()}`,
          email: parsed.data.email ?? `${parsed.data.name.toLowerCase().replace(/\s+/g, '.')}@demo.com`,
          full_name: parsed.data.name,
          role: parsed.data.role,
          organization_id: 'org-001',
          avatar_url: null,
          created_at: now,
          updated_at: now,
        },
        created_at: now,
      };
      return NextResponse.json({ data: demoMember }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve user_id from email if not directly provided
    let resolvedUserId = parsed.data.user_id;
    if (!resolvedUserId && parsed.data.email) {
      const { data: foundUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', parsed.data.email)
        .single();

      if (!foundUser) {
        return NextResponse.json(
          { error: 'User not found', message: `No user found with email ${parsed.data.email}` },
          { status: 404 },
        );
      }
      resolvedUserId = foundUser.id;
    }

    if (!resolvedUserId) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Could not resolve user. Provide a valid user_id or email.' },
        { status: 400 },
      );
    }

    // Check for duplicate membership
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', resolvedUserId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Duplicate member', message: 'This user is already a member of the project' },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const { data: member, error } = await supabase
      .from('team_members')
      .insert({
        project_id: projectId,
        user_id: resolvedUserId,
        role: parsed.data.role,
        created_at: now,
      })
      .select('*, user:users(*)')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to add team member', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/projects/[id]/team                                     */
/*  Remove a team member from a project.                               */
/* ------------------------------------------------------------------ */

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    const parsed = removeMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return success
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: { deleted: true } });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', parsed.data.member_id)
      .eq('project_id', projectId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove team member', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
