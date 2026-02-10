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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  ShieldCheck,
  Rocket,
  Building2,
  CheckCircle2,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  AlertTriangle,
  ArrowRight,
  Send,
} from "lucide-react";
import { useGateReviews } from '@/hooks/use-governance';

type GateStatus = "approved" | "in_review" | "locked";
type CheckItemStatus = "checked" | "unchecked";
type ApproverStatus = "approved" | "pending";

interface CheckItem {
  label: string;
  status: CheckItemStatus;
}

interface GateApprover {
  name: string;
  role: string;
  status: ApproverStatus;
  date?: string;
}

interface Gate {
  id: string;
  number: number;
  title: string;
  status: GateStatus;
  type: string;
  description: string;
  criteria: string;
  checklist: CheckItem[];
  approvers: GateApprover[];
  sla?: string;
  submittedDate?: string;
  approvedDate?: string;
  note?: string;
}

const GATES: Gate[] = [
  {
    id: "gate-1",
    number: 1,
    title: "Sandbox Access",
    status: "approved",
    type: "Automated",
    description:
      "Initial gate verifying that all prerequisites for sandbox environment access have been met, including mandatory training and policy acknowledgments.",
    criteria: "Training complete + AUP signed",
    checklist: [
      { label: "Security training module completed", status: "checked" },
      { label: "AUP signed digitally", status: "checked" },
      { label: "NDA on file", status: "checked" },
    ],
    approvers: [
      {
        name: "System",
        role: "Automated Verification",
        status: "approved",
        date: "Jan 20, 2026",
      },
    ],
    approvedDate: "Jan 20, 2026",
  },
  {
    id: "gate-2",
    number: 2,
    title: "Pilot Deployment",
    status: "in_review",
    type: "Manual Approval Required",
    description:
      "Gate requiring manual approval from security and engineering leadership before expanding from sandbox to controlled pilot deployment.",
    criteria: "Infrastructure verified + security controls active",
    checklist: [
      { label: "Managed settings deployed", status: "checked" },
      { label: "CI/CD SAST confirmed", status: "checked" },
      { label: "DLP rules active", status: "unchecked" },
      { label: "Audit logging confirmed", status: "checked" },
      { label: "Penetration test report", status: "unchecked" },
    ],
    approvers: [
      {
        name: "Maria Lopez",
        role: "Security Lead",
        status: "pending",
      },
      {
        name: "David Kim",
        role: "Engineering Lead",
        status: "approved",
        date: "Feb 5, 2026",
      },
    ],
    sla: "3-5 business days",
    submittedDate: "Feb 3, 2026",
  },
  {
    id: "gate-3",
    number: 3,
    title: "Production Path",
    status: "locked",
    type: "Full Review Board",
    description:
      "Final gate requiring full review board approval with comprehensive evidence of successful pilot execution, zero security incidents, and complete compliance documentation.",
    criteria: "Pilot success + full board approval",
    checklist: [
      { label: "Complete pilot evaluation data", status: "unchecked" },
      { label: "Zero security incidents during pilot", status: "unchecked" },
      { label: "Compliance mapping complete", status: "unchecked" },
      { label: "Risk assessment finalized", status: "unchecked" },
      { label: "Production monitoring plan", status: "unchecked" },
      { label: "Cost-benefit analysis", status: "unchecked" },
    ],
    approvers: [
      { name: "Maria Lopez", role: "CISO", status: "pending" },
      { name: "David Kim", role: "CTO", status: "pending" },
      { name: "Rachel Foster", role: "Legal", status: "pending" },
      {
        name: "Patricia Nguyen",
        role: "Executive Sponsor",
        status: "pending",
      },
    ],
    note: "Requires Gate 2 approval first",
  },
];

function getGateStatusColor(status: GateStatus): string {
  switch (status) {
    case "approved":
      return "bg-emerald-500";
    case "in_review":
      return "bg-amber-500";
    case "locked":
      return "bg-slate-400";
    default:
      return "bg-slate-400";
  }
}

function getGateStatusBadgeClasses(status: GateStatus): string {
  switch (status) {
    case "approved":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/25";
    case "in_review":
      return "bg-amber-500/15 text-amber-700 border-amber-500/25";
    case "locked":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

function getGateStatusLabel(status: GateStatus): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "in_review":
      return "In Review";
    case "locked":
      return "Locked";
    default:
      return status;
  }
}

