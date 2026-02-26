'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MonitoringMetricsSnapshot, TrackedError, RoutePerformanceMetrics } from '@/lib/monitoring';

// ─────────────────────────────────────────────────────────────────────────────
// Role check — only admin users may view this page
// ─────────────────────────────────────────────────────────────────────────────

function useEffectiveRole(): string | null {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const override = localStorage.getItem('govai_user_role_override');
      setRole(override ?? 'admin'); // Default to admin in demo mode
    } catch {
      setRole('admin');
    }

    const handler = () => {
      try {
        const override = localStorage.getItem('govai_user_role_override');
        setRole(override ?? 'admin');
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('govai-role-change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('govai-role-change', handler);
    };
  }, []);

  return role;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-refresh hook
// ─────────────────────────────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 30_000;

function useMonitoringData() {
  const [data, setData] = useState<MonitoringMetricsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/monitoring/metrics');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `HTTP ${res.status}`);
        return;
      }
      const json = await res.json();
      setData(json.data ?? null);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = window.setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, lastRefresh, refresh: fetchData };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(' ');
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, subtext, variant = 'default' }: {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}) {
  const variantClasses = {
    default: 'border-slate-200',
    success: 'border-emerald-200',
    danger: 'border-red-200',
    warning: 'border-amber-200',
  };

  return (
    <div className={`rounded-lg border ${variantClasses[variant]} bg-white p-5 shadow-sm`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Row (expandable stack trace)
// ─────────────────────────────────────────────────────────────────────────────

function ErrorRow({ err }: { err: TrackedError }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200 ring-inset">
                {err.method}
              </span>
              <span className="text-sm font-mono text-slate-600 truncate">{err.route}</span>
            </div>
            <p className="mt-1 text-sm text-slate-800">{err.message}</p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs text-slate-400">{formatTimestamp(err.timestamp)}</span>
            {err.user_id && (
              <span className="text-xs text-slate-400 mt-0.5">User: {err.user_id}</span>
            )}
            <span className="text-xs text-slate-400 mt-1">{expanded ? '\u25B2' : '\u25BC'}</span>
          </div>
        </div>
      </button>
      {expanded && err.stack && (
        <div className="px-4 pb-3">
          <pre className="rounded-md bg-slate-900 p-3 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
            {err.stack}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Table
// ─────────────────────────────────────────────────────────────────────────────

function PerformanceTable({ routes }: { routes: RoutePerformanceMetrics[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Route</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">Requests</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">p50</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">p95</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">p99</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">Avg</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">Min</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">Max</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r) => (
            <tr key={r.route} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-2.5 px-4 font-mono text-slate-800">{r.route}</td>
              <td className="py-2.5 px-4 text-right text-slate-600">{r.request_count.toLocaleString()}</td>
              <td className="py-2.5 px-4 text-right text-slate-600">{formatMs(r.p50_ms)}</td>
              <td className="py-2.5 px-4 text-right text-slate-600">{formatMs(r.p95_ms)}</td>
              <td className="py-2.5 px-4 text-right font-medium text-slate-800">{formatMs(r.p99_ms)}</td>
              <td className="py-2.5 px-4 text-right text-slate-600">{formatMs(r.avg_ms)}</td>
              <td className="py-2.5 px-4 text-right text-emerald-600">{formatMs(r.min_ms)}</td>
              <td className="py-2.5 px-4 text-right text-red-600">{formatMs(r.max_ms)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Time Chart
// ─────────────────────────────────────────────────────────────────────────────

function ResponseTimeChart({ routes }: { routes: RoutePerformanceMetrics[] }) {
  // Show top 10 routes by request count for the chart
  const chartData = routes.slice(0, 10).map((r) => ({
    route: r.route.replace('/api/', ''),
    p50: r.p50_ms,
    p95: r.p95_ms,
    p99: r.p99_ms,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        No performance data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="route"
          tick={{ fontSize: 11, fill: '#64748b' }}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          label={{ value: 'ms', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number | undefined, name: string | undefined) => [`${(value ?? 0).toFixed(1)}ms`, (name ?? '').toUpperCase()]}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="p50" name="p50" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="p95" name="p95" fill="#f59e0b" radius={[2, 2, 0, 0]} />
        <Bar dataKey="p99" name="p99" fill="#ef4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Access Denied
// ─────────────────────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md text-center">
        The monitoring dashboard is restricted to Project Administrator users.
        Contact your organization administrator to request access.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MonitoringDashboardPage() {
  const role = useEffectiveRole();
  const { data, loading, error, lastRefresh, refresh } = useMonitoringData();

  // Show loading state until role is resolved
  if (role === null) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  // Role check
  if (role !== 'admin') {
    return <AccessDenied />;
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1">Loading monitoring data...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Monitoring</h1>
          <p className="text-sm text-red-500 mt-1">Failed to load metrics: {error}</p>
        </div>
        <button
          onClick={refresh}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const errorRate = data.total_requests > 0
    ? ((data.error_count / data.total_requests) * 100).toFixed(2)
    : '0.00';

  const errorRateNum = parseFloat(errorRate);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1">
            Application performance, error tracking, and API response time metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-slate-400">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Top-line Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Uptime"
          value={formatUptime(data.uptime_seconds)}
          subtext={`${data.uptime_seconds.toLocaleString()} seconds`}
          variant="success"
        />
        <StatCard
          label="Total Requests"
          value={data.total_requests.toLocaleString()}
          subtext="Since last restart"
        />
        <StatCard
          label="Total Errors"
          value={data.error_count}
          variant={data.error_count > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Error Rate"
          value={`${errorRate}%`}
          variant={errorRateNum > 5 ? 'danger' : errorRateNum > 1 ? 'warning' : 'success'}
          subtext={errorRateNum > 5 ? 'Above threshold' : 'Within acceptable range'}
        />
      </div>

      {/* Response Time Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Response Time by Route (ms)</h2>
        <p className="text-xs text-slate-400 mb-4">
          p50, p95, and p99 percentiles for the top routes by request volume
        </p>
        <ResponseTimeChart routes={data.performance.routes} />
      </div>

      {/* Per-Route Performance Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Route Performance</h2>
          <p className="text-xs text-slate-400 mt-1">
            Detailed response time percentiles and request counts per API route
          </p>
        </div>
        {data.performance.routes.length > 0 ? (
          <PerformanceTable routes={data.performance.routes} />
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            No performance data recorded yet. API requests will populate this table automatically.
          </div>
        )}
      </div>

      {/* Recent Errors */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Errors</h2>
              <p className="text-xs text-slate-400 mt-1">
                Last {data.recent_errors.length} captured errors with stack traces
              </p>
            </div>
            {data.recent_errors.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200 ring-inset">
                {data.recent_errors.length} error{data.recent_errors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {data.recent_errors.length > 0 ? (
          <div>
            {data.recent_errors.map((err) => (
              <ErrorRow key={err.id} err={err} />
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            No errors recorded. When API errors occur, they will appear here with full stack traces.
          </div>
        )}
      </div>

      {/* Auto-refresh notice */}
      <p className="text-xs text-slate-400 text-center">
        This dashboard auto-refreshes every 30 seconds. All data is in-memory and resets on server restart.
      </p>
    </div>
  );
}
