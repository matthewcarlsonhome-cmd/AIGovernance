import type { ConfigFile, SandboxConfig } from '@/types';

// ---------------------------------------------------------------------------
// Helper: deterministic ID generation for config files
// ---------------------------------------------------------------------------

function configFileId(sandboxConfigId: string, filename: string): string {
  return `${sandboxConfigId}-${filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// 1. managed-settings.json  (Claude Code / VS Code managed settings)
// ---------------------------------------------------------------------------

export function generateManagedSettings(config: SandboxConfig): ConfigFile {
  const allowedDomains: string[] = [];
  const blockedDomains: string[] = ['*'];

  // Allow AI provider endpoints based on settings
  const aiProvider = (config.settings.ai_provider as string) || 'anthropic';
  if (aiProvider === 'anthropic' || aiProvider === 'both') {
    allowedDomains.push('api.anthropic.com', 'claude.ai');
  }
  if (aiProvider === 'openai' || aiProvider === 'both') {
    allowedDomains.push('api.openai.com');
  }

  // Always allow package registries
  allowedDomains.push('registry.npmjs.org', 'pypi.org', 'rubygems.org');

  const settings = {
    'claude-code.allowedApiEndpoints': allowedDomains,
    'claude-code.blockedApiEndpoints': blockedDomains,
    'claude-code.telemetryEnabled': config.settings.telemetry !== false,
    'claude-code.maxTokensPerRequest': config.settings.max_tokens || 4096,
    'claude-code.model': config.settings.model || 'claude-sonnet-4-20250514',
    'claude-code.sandboxMode': true,
    'claude-code.auditLog.enabled': true,
    'claude-code.auditLog.destination': config.settings.log_destination || 'local',
    'editor.formatOnSave': true,
    'editor.codeActionsOnSave': {
      'source.fixAll': 'explicit',
    },
    'git.requireSignedCommits': config.settings.require_signed_commits || false,
    'security.workspace.trust.enabled': true,
    'extensions.autoUpdate': false,
    'extensions.allowedExtensions': [
      'anthropics.claude-code',
      'github.copilot',
      'dbaeumer.vscode-eslint',
      'esbenp.prettier-vscode',
    ],
  };

  return {
    id: configFileId(config.id, 'managed-settings.json'),
    sandbox_config_id: config.id,
    filename: 'managed-settings.json',
    file_type: 'json',
    content: JSON.stringify(settings, null, 2),
    description: 'VS Code / Claude Code managed settings for sandbox environment. Controls API access, audit logging, and editor behaviour.',
    created_at: nowISO(),
  };
}

// ---------------------------------------------------------------------------
// 2. requirements.toml  (sandbox dependency and tool requirements)
// ---------------------------------------------------------------------------

export function generateRequirementsToml(config: SandboxConfig): ConfigFile {
  const provider = config.cloud_provider;
  const region = config.region || 'us-east-1';

  const lines: string[] = [
    '# GovAI Studio - Sandbox Requirements',
    '# Auto-generated configuration for AI coding tool sandbox',
    '',
    '[metadata]',
    `generated_at = "${nowISO()}"`,
    `cloud_provider = "${provider}"`,
    `region = "${region}"`,
    `sandbox_model = "${config.sandbox_model}"`,
    '',
    '[runtime]',
    'node_version = "20.x"',
    'python_version = "3.12"',
    'go_version = "1.22"',
    '',
    '[tools.required]',
    'claude-code = ">=1.0.0"',
    'git = ">=2.40"',
    'docker = ">=24.0"',
    '',
    '[tools.optional]',
    'terraform = ">=1.7"',
    'kubectl = ">=1.29"',
    'aws-cli = ">=2.15"',
    '',
    '[network]',
  ];

  if (config.vpc_cidr) {
    lines.push(`vpc_cidr = "${config.vpc_cidr}"`);
  } else {
    lines.push('vpc_cidr = "10.100.0.0/16"');
  }

  lines.push(
    `egress_allowed = ["api.anthropic.com:443", "api.openai.com:443", "registry.npmjs.org:443"]`,
    'egress_deny_default = true',
    '',
    '[security]',
    'dlp_enabled = true',
    'secrets_scanning = true',
    'audit_logging = true',
    `encryption_at_rest = ${config.settings.encryption_at_rest !== false}`,
    '',
    '[limits]',
    `max_concurrent_sessions = ${config.settings.max_sessions || 10}`,
    `max_tokens_per_day = ${config.settings.max_daily_tokens || 1000000}`,
    `storage_gb = ${config.settings.storage_gb || 50}`,
  );

  return {
    id: configFileId(config.id, 'requirements.toml'),
    sandbox_config_id: config.id,
    filename: 'requirements.toml',
    file_type: 'toml',
    content: lines.join('\n'),
    description: 'Sandbox environment requirements including runtime versions, tooling, network rules, and resource limits.',
    created_at: nowISO(),
  };
}

// ---------------------------------------------------------------------------
// 3. CLAUDE.md  (project-level instructions for Claude Code)
// ---------------------------------------------------------------------------

export function generateClaudeMd(config: SandboxConfig, projectName: string): ConfigFile {
  const content = `# CLAUDE.md - ${projectName} Sandbox

## Project Context
This is a sandboxed environment for evaluating AI coding tools as part of the
${projectName} governance engagement. All code generated in this sandbox is
subject to the organization's Acceptable Use Policy (AUP).

## Allowed Operations
- Read and write files within the project workspace
- Run tests via the configured test runner
- Execute linting and formatting commands
- Make git commits to feature branches

## Restricted Operations
- Do NOT access files outside the project workspace
- Do NOT make network requests to endpoints not in the allowlist
- Do NOT commit directly to main/production branches
- Do NOT install packages not listed in the approved dependency list
- Do NOT access or process files classified as "Confidential" or "Restricted"

## Code Quality Standards
- All code must pass ESLint / configured linter before commit
- All new functions must include JSDoc / docstring documentation
- Test coverage must not decrease below the established baseline
- No secrets, API keys, or credentials in code or comments
- Follow the team's established coding conventions and patterns

## Data Handling Rules
- No PII or sensitive data in prompts or code comments
- Do not reference internal system names, IP addresses, or architecture details
- Sanitize all example data - use synthetic/mock values only
- Report any accidental exposure of sensitive data immediately

## Audit & Compliance
- All AI interactions are logged for audit purposes
- Generated code will be reviewed by a human before merging
- This sandbox is monitored as part of the PoC evaluation metrics
- Cloud provider: ${config.cloud_provider}
- Region: ${config.region || 'us-east-1'}
`;

  return {
    id: configFileId(config.id, 'CLAUDE.md'),
    sandbox_config_id: config.id,
    filename: 'CLAUDE.md',
    file_type: 'markdown',
    content,
    description: 'Project-level instructions for Claude Code that define allowed operations, restrictions, and compliance rules within the sandbox.',
    created_at: nowISO(),
  };
}

// ---------------------------------------------------------------------------
// 4. docker-compose.yml  (sandbox container orchestration)
// ---------------------------------------------------------------------------

export function generateDockerCompose(config: SandboxConfig): ConfigFile {
  const networkCidr = config.vpc_cidr || '10.100.0.0/16';
  const maxSessions = config.settings.max_sessions || 10;

  const content = `# GovAI Studio - Sandbox Docker Compose
# Auto-generated for ${config.cloud_provider} / ${config.sandbox_model}

version: "3.9"

services:
  sandbox-workspace:
    build:
      context: .
      dockerfile: Dockerfile.sandbox
    container_name: govai-sandbox
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - SANDBOX_MODE=true
      - AUDIT_LOG_ENABLED=true
      - MAX_CONCURRENT_SESSIONS=${maxSessions}
    volumes:
      - workspace-data:/home/developer/workspace
      - ./managed-settings.json:/home/developer/.vscode/settings.json:ro
      - ./CLAUDE.md:/home/developer/workspace/CLAUDE.md:ro
    networks:
      - sandbox-net
    deploy:
      resources:
        limits:
          cpus: "${config.settings.cpu_limit || '4.0'}"
          memory: ${config.settings.memory_limit || '8G'}
        reservations:
          cpus: "1.0"
          memory: 2G
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp:size=1G

  proxy:
    image: ubuntu/squid:latest
    container_name: govai-proxy
    restart: unless-stopped
    volumes:
      - ./proxy/squid.conf:/etc/squid/squid.conf:ro
      - proxy-logs:/var/log/squid
    networks:
      - sandbox-net
      - external-net
    ports:
      - "3128:3128"

  audit-logger:
    image: fluent/fluent-bit:latest
    container_name: govai-audit
    restart: unless-stopped
    volumes:
      - ./fluent-bit/fluent-bit.conf:/fluent-bit/etc/fluent-bit.conf:ro
      - audit-logs:/var/log/audit
    networks:
      - sandbox-net
    depends_on:
      - sandbox-workspace

volumes:
  workspace-data:
    driver: local
  proxy-logs:
    driver: local
  audit-logs:
    driver: local

networks:
  sandbox-net:
    driver: bridge
    ipam:
      config:
        - subnet: ${networkCidr}
    internal: true
  external-net:
    driver: bridge
`;

  return {
    id: configFileId(config.id, 'docker-compose.yml'),
    sandbox_config_id: config.id,
    filename: 'docker-compose.yml',
    file_type: 'yaml',
    content,
    description: 'Docker Compose configuration for the sandbox environment including workspace, network proxy, and audit logging containers.',
    created_at: nowISO(),
  };
}

// ---------------------------------------------------------------------------
// 5. devcontainer.json  (VS Code Dev Container configuration)
// ---------------------------------------------------------------------------

export function generateDevcontainer(config: SandboxConfig): ConfigFile {
  const devcontainer = {
    name: 'GovAI Sandbox',
    build: {
      dockerfile: 'Dockerfile.sandbox',
      context: '..',
    },
    features: {
      'ghcr.io/devcontainers/features/node:1': {
        version: '20',
      },
      'ghcr.io/devcontainers/features/python:1': {
        version: '3.12',
      },
      'ghcr.io/devcontainers/features/git:1': {
        version: 'latest',
      },
      'ghcr.io/devcontainers/features/docker-in-docker:2': {
        version: 'latest',
      },
    },
    customizations: {
      vscode: {
        settings: {
          'claude-code.sandboxMode': true,
          'claude-code.auditLog.enabled': true,
          'terminal.integrated.defaultProfile.linux': 'bash',
        },
        extensions: [
          'anthropics.claude-code',
          'dbaeumer.vscode-eslint',
          'esbenp.prettier-vscode',
          'ms-python.python',
          'eamodio.gitlens',
        ],
      },
    },
    forwardPorts: [3000, 8080],
    postCreateCommand: 'npm install && echo "Sandbox ready"',
    remoteUser: 'developer',
    containerEnv: {
      SANDBOX_MODE: 'true',
      AUDIT_LOG_ENABLED: 'true',
      CLOUD_PROVIDER: config.cloud_provider,
      REGION: config.region || 'us-east-1',
    },
    mounts: [
      'source=govai-workspace,target=/home/developer/workspace,type=volume',
    ],
    runArgs: [
      '--security-opt=no-new-privileges',
      `--memory=${config.settings.memory_limit || '8g'}`,
      `--cpus=${config.settings.cpu_limit || '4'}`,
    ],
  };

  return {
    id: configFileId(config.id, 'devcontainer.json'),
    sandbox_config_id: config.id,
    filename: '.devcontainer/devcontainer.json',
    file_type: 'json',
    content: JSON.stringify(devcontainer, null, 2),
    description: 'VS Code Dev Container configuration for consistent, isolated development environments with AI tool integration.',
    created_at: nowISO(),
  };
}

// ---------------------------------------------------------------------------
// 6. main.tf  (Terraform HCL for cloud sandbox infrastructure)
// ---------------------------------------------------------------------------

export function generateTerraform(config: SandboxConfig): ConfigFile {
  const provider = config.cloud_provider;
  const region = config.region || 'us-east-1';
  const vpcCidr = config.vpc_cidr || '10.100.0.0/16';

  let content: string;

  if (provider === 'aws') {
    content = generateAwsTerraform(region, vpcCidr, config);
  } else if (provider === 'gcp') {
    content = generateGcpTerraform(region, vpcCidr, config);
  } else if (provider === 'azure') {
    content = generateAzureTerraform(region, vpcCidr, config);
  } else {
    content = generateGenericTerraform(region, vpcCidr, config);
  }

  return {
    id: configFileId(config.id, 'main.tf'),
    sandbox_config_id: config.id,
    filename: 'main.tf',
    file_type: 'hcl',
    content,
    description: `Terraform configuration for ${provider} sandbox infrastructure with network isolation, access controls, and monitoring.`,
    created_at: nowISO(),
  };
}

// ---------------------------------------------------------------------------
// Terraform provider-specific generators
// ---------------------------------------------------------------------------

function generateAwsTerraform(region: string, vpcCidr: string, config: SandboxConfig): string {
  return `# GovAI Studio - AWS Sandbox Infrastructure
# Auto-generated Terraform configuration

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "govai-terraform-state"
    key    = "sandbox/terraform.tfstate"
    region = "${region}"
  }
}

