'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  AlertTriangle,
  FileText,
  Shield,
  Settings,
  Users,
  Megaphone,
  Gavel,
  Code2,
  BarChart3,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { UserRole } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type TaskPriority = 'required' | 'recommended' | 'optional';
type TaskStatus = 'action_needed' | 'in_progress' | 'passed' | 'failed' | 'upcoming' | 'completed';

interface DemoTask {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  dueDate: string;
  completedDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  ctaLabel?: string;
  ctaHref?: string;
  blocking?: string;
  blockedBy?: string;
  scheduledPhase?: number;
  failureReason?: string;
}

/* -------------------------------------------------------------------------- */
/*  Role labels                                                               */
/* -------------------------------------------------------------------------- */

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Project Administrator',
  consultant: 'Governance Consultant',
  executive: 'Executive Sponsor',
  it: 'IT / Security Lead',
  legal: 'Legal / Compliance Lead',
  engineering: 'Engineering Lead',
  marketing: 'Communications Lead',
};

/* -------------------------------------------------------------------------- */
/*  Status config                                                              */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  icon: React.ElementType;
  dotClass: string;
  badgeClass: string;
  textClass: string;
}> = {
  action_needed: {
    label: 'Action Needed',
    icon: AlertTriangle,
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    textClass: 'text-blue-700',
  },
  in_progress: {
    label: 'In Progress',
    icon: Loader2,
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    textClass: 'text-amber-700',
  },
  passed: {
    label: 'Passed',
    icon: CheckCircle2,
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textClass: 'text-emerald-700',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    textClass: 'text-red-700',
  },
  upcoming: {
    label: 'Upcoming',
    icon: Clock,
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
    textClass: 'text-slate-500',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textClass: 'text-emerald-700',
  },
};

/* -------------------------------------------------------------------------- */
/*  Role-based task data                                                      */
/* -------------------------------------------------------------------------- */

