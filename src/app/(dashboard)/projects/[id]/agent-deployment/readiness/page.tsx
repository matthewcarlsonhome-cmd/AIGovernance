'use client';

import * as React from 'react';
import { use } from 'react';
import {
  Radar,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TaskEntry {
  id: string;
  name: string;
  description: string;
}

interface FailureEntry {
  taskId: string;
  impact: string;
}

interface StepAnswers {
  tasks: TaskEntry[];
  failures: FailureEntry[];
  verification: string;
  rollback: string;
  approvalGates: string;
  containment: string;
}

interface TaskAssessment {
  taskId: string;
  taskName: string;
  failureImpact: 'low' | 'medium' | 'high' | 'critical';
  verificationFeasibility: 'strong' | 'adequate' | 'weak' | 'missing';
  rollbackCapability: 'full' | 'partial' | 'none';
  approvalDesign: 'defined' | 'partial' | 'missing';
  containmentAdequacy: 'sufficient' | 'partial' | 'insufficient';
}

interface ReadinessReport {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  taskAssessments: TaskAssessment[];
  recommendation: 'GREEN_LIGHT' | 'NOT_READY';
  mitigations: string[];
  gaps: string[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    number: 1,
    title: 'Tasks to Delegate',
    description: 'What specific tasks are you delegating to an agent?',
    guidance:
      'Be concrete. "Email management" is too vague. "Unsubscribe from promotional emails and flag anything from customers or investors" is specific.',
  },
  {
    number: 2,
    title: 'Failure Impact',
    description: 'For each task: what breaks if the agent makes a predictable mistake?',
    guidance:
      'Not edge cases\u2014the obvious failure mode. Email agent archives something needed? Calendar agent books over protected time? Research agent hallucinates a source you cite?',
  },
  {
    number: 3,
    title: 'Verification Plan',
    description: 'How will you verify the agent did what you intended?',
    guidance:
      'Real verification\u2014not "I\'ll spot-check." Who verifies, how often, by what evidence, with what tooling?',
  },
  {
    number: 4,
    title: 'Rollback Plan',
    description: 'What\'s your rollback plan when something goes wrong?',
    guidance:
      'Not if. When. Can you undo it? How fast? What\'s unrecoverable?',
  },
  {
    number: 5,
    title: 'Human Approval Points',
    description: 'Where does human approval belong in this workflow?',
    guidance:
      'The 70/30 rule says 70% human control. Where\'s the checkpoint? What requires approval before execution vs. notification after?',
  },
  {
    number: 6,
    title: 'Containment Strategy',
    description: 'What\'s your containment strategy, and what happens if this fails publicly?',
    guidance:
      'Dedicated hardware? Throwaway accounts? Air-gapped testing? Be honest about consequences\u2014reputation, job, business, relationships.',
  },
];

/* ------------------------------------------------------------------ */
/*  Scoring logic                                                      */
/* ------------------------------------------------------------------ */

function computeReport(answers: StepAnswers): ReadinessReport {
  const taskAssessments: TaskAssessment[] = answers.tasks.map((task) => {
    const failure = answers.failures.find((f) => f.taskId === task.id);
    const impactText = (failure?.impact || '').toLowerCase();

    const failureImpact: TaskAssessment['failureImpact'] =
      impactText.includes('irreversible') || impactText.includes('catastroph') || impactText.includes('data loss')
        ? 'critical'
        : impactText.includes('significant') || impactText.includes('reputation') || impactText.includes('client')
        ? 'high'
        : impactText.includes('minor') || impactText.includes('inconvenien')
        ? 'low'
        : 'medium';

    const verificationText = answers.verification.toLowerCase();
    const verificationFeasibility: TaskAssessment['verificationFeasibility'] =
      verificationText.includes('automat') || verificationText.includes('tooling') || verificationText.includes('log')
        ? 'strong'
        : verificationText.includes('review') || verificationText.includes('check')
        ? 'adequate'
        : verificationText.includes('spot') || verificationText.length < 20
        ? 'weak'
        : 'adequate';

    const rollbackText = answers.rollback.toLowerCase();
    const rollbackCapability: TaskAssessment['rollbackCapability'] =
      rollbackText.includes('undo') || rollbackText.includes('backup') || rollbackText.includes('revert')
        ? 'full'
        : rollbackText.includes('partial') || rollbackText.includes('some')
        ? 'partial'
        : 'none';

    const approvalText = answers.approvalGates.toLowerCase();
    const approvalDesign: TaskAssessment['approvalDesign'] =
      approvalText.includes('tier') || approvalText.includes('require approval') || approvalText.includes('before execution')
        ? 'defined'
        : approvalText.includes('notif') || approvalText.includes('review')
        ? 'partial'
        : 'missing';

    const containmentText = answers.containment.toLowerCase();
    const containmentAdequacy: TaskAssessment['containmentAdequacy'] =
      containmentText.includes('dedicated') || containmentText.includes('isolated') || containmentText.includes('sandbox')
        ? 'sufficient'
        : containmentText.includes('separate') || containmentText.includes('limit')
        ? 'partial'
        : 'insufficient';

    return {
      taskId: task.id,
      taskName: task.name,
      failureImpact,
      verificationFeasibility,
      rollbackCapability,
      approvalDesign,
      containmentAdequacy,
    };
  });

  // Score computation
  const dimensionScores = taskAssessments.map((ta) => {
    const impactScore = { low: 25, medium: 15, high: 8, critical: 0 }[ta.failureImpact];
    const verifyScore = { strong: 25, adequate: 18, weak: 8, missing: 0 }[ta.verificationFeasibility];
    const rollbackScore = { full: 20, partial: 10, none: 0 }[ta.rollbackCapability];
    const approvalScore = { defined: 15, partial: 8, missing: 0 }[ta.approvalDesign];
    const containScore = { sufficient: 15, partial: 8, insufficient: 0 }[ta.containmentAdequacy];
    return impactScore + verifyScore + rollbackScore + approvalScore + containScore;
  });

  const score = taskAssessments.length > 0
    ? Math.round(dimensionScores.reduce((a, b) => a + b, 0) / dimensionScores.length)
    : 0;

  const riskLevel: ReadinessReport['riskLevel'] =
    score >= 75 ? 'LOW' : score >= 55 ? 'MEDIUM' : score >= 35 ? 'HIGH' : 'CRITICAL';

  const recommendation: ReadinessReport['recommendation'] =
    score >= 55 ? 'GREEN_LIGHT' : 'NOT_READY';

  // Build mitigations
  const mitigations: string[] = [];
  const gaps: string[] = [];

  if (taskAssessments.some((t) => t.verificationFeasibility === 'weak' || t.verificationFeasibility === 'missing')) {
    mitigations.push('Implement automated logging and monitoring for all agent actions before deployment.');
    gaps.push('Verification infrastructure is insufficient for reliable agent oversight.');
  }
  if (taskAssessments.some((t) => t.rollbackCapability === 'none')) {
    gaps.push('No rollback capability for one or more tasks\u2014agent errors may be irreversible.');
    mitigations.push('Establish backup/snapshot procedures before granting write access to any system.');
  }
  if (taskAssessments.some((t) => t.approvalDesign === 'missing')) {
    gaps.push('Approval gates are not defined\u2014agent may act without human oversight.');
    mitigations.push('Define explicit approval tiers (autonomous, notification, pre-approval) for each action type.');
  }
  if (taskAssessments.some((t) => t.containmentAdequacy === 'insufficient')) {
    gaps.push('Containment strategy relies on "being careful" rather than infrastructure isolation.');
    mitigations.push('Deploy agents on dedicated infrastructure with minimal permissions and throwaway accounts.');
  }
  if (taskAssessments.some((t) => t.failureImpact === 'critical')) {
    mitigations.push('Move critical-impact tasks to Tier 3 (agent assists, human decides and executes).');
  }
  if (score >= 55 && mitigations.length === 0) {
    mitigations.push('Continue with current safeguards. Review agent performance weekly for the first month.');
  }

  return { score, riskLevel, taskAssessments, recommendation, mitigations, gaps };
}

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: typeof STEPS;
  currentStep: number;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <React.Fragment key={step.number}>
          {i > 0 && <div className="h-px w-6 bg-slate-200 shrink-0" />}
          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shrink-0 transition-colors',
              currentStep === step.number
                ? 'bg-slate-900 text-white'
                : currentStep > step.number
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            )}
          >
            {currentStep > step.number ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <span>{step.number}</span>
            )}
            <span className="hidden sm:inline">{step.title}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Report view                                                        */
