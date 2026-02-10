/**
 * Sandbox Validation Engine
 *
 * Orchestrates all validation checks against a project's sandbox configuration.
 * Pure function - takes config + files in, returns validation results out.
 */

import type { SandboxConfig, ConfigFile } from '@/types';
import {
  checkNetworkIsolation,
  checkAuthentication,
  checkDlpConfiguration,
  checkAuditLogging,
  checkManagedSettings,
  checkToolRestrictions,
  checkConfigCompleteness,
  checkInfrastructureReadiness,
} from './checks';
import type { ValidationCheckResult, SandboxValidationInput } from './checks';

export type { ValidationCheckResult };

export interface ValidationRunResult {
  /** Unique run ID */
  runId: string;
  /** Project ID */
  projectId: string;
  /** ISO timestamp of when validation ran */
  validatedAt: string;
  /** Overall status - worst of all individual checks */
  overallStatus: 'passed' | 'warning' | 'failed';
  /** Summary counts */
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
  /** Individual check results */
  checks: ValidationCheckResult[];
}

/**
 * Extract security settings from the config.settings JSON field.
 * The sandbox configure wizard stores these as nested keys.
 */
function extractSecuritySettings(
  settings: Record<string, unknown>,
): SandboxValidationInput['securitySettings'] {
  return {
    egressFiltering: settings.egressFiltering as boolean | undefined ?? settings.egress_filtering as boolean | undefined,
    domainAllowlist: settings.domainAllowlist as string | undefined ?? settings.domain_allowlist as string | undefined,
    dlpEnabled: settings.dlpEnabled as boolean | undefined ?? settings.dlp_enabled as boolean | undefined,
    dlpPatterns: (settings.dlpPatterns ?? settings.dlp_patterns) as
      | { secrets?: boolean; pii?: boolean; proprietary?: boolean }
      | undefined,
    auditLogging: settings.auditLogging as boolean | undefined ?? settings.audit_logging as boolean | undefined,
    siemIntegration: settings.siemIntegration as string | undefined ?? settings.siem_integration as string | undefined,
    selectedModel: settings.selectedModel as string | undefined ?? settings.model as string | undefined,
  };
}

/**
 * Run all validation checks against a sandbox configuration.
 *
 * @param projectId - The project ID
 * @param config - The sandbox_config record (null if none exists)
 * @param configFiles - Array of config_files records
 * @returns Full validation run result
 */
export function runValidation(
  projectId: string,
  config: SandboxConfig | null,
  configFiles: ConfigFile[],
): ValidationRunResult {
  // Build file map: filename → content
  const fileMap: Record<string, string> = {};
  for (const file of configFiles) {
    fileMap[file.filename] = file.content;
  }

  // Extract security settings from config
  const securitySettings = config
    ? extractSecuritySettings(config.settings)
    : {};

  // Build input
  const input: SandboxValidationInput = {
    config: config
      ? {
          cloud_provider: config.cloud_provider,
          sandbox_model: config.sandbox_model,
          vpc_cidr: config.vpc_cidr,
          region: config.region,
          ai_provider: config.ai_provider,
          settings: config.settings,
        }
      : null,
    configFiles: fileMap,
    securitySettings,
  };

  // Run all checks
  const checks: ValidationCheckResult[] = [
    checkNetworkIsolation(input),
    checkAuthentication(input),
    checkDlpConfiguration(input),
    checkAuditLogging(input),
    checkManagedSettings(input),
    checkToolRestrictions(input),
    checkConfigCompleteness(input),
    checkInfrastructureReadiness(input),
  ];

  // Calculate summary
  const passed = checks.filter((c) => c.status === 'passed').length;
  const warnings = checks.filter((c) => c.status === 'warning').length;
  const failed = checks.filter((c) => c.status === 'failed').length;

  // Overall status is the worst
  let overallStatus: 'passed' | 'warning' | 'failed' = 'passed';
  if (warnings > 0) overallStatus = 'warning';
  if (failed > 0) overallStatus = 'failed';

  return {
    runId: crypto.randomUUID(),
    projectId,
    validatedAt: new Date().toISOString(),
    overallStatus,
    summary: {
      total: checks.length,
      passed,
      warnings,
      failed,
    },
    checks,
  };
}
