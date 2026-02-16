'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Activity,
  Clock,
  Eye,
  FileBox,
  Target,
  Siren,
  TrendingDown,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { runSecurityControlChecks, getDefaultThreatModel } from '@/lib/security';
import type {
  SecurityControlStatus,
  SecurityIncident,
  ControlCheckCategory,
} from '@/types';

/* -------------------------------------------------------------------------- */
/*  Demo input for security checks                                             */
/* -------------------------------------------------------------------------- */

const DEMO_INPUT = {
  project_id: 'demo-project-001',
  sandbox_config: { cloud_provider: 'aws', settings: { region: 'us-east-1' } },
  has_mfa: true,
  has_sso: false,
  secrets_in_env: true,
  logging_enabled: true,
  encryption_at_rest: true,
  encryption_in_transit: true,
  egress_restricted: false,
  model_allowlist: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514'],
  data_retention_configured: false,
  rbac_configured: true,
  audit_logging: true,
};

/* -------------------------------------------------------------------------- */
/*  Demo incidents                                                             */
/* -------------------------------------------------------------------------- */

const DEMO_INCIDENTS: SecurityIncident[] = [
  {
    id: 'inc-001',
    project_id: 'demo-project-001',
    organization_id: 'org-001',
    category: 'policy_violation',
    severity: 'medium',
    title: 'Developer used unapproved AI model in staging',
    description: 'A developer was found using a non-allowlisted GPT-4 Turbo model via personal API key in the staging environment. The model allowlist policy was bypassed by direct API calls outside the managed proxy.',
    detected_at: '2026-02-14T09:30:00Z',
    detected_by: 'Audit Log Monitor',
    status: 'resolved',
    assigned_to: null,
    assigned_to_name: 'Sarah Chen',
    resolution: 'Revoked personal API key access, enforced proxy-only model access, updated egress rules.',
    resolved_at: '2026-02-14T16:00:00Z',
    root_cause: 'Egress restrictions did not cover all AI provider endpoints.',
    impact_assessment: 'Low - no sensitive data was sent to the unapproved model. Staging environment only.',
    corrective_actions: ['Updated egress firewall rules to block non-proxy AI API traffic', 'Added detection rule for non-proxy AI model calls'],
    linked_control_ids: ['MDL-001', 'EGR-001'],
    created_at: '2026-02-14T09:30:00Z',
    updated_at: '2026-02-14T16:00:00Z',
    deleted_at: null,
  },
  {
    id: 'inc-002',
    project_id: 'demo-project-001',
    organization_id: 'org-001',
    category: 'data_leak',
    severity: 'high',
    title: 'PII detected in AI prompt logs',
    description: 'Automated DLP scanning of AI interaction logs detected customer email addresses and phone numbers in 12 prompt submissions over the past 48 hours.',
    detected_at: '2026-02-12T14:22:00Z',
    detected_by: 'DLP Scanner',
    status: 'investigating',
    assigned_to: null,
    assigned_to_name: 'James Rodriguez',
    resolution: null,
    resolved_at: null,
    root_cause: null,
    impact_assessment: 'Medium - PII was sent to enterprise AI provider with DPA in place, but violates data classification policy.',
    corrective_actions: ['Deploy pre-submission PII redaction filter on AI proxy'],
    linked_control_ids: ['SEC-001', 'RET-001'],
    created_at: '2026-02-12T14:22:00Z',
    updated_at: '2026-02-13T10:00:00Z',
    deleted_at: null,
  },
  {
    id: 'inc-003',
    project_id: 'demo-project-001',
    organization_id: 'org-001',
    category: 'prompt_injection',
    severity: 'low',
    title: 'Benign prompt injection detected in test suite',
    description: 'A security test case containing a prompt injection payload was flagged by the content filter. The test was part of an approved red-team exercise.',
    detected_at: '2026-02-10T11:00:00Z',
    detected_by: 'Content Filter',
    status: 'closed',
    assigned_to: null,
    assigned_to_name: 'Alex Thompson',
    resolution: 'Confirmed as authorized red-team test. Added test suite IPs to allowlist for future exercises.',
    resolved_at: '2026-02-10T12:30:00Z',
    root_cause: 'Expected behavior during security testing.',
    impact_assessment: 'None - authorized testing activity.',
    corrective_actions: [],
    linked_control_ids: [],
    created_at: '2026-02-10T11:00:00Z',
    updated_at: '2026-02-10T12:30:00Z',
    deleted_at: null,
  },
  {
    id: 'inc-004',
    project_id: 'demo-project-001',
    organization_id: 'org-001',
    category: 'unauthorized_access',
    severity: 'critical',
    title: 'Service account accessing production database from sandbox',
    description: 'Monitoring detected a sandbox AI tool service account making queries against the production customer database. The service account had overly broad IAM permissions that included production read access.',
    detected_at: '2026-02-08T07:15:00Z',
    detected_by: 'Database Activity Monitor',
    status: 'resolved',
    assigned_to: null,
    assigned_to_name: 'Sarah Chen',
    resolution: 'Immediately revoked production access from sandbox service accounts. Implemented strict IAM boundary policies separating sandbox and production.',
    resolved_at: '2026-02-08T09:45:00Z',
    root_cause: 'IAM role attached to sandbox service account inherited production read permissions from a parent policy.',
    impact_assessment: 'High - service account had read access to 3 production tables containing customer data. No evidence of data exfiltration.',
    corrective_actions: ['Implemented IAM permission boundaries for all sandbox accounts', 'Added automated drift detection for service account permissions', 'Scheduled quarterly IAM access review'],
    linked_control_ids: ['ACL-001', 'ACL-002', 'ACL-003'],
    created_at: '2026-02-08T07:15:00Z',
    updated_at: '2026-02-08T09:45:00Z',
    deleted_at: null,
  },
];