function getTasksForRole(role: UserRole): DemoTask[] {
  const today = new Date();
  const d = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString();
  };
  const past = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - offset);
    return dt.toISOString();
  };

  const tasksByRole: Record<UserRole, DemoTask[]> = {
    admin: [
      { id: 'a-1', title: 'Invite team members and assign roles', description: 'Add your core team — IT/Security, Legal, Engineering, Executive Sponsor — so they see role-filtered tasks.', assignedBy: 'System', dueDate: d(3), priority: 'required', status: 'action_needed', ctaLabel: 'Manage Team', ctaHref: 'team', blocking: 'All role-specific tasks depend on team setup' },
      { id: 'a-2', title: 'Complete pilot intake scorecard', description: 'Answer 10 questions to classify this pilot by risk level (Fast Track, Standard, or High Risk).', assignedBy: 'System', dueDate: d(5), priority: 'required', status: 'action_needed', ctaLabel: 'Start Intake', ctaHref: 'intake' },
      { id: 'a-3', title: 'Review project setup checklist', description: 'Verify each phase has the required prerequisites and configuration.', assignedBy: 'System', dueDate: d(7), priority: 'recommended', status: 'in_progress', ctaLabel: 'View Setup', ctaHref: 'setup' },
      { id: 'a-4', title: 'Schedule gate review meetings', description: 'Coordinate gate review sessions with stakeholders for Phase 3.', assignedBy: 'System', dueDate: d(21), priority: 'recommended', status: 'upcoming', scheduledPhase: 3 },
      { id: 'a-5', title: 'Archive project and generate final report', description: 'After go/no-go decision, archive project documentation and export final report.', assignedBy: 'System', dueDate: d(60), priority: 'optional', status: 'upcoming', scheduledPhase: 5 },
    ],
    consultant: [
      { id: 'c-1', title: 'Complete readiness questionnaire', description: 'Score organizational readiness across 5 domains: infrastructure, security, governance, engineering, and business.', assignedBy: 'Project Admin', dueDate: d(5), priority: 'required', status: 'in_progress', ctaLabel: 'Start Assessment', ctaHref: 'discovery/questionnaire', blocking: 'Readiness score blocks Phase 2 activities' },
      { id: 'c-2', title: 'Review readiness results and identify gaps', description: 'Analyze domain scores and prioritize remediation items before governance phase.', assignedBy: 'Project Admin', dueDate: d(7), priority: 'required', status: 'action_needed', ctaLabel: 'View Readiness', ctaHref: 'discovery/readiness' },
      { id: 'c-3', title: 'Track prerequisite completion', description: 'Monitor prerequisite checklist and coordinate with team leads on blocking items.', assignedBy: 'Project Admin', dueDate: d(10), priority: 'recommended', status: 'action_needed', ctaLabel: 'Prerequisites', ctaHref: 'discovery/prerequisites' },
      { id: 'c-4', title: 'Draft governance policies', description: 'Create Acceptable Use Policy, Incident Response Plan, and Data Classification Policy.', assignedBy: 'Project Admin', dueDate: d(14), priority: 'required', status: 'upcoming', blockedBy: 'Readiness assessment completion', scheduledPhase: 2 },
      { id: 'c-5', title: 'Map compliance controls', description: 'Map governance controls to applicable frameworks (SOC 2, HIPAA, NIST, GDPR).', assignedBy: 'Project Admin', dueDate: d(18), priority: 'required', status: 'upcoming', scheduledPhase: 2 },
      { id: 'c-6', title: 'Prepare evidence package for gate reviews', description: 'Compile assessment results, policy drafts, and compliance mappings for gate approval.', assignedBy: 'Project Admin', dueDate: d(25), priority: 'required', status: 'upcoming', scheduledPhase: 3 },
    ],
    executive: [
      { id: 'e-1', title: 'Review project scope and risk classification', description: 'Review intake scorecard results and confirm the governance path (Fast Track, Standard, or High Risk).', assignedBy: 'Project Admin', dueDate: d(7), priority: 'required', status: 'action_needed', ctaLabel: 'View Overview', ctaHref: 'overview' },
      { id: 'e-2', title: 'Approve Gate 1: Design Review', description: 'Review readiness scores and governance artifacts. Sign off to proceed to sandbox setup.', assignedBy: 'Governance Consultant', dueDate: d(21), priority: 'required', status: 'upcoming', blockedBy: 'Phase 2 governance artifacts', scheduledPhase: 3 },
      { id: 'e-3', title: 'Approve Gate 3: Launch Authorization', description: 'Final gate review before production deployment. Review executive brief and make go/no-go decision.', assignedBy: 'Governance Consultant', dueDate: d(45), priority: 'required', status: 'upcoming', scheduledPhase: 3 },
      { id: 'e-4', title: 'Review executive decision brief', description: 'One-page brief with feasibility score, risk posture, KPI results, and recommendation.', assignedBy: 'System', dueDate: d(50), priority: 'required', status: 'upcoming', scheduledPhase: 5 },
    ],
    it: [
      { id: 'i-1', title: 'Complete data classification', description: 'Identify and classify data types that AI tools will access. Define sensitivity levels and handling requirements.', assignedBy: 'Project Admin', dueDate: d(10), priority: 'required', status: 'in_progress', ctaLabel: 'Classify Data', ctaHref: 'governance/compliance', blocking: 'Blocks sandbox configuration' },
      { id: 'i-2', title: 'Review security controls', description: 'Audit 9 categories of security controls for AI coding agent deployment readiness.', assignedBy: 'Governance Consultant', dueDate: past(1), priority: 'required', status: 'failed', ctaLabel: 'Review Controls', ctaHref: 'controls', failureReason: 'Overdue: 2 of 9 control categories incomplete' },
      { id: 'i-3', title: 'Configure sandbox environment', description: 'Generate infrastructure files (JSON, TOML, YAML, HCL) for your cloud provider and validate configuration.', assignedBy: 'Project Admin', dueDate: d(25), priority: 'required', status: 'upcoming', blockedBy: 'Data classification and security review', scheduledPhase: 4 },
      { id: 'i-4', title: 'Run sandbox validation checks', description: 'Execute 20+ automated health checks to verify sandbox readiness before pilot launch.', assignedBy: 'Project Admin', dueDate: d(28), priority: 'required', status: 'upcoming', scheduledPhase: 4 },
      { id: 'i-5', title: 'Monitor pilot security metrics', description: 'Track DLP events, access patterns, and security incidents during pilot execution.', assignedBy: 'Project Admin', dueDate: d(40), priority: 'recommended', status: 'upcoming', scheduledPhase: 4 },
    ],
    legal: [
      { id: 'l-1', title: 'Review Acceptable Use Policy draft', description: 'Review and provide feedback on the AUP for AI coding tool usage within the organization.', assignedBy: 'Governance Consultant', dueDate: d(14), priority: 'required', status: 'action_needed', ctaLabel: 'Review Policies', ctaHref: 'governance/policies', blocking: 'Gate 1 approval requires policy sign-off' },
      { id: 'l-2', title: 'Complete compliance framework mapping', description: 'Verify control mappings for SOC 2, HIPAA, NIST, and GDPR frameworks applicable to your organization.', assignedBy: 'Governance Consultant', dueDate: d(16), priority: 'required', status: 'in_progress', ctaLabel: 'Compliance Map', ctaHref: 'governance/compliance' },
      { id: 'l-3', title: 'Review risk register', description: 'Assess identified risks, approve mitigation strategies, and sign off on risk acceptance for low-tier items.', assignedBy: 'Governance Consultant', dueDate: d(18), priority: 'required', status: 'action_needed', ctaLabel: 'Risk Register', ctaHref: 'governance/risk' },
      { id: 'l-4', title: 'Sign off on Gate 2: Data & Security', description: 'Confirm data governance, privacy requirements, and compliance are addressed before sandbox setup.', assignedBy: 'Project Admin', dueDate: d(22), priority: 'required', status: 'upcoming', blockedBy: 'Policy reviews and compliance mapping', scheduledPhase: 3 },
      { id: 'l-5', title: 'Review IP and licensing terms', description: 'Assess intellectual property implications and licensing requirements for AI-generated code.', assignedBy: 'Project Admin', dueDate: d(30), priority: 'recommended', status: 'upcoming', scheduledPhase: 3 },
    ],
    engineering: [
      { id: 'eng-1', title: 'Define pilot project scope', description: 'Select a bounded pilot project, define success criteria, and identify participating developers.', assignedBy: 'Project Admin', dueDate: d(12), priority: 'required', status: 'action_needed', ctaLabel: 'PoC Projects', ctaHref: 'poc/projects' },
      { id: 'eng-2', title: 'Capture baseline metrics', description: 'Record current development velocity, defect rate, code review time, and developer satisfaction before AI tools.', assignedBy: 'Governance Consultant', dueDate: d(14), priority: 'required', status: 'action_needed', ctaLabel: 'View Metrics', ctaHref: 'poc/metrics' },
      { id: 'eng-3', title: 'Set up sandbox environment', description: 'Work with IT to deploy sandbox config files and verify developer tooling access.', assignedBy: 'IT / Security Lead', dueDate: d(28), priority: 'required', status: 'upcoming', blockedBy: 'Sandbox configuration and validation', scheduledPhase: 4 },
      { id: 'eng-4', title: 'Run sprint evaluations', description: 'Track velocity, defect rate, and satisfaction for each sprint during the pilot period.', assignedBy: 'Project Admin', dueDate: d(35), priority: 'required', status: 'upcoming', scheduledPhase: 4 },
      { id: 'eng-5', title: 'Complete tool comparison', description: 'Evaluate Claude Code vs. other tools across quality, velocity, documentation, and satisfaction dimensions.', assignedBy: 'Project Admin', dueDate: d(42), priority: 'recommended', status: 'upcoming', scheduledPhase: 4 },
    ],
    marketing: [
      { id: 'm-1', title: 'Draft stakeholder communication plan', description: 'Create messaging framework for internal audiences about the AI coding tool pilot program.', assignedBy: 'Project Admin', dueDate: d(14), priority: 'required', status: 'in_progress', ctaLabel: 'View Reports', ctaHref: 'reports/generate' },
      { id: 'm-2', title: 'Prepare FAQ document', description: 'Compile frequently asked questions from developers, management, and legal about the AI tool adoption.', assignedBy: 'Project Admin', dueDate: d(18), priority: 'recommended', status: 'action_needed', ctaLabel: 'Generate Reports', ctaHref: 'reports/generate' },
      { id: 'm-3', title: 'Create pilot announcement materials', description: 'Draft internal announcement for pilot launch, including scope, timeline, and expected outcomes.', assignedBy: 'Project Admin', dueDate: d(28), priority: 'recommended', status: 'upcoming', scheduledPhase: 4 },
      { id: 'm-4', title: 'Prepare post-pilot summary for leadership', description: 'Draft communications-ready summary of pilot results for executive and board presentation.', assignedBy: 'Executive Sponsor', dueDate: d(50), priority: 'recommended', status: 'upcoming', scheduledPhase: 5 },
    ],
  };

  return tasksByRole[role] ?? [];
}

