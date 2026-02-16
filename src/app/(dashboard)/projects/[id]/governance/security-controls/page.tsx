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
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import type { SecurityControlStatus, ThreatModelItem, ControlCheckCategory } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Demo input configuration                                                   */
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
/*  Category display names & icons                                             */
/* -------------------------------------------------------------------------- */

const CATEGORY_LABELS: Record<ControlCheckCategory, string> = {
  auth: 'Authentication & Authorization',
  secrets: 'Secrets Management',
  model_config: 'Model / Provider Configuration',
  logging: 'Logging & Audit',
  egress: 'Egress Restrictions',
  storage: 'Storage Security',
  data_retention: 'Data Retention',
  access_control: 'Access Control / RBAC',
  encryption: 'Encryption',
};

/* -------------------------------------------------------------------------- */
/*  Helper: result badge                                                       */
/* -------------------------------------------------------------------------- */

function ResultBadge({ result }: { result: string }): React.ReactElement {
  switch (result) {
    case 'pass':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Pass
        </Badge>
      );
    case 'fail':
      return (
        <Badge className="bg-red-100 text-red-800 border border-red-200">
          <XCircle className="mr-1 h-3 w-3" />
          Fail
        </Badge>
      );
    case 'warning':
      return (
        <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Warning
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-100 text-slate-600 border border-slate-200">
          {result}
        </Badge>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*  Helper: risk tier badge for threats                                        */
/* -------------------------------------------------------------------------- */

function RiskTierBadge({ tier }: { tier: string }): React.ReactElement {
  const styles: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  return (
    <Badge className={cn('border capitalize', styles[tier] || 'bg-slate-100 text-slate-600')}>
      {tier}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helper: mitigation status badge                                            */
/* -------------------------------------------------------------------------- */

function MitigationBadge({ status }: { status: string }): React.ReactElement {
  const styles: Record<string, string> = {
    open: 'bg-red-100 text-red-800',
    mitigated: 'bg-emerald-100 text-emerald-800',
    accepted: 'bg-slate-100 text-slate-600',
    transferred: 'bg-blue-100 text-blue-800',
  };
  return (
    <Badge className={cn('capitalize', styles[status] || 'bg-slate-100 text-slate-600')}>
      {status}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helper: threat category display name                                       */
/* -------------------------------------------------------------------------- */

const THREAT_CATEGORY_LABELS: Record<string, string> = {
  prompt_injection: 'Prompt Injection',
  data_exfiltration: 'Data Exfiltration',
  over_permissioned_tools: 'Over-Permissioned Tools',
  unsafe_output: 'Unsafe Output',
  model_poisoning: 'Model Poisoning',
  denial_of_service: 'Denial of Service',
  supply_chain: 'Supply Chain',
  privacy_violation: 'Privacy Violation',
};

/* -------------------------------------------------------------------------- */
/*  Ring Chart (pure CSS)                                                      */
/* -------------------------------------------------------------------------- */

function RingChart({
  passed,
  failed,
  warnings,
  total,
}: {
  passed: number;
  failed: number;
  warnings: number;
  total: number;
}): React.ReactElement {
  const passPercent = total > 0 ? (passed / total) * 100 : 0;
  const failPercent = total > 0 ? (failed / total) * 100 : 0;
  const warnPercent = total > 0 ? (warnings / total) * 100 : 0;

  // SVG ring segments
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const passLength = (passPercent / 100) * circumference;
  const failLength = (failPercent / 100) * circumference;
  const warnLength = (warnPercent / 100) * circumference;
  const otherLength = circumference - passLength - failLength - warnLength;

  const passOffset = 0;
  const failOffset = passLength;
  const warnOffset = passLength + failLength;
  const otherOffset = passLength + failLength + warnLength;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="20"
          />
          {/* Pass segment */}
          {passLength > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="20"
              strokeDasharray={`${passLength} ${circumference - passLength}`}
              strokeDashoffset={-passOffset}
              transform="rotate(-90 80 80)"
              strokeLinecap="butt"
            />
          )}
          {/* Fail segment */}
          {failLength > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="20"
              strokeDasharray={`${failLength} ${circumference - failLength}`}
              strokeDashoffset={-failOffset}
              transform="rotate(-90 80 80)"
              strokeLinecap="butt"
            />
          )}
          {/* Warning segment */}
          {warnLength > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="20"
              strokeDasharray={`${warnLength} ${circumference - warnLength}`}
              strokeDashoffset={-warnOffset}
              transform="rotate(-90 80 80)"
              strokeLinecap="butt"
            />
          )}
          {/* Other / N/A segment */}
          {otherLength > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="20"
              strokeDasharray={`${otherLength} ${circumference - otherLength}`}
              strokeDashoffset={-otherOffset}
              transform="rotate(-90 80 80)"
              strokeLinecap="butt"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">Controls</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-slate-700">Pass: {passed}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-slate-700">Fail: {failed}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-slate-700">Warning: {warnings}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <span className="text-slate-700">N/A: {total - passed - failed - warnings}</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Collapsible Category Group                                                 */
/* -------------------------------------------------------------------------- */

function CategoryGroup({
  category,
  checks,
}: {
  category: ControlCheckCategory;
  checks: SecurityControlStatus['checks'];
}): React.ReactElement {
  const [expanded, setExpanded] = useState(true);
  const categoryChecks = checks.filter((c) => c.category === category);
  if (categoryChecks.length === 0) return <></>;

  const passCount = categoryChecks.filter((c) => c.result === 'pass').length;
  const failCount = categoryChecks.filter((c) => c.result === 'fail').length;
  const warnCount = categoryChecks.filter((c) => c.result === 'warning').length;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          )}
          <span className="font-semibold text-slate-900">
            {CATEGORY_LABELS[category]}
          </span>
          <span className="text-xs text-slate-500">
            ({categoryChecks.length} controls)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {passCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle className="h-3 w-3" />
              {passCount}
            </span>
          )}
          {failCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
              <XCircle className="h-3 w-3" />
              {failCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              <AlertTriangle className="h-3 w-3" />
              {warnCount}
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-slate-100">
          {categoryChecks.map((check) => (
            <div key={check.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {check.control_id}
                    </code>
                    <span className="font-medium text-slate-900 text-sm">
                      {check.control_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{check.description}</p>
                  {check.evidence_details && (
                    <div className="text-xs text-slate-600 bg-slate-50 rounded px-3 py-2 mb-2">
                      <span className="font-medium text-slate-700">Evidence:</span>{' '}
                      {check.evidence_details}
                    </div>
                  )}
                  {check.remediation && check.result !== 'pass' && (
                    <div className="text-xs text-red-700 bg-red-50 rounded px-3 py-2">
                      <span className="font-medium">Remediation:</span>{' '}
                      {check.remediation}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <ResultBadge result={check.result} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function SecurityControlsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: projectId } = React.use(params);

  const [status, setStatus] = useState<SecurityControlStatus>(() =>
    runSecurityControlChecks({ ...DEMO_INPUT, project_id: projectId }),
  );
  const [threats] = useState<ThreatModelItem[]>(() =>
    getDefaultThreatModel(projectId),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string>(
    status.last_run_at || new Date().toISOString(),
  );

  const handleRunChecks = (): void => {
    setIsRunning(true);
    // Simulate a brief delay for the check run
    setTimeout(() => {
      const newStatus = runSecurityControlChecks({
        ...DEMO_INPUT,
        project_id: projectId,
      });
      setStatus(newStatus);
      setLastRunTime(newStatus.last_run_at || new Date().toISOString());
      setIsRunning(false);
    }, 800);
  };

  const allCategories = useMemo(() => {
    const cats = new Set<ControlCheckCategory>();
    for (const check of status.checks) {
      cats.add(check.category);
    }
    return Array.from(cats);
  }, [status.checks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-slate-700" />
            Security Control Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated security control checks and AI-specific threat model for your project.
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

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Controls
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{status.total_controls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Passed
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{status.passed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldX className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
                Failed
              </span>
            </div>
            <p className="text-2xl font-bold text-red-700">{status.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                Warnings
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-700">{status.warnings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                Pass Rate
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{status.pass_rate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Ring Chart + Last Run */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Control Distribution</CardTitle>
            <CardDescription className="text-slate-500">
              Pass/fail/warning breakdown across all {status.total_controls} controls
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <RingChart
              passed={status.passed}
              failed={status.failed}
              warnings={status.warnings}
              total={status.total_controls}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Category Summary</CardTitle>
            <CardDescription className="text-slate-500">
              Control results grouped by security category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allCategories.map((cat) => {
                const catData = status.by_category[cat];
                if (!catData) return null;
                const catPassRate =
                  catData.total > 0
                    ? Math.round((catData.passed / catData.total) * 100)
                    : 0;
                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-slate-50"
                  >
                    <span className="text-slate-700 font-medium">
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {catData.passed}/{catData.total} passed
                      </span>
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            catPassRate >= 80
                              ? 'bg-emerald-500'
                              : catPassRate >= 50
                                ? 'bg-amber-500'
                                : 'bg-red-500',
                          )}
                          style={{ width: `${catPassRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
              Last run: {new Date(lastRunTime).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Checks by Category */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Control Checks by Category
        </h2>
        <div className="space-y-3">
          {allCategories.map((cat) => (
            <CategoryGroup key={cat} category={cat} checks={status.checks} />
          ))}
        </div>
      </div>

      {/* AI Threat Model */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            AI Threat Model
          </CardTitle>
          <CardDescription className="text-slate-500">
            LLM-specific threats covering {threats.length} identified threat vectors across{' '}
            {new Set(threats.map((t) => t.category)).size} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide">
                    Category
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide">
                    Threat
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide text-center">
                    Likelihood
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide text-center">
                    Impact
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide text-center">
                    Risk Score
                  </TableHead>
                  <TableHead className="text-slate-600 text-xs uppercase tracking-wide text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threats.map((threat) => (
                  <TableRow key={threat.id} className="border-slate-100 hover:bg-slate-50">
                    <TableCell className="text-xs font-medium text-slate-700">
                      {THREAT_CATEGORY_LABELS[threat.category] || threat.category}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {threat.threat_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {threat.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <RiskTierBadge tier={threat.likelihood} />
                    </TableCell>
                    <TableCell className="text-center">
                      <RiskTierBadge tier={threat.impact} />
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold',
                          threat.risk_score >= 12
                            ? 'bg-red-100 text-red-800'
                            : threat.risk_score >= 6
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800',
                        )}
                      >
                        {threat.risk_score}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <MitigationBadge status={threat.mitigation_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
