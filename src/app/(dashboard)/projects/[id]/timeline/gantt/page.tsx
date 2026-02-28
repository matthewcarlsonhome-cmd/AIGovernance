'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { CalendarRange, Download, ChevronDown, ChevronRight, Diamond, Plus, Pencil, Trash2, X, Info, Sparkles, List } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTimelineTasks } from '@/hooks/use-timeline';

type TaskStatus = 'complete' | 'in_progress' | 'not_started' | 'blocked';
type ZoomLevel = 'day' | 'week' | 'month';

interface GanttTask {
  id: string;
  title: string;
  phase: string;
  startDay: number; // days from project start
  duration: number;
  status: TaskStatus;
  isMilestone?: boolean;
  assignee?: string;
}

const PHASES = [
  { name: 'Discovery', color: 'bg-violet-500' },
  { name: 'Governance', color: 'bg-blue-500' },
  { name: 'Sandbox Build', color: 'bg-cyan-500' },
  { name: 'Training & Launch', color: 'bg-emerald-500' },
  { name: 'Evaluation', color: 'bg-amber-500' },
  { name: 'Readout', color: 'bg-rose-500' },
];

const DEFAULT_TASKS: GanttTask[] = [
  // Discovery (days 0-4)
  { id: 't1', title: 'Complete assessment questionnaire', phase: 'Discovery', startDay: 0, duration: 3, status: 'complete', assignee: 'Consultant' },
  { id: 't2', title: 'Collect existing documents', phase: 'Discovery', startDay: 1, duration: 2, status: 'complete', assignee: 'Client' },
  { id: 't3', title: 'Identify pilot team', phase: 'Discovery', startDay: 3, duration: 1, status: 'in_progress', assignee: 'Eng Lead' },
  { id: 't4', title: 'Submit vendor terms to Legal', phase: 'Discovery', startDay: 3, duration: 2, status: 'not_started', assignee: 'Legal' },
  // Governance (days 5-11)
  { id: 't5', title: 'Draft AI Acceptable Use Policy', phase: 'Governance', startDay: 5, duration: 3, status: 'in_progress', assignee: 'Consultant' },
  { id: 't6', title: 'Define risk classification tiers', phase: 'Governance', startDay: 5, duration: 2, status: 'not_started', assignee: 'CISO' },
  { id: 't7', title: 'Establish gate review model', phase: 'Governance', startDay: 7, duration: 2, status: 'not_started', assignee: 'Consultant' },
  { id: 't8', title: 'Draft IRP addendum', phase: 'Governance', startDay: 8, duration: 3, status: 'not_started', assignee: 'Security' },
  { id: 't9', title: 'Legal review & sign-off', phase: 'Governance', startDay: 9, duration: 3, status: 'not_started', assignee: 'Legal' },
  // Sandbox Build (days 12-19)
  { id: 't10', title: 'Provision cloud infrastructure', phase: 'Sandbox Build', startDay: 12, duration: 3, status: 'not_started', assignee: 'IT' },
  { id: 't11', title: 'Configure egress & DLP rules', phase: 'Sandbox Build', startDay: 15, duration: 2, status: 'not_started', assignee: 'Security' },
  { id: 't12', title: 'Deploy AI tools to sandbox', phase: 'Sandbox Build', startDay: 15, duration: 2, status: 'not_started', assignee: 'IT' },
  { id: 't13', title: 'Integrate audit logging', phase: 'Sandbox Build', startDay: 17, duration: 2, status: 'not_started', assignee: 'IT' },
  { id: 't14', title: 'Validate sandbox isolation', phase: 'Sandbox Build', startDay: 19, duration: 1, status: 'not_started', assignee: 'Security', isMilestone: true },
  // Training (days 20-26)
  { id: 't15', title: 'Security training sessions', phase: 'Training & Launch', startDay: 20, duration: 2, status: 'not_started', assignee: 'Security' },
  { id: 't16', title: 'Collect AUP signatures', phase: 'Training & Launch', startDay: 20, duration: 3, status: 'not_started', assignee: 'Consultant' },
  { id: 't17', title: 'Baseline metrics collection', phase: 'Training & Launch', startDay: 22, duration: 3, status: 'not_started', assignee: 'Eng Lead' },
  { id: 't18', title: 'Sprint 1 Launch', phase: 'Training & Launch', startDay: 26, duration: 1, status: 'not_started', isMilestone: true },
  // Evaluation (days 27-49)
  { id: 't19', title: 'Sprint 2 execution', phase: 'Evaluation', startDay: 27, duration: 10, status: 'not_started', assignee: 'Engineering' },
  { id: 't20', title: 'Sprint 3 execution', phase: 'Evaluation', startDay: 37, duration: 10, status: 'not_started', assignee: 'Engineering' },
  { id: 't21', title: 'Red team exercise', phase: 'Evaluation', startDay: 47, duration: 3, status: 'not_started', assignee: 'Security' },
  // Readout (days 50-64)
  { id: 't22', title: 'Calculate ROI metrics', phase: 'Readout', startDay: 50, duration: 3, status: 'not_started', assignee: 'Consultant' },
  { id: 't23', title: 'Compile evaluation report', phase: 'Readout', startDay: 53, duration: 5, status: 'not_started', assignee: 'Consultant' },
  { id: 't24', title: 'Prepare executive briefing', phase: 'Readout', startDay: 58, duration: 3, status: 'not_started', assignee: 'Consultant' },
  { id: 't25', title: 'Present to leadership', phase: 'Readout', startDay: 61, duration: 1, status: 'not_started', isMilestone: true },
  { id: 't26', title: 'Vendor negotiation support', phase: 'Readout', startDay: 62, duration: 3, status: 'not_started', assignee: 'Consultant' },
];

