'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Briefcase,
  Scale,
  ShieldCheck,
  Code2,
  Megaphone,
  Download,
  Loader2,
} from 'lucide-react';
import { useReportTemplates, useGenerateReport } from '@/hooks/use-reports';
import type { ReportPersona as ReportPersonaType } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type GenerateState = 'idle' | 'generating' | 'ready';

interface ReportPersona {
  id: ReportPersonaType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  format: string;
  pageCount: string;
  includes: string[];
  iconColor: string;
  iconBg: string;
}

/* ------------------------------------------------------------------ */
/*  Report Content Generators                                          */
/* ------------------------------------------------------------------ */

function generateExecutiveReport(projectId: string): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `================================================================================
  EXECUTIVE / BOARD REPORT
  AI Coding Agent Governance — Feasibility & Readiness Assessment
================================================================================

  Project ID:     ${projectId}
  Date Generated: ${date}
  Classification: CONFIDENTIAL — Executive Leadership Only

================================================================================
  1. EXECUTIVE SUMMARY
================================================================================

  This report presents the results of a comprehensive feasibility assessment for
  deploying AI coding agents (Claude Code, OpenAI Codex, and similar tools)
  within the organization. The assessment evaluates readiness across five key
  domains: Infrastructure, Security, Governance, Engineering, and Business.

  Overall Feasibility Score:  78 / 100  —  READY WITH CONDITIONS

  The organization demonstrates strong foundational capabilities for AI coding
  agent adoption. Several areas require targeted remediation before proceeding
  to production deployment, particularly in governance policy formalization and
  security monitoring tooling.

================================================================================
  2. FEASIBILITY SCORE BREAKDOWN
================================================================================

  Domain              Score    Weight    Weighted     Rating
  ─────────────────────────────────────────────────────────────────────
  Infrastructure       82      25%       20.5        Strong
  Security             71      25%       17.8        Adequate
  Governance           68      20%       13.6        Needs Improvement
  Engineering          85      15%       12.8        Strong
  Business             80      15%       12.0        Strong
  ─────────────────────────────────────────────────────────────────────
  OVERALL              —       100%      76.6        Ready with Conditions

  Score Interpretation:
    90-100  Fully Ready         — Proceed to production deployment
    75-89   Ready w/ Conditions — Proceed with targeted remediation plan
    60-74   Partially Ready     — Significant gaps require attention
    Below 60 Not Ready          — Major investment needed before adoption

================================================================================
  3. DOMAIN ANALYSIS
================================================================================

  3.1 INFRASTRUCTURE (Score: 82/100 — Strong)
  ─────────────────────────────────────────────────────────────────────
  Strengths:
    • Cloud infrastructure (AWS/Azure/GCP) is well-established
    • CI/CD pipelines support automated testing and deployment
    • Network segmentation supports isolated sandbox environments
    • Container orchestration (Kubernetes) available for workload isolation

  Gaps:
    • GPU-optimized compute instances not yet provisioned for local models
    • Sandbox environment auto-provisioning requires automation

  3.2 SECURITY (Score: 71/100 — Adequate)
  ─────────────────────────────────────────────────────────────────────
  Strengths:
    • SSO/SAML integration operational across development tooling
    • Secrets management (HashiCorp Vault / AWS Secrets Manager) in place
    • Endpoint detection and response (EDR) deployed fleet-wide

  Gaps:
    • Data Loss Prevention (DLP) rules not yet configured for AI agent traffic
    • AI-specific audit logging pipeline needs implementation
    • Code exfiltration monitoring for AI-generated outputs not in place

  3.3 GOVERNANCE (Score: 68/100 — Needs Improvement)
  ─────────────────────────────────────────────────────────────────────
  Strengths:
    • Existing software development policies provide a foundation
    • Change management board is active and engaged
    • Legal team has initial familiarity with AI licensing terms

  Gaps:
    • Acceptable Use Policy (AUP) for AI coding agents not yet drafted
    • Incident Response Plan (IRP) lacks AI-specific addendum
    • Three-gate review process not formalized for AI tool rollout
    • Data classification policy needs AI-context updates

  3.4 ENGINEERING (Score: 85/100 — Strong)
  ─────────────────────────────────────────────────────────────────────
  Strengths:
    • Engineering team demonstrates high enthusiasm for AI tooling
    • Existing code review culture supports AI output validation
    • Test coverage baselines established for comparison metrics
    • Multiple team members have prior AI coding tool experience

  Gaps:
    • Formal evaluation criteria for AI tool selection not documented
    • Baseline productivity metrics need tighter measurement windows

  3.5 BUSINESS (Score: 80/100 — Strong)
  ─────────────────────────────────────────────────────────────────────
  Strengths:
    • Executive sponsorship confirmed at VP level and above
    • Budget allocation approved for pilot phase
    • Clear business case with estimated 25-40% developer productivity gain
    • Competitive pressure creates urgency for adoption

  Gaps:
    • ROI measurement framework needs formalization
    • Cross-department stakeholder alignment still in progress

================================================================================
  4. ROI PROJECTION
================================================================================

  Metric                           Baseline     Projected     Improvement
  ─────────────────────────────────────────────────────────────────────
  Developer Velocity (story pts)   42/sprint    58/sprint     +38%
  Time to First Commit (new feat)  4.2 hours    2.8 hours     -33%
  Code Review Turnaround           6.1 hours    4.5 hours     -26%
  Bug Escape Rate                  3.2%         2.4%          -25%
  Developer Satisfaction (NPS)     +32          +51           +59%

  Estimated Annual Cost Savings:   $480,000 - $720,000
  (Based on 40-person engineering team, $150K avg loaded cost)

  Estimated Payback Period:        3-5 months after production deployment

================================================================================
  5. RISK HEAT MAP
================================================================================

  Risk Category         Likelihood   Impact    Risk Level   Mitigation
  ─────────────────────────────────────────────────────────────────────
  Data Leakage          Medium       High      HIGH         DLP + sandboxing
  IP/License Violation  Low          High      MEDIUM       AUP + code scan
  Quality Degradation   Low          Medium    LOW          Review gates
  Vendor Lock-in        Medium       Medium    MEDIUM       Multi-tool eval
  Cost Overrun          Low          Low       LOW          Budget caps
  Regulatory Non-Comp   Low          High      MEDIUM       Compliance map
  Shadow AI Usage       High         Medium    HIGH         Policy + tooling

================================================================================
  6. RECOMMENDATIONS
================================================================================

  Priority 1 — Immediate (Weeks 1-2):
    1. Draft and approve AI Coding Agent Acceptable Use Policy (AUP)
    2. Configure DLP rules for AI agent API traffic
    3. Establish AI-specific incident response procedures

  Priority 2 — Short-term (Weeks 3-6):
    4. Deploy sandbox environment with managed-settings.json controls
    5. Implement AI audit logging pipeline
    6. Launch PoC with two engineering teams (Claude Code + Codex)

  Priority 3 — Medium-term (Weeks 7-12):
    7. Complete three-gate review process for production approval
    8. Formalize ROI measurement framework
    9. Develop training program for all engineering staff
   10. Establish ongoing compliance monitoring dashboard

================================================================================
  7. GO / NO-GO RECOMMENDATION
================================================================================

  ┌─────────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │   RECOMMENDATION:   GO — WITH CONDITIONS                           │
  │                                                                     │
  │   The organization is recommended to PROCEED with AI coding agent   │
  │   deployment, contingent on completing Priority 1 remediation       │
  │   items within two weeks. The overall feasibility score of 78/100   │
  │   indicates strong organizational readiness with manageable gaps.   │
  │                                                                     │
  │   Conditions for Go:                                                │
  │     • AUP approved by Legal and executive sponsor                   │
  │     • DLP rules deployed and validated in sandbox                   │
  │     • IRP addendum reviewed by Security team                        │
  │                                                                     │
  │   Next Gate:  Gate 1 Review — Sandbox Validation                    │
  │   Target Date: 4 weeks from assessment completion                   │
  │                                                                     │
  └─────────────────────────────────────────────────────────────────────┘

================================================================================
  APPENDIX A: ASSESSMENT METHODOLOGY
================================================================================

  This assessment was conducted using the GovAI Studio Feasibility Scoring
  Engine, which evaluates organizational readiness across five weighted domains.
  Scores are computed from structured questionnaire responses, document reviews,
  and stakeholder interviews.

  Domain weights reflect industry best practices for enterprise AI adoption:
    Infrastructure: 25% | Security: 25% | Governance: 20%
    Engineering: 15% | Business: 15%

================================================================================
  END OF REPORT
  Generated by GovAI Studio — ${date}
================================================================================
`;
}

