'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  BellOff,
  Brain,
  Check,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Eye,
  Gauge,
  HardDrive,
  Heart,
  Layers,
  Minus,
  Monitor,
  RefreshCw,
  Server,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type {
  MonitoringDashboard,
  MonitoringMetric,
  MonitoringAlert,
  DriftDetection,
  MonitoringTier,
  AlertSeverity,
} from '@/types';

/* -------------------------------------------------------------------------- */
/*  Demo Data                                                                  */
/* -------------------------------------------------------------------------- */

const DEMO_METRICS: MonitoringMetric[] = [
  // Executive tier
  { id: 'met-01', tier: 'executive', name: 'AI Health Score', value: 87, target: 90, unit: 'score', trend: 'up', status: 'healthy', last_updated: '2026-02-11T10:30:00Z' },
  { id: 'met-02', tier: 'executive', name: 'Total Metrics Tracked', value: 42, target: 50, unit: 'count', trend: 'up', status: 'healthy', last_updated: '2026-02-11T10:30:00Z' },
  { id: 'met-03', tier: 'executive', name: 'Models Monitored', value: 3, target: 3, unit: 'count', trend: 'stable', status: 'healthy', last_updated: '2026-02-11T10:30:00Z' },
  { id: 'met-04', tier: 'executive', name: 'Uptime', value: 99.7, target: 99.9, unit: '%', trend: 'stable', status: 'healthy', last_updated: '2026-02-11T10:30:00Z' },

  // Model Performance tier
  { id: 'met-05', tier: 'model_performance', name: 'Accuracy', value: 94.8, target: 95.0, unit: '%', trend: 'up', status: 'healthy', last_updated: '2026-02-11T10:00:00Z' },
  { id: 'met-06', tier: 'model_performance', name: 'Precision', value: 93.2, target: 93.0, unit: '%', trend: 'up', status: 'healthy', last_updated: '2026-02-11T10:00:00Z' },
  { id: 'met-07', tier: 'model_performance', name: 'Recall', value: 91.5, target: 92.0, unit: '%', trend: 'down', status: 'degraded', last_updated: '2026-02-11T10:00:00Z' },
  { id: 'met-08', tier: 'model_performance', name: 'F1 Score', value: 92.3, target: 93.0, unit: '%', trend: 'stable', status: 'healthy', last_updated: '2026-02-11T10:00:00Z' },

  // Operational tier
  { id: 'met-09', tier: 'operational', name: 'CPU Utilization', value: 68, target: 80, unit: '%', trend: 'up', status: 'healthy', last_updated: '2026-02-11T10:28:00Z' },
  { id: 'met-10', tier: 'operational', name: 'Memory Usage', value: 72, target: 85, unit: '%', trend: 'stable', status: 'healthy', last_updated: '2026-02-11T10:28:00Z' },
  { id: 'met-11', tier: 'operational', name: 'API Latency (P99)', value: 245, target: 200, unit: 'ms', trend: 'up', status: 'degraded', last_updated: '2026-02-11T10:28:00Z' },
  { id: 'met-12', tier: 'operational', name: 'Throughput', value: 1250, target: 1000, unit: 'req/s', trend: 'up', status: 'healthy', last_updated: '2026-02-11T10:28:00Z' },

  // Data Quality tier
  { id: 'met-13', tier: 'data_quality', name: 'Data Accuracy', value: 96, target: 98, unit: '%', trend: 'stable', status: 'healthy', last_updated: '2026-02-11T09:00:00Z' },
  { id: 'met-14', tier: 'data_quality', name: 'Completeness', value: 92, target: 95, unit: '%', trend: 'down', status: 'degraded', last_updated: '2026-02-11T09:00:00Z' },
  { id: 'met-15', tier: 'data_quality', name: 'Consistency', value: 97, target: 95, unit: '%', trend: 'up', status: 'healthy', last_updated: '2026-02-11T09:00:00Z' },
  { id: 'met-16', tier: 'data_quality', name: 'Timeliness', value: 88, target: 90, unit: '%', trend: 'down', status: 'degraded', last_updated: '2026-02-11T09:00:00Z' },
  { id: 'met-17', tier: 'data_quality', name: 'Validity', value: 99, target: 98, unit: '%', trend: 'stable', status: 'healthy', last_updated: '2026-02-11T09:00:00Z' },
  { id: 'met-18', tier: 'data_quality', name: 'Uniqueness', value: 94, target: 95, unit: '%', trend: 'up', status: 'healthy', last_updated: '2026-02-11T09:00:00Z' },

  // Business Impact tier
  { id: 'met-19', tier: 'business_impact', name: 'Developer Productivity', value: 37, target: 40, unit: '% lift', trend: 'up', status: 'healthy', last_updated: '2026-02-11T08:00:00Z' },
  { id: 'met-20', tier: 'business_impact', name: 'Code Review Time', value: 42, target: 50, unit: '% reduction', trend: 'up', status: 'healthy', last_updated: '2026-02-11T08:00:00Z' },
  { id: 'met-21', tier: 'business_impact', name: 'Bug Reduction', value: 28, target: 30, unit: '% reduction', trend: 'up', status: 'healthy', last_updated: '2026-02-11T08:00:00Z' },
];

