'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Copy,
  Download,
  Check,
  FileJson,
  FileText,
  FileCode,
  Container,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

/* ------------------------------------------------------------------ */
/*  Config file contents                                               */
/* ------------------------------------------------------------------ */

const CONFIG_FILES = {
  'managed-settings': {
    filename: 'managed-settings.json',
    label: 'managed-settings.json',
    icon: FileJson,
    language: 'json',
    description: 'Claude Code managed settings for model configuration, security policies, and sandbox behavior.',
    content: `{
  "version": "1.0",
  "ai_model": {
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 4096,
    "temperature": 0.1,
    "top_p": 0.95
  },
  "security": {
    "file_pattern_deny": [
      "*.env",
      "*.pem",
      "*.key",
      "*.pfx",
      "credentials.*",
      "secrets.*",
      ".aws/credentials",
      ".ssh/*"
    ],
    "domain_allowlist": [
      "api.anthropic.com",
      "github.com",
      "*.internal.corp.com",
      "registry.npmjs.org",
      "pypi.org"
    ],
    "mcp_server_policy": "restricted",
    "allowed_mcp_servers": [],
    "audit_logging": true,
    "log_destination": "splunk",
    "redact_secrets_in_logs": true
  },
  "sandbox": {
    "mode": "strict",
    "network_isolation": true,
    "egress_filtering": true,
    "max_file_size_mb": 50,
    "max_workspace_size_gb": 10,
    "session_timeout_minutes": 30,
    "idle_timeout_minutes": 15
  },
  "permissions": {
    "allow_bash": true,
    "allow_file_write": true,
    "allow_web_search": false,
    "allow_mcp_tools": false,
    "require_human_approval": [
      "git push",
      "npm publish",
      "docker push",
      "rm -rf"
    ]
  }
}`,
  },
  requirements: {
    filename: 'requirements.toml',
    label: 'requirements.toml',
    icon: FileText,
    language: 'toml',
    description: 'Sandbox environment requirements and constraints for the AI coding agent.',
    content: `# GovAI Studio - Sandbox Requirements
# Generated: 2026-01-15

[sandbox]
mode = "strict"
network = "filtered"
max_concurrent_sessions = 5
session_recording = true
snapshot_on_exit = true

[security]
approval_policy = "required"
web_search = "disabled"
file_access = "restricted"
clipboard_isolation = true
secret_scanning = true
pii_detection = true

[models]
allowed = ["claude-sonnet-4-20250514"]
default = "claude-sonnet-4-20250514"
max_tokens_per_request = 4096
max_requests_per_hour = 100
cost_limit_daily_usd = 50.00

[network]
egress_policy = "allowlist"
allowed_domains = [
  "api.anthropic.com",
  "github.com",
  "registry.npmjs.org",
  "pypi.org",
]
blocked_ports = [22, 3389, 5900]
dns_filtering = true

[audit]
log_all_api_calls = true
log_file_access = true
log_network_requests = true
retention_days = 90
siem_integration = "splunk"
alert_on_policy_violation = true

[compliance]
framework = ["SOC2", "NIST-800-53"]
data_classification = "confidential"
encryption_at_rest = true
encryption_in_transit = true`,
  },
  'claude-md': {
    filename: 'CLAUDE.md',
    label: 'CLAUDE.md',
    icon: FileCode,
    language: 'markdown',
    description: 'Project instructions file that guides the AI coding agent behavior within the sandbox.',
    content: `# CLAUDE.md - Sandbox Project Instructions

## Project Context
You are working within a sandboxed AI coding evaluation environment
for Acme Corp's Enterprise AI Coding Pilot program. All work is
subject to governance policies and audit logging.

## Allowed Actions
- Read and write files within the /workspace directory
- Run tests with \`npm test\` or \`pytest\`
- Install dependencies from approved registries only
- Use git for version control (commits only, no push)

## Restricted Actions
- DO NOT access files outside /workspace
- DO NOT make network requests to unapproved domains
- DO NOT store or transmit credentials, API keys, or secrets
- DO NOT disable or bypass security controls
- DO NOT access production databases or services
- DO NOT run \`rm -rf\` on directories outside /workspace

## Code Standards
- TypeScript strict mode for all .ts/.tsx files
- ESLint + Prettier formatting enforced
- All functions must have explicit return types
- Unit test coverage minimum: 80%
- No \`any\` types unless explicitly justified with a comment

## Security Guidelines
- Never hardcode secrets; use environment variables
- Validate all external inputs with Zod schemas
- Use parameterized queries for any database access
- Sanitize user-facing output (DOMPurify for HTML)
- Follow OWASP Top 10 guidelines

## Architecture
- Next.js 15 App Router with Server Components
- Supabase for database and auth
- shadcn/ui component library
- Zustand for client state, TanStack Query for server state

## Testing
- Run \`npm test\` before completing any task
- Run \`npm run lint\` to check code quality
- Run \`npm run type-check\` to verify TypeScript

## When In Doubt
- Ask for clarification rather than making assumptions
- Prefer smaller, focused changes over large rewrites
- Document any technical decisions in code comments`,
  },
  'docker-compose': {
    filename: 'docker-compose.yml',
    label: 'docker-compose.yml',
    icon: Container,
    language: 'yaml',
    description: 'Docker Compose configuration for the sandboxed development environment.',
    content: `# GovAI Studio - Sandboxed Development Environment
# Generated: 2026-01-15

version: "3.9"

services:
  sandbox:
    build:
      context: .
      dockerfile: Dockerfile.sandbox
    container_name: govai-sandbox
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - SANDBOX_MODE=strict
      - AUDIT_LOGGING=true
      - SIEM_ENDPOINT=\${SIEM_ENDPOINT}
      - AI_MODEL=claude-sonnet-4-20250514
      - MAX_TOKENS=4096
    volumes:
      - workspace:/workspace
      - ./managed-settings.json:/etc/govai/managed-settings.json:ro
      - ./requirements.toml:/etc/govai/requirements.toml:ro
      - ./CLAUDE.md:/workspace/CLAUDE.md:ro
    networks:
      - sandbox-net
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:size=1G
    deploy:
      resources:
        limits:
          cpus: "4.0"
          memory: 8G
        reservations:
          cpus: "2.0"
          memory: 4G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  egress-proxy:
    image: envoyproxy/envoy:v1.28-latest
    container_name: govai-egress-proxy
    restart: unless-stopped
    volumes:
      - ./envoy.yaml:/etc/envoy/envoy.yaml:ro
    networks:
      - sandbox-net
      - external-net
    ports:
      - "8443:8443"

  audit-logger:
    image: fluent/fluent-bit:2.2
    container_name: govai-audit-logger
    restart: unless-stopped
    volumes:
      - ./fluent-bit.conf:/fluent-bit/etc/fluent-bit.conf:ro
      - audit-logs:/var/log/govai
    networks:
      - sandbox-net
    environment:
      - SPLUNK_HOST=\${SPLUNK_HOST}
      - SPLUNK_TOKEN=\${SPLUNK_TOKEN}

  dlp-scanner:
    image: govai/dlp-scanner:latest
    container_name: govai-dlp-scanner
    restart: unless-stopped
    volumes:
      - workspace:/workspace:ro
    networks:
      - sandbox-net
    environment:
      - SCAN_INTERVAL=60
      - PATTERNS=secrets,pii
      - ALERT_WEBHOOK=\${ALERT_WEBHOOK}

volumes:
  workspace:
    driver: local
  audit-logs:
    driver: local

networks:
  sandbox-net:
    driver: bridge
    internal: true
  external-net:
    driver: bridge`,
  },
  terraform: {
    filename: 'terraform/main.tf',
    label: 'terraform/main.tf',
    icon: Server,
    language: 'hcl',
    description: 'Terraform configuration for VPC, security groups, and private endpoints.',
    content: `# GovAI Studio - Sandbox Infrastructure
# Provider: AWS | Region: us-east-1
# Generated: 2026-01-15

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.30"
    }
  }

  backend "s3" {
    bucket         = "govai-terraform-state"
    key            = "sandbox/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "govai-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "govai-sandbox"
      Environment = "sandbox"
      ManagedBy   = "terraform"
      CostCenter  = var.cost_center
    }
  }
}

# -------------------------------------------------------------------
# Variables
# -------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region for sandbox deployment"
  type        = string
  default     = "us-east-1"
}

variable "cost_center" {
  description = "Cost center tag for billing"
  type        = string
  default     = "ai-governance"
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the sandbox"
  type        = list(string)
  default     = ["10.0.0.0/8"]
}

# -------------------------------------------------------------------
# VPC & Networking
# -------------------------------------------------------------------

resource "aws_vpc" "sandbox" {
  cidr_block           = "10.100.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "govai-sandbox-vpc"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.sandbox.id
  cidr_block        = cidrsubnet(aws_vpc.sandbox.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "govai-sandbox-private-\${count.index + 1}"
    Tier = "private"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_internet_gateway" "sandbox" {
  vpc_id = aws_vpc.sandbox.id

  tags = {
    Name = "govai-sandbox-igw"
  }
}

resource "aws_nat_gateway" "sandbox" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.private[0].id

  tags = {
    Name = "govai-sandbox-nat"
  }
}

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "govai-sandbox-nat-eip"
  }
}

# -------------------------------------------------------------------
# Security Groups
# -------------------------------------------------------------------

resource "aws_security_group" "sandbox" {
  name_prefix = "govai-sandbox-"
  vpc_id      = aws_vpc.sandbox.id
  description = "Security group for AI coding sandbox instances"

  # Outbound: Only to VPC endpoints and approved domains
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS to approved domains (filtered by NACL)"
  }

  # No direct inbound from internet
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = var.allowed_cidr_blocks
    description = "Internal network access only"
  }

  tags = {
    Name = "govai-sandbox-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -------------------------------------------------------------------
# VPC Endpoints (Private connectivity to AWS services)
# -------------------------------------------------------------------

resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.sandbox.id
  service_name = "com.amazonaws.\${var.aws_region}.s3"

  tags = {
    Name = "govai-sandbox-s3-endpoint"
  }
}

resource "aws_vpc_endpoint" "cloudwatch_logs" {
  vpc_id              = aws_vpc.sandbox.id
  service_name        = "com.amazonaws.\${var.aws_region}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.sandbox.id]
  private_dns_enabled = true

  tags = {
    Name = "govai-sandbox-cwlogs-endpoint"
  }
}

# -------------------------------------------------------------------
# CloudTrail (Audit Logging)
# -------------------------------------------------------------------

resource "aws_cloudtrail" "sandbox_audit" {
  name                       = "govai-sandbox-audit"
  s3_bucket_name             = aws_s3_bucket.audit_logs.id
  include_global_service_events = true
  is_multi_region_trail      = false
  enable_logging             = true

  event_selector {
    read_write_type           = "All"
    include_management_events = true
  }

  tags = {
    Name = "govai-sandbox-audit-trail"
  }
}

resource "aws_s3_bucket" "audit_logs" {
  bucket_prefix = "govai-sandbox-audit-"
  force_destroy = false

  tags = {
    Name = "govai-sandbox-audit-logs"
  }
}

resource "aws_s3_bucket_versioning" "audit_logs" {
  bucket = aws_s3_bucket.audit_logs.id

  versioning_configuration {
    status = "Enabled"
  }
}

# -------------------------------------------------------------------
# Outputs
# -------------------------------------------------------------------

output "vpc_id" {
  description = "Sandbox VPC ID"
  value       = aws_vpc.sandbox.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "security_group_id" {
  description = "Sandbox security group ID"
  value       = aws_security_group.sandbox.id
}`,
  },
} satisfies Record<
  string,
  {
    filename: string;
    label: string;
    icon: React.ElementType;
    language: string;
    description: string;
    content: string;
  }
