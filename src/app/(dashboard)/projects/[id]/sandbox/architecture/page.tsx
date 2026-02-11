'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Database,
  Brain,
  Globe,
  Server,
  GitBranch,
  Shield,
  Layers,
  FileJson,
  HardDrive,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Cloud,
  Lock,
  Activity,
  Cpu,
  Network,
  Container,
  Eye,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type {
  ArchitectureBlueprint,
  ArchitectureComponent,
  ApiContract,
  InfraRequirement,
  ArchitectureLayer,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

type TabKey = 'layers' | 'api' | 'infra' | 'summary';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'layers', label: 'Architecture Layers', icon: Layers },
  { key: 'api', label: 'API Contracts', icon: FileJson },
  { key: 'infra', label: 'Infrastructure', icon: HardDrive },
  { key: 'summary', label: 'Summary', icon: ClipboardList },
];

const LAYER_META: Record<
  ArchitectureLayer,
  { label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string }
> = {
  data_foundation: {
    label: 'Data Foundation',
    icon: Database,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  ml_platform: {
    label: 'ML Platform',
    icon: Brain,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  api_integration: {
    label: 'API / Integration',
    icon: Globe,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  infrastructure: {
    label: 'Infrastructure',
    icon: Server,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  mlops: {
    label: 'MLOps',
    icon: GitBranch,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  security: {
    label: 'Security',
    icon: Shield,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

const LAYER_ORDER: ArchitectureLayer[] = [
  'security',
  'mlops',
  'infrastructure',
  'api_integration',
  'ml_platform',
  'data_foundation',
];

function statusBadgeClass(status: ArchitectureComponent['status']): string {
  switch (status) {
    case 'deployed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'planned':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'deprecated':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function methodBadgeClass(method: ApiContract['method']): string {
  switch (method) {
    case 'GET':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'POST':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'PUT':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DELETE':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PATCH':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function priorityBadgeClass(priority: InfraRequirement['priority']): string {
  switch (priority) {
    case 'required':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'recommended':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'optional':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_BLUEPRINT: ArchitectureBlueprint = {
  id: 'bp-001',
  project_id: 'proj-001',
  name: 'Enterprise AI Platform Architecture',
  cloud_provider: 'AWS',
  scaling_strategy: 'auto',
  deployment_model: 'kubernetes',
  monitoring_stack: ['Prometheus', 'Grafana', 'CloudWatch', 'PagerDuty'],
  created_at: '2025-11-01T00:00:00Z',
  updated_at: '2025-12-15T00:00:00Z',
  components: [
    // Data Foundation
    {
      id: 'c-01',
      layer: 'data_foundation',
      name: 'Data Lake',
      technology: 'Amazon S3 + Lake Formation',
      description: 'Centralized raw and curated data storage with fine-grained access control.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: [],
    },
    {
      id: 'c-02',
      layer: 'data_foundation',
      name: 'ETL Pipeline',
      technology: 'AWS Glue + Apache Spark',
      description: 'Automated data ingestion, transformation, and quality checks.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: ['c-01'],
    },
    {
      id: 'c-03',
      layer: 'data_foundation',
      name: 'Feature Store',
      technology: 'Amazon SageMaker Feature Store',
      description: 'Centralized, versioned feature repository for training and inference.',
      cloud_provider: 'AWS',
      status: 'in_progress',
      dependencies: ['c-02'],
    },
    // ML Platform
    {
      id: 'c-04',
      layer: 'ml_platform',
      name: 'Model Serving',
      technology: 'Amazon SageMaker Endpoints',
      description: 'Real-time and batch model inference with auto-scaling.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: ['c-03'],
    },
    {
      id: 'c-05',
      layer: 'ml_platform',
      name: 'Training Infrastructure',
      technology: 'SageMaker Training Jobs + Spot Instances',
      description: 'Distributed training with GPU clusters and cost-optimized spot instances.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: ['c-01', 'c-03'],
    },
    {
      id: 'c-06',
      layer: 'ml_platform',
      name: 'Experiment Tracking',
      technology: 'MLflow on EKS',
      description: 'Centralized experiment logging, model versioning, and comparison.',
      cloud_provider: 'AWS',
      status: 'in_progress',
      dependencies: [],
    },
    // API / Integration
    {
      id: 'c-07',
      layer: 'api_integration',
      name: 'API Gateway',
      technology: 'Amazon API Gateway + WAF',
      description: 'Managed API gateway with rate limiting, throttling, and web application firewall.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: ['c-04'],
    },
    {
      id: 'c-08',
      layer: 'api_integration',
      name: 'Load Balancer',
      technology: 'Application Load Balancer (ALB)',
      description: 'Layer 7 load balancing with path-based routing and health checks.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: [],
    },
    {
      id: 'c-09',
      layer: 'api_integration',
      name: 'Service Mesh',
      technology: 'AWS App Mesh + Envoy',
      description: 'Microservice networking with mTLS, observability, and traffic management.',
      cloud_provider: 'AWS',
      status: 'planned',
      dependencies: ['c-08'],
    },
    // Infrastructure
    {
      id: 'c-10',
      layer: 'infrastructure',
      name: 'Compute Cluster',
      technology: 'Amazon EKS (Kubernetes)',
      description: 'Managed Kubernetes cluster for containerized workloads with GPU node groups.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: [],
    },
    {
      id: 'c-11',
      layer: 'infrastructure',
      name: 'Object Storage',
      technology: 'Amazon S3 + Glacier',
      description: 'Tiered storage for models, artifacts, and archival data.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: [],
    },
    // MLOps
    {
      id: 'c-12',
      layer: 'mlops',
      name: 'CI/CD Pipeline',
      technology: 'AWS CodePipeline + GitHub Actions',
      description: 'Automated build, test, and deployment pipeline with model validation gates.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: ['c-10'],
    },
    {
      id: 'c-13',
      layer: 'mlops',
      name: 'Model Registry',
      technology: 'SageMaker Model Registry',
      description: 'Versioned model catalog with approval workflows and lineage tracking.',
      cloud_provider: 'AWS',
      status: 'in_progress',
      dependencies: ['c-06'],
    },
    // Security
    {
      id: 'c-14',
      layer: 'security',
      name: 'IAM & Access Control',
      technology: 'AWS IAM + SSO + Organizations',
      description: 'Role-based access control with federated identity and least-privilege policies.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: [],
    },
    {
      id: 'c-15',
      layer: 'security',
      name: 'Secrets Management',
      technology: 'AWS Secrets Manager + KMS',
      description: 'Encrypted secrets rotation with envelope encryption and audit logging.',
      cloud_provider: 'AWS',
      status: 'deployed',
      dependencies: ['c-14'],
    },
  ],
  api_contracts: [
    {
      id: 'api-01',
      name: 'Model Inference',
      method: 'POST',
      endpoint: '/api/v1/inference',
      description: 'Submit input data for real-time model prediction. Supports batch and single-record payloads.',
      request_schema: '{\n  "model_id": "string",\n  "version": "string | null",\n  "inputs": [\n    {\n      "feature_name": "string",\n      "value": "number | string"\n    }\n  ],\n  "options": {\n    "explain": "boolean",\n    "threshold": "number"\n  }\n}',
      response_schema: '{\n  "prediction_id": "string",\n  "model_id": "string",\n  "predictions": [\n    {\n      "label": "string",\n      "confidence": "number",\n      "explanation": "object | null"\n    }\n  ],\n  "latency_ms": "number",\n  "timestamp": "string"\n}',
      rate_limit: '1000 req/min',
      auth_required: true,
    },
    {
      id: 'api-02',
      name: 'Training Job',
      method: 'POST',
      endpoint: '/api/v1/training/jobs',
      description: 'Initiate a new model training job with specified dataset, hyperparameters, and compute config.',
      request_schema: '{\n  "experiment_name": "string",\n  "dataset_id": "string",\n  "model_type": "string",\n  "hyperparameters": "object",\n  "compute": {\n    "instance_type": "string",\n    "instance_count": "number",\n    "use_spot": "boolean"\n  }\n}',
      response_schema: '{\n  "job_id": "string",\n  "status": "queued",\n  "estimated_duration_min": "number",\n  "created_at": "string"\n}',
      rate_limit: '10 req/min',
      auth_required: true,
    },
    {
      id: 'api-03',
      name: 'Feedback Loop',
      method: 'POST',
      endpoint: '/api/v1/feedback',
      description: 'Submit ground-truth labels or user corrections for model retraining and drift monitoring.',
      request_schema: '{\n  "prediction_id": "string",\n  "ground_truth": "string | number",\n  "feedback_type": "correction | confirmation",\n  "metadata": "object | null"\n}',
      response_schema: '{\n  "feedback_id": "string",\n  "status": "accepted",\n  "retraining_triggered": "boolean"\n}',
      rate_limit: '500 req/min',
      auth_required: true,
    },
    {
      id: 'api-04',
      name: 'Health Check',
      method: 'GET',
      endpoint: '/api/v1/health',
      description: 'System health endpoint for load balancers and monitoring. Returns component-level status.',
      request_schema: '(no body)',
      response_schema: '{\n  "status": "healthy | degraded | unhealthy",\n  "version": "string",\n  "uptime_seconds": "number",\n  "components": {\n    "api": "string",\n    "model_serving": "string",\n    "database": "string",\n    "cache": "string"\n  }\n}',
      rate_limit: null,
      auth_required: false,
    },
    {
      id: 'api-05',
      name: 'Metrics Export',
      method: 'GET',
      endpoint: '/api/v1/metrics',
      description: 'Retrieve model performance metrics, latency percentiles, and throughput for a given time window.',
      request_schema: '(query params: model_id, from, to, granularity)',
      response_schema: '{\n  "model_id": "string",\n  "period": { "from": "string", "to": "string" },\n  "metrics": {\n    "total_requests": "number",\n    "avg_latency_ms": "number",\n    "p99_latency_ms": "number",\n    "error_rate": "number",\n    "accuracy": "number"\n  }\n}',
      rate_limit: '100 req/min',
      auth_required: true,
    },
    {
      id: 'api-06',
      name: 'Delete Model Version',
      method: 'DELETE',
      endpoint: '/api/v1/models/{model_id}/versions/{version}',
      description: 'Remove a specific model version from the registry. Active production versions cannot be deleted.',
      request_schema: '(no body, path params: model_id, version)',
      response_schema: '{\n  "deleted": "boolean",\n  "model_id": "string",\n  "version": "string",\n  "message": "string"\n}',
      rate_limit: '10 req/min',
      auth_required: true,
    },
  ],
  infra_requirements: [
    {
      category: 'Compute',
      requirement: 'GPU Instances',
      specification: 'p4d.24xlarge (8x A100 GPUs) for training; g5.xlarge for inference; 2 AZs minimum',
      priority: 'required',
    },
    {
      category: 'Compute',
      requirement: 'Kubernetes Cluster',
      specification: 'EKS v1.28+, managed node groups, Karpenter autoscaler, min 3 nodes / max 50',
      priority: 'required',
    },
    {
      category: 'Storage',
      requirement: 'Data Lake Storage',
      specification: 'S3 with versioning, SSE-KMS encryption, lifecycle policies (IA after 90d, Glacier after 365d)',
      priority: 'required',
    },
    {
      category: 'Storage',
      requirement: 'Model Artifact Store',
      specification: 'S3 bucket with cross-region replication, 99.999999999% durability, <100ms retrieval',
      priority: 'required',
    },
    {
      category: 'Network',
      requirement: 'VPC Configuration',
      specification: 'Dedicated VPC (10.0.0.0/16), 3 private subnets, 3 public subnets, NAT Gateway per AZ',
      priority: 'required',
    },
    {
      category: 'Network',
      requirement: 'PrivateLink Endpoints',
      specification: 'VPC endpoints for S3, SageMaker, ECR, CloudWatch, Secrets Manager; no public internet for data plane',
      priority: 'recommended',
    },
    {
      category: 'Security',
      requirement: 'Encryption at Rest',
      specification: 'AWS KMS with customer-managed CMKs, automatic key rotation, separate keys per data classification',
      priority: 'required',
    },
    {
      category: 'Security',
      requirement: 'DLP Integration',
      specification: 'Amazon Macie for S3 scanning, custom regex patterns for PII/PHI, automated remediation via EventBridge',
      priority: 'recommended',
    },
    {
      category: 'Compute',
      requirement: 'Spot Instance Strategy',
      specification: 'Use spot for training (up to 70% savings), on-demand for inference; fallback capacity reservation',
      priority: 'recommended',
    },
    {
      category: 'Network',
      requirement: 'CDN for Model Artifacts',
      specification: 'CloudFront distribution for static model artifacts and documentation; origin access control',
      priority: 'optional',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function LayerBand({ layer, components }: { layer: ArchitectureLayer; components: ArchitectureComponent[] }): React.ReactElement {
  const meta = LAYER_META[layer];
  const Icon = meta.icon;

  return (
    <div className={`rounded-lg border ${meta.borderColor} ${meta.bgColor} overflow-hidden`}>
      {/* Layer header */}
      <div className={`flex items-center gap-3 px-5 py-3 border-b ${meta.borderColor}`}>
        <div className={`flex items-center justify-center w-8 h-8 rounded-md bg-white/70 ${meta.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${meta.color}`}>{meta.label}</h3>
        </div>
        <span className="text-xs text-slate-500">{components.length} component{components.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Component cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
        {components.map((comp) => (
          <div
            key={comp.id}
            className="bg-white rounded-md border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-medium text-slate-900 leading-tight">{comp.name}</h4>
              <Badge className={`shrink-0 text-[10px] leading-tight px-1.5 py-0.5 border ${statusBadgeClass(comp.status)}`}>
                {comp.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mb-2 line-clamp-2">{comp.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">{comp.technology}</span>
              {comp.cloud_provider && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Cloud className="w-3 h-3" />
                  {comp.cloud_provider}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiContractRow({ contract }: { contract: ApiContract }): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Row header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-slate-400">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <Badge className={`shrink-0 font-mono text-[10px] px-2 py-0.5 border ${methodBadgeClass(contract.method)}`}>
          {contract.method}
        </Badge>
        <span className="text-sm font-mono text-slate-700 flex-shrink-0">{contract.endpoint}</span>
        <span className="text-sm text-slate-500 truncate flex-1">{contract.description}</span>
        <div className="flex items-center gap-2 shrink-0">
          {contract.auth_required && (
            <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
              <Lock className="w-3 h-3" />
              Auth
            </span>
          )}
          {contract.rate_limit && (
            <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
              {contract.rate_limit}
            </span>
          )}
        </div>
      </button>

      {/* Expanded schemas */}
      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Request Schema</h5>
              <pre className="text-xs font-mono text-slate-600 bg-white rounded-md border border-slate-200 p-3 overflow-x-auto whitespace-pre">
                {contract.request_schema}
              </pre>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Response Schema</h5>
              <pre className="text-xs font-mono text-slate-600 bg-white rounded-md border border-slate-200 p-3 overflow-x-auto whitespace-pre">
                {contract.response_schema}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfraGroup({ category, items }: { category: string; items: InfraRequirement[] }): React.ReactElement {
  const categoryIcons: Record<string, React.ElementType> = {
    Compute: Cpu,
    Storage: Database,
    Network: Network,
    Security: Shield,
  };
  const Icon = categoryIcons[category] || Server;

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-600">
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">{category}</h4>
        <span className="text-xs text-slate-400">{items.length} requirement{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900">{item.requirement}</span>
                <Badge className={`text-[10px] px-1.5 py-0.5 border ${priorityBadgeClass(item.priority)}`}>
                  {item.priority}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.specification}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function ArchitectureBlueprintPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabKey>('layers');
  const blueprint = DEMO_BLUEPRINT;

  // Group components by layer
  const componentsByLayer = LAYER_ORDER.reduce<Record<ArchitectureLayer, ArchitectureComponent[]>>(
    (acc, layer) => {
      acc[layer] = blueprint.components.filter((c) => c.layer === layer);
      return acc;
    },
    {} as Record<ArchitectureLayer, ArchitectureComponent[]>,
  );

  // Group infra requirements by category
  const infraByCategory = blueprint.infra_requirements.reduce<Record<string, InfraRequirement[]>>(
    (acc, req) => {
      if (!acc[req.category]) acc[req.category] = [];
      acc[req.category].push(req);
      return acc;
    },
    {},
  );

  // Stats for header
  const deployedCount = blueprint.components.filter((c) => c.status === 'deployed').length;
  const inProgressCount = blueprint.components.filter((c) => c.status === 'in_progress').length;
  const plannedCount = blueprint.components.filter((c) => c.status === 'planned').length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">Architecture Blueprint</h1>
        <p className="text-sm text-slate-500">
          Visualize, plan, and validate the full-stack architecture for your AI deployment.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{blueprint.components.length}</p>
                <p className="text-xs text-slate-500">Total Components</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{deployedCount}</p>
                <p className="text-xs text-slate-500">Deployed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
                <Container className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{inProgressCount}</p>
                <p className="text-xs text-slate-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-500">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{plannedCount}</p>
                <p className="text-xs text-slate-500">Planned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {/* ---- Architecture Layers ---- */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">6-Layer Architecture Stack</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  From security perimeter down to data foundation. Each layer is independently scalable.
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-slate-700 border-slate-300">
                <Download className="w-4 h-4" />
                Export Diagram
              </Button>
            </div>

            {/* Stacked layer bands */}
            <div className="space-y-3">
              {LAYER_ORDER.map((layer) => {
                const comps = componentsByLayer[layer];
                if (comps.length === 0) return null;
                return <LayerBand key={layer} layer={layer} components={comps} />;
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Status:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Deployed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Planned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Deprecated
              </span>
            </div>
          </div>
        )}

        {/* ---- API Contracts ---- */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">API Contract Specifications</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {blueprint.api_contracts.length} endpoints defined. Click a row to inspect request/response schemas.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> GET
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> POST
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" /> PUT
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> DELETE
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {blueprint.api_contracts.map((contract) => (
                <ApiContractRow key={contract.id} contract={contract} />
              ))}
            </div>
          </div>
        )}

        {/* ---- Infrastructure Requirements ---- */}
        {activeTab === 'infra' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Infrastructure Requirements</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {blueprint.infra_requirements.length} requirements across {Object.keys(infraByCategory).length} categories.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Required
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Recommended
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Optional
                </span>
              </div>
            </div>

            <Card className="border border-slate-200">
              <CardContent className="p-5">
                {Object.entries(infraByCategory).map(([category, items]) => (
                  <InfraGroup key={category} category={category} items={items} />
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ---- Configuration Summary ---- */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="mb-2">
              <h2 className="text-lg font-semibold text-slate-900">Configuration Summary</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                High-level deployment configuration and operational tooling overview.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cloud Provider */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-slate-500" />
                    Cloud Provider
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-50 border border-amber-200">
                      <Cloud className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{blueprint.cloud_provider}</p>
                      <p className="text-xs text-slate-500">Amazon Web Services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scaling Strategy */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-500" />
                    Scaling Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200">
                      <Activity className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 capitalize">{blueprint.scaling_strategy}</p>
                      <p className="text-xs text-slate-500">Automatic horizontal and vertical scaling based on demand</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment Model */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Container className="w-4 h-4 text-slate-500" />
                    Deployment Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 border border-blue-200">
                      <Container className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 capitalize">{blueprint.deployment_model}</p>
                      <p className="text-xs text-slate-500">Container orchestration with managed Kubernetes (EKS)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring Stack */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-500" />
                    Monitoring Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {blueprint.monitoring_stack.map((tool) => (
                      <Badge
                        key={tool}
                        className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium px-2.5 py-1"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Full observability pipeline: metrics collection, visualization, alerting, and incident management.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Architecture summary stats */}
            <Card className="border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-800">Architecture Overview</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Breakdown of components, APIs, and infrastructure requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{LAYER_ORDER.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Architecture Layers</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{blueprint.components.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Components</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{blueprint.api_contracts.length}</p>
                    <p className="text-xs text-slate-500 mt-1">API Contracts</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{blueprint.infra_requirements.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Infra Requirements</p>
                  </div>
                </div>

                {/* Layer breakdown */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Components per Layer</h4>
                  <div className="space-y-2">
                    {LAYER_ORDER.map((layer) => {
                      const meta = LAYER_META[layer];
                      const count = componentsByLayer[layer].length;
                      const pct = Math.round((count / blueprint.components.length) * 100);
                      return (
                        <div key={layer} className="flex items-center gap-3">
                          <span className={`text-xs font-medium w-28 ${meta.color}`}>{meta.label}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${meta.bgColor.replace('50', '300')}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-12 text-right">{count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
