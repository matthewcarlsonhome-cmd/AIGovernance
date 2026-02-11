import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, ArchitectureBlueprint, ArchitectureComponent, ApiContract, InfraRequirement } from '@/types';

const architecturePostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  name: z.string().min(1, 'Blueprint name is required'),
  cloud_provider: z.string().min(1, 'Cloud provider is required'),
  components: z.array(z.object({
    id: z.string().min(1),
    layer: z.enum(['data_foundation', 'ml_platform', 'api_integration', 'infrastructure', 'mlops', 'security']),
    name: z.string().min(1),
    technology: z.string().min(1),
    description: z.string().min(1),
    cloud_provider: z.string().nullable().optional(),
    status: z.enum(['planned', 'in_progress', 'deployed', 'deprecated']),
    dependencies: z.array(z.string()),
  })).optional(),
  api_contracts: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    endpoint: z.string().min(1),
    description: z.string().min(1),
    request_schema: z.string(),
    response_schema: z.string(),
    rate_limit: z.string().nullable().optional(),
    auth_required: z.boolean(),
  })).optional(),
  infra_requirements: z.array(z.object({
    category: z.string().min(1),
    requirement: z.string().min(1),
    specification: z.string().min(1),
    priority: z.enum(['required', 'recommended', 'optional']),
  })).optional(),
  scaling_strategy: z.enum(['horizontal', 'vertical', 'auto', 'hybrid']).optional(),
  monitoring_stack: z.array(z.string()).optional(),
  deployment_model: z.enum(['kubernetes', 'serverless', 'vm', 'hybrid']).optional(),
});

const demoComponents: ArchitectureComponent[] = [
  {
    id: 'ac-001',
    layer: 'data_foundation',
    name: 'Data Lake (S3)',
    technology: 'Amazon S3 + Glue Catalog',
    description: 'Centralized data lake for raw and processed datasets used in AI model training and inference',
    cloud_provider: 'AWS',
    status: 'deployed',
    dependencies: [],
  },
  {
    id: 'ac-002',
    layer: 'ml_platform',
    name: 'Model Serving',
    technology: 'Amazon SageMaker Endpoints',
    description: 'Managed model hosting with auto-scaling for real-time inference workloads',
    cloud_provider: 'AWS',
    status: 'deployed',
    dependencies: ['ac-001'],
  },
  {
    id: 'ac-003',
    layer: 'api_integration',
    name: 'API Gateway',
    technology: 'Amazon API Gateway + Lambda',
    description: 'Managed API layer for routing requests to AI services with authentication and rate limiting',
    cloud_provider: 'AWS',
    status: 'deployed',
    dependencies: ['ac-002'],
  },
  {
    id: 'ac-004',
    layer: 'security',
    name: 'Secret Management',
    technology: 'AWS Secrets Manager + KMS',
    description: 'Centralized API key and credential management with envelope encryption',
    cloud_provider: 'AWS',
    status: 'deployed',
    dependencies: [],
  },
  {
    id: 'ac-005',
    layer: 'mlops',
    name: 'CI/CD Pipeline',
    technology: 'GitHub Actions + AWS CodePipeline',
    description: 'Automated build, test, and deployment pipeline for model artifacts and configuration updates',
    cloud_provider: 'AWS',
    status: 'in_progress',
    dependencies: ['ac-002', 'ac-004'],
  },
];

const demoApiContracts: ApiContract[] = [
  {
    id: 'api-001',
    name: 'Code Completion',
    method: 'POST',
    endpoint: '/v1/ai/completions',
    description: 'Submit code context and receive AI-generated completions',
    request_schema: '{ "context": string, "language": string, "max_tokens": number }',
    response_schema: '{ "completion": string, "confidence": number, "model": string }',
    rate_limit: '100 req/min per user',
    auth_required: true,
  },
  {
    id: 'api-002',
    name: 'Code Review',
    method: 'POST',
    endpoint: '/v1/ai/review',
    description: 'Submit a code diff for AI-powered review and suggestions',
    request_schema: '{ "diff": string, "repository": string, "rules": string[] }',
    response_schema: '{ "comments": Array<{ line: number, suggestion: string, severity: string }> }',
    rate_limit: '30 req/min per user',
    auth_required: true,
  },
  {
    id: 'api-003',
    name: 'Health Check',
    method: 'GET',
    endpoint: '/v1/health',
    description: 'System health status and dependency checks',
    request_schema: '{}',
    response_schema: '{ "status": string, "version": string, "dependencies": Record<string, string> }',
    rate_limit: null,
    auth_required: false,
  },
];

const demoInfraRequirements: InfraRequirement[] = [
  { category: 'Compute', requirement: 'GPU-enabled instances for model inference', specification: 'g5.xlarge or equivalent, 2+ instances', priority: 'required' },
  { category: 'Networking', requirement: 'VPC with private subnets for AI services', specification: 'CIDR 10.0.0.0/16, NAT Gateway, no public IPs on AI instances', priority: 'required' },
  { category: 'Storage', requirement: 'Encrypted object storage for training data', specification: 'S3 with SSE-KMS, versioning enabled, lifecycle policies', priority: 'required' },
  { category: 'Monitoring', requirement: 'Centralized logging and metrics', specification: 'CloudWatch + OpenTelemetry, 90-day retention', priority: 'recommended' },
];

const demoArchitectureData: ArchitectureBlueprint = {
  id: 'arch-demo-001',
  project_id: 'proj-demo-001',
  name: 'AI Coding Assistant Platform',
  cloud_provider: 'AWS',
  components: demoComponents,
  api_contracts: demoApiContracts,
  infra_requirements: demoInfraRequirements,
  scaling_strategy: 'auto',
  monitoring_stack: ['CloudWatch', 'OpenTelemetry', 'Grafana', 'PagerDuty'],
  deployment_model: 'kubernetes',
  created_at: '2025-06-01T10:00:00Z',
  updated_at: '2025-06-20T16:00:00Z',
};

/**
 * GET /api/architecture
 * Fetch architecture blueprint for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ArchitectureBlueprint | null>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoArchitectureData });
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
      .from('architecture_blueprints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch architecture blueprint', message: error.message },
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
 * POST /api/architecture
 * Create or update an architecture blueprint for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ArchitectureBlueprint>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `arch-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          name: body.name ?? 'New Architecture Blueprint',
          cloud_provider: body.cloud_provider ?? 'AWS',
          components: body.components ?? demoComponents,
          api_contracts: body.api_contracts ?? demoApiContracts,
          infra_requirements: body.infra_requirements ?? demoInfraRequirements,
          scaling_strategy: body.scaling_strategy ?? 'auto',
          monitoring_stack: body.monitoring_stack ?? [],
          deployment_model: body.deployment_model ?? 'kubernetes',
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
    const parsed = architecturePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('architecture_blueprints')
      .upsert(
        {
          project_id: parsed.data.project_id,
          name: parsed.data.name,
          cloud_provider: parsed.data.cloud_provider,
          components: parsed.data.components ?? [],
          api_contracts: parsed.data.api_contracts ?? [],
          infra_requirements: parsed.data.infra_requirements ?? [],
          scaling_strategy: parsed.data.scaling_strategy ?? 'auto',
          monitoring_stack: parsed.data.monitoring_stack ?? [],
          deployment_model: parsed.data.deployment_model ?? 'kubernetes',
          updated_at: now,
        },
        { onConflict: 'project_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save architecture blueprint', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