/* -------------------------------------------------------------------------- */
/*  Role task descriptions (shown in empty state)                             */
/* -------------------------------------------------------------------------- */

const ROLE_TASK_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Team assignments, project configuration, meeting scheduling, access permissions, document archival',
  consultant: 'Assessment questionnaires, policy drafts, evidence packages, readiness reviews, ROI calculations',
  executive: 'Gate approvals, risk acceptance decisions, budget sign-offs, go/no-go decisions',
  it: 'Sandbox configuration, security control checks, data classification, DLP rules, monitoring setup',
  legal: 'Policy reviews, compliance mapping, ethics reviews, IP assessments, exception request processing',
  engineering: 'Sandbox architecture, pilot project scoping, baseline metrics, tool comparison, sprint execution',
  marketing: 'Stakeholder communication plans, FAQ documents, change management narratives, pilot announcements',
};

/* -------------------------------------------------------------------------- */
/*  useRoleOverride hook                                                      */
/* -------------------------------------------------------------------------- */

function useRoleOverride(): UserRole {
  const [role, setRole] = useState<UserRole>('consultant');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('govai_user_role_override');
      if (stored && isValidRole(stored)) {
        setRole(stored);
      }
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  return role;
}

function isValidRole(value: string): value is UserRole {
  return ['admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing'].includes(value);
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

function priorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'required': return 'Required';
    case 'recommended': return 'Recommended';
    case 'optional': return 'Optional';
  }
}

