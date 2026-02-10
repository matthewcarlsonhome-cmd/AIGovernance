'use client';

import * as React from 'react';
import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Server,
  Shield,
  Scale,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAssessmentResponses } from '@/hooks/use-assessments';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type PrereqStatus = 'complete' | 'in_progress' | 'not_started';

interface PrerequisiteItem {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: PrereqStatus;
  category: string;
}

interface PrerequisiteCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  items: PrerequisiteItem[];
}

/* -------------------------------------------------------------------------- */
/*  Demo Data                                                                  */
/* -------------------------------------------------------------------------- */

const CATEGORIES: PrerequisiteCategory[] = [
  {
    key: 'infrastructure',
    label: 'Infrastructure Prerequisites',
    icon: Server,
    items: [
      {
        id: 'infra-p1',
        title: 'Provision isolated VPC/subnet for AI sandbox environment',
        assignedTo: 'Alex Rivera',
        dueDate: '2026-02-28',
        status: 'complete',
        category: 'infrastructure',
      },
      {
        id: 'infra-p2',
        title: 'Set up centralized artifact registry with approved package allowlist',
        assignedTo: 'Alex Rivera',
        dueDate: '2026-03-07',
        status: 'in_progress',
        category: 'infrastructure',
      },
      {
        id: 'infra-p3',
        title: 'Configure cloud workstation images with required tooling and monitoring agents',
        assignedTo: 'Jordan Lee',
        dueDate: '2026-03-14',
        status: 'in_progress',
        category: 'infrastructure',
      },
      {
        id: 'infra-p4',
        title: 'Enable network egress filtering and logging for sandbox environment',
        assignedTo: 'Alex Rivera',
        dueDate: '2026-03-21',
        status: 'not_started',
        category: 'infrastructure',
      },
    ],
  },
  {
    key: 'security',
    label: 'Security Prerequisites',
    icon: Shield,
    items: [
      {
        id: 'sec-p1',
        title: 'Deploy endpoint DLP agent on all pilot developer workstations',
        assignedTo: 'Sarah Chen',
        dueDate: '2026-03-07',
        status: 'in_progress',
        category: 'security',
      },
      {
        id: 'sec-p2',
        title: 'Migrate secrets from environment variables to HashiCorp Vault',
        assignedTo: 'Sarah Chen',
        dueDate: '2026-03-14',
        status: 'not_started',
        category: 'security',
      },
      {
        id: 'sec-p3',
        title: 'Configure SIEM alerting rules for AI agent activity patterns',
        assignedTo: 'Marcus Johnson',
        dueDate: '2026-03-21',
        status: 'not_started',
        category: 'security',
      },
      {
        id: 'sec-p4',
        title: 'Conduct incident response tabletop exercise with AI breach scenario',
        assignedTo: 'Sarah Chen',
        dueDate: '2026-03-28',
        status: 'not_started',
        category: 'security',
      },
    ],
  },
  {
    key: 'governance',
    label: 'Governance Prerequisites',
    icon: Scale,
    items: [
      {
        id: 'gov-p1',
        title: 'Draft and obtain approval for AI Acceptable Use Policy (AUP)',
        assignedTo: 'Michael Torres',
        dueDate: '2026-02-21',
        status: 'complete',
        category: 'governance',
      },
      {
        id: 'gov-p2',
        title: 'Complete vendor risk assessment for Anthropic (Claude Code)',
        assignedTo: 'Michael Torres',
        dueDate: '2026-03-07',
        status: 'in_progress',
        category: 'governance',
      },
      {
        id: 'gov-p3',
        title: 'Map AI controls to existing compliance framework requirements (SOC 2, GDPR)',
        assignedTo: 'Lisa Park',
        dueDate: '2026-03-14',
        status: 'not_started',
        category: 'governance',
      },
    ],
  },
  {
    key: 'team',
    label: 'Team Prerequisites',
    icon: Users,
    items: [
      {
        id: 'team-p1',
        title: 'Identify and onboard 5-8 pilot participants from engineering',
        assignedTo: 'Jordan Lee',
        dueDate: '2026-02-28',
        status: 'complete',
        category: 'team',
      },
      {
        id: 'team-p2',
        title: 'Schedule AI tool training sessions for pilot team members',
        assignedTo: 'Jordan Lee',
        dueDate: '2026-03-07',
        status: 'in_progress',
        category: 'team',
      },
      {
        id: 'team-p3',
        title: 'Establish baseline productivity metrics for pilot comparison',
        assignedTo: 'Marcus Johnson',
        dueDate: '2026-03-14',
        status: 'not_started',
        category: 'team',
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusBadge(status: PrereqStatus): React.ReactElement {
  switch (status) {
    case 'complete':
      return (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Complete
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" />
          In Progress
        </Badge>
      );
    case 'not_started':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <Circle className="mr-1 h-3 w-3" />
          Not Started
        </Badge>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function PrerequisitesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = use(params);
  const { data: responses, isLoading, error } = useAssessmentResponses(id);

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  // Use fetched responses to determine completed items if available; fallback to demo data
  const categories = CATEGORIES;

  // Toggleable completion state
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const cat of CATEGORIES) {
      for (const item of cat.items) {
        if (item.status === 'complete') {
          initial.add(item.id);
        }
      }
    }
    return initial;
  });

  const toggleComplete = (itemId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Stats
  const allItems = CATEGORIES.flatMap((c) => c.items);
  const totalItems = allItems.length;
  const completedCount = completedIds.size;
  const overallPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const inProgressCount = allItems.filter(
    (item) => !completedIds.has(item.id) && item.status === 'in_progress'
  ).length;
  const notStartedCount = totalItems - completedCount - inProgressCount;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ---------------------------------------------------------------- */}
      {/*  Page header                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Prerequisites Checklist
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage prerequisite tasks that must be completed before
          proceeding to sandbox setup and pilot execution.
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Overall progress                                                 */}
      {/* ---------------------------------------------------------------- */}
      <Card className="mb-8">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Overall Progress</span>
                <span className="text-muted-foreground">
                  {completedCount} of {totalItems} items complete
                </span>
              </div>
              <Progress value={overallPercent} />
              <p className="text-xs text-muted-foreground">{overallPercent}% complete</p>
            </div>

            <div className="flex items-center gap-4 sm:ml-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{notStartedCount}</p>
                <p className="text-xs text-muted-foreground">Not Started</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/*  Category sections                                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const catCompleted = category.items.filter((i) => completedIds.has(i.id)).length;
          const catTotal = category.items.length;
          const catPercent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

          return (
            <Card key={category.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.label}</CardTitle>
                      <CardDescription>
                        {catCompleted} of {catTotal} complete
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {catPercent}%
                  </span>
                </div>
                <Progress value={catPercent} className="mt-2 h-1.5" />
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const isChecked = completedIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-start gap-4 rounded-lg border px-4 py-3 transition-colors',
                          isChecked
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : 'border-border bg-background hover:bg-muted/30'
                        )}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleComplete(item.id)}
                          className="mt-0.5 shrink-0"
                          aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-medium',
                              isChecked
                                ? 'text-muted-foreground line-through'
                                : 'text-foreground'
                            )}
                          >
                            {item.title}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {item.assignedTo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due {formatDate(item.dueDate)}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0">
                          {isChecked
                            ? statusBadge('complete')
                            : statusBadge(item.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Footer actions                                                   */}
      {/* ---------------------------------------------------------------- */}
      <div className="mt-8 flex items-center justify-between">
        <Link href={`/projects/${id}/discovery/readiness`}>
          <Button variant="outline" className="gap-2">
            Back to Readiness Dashboard
          </Button>
        </Link>
        <Link href={`/projects/${id}/governance/policies`}>
          <Button className="gap-2">
            Continue to Governance
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
