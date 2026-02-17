import type {
  ControlCheckCategory,
  ControlCheckResult,
} from '@/types';

// ---------------------------------------------------------------------------
// SecurityCheckInput — the project configuration snapshot fed into the engine
// ---------------------------------------------------------------------------

export interface SecurityCheckInput {
  project_id: string;
  sandbox_config?: { cloud_provider: string; settings: Record<string, unknown> } | null;
  has_mfa: boolean;
  has_sso: boolean;
  secrets_in_env: boolean;
  logging_enabled: boolean;
  encryption_at_rest: boolean;
  encryption_in_transit: boolean;
  egress_restricted: boolean;
  model_allowlist: string[];
  data_retention_configured: boolean;
  rbac_configured: boolean;
  audit_logging: boolean;
}

// ---------------------------------------------------------------------------
// ControlDefinition — internal shape for a declarative control check
// ---------------------------------------------------------------------------

export interface ControlDefinition {
  control_id: string;
  control_name: string;
  category: ControlCheckCategory;
  description: string;
  check: (input: SecurityCheckInput) => { result: ControlCheckResult; evidence_details: string; remediation: string | null };
}

// ---------------------------------------------------------------------------
// Authentication & Authorization Controls (AUTH)
// ---------------------------------------------------------------------------

const authControls: ControlDefinition[] = [
  {
    control_id: 'AUTH-001',
    control_name: 'Multi-Factor Authentication Enabled',
    category: 'auth',
    description: 'Verify that multi-factor authentication is enforced for all users accessing AI tools and governance dashboards.',
    check: (input) => {
      if (input.has_mfa) {
        return { result: 'pass', evidence_details: 'MFA is enabled for the project.', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'MFA is not enabled.',
        remediation: 'Enable multi-factor authentication for all users. Configure MFA enforcement in your identity provider (Okta, Azure AD, etc.).',
      };
    },
  },
  {
    control_id: 'AUTH-002',
    control_name: 'SSO Integration Active',
    category: 'auth',
    description: 'Verify that Single Sign-On is configured for centralized identity management and session control.',
    check: (input) => {
      if (input.has_sso) {
        return { result: 'pass', evidence_details: 'SSO integration is active.', remediation: null };
      }
      return {
        result: 'warning',
        evidence_details: 'SSO is not configured. Users may be using local credentials.',
        remediation: 'Integrate SSO via SAML 2.0 or OIDC with your corporate identity provider to centralize authentication and enable session revocation.',
      };
    },
  },
  {
    control_id: 'AUTH-003',
    control_name: 'Session Management Controls',
    category: 'auth',
    description: 'Verify that session timeouts and token rotation are configured to limit the blast radius of compromised sessions.',
    check: (input) => {
      if (input.has_sso && input.has_mfa) {
        return { result: 'pass', evidence_details: 'SSO and MFA are both active, providing strong session management.', remediation: null };
      }
      if (input.has_sso || input.has_mfa) {
        return {
          result: 'warning',
          evidence_details: 'Partial session management controls in place. Only one of SSO or MFA is active.',
          remediation: 'Enable both SSO and MFA for comprehensive session management. Configure session timeout policies in your IdP.',
        };
      }
      return {
        result: 'fail',
        evidence_details: 'No SSO or MFA detected. Session management is weak.',
        remediation: 'Implement SSO with enforced session timeouts and MFA. Configure token refresh rotation and idle session expiry.',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Secrets Management Controls (SEC)
// ---------------------------------------------------------------------------

const secretsControls: ControlDefinition[] = [
  {
    control_id: 'SEC-001',
    control_name: 'No Secrets in Environment Variables',
    category: 'secrets',
    description: 'Verify that API keys and credentials are not stored in plain-text environment variables or client-accessible code.',
    check: (input) => {
      if (!input.secrets_in_env) {
        return { result: 'pass', evidence_details: 'No secrets detected in environment variables.', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'Secrets detected in environment variables. This exposes credentials to process inspection and log leakage.',
        remediation: 'Migrate all secrets to a dedicated secrets manager (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault). Remove NEXT_PUBLIC_ prefixed secrets immediately.',
      };
    },
  },
  {
    control_id: 'SEC-002',
    control_name: 'Secrets Rotation Policy',
    category: 'secrets',
    description: 'Verify that a credential rotation policy is in place for all AI provider API keys and service accounts.',
    check: (input) => {
      // If secrets are in env, rotation is likely not managed
      if (input.secrets_in_env) {
        return {
          result: 'fail',
          evidence_details: 'Secrets are stored in environment variables, making automated rotation impossible.',
          remediation: 'Move secrets to a managed vault with automated rotation. Set rotation intervals of 90 days or less for API keys.',
        };
      }
      return {
        result: 'warning',
        evidence_details: 'Secrets are not in environment variables. Rotation policy cannot be verified programmatically — manual review required.',
        remediation: 'Ensure a documented rotation policy exists with rotation intervals no longer than 90 days for AI provider API keys.',
      };
    },
  },
  {
    control_id: 'SEC-003',
    control_name: 'Pre-Commit Secret Scanning',
    category: 'secrets',
    description: 'Verify that pre-commit hooks or CI checks scan for accidentally committed secrets in source code.',
    check: (input) => {
      // This is a best-practice check; we can only warn since we cannot inspect CI config
      if (!input.secrets_in_env) {
        return {
          result: 'warning',
          evidence_details: 'Cannot programmatically verify pre-commit secret scanning is enabled. Manual review required.',
          remediation: 'Install pre-commit hooks using tools like git-secrets, truffleHog, or gitleaks. Add secret scanning to CI pipeline.',
        };
      }
      return {
        result: 'fail',
        evidence_details: 'Secrets found in environment variables suggest secret scanning is not active or effective.',
        remediation: 'Deploy git-secrets or gitleaks as pre-commit hooks and add CI-level secret scanning. Audit existing commits for leaked secrets.',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Model / Provider Configuration Controls (MDL)
// ---------------------------------------------------------------------------

const modelConfigControls: ControlDefinition[] = [
  {
    control_id: 'MDL-001',
    control_name: 'Model Allowlist Configured',
    category: 'model_config',
    description: 'Verify that only approved AI models/providers are permitted. An empty allowlist means any model can be used.',
    check: (input) => {
      if (input.model_allowlist.length > 0) {
        return {
          result: 'pass',
          evidence_details: `Model allowlist contains ${input.model_allowlist.length} approved model(s): ${input.model_allowlist.join(', ')}.`,
          remediation: null,
        };
      }
      return {
        result: 'fail',
        evidence_details: 'No model allowlist configured. Any AI model or provider could be used without restriction.',
        remediation: 'Define an explicit allowlist of approved AI models and providers. Configure enforcement in your proxy or API gateway.',
      };
    },
  },
  {
    control_id: 'MDL-002',
    control_name: 'Sandbox Configuration Exists',
    category: 'model_config',
    description: 'Verify that a sandbox environment configuration is defined for isolated AI tool evaluation.',
    check: (input) => {
      if (input.sandbox_config) {
        return {
          result: 'pass',
          evidence_details: `Sandbox configured with cloud provider: ${input.sandbox_config.cloud_provider}.`,
          remediation: null,
        };
      }
      return {
        result: 'fail',
        evidence_details: 'No sandbox configuration found. AI tools may be running without proper isolation.',
        remediation: 'Create a sandbox configuration specifying cloud provider, network isolation, and model access controls before deploying AI tools.',
      };
    },
  },
  {
    control_id: 'MDL-003',
    control_name: 'Model Output Validation',
    category: 'model_config',
    description: 'Verify that output validation controls are configured to sanitize and review AI-generated content before use.',
    check: (input) => {
      // Output validation is a process check; we verify sandbox config exists as a proxy
      if (input.sandbox_config && input.model_allowlist.length > 0) {
        return {
          result: 'warning',
          evidence_details: 'Sandbox and model allowlist are configured. Output validation controls cannot be verified programmatically — manual review recommended.',
          remediation: 'Implement output sanitization layers: content filtering, code scanning, and human review gates for AI-generated outputs.',
        };
      }
      return {
        result: 'fail',
        evidence_details: 'Missing sandbox config or model allowlist. Output validation is likely not configured.',
        remediation: 'Configure sandbox environment and model allowlist first. Then implement output validation including DOMPurify for rendered content and static analysis for generated code.',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Logging Controls (LOG)
// ---------------------------------------------------------------------------

const loggingControls: ControlDefinition[] = [
  {
    control_id: 'LOG-001',
    control_name: 'Application Logging Enabled',
    category: 'logging',
    description: 'Verify that application-level logging is enabled for API calls, user actions, and AI interactions.',
    check: (input) => {
      if (input.logging_enabled) {
        return { result: 'pass', evidence_details: 'Application logging is enabled.', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'Application logging is disabled. Security incidents and operational issues will be undetectable.',
        remediation: 'Enable structured logging for all API routes, authentication events, and AI model interactions. Use a centralized logging solution.',
      };
    },
  },
  {
    control_id: 'LOG-002',
    control_name: 'Audit Trail Logging',
    category: 'logging',
    description: 'Verify that an immutable audit trail captures all governance-relevant actions (policy changes, gate approvals, data access).',
    check: (input) => {
      if (input.audit_logging) {
        return { result: 'pass', evidence_details: 'Audit logging is enabled.', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'Audit logging is not enabled. Compliance and forensic requirements cannot be met.',
        remediation: 'Enable audit logging for all governance actions: policy edits, gate approvals, data classification changes, and team membership updates.',
      };
    },
  },
  {
    control_id: 'LOG-003',
    control_name: 'AI Interaction Logging',
    category: 'logging',
    description: 'Verify that all AI model interactions (prompts, responses, token usage) are logged for analysis and compliance.',
    check: (input) => {
      if (input.logging_enabled && input.audit_logging) {
        return {
          result: 'pass',
          evidence_details: 'Both application and audit logging are active, providing coverage for AI interaction logging.',
          remediation: null,
        };
      }
      if (input.logging_enabled || input.audit_logging) {
        return {
          result: 'warning',
          evidence_details: 'Partial logging is in place. AI-specific interaction logging may have gaps.',
          remediation: 'Ensure AI interactions are captured in both the application log and audit trail. Log prompt hashes, response lengths, model used, and token consumption.',
        };
      }
      return {
        result: 'fail',
        evidence_details: 'No logging is enabled. AI interactions are not being tracked.',
        remediation: 'Enable both application and audit logging. Implement dedicated AI interaction logging including prompt metadata, response analysis, and cost tracking.',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Egress Restriction Controls (EGR)
// ---------------------------------------------------------------------------

const egressControls: ControlDefinition[] = [
  {
    control_id: 'EGR-001',
    control_name: 'Egress Restrictions Configured',
    category: 'egress',
    description: 'Verify that outbound network traffic from the sandbox is restricted to approved AI API endpoints only.',
    check: (input) => {
      if (input.egress_restricted) {
        return { result: 'pass', evidence_details: 'Egress restrictions are configured.', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'Egress is unrestricted. AI tools and generated code could exfiltrate data to arbitrary external endpoints.',
        remediation: 'Configure egress filtering via forward proxy or firewall rules. Allowlist only approved AI provider API endpoints (api.anthropic.com, api.openai.com, etc.).',
      };
    },
  },
  {
    control_id: 'EGR-002',
    control_name: 'DNS-Level Egress Control',
    category: 'egress',
    description: 'Verify that DNS resolution is controlled to prevent AI tools from contacting unapproved domains.',
    check: (input) => {
      if (input.egress_restricted && input.sandbox_config) {
        return {
          result: 'warning',
          evidence_details: 'Egress is restricted and sandbox is configured. DNS-level controls cannot be verified programmatically.',
          remediation: 'Verify that DNS resolution in the sandbox uses a private DNS resolver with domain allowlisting. Block DNS-over-HTTPS to prevent bypass.',
        };
      }
      if (input.egress_restricted) {
        return {
          result: 'warning',
          evidence_details: 'Egress is restricted but no sandbox config present. DNS-level controls should be verified manually.',
          remediation: 'Configure a private DNS resolver in the sandbox environment. Implement DNS allowlisting for approved AI provider domains.',
        };
      }
      return {
        result: 'fail',
        evidence_details: 'No egress restrictions detected. DNS-level controls are likely absent.',
        remediation: 'Implement network-level egress restrictions first, then configure DNS-level controls with domain allowlisting.',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Storage Policy Controls (STO)
// ---------------------------------------------------------------------------

const storageControls: ControlDefinition[] = [
  {
    control_id: 'STO-001',
    control_name: 'Encryption at Rest',
    category: 'storage',
    description: 'Verify that all stored data (database, file uploads, configuration artifacts) is encrypted at rest.',
    check: (input) => {
      if (input.encryption_at_rest) {
        return { result: 'pass', evidence_details: 'Encryption at rest is enabled.', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'Encryption at rest is not enabled. Stored data including AI interaction logs and governance artifacts is vulnerable.',
        remediation: 'Enable encryption at rest for all storage layers: database (Supabase/PostgreSQL TDE), file storage (S3 SSE or equivalent), and backups.',
      };
    },
  },
  {
    control_id: 'STO-002',
    control_name: 'Storage Access Controls',
    category: 'storage',
    description: 'Verify that storage access is controlled through IAM policies and row-level security, not public access.',
    check: (input) => {
      if (input.rbac_configured && input.encryption_at_rest) {
        return {
          result: 'pass',
          evidence_details: 'RBAC is configured and encryption at rest is enabled, indicating storage access controls are in place.',
          remediation: null,
        };
      }
      if (input.rbac_configured) {
        return {
          result: 'warning',
          evidence_details: 'RBAC is configured but encryption at rest is not enabled.',
          remediation: 'Enable encryption at rest in addition to RBAC. Ensure Supabase RLS policies are active on all tables.',
        };
      }
      return {
        result: 'fail',
        evidence_details: 'RBAC is not configured. Storage may be accessible without proper authorization.',
        remediation: 'Configure RBAC with least-privilege principles. Enable Supabase RLS on all tables. Set storage bucket policies to private with signed URL access.',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Data Retention Controls (RET)
// ---------------------------------------------------------------------------

const dataRetentionControls: ControlDefinition[] = [
  {
    control_id: 'RET-001',
    control_name: 'Data Retention Policy Configured',
    category: 'data_retention',
    description: 'Verify that data retention periods are defined for AI interaction logs, governance artifacts, and user data.',
    check: (input) => {
      if (input.data_retention_configured) {
        return { result: 'pass', evidence_details: 'Data retention policy is configured.', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'No data retention policy is configured. Data may be retained indefinitely, violating privacy regulations.',
        remediation: 'Define retention periods for all data categories: AI interaction logs (90 days default), audit events (7 years for compliance), PII (per GDPR/CCPA requirements).',
      };
    },
  },
  {
    control_id: 'RET-002',
    control_name: 'AI Provider Data Handling',
    category: 'data_retention',
    description: 'Verify that AI provider data handling agreements are in place (no training on your data, deletion rights, DPA signed).',
    check: (input) => {
      if (input.model_allowlist.length > 0 && input.data_retention_configured) {
        return {
          result: 'warning',
          evidence_details: 'Model allowlist and retention policy are configured. AI provider DPA status requires manual verification.',
          remediation: 'Verify that Data Processing Agreements are signed with all AI providers on the allowlist. Confirm training opt-out and data deletion clauses.',
        };
      }
      return {
        result: 'fail',
        evidence_details: 'Missing model allowlist or retention policy. AI provider data handling agreements are likely incomplete.',
        remediation: 'Configure a model allowlist first. Then negotiate and sign DPAs with each approved AI provider. Ensure training opt-out, data deletion rights, and sub-processor transparency.',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Access Control / RBAC Controls (ACL)
// ---------------------------------------------------------------------------

const accessControlChecks: ControlDefinition[] = [
  {
    control_id: 'ACL-001',
    control_name: 'Role-Based Access Control Configured',
    category: 'access_control',
    description: 'Verify that RBAC is enforced for all platform features, ensuring users only access resources appropriate to their role.',
    check: (input) => {
      if (input.rbac_configured) {
        return { result: 'pass', evidence_details: 'RBAC is configured for the project.', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'RBAC is not configured. All users may have equal access to all features and data.',
        remediation: 'Implement role-based access control with distinct permissions for admin, consultant, executive, IT, legal, engineering, and marketing roles.',
      };
    },
  },
  {
    control_id: 'ACL-002',
    control_name: 'Least Privilege Enforcement',
    category: 'access_control',
    description: 'Verify that the principle of least privilege is applied to AI tool access, API keys, and data access.',
    check: (input) => {
      if (input.rbac_configured && input.has_sso) {
        return {
          result: 'pass',
          evidence_details: 'RBAC and SSO are configured, supporting least privilege enforcement through centralized identity management.',
          remediation: null,
        };
      }
      if (input.rbac_configured) {
        return {
          result: 'warning',
          evidence_details: 'RBAC is configured but SSO is not active. Least privilege may be harder to enforce without centralized identity.',
          remediation: 'Configure SSO to centralize identity and enforce least privilege. Review role assignments quarterly to prevent privilege creep.',
        };
      }
      return {
        result: 'fail',
        evidence_details: 'Neither RBAC nor SSO is configured. Least privilege cannot be enforced.',
        remediation: 'Implement RBAC with granular permissions and SSO with centralized group management. Conduct an access review and apply least privilege to all AI tool API keys.',
      };
    },
  },
  {
    control_id: 'ACL-003',
    control_name: 'Service Account Governance',
    category: 'access_control',
    description: 'Verify that service accounts used by AI tools have scoped permissions and are inventoried.',
    check: (input) => {
      if (input.rbac_configured && !input.secrets_in_env) {
        return {
          result: 'warning',
          evidence_details: 'RBAC is configured and secrets are managed properly. Service account inventory requires manual verification.',
          remediation: 'Maintain an inventory of all service accounts used by AI tools. Ensure each has minimum required permissions and is reviewed quarterly.',
        };
      }
      if (input.secrets_in_env) {
        return {
          result: 'fail',
          evidence_details: 'Secrets in environment variables suggest service accounts are not properly managed.',
          remediation: 'Inventory all service accounts. Move credentials to a secrets manager. Apply least privilege to each account. Set up automated credential rotation.',
        };
      }
      return {
        result: 'warning',
        evidence_details: 'Service account governance cannot be fully verified programmatically.',
        remediation: 'Create a service account inventory. Assign owners to each account. Review permissions quarterly and rotate credentials.',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Encryption Controls (ENC)
// ---------------------------------------------------------------------------

const encryptionControls: ControlDefinition[] = [
  {
    control_id: 'ENC-001',
    control_name: 'Encryption at Rest',
    category: 'encryption',
    description: 'Verify that all data at rest is encrypted using industry-standard algorithms (AES-256 or equivalent).',
    check: (input) => {
      if (input.encryption_at_rest) {
        return { result: 'pass', evidence_details: 'Encryption at rest is enabled.', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'Encryption at rest is not enabled.',
        remediation: 'Enable AES-256 encryption at rest for all data stores: database, object storage, backup volumes, and local disk encryption for developer environments.',
      };
    },
  },
  {
    control_id: 'ENC-002',
    control_name: 'Encryption in Transit',
    category: 'encryption',
    description: 'Verify that all data in transit is encrypted using TLS 1.2+ for API calls, database connections, and inter-service communication.',
    check: (input) => {
      if (input.encryption_in_transit) {
        return { result: 'pass', evidence_details: 'Encryption in transit is enabled (TLS).', remediation: null };
      }
      return {
        result: 'fail',
        evidence_details: 'Encryption in transit is not enabled. API calls and data transfers are vulnerable to interception.',
        remediation: 'Enforce TLS 1.2+ for all connections: AI provider API calls, database connections, internal service communication, and webhook endpoints. Disable TLS 1.0/1.1.',
      };
    },
  },
  {
    control_id: 'ENC-003',
    control_name: 'Key Management',
    category: 'encryption',
    description: 'Verify that encryption keys are managed through a KMS with access controls, rotation, and audit logging.',
    check: (input) => {
      if (input.encryption_at_rest && input.encryption_in_transit && !input.secrets_in_env) {
        return {
          result: 'warning',
          evidence_details: 'Encryption is enabled and secrets are managed. KMS configuration requires manual verification.',
          remediation: 'Verify that encryption keys are stored in a cloud KMS (AWS KMS, Azure Key Vault, GCP Cloud KMS). Enable key rotation and audit logging.',
        };
      }
      if (input.encryption_at_rest || input.encryption_in_transit) {
        return {
          result: 'warning',
          evidence_details: 'Partial encryption is enabled. Key management practices require manual review.',
          remediation: 'Implement a centralized KMS for all encryption keys. Enable automatic key rotation (annual minimum). Audit key access logs.',
        };
      }
      return {
        result: 'fail',
        evidence_details: 'Encryption is not enabled. Key management is not applicable without active encryption.',
        remediation: 'Enable encryption at rest and in transit first. Then configure KMS with automated rotation and access audit logging.',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// All Controls — exported for the engine
// ---------------------------------------------------------------------------

export const ALL_CONTROL_DEFINITIONS: ControlDefinition[] = [
  ...authControls,
  ...secretsControls,
  ...modelConfigControls,
  ...loggingControls,
  ...egressControls,
  ...storageControls,
  ...dataRetentionControls,
  ...accessControlChecks,
  ...encryptionControls,
];

/**
 * All control check categories in the system. Useful for initialisation and iteration.
 */
export const ALL_CATEGORIES: ControlCheckCategory[] = [
  'auth',
  'secrets',
  'model_config',
  'logging',
  'egress',
  'storage',
  'data_retention',
  'access_control',
  'encryption',
];