function borderAccentClass(status: TaskStatus): string {
  switch (status) {
    case 'action_needed': return 'border-l-blue-600';
    case 'in_progress': return 'border-l-amber-500';
    case 'passed': return 'border-l-emerald-500';
    case 'failed': return 'border-l-red-500';
    case 'completed': return 'border-l-emerald-400';
    case 'upcoming': return 'border-l-slate-300';
  }
}

/* -------------------------------------------------------------------------- */
/*  Status Badge component                                                    */
/* -------------------------------------------------------------------------- */

function TaskStatusBadge({ status }: { status: TaskStatus }): React.ReactElement {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5 gap-1', config.badgeClass)}>
      <Icon className={cn('h-3 w-3', status === 'in_progress' && 'animate-spin')} />
      {config.label}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Task Card components                                                      */
/* -------------------------------------------------------------------------- */

function TaskCard({ task, projectId }: { task: DemoTask; projectId: string }): React.ReactElement {
  const config = STATUS_CONFIG[task.status];
  const overdue = (task.status === 'action_needed' || task.status === 'in_progress') && isOverdue(task.dueDate);

  return (
    <Card className={cn('border-l-4 bg-white', borderAccentClass(task.status))}>
      <CardContent className="py-4 px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn('inline-block h-2.5 w-2.5 rounded-full shrink-0', config.dotClass)} />
              <h3 className={cn(
                'font-semibold text-sm',
                task.status === 'completed' || task.status === 'passed' ? 'text-slate-400 line-through' : 'text-slate-900',
              )}>
                {task.title}
              </h3>
              <TaskStatusBadge status={task.status} />
            </div>
            <p className="text-sm text-slate-500 mb-3 ml-[18px]">{task.description}</p>
            <div className="flex items-center gap-4 ml-[18px] text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Assigned by {task.assignedBy}
              </span>
              <span className={cn('flex items-center gap-1', overdue && 'text-red-600 font-medium')}>
                <Calendar className="h-3 w-3" />
                {overdue ? 'Overdue: ' : 'Due '}
                {formatDate(task.dueDate)}
              </span>
              <Badge className={cn(
                'text-[10px] px-1.5 py-0 border-transparent',
                task.priority === 'required' ? 'bg-red-50 text-red-700' :
                task.priority === 'recommended' ? 'bg-amber-50 text-amber-700' :
                'bg-slate-100 text-slate-500',
              )}>
                {priorityLabel(task.priority)}
              </Badge>
            </div>
            {task.blocking && (
              <p className="text-xs text-red-600 mt-2 ml-[18px] flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Blocking: {task.blocking}
              </p>
            )}
            {task.blockedBy && (
              <p className="text-xs text-slate-400 mt-2 ml-[18px] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Blocked by: {task.blockedBy}
              </p>
            )}
            {task.failureReason && (
              <p className="text-xs text-red-600 mt-2 ml-[18px] flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {task.failureReason}
              </p>
            )}
          </div>
          {task.ctaLabel && task.ctaHref && task.status !== 'completed' && task.status !== 'passed' && (
            <Link href={`/projects/${projectId}/${task.ctaHref}`}>
              <Button size="sm" className={cn(
                'shrink-0',
                task.status === 'failed'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800',
              )}>
                {task.status === 'failed' ? 'Resolve' : task.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Role icon                                                                 */
/* -------------------------------------------------------------------------- */

function getRoleIcon(role: UserRole): React.ReactElement {
  const iconClass = 'h-5 w-5';
  switch (role) {
    case 'admin': return <Settings className={iconClass} />;
    case 'consultant': return <BarChart3 className={iconClass} />;
    case 'executive': return <FileText className={iconClass} />;
    case 'it': return <Shield className={iconClass} />;
    case 'legal': return <Gavel className={iconClass} />;
    case 'engineering': return <Code2 className={iconClass} />;
    case 'marketing': return <Megaphone className={iconClass} />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Summary bar                                                               */
/* -------------------------------------------------------------------------- */

function StatusSummaryBar({ tasks }: { tasks: DemoTask[] }) {
  const counts: Record<string, { count: number; color: string; label: string }> = {
    failed: { count: tasks.filter((t) => t.status === 'failed').length, color: 'bg-red-500', label: 'Failed' },
    action_needed: { count: tasks.filter((t) => t.status === 'action_needed').length, color: 'bg-blue-500', label: 'Action Needed' },
    in_progress: { count: tasks.filter((t) => t.status === 'in_progress').length, color: 'bg-amber-500', label: 'In Progress' },
    upcoming: { count: tasks.filter((t) => t.status === 'upcoming').length, color: 'bg-slate-300', label: 'Upcoming' },
    passed: { count: tasks.filter((t) => t.status === 'passed' || t.status === 'completed').length, color: 'bg-emerald-500', label: 'Passed' },
  };

  const total = tasks.length;

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.values(counts).filter((c) => c.count > 0).map((c) => (
          <span key={c.label} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', c.color)} />
            {c.count} {c.label}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
        {Object.values(counts).filter((c) => c.count > 0).map((c) => (
          <div
            key={c.label}
            className={cn('h-full first:rounded-l-full last:rounded-r-full', c.color)}
            style={{ width: `${(c.count / total) * 100}%` }}
            title={`${c.count} ${c.label}`}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function MyTasksPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const { id: projectId } = React.use(params);
  const role = useRoleOverride();
  const tasks = getTasksForRole(role);

  // Group tasks by status category
  const failedTasks = tasks.filter((t) => t.status === 'failed');
  const actionTasks = tasks.filter((t) => t.status === 'action_needed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const upcomingTasks = tasks.filter((t) => t.status === 'upcoming');
  const passedTasks = tasks.filter((t) => t.status === 'passed' || t.status === 'completed');

  const hasNoTasks = tasks.length === 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Phase header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600">
            {getRoleIcon(role)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
            <p className="text-sm text-slate-500">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        {!hasNoTasks && (
          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <StatusSummaryBar tasks={tasks} />
          </div>
        )}
      </div>

      {hasNoTasks ? (
        /* Empty state */
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100">
              <ClipboardList className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No tasks assigned yet</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mb-8">
            Tasks are assigned based on your role as the project progresses through each phase.
            As your team completes assessments, drafts policies, and reviews gates, relevant
            action items will appear here.
          </p>

          <Card className="max-w-xl mx-auto text-left border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Typical tasks for {ROLE_LABELS[role]}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-500">{ROLE_TASK_DESCRIPTIONS[role]}</p>
            </CardContent>
          </Card>

          <Separator className="my-8 bg-slate-200 max-w-xl mx-auto" />

          <div className="max-w-xl mx-auto text-left">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tasks by role across the project</h3>
            <div className="space-y-2">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((roleKey) => (
                <div key={roleKey} className="flex items-start gap-2 text-sm">
                  <span className={cn(
                    'font-medium shrink-0 w-48',
                    roleKey === role ? 'text-blue-700' : 'text-slate-600',
                  )}>
                    {ROLE_LABELS[roleKey]}
                  </span>
                  <span className="text-slate-500">{ROLE_TASK_DESCRIPTIONS[roleKey]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Failed — show first with high visibility */}
          {failedTasks.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                  {failedTasks.length}
                </div>
                <h2 className="text-lg font-semibold text-red-700">Failed / Blocked</h2>
              </div>
              <div className="space-y-3">
                {failedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} projectId={projectId} />
                ))}
              </div>
            </section>
          )}

          {failedTasks.length > 0 && (actionTasks.length > 0 || inProgressTasks.length > 0) && (
            <Separator className="mb-8 bg-slate-200" />
          )}

          {/* Action Needed */}
          {actionTasks.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {actionTasks.length}
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Action Needed</h2>
              </div>
              <div className="space-y-3">
                {actionTasks.map((task) => (
                  <TaskCard key={task.id} task={task} projectId={projectId} />
                ))}
              </div>
            </section>
          )}

          {/* In Progress */}
          {inProgressTasks.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  {inProgressTasks.length}
                </div>
                <h2 className="text-lg font-semibold text-slate-700">In Progress</h2>
              </div>
              <div className="space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} projectId={projectId} />
                ))}
              </div>
            </section>
          )}

          <Separator className="mb-8 bg-slate-200" />

          {/* Upcoming */}
          {upcomingTasks.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-700">Upcoming</h2>
              </div>
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} projectId={projectId} />
                ))}
              </div>
            </section>
          )}

          <Separator className="mb-8 bg-slate-200" />

          {/* Passed / Completed */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-700">Passed / Completed</h2>
            </div>
            {passedTasks.length === 0 ? (
              <p className="text-sm text-slate-400 ml-7">No completed tasks yet. Complete actions above to see them here.</p>
            ) : (
              <div className="space-y-2">
                {passedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} projectId={projectId} />
                ))}
              </div>
            )}
          </section>

          {/* Next Steps card */}
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="py-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Next Steps</h3>
              <div className="flex flex-wrap gap-2">
                <Link href={`/projects/${projectId}/project-plan`}>
                  <Button variant="outline" size="sm" className="gap-1 border-slate-200 text-slate-600">
                    View Full Project Plan
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href={`/projects/${projectId}/risks`}>
                  <Button variant="outline" size="sm" className="gap-1 border-slate-200 text-slate-600">
                    View Project Risks
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
