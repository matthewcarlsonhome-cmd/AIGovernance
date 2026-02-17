'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  FileBox,
  Plus,
  Download,
  Calendar,
  Package,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type {
  EvidencePackage,
  GovernanceGateType,
  GovernanceGateDecision,
} from '@/types';

/* -------------------------------------------------------------------------- */
/*  Demo Data                                                                  */
/* -------------------------------------------------------------------------- */

const DEMO_PACKAGES: EvidencePackage[] = [
  {
    id: 'ep-001',
    project_id: 'demo-project-001',
    organization_id: 'org-001',
    version: 3,
    title: 'SOC 2 Type II Compliance Evidence',
    description: 'Comprehensive evidence package for SOC 2 Type II annual audit, covering all trust service criteria with AI governance artifacts.',
    artifact_manifest: [
      { id: 'a-001', type: 'policy', name: 'Acceptable Use Policy v3.1', description: 'AI tool usage policy', file_url: null, content_snapshot: null, collected_at: '2026-02-10T14:00:00Z' },
      { id: 'a-002', type: 'gate_approval', name: 'Gate 1 - Design Review Approval', description: 'Approved design review with all artifacts verified', file_url: null, content_snapshot: null, collected_at: '2026-02-08T10:30:00Z' },
      { id: 'a-003', type: 'control_check', name: 'Security Control Check Results', description: 'Full security control check run with 24 controls evaluated', file_url: null, content_snapshot: null, collected_at: '2026-02-12T09:00:00Z' },
      { id: 'a-004', type: 'risk_assessment', name: 'AI Risk Assessment Report', description: 'Risk classification matrix with mitigations', file_url: null, content_snapshot: null, collected_at: '2026-02-07T16:00:00Z' },
      { id: 'a-005', type: 'data_classification', name: 'Data Classification Register', description: 'Complete data asset inventory with classification levels', file_url: null, content_snapshot: null, collected_at: '2026-02-09T11:00:00Z' },
      { id: 'a-006', type: 'audit_log', name: 'Governance Audit Trail Export', description: '90-day audit event log export', file_url: null, content_snapshot: null, collected_at: '2026-02-12T09:00:00Z' },
    ],
    gate_summaries: [
      { gate_type: 'design_review', decision: 'approved', decided_at: '2026-01-20T10:00:00Z' },
      { gate_type: 'data_approval', decision: 'approved', decided_at: '2026-01-28T14:00:00Z' },
      { gate_type: 'security_review', decision: 'conditionally_approved', decided_at: '2026-02-05T16:00:00Z' },
      { gate_type: 'launch_review', decision: 'pending', decided_at: null },
    ],
    control_summary: { total: 24, passed: 16, failed: 8 },
    risk_summary: { total: 12, by_tier: { critical: 1, high: 3, medium: 5, low: 3 } },
    generated_by: 'Sarah Chen',
    generated_at: '2026-02-12T09:15:00Z',
    file_url: null,
    created_at: '2026-02-12T09:15:00Z',
    updated_at: '2026-02-12T09:15:00Z',
  },
  {
    id: 'ep-002',
    project_id: 'demo-project-001',
    organization_id: 'org-001',
    version: 1,
    title: 'HIPAA Readiness Evidence Package',
    description: 'Evidence artifacts demonstrating HIPAA compliance readiness for AI-assisted healthcare data processing.',
    artifact_manifest: [
      { id: 'a-010', type: 'policy', name: 'Data Classification Policy v2.0', description: 'Healthcare data classification with PHI handling rules', file_url: null, content_snapshot: null, collected_at: '2026-02-01T10:00:00Z' },
      { id: 'a-011', type: 'risk_assessment', name: 'HIPAA Risk Assessment', description: 'PHI-specific risk analysis for AI tool usage', file_url: null, content_snapshot: null, collected_at: '2026-02-03T14:00:00Z' },
      { id: 'a-012', type: 'control_check', name: 'Encryption Control Verification', description: 'Encryption at rest and in transit verification', file_url: null, content_snapshot: null, collected_at: '2026-02-05T09:00:00Z' },
      { id: 'a-013', type: 'other', name: 'BAA with AI Provider', description: 'Business Associate Agreement with Anthropic', file_url: null, content_snapshot: null, collected_at: '2026-01-15T12:00:00Z' },
    ],
    gate_summaries: [
      { gate_type: 'design_review', decision: 'approved', decided_at: '2026-01-22T10:00:00Z' },
      { gate_type: 'data_approval', decision: 'conditionally_approved', decided_at: '2026-02-01T14:00:00Z' },
    ],
    control_summary: { total: 24, passed: 20, failed: 4 },
    risk_summary: { total: 8, by_tier: { critical: 0, high: 2, medium: 4, low: 2 } },
    generated_by: 'James Rodriguez',
    generated_at: '2026-02-06T11:30:00Z',
    file_url: null,
    created_at: '2026-02-06T11:30:00Z',
    updated_at: '2026-02-06T11:30:00Z',
  },
  {
    id: 'ep-003',
    project_id: 'demo-project-001',
    organization_id: 'org-001',
    version: 2,
    title: 'GDPR Data Processing Evidence',
    description: 'Evidence package for GDPR compliance including data processing activities, privacy impact assessment, and cross-border transfer documentation.',
    artifact_manifest: [
      { id: 'a-020', type: 'data_classification', name: 'Personal Data Inventory', description: 'Complete inventory of personal data processed by AI systems', file_url: null, content_snapshot: null, collected_at: '2026-01-25T10:00:00Z' },
      { id: 'a-021', type: 'policy', name: 'AI Privacy Policy v1.2', description: 'Privacy notice for AI data processing activities', file_url: null, content_snapshot: null, collected_at: '2026-01-28T14:00:00Z' },
      { id: 'a-022', type: 'report', name: 'DPIA Report', description: 'Data Protection Impact Assessment for AI coding tools', file_url: null, content_snapshot: null, collected_at: '2026-02-02T09:00:00Z' },
    ],
    gate_summaries: [
      { gate_type: 'design_review', decision: 'approved', decided_at: '2026-01-18T10:00:00Z' },
      { gate_type: 'data_approval', decision: 'approved', decided_at: '2026-01-30T14:00:00Z' },
      { gate_type: 'security_review', decision: 'approved', decided_at: '2026-02-04T16:00:00Z' },
    ],
    control_summary: { total: 24, passed: 22, failed: 2 },
    risk_summary: { total: 6, by_tier: { critical: 0, high: 1, medium: 3, low: 2 } },
    generated_by: 'Emily Watson',
    generated_at: '2026-02-05T15:45:00Z',
    file_url: null,
    created_at: '2026-02-05T15:45:00Z',
    updated_at: '2026-02-10T08:00:00Z',
  },
];

