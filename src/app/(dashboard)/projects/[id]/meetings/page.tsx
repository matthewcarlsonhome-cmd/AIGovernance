'use client';

import * as React from 'react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectOption } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Calendar,
  Users,
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type {
  MeetingNote,
  MeetingType,
  ActionItem,
  ActionItemStatus,
  ActionItemPriority,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MEETING_TYPE_OPTIONS: { value: MeetingType; label: string }[] = [
  { value: 'kickoff', label: 'Kickoff' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'gate_review', label: 'Gate Review' },
  { value: 'executive_briefing', label: 'Executive Briefing' },
  { value: 'sprint_review', label: 'Sprint Review' },
  { value: 'general', label: 'General' },
  { value: 'retrospective', label: 'Retrospective' },
];

const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  kickoff: 'Kickoff',
  discovery: 'Discovery',
  gate_review: 'Gate Review',
  executive_briefing: 'Executive Briefing',
  sprint_review: 'Sprint Review',
  general: 'General',
  retrospective: 'Retrospective',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getMeetingTypeBadgeClasses(type: MeetingType): string {
  switch (type) {
    case 'kickoff':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25';
    case 'discovery':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/25';
    case 'gate_review':
      return 'bg-violet-500/15 text-violet-700 border-violet-500/25';
    case 'executive_briefing':
      return 'bg-pink-500/15 text-pink-700 border-pink-500/25';
    case 'sprint_review':
      return 'bg-amber-500/15 text-amber-700 border-amber-500/25';
    case 'general':
      return 'bg-slate-500/15 text-slate-700 border-slate-500/25';
    case 'retrospective':
      return 'bg-orange-500/15 text-orange-700 border-orange-500/25';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

function getStatusBadgeClasses(status: ActionItemStatus): string {
  switch (status) {
    case 'open':
      return 'bg-slate-500/15 text-slate-700 border-slate-500/25';
    case 'in_progress':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/25';
    case 'complete':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25';
    case 'cancelled':
      return 'bg-gray-500/15 text-gray-500 border-gray-500/25';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

function getPriorityBadgeClasses(priority: ActionItemPriority): string {
  switch (priority) {
    case 'low':
      return 'bg-slate-500/15 text-slate-700 border-slate-500/25';
    case 'medium':
      return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/25';
    case 'high':
      return 'bg-orange-500/15 text-orange-700 border-orange-500/25';
    case 'urgent':
      return 'bg-red-500/15 text-red-700 border-red-500/25';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

const STATUS_LABELS: Record<ActionItemStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  complete: 'Complete',
  cancelled: 'Cancelled',
};

const PRIORITY_LABELS: Record<ActionItemPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

function getStatusIcon(status: ActionItemStatus): React.ReactNode {
  switch (status) {
    case 'open':
      return <Circle className="h-3.5 w-3.5 text-slate-500" />;
    case 'in_progress':
      return <Clock className="h-3.5 w-3.5 text-blue-500" />;
    case 'complete':
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case 'cancelled':
      return <AlertCircle className="h-3.5 w-3.5 text-gray-400" />;
  }
}

function cycleStatus(status: ActionItemStatus): ActionItemStatus {
  switch (status) {
    case 'open':
      return 'in_progress';
    case 'in_progress':
      return 'complete';
    case 'complete':
      return 'open';
    case 'cancelled':
      return 'open';
  }
}

function isOverdue(item: ActionItem): boolean {
  if (!item.due_date) return false;
  if (item.status === 'complete' || item.status === 'cancelled') return false;
  return new Date(item.due_date) < new Date();
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_MEETINGS: MeetingNote[] = [
  {
    id: 'mtg-1',
    project_id: 'proj-1',
    title: 'Kickoff Meeting',
    meeting_date: '2026-01-06T10:00:00Z',
    meeting_type: 'kickoff',
    attendees: [
      { name: 'Sarah Chen', role: 'Project Lead' },
      { name: 'James Wilson', role: 'IT Security Lead' },
      { name: 'Maria Garcia', role: 'Legal Counsel' },
      { name: 'Alex Kim', role: 'Engineering Lead' },
      { name: 'David Park', role: 'Executive Sponsor' },
      { name: 'Lisa Zhang', role: 'Marketing Director' },
    ],
    notes:
      'Introduced the AI governance engagement and outlined the three-phase approach: Discovery, Sandbox Setup, and Pilot Execution. Discussed high-level timeline targets and assigned initial workstream owners. Agreed on bi-weekly executive check-ins and weekly working sessions. David Park emphasized the importance of security-first approach and early legal review.',
    summary: null,
    created_by: null,
    created_at: '2026-01-06T10:00:00Z',
    updated_at: '2026-01-06T10:00:00Z',
  },
  {
    id: 'mtg-2',
    project_id: 'proj-1',
    title: 'Infrastructure Discovery Session',
    meeting_date: '2026-01-10T14:00:00Z',
    meeting_type: 'discovery',
    attendees: [
      { name: 'Sarah Chen', role: 'Project Lead' },
      { name: 'James Wilson', role: 'IT Security Lead' },
      { name: 'Alex Kim', role: 'Engineering Lead' },
      { name: 'Tom Bradley', role: 'DevOps Lead' },
    ],
    notes:
      'Deep dive into current infrastructure: AWS-based, running EKS for container orchestration. Reviewed existing VPC architecture and identified gaps for AI sandbox isolation. Discussed network segmentation requirements and egress filtering capabilities. Tom outlined existing CI/CD pipeline that would need modification for AI-assisted workflows. Key finding: current DLP tools may not cover AI API traffic patterns.',
    summary: null,
    created_by: null,
    created_at: '2026-01-10T14:00:00Z',
    updated_at: '2026-01-10T14:00:00Z',
  },
  {
    id: 'mtg-3',
    project_id: 'proj-1',
    title: 'Security Deep Dive',
    meeting_date: '2026-01-15T10:00:00Z',
    meeting_type: 'discovery',
    attendees: [
      { name: 'Sarah Chen', role: 'Project Lead' },
      { name: 'James Wilson', role: 'IT Security Lead' },
      { name: 'Rachel Torres', role: 'Security Analyst' },
      { name: 'Alex Kim', role: 'Engineering Lead' },
      { name: 'Maria Garcia', role: 'Legal Counsel' },
    ],
    notes:
      'Reviewed security posture for AI tool integration. Identified key concerns: API key management, data classification for code repositories, and audit logging requirements. Maria raised compliance implications for SOC 2 Type II certification. Discussed managed-settings.json configuration to restrict Claude Code capabilities. Need to evaluate DLP rules for outbound API calls. Rachel will conduct a threat model analysis specific to AI coding assistants.',
    summary: null,
    created_by: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'mtg-4',
    project_id: 'proj-1',
    title: 'Gate 1 Readiness Review',
    meeting_date: '2026-01-24T09:00:00Z',
    meeting_type: 'gate_review',
    attendees: [
      { name: 'Sarah Chen', role: 'Project Lead' },
      { name: 'James Wilson', role: 'IT Security Lead' },
      { name: 'Maria Garcia', role: 'Legal Counsel' },
      { name: 'Alex Kim', role: 'Engineering Lead' },
      { name: 'David Park', role: 'Executive Sponsor' },
      { name: 'Rachel Torres', role: 'Security Analyst' },
      { name: 'Tom Bradley', role: 'DevOps Lead' },
    ],
    notes:
      'Gate 1 checkpoint review for Discovery phase completion. All assessment questionnaires completed. Feasibility score: 72/100 (Moderate). Key gaps identified in DLP coverage and incident response procedures. Legal review of AUP is 80% complete. Decision: Conditional pass - proceed to sandbox setup with remediation items tracked. David approved moving forward with the caveat that DLP gaps must be closed before pilot.',
    summary: null,
    created_by: null,
    created_at: '2026-01-24T09:00:00Z',
    updated_at: '2026-01-24T09:00:00Z',
  },
  {
    id: 'mtg-5',
    project_id: 'proj-1',
    title: 'Executive Status Update',
    meeting_date: '2026-01-31T15:00:00Z',
    meeting_type: 'executive_briefing',
    attendees: [
      { name: 'Sarah Chen', role: 'Project Lead' },
      { name: 'David Park', role: 'Executive Sponsor' },
      { name: 'Jennifer Liu', role: 'VP Engineering' },
    ],
    notes:
      'Monthly executive status update. Presented progress through Discovery phase and Gate 1 conditional approval. Shared feasibility scorecard and remediation roadmap. Jennifer requested a projected ROI analysis by next meeting. David wants a risk heat map included in the next board update. Timeline remains on track for sandbox deployment in mid-February.',
    summary: null,
    created_by: null,
    created_at: '2026-01-31T15:00:00Z',
    updated_at: '2026-01-31T15:00:00Z',
  },
];

const DEMO_ACTION_ITEMS: ActionItem[] = [
  // Kickoff Meeting (mtg-1) - 3 action items
  {
    id: 'ai-1',
    meeting_id: 'mtg-1',
    project_id: 'proj-1',
    title: 'Distribute project charter and timeline to all stakeholders',
    assigned_to: 'user-1',
    assigned_to_name: 'Sarah Chen',
    status: 'complete',
    priority: 'high',
    due_date: '2026-01-08',
    description: null,
    linked_task_id: null,
    completed_at: '2026-01-07T16:00:00Z',
    created_at: '2026-01-06T10:00:00Z',
    updated_at: '2026-01-07T16:00:00Z',
  },
  {
    id: 'ai-2',
    meeting_id: 'mtg-1',
    project_id: 'proj-1',
    title: 'Schedule discovery interviews with department heads',
    assigned_to: 'user-1',
    assigned_to_name: 'Sarah Chen',
    status: 'complete',
    priority: 'medium',
    due_date: '2026-01-10',
    description: null,
    linked_task_id: null,
    completed_at: '2026-01-09T11:00:00Z',
    created_at: '2026-01-06T10:00:00Z',
    updated_at: '2026-01-09T11:00:00Z',
  },
  {
    id: 'ai-3',
    meeting_id: 'mtg-1',
    project_id: 'proj-1',
    title: 'Set up shared project workspace and document repository',
    assigned_to: 'user-4',
    assigned_to_name: 'Alex Kim',
    status: 'complete',
    priority: 'medium',
    due_date: '2026-01-09',
    description: null,
    linked_task_id: null,
    completed_at: '2026-01-08T14:00:00Z',
    created_at: '2026-01-06T10:00:00Z',
    updated_at: '2026-01-08T14:00:00Z',
  },
  // Infrastructure Discovery (mtg-2) - 4 action items
  {
    id: 'ai-4',
    meeting_id: 'mtg-2',
    project_id: 'proj-1',
    title: 'Document current VPC architecture and network topology',
    assigned_to: 'user-6',
    assigned_to_name: 'Tom Bradley',
    status: 'complete',
    priority: 'high',
    due_date: '2026-01-14',
    description: null,
    linked_task_id: null,
    completed_at: '2026-01-13T17:00:00Z',
    created_at: '2026-01-10T14:00:00Z',
    updated_at: '2026-01-13T17:00:00Z',
  },
  {
    id: 'ai-5',
    meeting_id: 'mtg-2',
    project_id: 'proj-1',
    title: 'Evaluate DLP tool coverage for AI API traffic patterns',
    assigned_to: 'user-2',
    assigned_to_name: 'James Wilson',
    status: 'in_progress',
    priority: 'urgent',
    due_date: '2026-01-20',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-10T14:00:00Z',
    updated_at: '2026-01-18T09:00:00Z',
  },
  {
    id: 'ai-6',
    meeting_id: 'mtg-2',
    project_id: 'proj-1',
    title: 'Draft sandbox network isolation design document',
    assigned_to: 'user-6',
    assigned_to_name: 'Tom Bradley',
    status: 'in_progress',
    priority: 'high',
    due_date: '2026-01-22',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-10T14:00:00Z',
    updated_at: '2026-01-19T10:00:00Z',
  },
  {
    id: 'ai-7',
    meeting_id: 'mtg-2',
    project_id: 'proj-1',
    title: 'Identify CI/CD pipeline modifications for AI-assisted workflows',
    assigned_to: 'user-4',
    assigned_to_name: 'Alex Kim',
    status: 'open',
    priority: 'medium',
    due_date: '2026-01-25',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-10T14:00:00Z',
    updated_at: '2026-01-10T14:00:00Z',
  },
  // Security Deep Dive (mtg-3) - 3 action items
  {
    id: 'ai-8',
    meeting_id: 'mtg-3',
    project_id: 'proj-1',
    title: 'Conduct threat model analysis for AI coding assistants',
    assigned_to: 'user-7',
    assigned_to_name: 'Rachel Torres',
    status: 'in_progress',
    priority: 'urgent',
    due_date: '2026-01-28',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-22T08:00:00Z',
  },
  {
    id: 'ai-9',
    meeting_id: 'mtg-3',
    project_id: 'proj-1',
    title: 'Define data classification tiers for code repositories',
    assigned_to: 'user-2',
    assigned_to_name: 'James Wilson',
    status: 'open',
    priority: 'high',
    due_date: '2026-01-30',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'ai-10',
    meeting_id: 'mtg-3',
    project_id: 'proj-1',
    title: 'Review SOC 2 implications and draft compliance addendum',
    assigned_to: 'user-3',
    assigned_to_name: 'Maria Garcia',
    status: 'open',
    priority: 'high',
    due_date: '2026-02-01',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  // Gate 1 Readiness Review (mtg-4) - 2 action items
  {
    id: 'ai-11',
    meeting_id: 'mtg-4',
    project_id: 'proj-1',
    title: 'Close DLP coverage gaps before pilot phase begins',
    assigned_to: 'user-2',
    assigned_to_name: 'James Wilson',
    status: 'open',
    priority: 'urgent',
    due_date: '2026-02-07',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-24T09:00:00Z',
    updated_at: '2026-01-24T09:00:00Z',
  },
  {
    id: 'ai-12',
    meeting_id: 'mtg-4',
    project_id: 'proj-1',
    title: 'Finalize AUP legal review and obtain sign-off',
    assigned_to: 'user-3',
    assigned_to_name: 'Maria Garcia',
    status: 'in_progress',
    priority: 'high',
    due_date: '2026-02-05',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-24T09:00:00Z',
    updated_at: '2026-01-28T14:00:00Z',
  },
  // Executive Status Update (mtg-5) - 2 action items
  {
    id: 'ai-13',
    meeting_id: 'mtg-5',
    project_id: 'proj-1',
    title: 'Prepare projected ROI analysis for next executive meeting',
    assigned_to: 'user-1',
    assigned_to_name: 'Sarah Chen',
    status: 'open',
    priority: 'high',
    due_date: '2026-02-12',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-31T15:00:00Z',
    updated_at: '2026-01-31T15:00:00Z',
  },
  {
    id: 'ai-14',
    meeting_id: 'mtg-5',
    project_id: 'proj-1',
    title: 'Generate risk heat map for board update presentation',
    assigned_to: 'user-1',
    assigned_to_name: 'Sarah Chen',
    status: 'open',
    priority: 'medium',
    due_date: '2026-02-14',
    description: null,
    linked_task_id: null,
    completed_at: null,
    created_at: '2026-01-31T15:00:00Z',
    updated_at: '2026-01-31T15:00:00Z',
  },
];

/* ------------------------------------------------------------------ */
/*  New Meeting Form State                                             */
/* ------------------------------------------------------------------ */

interface NewMeetingForm {
  title: string;
  date: string;
  type: MeetingType;
  attendees: string;
  notes: string;
}

const EMPTY_FORM: NewMeetingForm = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  type: 'general',
  attendees: '',
  notes: '',
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function MeetingsPage(): React.ReactElement {
  const [meetings, setMeetings] = useState<MeetingNote[]>(DEMO_MEETINGS);
  const [actionItems, setActionItems] = useState<ActionItem[]>(DEMO_ACTION_ITEMS);
  const [activeTab, setActiveTab] = useState('meetings');
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

  // Filters
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NewMeetingForm>(EMPTY_FORM);

  // Inline action item form
  const [addingActionForMeeting, setAddingActionForMeeting] = useState<string | null>(null);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [newActionPriority, setNewActionPriority] = useState<ActionItemPriority>('medium');
  const [newActionDueDate, setNewActionDueDate] = useState('');

  // Inline note editing state
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  /* ---------------------------------------------------------------- */
  /*  Computed                                                         */
  /* ---------------------------------------------------------------- */

  const filteredMeetings = meetings
    .filter((m) => meetingTypeFilter === 'all' || m.meeting_type === meetingTypeFilter)
    .sort((a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime());

  const filteredActionItems = actionItems
    .filter((ai) => statusFilter === 'all' || ai.status === statusFilter)
    .filter((ai) => priorityFilter === 'all' || ai.priority === priorityFilter);

  const openCount = actionItems.filter((ai) => ai.status === 'open').length;
  const inProgressCount = actionItems.filter((ai) => ai.status === 'in_progress').length;
  const completeCount = actionItems.filter((ai) => ai.status === 'complete').length;

  function getActionItemsForMeeting(meetingId: string): ActionItem[] {
    return actionItems.filter((ai) => ai.meeting_id === meetingId);
  }

  function getMeetingTitle(meetingId: string): string {
    const meeting = meetings.find((m) => m.id === meetingId);
    return meeting ? meeting.title : 'Unknown Meeting';
  }

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */

  function addMeeting(): void {
    if (!formData.title.trim()) return;

    const attendeeList = formData.attendees
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0)
      .map((name) => ({ name }));

    const newMeeting: MeetingNote = {
      id: `mtg-${Date.now()}`,
      project_id: 'proj-1',
      title: formData.title,
      meeting_date: new Date(formData.date).toISOString(),
      meeting_type: formData.type,
      attendees: attendeeList,
      notes: formData.notes,
      summary: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMeetings((prev) => [...prev, newMeeting]);
    setFormData(EMPTY_FORM);
    setDialogOpen(false);
  }

  function deleteMeeting(meetingId: string): void {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    setActionItems((prev) => prev.filter((ai) => ai.meeting_id !== meetingId));
    if (expandedMeetingId === meetingId) {
      setExpandedMeetingId(null);
    }
  }

  function updateMeeting(meetingId: string, updates: Partial<MeetingNote>): void {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
      )
    );
  }

  function addActionItem(meetingId: string): void {
    if (!newActionTitle.trim()) return;

    const newItem: ActionItem = {
      id: `ai-${Date.now()}`,
      meeting_id: meetingId,
      project_id: 'proj-1',
      title: newActionTitle,
      description: null,
      assigned_to: null,
      assigned_to_name: newActionAssignee || null,
      status: 'open',
      priority: newActionPriority,
      due_date: newActionDueDate || null,
      linked_task_id: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setActionItems((prev) => [...prev, newItem]);
    setNewActionTitle('');
    setNewActionAssignee('');
    setNewActionPriority('medium');
    setNewActionDueDate('');
    setAddingActionForMeeting(null);
  }

  function updateActionItemStatus(itemId: string): void {
    setActionItems((prev) =>
      prev.map((ai) => {
        if (ai.id !== itemId) return ai;
        const newStatus = cycleStatus(ai.status);
        return {
          ...ai,
          status: newStatus,
          completed_at: newStatus === 'complete' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        };
      })
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-slate-900" />
          Meeting Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track meeting notes, decisions, and action items across your consulting engagement.
        </p>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="meetings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="meetings">
            <Calendar className="h-4 w-4 mr-1.5" />
            Meetings
          </TabsTrigger>
          <TabsTrigger value="action-items">
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Action Items
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  MEETINGS TAB                                                 */}
        {/* ============================================================ */}
        <TabsContent value="meetings">
          <div className="flex flex-col gap-4">
            {/* Meetings Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Meeting Notes</h2>
                <p className="text-sm text-slate-500">
                  {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger
                  className={cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
                    'bg-slate-900 text-white shadow hover:bg-slate-800',
                    'h-9 px-4 py-2'
                  )}
                >
                  <Plus className="h-4 w-4" />
                  New Meeting
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>New Meeting</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="meeting-title">Title</Label>
                      <Input
                        id="meeting-title"
                        placeholder="Meeting title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="meeting-date">Date</Label>
                        <Input
                          id="meeting-date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meeting-type">Meeting Type</Label>
                        <Select
                          id="meeting-type"
                          value={formData.type}
                          onValueChange={(val: string) =>
                            setFormData({ ...formData, type: val as MeetingType })
                          }
                        >
                          {MEETING_TYPE_OPTIONS.map((opt) => (
                            <SelectOption key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectOption>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meeting-attendees">
                        Attendees{' '}
                        <span className="text-slate-500 font-normal">(comma-separated)</span>
                      </Label>
                      <Input
                        id="meeting-attendees"
                        placeholder="e.g. Sarah Chen, James Wilson, Alex Kim"
                        value={formData.attendees}
                        onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meeting-notes">Notes</Label>
                      <Textarea
                        id="meeting-notes"
                        placeholder="Meeting notes, decisions, key discussion points..."
                        className="min-h-[120px]"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={addMeeting}>Save Meeting</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Meeting Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select
                value={meetingTypeFilter}
                onValueChange={setMeetingTypeFilter}
                className="w-[200px]"
              >
                <SelectOption value="all">All Types</SelectOption>
                {MEETING_TYPE_OPTIONS.map((opt) => (
                  <SelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectOption>
                ))}
              </Select>
            </div>

            {/* Meeting Cards */}
            {filteredMeetings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-500">No meetings found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredMeetings.map((meeting) => {
                  const isExpanded = expandedMeetingId === meeting.id;
                  const meetingActions = getActionItemsForMeeting(meeting.id);

                  return (
                    <Card key={meeting.id}>
                      {/* Card Summary Row */}
                      <CardHeader
                        className="cursor-pointer"
                        onClick={() =>
                          setExpandedMeetingId(isExpanded ? null : meeting.id)
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-base">{meeting.title}</CardTitle>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  getMeetingTypeBadgeClasses(meeting.meeting_type)
                                )}
                              >
                                {MEETING_TYPE_LABELS[meeting.meeting_type]}
                              </Badge>
                            </div>
                            <CardDescription className="mt-1.5 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {meeting.attendees.length} attendee
                                {meeting.attendees.length !== 1 ? 's' : ''}
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {meetingActions.length} action item
                                {meetingActions.length !== 1 ? 's' : ''}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(meeting.meeting_date), {
                                  addSuffix: true,
                                })}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (editingMeetingId === meeting.id) {
                                  // Save and exit edit mode
                                  updateMeeting(meeting.id, { notes: editingNotes });
                                  setEditingMeetingId(null);
                                } else {
                                  // Enter edit mode
                                  setExpandedMeetingId(meeting.id);
                                  setEditingMeetingId(meeting.id);
                                  setEditingNotes(meeting.notes || '');
                                }
                              }}
                            >
                              {editingMeetingId === meeting.id ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMeeting(meeting.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <CardContent>
                          <Separator className="mb-4" />

                          {/* Notes - editable when in edit mode */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-slate-900">Notes</h4>
                              {editingMeetingId !== meeting.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900"
                                  onClick={() => {
                                    setEditingMeetingId(meeting.id);
                                    setEditingNotes(meeting.notes || '');
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit Notes
                                </Button>
                              )}
                            </div>
                            {editingMeetingId === meeting.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingNotes}
                                  onChange={(e) => setEditingNotes(e.target.value)}
                                  className="min-h-[120px] text-sm"
                                  placeholder="Add meeting notes, decisions, key discussion points..."
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-slate-900 text-white hover:bg-slate-800"
                                    onClick={() => {
                                      updateMeeting(meeting.id, { notes: editingNotes });
                                      setEditingMeetingId(null);
                                    }}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Save Notes
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingMeetingId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : meeting.notes ? (
                              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                                {meeting.notes}
                              </p>
                            ) : (
                              <button
                                className="text-sm text-slate-400 hover:text-slate-600 italic cursor-pointer"
                                onClick={() => {
                                  setEditingMeetingId(meeting.id);
                                  setEditingNotes('');
                                }}
                              >
                                Click to add notes...
                              </button>
                            )}
                          </div>

                          {/* Attendees */}
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">
                              Attendees
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {meeting.attendees.map((att, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-slate-50"
                                >
                                  {att.name}
                                  {att.role && (
                                    <span className="text-slate-500 ml-1">
                                      ({att.role})
                                    </span>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Action Items for this Meeting */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-slate-900">
                                Action Items ({meetingActions.length})
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setAddingActionForMeeting(
                                    addingActionForMeeting === meeting.id ? null : meeting.id
                                  )
                                }
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add Action Item
                              </Button>
                            </div>

                            {/* Inline Add Action Item Form */}
                            {addingActionForMeeting === meeting.id && (
                              <Card className="mb-3 border-dashed">
                                <CardContent className="p-4">
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5 sm:col-span-2">
                                      <Label className="text-xs">Title</Label>
                                      <Input
                                        placeholder="Action item title"
                                        value={newActionTitle}
                                        onChange={(e) => setNewActionTitle(e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs">Assigned To</Label>
                                      <Input
                                        placeholder="Name"
                                        value={newActionAssignee}
                                        onChange={(e) => setNewActionAssignee(e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs">Due Date</Label>
                                      <Input
                                        type="date"
                                        value={newActionDueDate}
                                        onChange={(e) => setNewActionDueDate(e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs">Priority</Label>
                                      <Select
                                        value={newActionPriority}
                                        onValueChange={(val: string) =>
                                          setNewActionPriority(val as ActionItemPriority)
                                        }
                                      >
                                        <SelectOption value="low">Low</SelectOption>
                                        <SelectOption value="medium">Medium</SelectOption>
                                        <SelectOption value="high">High</SelectOption>
                                        <SelectOption value="urgent">Urgent</SelectOption>
                                      </Select>
                                    </div>
                                    <div className="flex items-end">
                                      <Button
                                        size="sm"
                                        onClick={() => addActionItem(meeting.id)}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {meetingActions.length === 0 ? (
                              <p className="text-xs text-slate-500 py-2">
                                No action items for this meeting.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {meetingActions.map((item) => (
                                  <div
                                    key={item.id}
                                    className={cn(
                                      'flex items-center justify-between rounded-lg border px-3 py-2',
                                      isOverdue(item) && 'border-red-300 bg-red-50/50'
                                    )}
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <button
                                        onClick={() => updateActionItemStatus(item.id)}
                                        className="shrink-0"
                                        title={`Status: ${STATUS_LABELS[item.status]} (click to change)`}
                                      >
                                        {getStatusIcon(item.status)}
                                      </button>
                                      <span
                                        className={cn(
                                          'text-sm truncate',
                                          item.status === 'complete' &&
                                            'line-through text-slate-500'
                                        )}
                                      >
                                        {item.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                      {item.assigned_to_name && (
                                        <span className="text-xs text-slate-500 hidden sm:inline">
                                          {item.assigned_to_name}
                                        </span>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'text-[10px]',
                                          getPriorityBadgeClasses(item.priority)
                                        )}
                                      >
                                        {PRIORITY_LABELS[item.priority]}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'text-[10px] cursor-pointer',
                                          getStatusBadgeClasses(item.status)
                                        )}
                                        onClick={() => updateActionItemStatus(item.id)}
                                      >
                                        {STATUS_LABELS[item.status]}
                                      </Badge>
                                      {item.due_date && (
                                        <span
                                          className={cn(
                                            'text-xs',
                                            isOverdue(item)
                                              ? 'text-red-600 font-medium'
                                              : 'text-slate-500'
                                          )}
                                        >
                                          {format(new Date(item.due_date), 'MMM d')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  ACTION ITEMS TAB                                             */}
        {/* ============================================================ */}
        <TabsContent value="action-items">
          <div className="flex flex-col gap-4">
            {/* Action Items Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Action Items</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs bg-slate-500/15 text-slate-700 border-slate-500/25"
                  >
                    {openCount} Open
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-500/15 text-blue-700 border-blue-500/25"
                  >
                    {inProgressCount} In Progress
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
                  >
                    {completeCount} Complete
                  </Badge>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="w-[160px]"
              >
                <SelectOption value="all">All Statuses</SelectOption>
                <SelectOption value="open">Open</SelectOption>
                <SelectOption value="in_progress">In Progress</SelectOption>
                <SelectOption value="complete">Complete</SelectOption>
                <SelectOption value="cancelled">Cancelled</SelectOption>
              </Select>
              <Select
                value={priorityFilter}
                onValueChange={setPriorityFilter}
                className="w-[160px]"
              >
                <SelectOption value="all">All Priorities</SelectOption>
                <SelectOption value="low">Low</SelectOption>
                <SelectOption value="medium">Medium</SelectOption>
                <SelectOption value="high">High</SelectOption>
                <SelectOption value="urgent">Urgent</SelectOption>
              </Select>
            </div>

            {/* Action Items Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Title</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Meeting</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActionItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          No action items match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredActionItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className={cn(isOverdue(item) && 'bg-red-50/50')}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateActionItemStatus(item.id)}
                                className="shrink-0"
                                title={`Click to change status`}
                              >
                                {getStatusIcon(item.status)}
                              </button>
                              <span
                                className={cn(
                                  'text-sm',
                                  item.status === 'complete' &&
                                    'line-through text-slate-500'
                                )}
                              >
                                {item.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.assigned_to_name || (
                              <span className="text-slate-500">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                getPriorityBadgeClasses(item.priority)
                              )}
                            >
                              {PRIORITY_LABELS[item.priority]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.due_date ? (
                              <span
                                className={cn(
                                  'text-sm',
                                  isOverdue(item)
                                    ? 'text-red-600 font-medium'
                                    : 'text-slate-900'
                                )}
                              >
                                {format(new Date(item.due_date), 'MMM d, yyyy')}
                                {isOverdue(item) && (
                                  <span className="ml-1.5 text-xs text-red-500">(overdue)</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-sm">No date</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs cursor-pointer',
                                getStatusBadgeClasses(item.status)
                              )}
                              onClick={() => updateActionItemStatus(item.id)}
                            >
                              {STATUS_LABELS[item.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <button
                              className="text-xs text-slate-900 hover:underline"
                              onClick={() => {
                                setActiveTab('meetings');
                                setExpandedMeetingId(item.meeting_id);
                              }}
                            >
                              {getMeetingTitle(item.meeting_id)}
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