provider "aws" {
  region = "${region}"

  default_tags {
    tags = {
      Project     = "govai-sandbox"
      Environment = "sandbox"
      ManagedBy   = "terraform"
    }
  }
}

# ---------- Networking ----------

resource "aws_vpc" "sandbox" {
  cidr_block           = "${vpcCidr}"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "govai-sandbox-vpc"
  }
}

resource "aws_subnet" "sandbox_private" {
  vpc_id            = aws_vpc.sandbox.id
  cidr_block        = cidrsubnet(aws_vpc.sandbox.cidr_block, 8, 1)
  availability_zone = "${region}a"

  tags = {
    Name = "govai-sandbox-private"
  }
}

resource "aws_internet_gateway" "sandbox" {
  vpc_id = aws_vpc.sandbox.id

  tags = {
    Name = "govai-sandbox-igw"
  }
}

resource "aws_nat_gateway" "sandbox" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.sandbox_private.id

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

# ---------- Security Groups ----------

resource "aws_security_group" "sandbox_workspace" {
  name_prefix = "govai-sandbox-"
  vpc_id      = aws_vpc.sandbox.id
  description = "Security group for AI sandbox workspaces"

  # Allow HTTPS egress to AI API endpoints only
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS egress (filtered by proxy)"
  }

  # Deny all other egress
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Deny all other egress"
  }

  tags = {
    Name = "govai-sandbox-workspace-sg"
  }
}