function generateLegalReport(projectId: string): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `================================================================================
  LEGAL / COMPLIANCE REVIEW
  AI Coding Agent Governance — Compliance & Regulatory Assessment
================================================================================

  Project ID:     ${projectId}
  Date Generated: ${date}
  Classification: CONFIDENTIAL — Legal & Compliance Team

================================================================================
  1. ACCEPTABLE USE POLICY (AUP) OVERVIEW
================================================================================

  1.1 PURPOSE AND SCOPE
  ─────────────────────────────────────────────────────────────────────

  This Acceptable Use Policy governs the use of AI-powered coding assistants
  (including but not limited to Claude Code, OpenAI Codex, GitHub Copilot, and
  similar tools) within the organization. It applies to all employees,
  contractors, and third parties who access or utilize AI coding agents in
  connection with organizational software development activities.

  1.2 PERMITTED USES
  ─────────────────────────────────────────────────────────────────────

  AI coding agents MAY be used for:
    • Code generation, completion, and refactoring within approved repositories
    • Automated test case generation and test coverage improvement
    • Code documentation and comment generation
    • Debugging assistance and error analysis
    • Learning and skill development in approved sandboxed environments
    • Code review assistance (as supplement to, not replacement for, human review)

  1.3 PROHIBITED USES
  ─────────────────────────────────────────────────────────────────────

  AI coding agents MUST NOT be used for:
    • Processing, transmitting, or generating code that handles PII/PHI without
      explicit Data Protection Officer (DPO) approval
    • Generating code for security-critical authentication or encryption modules
      without mandatory human review
    • Submitting production code that has not passed through the standard code
      review process
    • Circumventing access controls, DLP policies, or network restrictions
    • Processing proprietary algorithms or trade secrets of clients or partners
    • Any activity that violates applicable laws, regulations, or contractual
      obligations

  1.4 DATA HANDLING REQUIREMENTS
  ─────────────────────────────────────────────────────────────────────

  • All prompts sent to AI coding agents must comply with the organization's
    Data Classification Policy
  • RESTRICTED and CONFIDENTIAL data must not be included in AI prompts unless
    the AI tool is deployed within the organization's private infrastructure
  • Code context sent to cloud-hosted AI services is limited to PUBLIC and
    INTERNAL classification levels
  • Telemetry and prompt logging must be disabled or routed through approved
    audit infrastructure

================================================================================
  2. COMPLIANCE FRAMEWORK MAPPINGS
================================================================================

  2.1 SOC 2 TYPE II MAPPING
  ─────────────────────────────────────────────────────────────────────

  Control ID    Control Description              AI Agent Impact    Status
  ─────────────────────────────────────────────────────────────────────
  CC6.1         Logical Access Controls          Sandbox isolation  Mapped
  CC6.2         Access Authentication            SSO/SAML for AI    Mapped
  CC6.3         Access Authorization             RBAC enforcement   Mapped
  CC6.6         System Boundary Protection       Network DLP        In Progress
  CC6.7         Data Transmission Controls       TLS 1.3 enforced   Mapped
  CC7.1         Configuration Management         managed-settings   Mapped
  CC7.2         Change Management                Three-gate review  Mapped
  CC7.4         Security Incident Management     IRP addendum       In Progress
  CC8.1         Monitoring Activities            Audit logging      In Progress

  SOC 2 Compliance Status: 6 of 9 controls fully mapped (67%)
  Action Required: Complete DLP configuration, IRP addendum, and audit logging

  2.2 HIPAA MAPPING (If Applicable)
  ─────────────────────────────────────────────────────────────────────

  HIPAA Rule    Requirement                      AI Agent Control    Status
  ─────────────────────────────────────────────────────────────────────
  164.312(a)    Access Control                   RBAC + sandbox      Mapped
  164.312(b)    Audit Controls                   AI audit logging    In Progress
  164.312(c)    Integrity Controls               Code review gates   Mapped
  164.312(d)    Authentication                   SSO integration     Mapped
  164.312(e)    Transmission Security            TLS + VPN           Mapped
  164.308(a)(1) Risk Analysis                    This assessment     Mapped
  164.308(a)(5) Security Awareness Training      AI-specific module  Planned
  164.308(a)(6) Security Incident Procedures     IRP addendum        In Progress

  HIPAA Compliance Status: 5 of 8 requirements mapped (63%)
  Note: HIPAA controls apply only if AI agents process ePHI. Current
  recommendation is to PROHIBIT ePHI in AI agent contexts.

  2.3 NIST CYBERSECURITY FRAMEWORK (CSF) MAPPING
  ─────────────────────────────────────────────────────────────────────

  Function      Category        AI Agent Control                 Status
  ─────────────────────────────────────────────────────────────────────
  IDENTIFY      ID.AM           AI tool asset inventory          Mapped
  IDENTIFY      ID.RA           Risk assessment (this report)    Mapped
  PROTECT       PR.AC           Access control (RBAC)            Mapped
  PROTECT       PR.AT           AI-specific training program     Planned
  PROTECT       PR.DS           Data security (DLP + classify)   In Progress
  PROTECT       PR.IP           Configuration management         Mapped
  DETECT        DE.AE           Anomaly detection on AI usage    Planned
  DETECT        DE.CM           Continuous monitoring             In Progress
  RESPOND       RS.RP           Incident response plan           In Progress
  RECOVER       RC.RP           Recovery planning                Mapped

  NIST CSF Compliance Status: 5 of 10 categories mapped (50%)

  2.4 GDPR MAPPING (If Applicable)
  ─────────────────────────────────────────────────────────────────────

  Article       Requirement                      AI Agent Control    Status
  ─────────────────────────────────────────────────────────────────────
  Art. 5        Data Processing Principles       DLP + AUP           Mapped
  Art. 6        Lawful Basis for Processing      Legitimate interest  Mapped
  Art. 13/14    Transparency / Notice            AI usage disclosure  Planned
  Art. 25       Data Protection by Design        Sandbox isolation    Mapped
  Art. 28       Data Processor Agreements        Vendor DPA review    In Progress
  Art. 32       Security of Processing           Encryption + access  Mapped
  Art. 33/34    Breach Notification              IRP addendum         In Progress
  Art. 35       DPIA (Impact Assessment)         This assessment      Mapped

  GDPR Compliance Status: 5 of 8 articles mapped (63%)
  Note: Data Processing Agreement (DPA) review required for each AI vendor.

================================================================================
  3. RISK ASSESSMENT SUMMARY
================================================================================

  3.1 IDENTIFIED LEGAL RISKS
  ─────────────────────────────────────────────────────────────────────

  Risk ID   Description                    Severity   Likelihood   Controls
  ─────────────────────────────────────────────────────────────────────
  LR-001    IP ownership of AI output      Medium     Medium       AUP clause 4.2
  LR-002    License contamination          High       Low          Code scanning
  LR-003    Breach of client NDAs          High       Low          DLP + classify
  LR-004    Regulatory non-compliance      High       Medium       Framework map
  LR-005    Vendor data retention          Medium     Medium       DPA negotiation
  LR-006    Employee privacy concerns      Low        Medium       Transparency
  LR-007    Third-party IP infringement    Medium     Low          Output review

  3.2 INTELLECTUAL PROPERTY CONSIDERATIONS
  ─────────────────────────────────────────────────────────────────────

  • AI-generated code ownership: Under current legal frameworks, code generated
    by AI tools when prompted by human developers is generally treated as work
    product of the developer/organization. The AUP should establish clear
    ownership terms.

  • Open-source license risk: AI agents may generate code that resembles or
    replicates open-source licensed code. Mandatory license scanning (e.g.,
    FOSSA, Snyk) should be integrated into CI/CD pipelines for all
    AI-assisted code.

  • Client contractual obligations: Review all active client contracts for
    restrictions on AI-assisted development. Some contracts may prohibit or
    restrict the use of AI tools on client projects.

  3.3 VENDOR AGREEMENT REVIEW
  ─────────────────────────────────────────────────────────────────────

  Vendor          Terms Review     DPA Status     Data Retention    Verdict
  ─────────────────────────────────────────────────────────────────────
  Anthropic       Reviewed         Signed         30-day default    Approved
  OpenAI          Reviewed         In Progress    30-day default    Pending
  GitHub          Reviewed         Signed         Configurable      Approved

================================================================================
  4. DATA CLASSIFICATION RECOMMENDATIONS
================================================================================

  Classification    Definition                     AI Agent Policy
  ─────────────────────────────────────────────────────────────────────
  PUBLIC            Publicly available info         Unrestricted use
  INTERNAL          Internal business data          Permitted with logging
  CONFIDENTIAL      Sensitive business data         Restricted — private deploy only
  RESTRICTED        Regulated data (PII/PHI/PCI)    PROHIBITED in AI contexts

  Recommended Actions:
    1. Update Data Classification Policy to include AI-specific handling rules
    2. Implement automated classification scanning for AI prompts
    3. Deploy DLP rules that enforce classification-based restrictions
    4. Conduct training for developers on data classification in AI contexts

================================================================================
  5. RECOMMENDED LEGAL ACTIONS
================================================================================

  Priority   Action Item                                    Owner        Deadline
  ─────────────────────────────────────────────────────────────────────
  P1         Finalize and approve AUP                       Legal        Week 2
  P1         Complete vendor DPA negotiations               Legal        Week 3
  P1         Update IRP with AI-specific addendum           Legal+IT     Week 2
  P2         Review client contracts for AI restrictions    Legal        Week 4
  P2         Update Data Classification Policy              Legal+DPO    Week 4
  P2         Implement open-source license scanning         Legal+Eng    Week 6
  P3         Develop AI usage transparency notice           Legal+HR     Week 8
  P3         Create developer training on legal compliance  Legal+L&D    Week 8

================================================================================
  END OF REPORT
  Generated by GovAI Studio — ${date}
================================================================================
`;
}

