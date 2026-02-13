'use client';

import * as React from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';
import {
  Timer,
  CheckCircle2,
  Play,
  CalendarDays,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Zap,
  Plus,
  Pencil,
  Lightbulb,
  Info,
  Trash2,
  Trophy,
  Star,
  Rocket,
} from 'lucide-react';
import { useSprints } from '@/hooks/use-poc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SprintStatus = 'completed' | 'active' | 'planned';

interface SprintGoal {
  name: string;
  completed: boolean;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  goals: SprintGoal[];
  velocity: number;
  baselineVelocity: number;
  storyPointsPlanned: number;
  storyPointsCompleted: number;
  defectRate: number;
  satisfaction: number;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_SPRINTS: Sprint[] = [
  {
    id: 's1',
    name: 'Sprint 1',
    startDate: '2026-01-27',
    endDate: '2026-02-07',
    status: 'completed',
    goals: [
      { name: 'API endpoint generation', completed: true },
      { name: 'Unit test writing', completed: true },
      { name: 'Code review automation', completed: true },
    ],
    velocity: 34,
    baselineVelocity: 21,
    storyPointsPlanned: 34,
    storyPointsCompleted: 34,
    defectRate: 9,
    satisfaction: 8.4,
  },
  {
    id: 's2',
    name: 'Sprint 2',
    startDate: '2026-02-10',
    endDate: '2026-02-21',
    status: 'active',
    goals: [
      { name: 'Database migration generation', completed: true },
      { name: 'Integration testing', completed: false },
      { name: 'Performance optimization', completed: false },
    ],
    velocity: 38,
    baselineVelocity: 21,
    storyPointsPlanned: 40,
    storyPointsCompleted: 24,
    defectRate: 7,
    satisfaction: 8.9,
  },
  {
    id: 's3',
    name: 'Sprint 3',
    startDate: '2026-02-24',
    endDate: '2026-03-07',
    status: 'planned',
    goals: [
      { name: 'Full feature development', completed: false },
      { name: 'CI/CD pipeline tasks', completed: false },
      { name: 'Documentation generation', completed: false },
    ],
    velocity: 0,
    baselineVelocity: 21,
    storyPointsPlanned: 42,
    storyPointsCompleted: 0,
    defectRate: 0,
    satisfaction: 0,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusBadgeClasses(status: SprintStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25';
    case 'active':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/25';
    case 'planned':
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

function getStatusLabel(status: SprintStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'active':
      return 'Active';
    case 'planned':
      return 'Planned';
  }
}

function getStatusIcon(status: SprintStatus): React.ReactElement {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'active':
      return <Play className="h-5 w-5 text-blue-500" />;
    case 'planned':
      return <CalendarDays className="h-5 w-5 text-slate-500" />;
  }
}

function formatDateForDisplay(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function generateId(): string {
  return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function getStorageKey(projectId: string): string {
  return `govai_sprints_${projectId}`;
}

function loadSprintsFromStorage(projectId: string): Sprint[] | null {
  try {
    const raw = localStorage.getItem(getStorageKey(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Sprint[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveSprintsToStorage(projectId: string, sprints: Sprint[]): void {
  try {
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(sprints));
  } catch {
    // localStorage may be full or unavailable; silently fail
  }
}

function getEncouragementMessage(sprints: Sprint[]): { text: string; icon: React.ReactElement } | null {
  const total = sprints.length;
  if (total === 0) return null;

  const completed = sprints.filter((s) => s.status === 'completed').length;
  const active = sprints.filter((s) => s.status === 'active').length;
  const pct = Math.round((completed / total) * 100);

  if (completed === total) {
    return {
      text: 'All sprints completed! Your pilot evaluation data is ready for the final report. Outstanding work.',
      icon: <Trophy className="h-5 w-5 text-amber-500" />,
    };
  }
  if (pct >= 75) {
    return {
      text: `Almost there -- ${completed} of ${total} sprints done. The finish line is in sight.`,
      icon: <Rocket className="h-5 w-5 text-indigo-500" />,
    };
  }
  if (pct >= 50) {
    return {
      text: `Great momentum -- you are past the halfway mark with ${completed} of ${total} sprints completed.`,
      icon: <Star className="h-5 w-5 text-amber-500" />,
    };
  }
  if (active > 0) {
    return {
      text: `Sprint in progress. Keep capturing metrics -- each data point strengthens your evaluation.`,
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
    };
  }
  if (completed > 0) {
    return {
      text: `Off to a solid start with ${completed} sprint${completed > 1 ? 's' : ''} complete. Keep the cadence going.`,
      icon: <Zap className="h-5 w-5 text-amber-500" />,
    };
  }
  return {
    text: 'Ready to begin your pilot evaluation. Create your first sprint and start tracking.',
    icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
  };
}

/* ------------------------------------------------------------------ */
/*  New Sprint Dialog State                                            */
/* ------------------------------------------------------------------ */

interface NewSprintForm {
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  goalsText: string;
  storyPointsPlanned: string;
  baselineVelocity: string;
}

const EMPTY_NEW_SPRINT_FORM: NewSprintForm = {
  name: '',
  startDate: '',
  endDate: '',
  status: 'planned',
  goalsText: '',
  storyPointsPlanned: '',
  baselineVelocity: '21',
};

/* ------------------------------------------------------------------ */
/*  Edit Metrics Dialog State                                          */
/* ------------------------------------------------------------------ */

interface EditMetricsForm {
  velocity: string;
  defectRate: string;
  satisfaction: string;
  storyPointsCompleted: string;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SprintEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const { data: fetchedSprints, isLoading, error } = useSprints(id);

  // ----- State -----
  const [sprints, setSprints] = React.useState<Sprint[]>([]);
  const [initialized, setInitialized] = React.useState(false);
  const [expandedSprint, setExpandedSprint] = React.useState<string | null>(null);

  // Create dialog
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [newSprintForm, setNewSprintForm] = React.useState<NewSprintForm>(EMPTY_NEW_SPRINT_FORM);

  // Edit metrics dialog
  const [showEditMetricsDialog, setShowEditMetricsDialog] = React.useState(false);
  const [editingSprintId, setEditingSprintId] = React.useState<string | null>(null);
  const [editMetricsForm, setEditMetricsForm] = React.useState<EditMetricsForm>({
    velocity: '',
    defectRate: '',
    satisfaction: '',
    storyPointsCompleted: '',
  });

  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deletingSprintId, setDeletingSprintId] = React.useState<string | null>(null);

  // How-it-works guide
  const [showGuide, setShowGuide] = React.useState(true);

  // ----- Initialize data: hook data > localStorage > demo -----
  React.useEffect(() => {
    if (isLoading) return;

    // If the hook returned real data, use it
    if (fetchedSprints && fetchedSprints.length > 0) {
      const mapped: Sprint[] = (fetchedSprints as unknown as Sprint[]);
      setSprints(mapped);
      setInitialized(true);
      return;
    }

    // Otherwise try localStorage, then fallback to demo
    const stored = loadSprintsFromStorage(id);
    if (stored) {
      setSprints(stored);
    } else {
      setSprints(DEFAULT_SPRINTS);
    }
    setInitialized(true);
  }, [isLoading, fetchedSprints, id]);

  // Expand the first active sprint by default once initialized
  React.useEffect(() => {
    if (!initialized || sprints.length === 0) return;
    const active = sprints.find((s) => s.status === 'active');
    if (active) {
      setExpandedSprint(active.id);
    } else {
      setExpandedSprint(sprints[0].id);
    }
  // Only run once on initialization
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // ----- Persist to localStorage on change -----
  React.useEffect(() => {
    if (!initialized) return;
    saveSprintsToStorage(id, sprints);
  }, [sprints, id, initialized]);

  // ----- Handlers -----
  const toggleExpand = (sprintId: string): void => {
    setExpandedSprint((prev) => (prev === sprintId ? null : sprintId));
  };

  const toggleGoal = (sprintId: string, goalIndex: number): void => {
    setSprints((prev) =>
      prev.map((s) => {
        if (s.id !== sprintId) return s;
        const updatedGoals = s.goals.map((g, i) =>
          i === goalIndex ? { ...g, completed: !g.completed } : g
        );
        return { ...s, goals: updatedGoals };
      })
    );
  };

  const handleCreateSprint = (): void => {
    const goals: SprintGoal[] = newSprintForm.goalsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((name) => ({ name, completed: false }));

    const planned = parseInt(newSprintForm.storyPointsPlanned, 10);
    const baseline = parseInt(newSprintForm.baselineVelocity, 10);

    const newSprint: Sprint = {
      id: generateId(),
      name: newSprintForm.name.trim() || `Sprint ${sprints.length + 1}`,
      startDate: newSprintForm.startDate,
      endDate: newSprintForm.endDate,
      status: newSprintForm.status,
      goals: goals.length > 0 ? goals : [{ name: 'Define sprint goals', completed: false }],
      velocity: 0,
      baselineVelocity: isNaN(baseline) ? 21 : baseline,
      storyPointsPlanned: isNaN(planned) ? 0 : planned,
      storyPointsCompleted: 0,
      defectRate: 0,
      satisfaction: 0,
    };

    setSprints((prev) => [...prev, newSprint]);
    setNewSprintForm(EMPTY_NEW_SPRINT_FORM);
    setShowCreateDialog(false);
    setExpandedSprint(newSprint.id);
  };

  const openEditMetrics = (sprint: Sprint): void => {
    setEditingSprintId(sprint.id);
    setEditMetricsForm({
      velocity: sprint.velocity.toString(),
      defectRate: sprint.defectRate.toString(),
      satisfaction: sprint.satisfaction.toString(),
      storyPointsCompleted: sprint.storyPointsCompleted.toString(),
    });
    setShowEditMetricsDialog(true);
  };

  const handleSaveMetrics = (): void => {
    if (!editingSprintId) return;

    const velocity = parseFloat(editMetricsForm.velocity);
    const defectRate = parseFloat(editMetricsForm.defectRate);
    const satisfaction = parseFloat(editMetricsForm.satisfaction);
    const storyPointsCompleted = parseInt(editMetricsForm.storyPointsCompleted, 10);

    setSprints((prev) =>
      prev.map((s) => {
        if (s.id !== editingSprintId) return s;
        return {
          ...s,
          velocity: isNaN(velocity) ? s.velocity : velocity,
          defectRate: isNaN(defectRate) ? s.defectRate : defectRate,
          satisfaction: isNaN(satisfaction) ? s.satisfaction : Math.min(satisfaction, 10),
          storyPointsCompleted: isNaN(storyPointsCompleted) ? s.storyPointsCompleted : storyPointsCompleted,
        };
      })
    );
    setShowEditMetricsDialog(false);
    setEditingSprintId(null);
  };

  const openDeleteConfirmation = (sprintId: string): void => {
    setDeletingSprintId(sprintId);
    setShowDeleteDialog(true);
  };

  const handleDeleteSprint = (): void => {
    if (!deletingSprintId) return;
    setSprints((prev) => prev.filter((s) => s.id !== deletingSprintId));
    if (expandedSprint === deletingSprintId) {
      setExpandedSprint(null);
    }
    setShowDeleteDialog(false);
    setDeletingSprintId(null);
  };

  const handleStatusChange = (sprintId: string, newStatus: SprintStatus): void => {
    setSprints((prev) =>
      prev.map((s) => (s.id === sprintId ? { ...s, status: newStatus } : s))
    );
  };

  // ----- Computed values -----
  const completedCount = sprints.filter((s) => s.status === 'completed').length;

  const completedSprintsWithVelocity = sprints.filter(
    (s) => s.status === 'completed' && s.velocity > 0 && s.baselineVelocity > 0
  );
  const avgVelocityIncrease =
    completedSprintsWithVelocity.length > 0
      ? Math.round(
          completedSprintsWithVelocity.reduce(
            (sum, s) =>
              sum + ((s.velocity - s.baselineVelocity) / s.baselineVelocity) * 100,
            0
          ) / completedSprintsWithVelocity.length
        )
      : 0;

  const sprintsWithSatisfaction = sprints.filter(
    (s) => (s.status === 'completed' || s.status === 'active') && s.satisfaction > 0
  );
  const avgSatisfaction =
    sprintsWithSatisfaction.length > 0
      ? (
          sprintsWithSatisfaction.reduce((sum, s) => sum + s.satisfaction, 0) /
          sprintsWithSatisfaction.length
        ).toFixed(1)
      : '0.0';

  const encouragement = getEncouragementMessage(sprints);

  // ----- Loading / Error states -----
  if (isLoading && !initialized) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !initialized) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading sprints: {error.message}</p>
        <p className="text-sm text-slate-500 mt-2">Falling back to local data.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sprint Evaluation Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track evaluation sprints for your AI coding agent PoC with velocity,
            quality, and satisfaction metrics per sprint.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-blue-500/15 text-blue-700 border-blue-500/25 text-sm px-3 py-1"
          >
            <Zap className="h-3.5 w-3.5 mr-1" />
            Claude Code Evaluation
          </Badge>
          <Button
            className="bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => {
              setNewSprintForm(EMPTY_NEW_SPRINT_FORM);
              setShowCreateDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Sprint
          </Button>
        </div>
      </div>

      <Separator />

      {/* How It Works Guide */}
      {showGuide && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                    How Sprint Tracking Works
                  </h3>
                  <div className="space-y-1.5 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-700">1. Create sprints</span> --
                      Define 2-week evaluation windows with clear goals for your AI coding pilot.
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">2. Track goals</span> --
                      Click on individual goals to toggle completion as your team works through them.
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">3. Enter metrics</span> --
                      After each sprint, record velocity, defect rate, and satisfaction using the edit button.
                      These numbers are compared against your baseline to measure AI-assisted improvement.
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">4. Evaluate progress</span> --
                      The summary cards above each sprint show aggregate trends. This data feeds directly into
                      your PoC comparison dashboard and final pilot evaluation report.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-slate-600 shrink-0 h-8 w-8 p-0"
                onClick={() => setShowGuide(false)}
                aria-label="Dismiss guide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Encouragement Banner */}
      {encouragement && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          {encouragement.icon}
          <p className="text-sm text-slate-700">{encouragement.text}</p>
        </div>
      )}

      {/* Sprint Summary Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {completedCount}
                </p>
                <p className="text-xs text-slate-500">
                  Sprint{completedCount !== 1 ? 's' : ''} Completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {avgVelocityIncrease > 0 ? '+' : ''}
                  {avgVelocityIncrease}%
                </p>
                <p className="text-xs text-slate-500">Avg Velocity Increase</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {avgSatisfaction}/10
                </p>
                <p className="text-xs text-slate-500">Avg Dev Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sprint Cards */}
      {sprints.length === 0 && (
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="p-8 text-center">
            <CalendarDays className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              No Sprints Yet
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Create your first evaluation sprint to start tracking your AI coding pilot.
            </p>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => {
                setNewSprintForm(EMPTY_NEW_SPRINT_FORM);
                setShowCreateDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Sprint
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {sprints.map((sprint) => {
          const isExpanded = expandedSprint === sprint.id;
          const completionPct =
            sprint.storyPointsPlanned > 0
              ? Math.round(
                  (sprint.storyPointsCompleted / sprint.storyPointsPlanned) * 100
                )
              : 0;
          const velocityChange =
            sprint.velocity > 0 && sprint.baselineVelocity > 0
              ? Math.round(
                  ((sprint.velocity - sprint.baselineVelocity) /
                    sprint.baselineVelocity) *
                    100
                )
              : 0;
          const goalsCompleted = sprint.goals.filter((g) => g.completed).length;
          const goalsPct =
            sprint.goals.length > 0
              ? Math.round((goalsCompleted / sprint.goals.length) * 100)
              : 0;

          return (
            <Card
              key={sprint.id}
              className={cn(
                'transition-colors',
                sprint.status === 'active' && 'border-blue-500/30'
              )}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleExpand(sprint.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sprint.status)}
                    <div>
                      <CardTitle className="text-lg">{sprint.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-0.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDateForDisplay(sprint.startDate)} -{' '}
                        {formatDateForDisplay(sprint.endDate)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        getStatusBadgeClasses(sprint.status)
                      )}
                    >
                      {getStatusLabel(sprint.status)}
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {sprint.status !== 'planned' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>
                        {sprint.storyPointsCompleted}/{sprint.storyPointsPlanned}{' '}
                        story points
                      </span>
                      <span>{completionPct}%</span>
                    </div>
                    <Progress value={completionPct} />
                  </div>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <Separator className="mb-4" />

                  {/* Status + Actions Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-slate-500">Status:</Label>
                      <Select
                        value={sprint.status}
                        onValueChange={(val) =>
                          handleStatusChange(sprint.id, val as SprintStatus)
                        }
                        className="w-36 h-8 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectOption value="planned">Planned</SelectOption>
                        <SelectOption value="active">Active</SelectOption>
                        <SelectOption value="completed">Completed</SelectOption>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="h-8 text-xs border-slate-200 text-slate-600 hover:text-slate-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditMetrics(sprint);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit Metrics
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 text-xs border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirmation(sprint.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-900">
                        Sprint Goals
                      </h4>
                      <span className="text-xs text-slate-500">
                        {goalsCompleted}/{sprint.goals.length} completed ({goalsPct}%)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sprint.goals.map((goal, goalIndex) => (
                        <button
                          key={goal.name + goalIndex}
                          type="button"
                          className="flex items-center gap-2 text-sm w-full text-left rounded-md px-2 py-1.5 hover:bg-slate-50 transition-colors group"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGoal(sprint.id, goalIndex);
                          }}
                        >
                          {goal.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-slate-400 shrink-0 group-hover:border-emerald-400 transition-colors" />
                          )}
                          <span
                            className={cn(
                              'transition-colors',
                              goal.completed
                                ? 'text-slate-900 line-through decoration-slate-300'
                                : 'text-slate-500'
                            )}
                          >
                            {goal.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    {/* Goals progress bar */}
                    <div className="mt-3">
                      <Progress value={goalsPct} />
                    </div>
                  </div>

                  {/* Metrics */}
                  {sprint.status !== 'planned' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-900">
                          Sprint Metrics
                        </h4>
                        {sprint.velocity === 0 &&
                          sprint.defectRate === 0 &&
                          sprint.satisfaction === 0 && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                              No metrics recorded yet -- click Edit Metrics
                            </span>
                          )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Velocity</p>
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-xl font-bold text-slate-900">
                              {sprint.velocity}
                            </p>
                            <span className="text-xs text-slate-500">
                              pts/sprint
                            </span>
                          </div>
                          {velocityChange !== 0 && (
                            <p
                              className={cn(
                                'text-xs mt-0.5',
                                velocityChange > 0
                                  ? 'text-emerald-600'
                                  : 'text-red-600'
                              )}
                            >
                              {velocityChange > 0 ? '+' : ''}
                              {velocityChange}% vs baseline (
                              {sprint.baselineVelocity})
                            </p>
                          )}
                          {velocityChange === 0 && sprint.baselineVelocity > 0 && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Baseline: {sprint.baselineVelocity}
                            </p>
                          )}
                        </div>
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Defect Rate</p>
                          <p className="text-xl font-bold text-slate-900">
                            {sprint.defectRate}%
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Baseline: 12%
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">
                            Dev Satisfaction
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            {sprint.satisfaction}/10
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Baseline: 6.2/10
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Completion</p>
                          <p className="text-xl font-bold text-slate-900">
                            {completionPct}%
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sprint.storyPointsCompleted}/{sprint.storyPointsPlanned}{' '}
                            pts
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Planned state hint */}
                  {sprint.status === 'planned' && (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center">
                      <Timer className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        This sprint has not started yet. Change the status to{' '}
                        <span className="font-medium text-slate-700">Active</span>{' '}
                        when work begins, then record metrics as the sprint progresses.
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* Create Sprint Dialog                                            */}
      {/* ============================================================== */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Create New Sprint
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a new evaluation sprint for your AI coding agent pilot.
              Each sprint typically covers a 2-week window.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sprint-name" className="text-slate-700">
                Sprint Name
              </Label>
              <Input
                id="sprint-name"
                placeholder={`Sprint ${sprints.length + 1}`}
                value={newSprintForm.name}
                onChange={(e) =>
                  setNewSprintForm((f) => ({ ...f, name: e.target.value }))
                }
                className="border-slate-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sprint-start" className="text-slate-700">
                  Start Date
                </Label>
                <Input
                  id="sprint-start"
                  type="date"
                  value={newSprintForm.startDate}
                  onChange={(e) =>
                    setNewSprintForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint-end" className="text-slate-700">
                  End Date
                </Label>
                <Input
                  id="sprint-end"
                  type="date"
                  value={newSprintForm.endDate}
                  onChange={(e) =>
                    setNewSprintForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="border-slate-200"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sprint-status" className="text-slate-700">
                  Status
                </Label>
                <Select
                  id="sprint-status"
                  value={newSprintForm.status}
                  onValueChange={(val) =>
                    setNewSprintForm((f) => ({
                      ...f,
                      status: val as SprintStatus,
                    }))
                  }
                  className="border-slate-200"
                >
                  <SelectOption value="planned">Planned</SelectOption>
                  <SelectOption value="active">Active</SelectOption>
                  <SelectOption value="completed">Completed</SelectOption>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint-points" className="text-slate-700">
                  Story Points Planned
                </Label>
                <Input
                  id="sprint-points"
                  type="number"
                  min="0"
                  placeholder="40"
                  value={newSprintForm.storyPointsPlanned}
                  onChange={(e) =>
                    setNewSprintForm((f) => ({
                      ...f,
                      storyPointsPlanned: e.target.value,
                    }))
                  }
                  className="border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint-baseline" className="text-slate-700">
                Baseline Velocity (pts/sprint without AI)
              </Label>
              <Input
                id="sprint-baseline"
                type="number"
                min="0"
                placeholder="21"
                value={newSprintForm.baselineVelocity}
                onChange={(e) =>
                  setNewSprintForm((f) => ({
                    ...f,
                    baselineVelocity: e.target.value,
                  }))
                }
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint-goals" className="text-slate-700">
                Sprint Goals (one per line)
              </Label>
              <textarea
                id="sprint-goals"
                rows={3}
                placeholder="API endpoint generation&#10;Unit test writing&#10;Code review automation"
                value={newSprintForm.goalsText}
                onChange={(e) =>
                  setNewSprintForm((f) => ({ ...f, goalsText: e.target.value }))
                }
                className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-slate-200 text-slate-600"
            >
              Cancel
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleCreateSprint}
              disabled={!newSprintForm.startDate || !newSprintForm.endDate}
            >
              Create Sprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* Edit Metrics Dialog                                              */}
      {/* ============================================================== */}
      <Dialog open={showEditMetricsDialog} onOpenChange={setShowEditMetricsDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Edit Sprint Metrics
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Record actual metrics from this sprint. Compare AI-assisted results
              against your baseline to measure improvement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-velocity" className="text-slate-700">
                  Velocity (pts/sprint)
                </Label>
                <Input
                  id="edit-velocity"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={editMetricsForm.velocity}
                  onChange={(e) =>
                    setEditMetricsForm((f) => ({
                      ...f,
                      velocity: e.target.value,
                    }))
                  }
                  className="border-slate-200"
                />
                <p className="text-xs text-slate-400">
                  Story points delivered this sprint
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-points" className="text-slate-700">
                  Story Points Completed
                </Label>
                <Input
                  id="edit-points"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={editMetricsForm.storyPointsCompleted}
                  onChange={(e) =>
                    setEditMetricsForm((f) => ({
                      ...f,
                      storyPointsCompleted: e.target.value,
                    }))
                  }
                  className="border-slate-200"
                />
                <p className="text-xs text-slate-400">
                  Accepted story points
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-defect" className="text-slate-700">
                  Defect Rate (%)
                </Label>
                <Input
                  id="edit-defect"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  value={editMetricsForm.defectRate}
                  onChange={(e) =>
                    setEditMetricsForm((f) => ({
                      ...f,
                      defectRate: e.target.value,
                    }))
                  }
                  className="border-slate-200"
                />
                <p className="text-xs text-slate-400">
                  Percentage of stories with defects (baseline: 12%)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-satisfaction" className="text-slate-700">
                  Dev Satisfaction (1-10)
                </Label>
                <Input
                  id="edit-satisfaction"
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  placeholder="0"
                  value={editMetricsForm.satisfaction}
                  onChange={(e) =>
                    setEditMetricsForm((f) => ({
                      ...f,
                      satisfaction: e.target.value,
                    }))
                  }
                  className="border-slate-200"
                />
                <p className="text-xs text-slate-400">
                  Average developer satisfaction score (baseline: 6.2)
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditMetricsDialog(false)}
              className="border-slate-200 text-slate-600"
            >
              Cancel
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleSaveMetrics}
            >
              Save Metrics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* Delete Confirmation Dialog                                       */}
      {/* ============================================================== */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Delete Sprint
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Are you sure you want to delete this sprint? This action cannot be
              undone and all associated metrics will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-slate-200 text-slate-600"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteSprint}
            >
              Delete Sprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