const PROJECT_START = new Date(2026, 0, 6); // Jan 6, 2026
const TOTAL_DAYS = 75;
const STORAGE_KEY = 'govai_gantt_tasks';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const statusStyles: Record<TaskStatus, string> = {
  complete: 'bg-emerald-500',
  in_progress: 'bg-blue-500',
  not_started: 'bg-gray-300',
  blocked: 'bg-red-500',
};

const statusLabels: Record<TaskStatus, string> = {
  complete: 'Complete',
  in_progress: 'In Progress',
  not_started: 'Not Started',
  blocked: 'Blocked',
};

const STATUS_CYCLE: TaskStatus[] = ['not_started', 'in_progress', 'complete', 'blocked'];

/* -------------------------------------------------------------------------- */
/*  Task Dialog                                                                */
/* -------------------------------------------------------------------------- */

function TaskDialog({
  open,
  onClose,
  onSave,
  onDelete,
  task,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (task: GanttTask) => void;
  onDelete?: (id: string) => void;
  task: GanttTask | null;
}): React.ReactElement {
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState(PHASES[0].name);
  const [startDay, setStartDay] = useState(0);
  const [duration, setDuration] = useState(3);
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [assignee, setAssignee] = useState('');
  const [isMilestone, setIsMilestone] = useState(false);

  useEffect(() => {
    if (open && task) {
      setTitle(task.title);
      setPhase(task.phase);
      setStartDay(task.startDay);
      setDuration(task.duration);
      setStatus(task.status);
      setAssignee(task.assignee ?? '');
      setIsMilestone(task.isMilestone ?? false);
    } else if (open && !task) {
      setTitle('');
      setPhase(PHASES[0].name);
      setStartDay(0);
      setDuration(3);
      setStatus('not_started');
      setAssignee('');
      setIsMilestone(false);
    }
  }, [open, task]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: task?.id ?? `t-${Date.now()}`,
      title: title.trim(),
      phase,
      startDay: Math.max(0, startDay),
      duration: Math.max(1, duration),
      status,
      assignee: assignee.trim() || undefined,
      isMilestone,
    });
    onClose();
  };

  const startDate = addDays(PROJECT_START, startDay);
  const endDate = addDays(PROJECT_START, startDay + duration);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {task ? 'Edit Task' : 'Add Task'}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {task ? 'Modify task details and scheduling' : 'Add a new task to the project timeline'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-slate-700">Task Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Draft security policy"
              className="mt-1 border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-700">Phase</Label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {PHASES.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-slate-700">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {STATUS_CYCLE.map((s) => (
                  <option key={s} value={s}>{statusLabels[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-700">
                Start Day (from project start)
              </Label>
              <Input
                type="number"
                min={0}
                max={TOTAL_DAYS}
                value={startDay}
                onChange={(e) => setStartDay(Number(e.target.value))}
                className="mt-1 border-slate-200"
              />
              <p className="text-xs text-slate-400 mt-1">
                {formatDate(startDate)}
              </p>
            </div>
            <div>
              <Label className="text-slate-700">Duration (days)</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1 border-slate-200"
              />
              <p className="text-xs text-slate-400 mt-1">
                Ends {formatDate(endDate)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-700">Assignee</Label>
              <Input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="e.g., Security Lead"
                className="mt-1 border-slate-200"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMilestone}
                  onChange={(e) => setIsMilestone(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                />
                <span className="text-sm text-slate-700">Milestone</span>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between">
          <div>
            {task && onDelete && (
              <Button
                variant="outline"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-700">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-slate-900 text-white hover:bg-slate-800"
              disabled={!title.trim()}
            >
              {task ? 'Update' : 'Add'} Task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function GanttPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: fetchedTasks, isLoading, error } = useTimelineTasks(id);
  const [zoom, setZoom] = useState<ZoomLevel>('week');
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [localTasks, setLocalTasks] = useState<GanttTask[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);
  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem('govai_gantt_guide_dismissed');
  });
  const [mobileTaskListOpen, setMobileTaskListOpen] = useState(false);
  const isMobile = useMediaQuery(768);

  // Load tasks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${id}`);
      if (saved) {
        setLocalTasks(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [id]);

  const persist = useCallback((tasks: GanttTask[]) => {
    localStorage.setItem(`${STORAGE_KEY}_${id}`, JSON.stringify(tasks));
  }, [id]);

  if (isLoading && !loaded) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;

  // Priority: localStorage > API > defaults
  const tasks: GanttTask[] = localTasks ?? ((fetchedTasks && fetchedTasks.length > 0) ? fetchedTasks as unknown as GanttTask[] : DEFAULT_TASKS);
  const maxDay = Math.max(TOTAL_DAYS, ...tasks.map(t => t.startDay + t.duration + 5));

  const handleSaveTask = (task: GanttTask) => {
    const existing = tasks.find(t => t.id === task.id);
    let updated: GanttTask[];
    if (existing) {
      updated = tasks.map(t => t.id === task.id ? task : t);
    } else {
      updated = [...tasks, task];
    }
    setLocalTasks(updated);
    persist(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setLocalTasks(updated);
    persist(updated);
  };

  const handleStatusCycle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const currentIdx = STATUS_CYCLE.indexOf(task.status);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t);
    setLocalTasks(updated);
    persist(updated);
  };

  const dayWidth = zoom === 'day' ? 40 : zoom === 'week' ? 28 : 8;
  const totalWidth = maxDay * dayWidth;

  const todayOffset = useMemo(() => {
    const now = new Date(2026, 1, 9); // Feb 9, 2026 for demo
    const diff = Math.floor((now.getTime() - PROJECT_START.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diff, maxDay));
  }, [maxDay]);

  const togglePhase = (phase: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  // Generate date headers
  const dateHeaders = useMemo(() => {
    const headers: { label: string; left: number; width: number }[] = [];
    if (zoom === 'week') {
      for (let d = 0; d < maxDay; d += 7) {
        headers.push({ label: formatDate(addDays(PROJECT_START, d)), left: d * dayWidth, width: 7 * dayWidth });
      }
    } else if (zoom === 'day') {
      for (let d = 0; d < maxDay; d++) {
        headers.push({ label: addDays(PROJECT_START, d).getDate().toString(), left: d * dayWidth, width: dayWidth });
      }
    } else {
      for (let m = 0; m < 4; m++) {
        const monthStart = new Date(2026, m, 1);
        const label = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const startOffset = Math.max(0, Math.floor((monthStart.getTime() - PROJECT_START.getTime()) / (1000 * 60 * 60 * 24)));
        headers.push({ label, left: startOffset * dayWidth, width: 31 * dayWidth });
      }
    }
    return headers;
  }, [zoom, dayWidth, maxDay]);

  const groupedTasks = PHASES.map((phase) => ({
    ...phase,
    tasks: tasks.filter((t) => t.phase === phase.name),
  }));

  // Summary stats
  const completedCount = tasks.filter(t => t.status === 'complete').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const blockedCount = tasks.filter(t => t.status === 'blocked').length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-slate-900" />

            The Big Picture
          </h1>
          <p className="text-slate-500 mt-1">
            {tasks.length} tasks across {PHASES.length} phases
            {completedCount > 0 && <span className="text-emerald-600 ml-2">{completedCount} complete</span>}
            {inProgressCount > 0 && <span className="text-blue-600 ml-2">{inProgressCount} in progress</span>}
            {blockedCount > 0 && <span className="text-red-600 ml-2">{blockedCount} blocked</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => {
              setEditingTask(null);
              setDialogOpen(true);
            }}
            className="bg-slate-900 text-white hover:bg-slate-800 gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            {(['day', 'week', 'month'] as ZoomLevel[]).map((z) => (
              <button key={z} onClick={() => setZoom(z)} className={`px-3 py-1.5 text-sm ${zoom === z ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'}`}>
                {z.charAt(0).toUpperCase() + z.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => {
            const csvRows = ['Title,Phase,Start Day,Duration,Status,Assignee'];
            tasks.forEach((t) => csvRows.push(`"${t.title}","${t.phase}",${t.startDay},${t.duration},${t.status},"${t.assignee ?? ''}"`));
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gantt-export.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}><Download className="h-4 w-4 mr-2" /> Export</Button>
        </div>
      </div>

      {/* How-to guide */}
      {showGuide && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">How to Use the Timeline</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>Click any task bar</strong> to cycle its status: Not Started, In Progress, Complete, Blocked.</li>
                  <li><strong>Click the pencil icon</strong> next to a task name to edit details, reassign, or change dates.</li>
                  <li><strong>Add Task button</strong> creates new tasks and assigns them to a phase and team member.</li>
                  <li><strong>This is your master project plan</strong> -- all tasks here feed into the Progress Tracker on the Overview page. The red dashed line shows today.</li>
                </ul>
                <button onClick={() => { setShowGuide(false); localStorage.setItem('govai_gantt_guide_dismissed', 'true'); }} className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline">
                  Got it, hide this guide
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs flex-wrap">
        {Object.entries(statusStyles).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span>{statusLabels[status as TaskStatus]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <Diamond className="h-3 w-3 text-amber-500 fill-amber-500" />
          <span>Milestone</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto text-slate-400">
          Click a task bar to cycle status. Click <Pencil className="h-3 w-3 inline" /> to edit details.
        </div>
      </div>

      {/* Gantt Chart */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Mobile: toggle button for task list */}
          {isMobile && (
            <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50 md:hidden">
              <button
                onClick={() => setMobileTaskListOpen(!mobileTaskListOpen)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                <List className="h-4 w-4" />
                {mobileTaskListOpen ? 'Hide Task List' : 'Show Task List'}
              </button>
              <span className="text-xs text-slate-400">Scroll timeline horizontally</span>
            </div>
          )}

          {/* Mobile: collapsible task list overlay */}
          {isMobile && mobileTaskListOpen && (
            <div className="border-b bg-slate-50 max-h-64 overflow-y-auto md:hidden">
              <div className="h-10 border-b flex items-center justify-between px-3 text-xs font-medium text-slate-500">
                <span>Task Name</span>
                <span>Actions</span>
              </div>
              {groupedTasks.map((group) => (
                <div key={group.name}>
                  <button onClick={() => togglePhase(group.name)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-slate-50 border-b hover:bg-slate-100">
                    {collapsedPhases.has(group.name) ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    <div className={`w-2.5 h-2.5 rounded ${group.color}`} />
                    {group.name}
                    <Badge variant="outline" className="ml-auto text-[10px]">{group.tasks.length}</Badge>
                  </button>
                  {!collapsedPhases.has(group.name) && group.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 px-3 py-1.5 text-xs border-b hover:bg-slate-50 pl-8 group">
                      {task.isMilestone && <Diamond className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                      <span className="truncate flex-1">{task.title}</span>
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setDialogOpen(true);
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 shrink-0"
                        title="Edit task"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <span className={`h-2 w-2 rounded-full shrink-0 ${statusStyles[task.status]}`} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="flex">
            {/* Left panel - Task list (desktop only) */}
            <div className="hidden md:block w-[300px] shrink-0 border-r bg-slate-50">
              <div className="h-10 border-b flex items-center justify-between px-3 text-xs font-medium text-slate-500">
                <span>Task Name</span>
                <span>Actions</span>
              </div>
              {groupedTasks.map((group) => (
                <div key={group.name}>
                  <button onClick={() => togglePhase(group.name)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-slate-50 border-b hover:bg-slate-100">
                    {collapsedPhases.has(group.name) ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    <div className={`w-2.5 h-2.5 rounded ${group.color}`} />
                    {group.name}
                    <Badge variant="outline" className="ml-auto text-[10px]">{group.tasks.length}</Badge>
                  </button>
                  {!collapsedPhases.has(group.name) && group.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 px-3 py-1.5 text-xs border-b hover:bg-slate-50 pl-8 group">
                      {task.isMilestone && <Diamond className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                      <span className="truncate flex-1">{task.title}</span>
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setDialogOpen(true);
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        title="Edit task"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <span className={`h-2 w-2 rounded-full shrink-0 ${statusStyles[task.status]}`} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Right panel - Timeline */}
            <div className="flex-1 overflow-x-auto">
              <div className="relative" style={{ minWidth: totalWidth }}>
                {/* Date headers */}
                <div className="h-10 border-b relative bg-slate-50">
                  {dateHeaders.map((h, i) => (
                    <div key={i} className="absolute top-0 h-full flex items-center text-xs text-slate-500 border-r px-1" style={{ left: h.left, width: h.width }}>
                      {h.label}
                    </div>
                  ))}
                </div>

                {/* Task bars */}
                {groupedTasks.map((group) => (
                  <div key={group.name}>
                    {/* Phase header row */}
                    <div className="h-[33px] border-b relative bg-slate-50">
                      {group.tasks.length > 0 && (
                        <div
                          className={`absolute top-1 h-[25px] rounded opacity-20 ${group.color}`}
                          style={{
                            left: Math.min(...group.tasks.map((t) => t.startDay)) * dayWidth,
                            width: (Math.max(...group.tasks.map((t) => t.startDay + t.duration)) - Math.min(...group.tasks.map((t) => t.startDay))) * dayWidth,
                          }}
                        />
                      )}
                    </div>
                    {/* Task rows */}
                    {!collapsedPhases.has(group.name) && group.tasks.map((task) => (
                      <div key={task.id} className="h-[29px] border-b relative">
                        {/* Grid lines */}
                        {dateHeaders.map((h, i) => (
                          <div key={i} className="absolute top-0 h-full border-r border-dashed border-slate-200/30" style={{ left: h.left }} />
                        ))}
                        {task.isMilestone ? (
                          <button
                            className="absolute top-1 cursor-pointer hover:scale-110 transition-transform"
                            style={{ left: task.startDay * dayWidth + dayWidth / 2 - 8 }}
                            onClick={() => handleStatusCycle(task.id)}
                            title={`${task.title} (${statusLabels[task.status]}) - click to change status`}
                          >
                            <Diamond className="h-5 w-5 text-amber-500 fill-amber-500" />
                          </button>
                        ) : (
                          <button
                            className={`absolute top-1 h-[20px] rounded-sm ${statusStyles[task.status]} shadow-sm cursor-pointer hover:opacity-80 transition-opacity`}
                            style={{ left: task.startDay * dayWidth + 1, width: Math.max(task.duration * dayWidth - 2, 4) }}
                            title={`${task.title} (${statusLabels[task.status]}) - click to change status`}
                            onClick={() => handleStatusCycle(task.id)}
                          >
                            {task.duration * dayWidth > 60 && (
                              <span className="text-[10px] text-white px-1 truncate block leading-[20px]">{task.title}</span>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Today marker */}
                <div className="absolute top-0 bottom-0 border-l-2 border-red-500 border-dashed z-10" style={{ left: todayOffset * dayWidth }}>
                  <div className="absolute -top-0 -left-[22px] bg-red-500 text-white text-[10px] px-1 rounded">Today</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
      />
    </div>
  );
}
