'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  FileText,
  Shield,
  Settings,
  Users,
  Megaphone,
  Gavel,
  Code2,
  BarChart3,
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
type TaskStatus = 'action_needed' | 'upcoming' | 'completed';

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
/*  Role-based demo data                                                      */
/* -------------------------------------------------------------------------- */

function getTasksForRole(role: UserRole): DemoTask[] {
  const roleTaskMap: Record<UserRole, DemoTask[]> = {
    consultant: [
      // Action needed
      {
        id: 'c1', title: 'Draft Acceptable Use Policy (AUP)', description: 'Create the initial AUP document defining permitted uses of AI coding agents across engineering teams.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-28', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Policy Editor', ctaHref: 'governance/policies', blocking: 'AUP Legal Review',
      },
      {
        id: 'c2', title: 'Map SOC2 compliance controls', description: 'Map existing SOC2 controls to AI governance requirements and identify gaps.',
        assignedBy: 'James Wright', dueDate: '2026-03-03', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Compliance Mapper', ctaHref: 'governance/compliance',
      },
      {
        id: 'c3', title: 'Define RACI matrix', description: 'Establish responsibility assignments for all governance tasks across the project lifecycle.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-05', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Open RACI Editor', ctaHref: 'governance/policies',
      },
      {
        id: 'c4', title: 'Update risk register', description: 'Review and update the risk classification for all identified AI deployment risks.',
        assignedBy: 'Maria Lopez', dueDate: '2026-03-07', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Open Risk Manager', ctaHref: 'governance/risk',
      },
      {
        id: 'c5', title: 'Prepare Gate 1 evidence package', description: 'Compile all required documentation and evidence for the scope review gate.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-10', priority: 'optional', status: 'action_needed',
        ctaLabel: 'Open Gate Review', ctaHref: 'governance/gates',
      },
      // Upcoming
      {
        id: 'c6', title: 'Generate executive brief', description: 'Auto-generate the executive summary report with go/no-go recommendation.',
        assignedBy: 'James Wright', dueDate: '2026-04-12', priority: 'required', status: 'upcoming',
        scheduledPhase: 5,
      },
      {
        id: 'c7', title: 'Outcome metrics analysis', description: 'Analyze pilot sprint results and calculate ROI for the decision package.',
        assignedBy: 'Sarah Chen', dueDate: '2026-04-08', priority: 'required', status: 'upcoming',
        blockedBy: 'Sprint 2 Execution',
      },
      {
        id: 'c8', title: 'ROI calculation', description: 'Calculate return-on-investment based on pilot metrics and organizational data.',
        assignedBy: 'James Wright', dueDate: '2026-04-10', priority: 'recommended', status: 'upcoming',
        scheduledPhase: 5,
      },
      // Completed
      {
        id: 'c9', title: 'Complete intake scorecard', description: 'Initial assessment of organization readiness.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-05', completedDate: '2026-02-05', priority: 'required', status: 'completed',
      },
      {
        id: 'c10', title: 'Run discovery questionnaire', description: 'Conducted the full 25-question discovery questionnaire.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-06', completedDate: '2026-02-06', priority: 'required', status: 'completed',
      },
      {
        id: 'c11', title: 'Review readiness assessment', description: 'Reviewed and validated the readiness assessment results.',
        assignedBy: 'James Wright', dueDate: '2026-02-08', completedDate: '2026-02-08', priority: 'required', status: 'completed',
      },
    ],
    admin: [
      {
        id: 'a1', title: 'Assign remaining team members', description: 'Ensure all project roles are filled with appropriate team members.',
        assignedBy: 'System', dueDate: '2026-02-27', priority: 'required', status: 'action_needed',
        ctaLabel: 'Manage Team', ctaHref: 'team', blocking: 'RACI Matrix',
      },
      {
        id: 'a2', title: 'Configure project notifications', description: 'Set up email and in-app notification rules for gate reviews and SLA warnings.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-01', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Open Settings', ctaHref: 'setup',
      },
      {
        id: 'a3', title: 'Schedule Gate 1 review meeting', description: 'Coordinate calendar invites for all gate reviewers and prepare the agenda.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-05', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Meetings', ctaHref: 'meetings',
      },
      {
        id: 'a4', title: 'Upload compliance evidence files', description: 'Upload supporting documents for SOC2 and HIPAA compliance mapping.',
        assignedBy: 'Maria Lopez', dueDate: '2026-03-08', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Upload Files', ctaHref: 'governance/compliance',
      },
      {
        id: 'a5', title: 'Set up sandbox access permissions', description: 'Grant appropriate sandbox access to engineering and IT team members.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-15', priority: 'required', status: 'upcoming',
        scheduledPhase: 4,
      },
      {
        id: 'a6', title: 'Archive Phase 1 documents', description: 'Archive completed discovery documents for audit trail.',
        assignedBy: 'System', dueDate: '2026-03-18', priority: 'optional', status: 'upcoming',
        scheduledPhase: 3,
      },
      {
        id: 'a7', title: 'Assign project team', description: 'Initial team assignments completed.',
        assignedBy: 'System', dueDate: '2026-02-04', completedDate: '2026-02-04', priority: 'required', status: 'completed',
      },
      {
        id: 'a8', title: 'Complete prerequisites checklist', description: 'All prerequisite items verified and checked off.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-09', completedDate: '2026-02-09', priority: 'required', status: 'completed',
      },
      {
        id: 'a9', title: 'RACI matrix draft', description: 'Initial RACI draft created and circulated for review.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-18', completedDate: '2026-02-18', priority: 'required', status: 'completed',
      },
    ],
    executive: [
      {
        id: 'e1', title: 'Review Gate 1 submission', description: 'Review the scope review gate evidence package and approve or request changes.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-07', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Gate Review', ctaHref: 'governance/gates', blocking: 'Security Review Gate',
      },
      {
        id: 'e2', title: 'Approve risk exception request', description: 'Review and approve the temporary DLP scanning exception for sandbox environment.',
        assignedBy: 'Maria Lopez', dueDate: '2026-03-03', priority: 'required', status: 'action_needed',
        ctaLabel: 'Review Exception', ctaHref: 'governance/risk',
      },
      {
        id: 'e3', title: 'Sign off on budget allocation', description: 'Approve the pilot budget including sandbox infrastructure and tool licenses.',
        assignedBy: 'James Wright', dueDate: '2026-03-10', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'View ROI Analysis', ctaHref: 'roi',
      },
      {
        id: 'e4', title: 'Review executive brief', description: 'Review the auto-generated executive summary and go/no-go recommendation.',
        assignedBy: 'Sarah Chen', dueDate: '2026-04-12', priority: 'required', status: 'upcoming',
        scheduledPhase: 5,
      },
      {
        id: 'e5', title: 'Go/No-Go decision', description: 'Make final production deployment decision based on pilot results.',
        assignedBy: 'System', dueDate: '2026-04-15', priority: 'required', status: 'upcoming',
        blockedBy: 'Executive Brief',
      },
      {
        id: 'e6', title: 'Gate 3 pilot approval', description: 'Final gate approval to proceed with production rollout.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-14', priority: 'required', status: 'upcoming',
        scheduledPhase: 3,
      },
      {
        id: 'e7', title: 'Approved project charter', description: 'Reviewed and signed the project charter document.',
        assignedBy: 'Sarah Chen', dueDate: '2026-01-20', completedDate: '2026-01-20', priority: 'required', status: 'completed',
      },
      {
        id: 'e8', title: 'Reviewed feasibility assessment', description: 'Reviewed the initial feasibility score and readiness report.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-10', completedDate: '2026-02-10', priority: 'required', status: 'completed',
      },
    ],
    it: [
      {
        id: 'it1', title: 'Complete data classification', description: 'Classify all data repositories that will be accessible to AI coding agents.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-28', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Data Classification', ctaHref: 'governance/policies', blocking: 'Security Controls Baseline',
      },
      {
        id: 'it2', title: 'Define security controls baseline', description: 'Establish the minimum security controls required for sandbox and production environments.',
        assignedBy: 'Maria Lopez', dueDate: '2026-03-03', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Security Controls', ctaHref: 'governance/compliance', blockedBy: 'Data Classification',
      },
      {
        id: 'it3', title: 'Configure DLP egress rules', description: 'Set up Data Loss Prevention scanning rules for AI agent output traffic.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-05', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Controls', ctaHref: 'controls',
      },
      {
        id: 'it4', title: 'Review SOC2 control mapping', description: 'Validate the SOC2 compliance control mapping against IT infrastructure.',
        assignedBy: 'James Wright', dueDate: '2026-03-08', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Open Compliance', ctaHref: 'governance/compliance',
      },
      {
        id: 'it5', title: 'Sandbox configuration', description: 'Configure the isolated sandbox environment for pilot testing.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-18', priority: 'required', status: 'upcoming',
        scheduledPhase: 4,
      },
      {
        id: 'it6', title: 'Sandbox validation', description: 'Run health checks and validate sandbox environment readiness.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-20', priority: 'required', status: 'upcoming',
        blockedBy: 'Sandbox Configuration',
      },
      {
        id: 'it7', title: 'Monitoring setup', description: 'Deploy monitoring and alerting for sandbox and production environments.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-25', priority: 'recommended', status: 'upcoming',
        scheduledPhase: 4,
      },
      {
        id: 'it8', title: 'Data readiness review', description: 'Completed initial data readiness assessment.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-10', completedDate: '2026-02-10', priority: 'required', status: 'completed',
      },
      {
        id: 'it9', title: 'Network architecture review', description: 'Reviewed network segmentation plan for sandbox isolation.',
        assignedBy: 'James Wright', dueDate: '2026-02-14', completedDate: '2026-02-14', priority: 'required', status: 'completed',
      },
    ],
    legal: [
      {
        id: 'l1', title: 'Review AUP policy draft', description: 'Legal review of the Acceptable Use Policy for AI coding agents.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-28', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Policy Review', ctaHref: 'governance/policies', blocking: 'Gate 1 Evidence Package',
      },
      {
        id: 'l2', title: 'Complete HIPAA compliance mapping', description: 'Map HIPAA requirements to AI governance controls for healthcare data handling.',
        assignedBy: 'James Wright', dueDate: '2026-03-01', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Compliance Mapper', ctaHref: 'governance/compliance',
      },
      {
        id: 'l3', title: 'Conduct ethics review', description: 'Review the ethical implications and establish guidelines for AI agent use.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-05', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Ethics Review', ctaHref: 'governance/policies', blocking: 'Gate 1 Review',
      },
      {
        id: 'l4', title: 'Review IP ownership clauses', description: 'Assess intellectual property ownership for AI-generated code outputs.',
        assignedBy: 'Maria Lopez', dueDate: '2026-03-08', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Open Policy Editor', ctaHref: 'governance/policies',
      },
      {
        id: 'l5', title: 'Draft exception request template', description: 'Create a standardized template for risk exception requests.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-10', priority: 'optional', status: 'action_needed',
        ctaLabel: 'Open Risk Manager', ctaHref: 'governance/risk',
      },
      {
        id: 'l6', title: 'Exception requests (if needed)', description: 'Process any exception requests that arise from gate reviews.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-12', priority: 'recommended', status: 'upcoming',
        scheduledPhase: 3,
      },
      {
        id: 'l7', title: 'Vendor contract review', description: 'Review AI vendor contracts for compliance and liability terms.',
        assignedBy: 'James Wright', dueDate: '2026-03-15', priority: 'required', status: 'upcoming',
        blockedBy: 'Ethics Review',
      },
      {
        id: 'l8', title: 'Data handling policy review', description: 'Reviewed and approved the data handling policy.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-21', completedDate: '2026-02-21', priority: 'required', status: 'completed',
      },
      {
        id: 'l9', title: 'HIPAA initial assessment', description: 'Completed preliminary HIPAA gap analysis.',
        assignedBy: 'James Wright', dueDate: '2026-02-22', completedDate: '2026-02-22', priority: 'required', status: 'completed',
      },
      {
        id: 'l10', title: 'Regulatory landscape scan', description: 'Completed scan of applicable AI regulations.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-15', completedDate: '2026-02-15', priority: 'recommended', status: 'completed',
      },
    ],
    engineering: [
      {
        id: 'eng1', title: 'Design sandbox architecture', description: 'Define the technical architecture for the isolated sandbox environment.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-01', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Sandbox Config', ctaHref: 'sandbox/configure', blocking: 'Sandbox Setup',
      },
      {
        id: 'eng2', title: 'Define pilot project scope', description: 'Select and scope the proof-of-concept projects for AI agent evaluation.',
        assignedBy: 'James Wright', dueDate: '2026-03-05', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open PoC Projects', ctaHref: 'poc/projects',
      },
      {
        id: 'eng3', title: 'Set up baseline metrics collection', description: 'Establish current development velocity and quality baselines for comparison.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-08', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Open Metrics', ctaHref: 'poc/metrics',
      },
      {
        id: 'eng4', title: 'Configure tool comparison framework', description: 'Set up the evaluation framework for comparing Claude Code vs Codex.',
        assignedBy: 'James Wright', dueDate: '2026-03-12', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Open Tool Comparison', ctaHref: 'poc/compare',
      },
      {
        id: 'eng5', title: 'Sprint 1 execution', description: 'Run the first pilot sprint using AI coding agents.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-29', priority: 'required', status: 'upcoming',
        scheduledPhase: 4,
      },
      {
        id: 'eng6', title: 'Sprint 2 execution', description: 'Run the second pilot sprint with refined configurations.',
        assignedBy: 'Sarah Chen', dueDate: '2026-04-05', priority: 'required', status: 'upcoming',
        blockedBy: 'Sprint 1 Execution',
      },
      {
        id: 'eng7', title: 'Pilot design', description: 'Design the pilot execution plan and success criteria.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-22', priority: 'required', status: 'upcoming',
        scheduledPhase: 4,
      },
      {
        id: 'eng8', title: 'Reviewed tool evaluation criteria', description: 'Reviewed and approved evaluation rubric for AI tools.',
        assignedBy: 'James Wright', dueDate: '2026-02-12', completedDate: '2026-02-12', priority: 'required', status: 'completed',
      },
      {
        id: 'eng9', title: 'Submitted codebase readiness checklist', description: 'Verified codebase readiness for AI agent integration.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-15', completedDate: '2026-02-15', priority: 'required', status: 'completed',
      },
    ],
    marketing: [
      {
        id: 'm1', title: 'Draft stakeholder communication plan', description: 'Create the internal communications strategy for AI governance rollout.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-01', priority: 'required', status: 'action_needed',
        ctaLabel: 'Open Change Management', ctaHref: 'change-management',
      },
      {
        id: 'm2', title: 'Create FAQ document', description: 'Draft frequently asked questions about AI coding agents for internal teams.',
        assignedBy: 'James Wright', dueDate: '2026-03-05', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Open Reports', ctaHref: 'reports/generate',
      },
      {
        id: 'm3', title: 'Design change management narrative', description: 'Develop the change management story and key messaging for leadership.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-08', priority: 'recommended', status: 'action_needed',
        ctaLabel: 'Open Change Management', ctaHref: 'change-management',
      },
      {
        id: 'm4', title: 'Prepare pilot announcement', description: 'Draft the internal announcement for the AI pilot program launch.',
        assignedBy: 'Sarah Chen', dueDate: '2026-03-20', priority: 'required', status: 'upcoming',
        scheduledPhase: 4,
      },
      {
        id: 'm5', title: 'Post-pilot success story', description: 'Prepare the success metrics narrative for broader organizational rollout.',
        assignedBy: 'James Wright', dueDate: '2026-04-12', priority: 'recommended', status: 'upcoming',
        scheduledPhase: 5,
      },
      {
        id: 'm6', title: 'Completed stakeholder analysis', description: 'Identified and categorized all stakeholder groups.',
        assignedBy: 'Sarah Chen', dueDate: '2026-02-10', completedDate: '2026-02-10', priority: 'required', status: 'completed',
      },
      {
        id: 'm7', title: 'Reviewed messaging guidelines', description: 'Reviewed and approved initial messaging guidelines.',
        assignedBy: 'James Wright', dueDate: '2026-02-14', completedDate: '2026-02-14', priority: 'recommended', status: 'completed',
      },
    ],
  };

  return roleTaskMap[role] ?? roleTaskMap.consultant;
}

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

