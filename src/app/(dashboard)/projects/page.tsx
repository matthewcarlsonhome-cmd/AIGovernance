'use client';

import Link from 'next/link';
import {
  Plus,
  FolderKanban,
  ArrowRight,
  AlertCircle,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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
import { Input } from '@/components/ui/input';
import { useProjects } from '@/hooks/use-projects';
import type { Project } from '@/types';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Score ring                                                         */
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
        <circle cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200" />
        <circle cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={color} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{score}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase helpers                                                      */
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
    poc: 'PoC Evaluation',
    pilot: 'Pilot',
    evaluation: 'Evaluation',
    production: 'Production',
    completed: 'Completed',
    on_hold: 'On Hold',
  };
  return labels[status] || status;
}

/* ------------------------------------------------------------------ */
/*  Health badge                                                       */
/* ------------------------------------------------------------------ */

function HealthBadge({ score }: { score: number | undefined }) {
  if (!score) {
    return (
      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-400 border-slate-200">
        No score
      </Badge>
    );
  }
  if (score >= 75) {
    return (
      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
        <ArrowUpRight className="h-3 w-3 mr-0.5" />
        Healthy
      </Badge>
    );
  }
  if (score >= 50) {
    return (
      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
        <Minus className="h-3 w-3 mr-0.5" />
        Moderate
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
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function ProjectsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 bg-slate-200 rounded" />
        <div className="h-10 w-36 bg-slate-200 rounded" />
      </div>
      <div className="h-10 w-full bg-slate-100 rounded" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.status.toLowerCase().includes(q),
    );
  }, [projects, search]);

  if (isLoading) return <ProjectsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your AI governance projects
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load projects</p>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search projects by name, description, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Project list */}
      {filtered.length === 0 && !error ? (
        <Card className="p-8 text-center">
          <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            {search ? 'No matching projects' : 'No projects yet'}
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            {search
              ? 'Try adjusting your search terms.'
              : 'Create your first AI governance project to get started.'}
          </p>
          {!search && (
            <Link href="/projects/new" className="mt-4 inline-block">
              <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project: Project) => (
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
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Updated{' '}
                      {project.updated_at
                        ? format(new Date(project.updated_at), 'MMM d, yyyy')
                        : '--'}
                    </p>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
