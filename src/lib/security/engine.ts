import type {
  ControlCheck,
  SecurityControlStatus,
  ControlCheckCategory,
  ControlCheckResult,
  ThreatModelItem,
  ThreatCategory,
  RiskTier,
} from '@/types';

import {
  ALL_CONTROL_DEFINITIONS,
  ALL_CATEGORIES,
  type SecurityCheckInput,
  type ControlDefinition,
} from './controls';

// ---------------------------------------------------------------------------
// Helper: Generate a deterministic UUID-like id from control_id + project_id
// ---------------------------------------------------------------------------

function generateControlCheckId(controlId: string, projectId: string): string {
  // Produce a reproducible, collision-resistant id without external dependencies
  const raw = `${projectId}:${controlId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(1, 4)}-${hex.padEnd(12, '0').slice(0, 12)}`;
}

// ---------------------------------------------------------------------------
// Run a single control definition against the input
// ---------------------------------------------------------------------------

function executeControl(
  definition: ControlDefinition,
  input: SecurityCheckInput,
  now: string,
): ControlCheck {
  const { result, evidence_details, remediation } = definition.check(input);

  return {
    id: generateControlCheckId(definition.control_id, input.project_id),
    project_id: input.project_id,
    organization_id: '', // Populated by the caller/database layer
    control_id: definition.control_id,
    control_name: definition.control_name,
    category: definition.category,
    description: definition.description,
    result,
    evidence_link: null,
    evidence_details,
    remediation,
    checked_at: now,
    checked_by: null,
    next_check_at: null,
    created_at: now,
    updated_at: now,
  };
}

// ---------------------------------------------------------------------------
// Main engine: run all security control checks
// ---------------------------------------------------------------------------

/**
 * Evaluate all security control checks against the provided project configuration.
 *
 * This is a **pure function** with no side effects. It returns a
 * `SecurityControlStatus` summary object containing individual check results,
 * aggregate counts, and per-category breakdowns.
 *
 * @param projectConfig - The project's security configuration snapshot
 * @returns A SecurityControlStatus with all check results and aggregate metrics
 */
export function runSecurityControlChecks(
  projectConfig: SecurityCheckInput,
): SecurityControlStatus {
  const now = new Date().toISOString();

  // Execute every control definition
  const checks: ControlCheck[] = ALL_CONTROL_DEFINITIONS.map((def) =>
    executeControl(def, projectConfig, now),
  );

  // Aggregate counts
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  let notApplicable = 0;

  const byCategory: Record<ControlCheckCategory, { total: number; passed: number; failed: number }> =
    {} as Record<ControlCheckCategory, { total: number; passed: number; failed: number }>;

  // Initialise all categories to zero
  for (const cat of ALL_CATEGORIES) {
    byCategory[cat] = { total: 0, passed: 0, failed: 0 };
  }

  for (const check of checks) {
    const cat = byCategory[check.category];
    cat.total += 1;

    switch (check.result) {
      case 'pass':
        passed += 1;
        cat.passed += 1;
        break;
      case 'fail':
        failed += 1;
        cat.failed += 1;
        break;
      case 'warning':
        warnings += 1;
        // Warnings count toward total but not passed/failed in the category
        break;
      case 'not_applicable':
        notApplicable += 1;
        break;
      case 'error':
        failed += 1;
        cat.failed += 1;
        break;
    }
  }

  const totalControls = checks.length;
  const passRate = totalControls > 0 ? Math.round((passed / totalControls) * 100) : 0;

  return {
    total_controls: totalControls,
    passed,
    failed,
    warnings,
    not_applicable: notApplicable,
    pass_rate: passRate,
    by_category: byCategory,
    last_run_at: now,
    checks,
  };
}

// ---------------------------------------------------------------------------
// Default Threat Model
// ---------------------------------------------------------------------------

/**
 * Risk score matrix: likelihood x impact.
 * Both are mapped to numeric values: critical=4, high=3, medium=2, low=1.
 */
function computeRiskScore(likelihood: RiskTier, impact: RiskTier): number {
  const tierValue: Record<RiskTier, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return tierValue[likelihood] * tierValue[impact];
}

