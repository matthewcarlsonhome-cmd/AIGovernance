/**
 * Sandbox Validation Checks
 *
 * Each check function analyzes the sandbox configuration and generated config
 * files to produce a real validation result. These are pure functions - no
 * side effects, no network calls, fully testable.
 */

export type CheckStatus = 'passed' | 'warning' | 'failed';

export interface ValidationCheckResult {
  id: string;
  name: string;
  category: string;
  status: CheckStatus;
  details: string[];
  recommendation?: string;
}

export interface SandboxValidationInput {
  /** The sandbox_config record from the database */
  config: {
    cloud_provider: string;
    sandbox_model: string;
    vpc_cidr: string | null;
    region: string | null;
    ai_provider: string | null;
    settings: Record<string, unknown>;
  } | null;
  /** Map of filename → file content from config_files table */
  configFiles: Record<string, string>;
  /** Security settings from the configure wizard (stored in config.settings) */
  securitySettings: {
    egressFiltering?: boolean;
    domainAllowlist?: string;
    dlpEnabled?: boolean;
    dlpPatterns?: { secrets?: boolean; pii?: boolean; proprietary?: boolean };
    auditLogging?: boolean;
    siemIntegration?: string;
    selectedModel?: string;
  };
}

// ---------------------------------------------------------------------------
// Helper: safely parse JSON config file
// ---------------------------------------------------------------------------

