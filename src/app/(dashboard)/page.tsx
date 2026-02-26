'use client';

import Link from 'next/link';
import {
  FolderKanban,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Plus,
  AlertCircle,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/use-projects';
import { useHealth } from '@/hooks/use-health';
import type { Project } from '@/types';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Score ring component                                               */
/* ------------------------------------------------------------------ */

function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75
      ? 'text-emerald-500'
      : score >= 50
        ? 'text-amber-500'
        : 'text-red-500';

  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-200"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {score}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Health score badge                                                 */
/* ------------------------------------------------------------------ */

function HealthBadge({ score }: { score: number | undefined }) {
  if (!score) {
    return (
      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-400 border-slate-200">
        Not scored yet
      </Badge>
    );
  }
  if (score >= 75) {
    return (
      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
        <ArrowUpRight className="h-3 w-3 mr-0.5" />
        On Track
      </Badge>
    );
  }
  if (score >= 50) {
    return (
      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
        <Minus className="h-3 w-3 mr-0.5" />
        Needs Attention
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
      <ArrowDownRight className="h-3 w-3 mr-0.5" />
      At Risk
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase badge helpers                                                */
/* ------------------------------------------------------------------ */

const phaseColors: Record<string, string> = {
  discovery: 'bg-amber-100 text-amber-800',
  governance: 'bg-purple-100 text-purple-800',
  sandbox: 'bg-emerald-100 text-emerald-800',
  poc: 'bg-blue-100 text-blue-800',
  pilot: 'bg-blue-100 text-blue-800',
  evaluation: 'bg-indigo-100 text-indigo-800',
  production: 'bg-green-100 text-green-800',
  completed: 'bg-slate-100 text-slate-800',
  on_hold: 'bg-gray-100 text-gray-600',
};

function getPhaseLabel(status: string): string {
  const labels: Record<string, string> = {
    discovery: 'Discovery',
    governance: 'Governance',
    sandbox: 'Sandbox',
    poc: 'Pilot',
    pilot: 'Pilot',
    evaluation: 'Evaluating',
    production: 'Production',
    completed: 'Completed',
    on_hold: 'On Hold',
  };
  return labels[status] || status;
}

/* ------------------------------------------------------------------ */
/*  Trend arrow helper                                                 */
/* ------------------------------------------------------------------ */

function TrendIndicator({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center text-xs text-emerald-600">
        <TrendingUp className="h-3 w-3 mr-0.5" />
        +{value}{suffix}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center text-xs text-red-600">
        <TrendingDown className="h-3 w-3 mr-0.5" />
        {value}{suffix}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs text-slate-500">
      <Minus className="h-3 w-3 mr-0.5" />
      No change
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Status distribution chart                                          */
/* ------------------------------------------------------------------ */

const STATUS_CHART_COLORS: Record<string, string> = {
  Discovery: '#f59e0b',
  Governance: '#a855f7',
  Sandbox: '#10b981',
  Pilot: '#3b82f6',
  Evaluating: '#6366f1',
  Production: '#22c55e',
  Completed: '#94a3b8',
};

function StatusDistributionChart({ projects }: { projects: Project[] }) {
  const distribution = projects.reduce<Record<string, number>>((acc, p) => {
    const label = getPhaseLabel(p.status);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(distribution).map(([name, count]) => ({
    name,
    count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-sm text-slate-400">
        <BarChart className="h-8 w-8 text-slate-200 mb-2" />
        <span>No data to display</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={STATUS_CHART_COLORS[entry.name] || '#94a3b8'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-7 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-100 rounded mt-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><div className="h-4 w-24 bg-slate-100 rounded" /></CardHeader>
            <CardContent><div className="h-8 w-16 bg-slate-200 rounded" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-48">
            <CardHeader><div className="h-5 w-40 bg-slate-100 rounded" /></CardHeader>
            <CardContent><div className="h-4 w-full bg-slate-100 rounded" /></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Setup status banner                                                */
/* ------------------------------------------------------------------ */

function SetupStatusBanner() {
  const { data: health, isLoading } = useHealth();

  if (isLoading || !health) return null;
  if (health.status === 'healthy') return null;

  const checks = [
    { label: 'Database connected', ok: health.database_connected },
    { label: 'Authentication working', ok: health.auth_working },
    { label: 'Service role key configured', ok: health.service_role_configured },
    { label: 'User profile created', ok: health.user_profile_exists },
    { label: 'Organization exists', ok: health.organization_exists },
  ];

  const failedChecks = checks.filter((c) => !c.ok);

  if (failedChecks.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              Setup incomplete. {failedChecks.length} item{failedChecks.length !== 1 ? 's' : ''} remaining
            </p>
            <ul className="mt-2 space-y-1">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-sm">
                  {c.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span className={c.ok ? 'text-slate-600' : 'text-amber-800 font-medium'}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
            {!health.service_role_configured && (
              <p className="text-xs text-amber-700 mt-3">
                Add <code className="bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to
                your <code className="bg-amber-100 px-1 rounded">.env.local</code> file to fix RLS policy issues.
                Find it in your Supabase project settings under API keys.
              </p>
            )}
            {health.user_email && (
              <p className="text-xs text-slate-500 mt-2">
                Logged in as: {health.user_email}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <DashboardSkeleton />;

  // Treat errors as empty state (e.g., RLS issues, first-time setup)
  if (error) {
    return (
      <div className="space-y-8">
        <SetupStatusBanner />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome</h1>
            <p className="text-slate-500">Create your first project to begin</p>
          </div>
          <Link href="/projects/new/onboarding">
            <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
        <Card className="p-12 text-center border-dashed border-2 border-slate-200">
          <div className="relative inline-block mb-4">
            <FolderKanban className="h-16 w-16 text-slate-300 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Get Started</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Your AI governance journey starts with a single project. From readiness assessments
            to sandbox configs to production rollout &mdash; we&apos;ll guide you every step of the way.
          </p>
          <Link href="/projects/new/onboarding" className="mt-6 inline-block">
            <Button size="lg" className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
              <Plus className="h-5 w-5" />
              Create Your First Project
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const projectList = projects || [];
  const activeProjects = projectList.filter(
    (p) => p.status !== 'completed',
  );
  const scoredProjects = projectList.filter(
    (p): p is Project & { feasibility_score: number } =>
      typeof p.feasibility_score === 'number' && p.feasibility_score > 0,
  );
  const avgScore =
    scoredProjects.length > 0
      ? Math.round(
          scoredProjects.reduce((sum, p) => sum + p.feasibility_score, 0) /
            scoredProjects.length,
        )
      : 0;
  const pendingActions = projectList.filter(
    (p) => p.status === 'discovery' || p.status === 'governance',
  ).length;

  const stats = [
    {
      label: 'Active Projects',
      value: String(projectList.length),
      icon: FolderKanban,
      change: `${activeProjects.length} currently active`,
      trend: activeProjects.length,
    },
    {
      label: 'Assessments Complete',
      value: String(scoredProjects.length),
      icon: FileCheck,
      change: projectList.length - scoredProjects.length > 0 ? `${projectList.length - scoredProjects.length} pending assessment` : 'All scored',
      trend: scoredProjects.length,
    },
    {
      label: 'Avg. Readiness Score',
      value: avgScore > 0 ? `${avgScore}%` : '--',
      icon: TrendingUp,
      change: avgScore >= 70 ? 'Above threshold' : avgScore > 0 ? 'Below threshold' : 'Not yet assessed',
      trend: avgScore >= 70 ? 6 : avgScore > 0 ? -3 : 0,
    },
    {
      label: 'Pending Actions',
      value: String(pendingActions),
      icon: Clock,
      change: pendingActions > 0 ? `${pendingActions} pending action${pendingActions !== 1 ? 's' : ''}` : 'No pending actions',
      trend: pendingActions > 0 ? -pendingActions : 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Setup status banner */}
      <SetupStatusBanner />

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500">Project overview and recent activity</p>
        </div>
        <Link href="/projects/new/onboarding">
          <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-sm font-medium">
                  {stat.label}
                </CardDescription>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <TrendIndicator value={stat.trend} />
                  <span className="text-xs text-slate-500">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Middle row: Status distribution chart + Activity feed */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Status distribution */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Project Status Distribution</CardTitle>
            <CardDescription>
              Projects by current phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDistributionChart projects={projectList} />
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <CardDescription>
              Team activity across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-slate-200 mb-3" />
              <p className="text-sm text-slate-500 max-w-xs">
                Activity will appear here as your team works on projects
                &mdash; assessments completed, policies drafted, gates
                reviewed, and more.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent projects with health indicators */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent Projects
          </h2>
          {projectList.length > 3 && (
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {projectList.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-slate-200">
            <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No projects yet</h3>
            <p className="text-sm text-slate-500 mt-2">
              Create your first AI governance project to get started.
            </p>
            <Link href="/projects/new/onboarding" className="mt-4 inline-block">
              <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projectList.slice(0, 6).map((project: Project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}/overview`}
                className="group"
              >
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base leading-snug">
                          {project.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="secondary"
                            className={phaseColors[project.status] || 'bg-slate-100 text-slate-800'}
                          >
                            {getPhaseLabel(project.status)}
                          </Badge>
                          <HealthBadge score={project.feasibility_score ?? undefined} />
                        </div>
                      </div>
                      {project.feasibility_score ? (
                        <ScoreRing score={project.feasibility_score} />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                          --
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="line-clamp-2">
                      {project.description || 'No description provided.'}
                    </CardDescription>
                    {/* Progress indicator */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium text-slate-700">
                          {project.feasibility_score
                            ? `${Math.min(Math.round(project.feasibility_score * 0.6), 100)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{
                            width: `${project.feasibility_score ? Math.min(Math.round(project.feasibility_score * 0.6), 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Updated{' '}
                      {project.updated_at
                        ? format(new Date(project.updated_at), 'MMM d, yyyy')
                        : '--'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
