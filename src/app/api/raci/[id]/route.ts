import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse, RaciEntry, RaciMatrix } from '@/types';

const raciEntrySchema = z.object({
  task_name: z.string().min(1, 'Task name is required').max(500),
  task_id: z.string().uuid().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  user_name: z.string().min(1, 'User name is required').max(255),
  assignment: z.enum(['R', 'A', 'C', 'I']),
});

const updateEntriesSchema = z.object({
  entries: z.array(raciEntrySchema).min(1, 'At least one RACI entry is required'),
});

interface RaciMatrixWithEntries extends RaciMatrix {
  entries: RaciEntry[];
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/raci/[id]
 * Fetch a single RACI matrix with all its entries.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<RaciMatrixWithEntries>>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the matrix
    const { data: matrix, error: matrixError } = await supabase
      .from('raci_matrices')
      .select('*')
      .eq('id', id)
      .single();

    if (matrixError) {
      return NextResponse.json(
        { error: 'RACI matrix not found', message: matrixError.message },
        { status: 404 },
      );
    }

    // Fetch the entries
    const { data: entries, error: entriesError } = await supabase
      .from('raci_entries')
      .select('*')
      .eq('matrix_id', id)
      .order('task_name', { ascending: true })
      .order('user_name', { ascending: true });

    if (entriesError) {
      return NextResponse.json(
        { error: 'Failed to fetch RACI entries', message: entriesError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        ...matrix,
        entries: entries ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * PUT /api/raci/[id]
 * Update RACI entries for a matrix. Replaces all existing entries
 * with the provided set (full replacement strategy).
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<RaciMatrixWithEntries>>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateEntriesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Verify the matrix exists
    const { data: matrix, error: matrixError } = await supabase
      .from('raci_matrices')
      .select('*')
      .eq('id', id)
      .single();

    if (matrixError || !matrix) {
      return NextResponse.json(
        { error: 'RACI matrix not found', message: 'The specified RACI matrix does not exist' },
        { status: 404 },
      );
    }

    // Delete existing entries for this matrix
    const { error: deleteError } = await supabase
      .from('raci_entries')
      .delete()
      .eq('matrix_id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to clear existing entries', message: deleteError.message },
        { status: 500 },
      );
    }

    // Insert the new entries
    const now = new Date().toISOString();
    const entriesToInsert = parsed.data.entries.map((entry) => ({
      matrix_id: id,
      task_name: entry.task_name,
      task_id: entry.task_id ?? null,
      user_id: entry.user_id ?? null,
      user_name: entry.user_name,
      assignment: entry.assignment,
      created_at: now,
      updated_at: now,
    }));

    const { data: entries, error: insertError } = await supabase
      .from('raci_entries')
      .insert(entriesToInsert)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save RACI entries', message: insertError.message },
        { status: 500 },
      );
    }

    // Update the matrix timestamp
    await supabase
      .from('raci_matrices')
      .update({ updated_at: now })
      .eq('id', id);

    return NextResponse.json({
      data: {
        ...matrix,
        updated_at: now,
        entries: entries ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * DELETE /api/raci/[id]
 * Delete a RACI matrix and all its entries.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all entries first
    const { error: entriesError } = await supabase
      .from('raci_entries')
      .delete()
      .eq('matrix_id', id);

    if (entriesError) {
      return NextResponse.json(
        { error: 'Failed to delete RACI entries', message: entriesError.message },
        { status: 500 },
      );
    }

    // Delete the matrix
    const { error } = await supabase
      .from('raci_matrices')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete RACI matrix', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
