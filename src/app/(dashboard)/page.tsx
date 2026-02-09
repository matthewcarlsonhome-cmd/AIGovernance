import Link from 'next/link';
import {
  FolderKanban,
  FileCheck,
  TrendingUp,
  FileText,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

const stats = [
  {
    label: 'Active Projects',
    value: '3',
    icon: FolderKanban,
    change: '+1 this month',
  },
  {
    label: 'Assessments Complete',
    value: '12',
    icon: FileCheck,
    change: '4 pending',
  },
  {
    label: 'Avg Feasibility Score',
    value: '74%',
    icon: TrendingUp,
    change: '+6% vs last quarter',
  },
  {
    label: 'Reports Generated',
    value: '8',
    icon: FileText,
    change: '2 this week',
  },
] satisfies {
  label: string;
  value: string;
  icon: React.ElementType;
  change: string;
}[];

interface DemoProject {
  id: string;
  name: string;
  description: string;
  phase: string;
  phaseColor: string;
  feasibilityScore: number;
  updatedAt: string;
}

const projects: DemoProject[] = [
  {
    id: 'demo-1',
    name: 'Enterprise AI Coding Pilot',
    description:
      'Evaluating Claude Code and Codex for the platform engineering team across 3 product squads.',
    phase: 'PoC Evaluation',
    phaseColor: 'bg-blue-100 text-blue-800',
    feasibilityScore: 82,
    updatedAt: 'Feb 7, 2026',
  },
  {
    id: 'demo-2',
    name: 'Legal Document Assistant',
    description:
      'AI-assisted contract review and clause extraction for the legal ops team.',
    phase: 'Discovery',
    phaseColor: 'bg-amber-100 text-amber-800',
    feasibilityScore: 64,
    updatedAt: 'Feb 5, 2026',
  },
  {
    id: 'demo-3',
    name: 'Marketing Content Generator',
    description:
      'Automated blog drafts, social posts, and email campaigns with brand-voice guardrails.',
    phase: 'Sandbox',
    phaseColor: 'bg-emerald-100 text-emerald-800',
    feasibilityScore: 78,
    updatedAt: 'Feb 3, 2026',
  },
];

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
          className="text-muted/40"
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Acme Corp &mdash; AI Governance overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-sm font-medium">
                  {stat.label}
                </CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent Projects
          </h2>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/overview`}
              className="group"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {project.name}
                    </CardTitle>
                    <ScoreRing score={project.feasibilityScore} />
                  </div>
                  <Badge
                    variant="secondary"
                    className={project.phaseColor}
                  >
                    {project.phase}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground">
                    Updated {project.updatedAt}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