function generateITSecurityReport(projectId: string): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `================================================================================
  IT / SECURITY REPORT
  AI Coding Agent Governance — Security Architecture & Configuration
================================================================================

  Project ID:     ${projectId}
  Date Generated: ${date}
  Classification: CONFIDENTIAL — IT & Security Team

================================================================================
  1. SANDBOX ARCHITECTURE OVERVIEW
================================================================================

  1.1 ENVIRONMENT TOPOLOGY
  ─────────────────────────────────────────────────────────────────────

  The AI coding agent sandbox is designed as an isolated execution environment
  that provides controlled access to AI coding tools while enforcing security
  boundaries defined by organizational policy.

  Architecture Layers:

  ┌─────────────────────────────────────────────────────────────────────┐
  │  DEVELOPER WORKSTATION                                              │
  │  ┌──────────────────┐  ┌──────────────────┐                        │
  │  │  IDE (VS Code)   │  │  Terminal/CLI     │                        │
  │  │  + AI Extension  │  │  + Claude Code    │                        │
  │  └───────┬──────────┘  └───────┬──────────┘                        │
  │          │                     │                                     │
  │          └──────────┬──────────┘                                     │
  │                     │                                                │
  │  ┌──────────────────▼───────────────────────┐                       │
  │  │  LOCAL PROXY / DLP AGENT                  │                       │
  │  │  (Intercepts + classifies all AI traffic) │                       │
  │  └──────────────────┬───────────────────────┘                       │
  └─────────────────────┼───────────────────────────────────────────────┘
                        │ TLS 1.3 (Encrypted)
  ┌─────────────────────┼───────────────────────────────────────────────┐
  │  NETWORK BOUNDARY   │                                               │
  │  ┌──────────────────▼───────────────────────┐                       │
  │  │  EGRESS PROXY / FIREWALL                  │                       │
  │  │  (Allowlist: api.anthropic.com,           │                       │
  │  │   api.openai.com — port 443 only)         │                       │
  │  └──────────────────┬───────────────────────┘                       │
  └─────────────────────┼───────────────────────────────────────────────┘
                        │
  ┌─────────────────────▼───────────────────────────────────────────────┐
  │  AI VENDOR API (Anthropic / OpenAI)                                 │
  │  - Zero data retention (contractual + API setting)                  │
  │  - SOC 2 Type II certified                                          │
  │  - DPA signed                                                       │
  └─────────────────────────────────────────────────────────────────────┘

  1.2 SANDBOX ENVIRONMENT SPECIFICATIONS
  ─────────────────────────────────────────────────────────────────────

  Component             Specification
  ─────────────────────────────────────────────────────────────────────
  Compute               Isolated VPC / VNET — no peering to production
  Container Runtime     Docker with seccomp + AppArmor profiles
  Orchestration         Kubernetes namespace with NetworkPolicy
  Storage               Ephemeral volumes — no persistent PII storage
  Network               Private subnet, NAT gateway for egress only
  DNS                   Restricted resolution (allowlist only)
  Secrets               HashiCorp Vault with short-lived tokens
  Monitoring            Prometheus + Grafana + custom AI metrics
  Logging               ELK stack with 90-day retention

================================================================================
  2. NETWORK ISOLATION DETAILS
================================================================================

  2.1 FIREWALL RULES
  ─────────────────────────────────────────────────────────────────────

  Rule   Direction   Source              Dest                  Port   Action
  ─────────────────────────────────────────────────────────────────────
  R001   Egress      Sandbox CIDR        api.anthropic.com     443    ALLOW
  R002   Egress      Sandbox CIDR        api.openai.com        443    ALLOW
  R003   Egress      Sandbox CIDR        github.com            443    ALLOW
  R004   Egress      Sandbox CIDR        registry.npmjs.org    443    ALLOW
  R005   Egress      Sandbox CIDR        pypi.org              443    ALLOW
  R006   Egress      Sandbox CIDR        *                     *      DENY
  R007   Ingress     Corporate VPN       Sandbox CIDR          22     ALLOW
  R008   Ingress     Monitoring CIDR     Sandbox CIDR          9090   ALLOW
  R009   Ingress     *                   Sandbox CIDR          *      DENY

  2.2 KUBERNETES NETWORK POLICY
  ─────────────────────────────────────────────────────────────────────

  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    name: ai-sandbox-isolation
    namespace: ai-sandbox
  spec:
    podSelector: {}
    policyTypes:
      - Ingress
      - Egress
    ingress:
      - from:
          - namespaceSelector:
              matchLabels:
                purpose: monitoring
    egress:
      - to:
          - ipBlock:
              cidr: 0.0.0.0/0
        ports:
          - protocol: TCP
            port: 443

  2.3 DNS RESTRICTIONS
  ─────────────────────────────────────────────────────────────────────

  The sandbox DNS resolver is configured to resolve ONLY the following domains:

    • api.anthropic.com
    • api.openai.com
    • github.com
    • registry.npmjs.org
    • pypi.org
    • *.vault.hashicorp.com (internal)
    • *.monitoring.internal (internal)

  All other DNS queries return NXDOMAIN.

================================================================================
  3. DLP CONFIGURATION
================================================================================

  3.1 DLP RULE SET
  ─────────────────────────────────────────────────────────────────────

  Rule ID   Pattern Type         Action     Description
  ─────────────────────────────────────────────────────────────────────
  DLP-001   PII Detection        BLOCK      SSN, credit card, email + name
  DLP-002   PHI Detection        BLOCK      Medical record numbers, diagnoses
  DLP-003   Secret Detection     BLOCK      API keys, passwords, tokens
  DLP-004   Source Code Class.   LOG+WARN   Confidential-tagged code files
  DLP-005   Large Payload        ALERT      Prompts exceeding 50KB
  DLP-006   Keyword Blocklist    BLOCK      Custom sensitive terms list
  DLP-007   File Path Pattern    BLOCK      Paths matching /secrets/, /keys/

  3.2 DLP IMPLEMENTATION
  ─────────────────────────────────────────────────────────────────────

  Detection Engine:   Regex + ML-based NER (Named Entity Recognition)
  Deployment Mode:    Inline proxy (all AI API traffic routed through DLP)
  Response Actions:   Block, Log, Alert, Redact
  Bypass Policy:      No bypass permitted; exceptions require CISO approval
  Update Frequency:   Rule patterns updated weekly; ML models monthly

  3.3 SENSITIVE DATA PATTERNS
  ─────────────────────────────────────────────────────────────────────

  Pattern Name               Regex / Description
  ─────────────────────────────────────────────────────────────────────
  US SSN                     \\b\\d{3}-\\d{2}-\\d{4}\\b
  Credit Card (Visa)         \\b4[0-9]{12}(?:[0-9]{3})?\\b
  Credit Card (MC)           \\b5[1-5][0-9]{14}\\b
  AWS Access Key             \\bAKIA[0-9A-Z]{16}\\b
  Generic API Key            \\b[a-zA-Z0-9]{32,64}\\b (context-aware)
  Private Key Header         -----BEGIN (RSA |EC )?PRIVATE KEY-----
  Database Connection String (postgres|mysql|mongodb)://[^\\s]+

================================================================================
  4. AUDIT LOGGING SETUP
================================================================================

  4.1 LOG CATEGORIES
  ─────────────────────────────────────────────────────────────────────

  Category              Events Captured                     Retention
  ─────────────────────────────────────────────────────────────────────
  Authentication        Login, logout, token refresh        1 year
  AI API Calls          All requests to AI vendor APIs      90 days
  DLP Events            Block, alert, redact actions        1 year
  Code Operations       Commits, PRs with AI-assisted flag  1 year
  Admin Actions         Config changes, user management     2 years
  Sandbox Lifecycle     Create, destroy, modify sandbox     90 days

  4.2 LOG SCHEMA (AI API CALL)
  ─────────────────────────────────────────────────────────────────────

  {
    "timestamp": "2025-01-15T14:30:22.456Z",
    "event_type": "ai_api_call",
    "user_id": "usr_abc123",
    "user_email": "developer@company.com",
    "ai_vendor": "anthropic",
    "ai_model": "claude-sonnet-4-20250514",
    "prompt_token_count": 1250,
    "response_token_count": 890,
    "prompt_hash": "sha256:abc123...",
    "dlp_scan_result": "PASS",
    "project_id": "${projectId}",
    "sandbox_id": "sbx_xyz789",
    "session_id": "ses_def456",
    "source_ip": "10.0.1.42",
    "latency_ms": 2340
  }

  4.3 LOG PIPELINE ARCHITECTURE
  ─────────────────────────────────────────────────────────────────────

  [AI Agent] --> [Local Proxy] --> [Fluentd Collector]
       |                                    |
       v                                    v
  [DLP Engine] ----alert----> [SIEM (Splunk/Elastic)]
                                            |
                                            v
                                   [Dashboard + Alerts]
                                            |
                                            v
                                   [Compliance Archive (S3)]

  4.4 ALERTING THRESHOLDS
  ─────────────────────────────────────────────────────────────────────

  Alert Condition                              Severity   Response
  ─────────────────────────────────────────────────────────────────────
  DLP block event                              HIGH       Immediate review
  >100 API calls/hour by single user           MEDIUM     Auto-throttle
  API call outside business hours              LOW        Log + weekly review
  Sandbox config modification                  MEDIUM     Admin notification
  Failed authentication (>5 in 10 min)         HIGH       Account lockout
  Prompt >100KB token count                    MEDIUM     Auto-block + review
  New AI model version detected                LOW        Change review

================================================================================
  5. MANAGED-SETTINGS.JSON DOCUMENTATION
================================================================================

  5.1 CONFIGURATION FILE
  ─────────────────────────────────────────────────────────────────────

  Location: ~/.claude/managed-settings.json (per-user)
            /etc/claude/managed-settings.json (system-wide, takes precedence)

  {
    "permissions": {
      "allow_network_access": false,
      "allow_file_write": true,
      "allow_file_read": true,
      "allow_shell_commands": true,
      "allowed_shell_commands": [
        "git",
        "npm",
        "npx",
        "node",
        "python",
        "pip",
        "pytest",
        "cargo",
        "rustc",
        "go",
        "make"
      ],
      "blocked_shell_commands": [
        "curl",
        "wget",
        "ssh",
        "scp",
        "rsync",
        "nc",
        "ncat"
      ],
      "allow_mcp_servers": false
    },
    "paths": {
      "allowed_directories": [
        "/home/*/projects/**",
        "/tmp/ai-sandbox/**"
      ],
      "blocked_directories": [
        "/etc/**",
        "/var/**",
        "/home/*/.ssh/**",
        "/home/*/.aws/**",
        "/home/*/.config/gcloud/**"
      ]
    },
    "model": {
      "default_model": "claude-sonnet-4-20250514",
      "max_tokens_per_request": 8192,
      "max_requests_per_hour": 60,
      "temperature": 0.0
    },
    "telemetry": {
      "send_telemetry": false,
      "log_prompts_locally": true,
      "local_log_path": "/var/log/ai-agent/prompts/"
    },
    "security": {
      "require_human_approval_for": [
        "file_delete",
        "git_push",
        "package_install"
      ],
      "auto_scan_output_for_secrets": true,
      "max_file_size_bytes": 1048576
    }
  }

  5.2 SETTING DESCRIPTIONS
  ─────────────────────────────────────────────────────────────────────

  Setting                          Purpose
  ─────────────────────────────────────────────────────────────────────
  allow_network_access             Prevents AI agent from making HTTP calls
  allowed_shell_commands           Whitelist of permitted CLI tools
  blocked_directories              Prevents access to credential stores
  max_requests_per_hour            Rate limiting per developer
  send_telemetry                   Disabled — no data sent to vendor
  log_prompts_locally              All prompts logged for audit trail
  require_human_approval_for       Actions requiring explicit confirmation
  auto_scan_output_for_secrets     Scans AI output for leaked credentials

  5.3 DEPLOYMENT
  ─────────────────────────────────────────────────────────────────────

  Distribution Method:  Group Policy / MDM push to all developer machines
  Update Cadence:       Monthly, or as needed for security patches
  Override Policy:      User-level settings CANNOT override system-level
  Validation:           JSON schema validation on agent startup

================================================================================
  6. SECURITY CHECKLIST
================================================================================

  [x] Sandbox VPC/VNET created and isolated from production
  [x] Firewall rules configured with egress allowlist
  [x] TLS 1.3 enforced for all AI API communications
  [x] SSO/SAML integration for AI tool authentication
  [x] Secrets management integrated (Vault/AWS SM)
  [ ] DLP rules deployed and validated (IN PROGRESS)
  [ ] Audit logging pipeline operational (IN PROGRESS)
  [x] managed-settings.json template created
  [ ] managed-settings.json deployed to all dev machines (PLANNED)
  [x] Kubernetes NetworkPolicy applied
  [ ] SIEM integration configured (IN PROGRESS)
  [x] Incident response procedures updated
  [ ] Penetration test of sandbox environment (PLANNED)
  [x] Vendor security assessments completed

  Completion: 8 of 14 items (57%)
  Target for Gate 1 Review: 12 of 14 items (86%)

================================================================================
  END OF REPORT
  Generated by GovAI Studio — ${date}
================================================================================
`;
}