# ---------- CloudWatch Logging ----------

resource "aws_cloudwatch_log_group" "sandbox_audit" {
  name              = "/govai/sandbox/audit"
  retention_in_days = 90

  tags = {
    Name = "govai-sandbox-audit-logs"
  }
}

# ---------- Outputs ----------

output "vpc_id" {
  value       = aws_vpc.sandbox.id
  description = "Sandbox VPC ID"
}

output "subnet_id" {
  value       = aws_subnet.sandbox_private.id
  description = "Sandbox private subnet ID"
}

output "security_group_id" {
  value       = aws_security_group.sandbox_workspace.id
  description = "Sandbox workspace security group ID"
}
`;
}

function generateGcpTerraform(region: string, vpcCidr: string, config: SandboxConfig): string {
  return `# GovAI Studio - GCP Sandbox Infrastructure
# Auto-generated Terraform configuration

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  description = "GCP project ID for sandbox"
  type        = string
}

provider "google" {
  project = var.project_id
  region  = "${region}"
}

# ---------- Networking ----------

resource "google_compute_network" "sandbox" {
  name                    = "govai-sandbox-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "sandbox_private" {
  name          = "govai-sandbox-private"
  ip_cidr_range = "${vpcCidr}"
  region        = "${region}"
  network       = google_compute_network.sandbox.id

  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 1.0
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# ---------- Firewall Rules ----------

resource "google_compute_firewall" "sandbox_egress_allow" {
  name      = "govai-sandbox-egress-allow"
  network   = google_compute_network.sandbox.name
  direction = "EGRESS"
  priority  = 1000

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  destination_ranges = ["0.0.0.0/0"]

  target_tags = ["govai-sandbox"]
}

resource "google_compute_firewall" "sandbox_egress_deny" {
  name      = "govai-sandbox-egress-deny"
  network   = google_compute_network.sandbox.name
  direction = "EGRESS"
  priority  = 65534

  deny {
    protocol = "all"
  }

  destination_ranges = ["0.0.0.0/0"]

  target_tags = ["govai-sandbox"]
}

# ---------- Cloud Logging ----------

resource "google_logging_project_sink" "sandbox_audit" {
  name        = "govai-sandbox-audit-sink"
  destination = "logging.googleapis.com/projects/\${var.project_id}/locations/global/buckets/govai-sandbox-audit"

  filter = "resource.type=\\"gce_instance\\" AND labels.environment=\\"sandbox\\""
}

# ---------- Outputs ----------

output "network_id" {
  value       = google_compute_network.sandbox.id
  description = "Sandbox VPC network ID"
}

output "subnet_id" {
  value       = google_compute_subnetwork.sandbox_private.id
  description = "Sandbox private subnet ID"
}
`;
}

function generateAzureTerraform(region: string, vpcCidr: string, config: SandboxConfig): string {
  return `# GovAI Studio - Azure Sandbox Infrastructure
# Auto-generated Terraform configuration

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# ---------- Resource Group ----------

resource "azurerm_resource_group" "sandbox" {
  name     = "govai-sandbox-rg"
  location = "${region}"

  tags = {
    Project     = "govai-sandbox"
    Environment = "sandbox"
    ManagedBy   = "terraform"
  }
}

# ---------- Networking ----------

resource "azurerm_virtual_network" "sandbox" {
  name                = "govai-sandbox-vnet"
  address_space       = ["${vpcCidr}"]
  location            = azurerm_resource_group.sandbox.location
  resource_group_name = azurerm_resource_group.sandbox.name
}

resource "azurerm_subnet" "sandbox_private" {
  name                 = "govai-sandbox-private"
  resource_group_name  = azurerm_resource_group.sandbox.name
  virtual_network_name = azurerm_virtual_network.sandbox.name
  address_prefixes     = [cidrsubnet("${vpcCidr}", 8, 1)]
}

# ---------- Network Security Group ----------

resource "azurerm_network_security_group" "sandbox" {
  name                = "govai-sandbox-nsg"
  location            = azurerm_resource_group.sandbox.location
  resource_group_name = azurerm_resource_group.sandbox.name

  security_rule {
    name                       = "AllowHTTPSOutbound"
    priority                   = 100
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "DenyAllOutbound"
    priority                   = 4096
    direction                  = "Outbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "sandbox" {
  subnet_id                 = azurerm_subnet.sandbox_private.id
  network_security_group_id = azurerm_network_security_group.sandbox.id
}

# ---------- Log Analytics ----------

resource "azurerm_log_analytics_workspace" "sandbox" {
  name                = "govai-sandbox-logs"
  location            = azurerm_resource_group.sandbox.location
  resource_group_name = azurerm_resource_group.sandbox.name
  sku                 = "PerGB2018"
  retention_in_days   = 90
}

# ---------- Outputs ----------

output "resource_group_name" {
  value       = azurerm_resource_group.sandbox.name
  description = "Sandbox resource group name"
}

output "vnet_id" {
  value       = azurerm_virtual_network.sandbox.id
  description = "Sandbox VNet ID"
}

output "subnet_id" {
  value       = azurerm_subnet.sandbox_private.id
  description = "Sandbox private subnet ID"
}
`;
}

function generateGenericTerraform(region: string, vpcCidr: string, config: SandboxConfig): string {
  return `# GovAI Studio - On-Premises / Generic Sandbox Infrastructure
# Auto-generated Terraform configuration
#
# This is a template for on-premises or custom cloud environments.
# Adapt the resources below to match your infrastructure provider.

terraform {
  required_version = ">= 1.7.0"
}

# ---------- Variables ----------

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "sandbox"
}

variable "network_cidr" {
  description = "Network CIDR for sandbox"
  type        = string
  default     = "${vpcCidr}"
}

variable "region" {
  description = "Deployment region"
  type        = string
  default     = "${region}"
}

# ---------- Local Values ----------

locals {
  common_tags = {
    Project     = "govai-sandbox"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ---------- Outputs ----------

output "environment" {
  value       = var.environment
  description = "Deployment environment"
}

output "network_cidr" {
  value       = var.network_cidr
  description = "Sandbox network CIDR"
}

# TODO: Add provider-specific resources for your on-premises or custom cloud environment.
# Key resources to provision:
# 1. Isolated network segment (VLAN/subnet) with CIDR: ${vpcCidr}
# 2. Firewall rules allowing HTTPS egress to AI API endpoints only
# 3. Forward proxy for traffic inspection and logging
# 4. Centralized audit logging destination
# 5. Container runtime (Docker) for sandbox workspaces
`;
}

// ---------------------------------------------------------------------------
// Convenience: generate ALL config files for a sandbox
// ---------------------------------------------------------------------------

export function generateAllConfigFiles(config: SandboxConfig, projectName: string): ConfigFile[] {
  return [
    generateManagedSettings(config),
    generateRequirementsToml(config),
    generateClaudeMd(config, projectName),
    generateDockerCompose(config),
    generateDevcontainer(config),
    generateTerraform(config),
  ];
}
