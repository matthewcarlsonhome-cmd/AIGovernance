import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import type { ApiResponse, DataReadinessAudit, DataReadinessDimensionScore, DataAsset, DataQualityMetric } from '@/types';

const dataReadinessPostSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  overall_score: z.number().min(0).max(100),
  readiness_level: z.enum(['optimized', 'managed', 'defined', 'developing', 'initial']),
  dimension_scores: z.array(z.object({
    dimension: z.enum(['availability', 'quality', 'accessibility', 'governance', 'security', 'operations']),
    score: z.number().min(0).max(100),
    weight: z.number().min(0).max(1),
    findings: z.array(z.string()),
    recommendations: z.array(z.string()),
  })).optional(),
  data_assets: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.enum(['database', 'data_lake', 'api', 'file_system', 'streaming', 'feature_store']),
    domain: z.string().min(1),
    owner: z.string().min(1),
    classification: z.enum(['public', 'internal', 'confidential', 'restricted']),
    ai_relevance: z.enum(['training', 'inference', 'both', 'none']),
    quality_score: z.number().min(0).max(100),
  })).optional(),
  quality_metrics: z.array(z.object({
    dimension: z.enum(['accuracy', 'completeness', 'consistency', 'timeliness', 'validity', 'uniqueness']),
    score: z.number().min(0).max(100),
    target: z.number().min(0).max(100),
    domain: z.string().min(1),
    notes: z.string(),
  })).optional(),
  dataops_maturity: z.number().min(0).max(100).optional(),
  remediation_roadmap: z.array(z.object({
    phase: z.enum(['quick_wins', 'foundation', 'advanced']),
    items: z.array(z.string()),
  })).optional(),
});

const demoDimensionScores: DataReadinessDimensionScore[] = [
  {
    dimension: 'availability',
    score: 72,
    weight: 0.20,
    findings: ['Primary databases have 99.5% uptime', 'Some legacy data sources lack redundancy'],
    recommendations: ['Implement cross-region replication for critical datasets', 'Establish SLAs for all data source availability'],
  },
  {
    dimension: 'quality',
    score: 58,
    weight: 0.25,
    findings: ['Customer data has 12% null rate in key fields', 'No automated data quality monitoring in place'],
    recommendations: ['Deploy automated data quality checks on ingestion pipelines', 'Establish data quality SLAs per domain'],
  },
  {
    dimension: 'accessibility',
    score: 65,
    weight: 0.15,
    findings: ['Data catalog covers 60% of known assets', 'Self-service access available for analytics team only'],
    recommendations: ['Expand data catalog coverage to all AI-relevant datasets', 'Implement role-based self-service access for ML engineers'],
  },
  {
    dimension: 'governance',
    score: 55,
    weight: 0.15,
    findings: ['Data ownership defined for 70% of datasets', 'No formal data lineage tracking system'],
    recommendations: ['Assign data stewards for all AI-relevant datasets', 'Implement data lineage tooling integrated with ML pipeline'],
  },
  {
    dimension: 'security',
    score: 78,
    weight: 0.15,
    findings: ['Encryption at rest enabled for all production databases', 'Access logging comprehensive for core systems'],
    recommendations: ['Extend encryption coverage to staging and development environments', 'Implement data masking for AI training pipelines'],
  },
  {
    dimension: 'operations',
    score: 48,
    weight: 0.10,
    findings: ['Manual ETL processes for 40% of data pipelines', 'No DataOps practices formally adopted'],
    recommendations: ['Migrate manual ETL to orchestrated pipelines (Airflow/Dagster)', 'Establish DataOps team and practices for AI workloads'],
  },
];

const demoDataAssets: DataAsset[] = [
  { id: 'da-001', name: 'Customer Transaction Database', type: 'database', domain: 'Finance', owner: 'Data Engineering', classification: 'confidential', ai_relevance: 'training', quality_score: 78 },
  { id: 'da-002', name: 'Code Repository Analytics', type: 'api', domain: 'Engineering', owner: 'DevOps', classification: 'internal', ai_relevance: 'both', quality_score: 85 },
  { id: 'da-003', name: 'Product Telemetry Lake', type: 'data_lake', domain: 'Product', owner: 'Data Platform', classification: 'internal', ai_relevance: 'training', quality_score: 62 },
  { id: 'da-004', name: 'HR Employee Records', type: 'database', domain: 'Human Resources', owner: 'HR Systems', classification: 'restricted', ai_relevance: 'none', quality_score: 91 },
];