function getGateStatusIcon(status: GateStatus): React.ReactNode {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-4 w-4" />;
    case "in_review":
      return <Clock className="h-4 w-4" />;
    case "locked":
      return <Lock className="h-4 w-4" />;
    default:
      return null;
  }
}

function getGateIcon(number: number): React.ReactNode {
  switch (number) {
    case 1:
      return <ShieldCheck className="h-6 w-6" />;
    case 2:
      return <Rocket className="h-6 w-6" />;
    case 3:
      return <Building2 className="h-6 w-6" />;
    default:
      return null;
  }
}

function getConnectorColor(currentStatus: GateStatus): string {
  switch (currentStatus) {
    case "approved":
      return "bg-emerald-500";
    default:
      return "bg-slate-200";
  }
}

export default function GateReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const { data: fetchedGates, isLoading, error } = useGateReviews(id);

  const [expandedGate, setExpandedGate] = React.useState<string | null>(
    "gate-2"
  );
  const [showEvidenceDialog, setShowEvidenceDialog] = React.useState(false);
  const [evidenceGateId, setEvidenceGateId] = React.useState<string>("");
  const [evidenceText, setEvidenceText] = React.useState("");
  const [submittedEvidence, setSubmittedEvidence] = React.useState<Record<string, string[]>>({});
  const [reminderSent, setReminderSent] = React.useState<Record<string, boolean>>({});

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  // Use fetched gates or fall back to demo data
  const gates: Gate[] = (fetchedGates && fetchedGates.length > 0) ? fetchedGates as unknown as Gate[] : GATES;

  const toggleGate = (gateId: string): void => {
    setExpandedGate(expandedGate === gateId ? null : gateId);
  };

  const totalChecklist = gates.reduce(
    (acc, gate) => acc + gate.checklist.length,
    0
  );
  const checkedItems = gates.reduce(
    (acc, gate) =>
      acc + gate.checklist.filter((item) => item.status === "checked").length,
    0
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Evidence Dialog */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Additional Evidence</DialogTitle>
            <DialogDescription>
              Provide documentation, links, or descriptions of evidence to support this gate review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="evidence-text">Evidence Description</Label>
              <Textarea
                id="evidence-text"
                placeholder="Describe the evidence being submitted (e.g., link to audit report, test results, policy document)..."
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEvidenceDialog(false); setEvidenceText(""); }}>Cancel</Button>
            <Button
              disabled={!evidenceText.trim()}
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => {
                if (!evidenceText.trim()) return;
                setSubmittedEvidence((prev) => ({
                  ...prev,
                  [evidenceGateId]: [...(prev[evidenceGateId] || []), evidenceText.trim()],
                }));
                setShowEvidenceDialog(false);
                setEvidenceText("");
              }}
            >
              Submit Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Three-Gate Review Board
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track progress through the three approval gates required for AI tool
            deployment from sandbox to production.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            Overall Evidence: {checkedItems}/{totalChecklist} items
          </p>
          <p className="text-xs text-slate-500">
            {Math.round((checkedItems / totalChecklist) * 100)}% complete
          </p>
        </div>
      </div>

      <Separator />

      {/* Horizontal Stepper */}
      <div className="flex items-center justify-center gap-0 py-4">
        {gates.map((gate, idx) => (
          <React.Fragment key={gate.id}>
            {/* Gate Step */}
            <button
              type="button"
              onClick={() => toggleGate(gate.id)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all",
                  gate.status === "approved"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : gate.status === "in_review"
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-slate-400 bg-slate-100 text-slate-500",
                  expandedGate === gate.id && "ring-2 ring-slate-900 ring-offset-2 ring-offset-white"
                )}
              >
                {getGateIcon(gate.number)}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500">
                  GATE {gate.number}
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {gate.title}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-1 text-xs flex items-center gap-1",
                    getGateStatusBadgeClasses(gate.status)
                  )}
                >
                  {getGateStatusIcon(gate.status)}
                  {getGateStatusLabel(gate.status)}
                </Badge>
              </div>
            </button>

            {/* Connector Line */}
            {idx < gates.length - 1 && (
              <div className="flex items-center px-2 -mt-12">
                <div
                  className={cn(
                    "h-1 w-16 rounded-full sm:w-24 md:w-32",
                    getConnectorColor(gate.status)
                  )}
                />
                <ArrowRight
                  className={cn(
                    "h-5 w-5 -ml-1",
                    gate.status === "approved"
                      ? "text-emerald-500"
                      : "text-slate-200"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <Separator />

      {/* Expanded Gate Detail */}
      {gates.map((gate) => {
        if (expandedGate !== gate.id) return null;

        const checkedCount = gate.checklist.filter(
          (item) => item.status === "checked"
        ).length;
        const totalCount = gate.checklist.length;
        const progressPercent = Math.round((checkedCount / totalCount) * 100);

        return (
          <Card key={gate.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium flex items-center gap-1",
                        getGateStatusBadgeClasses(gate.status)
                      )}
                    >
                      {getGateStatusIcon(gate.status)}
                      {getGateStatusLabel(gate.status)}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium">
                      {gate.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    Gate {gate.number}: {gate.title}
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    {gate.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpandedGate(null)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Evidence Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Evidence Checklist
                    </h3>
                    <span className="text-xs text-slate-500">
                      {checkedCount}/{totalCount} completed ({progressPercent}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        progressPercent === 100
                          ? "bg-emerald-500"
                          : progressPercent > 0
                          ? "bg-amber-500"
                          : "bg-slate-100-foreground/20"
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    {gate.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3",
                          item.status === "checked"
                            ? "border-emerald-500/25 bg-emerald-500/5"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                            item.status === "checked"
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-400 bg-white"
                          )}
                        >
                          {item.status === "checked" && (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-sm",
                            item.status === "checked"
                              ? "text-slate-900"
                              : "text-slate-500"
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approvers & Details */}
                <div className="flex flex-col gap-6">
                  {/* Approvers */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">
                      {gate.type === "Automated"
                        ? "Verification"
                        : "Required Approvers"}
                    </h3>
                    <div className="space-y-3">
                      {gate.approvers.map((approver, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between rounded-lg border p-3",
                            approver.status === "approved"
                              ? "border-emerald-500/25 bg-emerald-500/5"
                              : "border-slate-200 bg-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full",
                                approver.name === "System"
                                  ? "bg-slate-100"
                                  : "bg-slate-100"
                              )}
                            >
                              {approver.name === "System" ? (
                                <Bot className="h-4 w-4 text-slate-900" />
                              ) : (
                                <User className="h-4 w-4 text-slate-500" />
                              )}
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
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                approver.status === "approved"
                                  ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
                                  : "bg-amber-500/15 text-amber-700 border-amber-500/25"
                              )}
                            >
                              {approver.status === "approved"
                                ? "Approved"
                                : "Pending"}
                            </Badge>
                            {approver.date && (
                              <p className="text-xs text-slate-500 mt-1">
                                {approver.date}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gate Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">
                      Gate Details
                    </h3>
                    <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Gate Criteria
                        </span>
                        <span className="text-slate-900 font-medium">
                          {gate.criteria}
                        </span>
                      </div>
                      {gate.sla && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Review SLA
                          </span>
                          <span className="text-slate-900 font-medium">
                            {gate.sla}
                          </span>
                        </div>
                      )}
                      {gate.submittedDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Submitted
                          </span>
                          <span className="text-slate-900 font-medium">
                            {gate.submittedDate}
                          </span>
                        </div>
                      )}
                      {gate.approvedDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Approved
                          </span>
                          <span className="text-slate-900 font-medium">
                            {gate.approvedDate}
                          </span>
                        </div>
                      )}
                      {gate.note && (
                        <div className="mt-2 flex items-center gap-2 rounded-md bg-amber-500/10 p-2.5 text-xs text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          {gate.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {gate.status === "in_review" && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
                          onClick={() => {
                            setEvidenceGateId(gate.id);
                            setShowEvidenceDialog(true);
                          }}
                        >
                          Submit Additional Evidence
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReminderSent((prev) => ({ ...prev, [gate.id]: true }));
                          }}
                          disabled={reminderSent[gate.id]}
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          {reminderSent[gate.id] ? 'Reminder Sent' : 'Send Reminder'}
                        </Button>
                      </div>
                      {/* Show submitted evidence */}
                      {submittedEvidence[gate.id] && submittedEvidence[gate.id].length > 0 && (
                        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3">
                          <p className="text-xs font-medium text-emerald-800 mb-1">Submitted Evidence:</p>
                          <ul className="space-y-1">
                            {submittedEvidence[gate.id].map((ev, i) => (
                              <li key={i} className="text-xs text-emerald-700 flex items-start gap-1">
                                <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {reminderSent[gate.id] && (
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Reminder sent to pending approvers
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
