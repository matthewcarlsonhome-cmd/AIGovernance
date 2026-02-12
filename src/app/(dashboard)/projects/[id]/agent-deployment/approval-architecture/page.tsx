'use client';

import * as React from 'react';
import { use } from 'react';
import {
  GitBranch,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Plus,
  Trash2,
  Shield,
  Eye,
  AlertTriangle,
  ArrowUpCircle,
  Layers,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WorkflowAction {
  id: string;
  action: string;
  costOfError: 'low' | 'medium' | 'high';
  reversible: boolean;
  verificationTime: 'quick' | 'moderate' | 'slow';
  tier: 1 | 2 | 3;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  actions: WorkflowAction[];
}

interface ApprovalArchitecture {
  workflows: Workflow[];
  verificationTier1: string;
  verificationTier2: string;
  verificationTier3: string;
  auditRequirements: string;
  escalationRules: string;
  implementationChecklist: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    number: 1,
    title: 'Workflows',
    description: 'What workflows are you delegating to agents?',
    guidance:
      'List them: email triage, calendar management, research synthesis, meeting prep, code review, data analysis, etc.',
  },
  {
    number: 2,
    title: 'Decision Points',
    description: 'Where are the consequential decision points in each workflow?',
    guidance:
      'Not every step\u2014just where a wrong decision is expensive. Sending an email to a client? Expensive. Unsubscribing from spam? Cheap.',
  },
  {
    number: 3,
    title: 'Tier Classification',
    description: 'Classify each action into an approval tier.',
    guidance:
      'Tier 1 = autonomous, low-stakes, reversible. Tier 2 = supervised, agent proposes, human approves (<30s review). Tier 3 = collaborative, agent assists, human decides.',
  },
  {
    number: 4,
    title: 'Verification & Audit',
    description: 'How will you verify actions and maintain audit trails?',
    guidance:
      'Real verification capacity\u2014how much time per day for reviewing agent actions? What tooling do you have? Which actions require a record of who approved what?',
  },
  {
    number: 5,
    title: 'Escalation Rules',
    description: 'When does an action escalate to a higher tier?',
    guidance:
      'What triggers an action to move from Tier 1 to Tier 2 (or Tier 2 to Tier 3)? What triggers human override? How does the agent signal uncertainty?',
  },
];