const DEMO_ALERTS: MonitoringAlert[] = [
  { id: 'alert-01', severity: 'critical', metric_id: 'met-11', message: 'API Latency P99 exceeds 200ms SLO threshold', threshold: 200, current_value: 245, triggered_at: '2026-02-11T10:15:00Z', acknowledged: false },
  { id: 'alert-02', severity: 'warning', metric_id: 'met-14', message: 'Data completeness dropped below 95% target', threshold: 95, current_value: 92, triggered_at: '2026-02-11T09:30:00Z', acknowledged: false },
  { id: 'alert-03', severity: 'warning', metric_id: 'met-07', message: 'Model recall trending downward for 3 consecutive periods', threshold: 92, current_value: 91.5, triggered_at: '2026-02-11T10:05:00Z', acknowledged: true },
  { id: 'alert-04', severity: 'info', metric_id: 'met-09', message: 'CPU utilization approaching 70% — consider scaling review', threshold: 80, current_value: 68, triggered_at: '2026-02-11T10:20:00Z', acknowledged: false },
  { id: 'alert-05', severity: 'info', metric_id: 'met-16', message: 'Data timeliness below target — pipeline latency increased', threshold: 90, current_value: 88, triggered_at: '2026-02-11T09:45:00Z', acknowledged: true },
];

const DEMO_DRIFT_DETECTIONS: DriftDetection[] = [
  { id: 'drift-01', drift_type: 'data_drift', feature: 'code_complexity_score', score: 0.34, threshold: 0.25, detected_at: '2026-02-11T08:00:00Z', status: 'active' },
  { id: 'drift-02', drift_type: 'concept_drift', feature: 'defect_prediction_target', score: 0.18, threshold: 0.20, detected_at: '2026-02-10T14:00:00Z', status: 'resolved' },
  { id: 'drift-03', drift_type: 'feature_drift', feature: 'avg_pr_size', score: 0.29, threshold: 0.25, detected_at: '2026-02-11T06:00:00Z', status: 'investigating' },
];

const DEMO_DASHBOARD: MonitoringDashboard = {
  id: 'dash-001',
  project_id: 'proj-001',
  health_score: 87,
  metrics: DEMO_METRICS,
  alerts: DEMO_ALERTS,
  drift_detections: DEMO_DRIFT_DETECTIONS,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-02-11T10:30:00Z',
};

const ACCURACY_TREND = [
  { week: 'W1', accuracy: 0.92 },
  { week: 'W2', accuracy: 0.91 },
  { week: 'W3', accuracy: 0.93 },
  { week: 'W4', accuracy: 0.92 },
  { week: 'W5', accuracy: 0.94 },
  { week: 'W6', accuracy: 0.93 },
  { week: 'W7', accuracy: 0.95 },
];

const PERFORMANCE_SEGMENTS = [
  { segment: 'Code Generation', accuracy: 96.2, precision: 95.1, recall: 94.0, f1: 94.5 },
  { segment: 'Code Review', accuracy: 93.8, precision: 92.4, recall: 90.2, f1: 91.3 },
  { segment: 'Bug Detection', accuracy: 91.5, precision: 90.8, recall: 88.7, f1: 89.7 },
  { segment: 'Documentation', accuracy: 97.1, precision: 96.3, recall: 95.8, f1: 96.0 },
];

