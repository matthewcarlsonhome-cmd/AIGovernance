import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, ToolEvaluation } from '@/types';

/* ------------------------------------------------------------------ */
/*  Zod Schemas                                                        */
/* ------------------------------------------------------------------ */

const querySchema = z.object({
  projectId: z.string().min(1, 'projectId query parameter is required'),
});

const createEvaluationSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  tool_name: z.string().min(1, 'Tool name is required').max(255),
  category: z.string().min(1, 'Category is required').max(255),
  score: z.number().min(0).max(100),
  notes: z.string().max(2000).optional().nullable(),
});

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/*  Categories match the tool comparison page:                         */
/*  Code Quality, Velocity Impact, Test Generation, Documentation,     */
/*  Context Understanding, Setup Complexity, Cost Efficiency            */
/* ------------------------------------------------------------------ */

function getDemoToolEvaluations(projectId: string): ToolEvaluation[] {
  return [
    // Claude Code evaluations
    {
      id: 'eval-cc-001',
      project_id: projectId,
      tool_name: 'Claude Code',
      category: 'Code Quality',
      score: 92,
      max_score: 100,
      notes: 'Excellent code quality with strong typing, clear naming, and consistent patterns.',
    },
    {
      id: 'eval-cc-002',
      project_id: projectId,
      tool_name: 'Claude Code',
      category: 'Velocity Impact',
      score: 62,
      max_score: 100,
      notes: 'Significant velocity improvement of +62% compared to baseline.',
    },
    {
      id: 'eval-cc-003',
      project_id: projectId,
      tool_name: 'Claude Code',
      category: 'Test Generation',
      score: 88,
      max_score: 100,
      notes: 'Good test coverage generation with meaningful assertions and edge cases.',
    },
    {
      id: 'eval-cc-004',
      project_id: projectId,
      tool_name: 'Claude Code',
      category: 'Documentation',
      score: 95,
      max_score: 100,
      notes: 'Outstanding documentation with JSDoc, inline comments, and architectural explanations.',
    },
    {
      id: 'eval-cc-005',
      project_id: projectId,
      tool_name: 'Claude Code',
      category: 'Context Understanding',
      score: 94,
      max_score: 100,
      notes: 'Excels at understanding project-wide context and maintaining consistency across files.',
    },
    {
      id: 'eval-cc-006',
      project_id: projectId,
      tool_name: 'Claude Code',
      category: 'Setup Complexity',
      score: 85,
      max_score: 100,
      notes: 'Straightforward setup with CLI. Requires API key configuration.',
    },
    {
      id: 'eval-cc-007',
      project_id: projectId,
      tool_name: 'Claude Code',
      category: 'Cost Efficiency',
      score: 78,
      max_score: 100,
      notes: 'Competitive token pricing. Higher cost on complex multi-file tasks.',
    },
    // OpenAI Codex evaluations
    {
      id: 'eval-ox-001',
      project_id: projectId,
      tool_name: 'OpenAI Codex',
      category: 'Code Quality',
      score: 85,
      max_score: 100,
      notes: 'Good code quality with occasional inconsistencies in styling and patterns.',
    },
    {
      id: 'eval-ox-002',
      project_id: projectId,
      tool_name: 'OpenAI Codex',
      category: 'Velocity Impact',
      score: 45,
      max_score: 100,
      notes: 'Moderate velocity improvement of +45% compared to baseline.',
    },
    {
      id: 'eval-ox-003',
      project_id: projectId,
      tool_name: 'OpenAI Codex',
      category: 'Test Generation',
      score: 91,
      max_score: 100,
      notes: 'Strong test generation with good coverage and diverse test scenarios.',
    },
    {
      id: 'eval-ox-004',
      project_id: projectId,
      tool_name: 'OpenAI Codex',
      category: 'Documentation',
      score: 78,
      max_score: 100,
      notes: 'Adequate documentation. Inline comments are sometimes sparse.',
    },
    {
      id: 'eval-ox-005',
      project_id: projectId,
      tool_name: 'OpenAI Codex',
      category: 'Context Understanding',
      score: 82,
      max_score: 100,
      notes: 'Good context understanding within single files. Cross-file awareness is limited.',
    },
    {
      id: 'eval-ox-006',
      project_id: projectId,
      tool_name: 'OpenAI Codex',
      category: 'Setup Complexity',
      score: 90,
      max_score: 100,
      notes: 'Very easy setup with IDE integration. Minimal configuration required.',
    },
    {
      id: 'eval-ox-007',
      project_id: projectId,
      tool_name: 'OpenAI Codex',
      category: 'Cost Efficiency',
      score: 82,
      max_score: 100,
      notes: 'Lower per-token cost. Good value for simpler code generation tasks.',
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  GET /api/poc/tool-evaluations?projectId=...                        */
/*  List tool evaluations for a project.                               */
/* ------------------------------------------------------------------ */

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ToolEvaluation[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      projectId: searchParams.get('projectId'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { projectId } = parsed.data;

    // Demo mode: return hardcoded evaluation data matching the compare page
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: getDemoToolEvaluations(projectId) });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('tool_evaluations')
      .select('*')
      .eq('project_id', projectId)
      .order('category', { ascending: true })
      .order('tool_name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch tool evaluations', message: error.message },
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
/*  POST /api/poc/tool-evaluations                                     */
/*  Create or update a tool evaluation.                                */
/*  Upserts on (project_id, tool_name, category).                     */
/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ToolEvaluation>>> {
  try {
    const body = await request.json();
    const parsed = createEvaluationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Demo mode: return the submitted data as a mock saved evaluation
    if (!isServerSupabaseConfigured()) {
      const demoEval: ToolEvaluation = {
        id: `eval-${Date.now()}`,
        project_id: parsed.data.project_id,
        tool_name: parsed.data.tool_name,
        category: parsed.data.category,
        score: parsed.data.score,
        max_score: 100,
        notes: parsed.data.notes ?? null,
      };
      return NextResponse.json({ data: demoEval }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: evaluation, error } = await supabase
      .from('tool_evaluations')
      .upsert(
        {
          project_id: parsed.data.project_id,
          tool_name: parsed.data.tool_name,
          category: parsed.data.category,
          score: parsed.data.score,
          max_score: 100,
          notes: parsed.data.notes ?? null,
        },
        { onConflict: 'project_id,tool_name,category' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save tool evaluation', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: evaluation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