/* -------------------------------------------------------------------------- */
/*  Demo control drift alerts                                                  */
/* -------------------------------------------------------------------------- */

interface ControlDriftAlert {
  id: string;
  control_id: string;
  control_name: string;
  previous_result: string;
  current_result: string;
  detected_at: string;
  message: string;
}

const DEMO_DRIFT_ALERTS: ControlDriftAlert[] = [
  {
    id: 'drift-001',
    control_id: 'EGR-001',
    control_name: 'Egress Restrictions Configured',
    previous_result: 'pass',
    current_result: 'fail',
    detected_at: '2026-02-13T08:00:00Z',
    message: 'Egress restriction was disabled after infrastructure change. Firewall rule was removed during VPC reconfiguration.',
  },
  {
    id: 'drift-002',
    control_id: 'RET-001',
    control_name: 'Data Retention Policy Configured',
    previous_result: 'pass',
    current_result: 'fail',
    detected_at: '2026-02-11T14:00:00Z',
    message: 'Data retention policy configuration was removed from project settings during migration.',
  },
  {
    id: 'drift-003',
    control_id: 'SEC-001',
    control_name: 'No Secrets in Environment Variables',
    previous_result: 'warning',
    current_result: 'fail',
    detected_at: '2026-02-10T16:30:00Z',
    message: 'New API keys detected in environment variables after deployment pipeline update.',
  },
];

/* -------------------------------------------------------------------------- */
/*  Category labels                                                            */
/* -------------------------------------------------------------------------- */

const CATEGORY_LABELS: Record<ControlCheckCategory, string> = {
  auth: 'Authentication',
  secrets: 'Secrets Management',
  model_config: 'Model Config',
  logging: 'Logging',
  egress: 'Egress',
  storage: 'Storage',
  data_retention: 'Data Retention',
  access_control: 'Access Control',
  encryption: 'Encryption',
};

/* -------------------------------------------------------------------------- */
/*  Helper: severity badge                                                     */
/* -------------------------------------------------------------------------- */

function SeverityBadge({ severity }: { severity: string }): React.ReactElement {
  const styles: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  return (
    <Badge className={cn('border capitalize', styles[severity] || 'bg-slate-100 text-slate-600')}>
      {severity}
    </Badge>
  );
}