/**
 * Generate a deterministic id for a threat model item.
 */
function generateThreatId(projectId: string, category: ThreatCategory, index: number): string {
  const raw = `${projectId}:threat:${category}:${index}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-b${hex.slice(1, 4)}-${hex.padEnd(12, '0').slice(0, 12)}`;
}

interface ThreatTemplate {
  category: ThreatCategory;
  threat_name: string;
  description: string;
  likelihood: RiskTier;
  impact: RiskTier;
  current_controls: string[];
  recommended_controls: string[];
}

const THREAT_TEMPLATES: ThreatTemplate[] = [
  // Prompt Injection
  {
    category: 'prompt_injection',
    threat_name: 'Direct Prompt Injection',
    description: 'An attacker crafts malicious input that overrides the AI model system prompt, causing the model to ignore safety instructions, reveal system internals, or execute unintended actions.',
    likelihood: 'high',
    impact: 'high',
    current_controls: [],
    recommended_controls: [
      'Implement input sanitization and prompt boundary enforcement',
      'Use system prompt hardening with delimiters and instruction hierarchy',
      'Deploy prompt injection detection classifiers on all user inputs',
      'Implement output filtering to catch instruction-following leaks',
    ],
  },
  {
    category: 'prompt_injection',
    threat_name: 'Indirect Prompt Injection via Data Sources',
    description: 'Malicious instructions are embedded in documents, code comments, or database records that the AI model processes, causing it to act on attacker-controlled directives.',
    likelihood: 'medium',
    impact: 'high',
    current_controls: [],
    recommended_controls: [
      'Sanitize and validate all data sources before feeding to AI models',
      'Implement content security policies for AI-ingested documents',
      'Use separate AI calls for data retrieval vs. action execution',
      'Monitor for anomalous AI behavior patterns after processing external data',
    ],
  },
  // Data Exfiltration
  {
    category: 'data_exfiltration',
    threat_name: 'Sensitive Data Leakage to AI Provider',
    description: 'Confidential source code, credentials, PII, or proprietary business data is sent to external AI model APIs through prompts, file context, or RAG pipelines.',
    likelihood: 'high',
    impact: 'critical',
    current_controls: [],
    recommended_controls: [
      'Deploy DLP scanning on all outbound AI API requests',
      'Implement data classification and enforce restrictions on confidential/restricted data',
      'Configure egress proxy with content inspection for AI provider endpoints',
      'Sign Data Processing Agreements with AI providers including no-training clauses',
      'Use on-premise or VPC-deployed models for restricted data workloads',
    ],
  },
  {
    category: 'data_exfiltration',
    threat_name: 'AI-Assisted Data Extraction',
    description: 'An attacker uses AI coding tools to write code that exfiltrates data through side channels, encoded outputs, or seemingly benign API calls.',
    likelihood: 'medium',
    impact: 'high',
    current_controls: [],
    recommended_controls: [
      'Restrict sandbox network egress to approved endpoints only',
      'Implement code review gates for all AI-generated code before merge',
      'Deploy runtime monitoring to detect unusual data access patterns',
      'Use static analysis to scan AI-generated code for data exfiltration patterns',
    ],
  },
  // Over-Permissioned Tools
  {
    category: 'over_permissioned_tools',
    threat_name: 'Excessive Tool Permissions',
    description: 'AI coding agents are granted overly broad permissions (file system access, shell execution, network access) that exceed what is needed for their intended tasks.',
    likelihood: 'high',
    impact: 'high',
    current_controls: [],
    recommended_controls: [
      'Apply least-privilege principle to all AI tool configurations',
      'Use allowlisted command sets instead of unrestricted shell access',
      'Restrict file system access to specific project directories only',
      'Implement approval workflows for elevated permission requests',
      'Audit tool permission usage and revoke unused capabilities quarterly',
    ],
  },
  {
    category: 'over_permissioned_tools',
    threat_name: 'Unrestricted API Key Scope',
    description: 'AI tool service accounts or API keys have access to production systems, databases, or cloud resources beyond the sandbox environment.',
    likelihood: 'medium',
    impact: 'critical',
    current_controls: [],
    recommended_controls: [
      'Scope API keys to sandbox environment only with resource-level restrictions',
      'Implement separate credential sets for sandbox, staging, and production',
      'Use short-lived tokens with automatic expiration instead of long-lived API keys',
      'Monitor API key usage for out-of-scope resource access',
    ],
  },
  // Unsafe Output
  {
    category: 'unsafe_output',
    threat_name: 'Insecure Generated Code',
    description: 'AI models generate code containing security vulnerabilities such as SQL injection, XSS, hardcoded credentials, insecure deserialization, or missing input validation.',
    likelihood: 'high',
    impact: 'high',
    current_controls: [],
    recommended_controls: [
      'Run SAST (Static Application Security Testing) on all AI-generated code',
      'Enforce mandatory code review for AI-generated pull requests',
      'Configure pre-commit hooks with security linting rules',
      'Maintain a vulnerability pattern library specific to AI-generated code',
      'Implement dependency scanning for AI-suggested packages',
    ],
  },
  {
    category: 'unsafe_output',
    threat_name: 'Hallucinated Dependencies',
    description: 'AI models suggest importing non-existent packages or deprecated libraries, potentially leading to typosquatting attacks where malicious packages with similar names are installed.',
    likelihood: 'medium',
    impact: 'high',
    current_controls: [],
    recommended_controls: [
      'Use a private package registry with allowlisted dependencies',
      'Verify all AI-suggested dependencies exist in official registries before installation',
      'Implement package provenance verification in CI/CD pipelines',
      'Monitor for newly published packages matching AI-suggested names (typosquatting detection)',
    ],
  },
  // Model Poisoning
  {
    category: 'model_poisoning',
    threat_name: 'Compromised Model Weights',
    description: 'An attacker or supply chain compromise introduces backdoors or biases into the AI model through poisoned training data or weight manipulation.',
    likelihood: 'low',
    impact: 'critical',
    current_controls: [],
    recommended_controls: [
      'Use only AI models from trusted, audited providers with published safety evaluations',
      'Validate model provenance and checksums when using self-hosted models',
      'Implement behavioral monitoring to detect sudden changes in model output patterns',
      'Maintain an approved model registry with version pinning',
    ],
  },
  {
    category: 'model_poisoning',
    threat_name: 'Fine-Tuning Data Contamination',
    description: 'Custom fine-tuning or RAG data pipelines are contaminated with adversarial examples that cause the model to produce biased, harmful, or backdoored outputs.',
    likelihood: 'low',
    impact: 'high',
    current_controls: [],
    recommended_controls: [
      'Validate and audit all training/fine-tuning data before use',
      'Implement data lineage tracking for RAG knowledge bases',
      'Use anomaly detection on model outputs after data pipeline updates',
      'Establish a data quality review process with multiple approvers',
    ],
  },
  // Denial of Service
  {
    category: 'denial_of_service',
    threat_name: 'AI API Rate Exhaustion',
    description: 'Malicious or runaway usage exhausts AI provider API rate limits or token budgets, causing service disruption for legitimate users and unexpected cost spikes.',
    likelihood: 'medium',
    impact: 'medium',
    current_controls: [],
    recommended_controls: [
      'Implement per-user and per-project rate limits on AI API calls',
      'Set token budget caps with alerting thresholds',
      'Deploy circuit breakers to prevent cascading failures from API exhaustion',
      'Monitor AI API usage dashboards and configure cost anomaly alerts',
    ],
  },
  {
    category: 'denial_of_service',
    threat_name: 'Resource Exhaustion via Generated Code',
    description: 'AI-generated code contains infinite loops, memory leaks, or resource-intensive operations that exhaust sandbox or production compute resources.',
    likelihood: 'medium',
    impact: 'medium',
    current_controls: [],
    recommended_controls: [
      'Run AI-generated code in resource-constrained containers with CPU/memory limits',
      'Implement execution timeouts for all AI-triggered operations',
      'Use code review automation to detect potential resource exhaustion patterns',
      'Configure monitoring alerts for abnormal resource consumption in sandbox environments',
    ],
  },
  // Supply Chain
  {
    category: 'supply_chain',
    threat_name: 'Compromised AI Tool Extension',
    description: 'A malicious or compromised IDE extension, plugin, or CLI tool for AI coding assistance introduces backdoors, exfiltrates data, or tampers with generated code.',
    likelihood: 'medium',
    impact: 'critical',
    current_controls: [],
    recommended_controls: [
      'Maintain an approved extension/plugin allowlist with version pinning',
      'Verify extension signatures and publisher identity before installation',
      'Monitor extension update channels and review changelogs for anomalies',
      'Deploy endpoint monitoring to detect unusual extension behavior',
    ],
  },
  {
    category: 'supply_chain',
    threat_name: 'AI Provider Service Compromise',
    description: 'The AI model provider infrastructure is compromised, leading to data exposure, model tampering, or service manipulation affecting all API consumers.',
    likelihood: 'low',
    impact: 'critical',
    current_controls: [],
    recommended_controls: [
      'Evaluate AI provider security posture (SOC 2 Type II, penetration test reports)',
      'Implement API response validation to detect anomalous or tampered outputs',
      'Maintain fallback AI providers for business continuity',
      'Include AI provider compromise in incident response playbooks',
      'Negotiate contractual notification requirements for security incidents',
    ],
  },
  // Privacy Violation
  {
    category: 'privacy_violation',
    threat_name: 'PII Exposure in AI Prompts',
    description: 'Personally identifiable information (names, emails, SSNs, health data) is inadvertently included in AI model prompts, violating privacy regulations and data handling policies.',
    likelihood: 'high',
    impact: 'high',
    current_controls: [],
    recommended_controls: [
      'Implement PII detection and redaction on all outbound AI prompts',
      'Train developers on data minimization principles for AI interactions',
      'Configure DLP policies specific to AI API endpoints',
      'Conduct regular audits of AI interaction logs for PII exposure',
      'Implement automated PII classification scanning on code repositories',
    ],
  },
  {
    category: 'privacy_violation',
    threat_name: 'Cross-Border Data Transfer via AI',
    description: 'Data sent to AI providers may cross jurisdictional boundaries, violating GDPR, data residency requirements, or sector-specific regulations.',
    likelihood: 'medium',
    impact: 'high',
    current_controls: [],
    recommended_controls: [
      'Map AI provider data processing regions and verify compliance with residency requirements',
      'Use region-specific AI API endpoints when available',
      'Ensure Standard Contractual Clauses or equivalent are in place for cross-border transfers',
      'Implement data classification to prevent restricted data from reaching cross-border AI endpoints',
    ],
  },
];