function priorityDotClass(priority: TaskPriority): string {
  switch (priority) {
    case 'required': return 'bg-red-500';
    case 'recommended': return 'bg-amber-500';
    case 'optional': return 'bg-slate-400';
  }
}

function priorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'required': return 'Required';
    case 'recommended': return 'Recommended';
    case 'optional': return 'Optional';
  }
}

function borderAccentClass(priority: TaskPriority): string {
  switch (priority) {
    case 'required': return 'border-l-blue-600';
    case 'recommended': return 'border-l-amber-500';
    case 'optional': return 'border-l-slate-300';
  }
}

/* -------------------------------------------------------------------------- */
/*  Task Card components                                                      */
/* -------------------------------------------------------------------------- */

function ActionTaskCard({ task, projectId }: { task: DemoTask; projectId: string }): React.ReactElement {
  return (
    <Card className={cn('border-l-4 bg-white', borderAccentClass(task.priority))}>
      <CardContent className="py-4 px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('inline-block h-2.5 w-2.5 rounded-full shrink-0', priorityDotClass(task.priority))} />
              <h3 className="font-semibold text-slate-900 text-sm">{task.title}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-3 ml-[18px]">{task.description}</p>
            <div className="flex items-center gap-4 ml-[18px] text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Assigned by {task.assignedBy}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due {formatDate(task.dueDate)}
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
          </div>
          {task.ctaLabel && task.ctaHref && (
            <Link href={`/projects/${projectId}/${task.ctaHref}`}>
              <Button size="sm" className="shrink-0 bg-slate-900 text-white hover:bg-slate-800">
                {task.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingTaskCard({ task }: { task: DemoTask }): React.ReactElement {
  return (
    <Card className="border border-slate-200 bg-slate-50 opacity-70">
      <CardContent className="py-3 px-5">
        <div className="flex items-center gap-2 mb-1">
          <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <h3 className="text-sm text-slate-500">{task.title}</h3>
        </div>
        <p className="text-xs text-slate-400 ml-[22px]">
          {task.blockedBy
            ? <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3 inline" /> Blocked by: {task.blockedBy}</span>
            : task.scheduledPhase
              ? `Scheduled for Phase ${task.scheduledPhase}`
              : `Due ${formatDate(task.dueDate)}`
          }
        </p>
      </CardContent>
    </Card>
  );
}

function CompletedTaskCard({ task }: { task: DemoTask }): React.ReactElement {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardContent className="py-3 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <h3 className="text-sm text-slate-400 line-through">{task.title}</h3>
          </div>
          {task.completedDate && (
            <span className="text-xs text-slate-400">
              Completed {formatDate(task.completedDate)}
            </span>
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
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function MyTasksPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const { id: projectId } = React.use(params);
  const role = useRoleOverride();
  const tasks = getTasksForRole(role);

  const actionTasks = tasks.filter((t) => t.status === 'action_needed');
  const upcomingTasks = tasks.filter((t) => t.status === 'upcoming');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const phaseProgress = Math.round((completedCount / totalTasks) * 100);

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

        <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 border-transparent text-xs">Phase 2 of 5</Badge>
              <span className="text-sm font-medium text-slate-700">Classify &amp; Govern</span>
            </div>
            <span className="text-sm text-slate-500">{completedCount} of {totalTasks} tasks complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${phaseProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Requires Your Action */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {actionTasks.length}
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Requires Your Action</h2>
        </div>
        <div className="space-y-3">
          {actionTasks.map((task) => (
            <ActionTaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </div>
      </section>

      <Separator className="mb-10 bg-slate-200" />

      {/* Upcoming */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-700">Upcoming</h2>
        </div>
        <div className="space-y-2">
          {upcomingTasks.map((task) => (
            <UpcomingTaskCard key={task.id} task={task} />
          ))}
        </div>
      </section>

      <Separator className="mb-10 bg-slate-200" />

      {/* Recently Completed */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-700">Recently Completed</h2>
        </div>
        <div className="space-y-2">
          {completedTasks.map((task) => (
            <CompletedTaskCard key={task.id} task={task} />
          ))}
        </div>
      </section>
    </div>
  );
}
