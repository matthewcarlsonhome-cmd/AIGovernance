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
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Minus,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { useComplianceMappings } from '@/hooks/use-governance';

type ControlStatus = "verified" | "implemented" | "in_progress" | "not_started";

interface ComplianceControl {
  controlId: string;
  controlName: string;
  description: string;
  status: ControlStatus;
  evidence: string;
}

interface FrameworkData {
  id: string;
  name: string;
  shortName: string;
  description: string;
  controls: ComplianceControl[];
}

const FRAMEWORKS: FrameworkData[] = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    shortName: "SOC 2",
    description: "Service Organization Control 2 - Trust Services Criteria for Security, Availability, and Confidentiality.",
    controls: [
      { controlId: "CC6.1", controlName: "Logical Access Controls", description: "Access to systems and data is restricted to authorized users through logical access security measures.", status: "implemented", evidence: "SSO config, RBAC policies" },
      { controlId: "CC6.2", controlName: "Access Authentication", description: "Multi-factor authentication is required for all system access by internal and external users.", status: "implemented", evidence: "MFA enrollment records" },
      { controlId: "CC6.3", controlName: "Access Authorization", description: "Access to systems and data is granted based on role assignments and the principle of least privilege.", status: "in_progress", evidence: "Role matrix document" },
      { controlId: "CC6.6", controlName: "System Changes", description: "Changes to system components are authorized, tested, approved, and implemented through a formal change management process.", status: "in_progress", evidence: "Change management SOP" },
      { controlId: "CC6.7", controlName: "Data Transmission", description: "Data transmitted between the entity and external parties is protected using encryption and secure transmission protocols.", status: "implemented", evidence: "TLS certificate records" },
      { controlId: "CC6.8", controlName: "Malware Prevention", description: "Controls are in place to prevent, detect, and respond to the introduction of malicious software.", status: "verified", evidence: "EDR deployment records" },
      { controlId: "CC7.1", controlName: "Monitoring", description: "The entity monitors system components and the operation of those components for anomalies and security events.", status: "not_started", evidence: "-" },
      { controlId: "CC7.2", controlName: "Incident Detection", description: "Processes are in place to detect and respond to actual or potential security incidents in a timely manner.", status: "in_progress", evidence: "SIEM configuration" },
      { controlId: "CC8.1", controlName: "Change Management", description: "A formal change management process exists for authorizing, testing, and deploying system and configuration changes.", status: "implemented", evidence: "CAB meeting minutes" },
    ],
  },
  {
    id: "hipaa",
    name: "HIPAA Security Rule",
    shortName: "HIPAA",
    description: "Health Insurance Portability and Accountability Act - Administrative, Physical, and Technical Safeguards.",
    controls: [
      { controlId: "164.308(a)(1)", controlName: "Security Management Process", description: "Implement policies and procedures to prevent, detect, contain, and correct security violations.", status: "implemented", evidence: "Security policy documentation" },
      { controlId: "164.308(a)(3)", controlName: "Workforce Security", description: "Implement policies and procedures to ensure all workforce members have appropriate access to ePHI.", status: "in_progress", evidence: "Access control matrix" },
      { controlId: "164.308(a)(4)", controlName: "Information Access Management", description: "Implement policies and procedures for authorizing access to ePHI consistent with the applicable requirements.", status: "in_progress", evidence: "Access request workflow" },
      { controlId: "164.308(a)(5)", controlName: "Security Awareness Training", description: "Implement a security awareness and training program for all workforce members.", status: "implemented", evidence: "Training completion records" },
      { controlId: "164.312(a)(1)", controlName: "Access Control", description: "Implement technical policies and procedures for electronic information systems that maintain ePHI.", status: "implemented", evidence: "RBAC configuration, MFA records" },
      { controlId: "164.312(c)(1)", controlName: "Integrity Controls", description: "Implement policies and procedures to protect ePHI from improper alteration or destruction.", status: "not_started", evidence: "-" },
      { controlId: "164.312(d)", controlName: "Person/Entity Authentication", description: "Implement procedures to verify that a person seeking access to ePHI is the one claimed.", status: "verified", evidence: "MFA deployment audit" },
      { controlId: "164.312(e)(1)", controlName: "Transmission Security", description: "Implement technical security measures to guard against unauthorized access to ePHI being transmitted.", status: "implemented", evidence: "TLS/encryption records" },
    ],
  },
  {
    id: "nist",
    name: "NIST 800-53 Rev. 5",
    shortName: "NIST 800-53",
    description: "National Institute of Standards and Technology - Security and Privacy Controls for Information Systems.",
    controls: [
      { controlId: "AC-2", controlName: "Account Management", description: "Define and document the types of accounts allowed and specifically prohibited for the system.", status: "implemented", evidence: "Account management procedures" },
      { controlId: "AC-3", controlName: "Access Enforcement", description: "Enforce approved authorizations for logical access to information and system resources.", status: "implemented", evidence: "RBAC policy configuration" },
      { controlId: "AC-6", controlName: "Least Privilege", description: "Employ the principle of least privilege, allowing only authorized accesses for users.", status: "in_progress", evidence: "Privilege audit report" },
      { controlId: "AU-2", controlName: "Event Logging", description: "Identify the types of events that the system is capable of logging in support of audit needs.", status: "implemented", evidence: "Audit logging configuration" },
      { controlId: "AU-6", controlName: "Audit Record Review", description: "Review and analyze system audit records for indications of inappropriate or unusual activity.", status: "not_started", evidence: "-" },
      { controlId: "CM-3", controlName: "Configuration Change Control", description: "Determine and document the types of changes to the system that are configuration-controlled.", status: "in_progress", evidence: "Change management process" },
      { controlId: "IA-2", controlName: "Identification and Authentication", description: "Uniquely identify and authenticate organizational users and associate that identity to processes acting on behalf of users.", status: "verified", evidence: "SSO/MFA deployment records" },
      { controlId: "IR-4", controlName: "Incident Handling", description: "Implement an incident handling capability for incidents that includes preparation, detection, analysis, containment, eradication, and recovery.", status: "in_progress", evidence: "IRP addendum draft" },
      { controlId: "SC-8", controlName: "Transmission Confidentiality", description: "Protect the confidentiality of transmitted information during preparation for transmission and during reception.", status: "implemented", evidence: "TLS enforcement records" },
    ],
  },
  {
    id: "gdpr",
    name: "GDPR",
    shortName: "GDPR",
    description: "General Data Protection Regulation - EU data protection and privacy requirements.",
    controls: [
      { controlId: "Art. 5", controlName: "Principles of Processing", description: "Personal data shall be processed lawfully, fairly, and in a transparent manner in relation to the data subject.", status: "implemented", evidence: "Privacy policy, processing records" },
      { controlId: "Art. 6", controlName: "Lawfulness of Processing", description: "Processing shall be lawful only if and to the extent that at least one legal basis applies.", status: "implemented", evidence: "Legal basis assessment" },
      { controlId: "Art. 25", controlName: "Data Protection by Design", description: "Implement appropriate technical and organizational measures designed to implement data-protection principles effectively.", status: "in_progress", evidence: "Architecture review documentation" },
      { controlId: "Art. 28", controlName: "Processor Requirements", description: "Where processing is carried out on behalf of a controller, the controller shall use only processors providing sufficient guarantees.", status: "in_progress", evidence: "DPA with AI vendors" },
      { controlId: "Art. 30", controlName: "Records of Processing", description: "Each controller shall maintain a record of processing activities under its responsibility.", status: "implemented", evidence: "Processing activity register" },
      { controlId: "Art. 32", controlName: "Security of Processing", description: "Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.", status: "implemented", evidence: "Security controls documentation" },
      { controlId: "Art. 33", controlName: "Breach Notification", description: "In the case of a personal data breach, the controller shall notify the supervisory authority within 72 hours.", status: "not_started", evidence: "-" },
      { controlId: "Art. 35", controlName: "Data Protection Impact Assessment", description: "Carry out an assessment of the impact of the envisaged processing operations on the protection of personal data.", status: "in_progress", evidence: "DPIA for AI tool usage (draft)" },
    ],
  },
  {
    id: "eu_ai_act",
    name: "EU AI Act",
    shortName: "EU AI Act",
    description: "European Union Artificial Intelligence Act - Regulation on harmonised rules for AI systems, covering risk classification, transparency, and human oversight requirements.",
    controls: [
      { controlId: "Art. 6", controlName: "Risk Classification", description: "Classify AI systems according to their risk level (unacceptable, high, limited, minimal) and apply corresponding regulatory obligations.", status: "in_progress", evidence: "AI risk classification matrix" },
      { controlId: "Art. 9", controlName: "Risk Management System", description: "Establish and maintain a continuous, iterative risk management system throughout the AI system lifecycle, identifying and mitigating known and foreseeable risks.", status: "in_progress", evidence: "Risk management framework draft" },
      { controlId: "Art. 10", controlName: "Data Governance", description: "Ensure training, validation, and testing datasets are relevant, representative, free of errors, and complete, with appropriate data governance and management practices.", status: "not_started", evidence: "-" },
      { controlId: "Art. 11", controlName: "Technical Documentation", description: "Maintain up-to-date technical documentation demonstrating compliance with AI Act requirements, prepared before the system is placed on the market.", status: "in_progress", evidence: "Technical documentation template" },
      { controlId: "Art. 12", controlName: "Record-Keeping", description: "Design high-risk AI systems with automatic logging capabilities to ensure traceability of the system functioning throughout its lifecycle.", status: "not_started", evidence: "-" },
      { controlId: "Art. 13", controlName: "Transparency", description: "Design and develop high-risk AI systems to ensure their operation is sufficiently transparent to enable users to interpret and use the system output appropriately.", status: "implemented", evidence: "AI disclosure policy" },
      { controlId: "Art. 14", controlName: "Human Oversight", description: "Design high-risk AI systems to allow effective human oversight, including the ability to fully understand, monitor, and intervene in the system operation.", status: "implemented", evidence: "Human-in-the-loop review process" },
      { controlId: "Art. 15", controlName: "Accuracy & Robustness", description: "Ensure high-risk AI systems achieve appropriate levels of accuracy, robustness, and cybersecurity, and perform consistently throughout their lifecycle.", status: "in_progress", evidence: "Quality assurance test plan" },
    ],
  },
];

