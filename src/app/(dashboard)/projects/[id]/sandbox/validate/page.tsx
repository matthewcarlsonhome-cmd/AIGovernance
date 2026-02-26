'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

/* ------------------------------------------------------------------ */
/*  Types matching the validation engine output                        */
/* ------------------------------------------------------------------ */

type CheckStatus = 'passed' | 'warning' | 'failed';

interface ValidationCheck {
  id: string;
  name: string;
  category: string;
  status: CheckStatus;
  details: string[];
  recommendation?: string;
}

interface ValidationRunResult {
  runId: string;
  projectId: string;
  validatedAt: string;
  overallStatus: 'passed' | 'warning' | 'failed';
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
  checks: ValidationCheck[];
}

/* ------------------------------------------------------------------ */
/*  Status config                                                      */
/* ------------------------------------------------------------------ */

const statusConfig = {
  passed: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    label: 'PASSED',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    label: 'WARNING',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-800',
    label: 'FAILED',
  },
};

const overallStatusConfig = {
  passed: { label: 'All Checks Passed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' },
  warning: { label: 'Warnings Detected', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300' },
  failed: { label: 'Action Required', color: 'text-red-700', bg: 'bg-red-50 border-red-300' },
};

/* ------------------------------------------------------------------ */
/*  Check card component                                               */
/* ------------------------------------------------------------------ */

function CheckCard({ check }: { check: ValidationCheck }) {
  const [expanded, setExpanded] = useState(check.status !== 'passed');
  const config = statusConfig[check.status];
  const Icon = config.icon;
  const ExpandIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <Card className={`border ${config.bg}`}>
      <CardContent className="pt-4 pb-4">
        <button
          className="flex items-start gap-3 w-full text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900">{check.name}</h3>
              <Badge className={config.badge}>{config.label}</Badge>
              <span className="text-xs text-slate-400 ml-auto">{check.category}</span>
            </div>
            {!expanded && check.details.length > 0 && (
              <p className="text-sm text-slate-500 mt-1 truncate">{check.details[0]}</p>
            )}
          </div>
          <ExpandIcon className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
        </button>

        {expanded && (
          <div className="ml-8 mt-3">
            <ul className="space-y-1">
              {check.details.map((d, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
            {check.recommendation && (
              <div className="mt-3 p-3 bg-white rounded-md border border-slate-200">
                <p className="text-sm font-medium text-slate-800">Recommendation:</p>
                <p className="text-sm text-slate-600 mt-1">{check.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Export validation report as JSON                                    */
/* ------------------------------------------------------------------ */

function downloadReport(result: ValidationRunResult) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sandbox-validation-${format(new Date(result.validatedAt), 'yyyy-MM-dd-HHmmss')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ValidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const queryClient = useQueryClient();
  const [rerunning, setRerunning] = useState(false);

  // Fetch validation results from the real API endpoint
  const { data: result, isLoading, error, refetch } = useQuery<ValidationRunResult | null>({
    queryKey: ['sandbox-validation', id],
    queryFn: async () => {
      const res = await fetch(`/api/configs/validate?projectId=${encodeURIComponent(id)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Validation failed (${res.status})`);
      }
      const json = await res.json();
      return json.data ?? null;
    },
    enabled: Boolean(id),
  });

  const handleRerun = async () => {
    setRerunning(true);
    try {
      // Invalidate the query and refetch from the API
      await queryClient.invalidateQueries({ queryKey: ['sandbox-validation', id] });
      await refetch();
    } finally {
      setRerunning(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-slate-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sandbox Validation</h1>
            <p className="text-slate-500 mt-1">Running environment checks...</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
            <p className="text-sm text-slate-500">Analyzing sandbox configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Sandbox Validation
            </h1>
          </div>
          <Button onClick={handleRerun} disabled={rerunning} className="bg-slate-900 text-white hover:bg-slate-800">
            <RefreshCw className={`h-4 w-4 mr-2 ${rerunning ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Validation Error</p>
                <p className="text-sm text-red-700 mt-1">{(error as Error).message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No results
  if (!result) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Sandbox Validation
            </h1>
            <p className="text-slate-500 mt-1">No validation results available</p>
          </div>
          <Button onClick={handleRerun} className="bg-slate-900 text-white hover:bg-slate-800">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Validation
          </Button>
        </div>
      </div>
    );
  }

  const overall = overallStatusConfig[result.overallStatus];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Sandbox Validation
          </h1>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Owned by: IT / Security Lead</span>
          <p className="text-slate-500 mt-1">
            Environment health checks for sandbox configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => downloadReport(result)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            onClick={handleRerun}
            disabled={rerunning}
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${rerunning ? 'animate-spin' : ''}`} />
            {rerunning ? 'Running...' : 'Re-run Validation'}
          </Button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <Card className={`border-2 ${overall.bg}`}>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {result.overallStatus === 'passed' && (
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              )}
              {result.overallStatus === 'warning' && (
                <AlertTriangle className="h-10 w-10 text-amber-600" />
              )}
              {result.overallStatus === 'failed' && (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
              <div>
                <h2 className={`text-xl font-bold ${overall.color}`}>
                  {overall.label}
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  {result.summary.total} checks evaluated
                </p>
              </div>
            </div>

            {/* Summary counters */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-lg font-semibold text-slate-900">
                  {result.summary.passed} Passed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-lg font-semibold text-slate-900">
                  {result.summary.warnings} Warning{result.summary.warnings !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-lg font-semibold text-slate-900">
                  {result.summary.failed} Failed
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-3 bg-white/60 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(result.summary.passed / result.summary.total) * 100}%` }}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${(result.summary.warnings / result.summary.total) * 100}%` }}
            />
            <div
              className="bg-red-500 h-full transition-all duration-500"
              style={{ width: `${(result.summary.failed / result.summary.total) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation metadata */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          Last run: {format(new Date(result.validatedAt), 'MMM d, yyyy \'at\' h:mm a')}
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" />
          Run ID: {result.runId.slice(0, 8)}
        </div>
      </div>

      {/* Failed checks first, then warnings, then passed */}
      {result.checks.filter((c) => c.status === 'failed').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider">
            Failed Checks ({result.checks.filter((c) => c.status === 'failed').length})
          </h3>
          {result.checks
            .filter((c) => c.status === 'failed')
            .map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
        </div>
      )}

      {result.checks.filter((c) => c.status === 'warning').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider">
            Warnings ({result.checks.filter((c) => c.status === 'warning').length})
          </h3>
          {result.checks
            .filter((c) => c.status === 'warning')
            .map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
        </div>
      )}

      {result.checks.filter((c) => c.status === 'passed').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
            Passed ({result.checks.filter((c) => c.status === 'passed').length})
          </h3>
          {result.checks
            .filter((c) => c.status === 'passed')
            .map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
        </div>
      )}
    </div>
  );
}
