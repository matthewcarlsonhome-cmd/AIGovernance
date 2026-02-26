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
import {
  ShieldCheck,
  Rocket,
  Building2,
  CheckCircle2,
  Clock,
  Lock,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  Info,
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

type GateGuidance = string;

const GATE_GUIDANCE: Record<string, GateGuidance> = {
  'gate-1': 'Submit after completing data classification and initial policies in Phase 2.',
  'gate-2': 'Submit after security controls are configured and verified in Phase 3.',
  'gate-3': 'Submit after pilot execution completes with metrics in Phase 4.',
};

const GATES: Gate[] = [
  {
    id: "gate-1",
    number: 1,
    title: "Data Approval",
    status: "locked",
    type: "Automated",
    description:
      "Initial gate verifying that data classification is complete and initial governance policies have been drafted and reviewed.",
    criteria: "Data classification complete + initial policies drafted",
    checklist: [
      { label: "Data classification completed", status: "unchecked" },
      { label: "Acceptable Use Policy drafted", status: "unchecked" },
      { label: "Data handling procedures documented", status: "unchecked" },
    ],
    approvers: [],
  },
  {
    id: "gate-2",
    number: 2,
    title: "Security Review",
    status: "locked",
    type: "Manual Approval Required",
    description:
      "Gate requiring security controls to be configured, verified, and approved before proceeding to pilot execution.",
    criteria: "Security controls configured + verification complete",
    checklist: [
      { label: "Security controls configured", status: "unchecked" },
      { label: "DLP rules active and verified", status: "unchecked" },
      { label: "Audit logging confirmed", status: "unchecked" },
      { label: "Penetration test report submitted", status: "unchecked" },
      { label: "Network segmentation verified", status: "unchecked" },
    ],
    approvers: [],
    note: "Requires Gate 1 approval first",
  },
  {
    id: "gate-3",
    number: 3,
    title: "Launch Review",
    status: "locked",
    type: "Full Review Board",
    description:
      "Final gate requiring full review board approval with comprehensive evidence of successful pilot execution, compliance documentation, and risk assessment.",
    criteria: "Pilot success + full board approval",
    checklist: [
      { label: "Complete pilot evaluation data", status: "unchecked" },
      { label: "Zero security incidents during pilot", status: "unchecked" },
      { label: "Compliance mapping complete", status: "unchecked" },
      { label: "Risk assessment finalized", status: "unchecked" },
      { label: "Production monitoring plan", status: "unchecked" },
      { label: "Cost-benefit analysis", status: "unchecked" },
    ],
    approvers: [],
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
      return "Not Started";
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
  const { data: fetchedGates, isLoading } = useGateReviews(id);

  const [expandedGate, setExpandedGate] = React.useState<string | null>(
    "gate-1"
  );

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            The Three Gates
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Three formal approval checkpoints between sandbox and production. Each gate must be approved in sequence.
          </p>
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-normal mt-2">Owned by: Executive Sponsor, Legal Lead</Badge>
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

      {/* How-to guide */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">How Gate Reviews Work</p>
              <p className="text-sm text-blue-800">
                Each gate is a formal approval checkpoint. <strong>Click a gate</strong> to expand its checklist.
                Check off items as they are completed, submit evidence, and send reminders to approvers.
                A gate can only be approved when all checklist items are verified and all approvers have signed off.
                Gates must be approved in order -- Gate 2 requires Gate 1, and Gate 3 requires Gate 2.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

                {/* Gate Details & Guidance */}
                <div className="flex flex-col gap-6">
                  {/* Guidance */}
                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4">
                    <Info className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">Not Started</p>
                      <p className="text-sm text-slate-500">
                        {GATE_GUIDANCE[gate.id]}
                      </p>
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
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Review Type
                        </span>
                        <span className="text-slate-900 font-medium">
                          {gate.type}
                        </span>
                      </div>
                      {gate.note && (
                        <div className="mt-2 flex items-center gap-2 rounded-md bg-amber-500/10 p-2.5 text-xs text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          {gate.note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Next Step */}
      <Card className="bg-blue-50 border-blue-200 mt-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">Next Step</p>
              <p className="text-sm text-blue-700">After all gates are approved, proceed to sandbox configuration.</p>
            </div>
            <a href={`/projects/${id}/sandbox/configure`}>
              <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                Configure Sandbox <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