/* ------------------------------------------------------------------ */

function ReportView({ report }: { report: ReadinessReport }) {
  const riskColors = {
    LOW: 'bg-emerald-100 text-emerald-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
  };

  const scoreColor =
    report.score >= 75
      ? 'text-emerald-600 border-emerald-500'
      : report.score >= 55
      ? 'text-amber-600 border-amber-500'
      : report.score >= 35
      ? 'text-orange-600 border-orange-500'
      : 'text-red-600 border-red-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-6">
              <div
                className={cn(
                  'flex h-20 w-20 items-center justify-center rounded-full border-4 text-2xl font-bold',
                  scoreColor
                )}
              >
                {report.score}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Readiness Score
                </h3>
                <Badge className={cn('mt-1', riskColors[report.riskLevel])}>
                  {report.riskLevel} RISK
                </Badge>
              </div>
            </div>

            <div
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium',
                report.recommendation === 'GREEN_LIGHT'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              )}
            >
              {report.recommendation === 'GREEN_LIGHT' ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  GREEN LIGHT \u2014 proceed with mitigations
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  NOT READY \u2014 close gaps first
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task-by-task assessment */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Task-by-Task Assessment
        </h3>
        <div className="space-y-3">
          {report.taskAssessments.map((ta) => {
            const dimensionBadge = (
              label: string,
              value: string,
              good: string[],
              warn: string[]
            ) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <Badge
                  className={cn(
                    good.includes(value)
                      ? 'bg-emerald-100 text-emerald-700'
                      : warn.includes(value)
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {value}
                </Badge>
              </div>
            );

            return (
              <Card key={ta.taskId}>
                <CardContent className="pt-4 pb-4">
                  <h4 className="font-medium text-slate-900 mb-3">{ta.taskName}</h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {dimensionBadge('Failure Impact', ta.failureImpact, ['low'], ['medium'])}
                    {dimensionBadge('Verification', ta.verificationFeasibility, ['strong', 'adequate'], ['weak'])}
                    {dimensionBadge('Rollback', ta.rollbackCapability, ['full'], ['partial'])}
                    {dimensionBadge('Approval Design', ta.approvalDesign, ['defined'], ['partial'])}
                    {dimensionBadge('Containment', ta.containmentAdequacy, ['sufficient'], ['partial'])}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Mitigations */}
      {report.mitigations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-amber-600" />
              Mitigations Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.mitigations.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                  {m}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Gaps */}
      {report.gaps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Gaps to Close
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                  {g}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AgentReadinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: projectId } = use(params);

  const [currentStep, setCurrentStep] = React.useState(1);
  const [report, setReport] = React.useState<ReadinessReport | null>(null);

  // Step 1: Tasks
  const [tasks, setTasks] = React.useState<TaskEntry[]>([
    { id: '1', name: '', description: '' },
  ]);

  // Step 2: Failure impacts (one per task)
  const [failures, setFailures] = React.useState<FailureEntry[]>([]);

  // Step 3-6: Free text answers
  const [verification, setVerification] = React.useState('');
  const [rollback, setRollback] = React.useState('');
  const [approvalGates, setApprovalGates] = React.useState('');
  const [containment, setContainment] = React.useState('');

  // Persist to localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(`govai_readiness_${projectId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.tasks) setTasks(data.tasks);
        if (data.failures) setFailures(data.failures);
        if (data.verification) setVerification(data.verification);
        if (data.rollback) setRollback(data.rollback);
        if (data.approvalGates) setApprovalGates(data.approvalGates);
        if (data.containment) setContainment(data.containment);
        if (data.report) setReport(data.report);
        if (data.currentStep) setCurrentStep(data.currentStep);
      } catch {
        // ignore
      }
    }
  }, [projectId]);

  const save = React.useCallback(
    (overrides?: Partial<{ currentStep: number; report: ReadinessReport | null }>) => {
      localStorage.setItem(
        `govai_readiness_${projectId}`,
        JSON.stringify({
          tasks,
          failures,
          verification,
          rollback,
          approvalGates,
          containment,
          currentStep: overrides?.currentStep ?? currentStep,
          report: overrides?.report ?? report,
        })
      );
    },
    [tasks, failures, verification, rollback, approvalGates, containment, currentStep, report, projectId]
  );

  // Sync failures array with tasks
  React.useEffect(() => {
    setFailures((prev) => {
      const existing = new Map(prev.map((f) => [f.taskId, f]));
      return tasks.map((t) => existing.get(t.id) || { taskId: t.id, impact: '' });
    });
  }, [tasks]);

  const addTask = () => {
    const newId = String(Date.now());
    setTasks((prev) => [...prev, { id: newId, name: '', description: '' }]);
  };

  const removeTask = (id: string) => {
    if (tasks.length <= 1) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTask = (id: string, field: 'name' | 'description', value: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const updateFailure = (taskId: string, impact: string) => {
    setFailures((prev) =>
      prev.map((f) => (f.taskId === taskId ? { ...f, impact } : f))
    );
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return tasks.every((t) => t.name.trim().length > 0);
      case 2:
        return failures.every((f) => f.impact.trim().length > 0);
      case 3:
        return verification.trim().length >= 10;
      case 4:
        return rollback.trim().length >= 10;
      case 5:
        return approvalGates.trim().length >= 10;
      case 6:
        return containment.trim().length >= 10;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      const next = currentStep + 1;
      setCurrentStep(next);
      save({ currentStep: next });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      save({ currentStep: prev });
    }
  };

  const handleGenerate = () => {
    const result = computeReport({
      tasks,
      failures,
      verification,
      rollback,
      approvalGates,
      containment,
    });
    setReport(result);
    save({ report: result });
  };

  const handleReset = () => {
    setTasks([{ id: '1', name: '', description: '' }]);
    setFailures([]);
    setVerification('');
    setRollback('');
    setApprovalGates('');
    setContainment('');
    setCurrentStep(1);
    setReport(null);
    localStorage.removeItem(`govai_readiness_${projectId}`);
  };

  const step = STEPS[currentStep - 1];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Radar className="h-6 w-6" />
            Agent Deployment Readiness Assessment
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Evaluate whether you&apos;re actually ready to deploy agents\u2014not whether agents are
            theoretically useful, but whether you have the infrastructure, discipline, and risk
            tolerance to deploy them safely.
          </p>
        </div>
        {report && (
          <Button variant="outline" onClick={handleReset}>
            Start Over
          </Button>
        )}
      </div>

      {/* Report view (shown after generation) */}
      {report ? (
        <ReportView report={report} />
      ) : (
        <>
          {/* Step indicator */}
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          {/* Current step content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Guidance callout */}
              <div className="mb-6 rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Guidance: </span>
                  {step.guidance}
                </p>
              </div>

              {/* Step 1: Define tasks */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {tasks.map((task, idx) => (
                    <div key={task.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Task {idx + 1}</Label>
                        {tasks.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                            onClick={() => removeTask(task.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-slate-600">Task name</Label>
                        <input
                          type="text"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                          placeholder="e.g., Triage incoming support emails"
                          value={task.name}
                          onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-slate-600">
                          Specific scope (what exactly will the agent do?)
                        </Label>
                        <Textarea
                          rows={2}
                          placeholder="e.g., Read incoming support emails, categorize by urgency, draft response templates for routine queries, flag complex issues for human review"
                          value={task.description}
                          onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addTask}>
                    + Add Another Task
                  </Button>
                </div>
              )}

              {/* Step 2: Failure impacts */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const failure = failures.find((f) => f.taskId === task.id);
                    return (
                      <div key={task.id} className="rounded-lg border border-slate-200 p-4 space-y-2">
                        <Label className="font-medium">{task.name || 'Unnamed task'}</Label>
                        <Textarea
                          rows={3}
                          placeholder="What is the predictable failure mode? What breaks if the agent gets this wrong?"
                          value={failure?.impact || ''}
                          onChange={(e) => updateFailure(task.id, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 3: Verification */}
              {currentStep === 3 && (
                <Textarea
                  rows={6}
                  placeholder="Who verifies agent actions? How often? By what evidence? What tooling do you use? Describe your real verification process, not aspirational spot-checking."
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                />
              )}

              {/* Step 4: Rollback */}
              {currentStep === 4 && (
                <Textarea
                  rows={6}
                  placeholder="When something goes wrong: Can you undo it? How fast? What actions are unrecoverable? What backups exist? What's your step-by-step recovery process?"
                  value={rollback}
                  onChange={(e) => setRollback(e.target.value)}
                />
              )}

              {/* Step 5: Approval gates */}
              {currentStep === 5 && (
                <Textarea
                  rows={6}
                  placeholder="Where are the human checkpoints? What actions require pre-approval before the agent executes? What is notification-only? What is fully autonomous? How do you maintain the 70/30 human-control model?"
                  value={approvalGates}
                  onChange={(e) => setApprovalGates(e.target.value)}
                />
              )}

              {/* Step 6: Containment */}
              {currentStep === 6 && (
                <Textarea
                  rows={6}
                  placeholder="Describe your containment infrastructure: dedicated hardware, throwaway accounts, air-gapped testing environments. Also be honest about real consequences if this fails publicly\u2014reputation, job, business, relationships."
                  value={containment}
                  onChange={(e) => setContainment(e.target.value)}
                />
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                disabled={currentStep === 1}
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              {currentStep < 6 ? (
                <Button disabled={!canProceed()} onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  disabled={!canProceed()}
                  onClick={handleGenerate}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Generate Readiness Report
                </Button>
              )}
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
