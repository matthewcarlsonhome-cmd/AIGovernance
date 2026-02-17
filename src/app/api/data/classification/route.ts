import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, DataAssetRecord, DataClassificationLevel } from '@/types';

const createDataAssetSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  type: z.enum(['database', 'data_lake', 'api', 'file_system', 'streaming', 'feature_store', 'document', 'spreadsheet']),
  domain: z.string().min(1),
  owner_name: z.string().optional(),
  classification: z.enum(['public', 'internal', 'confidential', 'restricted']),
  lawful_basis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interest', 'public_task', 'legitimate_interest']).optional(),
  retention_period: z.enum(['30_days', '90_days', '1_year', '3_years', '7_years', 'indefinite']).optional(),
  source_system: z.string().optional(),
  contains_pii: z.boolean(),
  pii_types: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Demo data returned when Supabase is not configured
// ---------------------------------------------------------------------------

const DEMO_DATA_ASSETS: DataAssetRecord[] = [
  {
    id: 'da-001',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Customer CRM Database',
    description: 'Primary customer relationship management database containing contact information, interaction history, and account details.',
    type: 'database',
    domain: 'Sales',
    owner_id: 'user-001',
    owner_name: 'Sarah Chen',
    classification: 'confidential',
    lawful_basis: 'contract',
    retention_period: '3_years',
    retention_expires_at: null,
    source_system: 'Salesforce',
    contains_pii: true,
    pii_types: ['email', 'phone', 'name', 'address'],
    ai_relevance: 'inference',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-15T10:30:00Z',
    created_by: 'user-001',
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2025-11-15T10:30:00Z',
    deleted_at: null,
  },
  {
    id: 'da-002',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Product Analytics Data Lake',
    description: 'Aggregated product usage analytics and telemetry data used for feature adoption analysis.',
    type: 'data_lake',
    domain: 'Product',
    owner_id: 'user-002',
    owner_name: 'Marcus Rivera',
    classification: 'internal',
    lawful_basis: 'legitimate_interest',
    retention_period: '1_year',
    retention_expires_at: null,
    source_system: 'Snowflake',
    contains_pii: false,
    pii_types: [],
    ai_relevance: 'training',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-10T14:00:00Z',
    created_by: 'user-002',
    created_at: '2025-09-20T12:00:00Z',
    updated_at: '2025-11-10T14:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-003',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Employee HR Records',
    description: 'Human resources records including payroll, performance reviews, and personal employee information.',
    type: 'database',
    domain: 'Human Resources',
    owner_id: 'user-004',
    owner_name: 'Lisa Park',
    classification: 'restricted',
    lawful_basis: 'legal_obligation',
    retention_period: '7_years',
    retention_expires_at: null,
    source_system: 'Workday',
    contains_pii: true,
    pii_types: ['ssn', 'name', 'address', 'salary', 'date_of_birth'],
    ai_relevance: 'none',
    approved: true,
    approved_by: 'user-005',
    approved_at: '2025-10-20T09:00:00Z',
    created_by: 'user-004',
    created_at: '2025-08-15T10:00:00Z',
    updated_at: '2025-10-20T09:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-004',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Public Marketing Content',
    description: 'Published marketing materials, blog posts, and public-facing documentation.',
    type: 'document',
    domain: 'Marketing',
    owner_id: 'user-006',
    owner_name: 'James Wu',
    classification: 'public',
    lawful_basis: null,
    retention_period: 'indefinite',
    retention_expires_at: null,
    source_system: 'Contentful',
    contains_pii: false,
    pii_types: [],
    ai_relevance: 'training',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-01T16:00:00Z',
    created_by: 'user-006',
    created_at: '2025-10-05T11:00:00Z',
    updated_at: '2025-11-01T16:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-005',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Financial Transaction Logs',
    description: 'Real-time transaction processing logs from the payment system, containing payment details and audit trails.',
    type: 'streaming',
    domain: 'Finance',
    owner_id: 'user-007',
    owner_name: 'Priya Sharma',
    classification: 'restricted',
    lawful_basis: 'legal_obligation',
    retention_period: '7_years',
    retention_expires_at: null,
    source_system: 'Stripe / Kafka',
    contains_pii: true,
    pii_types: ['payment_card', 'email', 'name', 'billing_address'],
    ai_relevance: 'none',
    approved: false,
    approved_by: null,
    approved_at: null,
    created_by: 'user-007',
    created_at: '2025-11-20T08:00:00Z',
    updated_at: '2025-11-20T08:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-006',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Internal API Gateway Logs',
    description: 'API request/response logs from the internal gateway used for debugging and performance monitoring.',
    type: 'api',
    domain: 'Engineering',
    owner_id: 'user-008',
    owner_name: 'Alex Kim',
    classification: 'internal',
    lawful_basis: 'legitimate_interest',
    retention_period: '90_days',
    retention_expires_at: null,
    source_system: 'Kong Gateway',
    contains_pii: false,
    pii_types: [],
    ai_relevance: 'inference',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-18T11:00:00Z',
    created_by: 'user-008',
    created_at: '2025-11-12T09:00:00Z',
    updated_at: '2025-11-18T11:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-007',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Customer Support Tickets',
    description: 'Support ticket data including customer communications, issue details, and resolution notes.',
    type: 'database',
    domain: 'Support',
    owner_id: 'user-009',
    owner_name: 'Rachel Torres',
    classification: 'confidential',
    lawful_basis: 'contract',
    retention_period: '3_years',
    retention_expires_at: null,
    source_system: 'Zendesk',
    contains_pii: true,
    pii_types: ['email', 'name', 'phone'],
    ai_relevance: 'both',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-14T13:00:00Z',
    created_by: 'user-009',
    created_at: '2025-10-28T10:00:00Z',
    updated_at: '2025-11-14T13:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-008',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Quarterly Revenue Spreadsheet',
    description: 'Executive-level revenue summaries and forecasts maintained in spreadsheets for board reporting.',
    type: 'spreadsheet',
    domain: 'Finance',
    owner_id: 'user-010',
    owner_name: 'Tom Bradley',
    classification: 'confidential',
    lawful_basis: null,
    retention_period: '3_years',
    retention_expires_at: null,
    source_system: 'Google Sheets',
    contains_pii: false,
    pii_types: [],
    ai_relevance: 'none',
    approved: false,
    approved_by: null,
    approved_at: null,
    created_by: 'user-010',
    created_at: '2025-12-01T15:00:00Z',
    updated_at: '2025-12-01T15:00:00Z',
    deleted_at: null,
  },
];

