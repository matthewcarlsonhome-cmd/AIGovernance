'use client';

import * as React from 'react';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Info,
  MessageSquare,
  Shield,
  Target,
  Users,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface RoleViewProps {
  projectId: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function daysRemaining(target: string): number {
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* -------------------------------------------------------------------------- */
/*  Demo Data                                                                  */
/* -------------------------------------------------------------------------- */

const PHASE_LABELS = ['Scope & Assess', 'Classify & Govern', 'Approve & Gate', 'Build & Test', 'Evaluate & Decide'];
const PROGRESS_BY_PHASE = [0, 20, 40, 60, 80, 100]; // approximate progress per active phase

function useProjectPhase(projectId: string): { phase: number; advance: () => void } {
  const key = `govai_project_phase_${projectId}`;
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 1 && parsed <= 5) setPhase(parsed);
      }
    } catch { /* ignore */ }

    const handler = () => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (parsed >= 1 && parsed <= 5) setPhase(parsed);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('govai-phase-advance', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('govai-phase-advance', handler);
      window.removeEventListener('storage', handler);
    };
  }, [key]);

  const advance = () => {
    const next = Math.min(phase + 1, 5);
    setPhase(next);
    try {
      localStorage.setItem(key, String(next));
      window.dispatchEvent(new Event('govai-phase-advance'));
    } catch { /* ignore */ }
  };

  return { phase, advance };
}

const PROJECT_BASE = {
  name: 'Enterprise AI Coding Agent Pilot',
  totalPhases: 5,
  status: 'on_track' as const,
  startDate: '2026-01-15',
  targetDate: '2026-07-30',
};

/* -------------------------------------------------------------------------- */
/*  Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: 'on_track' | 'at_risk' | 'delayed' }): React.ReactElement {
  const config = {
    on_track: { label: 'On Track', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    at_risk: { label: 'At Risk', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    delayed: { label: 'Delayed', className: 'bg-red-100 text-red-800 border-red-200' },
  };
  const c = config[status];
  return <Badge variant="outline" className={cn('text-xs', c.className)}>{c.label}</Badge>;
}

/* -------------------------------------------------------------------------- */
/*  Common Header                                                              */
/* -------------------------------------------------------------------------- */