const demoQualityMetrics: DataQualityMetric[] = [
  { dimension: 'accuracy', score: 88, target: 95, domain: 'Finance', notes: 'Transaction amounts validated against source systems' },
  { dimension: 'completeness', score: 72, target: 90, domain: 'Product', notes: 'Telemetry events missing device context in 28% of records' },
  { dimension: 'consistency', score: 65, target: 85, domain: 'Engineering', notes: 'Schema inconsistencies between repository API versions' },
  { dimension: 'timeliness', score: 82, target: 95, domain: 'Finance', notes: 'Batch ETL runs daily; real-time feeds delayed by avg 15 minutes' },
];

const demoDataReadinessData: DataReadinessAudit = {
  id: 'dr-demo-001',
  project_id: 'proj-demo-001',
  overall_score: 62,
  readiness_level: 'developing',
  dimension_scores: demoDimensionScores,
  data_assets: demoDataAssets,
  quality_metrics: demoQualityMetrics,
  dataops_maturity: 35,
  remediation_roadmap: [
    {
      phase: 'quick_wins',
      items: [
        'Enable automated null-check alerts on critical fields',
        'Document data ownership for remaining 30% of datasets',
        'Add encryption to staging database environments',
      ],
    },
    {
      phase: 'foundation',
      items: [
        'Deploy data catalog covering all AI-relevant datasets',
        'Implement automated data quality monitoring pipeline',
        'Establish data lineage tracking for ML training data',
        'Migrate top 10 manual ETL jobs to orchestrated pipelines',
      ],
    },
    {
      phase: 'advanced',
      items: [
        'Implement feature store for shared ML feature management',
        'Deploy real-time data quality scoring dashboard',
        'Establish DataOps CI/CD for data pipeline changes',
      ],
    },
  ],
  created_at: '2025-06-01T10:00:00Z',
  updated_at: '2025-06-25T09:30:00Z',
};

/**
 * GET /api/data-readiness
 * Fetch data readiness audit for a project.
 * Requires ?project_id= query parameter.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DataReadinessAudit | null>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ data: demoDataReadinessData });
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
      .from('data_readiness_audits')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch data readiness audit', message: error.message },
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
 * POST /api/data-readiness
 * Create or update a data readiness audit for a project.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<DataReadinessAudit>>> {
  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      const now = new Date().toISOString();
      return NextResponse.json({
        data: {
          id: `dr-demo-${Date.now()}`,
          project_id: body.project_id ?? 'proj-demo-001',
          overall_score: body.overall_score ?? 62,
          readiness_level: body.readiness_level ?? 'developing',
          dimension_scores: body.dimension_scores ?? demoDimensionScores,
          data_assets: body.data_assets ?? demoDataAssets,
          quality_metrics: body.quality_metrics ?? demoQualityMetrics,
          dataops_maturity: body.dataops_maturity ?? 35,
          remediation_roadmap: body.remediation_roadmap ?? [],
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
    const parsed = dataReadinessPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: JSON.stringify(parsed.error.flatten().fieldErrors) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('data_readiness_audits')
      .upsert(
        {
          project_id: parsed.data.project_id,
          overall_score: parsed.data.overall_score,
          readiness_level: parsed.data.readiness_level,
          dimension_scores: parsed.data.dimension_scores ?? [],
          data_assets: parsed.data.data_assets ?? [],
          quality_metrics: parsed.data.quality_metrics ?? [],
          dataops_maturity: parsed.data.dataops_maturity ?? 0,
          remediation_roadmap: parsed.data.remediation_roadmap ?? [],
          updated_at: now,
        },
        { onConflict: 'project_id' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save data readiness audit', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