const SLI_SLO_DATA = [
  { name: 'Availability', sli: 99.7, slo: 99.9, unit: '%' },
  { name: 'Latency (P50)', sli: 85, slo: 100, unit: 'ms' },
  { name: 'Latency (P99)', sli: 245, slo: 200, unit: 'ms' },
  { name: 'Error Rate', sli: 0.3, slo: 0.5, unit: '%' },
  { name: 'Throughput', sli: 1250, slo: 1000, unit: 'req/s' },
];

const PIPELINE_HEALTH = [
  { name: 'Data Ingestion', status: 'healthy' as const, latency: '12ms', throughput: '850 events/s' },
  { name: 'Feature Engineering', status: 'healthy' as const, latency: '45ms', throughput: '420 batches/hr' },
  { name: 'Model Inference', status: 'degraded' as const, latency: '245ms', throughput: '1,250 req/s' },
  { name: 'Post-processing', status: 'healthy' as const, latency: '8ms', throughput: '1,200 req/s' },
  { name: 'Response Delivery', status: 'healthy' as const, latency: '15ms', throughput: '1,180 req/s' },
];

const ADOPTION_DATA = [
  { name: 'Active Users', value: 156, total: 200, unit: 'users' },
  { name: 'Daily Active', value: 89, total: 156, unit: 'users' },
  { name: 'Avg. Sessions/Day', value: 4.2, total: 6, unit: 'sessions' },
  { name: 'Feature Adoption', value: 73, total: 100, unit: '%' },
];

/* -------------------------------------------------------------------------- */
/*  Tier Tab Config                                                            */
/* -------------------------------------------------------------------------- */

type TierTab = {
  id: MonitoringTier;
  label: string;
  icon: React.ReactNode;
};

const TIER_TABS: TierTab[] = [
  { id: 'executive', label: 'Executive', icon: <Gauge className="h-4 w-4" /> },
  { id: 'model_performance', label: 'Model', icon: <Brain className="h-4 w-4" /> },
  { id: 'operational', label: 'Operations', icon: <Server className="h-4 w-4" /> },
  { id: 'data_quality', label: 'Data Quality', icon: <Database className="h-4 w-4" /> },
  { id: 'business_impact', label: 'Business', icon: <TrendingUp className="h-4 w-4" /> },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function relativeTime(ts: string): string {
  const now = new Date('2026-02-11T10:30:00Z');
  const then = new Date(ts);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function severityColor(s: AlertSeverity): string {
  switch (s) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}

function severityDotColor(s: AlertSeverity): string {
  switch (s) {
    case 'critical': return 'bg-red-500';
    case 'warning': return 'bg-amber-500';
    case 'info': return 'bg-blue-500';
  }
}

function statusColor(s: 'healthy' | 'degraded' | 'critical'): string {
  switch (s) {
    case 'healthy': return 'text-emerald-600';
    case 'degraded': return 'text-amber-600';
    case 'critical': return 'text-red-600';
  }
}

function statusBg(s: 'healthy' | 'degraded' | 'critical'): string {
  switch (s) {
    case 'healthy': return 'bg-emerald-50 border-emerald-200';
    case 'degraded': return 'bg-amber-50 border-amber-200';
    case 'critical': return 'bg-red-50 border-red-200';
  }
}

function trendIcon(t: 'up' | 'down' | 'stable'): React.ReactNode {
  switch (t) {
    case 'up': return <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />;
    case 'down': return <ArrowDown className="h-3.5 w-3.5 text-red-500" />;
    case 'stable': return <Minus className="h-3.5 w-3.5 text-slate-400" />;
  }
}

function healthScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 75) return 'text-amber-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
}

function healthScoreRingColor(score: number): string {
  if (score >= 90) return 'stroke-emerald-500';
  if (score >= 75) return 'stroke-amber-500';
  if (score >= 50) return 'stroke-orange-500';
  return 'stroke-red-500';
}

function healthScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Attention';
  return 'Critical';
}