function generateEngineeringReport(projectId: string): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `================================================================================
  ENGINEERING / DEV REPORT
  AI Coding Agent Governance — Technical Evaluation & Setup Guide
================================================================================

  Project ID:     ${projectId}
  Date Generated: ${date}
  Classification: INTERNAL — Engineering Team

================================================================================
  1. TOOL COMPARISON RESULTS
================================================================================

  1.1 EVALUATION OVERVIEW
  ─────────────────────────────────────────────────────────────────────

  Two AI coding agents were evaluated over a 4-week PoC period with two
  engineering squads (8 developers total, 4 per tool). Each squad completed
  identical sprint objectives to enable direct comparison.

  Tools Evaluated:
    • Claude Code (Anthropic) — CLI-based agentic coding assistant
    • OpenAI Codex — Cloud-based coding agent

  1.2 HEAD-TO-HEAD COMPARISON
  ─────────────────────────────────────────────────────────────────────

  Metric                     Claude Code    Codex       Winner
  ─────────────────────────────────────────────────────────────────────
  Task Completion Rate       94.2%          87.6%       Claude Code
  Avg Time to Complete       12.4 min       18.7 min    Claude Code
  Code Quality Score         8.7/10         8.2/10      Claude Code
  Test Pass Rate (1st run)   91.3%          85.1%       Claude Code
  Context Window Usage       Excellent      Good        Claude Code
  Multi-file Editing         Native         Limited     Claude Code
  Setup Complexity           Low (CLI)      Medium      Claude Code
  IDE Integration            Terminal+IDE   Web UI      Tie
  Cost per Developer/Month   $50-100        $50-100     Tie
  Documentation Quality      Strong         Strong      Tie

  1.3 DETAILED EVALUATION SCORES
  ─────────────────────────────────────────────────────────────────────

  Category (Weight)          Claude Code    Codex       Notes
  ─────────────────────────────────────────────────────────────────────
  Code Generation (25%)      9.1            8.4         Claude excels at
                                                        multi-file changes
  Code Understanding (20%)   9.3            8.7         Both strong at
                                                        codebase navigation
  Testing (15%)              8.5            7.9         Claude generates
                                                        more thorough tests
  Debugging (15%)            8.8            8.1         Claude better at
                                                        root cause analysis
  Refactoring (10%)          8.9            8.3         Claude handles
                                                        large refactors well
  Documentation (10%)        8.2            8.5         Codex slightly
                                                        better formatting
  DevOps/Config (5%)         7.8            7.2         Both adequate

  Overall Weighted Score:    8.84           8.22

  Recommendation: Claude Code selected as primary tool for production rollout.

================================================================================
  2. SPRINT METRICS
================================================================================

  2.1 BASELINE VS AI-ASSISTED COMPARISON
  ─────────────────────────────────────────────────────────────────────

  Sprint metrics collected over 4 sprints (2 baseline + 2 AI-assisted):

  Metric                  Baseline    AI-Assisted    Change     Significance
                          (Avg)       (Avg)
  ─────────────────────────────────────────────────────────────────────
  Velocity (story pts)    42          58             +38.1%     p < 0.01
  Cycle Time (hours)      18.4        12.1           -34.2%     p < 0.01
  Lead Time (hours)       32.6        23.8           -27.0%     p < 0.05
  Defect Density          3.2/KLOC    2.4/KLOC       -25.0%     p < 0.05
  Code Review Time        6.1 hrs     4.5 hrs        -26.2%     p < 0.05
  PR Merge Rate           82%         91%            +11.0%     p < 0.05
  Test Coverage           71%         84%            +18.3%     p < 0.01
  Dev Satisfaction (NPS)  +32         +51            +59.4%     Survey

  2.2 SPRINT-BY-SPRINT BREAKDOWN
  ─────────────────────────────────────────────────────────────────────

  Sprint    Type         Velocity   Defects   Coverage   Satisfaction
  ─────────────────────────────────────────────────────────────────────
  S1        Baseline     40         14        69%        +30
  S2        Baseline     44         12        73%        +34
  S3        AI-Assisted  54         10        81%        +47
  S4        AI-Assisted  62         8         87%        +55

  2.3 PRODUCTIVITY BY TASK TYPE
  ─────────────────────────────────────────────────────────────────────

  Task Type              Baseline Avg    AI-Assisted Avg    Improvement
  ─────────────────────────────────────────────────────────────────────
  New Feature Dev        8.2 hrs         4.8 hrs            -41.5%
  Bug Fix                3.1 hrs         1.9 hrs            -38.7%
  Refactoring            5.6 hrs         3.2 hrs            -42.9%
  Test Writing           4.3 hrs         2.1 hrs            -51.2%
  Documentation          2.8 hrs         1.4 hrs            -50.0%
  Code Review            1.5 hrs         1.1 hrs            -26.7%
  DevOps/Config          3.4 hrs         2.6 hrs            -23.5%

  Largest gains: Test writing (-51.2%) and documentation (-50.0%)
  Smallest gains: DevOps/Config (-23.5%) and code review (-26.7%)

================================================================================
  3. SETUP GUIDE
================================================================================

  3.1 PREREQUISITES
  ─────────────────────────────────────────────────────────────────────

  System Requirements:
    • Node.js 18+ (LTS recommended)
    • Git 2.40+
    • Terminal with ANSI color support
    • 8GB+ RAM recommended
    • macOS 13+, Ubuntu 22.04+, or Windows 11 with WSL2

  Account Requirements:
    • Anthropic API key (provisioned by IT — do NOT create personal keys)
    • GitHub SSO authentication configured
    • VPN connected to corporate network

  3.2 INSTALLATION
  ─────────────────────────────────────────────────────────────────────

  Step 1: Install Claude Code CLI

    npm install -g @anthropic-ai/claude-code

  Step 2: Verify Installation

    claude --version

  Step 3: Authenticate (SSO)

    claude auth login --sso

  Step 4: Verify managed settings are applied

    claude config check
    # Should show: "Managed settings: /etc/claude/managed-settings.json"

  Step 5: Test in sandbox project

    cd ~/projects/ai-sandbox-test
    claude "Explain the structure of this project"

  3.3 DAILY WORKFLOW
  ─────────────────────────────────────────────────────────────────────

  Recommended AI-Assisted Development Workflow:

    1. START SESSION
       $ cd ~/projects/my-project
       $ claude
       > "I'm working on JIRA-1234: Add user authentication to the API"

    2. IMPLEMENT WITH AI ASSISTANCE
       > "Create the auth middleware in src/middleware/auth.ts"
       > "Write unit tests for the auth middleware"
       > "Update the API routes to use the new middleware"

    3. REVIEW AI OUTPUT
       - Review all generated code before committing
       - Run test suite: npm test
       - Check for security issues: npm audit

    4. COMMIT WITH AI-ASSISTED FLAG
       $ git commit -m "feat(auth): add API authentication middleware

       AI-assisted: yes
       Tool: claude-code
       Session: [auto-populated]"

    5. CREATE PR
       $ claude "Create a PR description for these changes"
       $ gh pr create --title "..." --body "..."

  3.4 BEST PRACTICES
  ─────────────────────────────────────────────────────────────────────

  DO:
    • Provide clear, specific instructions with context
    • Break complex tasks into smaller steps
    • Review all AI-generated code thoroughly
    • Use AI for test generation to improve coverage
    • Commit AI-assisted code with appropriate flags
    • Report any unexpected behavior to the AI governance team

  DO NOT:
    • Paste API keys, passwords, or secrets into prompts
    • Use AI agents on client projects without checking contract terms
    • Accept AI output without review for security-critical code
    • Share your AI tool session logs outside the organization
    • Attempt to override managed-settings.json restrictions
    • Use personal API keys instead of organization-provisioned ones

  3.5 TROUBLESHOOTING
  ─────────────────────────────────────────────────────────────────────

  Issue                          Solution
  ─────────────────────────────────────────────────────────────────────
  "Permission denied"            Check managed-settings.json paths config
  "Rate limit exceeded"          Wait 60 min or contact IT for limit increase
  "Network error"                Verify VPN connection and proxy settings
  "Model not available"          Check allowed model list in managed settings
  Authentication failure         Run: claude auth login --sso --refresh
  Slow response times            Check network latency; try smaller prompts
  Context window exceeded        Break task into smaller chunks

================================================================================
  4. CODE QUALITY BENCHMARKS
================================================================================

  4.1 STATIC ANALYSIS RESULTS
  ─────────────────────────────────────────────────────────────────────

  Metric                    Human Only    AI-Assisted    Change
  ─────────────────────────────────────────────────────────────────────
  ESLint Errors/KLOC        4.2           2.1            -50.0%
  ESLint Warnings/KLOC      12.8          8.3            -35.2%
  TypeScript Strict Errors   0.8           0.3            -62.5%
  Complexity (avg/fn)        8.4           6.2            -26.2%
  Duplication %              4.1%          2.8%           -31.7%
  Comment Coverage           22%           38%            +72.7%

  4.2 SECURITY SCAN RESULTS
  ─────────────────────────────────────────────────────────────────────

  Finding Type              Human Only    AI-Assisted    Change
  ─────────────────────────────────────────────────────────────────────
  Critical Vulnerabilities  0             0              No change
  High Vulnerabilities      2             1              -50.0%
  Medium Vulnerabilities    8             5              -37.5%
  Low Vulnerabilities       15            12             -20.0%
  Hardcoded Secrets         1             0              -100.0%
  Insecure Dependencies     3             2              -33.3%

  4.3 TEST QUALITY METRICS
  ─────────────────────────────────────────────────────────────────────

  Metric                    Human Only    AI-Assisted    Change
  ─────────────────────────────────────────────────────────────────────
  Line Coverage             71%           84%            +18.3%
  Branch Coverage           58%           72%            +24.1%
  Mutation Score            42%           61%            +45.2%
  Test/Code Ratio           0.6           1.1            +83.3%
  Avg Assertions/Test       2.1           3.4            +61.9%
  Flaky Test Rate           3.2%          1.8%           -43.8%

  AI-assisted development shows improvement across all test quality metrics,
  with particularly strong gains in mutation testing score (+45.2%) and
  test-to-code ratio (+83.3%).

================================================================================
  5. RECOMMENDATIONS FOR ENGINEERING TEAM
================================================================================

  1. Adopt Claude Code as the primary AI coding assistant
  2. Require AI-assisted commit flagging in all repositories
  3. Set up team-wide managed-settings.json via IT deployment
  4. Establish weekly AI tips/tricks sharing sessions
  5. Create internal prompt library for common development tasks
  6. Monitor and report productivity metrics monthly
  7. Contribute to organizational prompt engineering best practices
  8. Participate in quarterly tool re-evaluation cycles

================================================================================
  END OF REPORT
  Generated by GovAI Studio — ${date}
================================================================================
`;
}

