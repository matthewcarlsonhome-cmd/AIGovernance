'use client';

import * as React from 'react';
import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Server,
  Shield,
  Scale,
  Users,
  Sparkles,
  Info,
  Plus,
  Trash2,
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
import { Input } from '@/components/ui/input';

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

const STORAGE_KEY = 'govai_prerequisites';

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
        <Badge variant="outline" className="text-slate-500">
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

  // Load persisted state from localStorage
  const [customItems, setCustomItems] = useState<PrerequisiteItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_items_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set<string>();
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_completed_${id}`);
      if (saved) return new Set(JSON.parse(saved));
    } catch { /* ignore */ }
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newCategory, setNewCategory] = useState('infrastructure');
  const [showGuide, setShowGuide] = useState(true);

  const persistCompleted = (ids: Set<string>) => {
    localStorage.setItem(`${STORAGE_KEY}_completed_${id}`, JSON.stringify([...ids]));
  };
  const persistItems = (items: PrerequisiteItem[]) => {
    localStorage.setItem(`${STORAGE_KEY}_items_${id}`, JSON.stringify(items));
  };

  const toggleComplete = (itemId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      persistCompleted(next);
      return next;
    });
  };

  const addItem = () => {
    if (!newTitle.trim()) return;
    const item: PrerequisiteItem = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      assignedTo: newAssignee.trim() || 'Unassigned',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'not_started',
      category: newCategory,
    };
    const updated = [...customItems, item];
    setCustomItems(updated);
    persistItems(updated);
    setNewTitle('');
    setNewAssignee('');
    setShowAddForm(false);
  };

  const removeCustomItem = (itemId: string) => {
    const updated = customItems.filter(i => i.id !== itemId);
    setCustomItems(updated);
    persistItems(updated);
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      persistCompleted(next);
      return next;
    });
  };

  // Merge custom items into categories
  const categoriesWithCustom = CATEGORIES.map(cat => ({
    ...cat,
    items: [...cat.items, ...customItems.filter(i => i.category === cat.key)],
  }));

  // Stats
  const allItems = categoriesWithCustom.flatMap((c) => c.items);
  const totalItems = allItems.length;
  const completedCount = allItems.filter(i => completedIds.has(i.id)).length;
  const overallPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const inProgressCount = allItems.filter(
    (item) => !completedIds.has(item.id) && item.status === 'in_progress'
  ).length;
  const notStartedCount = totalItems - completedCount - inProgressCount;

  const encouragement = overallPercent === 100
    ? 'All prerequisites complete! You\'re ready to build.'
    : overallPercent >= 75
    ? 'Almost there! Just a few more items to go.'
    : overallPercent >= 50
    ? 'Great progress! You\'re past the halfway mark.'
    : overallPercent > 0
    ? 'Nice start! Keep the momentum going.'
    : 'Let\'s get started on the prerequisites.';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Prerequisites Checklist
          </h1>
          <Badge variant="secondary" className="bg-violet-100 text-violet-700">
            <Sparkles className="mr-1 h-3 w-3" />
            {encouragement}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Track and manage prerequisite tasks that must be completed before
          proceeding to sandbox setup and pilot execution.
        </p>
      </div>

      {/* How-to guide */}
      {showGuide && (
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">How Prerequisites Work</p>
                <ul className="text-sm text-blue-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 shrink-0">1.</span>
                    <span><strong>Review each category</strong> below &mdash; Infrastructure, Security, Governance, and Team items must be in place before your pilot can launch.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 shrink-0">2.</span>
                    <span><strong>Click the circle</strong> next to any item to toggle it complete. Assign items to team members so everyone knows their responsibilities.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 shrink-0">3.</span>
                    <span><strong>Add custom items</strong> using the button below if your organization has additional requirements beyond the defaults.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 shrink-0">4.</span>
                    <span><strong>These feed into Gate Reviews</strong> &mdash; completing prerequisites is required for Gate 2 (Sandbox Access) approval. Your progress here directly updates the project timeline.</span>
                  </li>
                </ul>
                <button onClick={() => setShowGuide(false)} className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline">
                  Got it, hide this guide
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall progress */}
      <Card className="mb-8">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">Overall Progress</span>
                <span className="text-slate-500">
                  {completedCount} of {totalItems} items complete
                </span>
              </div>
              <Progress value={overallPercent} />
              <p className="text-xs text-slate-500">{overallPercent}% complete</p>
            </div>

            <div className="flex items-center gap-4 sm:ml-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
                <p className="text-xs text-slate-500">Complete</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
                <p className="text-xs text-slate-500">In Progress</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-500">{notStartedCount}</p>
                <p className="text-xs text-slate-500">Not Started</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add item button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Prerequisite Categories</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1 border-slate-300 text-slate-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Custom Item
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="mb-4 border-dashed border-blue-300 bg-blue-50/30">
          <CardContent className="py-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Prerequisite title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="border-slate-200"
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                  />
                </div>
                <Input
                  placeholder="Assign to..."
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="border-slate-200"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
                <Button onClick={addItem} disabled={!newTitle.trim()} className="bg-slate-900 text-white hover:bg-slate-800" size="sm">
                  Add Item
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category sections */}
      <div className="space-y-6">
        {categoriesWithCustom.map((category) => {
          const Icon = category.icon;
          const catCompleted = category.items.filter((i) => completedIds.has(i.id)).length;
          const catTotal = category.items.length;
          const catPercent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

          return (
            <Card key={category.key} className={cn(catPercent === 100 && 'border-emerald-200 bg-emerald-50/20')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      catPercent === 100 ? 'bg-emerald-100' : 'bg-slate-100'
                    )}>
                      <Icon className={cn('h-5 w-5', catPercent === 100 ? 'text-emerald-600' : 'text-slate-500')} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.label}</CardTitle>
                      <CardDescription>
                        {catCompleted} of {catTotal} complete
                        {catPercent === 100 && ' -- All done!'}
                      </CardDescription>
                    </div>
                  </div>
                  <span className={cn(
                    'text-sm font-medium',
                    catPercent === 100 ? 'text-emerald-600' : 'text-slate-500'
                  )}>
                    {catPercent}%
                  </span>
                </div>
                <Progress value={catPercent} className="mt-2 h-1.5" />
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const isChecked = completedIds.has(item.id);
                    const isCustom = item.id.startsWith('custom-');

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-start gap-4 rounded-lg border px-4 py-3 transition-all',
                          isChecked
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                        )}
                      >
                        <button
                          onClick={() => toggleComplete(item.id)}
                          className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                          aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-medium',
                              isChecked
                                ? 'text-slate-400 line-through'
                                : 'text-slate-900'
                            )}
                          >
                            {item.title}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {item.assignedTo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due {formatDate(item.dueDate)}
                            </span>
                            {isCustom && (
                              <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-600 border-violet-200">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isChecked
                            ? statusBadge('complete')
                            : statusBadge(item.status)}
                          {isCustom && (
                            <button
                              onClick={() => removeCustomItem(item.id)}
                              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              title="Remove custom item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
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

      {/* Footer actions */}
      <div className="mt-8 flex items-center justify-between">
        <Link href={`/projects/${id}/discovery/readiness`}>
          <Button variant="outline" className="gap-2 border-slate-300 text-slate-700">
            Back to Readiness Dashboard
          </Button>
        </Link>
        <Link href={`/projects/${id}/governance/policies`}>
          <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
            Continue to Governance
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