function driftStatusColor(s: 'active' | 'resolved' | 'investigating'): string {
  switch (s) {
    case 'active': return 'bg-red-100 text-red-800 border-red-200';
    case 'resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'investigating': return 'bg-amber-100 text-amber-800 border-amber-200';
  }
}

function driftTypeLabel(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function HealthGauge({ score }: { score: number }): React.ReactElement {
  const circumference = 2 * Math.PI * 70;
  const progress = (score / 100) * circumference * 0.75; // 270-degree arc
  const offset = circumference - progress;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-[135deg]">
          {/* Background arc */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Foreground arc */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            className={healthScoreRingColor(score)}
            strokeWidth="12"
            strokeDasharray={`${progress} ${circumference - progress}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-5xl font-bold', healthScoreColor(score))}>{score}</span>
          <span className="text-sm text-slate-500 mt-1">{healthScoreLabel(score)}</span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: MonitoringMetric }): React.ReactElement {
  const pct = Math.min((metric.value / metric.target) * 100, 100);

  return (
    <Card className={cn('border', statusBg(metric.status))}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">{metric.name}</span>
          <div className="flex items-center gap-1">{trendIcon(metric.trend)}</div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn('text-2xl font-bold', statusColor(metric.status))}>
            {metric.value}
          </span>
          <span className="text-sm text-slate-500">{metric.unit}</span>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Target: {metric.target}{metric.unit}</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200">
            <div
              className={cn(
                'h-1.5 rounded-full transition-all',
                metric.status === 'healthy' ? 'bg-emerald-500' : metric.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500',
              )}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertRow({
  alert,
  onAcknowledge,
}: {
  alert: MonitoringAlert;
  onAcknowledge: (id: string) => void;
}): React.ReactElement {
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-3', alert.acknowledged ? 'opacity-60' : '')}>
      <div className={cn('mt-0.5 h-2.5 w-2.5 rounded-full shrink-0', severityDotColor(alert.severity))} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border', severityColor(alert.severity))}>
            {alert.severity}
          </span>
          <span className="text-xs text-slate-400">{relativeTime(alert.triggered_at)}</span>
        </div>
        <p className="text-sm text-slate-700 leading-snug">{alert.message}</p>
        <p className="text-xs text-slate-400 mt-1">
          Value: {alert.current_value} | Threshold: {alert.threshold}
        </p>
      </div>
      <div className="shrink-0">
        {alert.acknowledged ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Check className="h-3 w-3" /> Ack
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 border-slate-300"
            onClick={() => onAcknowledge(alert.id)}
          >
            <BellOff className="h-3 w-3 mr-1" />
            Acknowledge
          </Button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tier Panels                                                                */
/* -------------------------------------------------------------------------- */

function ExecutiveTier({
  dashboard,
}: {
  dashboard: MonitoringDashboard;
}): React.ReactElement {
  const alertsBySeverity = dashboard.alerts.reduce(
    (acc, a) => {
      acc[a.severity] = (acc[a.severity] || 0) + 1;
      return acc;
    },
    {} as Record<AlertSeverity, number>,
  );

  const execMetrics = dashboard.metrics.filter((m) => m.tier === 'executive');

  return (
    <div className="space-y-6">
      {/* Health Score + Alert Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge */}
        <Card className="border border-slate-200 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              AI Health Score
            </CardTitle>
            <CardDescription className="text-slate-500">
              Composite score across all monitoring tiers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <HealthGauge score={dashboard.health_score} />
          </CardContent>
        </Card>

        {/* Alert Summary */}
        <Card className="border border-slate-200 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Active Alerts
            </CardTitle>
            <CardDescription className="text-slate-500">
              Alerts by severity level
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Critical</span>
              </div>
              <span className="text-2xl font-bold text-red-700">{alertsBySeverity.critical || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Warning</span>
              </div>
              <span className="text-2xl font-bold text-amber-700">{alertsBySeverity.warning || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Info</span>
              </div>
              <span className="text-2xl font-bold text-blue-700">{alertsBySeverity.info || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="border border-slate-200 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              System Overview
            </CardTitle>
            <CardDescription className="text-slate-500">
              Key operational indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {execMetrics.slice(1).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  {m.name === 'Total Metrics Tracked' && <BarChart3 className="h-5 w-5 text-indigo-500" />}
                  {m.name === 'Models Monitored' && <Brain className="h-5 w-5 text-violet-500" />}
                  {m.name === 'Uptime' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                  <div>
                    <p className="text-sm font-medium text-slate-700">{m.name}</p>
                    <p className="text-xs text-slate-400">Target: {m.target}{m.unit === '%' ? '%' : ` ${m.unit}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900">
                    {m.value}{m.unit === '%' ? '%' : ''}
                  </span>
                  {trendIcon(m.trend)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick status bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Model Performance', icon: <Brain className="h-4 w-4" />, status: 'healthy' as const },
          { label: 'Infrastructure', icon: <Server className="h-4 w-4" />, status: 'degraded' as const },
          { label: 'Data Pipeline', icon: <Database className="h-4 w-4" />, status: 'healthy' as const },
          { label: 'Business KPIs', icon: <TrendingUp className="h-4 w-4" />, status: 'healthy' as const },
        ].map((item) => (
          <div
            key={item.label}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3',
              statusBg(item.status),
            )}
          >
            <div className={cn('p-2 rounded-md', item.status === 'healthy' ? 'bg-emerald-100' : item.status === 'degraded' ? 'bg-amber-100' : 'bg-red-100')}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{item.label}</p>
              <p className={cn('text-xs font-medium capitalize', statusColor(item.status))}>{item.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelPerformanceTier({
  metrics,
}: {
  metrics: MonitoringMetric[];
}): React.ReactElement {
  const modelMetrics = metrics.filter((m) => m.tier === 'model_performance');

  return (
    <div className="space-y-6">
      {/* Key metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modelMetrics.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy trend chart */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900">Accuracy Trend</CardTitle>
            <CardDescription className="text-slate-500">
              Weekly model accuracy over the past 7 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ACCURACY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis
                    domain={[0.88, 0.98]}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) => [`${((v ?? 0) * 100).toFixed(1)}%`, 'Accuracy']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ fill: '#4f46e5', r: 4 }}
                    activeDot={{ r: 6, fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance by segment */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900">Performance by Segment</CardTitle>
            <CardDescription className="text-slate-500">
              Model accuracy across different use cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-500">Segment</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-500">Accuracy</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-500">Precision</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-500">Recall</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-500">F1</th>
                  </tr>
                </thead>
                <tbody>
                  {PERFORMANCE_SEGMENTS.map((seg) => (
                    <tr key={seg.segment} className="border-b border-slate-100">
                      <td className="py-2.5 px-3 font-medium text-slate-700">{seg.segment}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{seg.accuracy}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{seg.precision}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{seg.recall}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{seg.f1}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OperationalTier({
  metrics,
}: {
  metrics: MonitoringMetric[];
}): React.ReactElement {
  const opMetrics = metrics.filter((m) => m.tier === 'operational');

  return (
    <div className="space-y-6">
      {/* Infrastructure metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {opMetrics.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLI / SLO Status */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              SLI / SLO Status
            </CardTitle>
            <CardDescription className="text-slate-500">
              Service level indicators vs objectives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SLI_SLO_DATA.map((slo) => {
              // For latency, lower is better
              const isLatency = slo.name.toLowerCase().includes('latency');
              const isErrorRate = slo.name.toLowerCase().includes('error');
              const lowerIsBetter = isLatency || isErrorRate;

              const met = lowerIsBetter ? slo.sli <= slo.slo : slo.sli >= slo.slo;
              const pct = lowerIsBetter
                ? Math.min(((slo.slo / slo.sli) * 100), 100)
                : Math.min(((slo.sli / slo.slo) * 100), 100);

              return (
                <div key={slo.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{slo.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-semibold', met ? 'text-emerald-600' : 'text-red-600')}>
                        {slo.sli}{slo.unit === '%' ? '%' : ` ${slo.unit}`}
                      </span>
                      <span className="text-xs text-slate-400">
                        / {slo.slo}{slo.unit === '%' ? '%' : ` ${slo.unit}`}
                      </span>
                      {met ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        met ? 'bg-emerald-500' : 'bg-red-500',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Pipeline Health */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-500" />
              Pipeline Health
            </CardTitle>
            <CardDescription className="text-slate-500">
              End-to-end processing pipeline status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PIPELINE_HEALTH.map((stage, idx) => (
              <div key={stage.name} className="flex items-center gap-3">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border',
                  stage.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{stage.name}</span>
                    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border', stage.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                      {stage.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-0.5">
                    <span className="text-xs text-slate-400">Latency: {stage.latency}</span>
                    <span className="text-xs text-slate-400">Throughput: {stage.throughput}</span>
                  </div>
                </div>
                {idx < PIPELINE_HEALTH.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-300 shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DataQualityTier({
  metrics,
  driftDetections,
}: {
  metrics: MonitoringMetric[];
  driftDetections: DriftDetection[];
}): React.ReactElement {
  const dqMetrics = metrics.filter((m) => m.tier === 'data_quality');
  const featureStoreReadiness = 82;

  return (
    <div className="space-y-6">
      {/* Quality dimensions as horizontal bars */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <Database className="h-5 w-5 text-teal-500" />
            Data Quality Dimensions
          </CardTitle>
          <CardDescription className="text-slate-500">
            Score vs target for each quality dimension
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dqMetrics.map((m) => ({
                  name: m.name.replace('Data ', ''),
                  score: m.value,
                  target: m.target,
                }))}
                layout="vertical"
                margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
                <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]} barSize={18}>
                  {dqMetrics.map((m) => (
                    <Cell
                      key={m.id}
                      fill={m.value >= m.target ? '#10b981' : m.value >= m.target * 0.95 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="target" name="Target" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Store Readiness */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-indigo-500" />
              Feature Store Readiness
            </CardTitle>
            <CardDescription className="text-slate-500">
              Overall readiness score for AI feature serving
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="8"
                    strokeDasharray={`${(featureStoreReadiness / 100) * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{featureStoreReadiness}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {[
                  { label: 'Schema Registry', pct: 95, color: 'bg-emerald-500' },
                  { label: 'Feature Serving', pct: 88, color: 'bg-indigo-500' },
                  { label: 'Data Freshness', pct: 76, color: 'bg-amber-500' },
                  { label: 'Monitoring', pct: 70, color: 'bg-violet-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="text-slate-500">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <div className={cn('h-1.5 rounded-full', item.color)} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Drift Detection */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Drift Detection
            </CardTitle>
            <CardDescription className="text-slate-500">
              Detected data, concept, and feature drift
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {driftDetections.map((d) => {
              const exceeded = d.score > d.threshold;
              return (
                <div key={d.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border', driftStatusColor(d.status))}>
                        {d.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{driftTypeLabel(d.drift_type)}</span>
                    </div>
                    <span className="text-xs text-slate-400">{relativeTime(d.detected_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1.5">
                    Feature: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">{d.feature}</code>
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Score: <span className={cn('font-semibold', exceeded ? 'text-red-600' : 'text-emerald-600')}>{d.score.toFixed(2)}</span></span>
                        <span className="text-slate-400">Threshold: {d.threshold.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 relative">
                        <div
                          className={cn('h-1.5 rounded-full', exceeded ? 'bg-red-500' : 'bg-emerald-500')}
                          style={{ width: `${Math.min((d.score / (d.threshold * 2)) * 100, 100)}%` }}
                        />
                        <div
                          className="absolute top-0 h-1.5 w-0.5 bg-slate-600"
                          style={{ left: `${(d.threshold / (d.threshold * 2)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BusinessImpactTier({
  metrics,
}: {
  metrics: MonitoringMetric[];
}): React.ReactElement {
  const bizMetrics = metrics.filter((m) => m.tier === 'business_impact');

  const roiSummary = {
    monthlyROI: 47200,
    annualROI: 566400,
    paybackMonths: 4.2,
    currentROI: 312,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bizMetrics.map((m) => (
          <Card key={m.id} className={cn('border', statusBg(m.status))}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">{m.name}</span>
                {trendIcon(m.trend)}
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className={cn('text-3xl font-bold', statusColor(m.status))}>{m.value}</span>
                <span className="text-sm text-slate-500">{m.unit}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Target: {m.target}{m.unit}</span>
                  <span>{((m.value / m.target) * 100).toFixed(0)}% of goal</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className={cn(
                      'h-2 rounded-full',
                      m.value >= m.target ? 'bg-emerald-500' : 'bg-amber-500',
                    )}
                    style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Tracking */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              ROI Tracking
            </CardTitle>
            <CardDescription className="text-slate-500">
              Return on AI investment summary
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Monthly Savings', value: `$${roiSummary.monthlyROI.toLocaleString()}`, sublabel: 'vs. baseline', icon: <TrendingUp className="h-4 w-4 text-emerald-500" /> },
                { label: 'Annual ROI', value: `$${roiSummary.annualROI.toLocaleString()}`, sublabel: 'projected', icon: <BarChart3 className="h-4 w-4 text-indigo-500" /> },
                { label: 'Payback Period', value: `${roiSummary.paybackMonths} mo`, sublabel: 'time to break even', icon: <Clock className="h-4 w-4 text-violet-500" /> },
                { label: 'Current ROI', value: `${roiSummary.currentROI}%`, sublabel: '3-year projected', icon: <Gauge className="h-4 w-4 text-teal-500" /> },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <span className="text-xs font-medium text-slate-500">{item.label}</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.sublabel}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Adoption */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              User Adoption
            </CardTitle>
            <CardDescription className="text-slate-500">
              AI tool adoption and usage metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {ADOPTION_DATA.map((item) => {
              const pct = (item.value / item.total) * 100;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">{item.value}</span>
                      <span className="text-xs text-slate-400">/ {item.total} {item.unit}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function MonitoringPage(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<MonitoringTier>('executive');
  const [dashboard, setDashboard] = React.useState<MonitoringDashboard>(DEMO_DASHBOARD);

  const handleAcknowledgeAlert = React.useCallback((alertId: string) => {
    setDashboard((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a,
      ),
    }));
  }, []);

  const unacknowledgedCount = dashboard.alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Monitor className="h-7 w-7 text-indigo-600" />
              AI Performance Monitoring
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              5-tier monitoring dashboard — real-time visibility into AI system health
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5" />
              Last updated: {formatTimestamp(dashboard.updated_at)}
            </div>
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tier Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
          {TIER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Tier Content */}
          <div className="xl:col-span-3">
            {activeTab === 'executive' && <ExecutiveTier dashboard={dashboard} />}
            {activeTab === 'model_performance' && <ModelPerformanceTier metrics={dashboard.metrics} />}
            {activeTab === 'operational' && <OperationalTier metrics={dashboard.metrics} />}
            {activeTab === 'data_quality' && (
              <DataQualityTier metrics={dashboard.metrics} driftDetections={dashboard.drift_detections} />
            )}
            {activeTab === 'business_impact' && <BusinessImpactTier metrics={dashboard.metrics} />}
          </div>

          {/* Alert Panel (Sidebar) */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="border border-slate-200 sticky top-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    Alerts
                  </CardTitle>
                  {unacknowledgedCount > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                      {unacknowledgedCount}
                    </span>
                  )}
                </div>
                <CardDescription className="text-slate-500 text-xs">
                  {dashboard.alerts.length} total, {unacknowledgedCount} unacknowledged
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[480px] overflow-y-auto">
                {dashboard.alerts
                  .sort((a, b) => {
                    const order: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
                    if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
                    return order[a.severity] - order[b.severity];
                  })
                  .map((alert) => (
                    <AlertRow
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledgeAlert}
                    />
                  ))}
              </CardContent>
            </Card>

            {/* Drift Summary */}
            <Card className="border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-orange-500" />
                  Drift Summary
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Active drift detections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {dashboard.drift_detections.map((d) => (
                  <div key={d.id} className="rounded-md border border-slate-200 p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border', driftStatusColor(d.status))}>
                        {d.status}
                      </span>
                      <span className="text-xs text-slate-400">{driftTypeLabel(d.drift_type)}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-600 truncate">{d.feature}</p>
                    <div className="flex items-center justify-between mt-1.5 text-xs">
                      <span className={cn('font-semibold', d.score > d.threshold ? 'text-red-600' : 'text-emerald-600')}>
                        {d.score.toFixed(2)}
                      </span>
                      <span className="text-slate-400">threshold: {d.threshold.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
