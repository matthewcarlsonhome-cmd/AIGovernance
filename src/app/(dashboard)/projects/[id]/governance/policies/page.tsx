"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  Info,
  Plus,
  Eye,
  Pencil,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  User,
  X,
  ShieldCheck,
  Mail,
  BookOpen,
  Layers,
  ArrowRight,
} from "lucide-react";
import { usePolicies } from "@/hooks/use-governance";

interface PolicyVersion {
  version: string;
  date: string;
  author: string;
  summary: string;
}

interface Approver {
  name: string;
  role: string;
  status: "approved" | "pending" | "rejected";
  date?: string;
  reason?: string;
}

interface Policy {
  id: string;
  title: string;
  type: string;
  status: "approved" | "in_review" | "draft";
  version: string;
  lastUpdated: string;
  description: string;
  content: string;
  versions: PolicyVersion[];
  approvers: Approver[];
}

const DEMO_POLICIES: Policy[] = [
  {
    id: "pol-001",
    title: "AI Acceptable Use Policy (AUP)",
    type: "Acceptable Use",
    status: "approved",
    version: "2.1",
    lastUpdated: "Jan 15, 2026",
    description:
      "Defines acceptable and prohibited uses of AI coding assistants within the organization, including data handling requirements and authorized activities.",
    content: `AI ACCEPTABLE USE POLICY (AUP)
Version 2.1 | Effective Date: January 15, 2026
Classification: Internal - All Employees

1. PURPOSE AND SCOPE
This policy establishes guidelines for the use of AI-powered coding assistants (including Claude Code, OpenAI Codex, and similar tools) within [Organization Name]. It applies to all employees, contractors, and third-party personnel.

2. AUTHORIZED ACTIVITIES
- Code generation and completion for approved project repositories
- Code review assistance and refactoring suggestions
- Documentation and unit test generation
- Debugging assistance for non-sensitive application code
All authorized activities must occur within the managed sandbox environment.

3. PROHIBITED ACTIVITIES
- Inputting classified, PII, or PHI data into AI tools
- Disabling managed settings, DLP rules, or egress filtering controls
- Using personal AI accounts for organizational work
- Generating security-critical code without mandatory human review

4. DATA HANDLING REQUIREMENTS
All AI interactions are subject to audit logging. AI-generated code must undergo standard code review processes. No proprietary algorithms or trade secrets shall be provided as context.

5. COMPLIANCE AND ENFORCEMENT
Violations may result in access revocation, disciplinary action, or legal referral. Annual recertification is required.`,
    versions: [
      { version: "2.1", date: "Jan 15, 2026", author: "Sarah Chen", summary: "Updated data handling requirements for new DLP integration" },
      { version: "2.0", date: "Dec 1, 2025", author: "Sarah Chen", summary: "Major revision: added prohibited activities, compliance enforcement" },
      { version: "1.0", date: "Aug 1, 2025", author: "James Rodriguez", summary: "Initial policy creation" },
    ],
    approvers: [
      { name: "Maria Lopez", role: "CISO", status: "approved", date: "Jan 14, 2026" },
      { name: "David Kim", role: "CTO", status: "approved", date: "Jan 13, 2026" },
      { name: "Rachel Foster", role: "Legal Counsel", status: "approved", date: "Jan 12, 2026" },
    ],
  },
  {
    id: "pol-002",
    title: "Incident Response Plan Addendum",
    type: "Incident Response",
    status: "in_review",
    version: "1.0",
    lastUpdated: "Feb 1, 2026",
    description:
      "Addendum to the existing IRP covering AI-specific security incidents including model misuse, data leakage through AI tools, and unauthorized AI access scenarios.",
    content: `INCIDENT RESPONSE PLAN - AI ADDENDUM
Version 1.0 (DRAFT) | Proposed Effective Date: February 15, 2026
Classification: Internal - Security Team

1. OVERVIEW
This addendum extends the existing Incident Response Plan (IRP) to address security incidents related to AI coding assistant usage.

2. AI-SPECIFIC INCIDENT CATEGORIES
- Category A: Data Leakage via AI Tool (Severity: Critical)
- Category B: Unauthorized AI Access (Severity: High)
- Category C: AI-Generated Vulnerability (Severity: High)
- Category D: Policy Violation (Severity: Medium)

3. RESPONSE PROCEDURES
[Response procedures and escalation paths to be finalized during review...]`,
    versions: [
      { version: "1.0", date: "Feb 1, 2026", author: "Michael Torres", summary: "Initial draft for review" },
    ],
    approvers: [
      { name: "Maria Lopez", role: "CISO", status: "pending" },
      { name: "Michael Torres", role: "Security Lead", status: "approved", date: "Feb 1, 2026" },
      { name: "Rachel Foster", role: "Legal Counsel", status: "pending" },
    ],
  },
  {
    id: "pol-003",
    title: "Data Classification Framework",
    type: "Data Classification",
    status: "draft",
    version: "0.3",
    lastUpdated: "Feb 5, 2026",
    description:
      "Framework for classifying data types and sensitivity levels in the context of AI tool usage, defining what data can and cannot be processed by AI assistants.",
    content: `DATA CLASSIFICATION FRAMEWORK FOR AI TOOL USAGE
Version 0.3 (DRAFT) | Working Document
Classification: Internal - Governance Team

1. PURPOSE
Establishes data classification tiers for determining what information may be processed by AI coding assistants.

2. CLASSIFICATION TIERS
- TIER 1 (PUBLIC): Permitted without restrictions. Examples: open-source code, public docs.
- TIER 2 (INTERNAL): Permitted within managed sandbox. Examples: internal tools, non-sensitive code.
- TIER 3 (CONFIDENTIAL): Permitted with enhanced DLP and audit logging. Examples: proprietary algorithms.
- TIER 4 (RESTRICTED): PROHIBITED for AI processing. Examples: PII, PHI, financial records, secrets.

3. CLASSIFICATION PROCEDURES
[Classification workflow and decision tree under development...]`,
    versions: [
      { version: "0.3", date: "Feb 5, 2026", author: "Anna Wright", summary: "Added Tier 3 and Tier 4 definitions" },
      { version: "0.2", date: "Jan 28, 2026", author: "Anna Wright", summary: "Expanded tier descriptions with examples" },
      { version: "0.1", date: "Jan 20, 2026", author: "Anna Wright", summary: "Initial framework outline" },
    ],
    approvers: [
      { name: "Maria Lopez", role: "CISO", status: "pending" },
      { name: "David Kim", role: "CTO", status: "pending" },
    ],
  },
  {
    id: "pol-004",
    title: "AI Risk Management Framework",
    type: "Risk Management",
    status: "draft",
    version: "0.1",
    lastUpdated: "Feb 8, 2026",
    description:
      "Comprehensive risk management framework for identifying, assessing, and mitigating risks associated with AI coding tool adoption across the enterprise.",
    content: `AI RISK MANAGEMENT FRAMEWORK
Version 0.1 (DRAFT) | Working Document
Classification: Internal - Governance Team

1. INTRODUCTION
Structured approach to managing risks from AI coding assistant adoption, aligned with existing Enterprise Risk Management (ERM) program.

2. RISK CATEGORIES
- Technical: Model reliability, code quality, integration failures
- Security: Data leakage, unauthorized access, vulnerability injection
- Compliance: Regulatory violations, audit failures, contractual breaches
- Operational: Vendor dependency, service disruptions, skill degradation
- Financial: Cost overruns, licensing disputes, ROI shortfalls
- Reputational: Public incidents, customer concerns, media exposure

3. ASSESSMENT METHODOLOGY
[Risk scoring matrix and assessment procedures under development...]`,
    versions: [
      { version: "0.1", date: "Feb 8, 2026", author: "Sarah Chen", summary: "Initial framework outline with risk categories" },
    ],
    approvers: [
      { name: "Maria Lopez", role: "CISO", status: "pending" },
      { name: "David Kim", role: "CTO", status: "pending" },
      { name: "Rachel Foster", role: "Legal Counsel", status: "pending" },
      { name: "Patricia Nguyen", role: "Executive Sponsor", status: "pending" },
    ],
  },
  {
    id: "pol-005",
    title: "AI Ethics Policy",
    type: "Acceptable Use",
    status: "draft",
    version: "0.1",
    lastUpdated: "Feb 10, 2026",
    description:
      "Establishes ethical principles and guardrails for the responsible development and deployment of AI systems across the organization.",
    content: `AI ETHICS POLICY
Version 0.1 (DRAFT) | Working Document
Classification: Internal - All Employees

1. PURPOSE
Establishes the ethical principles and behavioral standards governing the development, deployment, and use of AI technologies within [Organization Name].

2. ETHICAL PRINCIPLES
- Fairness and Non-Discrimination: AI systems must not produce biased or discriminatory outcomes.
- Transparency and Explainability: AI decisions must be understandable and auditable.
- Privacy and Data Protection: Personal data used by AI must be handled per applicable regulations.
- Accountability and Human Oversight: Humans remain accountable for AI-assisted decisions.
- Safety and Reliability: AI systems must be tested and monitored for safe operation.

3. REQUIREMENTS
[Detailed ethical requirements, review processes, and escalation procedures to be defined...]`,
    versions: [
      { version: "0.1", date: "Feb 10, 2026", author: "Sarah Chen", summary: "Initial ethics policy outline" },
    ],
    approvers: [
      { name: "Maria Lopez", role: "CISO", status: "pending" },
      { name: "Patricia Nguyen", role: "Executive Sponsor", status: "pending" },
    ],
  },
  {
    id: "pol-006",
    title: "Third-Party AI Vendor Policy",
    type: "Risk Management",
    status: "draft",
    version: "0.1",
    lastUpdated: "Feb 10, 2026",
    description:
      "Defines requirements for evaluating, selecting, onboarding, and managing third-party AI vendors and their services to ensure compliance and security standards.",
    content: `THIRD-PARTY AI VENDOR POLICY
Version 0.1 (DRAFT) | Working Document
Classification: Internal - Procurement & IT

1. PURPOSE
Establishes requirements for the evaluation, selection, onboarding, and ongoing management of third-party AI vendors and services used by [Organization Name].

2. VENDOR EVALUATION CRITERIA
- Technical Capabilities and Reliability
- Security and Privacy Posture (SOC 2, ISO 27001, penetration testing)
- Regulatory Compliance (GDPR, HIPAA, EU AI Act alignment)
- Financial Viability and Business Continuity
- Data Handling, Retention, and Deletion Practices
- Training Data Opt-out and Intellectual Property Protections

3. CONTRACTUAL REQUIREMENTS
[Standard contractual terms, DPA requirements, SLA expectations, and audit rights to be defined...]`,
    versions: [
      { version: "0.1", date: "Feb 10, 2026", author: "James Rodriguez", summary: "Initial vendor policy outline" },
    ],
    approvers: [
      { name: "David Kim", role: "CTO", status: "pending" },
      { name: "Rachel Foster", role: "Legal Counsel", status: "pending" },
      { name: "Maria Lopez", role: "CISO", status: "pending" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Policy Starter Templates
// ---------------------------------------------------------------------------

interface PolicyStarterTemplate {
  id: string;
  title: string;
  type: string;
  description: string;
  icon: "aup" | "irp" | "data";
  content: string;
}

const POLICY_STARTER_TEMPLATES: PolicyStarterTemplate[] = [
  {
    id: "tpl-aup",
    title: "Acceptable Use Policy (AUP)",
    type: "Acceptable Use",
    description:
      "Comprehensive policy defining permitted and prohibited uses of AI coding assistants, data handling obligations, and enforcement procedures.",
    icon: "aup",
    content: `AI ACCEPTABLE USE POLICY (AUP)
Version 0.1 (DRAFT) | Effective Date: [DATE]
Classification: Internal — All Employees
Owner: [POLICY OWNER / TITLE]

1. PURPOSE AND SCOPE
This policy establishes the acceptable use requirements for AI-powered coding assistants deployed within [Organization Name]. It applies to all employees, contractors, interns, and third-party personnel who access or interact with AI coding tools in the course of their work. The policy covers all environments — development, staging, and production — across every business unit and subsidiary.

2. APPROVED AI TOOLS
The following AI coding assistants are authorized for use within the managed sandbox environment. No other AI tools may be used for organizational work without prior written approval from the IT / Security Lead.
  - Claude Code (Anthropic) — approved for code generation, review, and documentation
  - GitHub Copilot (Microsoft / OpenAI) — approved for code completion and suggestion
  - Amazon CodeWhisperer — approved for code generation within AWS environments
  - [Add or remove tools as appropriate for your organization]

3. PERMITTED USE CASES
Authorized personnel may use approved AI tools for the following activities, provided all other sections of this policy are observed:
  - Code generation and completion for approved project repositories
  - Automated and assisted code review, including refactoring suggestions
  - Generation of documentation, inline comments, and technical specifications
  - Test generation, including unit tests, integration tests, and test data scaffolding
  - Debugging assistance and root-cause analysis for non-sensitive application code
  - Translation of code between approved programming languages

4. PROHIBITED ACTIVITIES
The following activities are strictly prohibited when using AI coding tools:
  - Entering production data, customer data, or any data classified as Confidential or Restricted into AI prompts or context windows
  - Submitting personally identifiable information (PII), protected health information (PHI), payment card data, or credentials into any AI tool
  - Bypassing or circumventing code review processes for AI-generated code
  - Disabling, modifying, or circumventing managed settings, DLP rules, or network egress controls
  - Using personal AI accounts or unapproved AI services for organizational work
  - Generating security-critical code (authentication, encryption, access control) without mandatory human review and sign-off

5. DATA HANDLING REQUIREMENTS
  - No PII, PHI, financial records, API keys, secrets, or credentials shall be included in AI prompts
  - Proprietary algorithms, trade secrets, and patent-pending code must not be provided as context
  - All AI interaction logs are retained for a minimum of [90 / 180 / 365] days for audit purposes
  - Data Loss Prevention (DLP) tools must remain active and unmodified during all AI sessions
  - Teams must redact or anonymize sensitive data before including it in AI-assisted workflows

6. MONITORING AND ENFORCEMENT
  - All AI tool usage is subject to automated logging, including prompts, completions, and session metadata
  - Periodic audits of AI usage logs will be conducted by the IT / Security Lead on a [monthly / quarterly] basis
  - Violations of this policy may result in immediate revocation of AI tool access, disciplinary action up to and including termination, and legal referral where applicable
  - Suspected incidents must be reported through the standard incident response process within [24] hours

7. ACKNOWLEDGMENT
All personnel granted access to AI coding tools must sign this policy acknowledgment prior to receiving access credentials. Re-certification is required annually or upon any material policy revision.

Signature: _________________________  Date: _______________
Printed Name: ______________________  Title: _______________`,
  },
  {
    id: "tpl-irp",
    title: "Incident Response Plan — AI Addendum",
    type: "Incident Response",
    description:
      "Extends your existing IRP to cover AI-specific incidents including data leakage, prompt injection, model hallucination, and unauthorized tool usage.",
    icon: "irp",
    content: `INCIDENT RESPONSE PLAN — AI ADDENDUM
Version 0.1 (DRAFT) | Proposed Effective Date: [DATE]
Classification: Internal — Security Team, IT Operations
Owner: [INCIDENT RESPONSE TEAM LEAD]

1. PURPOSE
This addendum extends the existing Incident Response Plan (IRP) to address security incidents that arise specifically from the use of AI coding assistants. It defines AI-specific incident categories, severity classifications, response procedures, and escalation paths. This addendum should be read in conjunction with the master IRP document and does not replace any existing procedures.

2. AI-SPECIFIC INCIDENT CATEGORIES
The following incident categories are unique to or materially affected by AI coding tool usage:
  - Data Leakage via AI: Sensitive, confidential, or restricted data is transmitted to an AI service through prompts, context windows, or file uploads — whether intentional or accidental.
  - Model Hallucination in Production: AI-generated code that contains fabricated API calls, non-existent library references, or logically incorrect implementations is deployed to a production environment without adequate human review.
  - Prompt Injection: A malicious actor crafts input that manipulates AI tool behavior, causing it to bypass safety controls, exfiltrate data, or produce harmful output.
  - Unauthorized AI Tool Usage: Personnel use unapproved AI tools (shadow AI) for organizational work, creating unmonitored data flows and compliance gaps.

3. SEVERITY CLASSIFICATION
  - Critical (P1): PII, PHI, or credentials confirmed exposed through an AI tool; requires immediate containment. Response SLA: 1 hour.
  - High (P2): Proprietary source code or trade secrets submitted to an AI training pipeline; hallucinated code deployed to production causing service impact. Response SLA: 4 hours.
  - Medium (P3): Policy violation detected (e.g., unauthorized use of a personal AI account for work); no confirmed data exposure. Response SLA: 24 hours.
  - Low (P4): Shadow AI usage detected with no sensitive data involvement; minor policy deviations. Response SLA: 72 hours.

4. RESPONSE PROCEDURES
All AI-related incidents follow the standard five-phase response model:
  a) Detection — Automated DLP alerts, usage log anomalies, peer reports, or audit findings trigger incident identification. AI-specific monitoring dashboards should be reviewed daily by the on-call security analyst.
  b) Containment — Immediately revoke the affected user's AI tool access. If data leakage is suspected, engage the AI vendor's data deletion process. Isolate any AI-generated code that may be compromised.
  c) Eradication — Remove or quarantine AI-generated artifacts that are affected. Rotate any credentials or secrets that may have been exposed. Patch prompt injection vectors if applicable.
  d) Recovery — Restore clean code from version control. Re-enable AI tool access only after root cause is confirmed and remediation is verified. Conduct a targeted code review of recent AI-assisted commits.
  e) Lessons Learned — Document the incident timeline, root cause, and remediation steps within [5] business days. Update this addendum and related policies as needed. Share anonymized findings with the broader team.

5. ROLES AND RESPONSIBILITIES
  - Incident Commander: Coordinates the response, makes containment decisions, and owns the post-incident report.
  - IT / Security Lead: Executes technical containment, log analysis, and evidence preservation.
  - Legal Counsel: Assesses regulatory notification obligations (GDPR, HIPAA, state breach laws) and advises on disclosure.
  - Communications Lead: Manages internal and external communications if the incident requires stakeholder notification.
  - Engineering Lead: Reviews AI-generated code, identifies blast radius, and leads remediation.

6. ESCALATION MATRIX
  | Severity | Response Time | Notification Chain                                |
  |----------|---------------|---------------------------------------------------|
  | Critical | 1 hour        | CISO, General Counsel, CEO, Board (if breach)     |
  | High     | 4 hours       | CISO, CTO, Legal Counsel                          |
  | Medium   | 24 hours      | Security Lead, IT Manager, Compliance Officer      |
  | Low      | 72 hours      | Security Analyst, Team Lead                        |`,
  },
  {
    id: "tpl-data",
    title: "Data Classification Policy",
    type: "Data Classification",
    description:
      "Defines classification levels and rules governing which data may be used with AI tools, including retention, redaction, and cross-border requirements.",
    icon: "data",
    content: `DATA CLASSIFICATION POLICY — AI TOOL USAGE
Version 0.1 (DRAFT) | Working Document
Classification: Internal — Governance Team, IT, Legal
Owner: [DATA GOVERNANCE OFFICER / TITLE]

1. CLASSIFICATION LEVELS
All organizational data shall be assigned one of the following classification levels. Classification is the responsibility of the data owner and must be reviewed annually or upon any material change in data usage.
  - Public: Information approved for unrestricted external distribution. Examples: published marketing materials, open-source code, public documentation, press releases.
  - Internal: Information intended for general internal use that would not cause material harm if disclosed. Examples: internal tools, non-sensitive application code, team process documents, meeting notes without sensitive content.
  - Confidential: Information whose unauthorized disclosure could cause significant harm to the organization. Examples: proprietary algorithms, pre-release product designs, financial forecasts, strategic plans, vendor contracts, internal audit reports.
  - Restricted: The most sensitive category. Unauthorized disclosure could cause severe regulatory, financial, or reputational damage. Examples: PII, PHI, payment card data, credentials and secrets, encryption keys, legal hold materials, board communications.

2. AI-SPECIFIC DATA RULES
The following rules govern which classification levels may interact with AI coding tools:
  - Public data: May be used freely with any approved AI tool without additional controls.
  - Internal data: May be used within the managed sandbox environment with standard DLP and audit logging active. No additional approval required.
  - Confidential data: Must NOT be entered into AI prompts, context windows, or file uploads unless an explicit exception has been granted by the Data Governance Officer and the CISO. If an exception is granted, enhanced logging and real-time monitoring must be enabled for the duration of the session.
  - Restricted data: Is STRICTLY PROHIBITED from any interaction with AI tools, with no exceptions. Any accidental exposure of Restricted data to an AI tool constitutes a security incident and must be reported immediately per the Incident Response Plan.

3. DATA FLOW REQUIREMENTS
  - All data entering AI tool prompts must be reviewed against its classification level prior to submission.
  - Automated pre-submission scanning should be enabled where technically feasible to detect and block Confidential or Restricted data.
  - Redaction procedures: Before including any dataset in an AI workflow, teams must remove or replace all PII fields, credentials, internal hostnames, and proprietary identifiers with synthetic or anonymized equivalents.
  - AI-generated output must inherit the classification of the highest-classified input used in its generation. For example, if Internal data is used as context, the output is classified as Internal at minimum.

4. RETENTION AND DELETION
  - AI interaction logs (prompts, completions, session metadata) shall be retained for [90 / 180 / 365] days, aligned with the organization's general data retention schedule.
  - Upon termination of an AI vendor relationship, the organization shall exercise contractual data deletion rights and obtain written confirmation that all organizational data — including cached prompts and fine-tuning data — has been permanently removed.
  - Right to deletion: Individuals may request deletion of their personal data from AI interaction logs in accordance with applicable privacy regulations (GDPR Article 17, CCPA, etc.).

5. CROSS-BORDER CONSIDERATIONS
  - AI API calls that transmit organizational data must comply with applicable data residency requirements. Teams must verify the geographic location of AI vendor processing infrastructure before onboarding.
  - For data subject to GDPR, ensure that appropriate transfer mechanisms (Standard Contractual Clauses, adequacy decisions, or Binding Corporate Rules) are in place before data is processed by an AI vendor outside the EEA.
  - For data subject to sector-specific regulations (HIPAA, ITAR, CMMC), confirm that the AI vendor's processing environment meets the relevant compliance certifications and that a Business Associate Agreement or equivalent is executed where required.
  - Maintain a register of all AI tools and the jurisdictions in which they process data, updated quarterly by the IT / Security Lead.`,
  },
];

function getStatusBadgeClasses(status: Policy["status"]): string {
  switch (status) {
    case "approved":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/25";
    case "in_review":
      return "bg-amber-500/15 text-amber-700 border-amber-500/25";
    case "draft":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

function getStatusLabel(status: Policy["status"]): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "in_review":
      return "In Review";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

function getStatusIcon(status: Policy["status"]): React.ReactNode {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "in_review":
      return <Clock className="h-3.5 w-3.5" />;
    case "draft":
      return <AlertCircle className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

function getApproverStatusClasses(status: Approver["status"]): string {
  switch (status) {
    case "approved":
      return "text-emerald-700";
    case "pending":
      return "text-amber-700";
    case "rejected":
      return "text-red-700";
    default:
      return "text-slate-500";
  }
}

export default function PoliciesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const { isLoading, error } = usePolicies(id);

  // --- All hooks must be called before any early return ---

  // Core policies state (initialized from defaults, then from localStorage)
  const [policies, setPolicies] = React.useState<Policy[]>(DEMO_POLICIES);

  // Expand / edit state
  const [expandedPolicy, setExpandedPolicy] = React.useState<string | null>(null);
  const [editingPolicy, setEditingPolicy] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState<string>("");

  // New policy dialog state
  const [showNewPolicyDialog, setShowNewPolicyDialog] = React.useState(false);
  const [newPolicyTitle, setNewPolicyTitle] = React.useState("");
  const [newPolicyType, setNewPolicyType] = React.useState("Acceptable Use");
  const [newPolicyDescription, setNewPolicyDescription] = React.useState("");

  // Sign-off dialog state
  const [signOffDialogOpen, setSignOffDialogOpen] = React.useState(false);
  const [signOffPolicyId, setSignOffPolicyId] = React.useState<string>("");
  const [signerName, setSignerName] = React.useState("");
  const [signerRole, setSignerRole] = React.useState("");
  const [signOffDecision, setSignOffDecision] = React.useState<"approved" | "rejected">("approved");
  const [rejectionReason, setRejectionReason] = React.useState("");

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`govai_policies_${id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Policy[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPolicies(parsed);
        }
      }
    } catch {
      // Ignore parse errors; use defaults
    }
  }, [id]);

  // --- Early returns AFTER all hooks ---

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  // --- Handlers ---

  const handleToggleExpand = (policyId: string): void => {
    if (expandedPolicy === policyId) {
      setExpandedPolicy(null);
      setEditingPolicy(null);
    } else {
      setExpandedPolicy(policyId);
      setEditingPolicy(null);
    }
  };

  const handleEdit = (policy: Policy): void => {
    setExpandedPolicy(policy.id);
    setEditingPolicy(policy.id);
    setEditContent(policy.content);
  };

  const handleCancelEdit = (): void => {
    setEditingPolicy(null);
    setEditContent("");
  };

  const handleSaveEdit = (): void => {
    if (!editingPolicy) return;
    setPolicies((prev) => {
      const next = prev.map((p) =>
        p.id === editingPolicy
          ? {
              ...p,
              content: editContent,
              lastUpdated: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : p
      );
      localStorage.setItem(`govai_policies_${id}`, JSON.stringify(next));
      return next;
    });
    setEditingPolicy(null);
    setEditContent("");
  };

  const handleCreatePolicy = (): void => {
    if (!newPolicyTitle.trim()) return;
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const newPolicy: Policy = {
      id: `pol-new-${Date.now()}`,
      title: newPolicyTitle.trim(),
      type: newPolicyType,
      status: "draft",
      version: "0.1",
      lastUpdated: dateStr,
      description: newPolicyDescription.trim() || "New policy document",
      content: `${newPolicyTitle.trim().toUpperCase()}\nVersion 0.1 (DRAFT) | Working Document\n\n1. PURPOSE\n\n[Enter the purpose of this policy here...]\n\n2. SCOPE\n\n[Define who and what this policy covers...]\n\n3. POLICY STATEMENTS\n\n[Add policy statements here...]\n`,
      versions: [
        { version: "0.1", date: dateStr, author: "Current User", summary: "Initial draft" },
      ],
      approvers: [],
    };
    setPolicies((prev) => {
      const next = [...prev, newPolicy];
      localStorage.setItem(`govai_policies_${id}`, JSON.stringify(next));
      return next;
    });
    setShowNewPolicyDialog(false);
    setNewPolicyTitle("");
    setNewPolicyType("Acceptable Use");
    setNewPolicyDescription("");
    setExpandedPolicy(newPolicy.id);
    setEditingPolicy(newPolicy.id);
    setEditContent(newPolicy.content);
  };

  const openSignOffDialog = (policyId: string): void => {
    setSignOffPolicyId(policyId);
    setSignerName("");
    setSignerRole("");
    setSignOffDecision("approved");
    setRejectionReason("");
    setSignOffDialogOpen(true);
  };

  const handleSignOff = (): void => {
    if (!signerName.trim() || !signerRole.trim()) return;

    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    setPolicies((prev) => {
      const next = prev.map((p) => {
        if (p.id !== signOffPolicyId) return p;

        const newApprover: Approver = {
          name: signerName.trim(),
          role: signerRole.trim(),
          status: signOffDecision,
          date: dateStr,
          reason: signOffDecision === "rejected" ? rejectionReason.trim() : undefined,
        };

        const updatedApprovers = [...p.approvers, newApprover];

        // Determine new policy status
        let newStatus = p.status;
        if (p.status === "draft") {
          newStatus = "in_review";
        }
        // If all approvers have approved, mark the policy as approved
        if (
          updatedApprovers.length > 0 &&
          updatedApprovers.every((a) => a.status === "approved")
        ) {
          newStatus = "approved";
        }

        return {
          ...p,
          approvers: updatedApprovers,
          status: newStatus,
          lastUpdated: dateStr,
        };
      });
      localStorage.setItem(`govai_policies_${id}`, JSON.stringify(next));
      return next;
    });

    setSignOffDialogOpen(false);
  };

  const handleRequestSignOff = (policyTitle: string): void => {
    alert(
      `Sign-off requests for "${policyTitle}" would be sent via email to all pending approvers. This feature requires email integration to be configured in Settings > Integrations.`
    );
  };

  // --- Derived data ---

  const signOffPolicy = policies.find((p) => p.id === signOffPolicyId);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* New Policy Dialog */}
      <Dialog open={showNewPolicyDialog} onOpenChange={setShowNewPolicyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
            <DialogDescription>
              Create a new governance policy document. You can edit the full
              content after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="policy-title">Policy Title</Label>
              <Input
                id="policy-title"
                placeholder="e.g. AI Acceptable Use Policy"
                value={newPolicyTitle}
                onChange={(e) => setNewPolicyTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-type">Policy Type</Label>
              <select
                id="policy-type"
                value={newPolicyType}
                onChange={(e) => setNewPolicyType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              >
                <option value="Acceptable Use">Acceptable Use</option>
                <option value="Incident Response">Incident Response</option>
                <option value="Data Classification">Data Classification</option>
                <option value="Risk Management">Risk Management</option>
                <option value="Access Control">Access Control</option>
                <option value="Compliance">Compliance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-description">Description</Label>
              <Textarea
                id="policy-description"
                placeholder="Brief description of the policy's purpose and scope..."
                value={newPolicyDescription}
                onChange={(e) => setNewPolicyDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewPolicyDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePolicy}
              disabled={!newPolicyTitle.trim()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign-Off Dialog */}
      <Dialog open={signOffDialogOpen} onOpenChange={setSignOffDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Off on Policy</DialogTitle>
            <DialogDescription>
              {signOffPolicy
                ? `Review and sign off on "${signOffPolicy.title}" (v${signOffPolicy.version}).`
                : "Provide your sign-off decision for this policy."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {signOffPolicy && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">
                  {signOffPolicy.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Version {signOffPolicy.version} | Last updated{" "}
                  {signOffPolicy.lastUpdated}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="signer-name">Your Name</Label>
              <Input
                id="signer-name"
                placeholder="e.g. Jane Smith"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signer-role">Your Role</Label>
              <Input
                id="signer-role"
                placeholder="e.g. VP of Engineering"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signoff-decision">Decision</Label>
              <select
                id="signoff-decision"
                value={signOffDecision}
                onChange={(e) =>
                  setSignOffDecision(
                    e.target.value as "approved" | "rejected"
                  )
                }
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              >
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {signOffDecision === "rejected" && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Reason for Rejection</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please explain the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSignOffDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignOff}
              disabled={
                !signerName.trim() ||
                !signerRole.trim() ||
                (signOffDecision === "rejected" && !rejectionReason.trim())
              }
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <ShieldCheck className="h-4 w-4" />
              Submit Sign-Off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Your Policy Library
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Draft, version, and approve your AI governance policies. Each document is a building block.
          </p>
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-normal mt-2">Owned by: Governance Consultant, Legal Lead</Badge>
        </div>
        <Button
          onClick={() => setShowNewPolicyDialog(true)}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New Policy
        </Button>
      </div>

      {/* What You'll Need */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-amber-900 mb-2">What You&apos;ll Need</h2>
            <ul className="space-y-1.5 text-sm text-amber-800 list-disc list-inside">
              <li>Existing acceptable use policies for reference or adaptation</li>
              <li>Incident response plan (IRP) to create an AI-specific addendum</li>
              <li>Data classification standards from your security team</li>
              <li>Legal team review schedule and approval workflow</li>
              <li>Compliance framework requirements (SOC2, HIPAA, NIST, GDPR)</li>
            </ul>
            <p className="mt-3 text-xs text-amber-700">
              Each policy includes a starter template. Customize to match your organization&apos;s requirements.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Policy Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <FileText className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {policies.length}
                </p>
                <p className="text-xs text-slate-500">Total Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {policies.filter((p) => p.status === "approved").length}
                </p>
                <p className="text-xs text-slate-500">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {policies.filter((p) => p.status === "in_review").length}
                </p>
                <p className="text-xs text-slate-500">In Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <AlertCircle className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {policies.filter((p) => p.status === "draft").length}
                </p>
                <p className="text-xs text-slate-500">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy List */}
      <div className="flex flex-col gap-4">
        {policies.map((policy) => {
          const isExpanded = expandedPolicy === policy.id;
          const isEditing = editingPolicy === policy.id;

          return (
            <Card key={policy.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className="text-xs font-medium"
                      >
                        {policy.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium flex items-center gap-1",
                          getStatusBadgeClasses(policy.status)
                        )}
                      >
                        {getStatusIcon(policy.status)}
                        {getStatusLabel(policy.status)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                    <CardDescription className="mt-1.5">
                      {policy.description}
                    </CardDescription>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <History className="h-3 w-3" />
                        Version {policy.version}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {policy.lastUpdated}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleExpand(policy.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isExpanded ? "Close" : "View"}
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(policy)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSignOffDialog(policy.id)}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Sign Off
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob(
                          [
                            `${policy.title}\nStatus: ${policy.status}\nVersion: ${policy.version}\nLast Updated: ${policy.lastUpdated}\n\n${policy.content}`,
                          ],
                          { type: "text/plain" }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${policy.title.replace(/\s+/g, "_")}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Expanded Detail View */}
              {isExpanded && (
                <>
                  <Separator />
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      {/* Main Content Area */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Policy Document
                          </h3>
                          {isEditing && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3.5 w-3.5" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                              >
                                Save Changes
                              </Button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[500px] font-mono text-sm leading-relaxed"
                          />
                        ) : (
                          <div className="rounded-lg border border-slate-200 bg-slate-100/30 p-6">
                            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-900">
                              {policy.content}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Sidebar */}
                      <div className="flex flex-col gap-6">
                        {/* Approval Status */}
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 mb-3">
                            Approval Status
                          </h3>
                          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                            {policy.approvers.length === 0 && (
                              <p className="text-sm text-slate-500">
                                No approvers assigned yet.
                              </p>
                            )}
                            {policy.approvers.map((approver, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                                    <User className="h-3.5 w-3.5 text-slate-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">
                                      {approver.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {approver.role}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={cn(
                                      "text-xs font-medium capitalize",
                                      getApproverStatusClasses(approver.status)
                                    )}
                                  >
                                    {approver.status}
                                  </p>
                                  {approver.date && (
                                    <p className="text-xs text-slate-500">
                                      {approver.date}
                                    </p>
                                  )}
                                  {approver.status === "rejected" &&
                                    approver.reason && (
                                      <p className="text-xs text-red-600 mt-0.5 max-w-[140px] truncate">
                                        {approver.reason}
                                      </p>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => openSignOffDialog(policy.id)}
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Sign Off
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() =>
                                handleRequestSignOff(policy.title)
                              }
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Request Sign-Off
                            </Button>
                          </div>
                        </div>

                        {/* Version History */}
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 mb-3">
                            Version History
                          </h3>
                          <div className="rounded-lg border border-slate-200 p-4">
                            <div className="space-y-4">
                              {policy.versions.map((ver, idx) => (
                                <div key={idx} className="relative">
                                  {idx < policy.versions.length - 1 && (
                                    <div className="absolute left-[9px] top-5 h-full w-px bg-slate-200" />
                                  )}
                                  <div className="flex gap-3">
                                    <div className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
                                      <div
                                        className={cn(
                                          "h-2 w-2 rounded-full",
                                          idx === 0
                                            ? "bg-slate-900"
                                            : "bg-slate-300"
                                        )}
                                      />
                                    </div>
                                    <div className="pb-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-900">
                                          v{ver.version}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          {ver.date}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {ver.author}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {ver.summary}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Next Step */}
      <Card className="bg-blue-50 border-blue-200 mt-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">Next Step</p>
              <p className="text-sm text-blue-700">After policies are drafted and signed off, map controls to compliance frameworks.</p>
            </div>
            <a href={`/projects/${id}/governance/compliance`}>
              <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                Compliance Mapping <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