function CommonHeader({ phase, onAdvancePhase }: { phase: number; onAdvancePhase: () => void }): React.ReactElement {
  const remaining = daysRemaining(PROJECT_BASE.targetDate);
  const overallProgress = PROGRESS_BY_PHASE[phase] ?? 0;
  const phaseLabel = PHASE_LABELS[phase - 1] ?? '';

  return (
    <div className="space-y-4">
      {/* Title Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{PROJECT_BASE.name}</h1>
            <StatusBadge status={PROJECT_BASE.status} />
          </div>
          <p className="text-sm text-slate-500">
            Phase {phase} of {PROJECT_BASE.totalPhases} &mdash; {phaseLabel}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(PROJECT_BASE.startDate)} &ndash; {formatDate(PROJECT_BASE.targetDate)}
          </span>
          <span className={cn(
            'flex items-center gap-1 font-medium',
            remaining <= 30 ? 'text-amber-600' : 'text-slate-700',
          )}>
            <Clock className="h-3.5 w-3.5" />
            {remaining} days left
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Overall Progress</span>
            <span className="text-xs font-bold text-slate-900">{overallProgress}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                overallProgress >= 75 ? 'bg-emerald-500' :
                overallProgress >= 50 ? 'bg-blue-500' :
                overallProgress >= 25 ? 'bg-amber-500' : 'bg-slate-300',
              )}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {['Assess', 'Govern', 'Gate', 'Build', 'Decide'].map((label, i) => (
              <span
                key={label}
                className={cn(
                  'text-[10px] font-medium',
                  i < phase ? 'text-emerald-600' : i === phase - 1 ? 'text-blue-600' : 'text-slate-400',
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase Advancement */}
      {phase < 5 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-slate-700">
                  Ready to advance to <strong>Phase {phase + 1}: {PHASE_LABELS[phase]}</strong>?
                </span>
              </div>
              <button
                onClick={onAdvancePhase}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Mark Phase {phase} Complete
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Project Progress Stepper (visible to ALL roles)                            */
/* -------------------------------------------------------------------------- */

function ProjectProgressStepper({ phase }: { phase: number }): React.ReactElement {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-slate-900">Project Progress</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Current phase and milestone status across all five governance stages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between">
          {PHASE_LABELS.map((label, i) => {
            const phaseIndex = i + 1;
            const isCompleted = phaseIndex < phase;
            const isActive = phaseIndex === phase;

            return (
              <div key={label} className="flex flex-col items-center flex-1 relative">
                {/* Connector line (skip first) */}
                {i > 0 && (
                  <div
                    className={cn(
                      'absolute top-3.5 right-1/2 w-full h-0.5',
                      phaseIndex <= phase ? 'bg-emerald-400' : 'bg-slate-200',
                    )}
                    style={{ zIndex: 0 }}
                  />
                )}

                {/* Circle indicator */}
                <div
                  className={cn(
                    'relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500'
                      : isActive
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-slate-300',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : isActive ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                  )}
                </div>

                {/* Phase label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center leading-tight',
                    isCompleted
                      ? 'text-emerald-700'
                      : isActive
                        ? 'text-blue-700'
                        : 'text-slate-400',
                  )}
                >
                  {label}
                </span>

                {/* Status text */}
                <span
                  className={cn(
                    'mt-0.5 text-[10px]',
                    isCompleted
                      ? 'text-emerald-500'
                      : isActive
                        ? 'text-blue-500'
                        : 'text-slate-300',
                  )}
                >
                  {isCompleted ? 'Completed' : isActive ? 'Active' : '\u2014'}
                </span>

                {/* Your tasks count */}
                <span className="mt-1 text-[10px] text-slate-400">
                  Your tasks: &mdash;
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Upcoming Section (role-specific guidance)                                   */
/* -------------------------------------------------------------------------- */

function UpcomingSection({ text }: { text: string }): React.ReactElement {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">
          What&apos;s Coming Up for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2.5">
          <Calendar className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-600">{text}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Executive Sponsor View                                                     */
/* -------------------------------------------------------------------------- */

function ExecutiveView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <>
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Gavel className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Decisions Pending</h3>
            <p className="text-sm text-slate-500">
              No decisions pending. As the project progresses, gate approvals, risk exceptions, and budget decisions will appear here for your review.
            </p>
          </div>
        </CardContent>
      </Card>
      <UpcomingSection text="Phase 3 gate reviews will require your approval for pilot launch and production decisions." />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  IT / Security Lead View                                                    */
/* -------------------------------------------------------------------------- */

function ITSecurityView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <>
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Shield className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Security Controls Configured</h3>
            <p className="text-sm text-slate-500">
              No security controls configured yet. Start by completing the data classification in Phase 2, then configure your sandbox environment in Phase 4.
            </p>
          </div>
        </CardContent>
      </Card>
      <UpcomingSection text="Phase 2 data classification and Phase 4 sandbox configuration are your primary deliverables." />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Legal / Compliance Lead View                                               */
/* -------------------------------------------------------------------------- */

function LegalView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <>
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Policies or Compliance Mappings</h3>
            <p className="text-sm text-slate-500">
              No policies or compliance mappings yet. Draft the Acceptable Use Policy and map compliance frameworks in Phase 2.
            </p>
          </div>
        </CardContent>
      </Card>
      <UpcomingSection text="Phase 2 policy drafting and compliance mapping need your review. Phase 3 exceptions may require legal sign-off." />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Engineering Lead View                                                      */
/* -------------------------------------------------------------------------- */

function EngineeringView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <>
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Wrench className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Sandbox or Pilot Data</h3>
            <p className="text-sm text-slate-500">
              No sandbox or pilot data yet. Sandbox configuration and pilot sprints will appear after governance gates are approved in Phase 3.
            </p>
          </div>
        </CardContent>
      </Card>
      <UpcomingSection text="Phase 4 sandbox setup and pilot sprints are your focus. Start reviewing tool options now." />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Communications Lead View                                                   */
/* -------------------------------------------------------------------------- */

function CommunicationsView({ projectId }: RoleViewProps): React.ReactElement {
  return (
    <>
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <MessageSquare className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Change Management Artifacts</h3>
            <p className="text-sm text-slate-500">
              No change management artifacts yet. Communication plans and client briefs will be generated after the pilot runs in Phase 4.
            </p>
          </div>
        </CardContent>
      </Card>
      <UpcomingSection text="Phase 4 change management plans and Phase 5 client briefs will need your input." />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Consultant / Admin View (Full Visibility)                                  */
/* -------------------------------------------------------------------------- */

function ConsultantAdminView({ projectId }: RoleViewProps): React.ReactElement {
  const setupSteps = [
    { label: 'Complete intake scorecard', href: `/projects/${projectId}/intake`, icon: Target },
    { label: 'Run discovery questionnaire', href: `/projects/${projectId}/discovery/questionnaire`, icon: FileText },
    { label: 'Assign team members', href: `/projects/${projectId}/team`, icon: Users },
    { label: 'Draft governance policies', href: `/projects/${projectId}/governance/policies`, icon: Shield },
    { label: 'Configure sandbox', href: `/projects/${projectId}/sandbox/configure`, icon: Wrench },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-900">Project Setup Checklist</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Complete the following steps to set up this project. Each step links to the relevant page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {setupSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link key={step.label} href={step.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 shrink-0">
                    {i + 1}
                  </div>
                  <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-900">{step.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 ml-auto shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Role Labels                                                                */
/* -------------------------------------------------------------------------- */

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  consultant: 'Consultant',
  executive: 'Executive Sponsor',
  it: 'IT / Security Lead',
  legal: 'Legal / Compliance Lead',
  engineering: 'Engineering Lead',
  marketing: 'Communications Lead',
};

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = use(params);
  const [currentRole, setCurrentRole] = useState<UserRole>('consultant');
  const { phase: projectPhase, advance: advancePhase } = useProjectPhase(id);

  // Read role from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('govai_user_role_override');
      if (stored && Object.keys(ROLE_LABELS).includes(stored)) {
        setCurrentRole(stored as UserRole);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist role changes to localStorage
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    try {
      localStorage.setItem('govai_user_role_override', role);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Common Header */}
      <CommonHeader phase={projectPhase} onAdvancePhase={advancePhase} />

      {/* Role Switcher */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 shrink-0">Viewing as:</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([role, label]) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    currentRole === role
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Content */}
      {currentRole === 'executive' && <ExecutiveView projectId={id} />}
      {currentRole === 'it' && <ITSecurityView projectId={id} />}
      {currentRole === 'legal' && <LegalView projectId={id} />}
      {currentRole === 'engineering' && <EngineeringView projectId={id} />}
      {currentRole === 'marketing' && <CommunicationsView projectId={id} />}
      {(currentRole === 'consultant' || currentRole === 'admin') && (
        <ConsultantAdminView projectId={id} />
      )}

      {/* Role context tip */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <span className="text-xs text-blue-700">
          You are viewing this project as <strong>{ROLE_LABELS[currentRole]}</strong>.
          Switch roles above to see different perspectives of the project. Each role sees
          information and actions most relevant to their responsibilities.
        </span>
      </div>
    </div>
  );
}