function tryParseJson(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. Network Isolation Check
// ---------------------------------------------------------------------------

export function checkNetworkIsolation(input: SandboxValidationInput): ValidationCheckResult {
  const details: string[] = [];
  let status = 'passed' as CheckStatus;
  let recommendation: string | undefined;

  const { config, configFiles, securitySettings } = input;

  // Check egress filtering configuration
  if (securitySettings.egressFiltering) {
    details.push('Egress filtering: Enabled');

    // Check domain allowlist
    const allowlist = securitySettings.domainAllowlist || '';
    const domains = allowlist.split('\n').filter((d) => d.trim().length > 0);
    if (domains.length > 0) {
      details.push(`Domain allowlist: ${domains.length} domains configured`);

      // Check for overly permissive wildcard
      const hasWildcardAll = domains.some((d) => d.trim() === '*');
      if (hasWildcardAll) {
        status = 'warning';
        details.push('WARNING: Wildcard (*) in allowlist permits all outbound traffic');
        recommendation =
          'Remove the wildcard (*) from the domain allowlist. Only allow specific domains required for AI API access and package registries.';
      }
    } else {
      details.push('Domain allowlist: No domains configured (all egress blocked)');
    }
  } else {
    status = 'warning';
    details.push('Egress filtering: Disabled');
    recommendation =
      'Enable egress filtering to restrict outbound network traffic. Without it, the sandbox can communicate with any external service, which poses a data exfiltration risk.';
  }

  // Check docker-compose for internal network
  const dockerCompose = configFiles['docker-compose.yml'];
  if (dockerCompose) {
    if (dockerCompose.includes('internal: true')) {
      details.push('Docker network: Internal mode enabled (isolated)');
    } else {
      if (status !== 'failed') status = 'warning';
      details.push('Docker network: Not set to internal mode');
    }

    if (dockerCompose.includes('proxy:') || dockerCompose.includes('squid')) {
      details.push('Forward proxy: Configured for traffic inspection');
    }
  }

  // Check Terraform for security groups
  const terraform = configFiles['main.tf'];
  if (terraform) {
    if (
      terraform.includes('security_group') ||
      terraform.includes('firewall') ||
      terraform.includes('network_security_group')
    ) {
      details.push('Infrastructure firewall rules: Defined in Terraform');
    }

    if (terraform.includes('egress') || terraform.includes('Outbound')) {
      details.push('Egress rules: Present in infrastructure config');
    }
  }

  // Check VPC CIDR
  if (config?.vpc_cidr) {
    details.push(`VPC CIDR: ${config.vpc_cidr}`);
  }

  if (details.length === 0) {
    status = 'failed';
    details.push('No network isolation configuration found');
    recommendation =
      'Configure network isolation by enabling egress filtering in the sandbox configuration wizard, and generate infrastructure config files.';
  }

  return { id: 'net', name: 'Network Isolation', category: 'network', status, details, recommendation };
}

// ---------------------------------------------------------------------------
// 2. Authentication & Access Check
// ---------------------------------------------------------------------------

export function checkAuthentication(input: SandboxValidationInput): ValidationCheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'passed';
  let recommendation: string | undefined;

  const { configFiles, securitySettings } = input;

  // Check managed-settings for workspace trust
  const managedSettings = configFiles['managed-settings.json'];
  if (managedSettings) {
    const parsed = tryParseJson(managedSettings);
    if (parsed) {
      if (parsed['security.workspace.trust.enabled'] === true) {
        details.push('Workspace trust: Enabled');
      } else {
        details.push('Workspace trust: Not explicitly enabled');
      }

      if (parsed['extensions.autoUpdate'] === false) {
        details.push('Extension auto-update: Disabled (controlled deployment)');
      }

      const allowedExtensions = parsed['extensions.allowedExtensions'];
      if (Array.isArray(allowedExtensions) && allowedExtensions.length > 0) {
        details.push(`Extension allowlist: ${allowedExtensions.length} extensions permitted`);
      }
    }
  }

  // Check RBAC in settings
  const settings = input.config?.settings || {};
  if (settings.rbac_enabled || settings.roles) {
    details.push('RBAC: Configured');
  } else {
    details.push('RBAC: Using default roles (admin, developer, viewer)');
  }

  // Check session timeout
  if (settings.session_timeout_minutes) {
    details.push(`Session timeout: ${settings.session_timeout_minutes} minutes`);
  } else {
    details.push('Session timeout: Default (30 minutes)');
  }

  // Check MFA configuration
  if (settings.mfa_enforced) {
    details.push('MFA: Enforced for all sandbox users');
  } else {
    status = 'warning';
    details.push('MFA: Not explicitly enforced');
    recommendation =
      'Configure MFA enforcement in the sandbox settings to require multi-factor authentication for all users accessing the sandbox environment.';
  }

  // Check API key rotation
  if (settings.api_key_rotation_days) {
    details.push(`API key rotation: ${settings.api_key_rotation_days}-day policy`);
  } else {
    details.push('API key rotation: Not configured (recommend 90-day policy)');
  }

  // Check devcontainer for security
  const devcontainer = configFiles['.devcontainer/devcontainer.json'];
  if (devcontainer) {
    const parsed = tryParseJson(devcontainer);
    if (parsed) {
      const runArgs = parsed.runArgs as string[] | undefined;
      if (runArgs?.some((arg: string) => arg.includes('no-new-privileges'))) {
        details.push('Container security: no-new-privileges enforced');
      }
    }
  }

  if (details.length === 0) {
    status = 'failed';
    details.push('No authentication configuration found');
    recommendation = 'Generate sandbox configuration files to establish authentication and access controls.';
  }

  return {
    id: 'auth',
    name: 'Authentication & Access',
    category: 'security',
    status,
    details,
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// 3. DLP Configuration Check
// ---------------------------------------------------------------------------

export function checkDlpConfiguration(input: SandboxValidationInput): ValidationCheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'passed';
  let recommendation: string | undefined;

  const { securitySettings } = input;

  if (!securitySettings.dlpEnabled) {
    return {
      id: 'dlp',
      name: 'DLP Configuration',
      category: 'data_protection',
      status: 'failed',
      details: ['Data Loss Prevention: Disabled'],
      recommendation:
        'Enable DLP in the sandbox configuration to detect and prevent sensitive data from being exposed in AI prompts, code, or outputs.',
    };
  }

  details.push('Data Loss Prevention: Enabled');

  const patterns = securitySettings.dlpPatterns;
  if (patterns) {
    if (patterns.secrets) {
      details.push('Secrets pattern detection: Active (API keys, tokens, passwords)');
    } else {
      status = 'warning';
      details.push('Secrets pattern detection: Disabled');
    }

    if (patterns.pii) {
      details.push('PII detection: Active (SSN, email, phone patterns)');
    } else {
      if (status === 'passed') status = 'warning';
      details.push('PII detection: Disabled');
    }

    if (patterns.proprietary) {
      details.push('Proprietary code patterns: Active');
    } else {
      if (status === 'passed') status = 'warning';
      details.push('Proprietary code patterns: Not configured');
      recommendation =
        'Configure proprietary code detection patterns to prevent intellectual property leakage. Add file pattern deny rules for internal naming conventions.';
    }
  } else {
    status = 'warning';
    details.push('DLP patterns: No specific patterns configured');
    recommendation = 'Configure DLP patterns for secrets, PII, and proprietary code detection.';
  }

  // Check requirements.toml for DLP settings
  const requirements = input.configFiles['requirements.toml'];
  if (requirements) {
    if (requirements.includes('dlp_enabled = true')) {
      details.push('Infrastructure DLP config: Present in requirements.toml');
    }
    if (requirements.includes('secrets_scanning = true')) {
      details.push('Secrets scanning: Enabled in infrastructure config');
    }
  }

  return {
    id: 'dlp',
    name: 'DLP Configuration',
    category: 'data_protection',
    status,
    details,
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// 4. Audit Logging Check
// ---------------------------------------------------------------------------

export function checkAuditLogging(input: SandboxValidationInput): ValidationCheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'passed';
  let recommendation: string | undefined;

  const { configFiles, securitySettings } = input;

  if (!securitySettings.auditLogging) {
    return {
      id: 'audit',
      name: 'Audit Logging',
      category: 'compliance',
      status: 'failed',
      details: ['Audit logging: Disabled'],
      recommendation:
        'Enable audit logging to capture all AI interactions, file access, and configuration changes. This is required for compliance and governance review.',
    };
  }

  details.push('Audit logging: Enabled');

  // Check managed-settings for audit config
  const managedSettings = configFiles['managed-settings.json'];
  if (managedSettings) {
    const parsed = tryParseJson(managedSettings);
    if (parsed) {
      if (parsed['claude-code.auditLog.enabled'] === true) {
        details.push('API call logging: Active (all model interactions captured)');
      }

      const destination = parsed['claude-code.auditLog.destination'];
      if (destination) {
        details.push(`Log destination: ${destination}`);
      }
    }
  }

  // Check docker-compose for audit logger service
  const dockerCompose = configFiles['docker-compose.yml'];
  if (dockerCompose) {
    if (dockerCompose.includes('audit-logger') || dockerCompose.includes('fluent-bit')) {
      details.push('Log aggregation: Fluent Bit configured');
    }
    if (dockerCompose.includes('audit-logs')) {
      details.push('File access logging: Active (read/write operations tracked)');
    }
  }

  // Check SIEM integration
  if (securitySettings.siemIntegration && securitySettings.siemIntegration !== 'none') {
    const siemName = securitySettings.siemIntegration.charAt(0).toUpperCase() + securitySettings.siemIntegration.slice(1);
    details.push(`SIEM integration: Connected (${siemName})`);
  } else {
    if (status === 'passed') status = 'warning';
    details.push('SIEM integration: Not configured');
    recommendation =
      'Connect a SIEM platform (Splunk, Datadog, Elastic) to aggregate and monitor audit logs in real-time.';
  }

  // Check Terraform for logging resources
  const terraform = configFiles['main.tf'];
  if (terraform) {
    if (
      terraform.includes('cloudwatch_log_group') ||
      terraform.includes('logging') ||
      terraform.includes('log_analytics')
    ) {
      details.push('Cloud logging: Infrastructure logging resources defined');
    }
  }

  // Check requirements.toml
  const requirements = configFiles['requirements.toml'];
  if (requirements) {
    if (requirements.includes('audit_logging = true')) {
      details.push('Log retention: Configured in infrastructure requirements');
    }
  }

  return {
    id: 'audit',
    name: 'Audit Logging',
    category: 'compliance',
    status,
    details,
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// 5. Managed Settings Check
// ---------------------------------------------------------------------------

export function checkManagedSettings(input: SandboxValidationInput): ValidationCheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'passed';
  let recommendation: string | undefined;

  const managedSettings = input.configFiles['managed-settings.json'];

  if (!managedSettings) {
    return {
      id: 'settings',
      name: 'Managed Settings',
      category: 'configuration',
      status: 'failed',
      details: ['managed-settings.json: Not generated'],
      recommendation:
        'Generate sandbox configuration files from the Configure page. The managed-settings.json file controls AI tool behavior, model restrictions, and security policies.',
    };
  }

  const parsed = tryParseJson(managedSettings);
  if (!parsed) {
    return {
      id: 'settings',
      name: 'Managed Settings',
      category: 'configuration',
      status: 'failed',
      details: ['managed-settings.json: Invalid JSON - file is corrupted or malformed'],
      recommendation: 'Regenerate the managed-settings.json file from the sandbox configuration wizard.',
    };
  }

  details.push('managed-settings.json: Valid and parseable');

  // Check sandbox mode
  if (parsed['claude-code.sandboxMode'] === true) {
    details.push('Sandbox mode: Enabled');
  } else {
    status = 'failed';
    details.push('Sandbox mode: Not enabled');
    recommendation = 'Enable sandboxMode in managed-settings.json to restrict AI agent capabilities.';
  }

  // Check model restrictions
  const model = parsed['claude-code.model'];
  if (model) {
    details.push(`Model restrictions: Applied (${model})`);
  } else {
    if (status === 'passed') status = 'warning';
    details.push('Model restrictions: No specific model enforced');
  }

  // Check token limits
  const maxTokens = parsed['claude-code.maxTokensPerRequest'];
  if (maxTokens) {
    details.push(`Token limits: Configured (${maxTokens} max output)`);
  }

  // Check allowed endpoints
  const allowed = parsed['claude-code.allowedApiEndpoints'];
  if (Array.isArray(allowed) && allowed.length > 0) {
    details.push(`API endpoint allowlist: ${allowed.length} endpoints permitted`);
  }

  // Check blocked endpoints
  const blocked = parsed['claude-code.blockedApiEndpoints'];
  if (Array.isArray(blocked) && blocked.includes('*')) {
    details.push('API endpoint blocklist: Default deny-all configured');
  }

  // Check extensions
  const extensions = parsed['extensions.allowedExtensions'];
  if (Array.isArray(extensions)) {
    details.push(`Extension allowlist: ${extensions.length} extensions active`);
  }

  return {
    id: 'settings',
    name: 'Managed Settings',
    category: 'configuration',
    status,
    details,
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// 6. Tool Restrictions Check
// ---------------------------------------------------------------------------

export function checkToolRestrictions(input: SandboxValidationInput): ValidationCheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'passed';
  let recommendation: string | undefined;

  const { configFiles } = input;
  const settings = input.config?.settings || {};

  // Check MCP server policy
  if (settings.mcp_server_policy === 'restricted' || settings.mcp_server_policy === 'allowlist') {
    details.push(`MCP server policy: ${settings.mcp_server_policy}`);
    if (Array.isArray(settings.mcp_allowed_servers)) {
      details.push(`Allowed MCP servers: ${(settings.mcp_allowed_servers as string[]).length} servers configured`);
    }
  } else {
    status = 'failed';
    details.push('MCP server policy: Not deployed');
    recommendation =
      'Deploy MCP server policy via managed-settings.json to restrict which tools the AI agent can invoke. Set mcp_server_policy to "restricted" and define allowed servers.';
  }

  // Check managed settings for tool-related config
  const managedSettings = configFiles['managed-settings.json'];
  if (managedSettings) {
    const parsed = tryParseJson(managedSettings);
    if (parsed) {
      const extensions = parsed['extensions.allowedExtensions'];
      if (Array.isArray(extensions)) {
        details.push(`Extension restriction: ${extensions.length} extensions allowlisted`);
      }

      if (parsed['extensions.autoUpdate'] === false) {
        details.push('Extension auto-update: Disabled (prevents unauthorized tool changes)');
      }

      if (parsed['git.requireSignedCommits']) {
        details.push('Git signed commits: Required');
      }
    }
  }

  // Check CLAUDE.md for operation restrictions
  const claudeMd = configFiles['CLAUDE.md'];
  if (claudeMd) {
    if (claudeMd.includes('Restricted Operations')) {
      details.push('CLAUDE.md: Restricted operations defined');
    }
    if (claudeMd.includes('Allowed Operations')) {
      details.push('CLAUDE.md: Allowed operations scoped');
    }
  } else {
    if (status === 'passed') status = 'warning';
    details.push('CLAUDE.md: Not generated (AI agent has no project-level restrictions)');
  }

  // Check devcontainer for security restrictions
  const devcontainer = configFiles['.devcontainer/devcontainer.json'];
  if (devcontainer) {
    const parsed = tryParseJson(devcontainer);
    if (parsed) {
      const runArgs = parsed.runArgs as string[] | undefined;
      if (runArgs?.some((arg: string) => arg.includes('no-new-privileges'))) {
        details.push('Container privilege escalation: Blocked');
      }
      if (runArgs?.some((arg: string) => arg.includes('--memory'))) {
        details.push('Resource limits: Memory limits enforced');
      }
      if (runArgs?.some((arg: string) => arg.includes('--cpus'))) {
        details.push('Resource limits: CPU limits enforced');
      }
    }
  }

  if (details.length === 0) {
    status = 'failed';
    details.push('No tool restriction configuration found');
    recommendation =
      'Generate sandbox configuration files and configure MCP server policies to restrict AI agent tool access.';
  }

  return {
    id: 'tools',
    name: 'Tool Restrictions',
    category: 'security',
    status,
    details,
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// 7. Config File Completeness Check
// ---------------------------------------------------------------------------

const EXPECTED_FILES = [
  'managed-settings.json',
  'requirements.toml',
  'CLAUDE.md',
  'docker-compose.yml',
  '.devcontainer/devcontainer.json',
  'main.tf',
];

export function checkConfigCompleteness(input: SandboxValidationInput): ValidationCheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'passed';
  let recommendation: string | undefined;

  const fileNames = Object.keys(input.configFiles);

  if (fileNames.length === 0) {
    return {
      id: 'completeness',
      name: 'Config File Completeness',
      category: 'configuration',
      status: 'failed',
      details: ['No configuration files generated'],
      recommendation:
        'Go to Sandbox > Configure to set up and generate all required configuration files for the sandbox environment.',
    };
  }

  const missing: string[] = [];
  const present: string[] = [];

  for (const expected of EXPECTED_FILES) {
    if (input.configFiles[expected]) {
      present.push(expected);
    } else {
      missing.push(expected);
    }
  }

  details.push(`Config files generated: ${present.length}/${EXPECTED_FILES.length}`);

  for (const file of present) {
    const content = input.configFiles[file];
    const sizeKb = (new TextEncoder().encode(content).length / 1024).toFixed(1);
    details.push(`${file}: Present (${sizeKb} KB)`);
  }

  if (missing.length > 0) {
    status = missing.length >= 3 ? 'failed' : 'warning';
    for (const file of missing) {
      details.push(`${file}: Missing`);
    }
    recommendation = `Generate missing configuration files: ${missing.join(', ')}. Re-run the sandbox configuration wizard to regenerate.`;
  }

  // Check for TODO/placeholder content
  const filesWithTodos: string[] = [];
  for (const [name, content] of Object.entries(input.configFiles)) {
    if (content.includes('TODO:') || content.includes('PLACEHOLDER')) {
      filesWithTodos.push(name);
    }
  }
  if (filesWithTodos.length > 0) {
    if (status === 'passed') status = 'warning';
    details.push(`Files with TODO/placeholder items: ${filesWithTodos.join(', ')}`);
  }

  return {
    id: 'completeness',
    name: 'Config File Completeness',
    category: 'configuration',
    status,
    details,
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// 8. Infrastructure Readiness Check
// ---------------------------------------------------------------------------

export function checkInfrastructureReadiness(input: SandboxValidationInput): ValidationCheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'passed';
  let recommendation: string | undefined;

  const { config, configFiles } = input;

  if (!config) {
    return {
      id: 'infra',
      name: 'Infrastructure Readiness',
      category: 'infrastructure',
      status: 'failed',
      details: ['No sandbox configuration found'],
      recommendation:
        'Create a sandbox configuration by going to Sandbox > Configure and completing the setup wizard.',
    };
  }

  details.push(`Cloud provider: ${config.cloud_provider}`);
  details.push(`Sandbox model: ${config.sandbox_model}`);
  if (config.region) details.push(`Region: ${config.region}`);

  // Check Terraform matches cloud provider
  const terraform = configFiles['main.tf'];
  if (terraform) {
    const providerMap: Record<string, string> = {
      aws: 'hashicorp/aws',
      gcp: 'hashicorp/google',
      azure: 'hashicorp/azurerm',
    };

    const expectedProvider = providerMap[config.cloud_provider];
    if (expectedProvider) {
      if (terraform.includes(expectedProvider)) {
        details.push('Terraform provider: Matches selected cloud provider');
      } else {
        status = 'warning';
        details.push('Terraform provider: Does not match selected cloud provider');
        recommendation =
          'Regenerate Terraform configuration to match the selected cloud provider.';
      }
    }

    // Check for essential resources
    if (terraform.includes('vpc') || terraform.includes('vnet') || terraform.includes('compute_network')) {
      details.push('Network infrastructure: Defined');
    }
    if (terraform.includes('log') || terraform.includes('monitor') || terraform.includes('audit')) {
      details.push('Monitoring/logging: Defined');
    }
    if (terraform.includes('security_group') || terraform.includes('firewall') || terraform.includes('nsg')) {
      details.push('Security controls: Defined');
    }
  } else {
    if (status === 'passed') status = 'warning';
    details.push('Terraform config: Not generated');
  }

  // Check Docker Compose
  const dockerCompose = configFiles['docker-compose.yml'];
  if (dockerCompose) {
    const serviceCount = (dockerCompose.match(/^\s{2}\w[\w-]*:/gm) || []).length;
    details.push(`Docker Compose: ${serviceCount} services defined`);

    if (dockerCompose.includes('resource') || dockerCompose.includes('limits')) {
      details.push('Resource limits: Configured');
    }
    if (dockerCompose.includes('security_opt')) {
      details.push('Container security options: Applied');
    }
  }

  // Check devcontainer
  if (configFiles['.devcontainer/devcontainer.json']) {
    details.push('Dev container: Configured');
  }

  // Check requirements.toml
  const requirements = configFiles['requirements.toml'];
  if (requirements) {
    if (requirements.includes('[runtime]')) {
      details.push('Runtime requirements: Specified');
    }
    if (requirements.includes('[tools.required]')) {
      details.push('Required tooling: Defined');
    }
    if (requirements.includes('[limits]')) {
      details.push('Resource limits: Defined in requirements');
    }
  }

  return {
    id: 'infra',
    name: 'Infrastructure Readiness',
    category: 'infrastructure',
    status,
    details,
    recommendation,
  };
}