/**
 * Generate the default LLM-specific threat model for a project.
 *
 * This is a **pure function** that returns a comprehensive set of
 * `ThreatModelItem` entries covering the eight AI-specific threat categories:
 * prompt injection, data exfiltration, over-permissioned tools, unsafe output,
 * model poisoning, denial of service, supply chain, and privacy violation.
 *
 * @param projectId - The project ID to associate with threat items
 * @returns An array of ThreatModelItem covering all LLM-specific threat categories
 */
export function getDefaultThreatModel(projectId: string): ThreatModelItem[] {
  const now = new Date().toISOString();

  return THREAT_TEMPLATES.map((template, index): ThreatModelItem => {
    const riskScore = computeRiskScore(template.likelihood, template.impact);

    return {
      id: generateThreatId(projectId, template.category, index),
      project_id: projectId,
      category: template.category,
      threat_name: template.threat_name,
      description: template.description,
      likelihood: template.likelihood,
      impact: template.impact,
      risk_score: riskScore,
      current_controls: template.current_controls,
      recommended_controls: template.recommended_controls,
      mitigation_status: 'open',
      owner_id: null,
      owner_name: null,
      due_date: null,
      created_at: now,
      updated_at: now,
    };
  });
}

// ---------------------------------------------------------------------------
// Re-export the input type for external consumers
// ---------------------------------------------------------------------------

export type { SecurityCheckInput } from './controls';
export type { ControlDefinition } from './controls';
