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
            Governance Policies
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage AI governance policy documents, track versions, and route
            approvals.
          </p>
        </div>
        <Button
          onClick={() => setShowNewPolicyDialog(true)}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New Policy
        </Button>
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
    </div>
  );
}