function IncidentStatusBadge({ status }: { status: string }): React.ReactElement {
  const styles: Record<string, string> = {
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-amber-100 text-amber-800',
    contained: 'bg-blue-100 text-blue-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-slate-100 text-slate-600',
  };
  return (
    <Badge className={cn('capitalize', styles[status] || 'bg-slate-100 text-slate-600')}>
      {status}
    </Badge>
  );
}

function ResultBadge({ result }: { result: string }): React.ReactElement {
  const styles: Record<string, { className: string; icon: React.ReactNode }> = {
    pass: {
      className: 'text-emerald-700',
      icon: <CheckCircle className="h-3 w-3" />,
    },
    fail: {
      className: 'text-red-700',
      icon: <XCircle className="h-3 w-3" />,
    },
    warning: {
      className: 'text-amber-700',
      icon: <AlertTriangle className="h-3 w-3" />,
    },
  };
  const style = styles[result] || { className: 'text-slate-500', icon: null };
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium uppercase', style.className)}>
      {style.icon}
      {result}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function MonitoringSecurityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: projectId } = React.use(params);

  const [status, setStatus] = useState<SecurityControlStatus>(() =>
    runSecurityControlChecks({ ...DEMO_INPUT, project_id: projectId }),
  );
  const [isRunning, setIsRunning] = useState(false);

  const threats = useMemo(() => getDefaultThreatModel(projectId), [projectId]);

  const openThreats = threats.filter((t) => t.mitigation_status === 'open').length;
  const criticalThreats = threats.filter(
    (t) => t.risk_score >= 12 && t.mitigation_status === 'open',
  ).length;

  const activeIncidents = DEMO_INCIDENTS.filter(
    (i) => i.status === 'open' || i.status === 'investigating',
  ).length;
  const criticalIncidents = DEMO_INCIDENTS.filter(
    (i) => i.severity === 'critical' && i.status !== 'closed',
  ).length;

  const handleRunChecks = (): void => {
    setIsRunning(true);
    setTimeout(() => {
      const newStatus = runSecurityControlChecks({
        ...DEMO_INPUT,
        project_id: projectId,
      });
      setStatus(newStatus);
      setIsRunning(false);
    }, 800);
  };

  // Overall security posture score (simple formula)
  const postureScore = useMemo(() => {
    const controlScore = status.pass_rate;
    const incidentPenalty = criticalIncidents * 10 + activeIncidents * 5;
    const threatPenalty = criticalThreats * 5;
    const driftPenalty = DEMO_DRIFT_ALERTS.length * 3;
    return Math.max(0, Math.min(100, controlScore - incidentPenalty - threatPenalty - driftPenalty));
  }, [status.pass_rate, criticalIncidents, activeIncidents, criticalThreats]);

  const postureLabel =
    postureScore >= 80
      ? 'Strong'
      : postureScore >= 60
        ? 'Moderate'
        : postureScore >= 40
          ? 'Weak'
          : 'Critical';
  const postureColor =
    postureScore >= 80
      ? 'text-emerald-700'
      : postureScore >= 60
        ? 'text-amber-700'
        : postureScore >= 40
          ? 'text-orange-700'
          : 'text-red-700';
  const postureBg =
    postureScore >= 80
      ? 'bg-emerald-50 border-emerald-200'
      : postureScore >= 60
        ? 'bg-amber-50 border-amber-200'
        : postureScore >= 40
          ? 'bg-orange-50 border-orange-200'
          : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-slate-700" />
            Security Monitoring
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time security posture overview with incident tracking and control drift detection.
          </p>
        </div>
        <Button
          onClick={handleRunChecks}
          disabled={isRunning}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', isRunning && 'animate-spin')} />
          {isRunning ? 'Running Checks...' : 'Run Security Checks'}
        </Button>
      </div>

      {/* Security Posture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cn('border', postureBg)}>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Security Posture
              </span>
            </div>
            <p className={cn('text-3xl font-bold', postureColor)}>{postureScore}</p>
            <p className={cn('text-sm font-medium', postureColor)}>{postureLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Control Pass Rate
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{status.pass_rate}%</p>
            <p className="text-xs text-slate-500">
              {status.passed}/{status.total_controls} controls
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Siren className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
                Active Incidents
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{activeIncidents}</p>
            <p className="text-xs text-slate-500">
              {criticalIncidents > 0
                ? `${criticalIncidents} critical`
                : 'No critical incidents'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                Control Drift
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{DEMO_DRIFT_ALERTS.length}</p>
            <p className="text-xs text-slate-500">controls regressed</p>
          </CardContent>
        </Card>
      </div>

      {/* Control Status & Drift side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Control Status by Category</CardTitle>
            <CardDescription className="text-slate-500">
              Current pass/fail breakdown across security control categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(status.by_category).map(([cat, data]) => {
                const passRate = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium">
                        {CATEGORY_LABELS[cat as ControlCheckCategory] || cat}
                      </span>
                      <span className="text-xs text-slate-500">
                        {data.passed}/{data.total}
                        {data.failed > 0 && (
                          <span className="text-red-600 ml-1">
                            ({data.failed} failed)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          passRate >= 80
                            ? 'bg-emerald-500'
                            : passRate >= 50
                              ? 'bg-amber-500'
                              : 'bg-red-500',
                        )}
                        style={{ width: `${passRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t border-slate-100">
            <a
              href={`/projects/${projectId}/governance/security-controls`}
              className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              View Full Control Dashboard
              <ArrowRight className="h-3 w-3" />
            </a>
          </CardFooter>
        </Card>

        {/* Control Drift Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Control Drift Alerts
            </CardTitle>
            <CardDescription className="text-slate-500">
              Controls that have regressed from a passing to failing state
            </CardDescription>
          </CardHeader>
          <CardContent>
            {DEMO_DRIFT_ALERTS.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-400 mb-2" />
                <p className="text-sm text-slate-600">No control drift detected</p>
                <p className="text-xs text-slate-400">All controls are stable</p>
              </div>
            ) : (
              <div className="space-y-3">
                {DEMO_DRIFT_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-red-50 border border-red-100 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-white text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                          {alert.control_id}
                        </code>
                        <span className="text-sm font-medium text-slate-900">
                          {alert.control_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs flex-shrink-0">
                        <ResultBadge result={alert.previous_result} />
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <ResultBadge result={alert.current_result} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{alert.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Detected: {new Date(alert.detected_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
            <Siren className="h-5 w-5 text-red-500" />
            Recent Security Incidents
          </CardTitle>
          <CardDescription className="text-slate-500">
            {DEMO_INCIDENTS.length} incidents tracked, {activeIncidents} currently active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide">
                    Severity
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide">
                    Incident
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide">
                    Category
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide">
                    Assigned To
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide">
                    Detected
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_INCIDENTS.map((incident) => (
                  <TableRow key={incident.id} className="border-slate-100 hover:bg-slate-50">
                    <TableCell>
                      <SeverityBadge severity={incident.severity} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {incident.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {incident.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-100 text-slate-700 text-xs capitalize">
                        {incident.category.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      {incident.assigned_to_name || 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-center">
                      <IncidentStatusBadge status={incident.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(incident.detected_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Run Control Checks
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Execute all {status.total_controls} security control checks against your current project configuration.
                </p>
                <a
                  href={`/projects/${projectId}/governance/security-controls`}
                  className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-medium"
                >
                  Open Security Controls
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  View Threat Model
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Review {threats.length} AI-specific threat vectors with risk scores and mitigation tracking.
                </p>
                <a
                  href={`/projects/${projectId}/governance/security-controls`}
                  className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-medium"
                >
                  Open Threat Model
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <FileBox className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Generate Evidence
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Create compliance evidence packages bundling controls, gates, and risk artifacts.
                </p>
                <a
                  href={`/projects/${projectId}/reports/evidence`}
                  className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-medium"
                >
                  Open Evidence Packages
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