const DEFAULT_WORKFLOW: Workflow = {
  id: '1',
  name: '',
  description: '',
  actions: [
    {
      id: '1-1',
      action: '',
      costOfError: 'medium',
      reversible: true,
      verificationTime: 'quick',
      tier: 2,
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Helper: auto-suggest tier                                          */
/* ------------------------------------------------------------------ */

function suggestTier(action: WorkflowAction): 1 | 2 | 3 {
  if (action.costOfError === 'low' && action.reversible) return 1;
  if (action.costOfError === 'high' || !action.reversible) return 3;
  if (action.verificationTime === 'quick') return 2;
  if (action.verificationTime === 'slow') return 3;
  return 2;
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
/*  Architecture document view                                         */
/* ------------------------------------------------------------------ */

function ArchitectureDocumentView({ arch }: { arch: ApprovalArchitecture }) {
  const allActions = arch.workflows.flatMap((w) =>
    w.actions.map((a) => ({ ...a, workflowName: w.name }))
  );
  const tier1Actions = allActions.filter((a) => a.tier === 1);
  const tier2Actions = allActions.filter((a) => a.tier === 2);
  const tier3Actions = allActions.filter((a) => a.tier === 3);
  const totalActions = allActions.length;
  const humanControlled = tier2Actions.length + tier3Actions.length;
  const humanPercent = totalActions > 0 ? Math.round((humanControlled / totalActions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white shrink-0">
                <GitBranch className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  70/30 Approval Architecture
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {arch.workflows.length} workflow{arch.workflows.length !== 1 ? 's' : ''},{' '}
                  {totalActions} classified actions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full border-4 text-lg font-bold',
                  humanPercent >= 60
                    ? 'border-emerald-500 text-emerald-600'
                    : humanPercent >= 40
                    ? 'border-amber-500 text-amber-600'
                    : 'border-red-500 text-red-600'
                )}
              >
                {humanPercent}%
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900">Human Control</p>
                <p className="text-slate-500">Target: 70%+</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier 1 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Badge className="bg-emerald-100 text-emerald-700">Tier 1</Badge>
            Autonomous \u2014 Agent Decides &amp; Executes
          </CardTitle>
          <CardDescription>
            Low-stakes, reversible, high-frequency tasks. Notification-only after execution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tier1Actions.length > 0 ? (
            <div className="space-y-2">
              {tier1Actions.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2"
                >
                  <span className="text-sm text-emerald-800">{a.action}</span>
                  <span className="text-xs text-emerald-600">{a.workflowName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No actions classified as Tier 1</p>
          )}
        </CardContent>
      </Card>

      {/* Tier 2 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Badge className="bg-amber-100 text-amber-700">Tier 2</Badge>
            Supervised \u2014 Agent Proposes, Human Approves
          </CardTitle>
          <CardDescription>
            Medium-stakes actions where verification is fast (&lt;30 sec). Batch approval supported.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tier2Actions.length > 0 ? (
            <div className="space-y-2">
              {tier2Actions.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-4 py-2"
                >
                  <span className="text-sm text-amber-800">{a.action}</span>
                  <span className="text-xs text-amber-600">{a.workflowName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No actions classified as Tier 2</p>
          )}
        </CardContent>
      </Card>

      {/* Tier 3 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Badge className="bg-red-100 text-red-700">Tier 3</Badge>
            Collaborative \u2014 Agent Assists, Human Decides
          </CardTitle>
          <CardDescription>
            High-stakes or irreversible actions. Agent provides research/prep, human makes the final call.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tier3Actions.length > 0 ? (
            <div className="space-y-2">
              {tier3Actions.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg bg-red-50 border border-red-200 px-4 py-2"
                >
                  <span className="text-sm text-red-800">{a.action}</span>
                  <span className="text-xs text-red-600">{a.workflowName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No actions classified as Tier 3</p>
          )}
        </CardContent>
      </Card>

      {/* Verification Protocol */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" />
            Verification Protocol by Tier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {arch.verificationTier1 && (
            <div>
              <Label className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Tier 1 Spot-Check
              </Label>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                {arch.verificationTier1}
              </p>
            </div>
          )}
          {arch.verificationTier2 && (
            <>
              <Separator />
              <div>
                <Label className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                  Tier 2 Review Process
                </Label>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                  {arch.verificationTier2}
                </p>
              </div>
            </>
          )}
          {arch.verificationTier3 && (
            <>
              <Separator />
              <div>
                <Label className="text-xs font-medium text-red-600 uppercase tracking-wide">
                  Tier 3 Decision Support
                </Label>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                  {arch.verificationTier3}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Audit & Escalation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Audit Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {arch.auditRequirements}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowUpCircle className="h-4 w-4" />
              Escalation Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {arch.escalationRules}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Implementation checklist */}
      {arch.implementationChecklist && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Implementation Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {arch.implementationChecklist}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ApprovalArchitecturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: projectId } = use(params);

  const [currentStep, setCurrentStep] = React.useState(1);
  const [generated, setGenerated] = React.useState(false);

  const [workflows, setWorkflows] = React.useState<Workflow[]>([{ ...DEFAULT_WORKFLOW }]);
  const [verificationTier1, setVerificationTier1] = React.useState('');
  const [verificationTier2, setVerificationTier2] = React.useState('');
  const [verificationTier3, setVerificationTier3] = React.useState('');
  const [auditRequirements, setAuditRequirements] = React.useState('');
  const [escalationRules, setEscalationRules] = React.useState('');
  const [implementationChecklist, setImplementationChecklist] = React.useState('');

  // Persist
  React.useEffect(() => {
    const stored = localStorage.getItem(`govai_approval_arch_${projectId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.workflows) setWorkflows(data.workflows);
        if (data.verificationTier1) setVerificationTier1(data.verificationTier1);
        if (data.verificationTier2) setVerificationTier2(data.verificationTier2);
        if (data.verificationTier3) setVerificationTier3(data.verificationTier3);
        if (data.auditRequirements) setAuditRequirements(data.auditRequirements);
        if (data.escalationRules) setEscalationRules(data.escalationRules);
        if (data.implementationChecklist) setImplementationChecklist(data.implementationChecklist);
        if (data.generated) setGenerated(data.generated);
        if (data.currentStep) setCurrentStep(data.currentStep);
      } catch {
        // ignore
      }
    }
  }, [projectId]);

  const save = React.useCallback(
    (overrides?: Partial<{ currentStep: number; generated: boolean }>) => {
      localStorage.setItem(
        `govai_approval_arch_${projectId}`,
        JSON.stringify({
          workflows,
          verificationTier1,
          verificationTier2,
          verificationTier3,
          auditRequirements,
          escalationRules,
          implementationChecklist,
          currentStep: overrides?.currentStep ?? currentStep,
          generated: overrides?.generated ?? generated,
        })
      );
    },
    [workflows, verificationTier1, verificationTier2, verificationTier3, auditRequirements, escalationRules, implementationChecklist, currentStep, generated, projectId]
  );

  /* Workflow CRUD */
  const addWorkflow = () => {
    const newId = String(Date.now());
    setWorkflows((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        description: '',
        actions: [
          {
            id: `${newId}-1`,
            action: '',
            costOfError: 'medium' as const,
            reversible: true,
            verificationTime: 'quick' as const,
            tier: 2 as const,
          },
        ],
      },
    ]);
  };

  const removeWorkflow = (id: string) => {
    if (workflows.length <= 1) return;
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWorkflow = (id: string, field: 'name' | 'description', value: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const addAction = (workflowId: string) => {
    const newId = `${workflowId}-${Date.now()}`;
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? {
              ...w,
              actions: [
                ...w.actions,
                {
                  id: newId,
                  action: '',
                  costOfError: 'medium' as const,
                  reversible: true,
                  verificationTime: 'quick' as const,
                  tier: 2 as const,
                },
              ],
            }
          : w
      )
    );
  };

  const removeAction = (workflowId: string, actionId: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId && w.actions.length > 1
          ? { ...w, actions: w.actions.filter((a) => a.id !== actionId) }
          : w
      )
    );
  };

  const updateAction = (
    workflowId: string,
    actionId: string,
    updates: Partial<WorkflowAction>
  ) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? {
              ...w,
              actions: w.actions.map((a) =>
                a.id === actionId ? { ...a, ...updates } : a
              ),
            }
          : w
      )
    );
  };

  const autoClassifyAction = (workflowId: string, actionId: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? {
              ...w,
              actions: w.actions.map((a) =>
                a.id === actionId ? { ...a, tier: suggestTier(a) } : a
              ),
            }
          : w
      )
    );
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return workflows.every((w) => w.name.trim().length > 0);
      case 2:
        return workflows.every((w) =>
          w.actions.every((a) => a.action.trim().length > 0)
        );
      case 3:
        return true; // tier classification has defaults
      case 4:
        return (
          verificationTier1.trim().length > 0 ||
          verificationTier2.trim().length > 0 ||
          verificationTier3.trim().length > 0
        );
      case 5:
        return escalationRules.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
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
    setGenerated(true);
    save({ generated: true });
  };

  const handleReset = () => {
    setWorkflows([{ ...DEFAULT_WORKFLOW }]);
    setVerificationTier1('');
    setVerificationTier2('');
    setVerificationTier3('');
    setAuditRequirements('');
    setEscalationRules('');
    setImplementationChecklist('');
    setCurrentStep(1);
    setGenerated(false);
    localStorage.removeItem(`govai_approval_arch_${projectId}`);
  };

  const step = STEPS[currentStep - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <GitBranch className="h-6 w-6" />
            70/30 Approval Architecture
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Design the human-in-the-loop architecture: 70% human control, 30% agent execution.
            Define which decisions stay human, which actions need pre-approval, and how the
            verification loop closes.
          </p>
        </div>
        {generated && (
          <Button variant="outline" onClick={handleReset}>
            Start Over
          </Button>
        )}
      </div>

      {generated ? (
        <ArchitectureDocumentView
          arch={{
            workflows,
            verificationTier1,
            verificationTier2,
            verificationTier3,
            auditRequirements,
            escalationRules,
            implementationChecklist,
          }}
        />
      ) : (
        <>
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Guidance: </span>
                  {step.guidance}
                </p>
              </div>

              {/* Step 1: Define workflows */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {workflows.map((w, idx) => (
                    <div key={w.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Workflow {idx + 1}</Label>
                        {workflows.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                            onClick={() => removeWorkflow(w.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-slate-600">Workflow name</Label>
                        <Input
                          className="mt-1"
                          placeholder="e.g., Email triage, Calendar management"
                          value={w.name}
                          onChange={(e) => updateWorkflow(w.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-slate-600">Description</Label>
                        <Textarea
                          rows={2}
                          placeholder="Brief description of this workflow"
                          value={w.description}
                          onChange={(e) => updateWorkflow(w.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addWorkflow}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Workflow
                  </Button>
                </div>
              )}

              {/* Step 2: Decision points / actions */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {workflows.map((w) => (
                    <div key={w.id} className="space-y-3">
                      <h4 className="font-medium text-slate-900">
                        {w.name || 'Unnamed workflow'}
                      </h4>
                      {w.actions.map((action, aIdx) => (
                        <div
                          key={action.id}
                          className="rounded-lg border border-slate-200 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <Label className="text-sm text-slate-600">
                              Action {aIdx + 1}
                            </Label>
                            {w.actions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 h-7 px-2"
                                onClick={() => removeAction(w.id, action.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          <Input
                            placeholder="Describe the consequential action"
                            value={action.action}
                            onChange={(e) =>
                              updateAction(w.id, action.id, { action: e.target.value })
                            }
                          />
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <Label className="text-xs text-slate-500">Cost of error</Label>
                              <select
                                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={action.costOfError}
                                onChange={(e) =>
                                  updateAction(w.id, action.id, {
                                    costOfError: e.target.value as WorkflowAction['costOfError'],
                                  })
                                }
                              >
                                <option value="low">Low \u2014 cheap to fix</option>
                                <option value="medium">Medium \u2014 moderate cost</option>
                                <option value="high">High \u2014 expensive/damaging</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Reversible?</Label>
                              <select
                                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={action.reversible ? 'yes' : 'no'}
                                onChange={(e) =>
                                  updateAction(w.id, action.id, {
                                    reversible: e.target.value === 'yes',
                                  })
                                }
                              >
                                <option value="yes">Yes \u2014 can undo</option>
                                <option value="no">No \u2014 irreversible</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">
                                Verification time
                              </Label>
                              <select
                                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={action.verificationTime}
                                onChange={(e) =>
                                  updateAction(w.id, action.id, {
                                    verificationTime: e.target.value as WorkflowAction['verificationTime'],
                                  })
                                }
                              >
                                <option value="quick">&lt;30 seconds</option>
                                <option value="moderate">30s \u2013 5 min</option>
                                <option value="slow">&gt;5 minutes</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAction(w.id)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Action
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Tier classification */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {workflows.map((w) => (
                    <div key={w.id} className="space-y-3">
                      <h4 className="font-medium text-slate-900">{w.name}</h4>
                      {w.actions.map((action) => (
                        <div
                          key={action.id}
                          className={cn(
                            'rounded-lg border p-4 space-y-3',
                            action.tier === 1
                              ? 'border-emerald-200 bg-emerald-50'
                              : action.tier === 2
                              ? 'border-amber-200 bg-amber-50'
                              : 'border-red-200 bg-red-50'
                          )}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-slate-900">
                              {action.action || 'Unnamed action'}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => autoClassifyAction(w.id, action.id)}
                              >
                                Auto-suggest
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3].map((tier) => (
                              <button
                                key={tier}
                                onClick={() =>
                                  updateAction(w.id, action.id, { tier: tier as 1 | 2 | 3 })
                                }
                                className={cn(
                                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                  action.tier === tier
                                    ? tier === 1
                                      ? 'bg-emerald-600 text-white'
                                      : tier === 2
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-red-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                )}
                              >
                                Tier {tier}:{' '}
                                {tier === 1
                                  ? 'Autonomous'
                                  : tier === 2
                                  ? 'Supervised'
                                  : 'Collaborative'}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">
                            {action.costOfError} cost of error
                            {' \u2022 '}
                            {action.reversible ? 'reversible' : 'irreversible'}
                            {' \u2022 '}
                            {action.verificationTime} verification
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Verification & Audit */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">Tier 1</Badge>
                      How do you spot-check autonomous actions?
                    </Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="How often do you review? What logs do you check? What sampling rate?"
                      value={verificationTier1}
                      onChange={(e) => setVerificationTier1(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700 text-xs">Tier 2</Badge>
                      What&apos;s your approval review process?
                    </Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Tooling, time budget per day, batch approval process?"
                      value={verificationTier2}
                      onChange={(e) => setVerificationTier2(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-700 text-xs">Tier 3</Badge>
                      How are agent deliverables structured for your decision-making?
                    </Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="What format does the agent provide research/analysis? How do you consume it?"
                      value={verificationTier3}
                      onChange={(e) => setVerificationTier3(e.target.value)}
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label>Audit Requirements</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Which tiers need audit trails? What gets logged (action, timestamp, approval/rejection, rationale)? Retention period?"
                      value={auditRequirements}
                      onChange={(e) => setAuditRequirements(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Escalation rules */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <Label>Escalation Rules</Label>
                    <Textarea
                      className="mt-1"
                      rows={5}
                      placeholder="When does an action move from Tier 1 to Tier 2? Tier 2 to Tier 3? What triggers human override? How does the agent signal uncertainty or request guidance?"
                      value={escalationRules}
                      onChange={(e) => setEscalationRules(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Implementation Checklist (optional)</Label>
                    <Textarea
                      className="mt-1"
                      rows={5}
                      placeholder="Specific steps to configure this architecture in your agent deployment. What infrastructure needs to be set up? What permissions need configuring?"
                      value={implementationChecklist}
                      onChange={(e) => setImplementationChecklist(e.target.value)}
                    />
                  </div>
                </div>
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
              {currentStep < 5 ? (
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
                  Generate Architecture Document
                </Button>
              )}
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
