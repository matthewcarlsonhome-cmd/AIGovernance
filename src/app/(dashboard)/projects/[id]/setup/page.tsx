'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Rocket,
  CheckCircle2,
  Circle,
  ChevronRight,
  ClipboardList,
  FileText,
  Settings,
  FlaskConical,
  BarChart3,
  Shield,
  Users,
  AlertTriangle,
  Scale,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SetupTask {
  id: string;
  label: string;
  description: string;
  href: string;
  phase: string;
}

interface PhaseConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tasks: SetupTask[];
}

/* ------------------------------------------------------------------ */
/*  Phase definitions                                                  */
/* ------------------------------------------------------------------ */

function buildPhases(projectId: string): PhaseConfig[] {
  const p = (path: string) => `/projects/${projectId}${path}`;

  return [
    {
      id: 'discovery',
      title: 'Phase 1: Discovery & Assessment',
      description: 'Evaluate organizational readiness for AI coding assistant adoption.',
      icon: ClipboardList,
      color: 'text-blue-600',
      tasks: [
        { id: 'questionnaire', label: 'Complete Assessment Questionnaire', description: 'Answer questions across 5 domains: Infrastructure, Security, Governance, Engineering, Business', href: p('/discovery/questionnaire'), phase: 'discovery' },
        { id: 'readiness', label: 'Review Readiness Score', description: 'Review the radar chart and domain scores to understand organizational strengths and gaps', href: p('/discovery/readiness'), phase: 'discovery' },
        { id: 'prerequisites', label: 'Track Prerequisites', description: 'Assign and track completion of prerequisite items identified during assessment', href: p('/discovery/prerequisites'), phase: 'discovery' },
        { id: 'team', label: 'Assign Project Team', description: 'Add team members and assign roles (Admin, IT, Legal, Engineering, etc.)', href: p('/team'), phase: 'discovery' },
      ],
    },
    {
      id: 'governance',
      title: 'Phase 2: Governance Setup',
      description: 'Establish policies, compliance mappings, and risk management frameworks.',
      icon: Shield,
      color: 'text-violet-600',
      tasks: [
        { id: 'aup', label: 'Draft Acceptable Use Policy', description: 'Create the AUP that governs how AI coding agents may be used within the organization', href: p('/governance/policies'), phase: 'governance' },
        { id: 'compliance', label: 'Map Compliance Frameworks', description: 'Map AI tool controls to SOC 2, HIPAA, NIST, and GDPR requirements', href: p('/governance/compliance'), phase: 'governance' },
        { id: 'risk', label: 'Classify Risks', description: 'Identify and classify risks with likelihood, impact, and mitigation strategies', href: p('/governance/risk'), phase: 'governance' },
        { id: 'raci', label: 'Define RACI Matrix', description: 'Assign Responsible, Accountable, Consulted, Informed roles for governance activities', href: p('/governance/raci'), phase: 'governance' },
        { id: 'gate1', label: 'Complete Gate 1 Review', description: 'Submit evidence and obtain approval for Gate 1: Governance Readiness', href: p('/governance/gates'), phase: 'governance' },
      ],
    },
    {
      id: 'sandbox',
      title: 'Phase 3: Sandbox Configuration',
      description: 'Set up isolated, secure environment for AI tool evaluation.',
      icon: Settings,
      color: 'text-emerald-600',
      tasks: [
        { id: 'configure', label: 'Configure Sandbox Environment', description: 'Select cloud provider, sandbox model, network settings, and security controls', href: p('/sandbox/configure'), phase: 'sandbox' },
        { id: 'files', label: 'Review Generated Config Files', description: 'Review and customize managed-settings.json, docker-compose.yml, Terraform, and CLAUDE.md', href: p('/sandbox/files'), phase: 'sandbox' },
        { id: 'validate', label: 'Run Sandbox Validation', description: 'Execute health checks to verify network isolation, DLP, audit logging, and tool restrictions', href: p('/sandbox/validate'), phase: 'sandbox' },
      ],
    },
    {
      id: 'poc',
      title: 'Phase 4: Pilot Execution (PoC)',
      description: 'Run controlled evaluation of AI coding tools with real engineering teams.',
      icon: FlaskConical,
      color: 'text-orange-600',
      tasks: [
        { id: 'poc-projects', label: 'Define PoC Projects', description: 'Select and score candidate projects for the AI coding tool proof of concept', href: p('/poc/projects'), phase: 'poc' },
        { id: 'sprints', label: 'Execute Sprint Evaluations', description: 'Run baseline and AI-assisted sprints, capturing velocity, quality, and satisfaction metrics', href: p('/poc/sprints'), phase: 'poc' },
        { id: 'compare', label: 'Complete Tool Comparison', description: 'Score and compare Claude Code vs OpenAI Codex across evaluation categories', href: p('/poc/compare'), phase: 'poc' },
        { id: 'metrics', label: 'Review Metrics', description: 'Analyze baseline vs AI-assisted metrics to quantify productivity improvements', href: p('/poc/metrics'), phase: 'poc' },
        { id: 'gate2', label: 'Complete Gate 2 Review', description: 'Submit pilot results and obtain approval for Gate 2: PoC Validation', href: p('/governance/gates'), phase: 'poc' },
      ],
    },
    {
      id: 'deploy',
      title: 'Phase 5: Reporting & Rollout',
      description: 'Generate stakeholder reports and prepare for production deployment.',
      icon: BarChart3,
      color: 'text-pink-600',
      tasks: [
        { id: 'reports', label: 'Generate Stakeholder Reports', description: 'Create persona-specific reports for Executive, Legal, IT, Engineering, and Marketing audiences', href: p('/reports/generate'), phase: 'deploy' },
        { id: 'roi', label: 'Calculate ROI', description: 'Model projected cost savings and productivity gains for production deployment', href: p('/roi'), phase: 'deploy' },
        { id: 'gate3', label: 'Complete Gate 3 Review', description: 'Submit final evidence and obtain approval for Gate 3: Production Readiness', href: p('/governance/gates'), phase: 'deploy' },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Local storage persistence                                          */
/* ------------------------------------------------------------------ */

function getStorageKey(projectId: string): string {
  return `govai-setup-${projectId}`;
}

function loadChecked(projectId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(getStorageKey(projectId));
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveChecked(projectId: string, checked: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(projectId), JSON.stringify([...checked]));
  } catch { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const phases = React.useMemo(() => buildPhases(id), [id]);
  const allTasks = phases.flatMap((ph) => ph.tasks);
  const totalTasks = allTasks.length;

  const [checked, setChecked] = useState<Set<string>>(() => loadChecked(id));

  // Persist on change
  useEffect(() => {
    saveChecked(id, checked);
  }, [id, checked]);

  const toggle = useCallback((taskId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const completedCount = allTasks.filter((t) => checked.has(t.id)).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Rocket className="h-6 w-6" />
          Project Setup Guide
        </h1>
        <p className="text-slate-500 mt-1">
          Follow this checklist to set up your AI governance project. Complete each phase
          before moving to the next.
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Overall Progress</p>
              <p className="text-xs text-slate-500">
                {completedCount} of {totalTasks} tasks completed
              </p>
            </div>
            <Badge className={progressPercent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
              {progressPercent}%
            </Badge>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Phase Checklists */}
      {phases.map((phase) => {
        const Icon = phase.icon;
        const phaseCompleted = phase.tasks.filter((t) => checked.has(t.id)).length;
        const phaseTotal = phase.tasks.length;
        const phasePercent = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
        const isComplete = phasePercent === 100;

        return (
          <Card key={phase.id} className={isComplete ? 'border-emerald-200 bg-emerald-50/30' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${phase.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{phase.title}</CardTitle>
                    <CardDescription className="mt-0.5">{phase.description}</CardDescription>
                  </div>
                </div>
                <Badge
                  className={isComplete
                    ? 'bg-emerald-100 text-emerald-800'
                    : phaseCompleted > 0
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-600'
                  }
                >
                  {phaseCompleted}/{phaseTotal}
                </Badge>
              </div>
              {/* Phase progress bar */}
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${phasePercent}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {phase.tasks.map((task) => {
                  const isDone = checked.has(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => toggle(task.id)}
                        className="mt-0.5 shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDone ? 'text-emerald-800 line-through' : 'text-slate-900'}`}>
                          {task.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                      </div>
                      <Link href={task.href}>
                        <Button variant="ghost" size="sm" className="shrink-0 text-slate-500 hover:text-slate-900">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Getting Started Tips */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-slate-900 mb-3">Getting Started Tips</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              <span><strong>Start with Discovery</strong> — Complete the assessment questionnaire first to establish your organization&apos;s baseline readiness score.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              <span><strong>Assign your team early</strong> — Add team members so tasks can be distributed and tracked across stakeholders.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              <span><strong>Phases are sequential</strong> — Each phase builds on the previous one. Complete Governance before configuring the Sandbox.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              <span><strong>Gate reviews are checkpoints</strong> — Gates 1, 2, and 3 require approval from stakeholders before proceeding.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