/**
 * GET /api/data/classification
 * List data assets for a project. Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DataAssetRecord[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: project_id' },
        { status: 400 },
      );
    }

    // Demo mode -- return hardcoded data
    if (!isServerSupabaseConfigured()) {
      const filtered = DEMO_DATA_ASSETS.filter((a) => a.deleted_at === null);
      return NextResponse.json({ data: filtered });
    }

    // Authenticated flow
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('data_asset_records')
      .select('*')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch data assets', message: error.message },
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
 * POST /api/data/classification
 * Create a new data asset classification record.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<DataAssetRecord>>> {
  try {
    const body = await request.json();

    // Demo mode -- return a synthetic record
    if (!isServerSupabaseConfigured()) {
      const parsed = createDataAssetSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', message: parsed.error.flatten().fieldErrors as unknown as string },
          { status: 400 },
        );
      }
      const now = new Date().toISOString();
      const demoRecord: DataAssetRecord = {
        id: `da-demo-${Date.now()}`,
        project_id: parsed.data.project_id,
        organization_id: 'org-demo-001',
        name: parsed.data.name,
        description: parsed.data.description,
        type: parsed.data.type,
        domain: parsed.data.domain,
        owner_id: null,
        owner_name: parsed.data.owner_name ?? null,
        classification: parsed.data.classification,
        lawful_basis: parsed.data.lawful_basis ?? null,
        retention_period: parsed.data.retention_period ?? null,
        retention_expires_at: null,
        source_system: parsed.data.source_system ?? null,
        contains_pii: parsed.data.contains_pii,
        pii_types: parsed.data.pii_types ?? [],
        ai_relevance: 'none',
        approved: false,
        approved_by: null,
        approved_at: null,
        created_by: 'demo-user',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      return NextResponse.json({ data: demoRecord }, { status: 201 });
    }

    // Authenticated flow
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = createDataAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: parsed.error.flatten().fieldErrors as unknown as string },
        { status: 400 },
      );
    }

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', parsed.data.project_id)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', message: 'The specified project does not exist or has been deleted' },
        { status: 404 },
      );
    }

    const { data: saved, error: saveError } = await supabase
      .from('data_asset_records')
      .insert({
        project_id: parsed.data.project_id,
        organization_id: project.organization_id,
        name: parsed.data.name,
        description: parsed.data.description,
        type: parsed.data.type,
        domain: parsed.data.domain,
        owner_name: parsed.data.owner_name ?? null,
        classification: parsed.data.classification,
        lawful_basis: parsed.data.lawful_basis ?? null,
        retention_period: parsed.data.retention_period ?? null,
        source_system: parsed.data.source_system ?? null,
        contains_pii: parsed.data.contains_pii,
        pii_types: parsed.data.pii_types ?? [],
        created_by: user.id,
      })
      .select()
      .single();

    if (saveError) {
      return NextResponse.json(
        { error: 'Failed to create data asset', message: saveError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