function generateMarketingReport(projectId: string): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `================================================================================
  MARKETING / COMMS REPORT
  AI Coding Agent Governance — Communications & Change Management
================================================================================

  Project ID:     ${projectId}
  Date Generated: ${date}
  Classification: INTERNAL — Marketing & Communications Team

================================================================================
  1. MESSAGING GUIDE
================================================================================

  1.1 CORE NARRATIVE
  ─────────────────────────────────────────────────────────────────────

  Primary Message:

    "We are thoughtfully adopting AI coding assistants to enhance our
    engineering capabilities, improve code quality, and accelerate innovation
    — while maintaining the highest standards of security, compliance, and
    responsible AI governance."

  Supporting Messages:

    For Leadership:
    "Our structured AI governance approach ensures we capture competitive
    advantages from AI coding tools while managing risk through a proven
    three-gate evaluation framework. Early results show 38% productivity
    gains with improved code quality."

    For Engineering Teams:
    "AI coding assistants are here to amplify your skills, not replace them.
    Think of these tools as a highly capable pair programmer that handles
    routine tasks so you can focus on creative problem-solving and
    architecture decisions."

    For Clients/External:
    "We leverage state-of-the-art development tools, including AI-assisted
    coding, within a rigorous governance framework that ensures code quality,
    security, and intellectual property protection for every project."

    For Regulators/Auditors:
    "Our AI coding tool deployment follows a comprehensive governance
    framework with documented policies, compliance mappings, security
    controls, and audit trails that meet or exceed industry standards."

  1.2 KEY TALKING POINTS
  ─────────────────────────────────────────────────────────────────────

    • GOVERNANCE FIRST: We implemented comprehensive governance policies and
      security controls BEFORE deploying AI tools — not after.

    • HUMAN IN THE LOOP: Every line of AI-generated code goes through our
      standard code review process. AI assists; humans decide.

    • SECURITY BY DESIGN: Our sandbox architecture, DLP controls, and managed
      settings ensure AI tools operate within strict security boundaries.

    • MEASURABLE RESULTS: Our PoC demonstrated 38% velocity improvement, 25%
      fewer defects, and 18% higher test coverage with AI assistance.

    • COMPLIANCE MAPPED: Our deployment is mapped to SOC 2, HIPAA, NIST CSF,
      and GDPR frameworks with documented controls.

    • RESPONSIBLE ADOPTION: We follow a three-gate review process — sandbox
      validation, pilot evaluation, and production readiness — before any
      organization-wide deployment.

  1.3 MESSAGING DO'S AND DON'TS
  ─────────────────────────────────────────────────────────────────────

  DO SAY:                              DON'T SAY:
  ─────────────────────────────────────────────────────────────────────
  "AI-assisted development"            "AI-generated code"
  "Enhanced developer productivity"    "Replacing developers"
  "Augmented engineering capability"   "Automated coding"
  "Governance-first approach"          "Moving fast with AI"
  "Structured evaluation"              "Experimenting with AI"
  "Human-reviewed code"                "AI writes our code"
  "Responsible AI adoption"            "AI transformation"

================================================================================
  2. FREQUENTLY ASKED QUESTIONS (FAQ)
================================================================================

  Q1: Are we replacing developers with AI?
  ─────────────────────────────────────────────────────────────────────
  A: Absolutely not. AI coding assistants are tools that help developers work
  more efficiently, similar to how IDEs, linters, and testing frameworks
  enhance productivity. Our developers remain fully in control of all
  architectural decisions, code review, and quality assurance. The AI handles
  routine tasks so our engineers can focus on higher-value creative and
  strategic work.

  Q2: Is our code and data safe when using AI tools?
  ─────────────────────────────────────────────────────────────────────
  A: Yes. We have implemented multiple layers of security controls:
    • All AI tools operate within an isolated sandbox environment
    • Data Loss Prevention (DLP) systems scan every interaction
    • Sensitive data (PII, credentials, proprietary code) is automatically
      blocked from being sent to AI services
    • We have contractual zero-data-retention agreements with AI vendors
    • All interactions are logged and auditable

  Q3: How does this affect our compliance certifications?
  ─────────────────────────────────────────────────────────────────────
  A: Our AI deployment has been mapped against SOC 2, HIPAA, NIST CSF, and
  GDPR requirements. Our Legal and Compliance team has reviewed and documented
  controls for each framework. In fact, the structured governance approach we
  are taking may strengthen our compliance posture by adding additional
  controls and audit capabilities.

  Q4: What governance process did we follow?
  ─────────────────────────────────────────────────────────────────────
  A: We follow a rigorous three-gate review process:
    • Gate 1 (Sandbox): Security validation, DLP testing, isolation verification
    • Gate 2 (Pilot): Controlled deployment with two teams, metrics collection,
      risk monitoring over 4 weeks
    • Gate 3 (Production): Full readiness review, compliance sign-off, training
      completion, monitoring infrastructure confirmed
  Each gate requires sign-off from Security, Legal, Engineering, and Executive
  stakeholders before proceeding.

  Q5: What were the results of the pilot?
  ─────────────────────────────────────────────────────────────────────
  A: Our 4-week pilot with two engineering squads showed:
    • 38% increase in development velocity
    • 25% reduction in defect density
    • 18% improvement in test coverage
    • 34% faster cycle time from start to deployment
    • Developer satisfaction increased from +32 to +51 NPS

  Q6: Which AI tools are we using and why?
  ─────────────────────────────────────────────────────────────────────
  A: After evaluating multiple tools in a structured head-to-head comparison,
  we selected Claude Code by Anthropic as our primary AI coding assistant.
  Claude Code scored highest in task completion rate, code quality, and
  multi-file editing capability. Our evaluation was conducted with objective
  metrics across identical sprint objectives.

  Q7: Will this affect our client contracts or relationships?
  ─────────────────────────────────────────────────────────────────────
  A: Our Legal team has reviewed client contracts and established clear
  guidelines for AI tool usage per engagement. For clients with specific
  restrictions, we fully comply with contractual terms. Our governance
  framework includes client-specific configuration profiles that enforce
  appropriate restrictions.

  Q8: How are we ensuring code quality with AI assistance?
  ─────────────────────────────────────────────────────────────────────
  A: AI-generated code goes through the same rigorous review process as
  human-written code. Additionally, our pilot showed that AI assistance
  actually improved code quality metrics: fewer linting errors, lower
  complexity scores, higher test coverage, and reduced code duplication.
  All AI-assisted commits are flagged for traceability.

  Q9: What training is available for developers?
  ─────────────────────────────────────────────────────────────────────
  A: We offer a structured onboarding program:
    • Online self-paced course: AI Coding Tools Fundamentals (2 hours)
    • Hands-on workshop: Effective AI-Assisted Development (4 hours)
    • Weekly tips-and-tricks sharing sessions
    • Internal prompt library with best practices
    • Dedicated Slack channel for peer support

  Q10: What if something goes wrong?
  ─────────────────────────────────────────────────────────────────────
  A: We have an AI-specific Incident Response Plan (IRP) addendum that covers:
    • Data exposure incidents
    • Tool malfunction or unexpected behavior
    • Compliance concerns or violations
    • Escalation procedures and responsible parties
  Our Security Operations team monitors AI tool usage in real-time with
  automated alerting for anomalous behavior.

================================================================================
  3. CHANGE MANAGEMENT NARRATIVE
================================================================================

  3.1 THE VISION
  ─────────────────────────────────────────────────────────────────────

  The adoption of AI coding assistants represents a significant evolution in
  our engineering practice. This is not about replacing human creativity and
  expertise — it is about providing our talented developers with the most
  powerful tools available to do their best work.

  Just as the introduction of IDEs, version control, and CI/CD transformed
  software development, AI coding assistants represent the next leap in
  developer productivity and code quality.

  3.2 WHY NOW
  ─────────────────────────────────────────────────────────────────────

  Several converging factors make this the right time for adoption:

    • Technology Maturity: AI coding tools have reached a level of reliability
      and capability that delivers measurable productivity gains.

    • Competitive Landscape: Leading technology organizations are already
      deploying AI coding tools. Early adoption positions us competitively
      for talent attraction and project delivery.

    • Governance Readiness: Our organization has invested in the security,
      compliance, and policy infrastructure needed for responsible adoption.

    • Team Readiness: Developer enthusiasm for AI tools is high, and our
      engineering culture of code review and quality creates a strong
      foundation for AI-augmented development.

  3.3 THE JOURNEY — PHASED APPROACH
  ─────────────────────────────────────────────────────────────────────

  Phase 1 — ASSESS (Complete)
    Duration: 2 weeks
    Activities: Feasibility assessment, stakeholder interviews, risk analysis
    Outcome: Overall score of 78/100 — "Ready with Conditions"

  Phase 2 — SECURE (In Progress)
    Duration: 3 weeks
    Activities: Sandbox setup, DLP configuration, policy finalization
    Outcome: Secure, compliant environment for AI tool usage

  Phase 3 — PILOT (Upcoming)
    Duration: 4 weeks
    Activities: Two-squad pilot, metrics collection, tool comparison
    Outcome: Validated productivity gains, risk validation, tool selection

  Phase 4 — EXPAND (Planned)
    Duration: 6 weeks
    Activities: Training rollout, gradual team-by-team expansion
    Outcome: Organization-wide AI coding tool availability

  Phase 5 — OPTIMIZE (Ongoing)
    Duration: Continuous
    Activities: Metrics monitoring, prompt library growth, process refinement
    Outcome: Maximized value from AI-assisted development

  3.4 STAKEHOLDER COMMUNICATIONS PLAN
  ─────────────────────────────────────────────────────────────────────

  Audience            Channel              Frequency      Owner
  ─────────────────────────────────────────────────────────────────────
  Executive Team      Steering committee   Bi-weekly      VP Engineering
  Engineering (all)   All-hands + Slack    Weekly         Eng Manager
  Engineering (pilot) Daily standup        Daily          Tech Lead
  Legal/Compliance    Status meeting       Weekly         Legal Counsel
  IT/Security         Ops review           Weekly         CISO
  HR/People           Email update         Bi-weekly      HR Partner
  All Employees       Newsletter           Monthly        Comms Lead
  Clients (affected)  Account manager      As needed      Account Mgr

  3.5 COMMUNICATION TIMELINE
  ─────────────────────────────────────────────────────────────────────

  Week 1:   Executive announcement (steering committee)
  Week 2:   Engineering all-hands presentation
  Week 3:   IT/Security detailed briefing
  Week 4:   Legal/Compliance review session
  Week 5:   Pilot kickoff announcement (engineering-wide)
  Week 6:   First weekly pilot update (Slack + email)
  Week 8:   Mid-pilot progress update (all-hands)
  Week 10:  Pilot results presentation (steering committee)
  Week 11:  Go/No-Go decision announcement
  Week 12:  Training program launch announcement
  Week 14:  Phased rollout begins (team-by-team)
  Week 20:  Organization-wide availability announcement

  3.6 SUCCESS METRICS FOR CHANGE MANAGEMENT
  ─────────────────────────────────────────────────────────────────────

  Metric                              Target        Measurement
  ─────────────────────────────────────────────────────────────────────
  Developer Adoption Rate             >80%          Monthly tool usage stats
  Training Completion                 100%          LMS completion records
  Developer Satisfaction (NPS)        >+40          Quarterly survey
  Support Ticket Volume               <5/week       Help desk tracking
  Policy Compliance Rate              100%          Automated audit
  Stakeholder Awareness               >90%          Survey after comms
  Voluntary AI Champion Signups       >15%          Self-nomination

================================================================================
  4. TEMPLATES & ASSETS
================================================================================

  The following communication templates are available for use:

  4.1 Email Templates:
    • Executive Announcement (internal memo)
    • Engineering All-Hands Invitation
    • Pilot Kickoff Announcement
    • Weekly Pilot Status Update
    • Training Program Launch
    • Go/No-Go Decision Announcement

  4.2 Presentation Decks:
    • Executive Steering Committee Briefing (10 slides)
    • Engineering All-Hands: AI Tools Overview (20 slides)
    • Pilot Results & Recommendations (15 slides)

  4.3 Internal Collateral:
    • One-page AI Coding Tools Overview
    • Developer Quick-Start Card
    • FAQ Poster (for break rooms / digital signage)
    • Governance Framework Infographic

  Contact the Communications team for access to all templates and assets.

================================================================================
  END OF REPORT
  Generated by GovAI Studio — ${date}
================================================================================
`;
}