>;

type ConfigFileKey = keyof typeof CONFIG_FILES;

/* ------------------------------------------------------------------ */
/*  Code display component                                             */
/* ------------------------------------------------------------------ */

function CodeEditor({
  fileKey,
  content,
  onContentChange,
}: {
  fileKey: ConfigFileKey;
  content: string;
  onContentChange: (key: ConfigFileKey, value: string) => void;
}): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const config = CONFIG_FILES[fileKey];

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, config.filename]);

  const lineCount = content.split('\n').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            {config.language}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {lineCount} lines
          </Badge>
        </div>
      </div>

      <div className="relative rounded-lg border bg-slate-50 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-2">
          <span className="text-xs font-mono text-slate-500">
            {config.filename}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3" />
              Download
            </Button>
          </div>
        </div>

        {/* Editor area */}
        <div className="relative">
          {/* Line numbers */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-50 border-r pointer-events-none z-10">
            <div className="py-4 px-2 text-right">
              {content.split('\n').map((_, i) => (
                <div
                  key={i}
                  className="text-xs leading-[1.625rem] text-slate-500/50 font-mono select-none"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <Textarea
            value={content}
            onChange={(e) => onContentChange(fileKey, e.target.value)}
            className="min-h-[400px] resize-y rounded-none border-0 bg-transparent pl-14 pr-4 py-4 font-mono text-sm leading-[1.625rem] focus-visible:ring-0 focus-visible:ring-offset-0"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SandboxFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.JSX.Element {
  const { id } = React.use(params);

  // Inline fetch for any saved config files
  const { data: savedFiles, isLoading, error } = useQuery({
    queryKey: ['config-files', id],
    queryFn: async () => {
      const res = await fetch(`/api/configs/files?projectId=${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {(error as Error).message}</p></div>;

  const [fileContents, setFileContents] = useState<Record<ConfigFileKey, string>>(
    () =>
      Object.fromEntries(
        Object.entries(CONFIG_FILES).map(([key, file]) => [key, file.content])
      ) as Record<ConfigFileKey, string>
  );

  const handleContentChange = useCallback(
    (key: ConfigFileKey, value: string) => {
      setFileContents((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleDownloadAll = useCallback(() => {
    Object.entries(CONFIG_FILES).forEach(([key]) => {
      const config = CONFIG_FILES[key as ConfigFileKey];
      const content = fileContents[key as ConfigFileKey];
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = config.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }, [fileContents]);

  const fileKeys = Object.keys(CONFIG_FILES) as ConfigFileKey[];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Configuration Files
          </h1>
          <p className="text-slate-500">
            Review and customize generated sandbox configuration files. Edit
            inline or download individually.
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadAll}>
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="managed-settings">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {fileKeys.map((key) => {
                const config = CONFIG_FILES[key];
                const Icon = config.icon;
                return (
                  <TabsTrigger key={key} value={key} className="gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{config.label}</span>
                    <span className="sm:hidden">
                      {config.label.split('/').pop()?.split('.')[0]}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {fileKeys.map((key) => (
              <TabsContent key={key} value={key}>
                <CodeEditor
                  fileKey={key}
                  content={fileContents[key]}
                  onContentChange={handleContentChange}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