/* -------------------------------------------------------------------------- */
/*  Helper components                                                          */
/* -------------------------------------------------------------------------- */

const GATE_TYPE_LABELS: Record<GovernanceGateType, string> = {
  design_review: 'Design Review',
  data_approval: 'Data Approval',
  security_review: 'Security Review',
  launch_review: 'Launch Review',
};

function GateDecisionBadge({ decision }: { decision: GovernanceGateDecision }): React.ReactElement {
  const styles: Record<GovernanceGateDecision, { className: string; label: string }> = {
    approved: { className: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Approved' },
    conditionally_approved: { className: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Conditional' },
    rejected: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
    pending: { className: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Pending' },
    deferred: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Deferred' },
  };
  const style = styles[decision];
  return (
    <Badge className={cn('border text-xs', style.className)}>
      {style.label}
    </Badge>
  );
}

function ArtifactTypeBadge({ type }: { type: string }): React.ReactElement {
  const colors: Record<string, string> = {
    policy: 'bg-blue-100 text-blue-800',
    gate_approval: 'bg-emerald-100 text-emerald-800',
    control_check: 'bg-violet-100 text-violet-800',
    risk_assessment: 'bg-orange-100 text-orange-800',
    data_classification: 'bg-cyan-100 text-cyan-800',
    audit_log: 'bg-slate-100 text-slate-700',
    report: 'bg-indigo-100 text-indigo-800',
    other: 'bg-slate-100 text-slate-600',
  };
  const label = type.replace(/_/g, ' ');
  return (
    <Badge className={cn('text-xs capitalize', colors[type] || 'bg-slate-100 text-slate-600')}>
      {label}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Package Card                                                               */
/* -------------------------------------------------------------------------- */

function EvidencePackageCard({
  pkg,
  onView,
}: {
  pkg: EvidencePackage;
  onView: (id: string) => void;
}): React.ReactElement {
  const controlPassRate =
    pkg.control_summary && pkg.control_summary.total > 0
      ? Math.round((pkg.control_summary.passed / pkg.control_summary.total) * 100)
      : 0;

  const approvedGates = pkg.gate_summaries.filter(
    (g) => g.decision === 'approved' || g.decision === 'conditionally_approved',
  ).length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileBox className="h-5 w-5 text-slate-700 flex-shrink-0" />
              <CardTitle className="text-base text-slate-900 truncate">
                {pkg.title}
              </CardTitle>
            </div>
            <CardDescription className="text-slate-500 text-sm line-clamp-2">
              {pkg.description}
            </CardDescription>
          </div>
          <Badge className="bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
            v{pkg.version}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-bold text-slate-900">
              {pkg.artifact_manifest.length}
            </p>
            <p className="text-xs text-slate-500">Artifacts</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-bold text-slate-900">
              {approvedGates}/{pkg.gate_summaries.length}
            </p>
            <p className="text-xs text-slate-500">Gates Passed</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p
              className={cn(
                'text-lg font-bold',
                controlPassRate >= 80
                  ? 'text-emerald-700'
                  : controlPassRate >= 50
                    ? 'text-amber-700'
                    : 'text-red-700',
              )}
            >
              {controlPassRate}%
            </p>
            <p className="text-xs text-slate-500">Controls Pass</p>
          </div>
        </div>

        {/* Gate summaries */}
        <div className="space-y-1.5 mb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Gate Status
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pkg.gate_summaries.map((gate, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1 text-xs"
              >
                <span className="text-slate-600">
                  {GATE_TYPE_LABELS[gate.gate_type]}:
                </span>
                <GateDecisionBadge decision={gate.decision} />
              </div>
            ))}
          </div>
        </div>

        {/* Risk summary */}
        {pkg.risk_summary && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Risk Summary
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600">{pkg.risk_summary.total} risks:</span>
              {pkg.risk_summary.by_tier.critical > 0 && (
                <Badge className="bg-red-100 text-red-800 text-xs">
                  {pkg.risk_summary.by_tier.critical} Critical
                </Badge>
              )}
              {pkg.risk_summary.by_tier.high > 0 && (
                <Badge className="bg-orange-100 text-orange-800 text-xs">
                  {pkg.risk_summary.by_tier.high} High
                </Badge>
              )}
              {pkg.risk_summary.by_tier.medium > 0 && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">
                  {pkg.risk_summary.by_tier.medium} Med
                </Badge>
              )}
              {pkg.risk_summary.by_tier.low > 0 && (
                <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                  {pkg.risk_summary.by_tier.low} Low
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="h-3 w-3" />
          <span>
            Generated {new Date(pkg.generated_at).toLocaleDateString()} by{' '}
            {pkg.generated_by || 'System'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => onView(pkg.id)}
          >
            <Eye className="mr-1 h-3 w-3" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="mr-1 h-3 w-3" />
            Export
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Package Detail View                                                        */
/* -------------------------------------------------------------------------- */

function PackageDetail({
  pkg,
  onBack,
}: {
  pkg: EvidencePackage;
  onBack: () => void;
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{pkg.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
          className="border-slate-200 text-slate-700"
        >
          Back to List
        </Button>
      </div>

      {/* Artifact manifest */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Artifact Manifest ({pkg.artifact_manifest.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pkg.artifact_manifest.map((artifact) => (
              <div
                key={artifact.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {artifact.name}
                    </p>
                    <p className="text-xs text-slate-500">{artifact.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArtifactTypeBadge type={artifact.type} />
                  <span className="text-xs text-slate-400">
                    {new Date(artifact.collected_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Control Summary */}
      {pkg.control_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Control Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-slate-700">
                  {pkg.control_summary.passed} Passed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-slate-700">
                  {pkg.control_summary.failed} Failed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-700">
                  {pkg.control_summary.total} Total
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function EvidencePackagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: _projectId } = React.use(params);

  const [packages] = useState<EvidencePackage[]>(DEMO_PACKAGES);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || null;

  const handleGenerate = (): void => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  // Show detail view if a package is selected
  if (selectedPackage) {
    return (
      <div className="space-y-6">
        <PackageDetail
          pkg={selectedPackage}
          onBack={() => setSelectedPackageId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-slate-700" />
            Evidence Packages
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate compliance evidence packages for audits and reviews.
            Each package bundles governance artifacts, control check results, gate approvals,
            and risk assessments into a comprehensive audit-ready deliverable.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Generate Evidence Package
            </>
          )}
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Packages
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{packages.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                Total Artifacts
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {packages.reduce((sum, p) => sum + p.artifact_manifest.length, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Gates Cleared
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {packages.reduce(
                (sum, p) =>
                  sum +
                  p.gate_summaries.filter(
                    (g) => g.decision === 'approved' || g.decision === 'conditionally_approved',
                  ).length,
                0,
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Latest
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {packages.length > 0
                ? new Date(
                    packages.reduce((latest, p) =>
                      p.generated_at > latest ? p.generated_at : latest,
                    packages[0].generated_at),
                  ).toLocaleDateString()
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Package list */}
      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <FileBox className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Evidence Packages Yet
            </h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">
              Evidence packages bundle your governance artifacts, security control results,
              gate approvals, and risk assessments into audit-ready deliverables.
              Generate your first package to get started.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate Evidence Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <EvidencePackageCard
              key={pkg.id}
              pkg={pkg}
              onView={(id) => setSelectedPackageId(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