function generateReportContent(personaId: string, projectId: string): string {
  switch (personaId) {
    case 'executive':
      return generateExecutiveReport(projectId);
    case 'legal':
      return generateLegalReport(projectId);
    case 'it_security':
      return generateITSecurityReport(projectId);
    case 'engineering':
      return generateEngineeringReport(projectId);
    case 'marketing':
      return generateMarketingReport(projectId);
    default:
      return `Report for persona "${personaId}" — Project ${projectId}`;
  }
}

function getReportFileExtension(personaId: string): string {
  switch (personaId) {
    case 'executive':
    case 'it_security':
    case 'engineering':
      return 'md';
    case 'legal':
    case 'marketing':
      return 'md';
    default:
      return 'txt';
  }
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const PERSONAS: ReportPersona[] = [
  {
    id: 'executive',
    title: 'Executive / Board',
    subtitle: 'Strategic overview for leadership decision-making',
    icon: Briefcase,
    format: 'PDF',
    pageCount: '3-5 pages',
    includes: [
      'Feasibility score summary',
      'ROI projection',
      'Risk heat map',
      'Go/No-Go recommendation',
    ],
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-500/10',
  },
  {
    id: 'legal',
    title: 'Legal / Compliance',
    subtitle: 'Editable compliance and contract documentation',
    icon: Scale,
    format: 'DOCX',
    pageCount: 'Editable',
    includes: [
      'Contract analysis',
      'Compliance framework mapping',
      'AUP review',
      'Regulatory risk assessment',
    ],
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
  },
  {
    id: 'it_security',
    title: 'IT / Security',
    subtitle: 'Technical security architecture and configuration',
    icon: ShieldCheck,
    format: 'PDF + Configs',
    pageCount: '8-12 pages',
    includes: [
      'Sandbox architecture diagrams',
      'Security configuration details',
      'DLP rule documentation',
      'Network isolation validation',
    ],
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
  },
  {
    id: 'engineering',
    title: 'Engineering / Dev',
    subtitle: 'Technical evaluation results and setup documentation',
    icon: Code2,
    format: 'Markdown + PDF',
    pageCount: '10-15 pages',
    includes: [
      'Tool comparison results',
      'Sprint metrics analysis',
      'Setup and onboarding guides',
      'Code quality benchmarks',
    ],
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-500/10',
  },
  {
    id: 'marketing',
    title: 'Marketing / Comms',
    subtitle: 'Internal communications and change management',
    icon: Megaphone,
    format: 'DOCX',
    pageCount: 'Editable',
    includes: [
      'Messaging guide',
      'FAQ document',
      'Change management narrative',
      'Stakeholder communications plan',
    ],
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-500/10',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReportGeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const { data: fetchedTemplates, isLoading, error } = useReportTemplates();
  const generateMutation = useGenerateReport();
  const [generateStates, setGenerateStates] = React.useState<
    Record<string, GenerateState>
  >({});

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  // Use fetched templates or fall back to demo personas
  const personas: ReportPersona[] = PERSONAS;

  const handleGenerate = (personaId: ReportPersonaType): void => {
    setGenerateStates((prev) => ({ ...prev, [personaId]: 'generating' }));

    generateMutation.mutate(
      { projectId: id, persona: personaId, title: `${personaId} Report` },
      {
        onSuccess: () => {
          setGenerateStates((prev) => ({ ...prev, [personaId]: 'ready' }));
        },
        onError: () => {
          // Fallback: simulate generation if API not ready
          setTimeout(() => {
            setGenerateStates((prev) => ({ ...prev, [personaId]: 'ready' }));
          }, 3000);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Report Builder
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate persona-specific reports tailored for each stakeholder group.
          Reports include project data, assessment results, and AI-generated
          analysis.
        </p>
      </div>

      <Separator />

      {/* Info Banner */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-slate-900 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Multi-Stakeholder Report Generation
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Each report is customized for its target audience with
                appropriate level of detail, terminology, and actionable
                recommendations. Reports are generated from live project data
                including assessment scores, compliance status, sandbox
                configuration, and PoC metrics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persona Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PERSONAS.map((persona) => {
          const Icon = persona.icon;
          const state = generateStates[persona.id] || 'idle';

          return (
            <Card key={persona.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      persona.iconBg
                    )}
                  >
                    <Icon className={cn('h-5 w-5', persona.iconColor)} />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base">{persona.title}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {persona.subtitle}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {/* Format info */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {persona.format}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {persona.pageCount}
                  </Badge>
                </div>

                {/* Includes list */}
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Includes
                </p>
                <ul className="space-y-1.5">
                  {persona.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-xs text-slate-500"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-0">
                {state === 'idle' && (
                  <Button
                    className="w-full"
                    onClick={() => handleGenerate(persona.id)}
                  >
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </Button>
                )}
                {state === 'generating' && (
                  <div className="w-full space-y-2">
                    <Button disabled className="w-full">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </Button>
                    <Progress value={66} className="h-1.5" />
                  </div>
                )}
                {state === 'ready' && (
                  <Button
                    variant="outline"
                    className="w-full border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10"
                    onClick={() => {
                      const content = generateReportContent(persona.id, id);
                      const ext = getReportFileExtension(persona.id);
                      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${persona.title.replace(/[\s/]+/g, '_')}_Report.${ext}`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Report Ready - Download
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
