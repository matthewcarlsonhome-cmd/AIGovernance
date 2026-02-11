import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, DataFlowSystem, DataFlowRiskPoint } from '@/types';

interface DataFlowsResponse {
  systems: DataFlowSystem[];
  risk_points: DataFlowRiskPoint[];
}

const dataFlowPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  name: z.string().min(1, 'System name is required'),
  type: z.string().min(1, 'System type is required'),
  data_types: z.array(z.string()).min(1, 'At least one data type is required'),
  ai_integration: z.boolean(),
  ai_service: z.string().nullable().optional(),
  integration_type: z.enum(['direct_api', 'embedded', 'middleware', 'on_premise', 'rag_vector']).nullable().optional(),
  data_classification: z.enum(['public', 'internal', 'confidential', 'restricted']),
});

const demoSystems: DataFlowSystem[] = [
  {
    id: 'dfs-001',
    project_id: 'proj-demo-001',
    name: 'Customer CRM',
    type: 'SaaS Application',
    data_types: ['customer_pii', 'interaction_history', 'purchase_data'],
    ai_integration: true,
    ai_service: 'Claude API',
    integration_type: 'direct_api',
    data_classification: 'confidential',
    created_at: '2025-05-20T08:00:00Z',
    updated_at: '2025-06-10T12:00:00Z',
  },
  {
    id: 'dfs-002',
    project_id: 'proj-demo-001',
    name: 'Internal Code Repository',
    type: 'Version Control',
    data_types: ['source_code', 'developer_metadata', 'commit_history'],
    ai_integration: true,
    ai_service: 'Claude Code',
    integration_type: 'embedded',
    data_classification: 'internal',
    created_at: '2025-05-20T08:00:00Z',
    updated_at: '2025-06-10T12:00:00Z',
  },
  {
    id: 'dfs-003',
    project_id: 'proj-demo-001',
    name: 'HR Management System',
    type: 'On-Premises Application',
    data_types: ['employee_pii', 'compensation', 'performance_reviews'],
    ai_integration: false,
    ai_service: null,
    integration_type: null,
    data_classification: 'restricted',
    created_at: '2025-05-20T08:00:00Z',
    updated_at: '2025-06-10T12:00:00Z',
  },
];

const demoRiskPoints: DataFlowRiskPoint[] = [
  {
    id: 'drp-001',
    project_id: 'proj-demo-001',
    system_id: 'dfs-001',
    risk_description: 'Customer PII transmitted to external AI provider without encryption at rest',
    data_type: 'customer_pii',
    threat: 'Data exposure during AI processing',
    score: 8,
    current_control: 'TLS in transit only',
    recommended_control: 'Enable encryption at rest and implement data masking before API calls',
    status: 'open',
  },
  {
    id: 'drp-002',
    project_id: 'proj-demo-001',
    system_id: 'dfs-002',
    risk_description: 'Source code sent to AI service may contain embedded secrets',
    data_type: 'source_code',
    threat: 'Secret leakage via AI prompts',
    score: 7,
    current_control: 'Pre-commit hooks for secret scanning',
    recommended_control: 'Add AI-specific secret filtering layer before code submission',
    status: 'mitigated',
  },
  {
    id: 'drp-003',
    project_id: 'proj-demo-001',
    system_id: 'dfs-001',
    risk_description: 'AI model retention policies exceed data subject deletion requirements',
    data_type: 'interaction_history',
    threat: 'Regulatory non-compliance with data retention rules',
    score: 6,
    current_control: null,
    recommended_control: 'Negotiate zero-retention agreement with AI vendor and implement automated deletion workflows',
    status: 'open',
  },
];

/**
 * GET /api/data-flows
 * Fetch data flow systems and risk points for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DataFlowsResponse>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: { systems: demoSystems, risk_points: demoRiskPoints } });
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

    const [systemsResult, riskPointsResult] = await Promise.all([
      supabase
        .from('data_flow_systems')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true }),
      supabase
        .from('data_flow_risk_points')
        .select('*')
        .eq('project_id', projectId)
        .order('score', { ascending: false }),
    ]);

    if (systemsResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch data flow systems', message: systemsResult.error.message },
        { status: 500 },
      );
    }

    if (riskPointsResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch data flow risk points', message: riskPointsResult.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        systems: systemsResult.data ?? [],
        risk_points: riskPointsResult.data ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

/**
 * POST /api/data-flows
 * Create a new data flow system for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<DataFlowSystem>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `dfs-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          name: body.name ?? 'New System',
          type: body.type ?? 'SaaS Application',
          data_types: body.data_types ?? [],
          ai_integration: body.ai_integration ?? false,
          ai_service: body.ai_service ?? null,
          integration_type: body.integration_type ?? null,
          data_classification: body.data_classification ?? 'internal',
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
    const parsed = dataFlowPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('data_flow_systems')
      .insert({
        project_id: parsed.data.project_id,
        name: parsed.data.name,
        type: parsed.data.type,
        data_types: parsed.data.data_types,
        ai_integration: parsed.data.ai_integration,
        ai_service: parsed.data.ai_service ?? null,
        integration_type: parsed.data.integration_type ?? null,
        data_classification: parsed.data.data_classification,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create data flow system', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
