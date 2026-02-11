'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { CalendarRange, Download, ChevronDown, ChevronRight, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const TASKS: GanttTask[] = [
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
const TOTAL_DAYS = 65;

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

export default function GanttPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: fetchedTasks, isLoading, error } = useTimelineTasks(id);
  const [zoom, setZoom] = useState<ZoomLevel>('week');
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  const tasks: GanttTask[] = (fetchedTasks && fetchedTasks.length > 0) ? fetchedTasks as unknown as GanttTask[] : TASKS;

  const dayWidth = zoom === 'day' ? 40 : zoom === 'week' ? 28 : 8;
  const totalWidth = TOTAL_DAYS * dayWidth;

  const todayOffset = useMemo(() => {
    const now = new Date(2026, 1, 9); // Feb 9, 2026 for demo
    const diff = Math.floor((now.getTime() - PROJECT_START.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diff, TOTAL_DAYS));
  }, []);

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
      for (let d = 0; d < TOTAL_DAYS; d += 7) {
        headers.push({ label: formatDate(addDays(PROJECT_START, d)), left: d * dayWidth, width: 7 * dayWidth });
      }
    } else if (zoom === 'day') {
      for (let d = 0; d < TOTAL_DAYS; d++) {
        headers.push({ label: addDays(PROJECT_START, d).getDate().toString(), left: d * dayWidth, width: dayWidth });
      }
    } else {
      for (let m = 0; m < 3; m++) {
        const monthStart = new Date(2026, m, 1);
        const label = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const startOffset = Math.max(0, Math.floor((monthStart.getTime() - PROJECT_START.getTime()) / (1000 * 60 * 60 * 24)));
        headers.push({ label, left: startOffset * dayWidth, width: 31 * dayWidth });
      }
    }
    return headers;
  }, [zoom, dayWidth]);

  const groupedTasks = PHASES.map((phase) => ({
    ...phase,
    tasks: tasks.filter((t) => t.phase === phase.name),
  }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-slate-900" />
            Project Timeline
          </h1>
          <p className="text-slate-500 mt-1">Interactive Gantt chart - 60 day governance project</p>
        </div>
        <div className="flex gap-2">
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

      {/* Legend */}
      <div className="flex gap-4 text-xs">
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
      </div>

      {/* Gantt Chart */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            {/* Left panel - Task list */}
            <div className="w-[280px] shrink-0 border-r bg-slate-50">
              <div className="h-10 border-b flex items-center px-3 text-xs font-medium text-slate-500">Task Name</div>
              {groupedTasks.map((group) => (
                <div key={group.name}>
                  <button onClick={() => togglePhase(group.name)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-slate-50 border-b hover:bg-slate-100">
                    {collapsedPhases.has(group.name) ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    <div className={`w-2.5 h-2.5 rounded ${group.color}`} />
                    {group.name}
                    <Badge variant="outline" className="ml-auto text-[10px]">{group.tasks.length}</Badge>
                  </button>
                  {!collapsedPhases.has(group.name) && group.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 px-3 py-1.5 text-xs border-b hover:bg-slate-50 pl-8">
                      {task.isMilestone && <Diamond className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                      <span className="truncate flex-1">{task.title}</span>
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
                          <div className="absolute top-1" style={{ left: task.startDay * dayWidth + dayWidth / 2 - 8 }}>
                            <Diamond className="h-5 w-5 text-amber-500 fill-amber-500" />
                          </div>
                        ) : (
                          <div
                            className={`absolute top-1 h-[20px] rounded-sm ${statusStyles[task.status]} shadow-sm`}
                            style={{ left: task.startDay * dayWidth + 1, width: Math.max(task.duration * dayWidth - 2, 4) }}
                            title={`${task.title} (${task.duration}d)`}
                          >
                            {task.duration * dayWidth > 60 && (
                              <span className="text-[10px] text-white px-1 truncate block leading-[20px]">{task.title}</span>
                            )}
                          </div>
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
    </div>
  );
}