function getStatusBadgeClasses(status: ControlStatus): string {
  switch (status) {
    case "verified": return "bg-emerald-500/15 text-emerald-700 border-emerald-500/25";
    case "implemented": return "bg-blue-500/15 text-blue-700 border-blue-500/25";
    case "in_progress": return "bg-amber-500/15 text-amber-700 border-amber-500/25";
    case "not_started": return "bg-slate-100 text-slate-500 border-slate-200";
    default: return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

function getStatusLabel(status: ControlStatus): string {
  switch (status) {
    case "verified": return "Verified";
    case "implemented": return "Implemented";
    case "in_progress": return "In Progress";
    case "not_started": return "Not Started";
    default: return status;
  }
}

function getStatusIcon(status: ControlStatus): React.ReactNode {
  switch (status) {
    case "verified": return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "implemented": return <FileCheck className="h-3.5 w-3.5" />;
    case "in_progress": return <Clock className="h-3.5 w-3.5" />;
    case "not_started": return <Minus className="h-3.5 w-3.5" />;
    default: return null;
  }
}

function computeFrameworkStats(controls: ComplianceControl[]) {
  const total = controls.length;
  const verified = controls.filter((c) => c.status === "verified").length;
  const implemented = controls.filter((c) => c.status === "implemented").length;
  const inProgress = controls.filter((c) => c.status === "in_progress").length;
  const notStarted = controls.filter((c) => c.status === "not_started").length;
  const doneCount = verified + implemented;
  const percentage = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  return { total, verified, implemented, inProgress, notStarted, percentage };
}

const FRAMEWORK_OPTIONS = [
  { value: "soc2", label: "SOC 2 Type II" },
  { value: "hipaa", label: "HIPAA Security Rule" },
  { value: "nist", label: "NIST 800-53 Rev. 5" },
  { value: "gdpr", label: "GDPR" },
  { value: "eu_ai_act", label: "EU AI Act" },
];

const STATUS_OPTIONS: { value: ControlStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "implemented", label: "Implemented" },
  { value: "verified", label: "Verified" },
];

export default function ComplianceMappingPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const { id } = React.use(params);
  const { data: fetchedMappings, isLoading, error } = useComplianceMappings(id);
  const [activeFramework, setActiveFramework] = React.useState<string>("soc2");

  // Dialog state
  const [showMapDialog, setShowMapDialog] = React.useState(false);
  const [newFramework, setNewFramework] = React.useState("soc2");
  const [newControlId, setNewControlId] = React.useState("");
  const [newControlName, setNewControlName] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newStatus, setNewStatus] = React.useState<ControlStatus>("not_started");
  const [localControls, setLocalControls] = React.useState<{ framework: string; control: ComplianceControl }[]>([]);
  const [detailControl, setDetailControl] = React.useState<ComplianceControl | null>(null);

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  const frameworks: FrameworkData[] = FRAMEWORKS.map((fw) => ({
    ...fw,
    controls: [...fw.controls, ...localControls.filter((lc) => lc.framework === fw.id).map((lc) => lc.control)],
  }));

  const allControls = frameworks.flatMap((f) => f.controls);
  const overallStats = computeFrameworkStats(allControls);

  const handleMapControl = (): void => {
    if (!newControlId.trim() || !newControlName.trim()) return;
    setLocalControls((prev) => [...prev, { framework: newFramework, control: { controlId: newControlId.trim(), controlName: newControlName.trim(), description: newDescription.trim(), status: newStatus, evidence: "-" } }]);
    setNewControlId(""); setNewControlName(""); setNewDescription(""); setNewStatus("not_started");
    setShowMapDialog(false);
    setActiveFramework(newFramework);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compliance Framework Mapping</h1>
          <p className="mt-1 text-sm text-slate-500">Map AI governance controls to compliance frameworks and track implementation status across SOC 2, HIPAA, NIST, and GDPR.</p>
        </div>
        <Button onClick={() => setShowMapDialog(true)} className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" /> Map New Control
        </Button>
      </div>

      <Separator />

      {/* Map New Control Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Map New Control</DialogTitle>
            <DialogDescription>Add a new compliance control mapping to a framework.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="map-framework">Framework</Label>
              <select id="map-framework" value={newFramework} onChange={(e) => setNewFramework(e.target.value)} className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400">
                {FRAMEWORK_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="map-control-id">Control ID</Label>
                <Input id="map-control-id" placeholder="e.g. CC9.1" value={newControlId} onChange={(e) => setNewControlId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="map-status">Status</Label>
                <select id="map-status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as ControlStatus)} className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400">
                  {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="map-control-name">Control Name</Label>
              <Input id="map-control-name" placeholder="e.g. Risk Mitigation" value={newControlName} onChange={(e) => setNewControlName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="map-description">Description</Label>
              <textarea id="map-description" placeholder="Describe the control requirements..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMapDialog(false)}>Cancel</Button>
            <Button onClick={handleMapControl} disabled={!newControlId.trim() || !newControlName.trim()} className="bg-slate-900 text-white hover:bg-slate-800">Add Control</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailControl !== null} onOpenChange={(open) => { if (!open) setDetailControl(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{detailControl?.controlId} - {detailControl?.controlName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div><p className="text-xs font-semibold text-slate-500 uppercase">Description</p><p className="text-sm text-slate-900 mt-1">{detailControl?.description}</p></div>
            <div><p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
              {detailControl && <Badge variant="outline" className={cn("text-xs font-medium flex items-center gap-1 w-fit mt-1", getStatusBadgeClasses(detailControl.status))}>{getStatusIcon(detailControl.status)}{getStatusLabel(detailControl.status)}</Badge>}
            </div>
            <div><p className="text-xs font-semibold text-slate-500 uppercase">Evidence</p><p className="text-sm text-slate-900 mt-1">{detailControl?.evidence}</p></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDetailControl(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overall Compliance Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900/10">
                <Shield className="h-6 w-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Overall Compliance Progress</h2>
                <p className="text-sm text-slate-500">{overallStats.verified + overallStats.implemented} of {overallStats.total} controls implemented or verified across all frameworks</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">{overallStats.percentage}%</p>
              <p className="text-xs text-slate-500">Complete</p>
            </div>
          </div>
          <div className="mt-4"><Progress value={overallStats.percentage} /></div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2 text-sm"><div className="h-3 w-3 rounded-full bg-emerald-500" /><span className="text-slate-500">Verified:</span><span className="font-medium text-slate-900">{overallStats.verified}</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="h-3 w-3 rounded-full bg-blue-500" /><span className="text-slate-500">Implemented:</span><span className="font-medium text-slate-900">{overallStats.implemented}</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="h-3 w-3 rounded-full bg-amber-500" /><span className="text-slate-500">In Progress:</span><span className="font-medium text-slate-900">{overallStats.inProgress}</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="h-3 w-3 rounded-full bg-slate-400" /><span className="text-slate-500">Not Started:</span><span className="font-medium text-slate-900">{overallStats.notStarted}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Framework Tabs */}
      <Tabs value={activeFramework} onValueChange={setActiveFramework}>
        <TabsList>
          {frameworks.map((framework) => {
            const stats = computeFrameworkStats(framework.controls);
            return (<TabsTrigger key={framework.id} value={framework.id}>{framework.shortName}<span className="ml-1.5 text-xs text-slate-500">({stats.percentage}%)</span></TabsTrigger>);
          })}
        </TabsList>

        {frameworks.map((framework) => {
          const stats = computeFrameworkStats(framework.controls);
          return (
            <TabsContent key={framework.id} value={framework.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div><CardTitle>{framework.name}</CardTitle><CardDescription className="mt-1">{framework.description}</CardDescription></div>
                    <div className="text-right shrink-0"><p className="text-2xl font-bold text-slate-900">{stats.percentage}%</p><p className="text-xs text-slate-500">{stats.verified + stats.implemented}/{stats.total} controls</p></div>
                  </div>
                  <div className="mt-2"><Progress value={stats.percentage} /></div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Control ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Control Name</th>
                          <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                          <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">Evidence</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {framework.controls.map((control, idx) => (
                          <tr key={control.controlId} className={cn("border-b border-slate-200 transition-colors hover:bg-slate-50", idx % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                            <td className="px-4 py-3"><span className="text-sm font-mono font-medium text-slate-900">{control.controlId}</span></td>
                            <td className="px-4 py-3"><span className="text-sm font-medium text-slate-900">{control.controlName}</span></td>
                            <td className="hidden px-4 py-3 md:table-cell"><span className="text-sm text-slate-500 line-clamp-2">{control.description}</span></td>
                            <td className="px-4 py-3"><Badge variant="outline" className={cn("text-xs font-medium flex items-center gap-1 w-fit", getStatusBadgeClasses(control.status))}>{getStatusIcon(control.status)}{getStatusLabel(control.status)}</Badge></td>
                            <td className="hidden px-4 py-3 sm:table-cell"><span className="text-sm text-slate-500">{control.evidence}</span></td>
                            <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setDetailControl(control)}><ExternalLink className="h-3.5 w-3.5" /></Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
