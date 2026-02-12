'use client';

import * as React from 'react';
import { use } from 'react';
import {
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  Eye,
  ShieldCheck,
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

interface FailureMode {
  id: string;
  description: string;
  detection: string;
  recovery: string;
  prevention: string;
}

interface TaskSpec {
  taskName: string;
  objective: string;
  authorizedActions: string;
  tools: string;
  frequency: string;
  boundaries: string;
  tier1Autonomous: string;
  tier2Notification: string;
  tier3Approval: string;
  successCriteria: string;
  failureModes: FailureMode[];
  verificationProtocol: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    number: 1,
    title: 'Task Definition',
    description: 'What task are you delegating?',
    guidance:
      'Specific, concrete, bounded. Not "manage my calendar" but "identify scheduling conflicts in my calendar and propose resolution options for my approval."',
  },
  {
    number: 2,
    title: 'Objective',
    description: 'What outcome do you care about?',
    guidance:
      'Not what the agent does\u2014what outcome you care about. "Free up 5 hours/week by automating email triage" is an objective. "Process emails" is not.',
  },
  {
    number: 3,
    title: 'Tools & Boundaries',
    description: 'What tools does the agent need, and what is it NOT allowed to do?',
    guidance:
      'Be specific: read-only vs. write access, which accounts, which systems, which APIs. The "must not" list matters more than the "can do" list.',
  },
  {
    number: 4,
    title: 'Approval Gates',
    description: 'Which actions require human approval?',
    guidance:
      'Tier 1 = autonomous within bounds. Tier 2 = agent acts but notifies you after. Tier 3 = requires your pre-approval before execution.',
  },
  {
    number: 5,
    title: 'Success Criteria',
    description: 'What does success look like?',
    guidance:
      'Measurable criteria\u2014not "does a good job." Example: "90% of emails correctly triaged, zero false positives on urgent messages, drafts ready for review in <2 hours."',
  },
  {
    number: 6,
    title: 'Failure Modes',
    description: 'What are the predictable failure modes and mitigations?',
    guidance:
      'Not edge cases\u2014the obvious ways this fails. For each one: how do you detect it, how do you recover, and what prevention exists?',
  },
];

const EMPTY_SPEC: TaskSpec = {
  taskName: '',
  objective: '',
  authorizedActions: '',
  tools: '',
  frequency: '',
  boundaries: '',
  tier1Autonomous: '',
  tier2Notification: '',
  tier3Approval: '',
  successCriteria: '',
  failureModes: [{ id: '1', description: '', detection: '', recovery: '', prevention: '' }],
  verificationProtocol: '',
};

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
/*  Spec document view                                                 */
/* ------------------------------------------------------------------ */

function SpecDocumentView({ spec }: { spec: TaskSpec }) {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{spec.taskName}</h3>
              <p className="mt-1 text-sm text-slate-500">Agent Task Specification</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objective */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Objective</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{spec.objective}</p>
        </CardContent>
      </Card>

      {/* Scope */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Scope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Authorized Actions
            </Label>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
              {spec.authorizedActions}
            </p>
          </div>
          <Separator />
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tools &amp; Access
            </Label>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{spec.tools}</p>
          </div>
          <Separator />
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Frequency / Schedule
            </Label>
            <p className="mt-1 text-sm text-slate-700">{spec.frequency}</p>
          </div>
        </CardContent>
      </Card>

      {/* Boundaries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Boundaries (MUST NOT)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800 whitespace-pre-wrap">{spec.boundaries}</p>
          </div>
        </CardContent>
      </Card>

      {/* Approval Gate Architecture */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-slate-700" />
            Approval Gate Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-100 text-emerald-700">Tier 1</Badge>
              <span className="text-sm font-medium text-emerald-800">
                Autonomous \u2014 Agent Decides &amp; Executes
              </span>
            </div>
            <p className="text-sm text-emerald-700 whitespace-pre-wrap">
              {spec.tier1Autonomous}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-amber-100 text-amber-700">Tier 2</Badge>
              <span className="text-sm font-medium text-amber-800">
                Notification \u2014 Agent Acts, Human Informed After
              </span>
            </div>
            <p className="text-sm text-amber-700 whitespace-pre-wrap">
              {spec.tier2Notification}
            </p>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-red-100 text-red-700">Tier 3</Badge>
              <span className="text-sm font-medium text-red-800">
                Approval Required \u2014 Human Must Approve Before Execution
              </span>
            </div>
            <p className="text-sm text-red-700 whitespace-pre-wrap">
              {spec.tier3Approval}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Success Criteria */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Success Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {spec.successCriteria}
          </p>
        </CardContent>
      </Card>

      {/* Failure Modes & Mitigations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Failure Modes &amp; Mitigations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {spec.failureModes
            .filter((fm) => fm.description.trim())
            .map((fm, idx) => (
              <div
                key={fm.id}
                className="rounded-lg border border-slate-200 p-4 space-y-3"
              >
                <h4 className="font-medium text-slate-900">
                  Failure Mode {idx + 1}: {fm.description}
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-500">Detection</Label>
                    <p className="mt-0.5 text-sm text-slate-700">{fm.detection}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-500">Recovery</Label>
                    <p className="mt-0.5 text-sm text-slate-700">{fm.recovery}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-500">Prevention</Label>
                    <p className="mt-0.5 text-sm text-slate-700">{fm.prevention}</p>
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Verification Protocol */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4 text-slate-700" />
            Verification Protocol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {spec.verificationProtocol}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TaskSpecPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: projectId } = use(params);

  const [currentStep, setCurrentStep] = React.useState(1);
  const [spec, setSpec] = React.useState<TaskSpec>(EMPTY_SPEC);
  const [generated, setGenerated] = React.useState(false);

  // Persist
  React.useEffect(() => {
    const stored = localStorage.getItem(`govai_taskspec_${projectId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.spec) setSpec(data.spec);
        if (data.generated) setGenerated(data.generated);
        if (data.currentStep) setCurrentStep(data.currentStep);
      } catch {
        // ignore
      }
    }
  }, [projectId]);

  const save = React.useCallback(
    (overrides?: Partial<{ currentStep: number; generated: boolean; spec: TaskSpec }>) => {
      localStorage.setItem(
        `govai_taskspec_${projectId}`,
        JSON.stringify({
          spec: overrides?.spec ?? spec,
          currentStep: overrides?.currentStep ?? currentStep,
          generated: overrides?.generated ?? generated,
        })
      );
    },
    [spec, currentStep, generated, projectId]
  );

  const updateSpec = <K extends keyof TaskSpec>(field: K, value: TaskSpec[K]) => {
    setSpec((prev) => ({ ...prev, [field]: value }));
  };

  const addFailureMode = () => {
    const newId = String(Date.now());
    updateSpec('failureModes', [
      ...spec.failureModes,
      { id: newId, description: '', detection: '', recovery: '', prevention: '' },
    ]);
  };

  const removeFailureMode = (id: string) => {
    if (spec.failureModes.length <= 1) return;
    updateSpec(
      'failureModes',
      spec.failureModes.filter((fm) => fm.id !== id)
    );
  };

  const updateFailureMode = (id: string, field: keyof FailureMode, value: string) => {
    updateSpec(
      'failureModes',
      spec.failureModes.map((fm) => (fm.id === id ? { ...fm, [field]: value } : fm))
    );
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return spec.taskName.trim().length > 0;
      case 2:
        return spec.objective.trim().length >= 10;
      case 3:
        return spec.tools.trim().length > 0 && spec.boundaries.trim().length > 0;
      case 4:
        return (
          spec.tier1Autonomous.trim().length > 0 ||
          spec.tier2Notification.trim().length > 0 ||
          spec.tier3Approval.trim().length > 0
        );
      case 5:
        return spec.successCriteria.trim().length >= 10;
      case 6:
        return spec.failureModes.some((fm) => fm.description.trim().length > 0);
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
    setGenerated(true);
    save({ generated: true });
  };

  const handleReset = () => {
    setSpec(EMPTY_SPEC);
    setCurrentStep(1);
    setGenerated(false);
    localStorage.removeItem(`govai_taskspec_${projectId}`);
  };

  const step = STEPS[currentStep - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Agent Task Specification
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Turn a vague delegation idea into a concrete specification with boundaries, success
            criteria, and failure modes defined.
          </p>
        </div>
        {generated && (
          <Button variant="outline" onClick={handleReset}>
            Start New Spec
          </Button>
        )}
      </div>

      {generated ? (
        <SpecDocumentView spec={spec} />
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

              {/* Step 1: Task definition */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label>Task Name</Label>
                    <Input
                      className="mt-1"
                      placeholder="e.g., Support email triage and response drafting"
                      value={spec.taskName}
                      onChange={(e) => updateSpec('taskName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Authorized Actions</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="What exactly is the agent authorized to do? Be specific."
                      value={spec.authorizedActions}
                      onChange={(e) => updateSpec('authorizedActions', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Frequency / Schedule</Label>
                    <Input
                      className="mt-1"
                      placeholder="e.g., Continuous during business hours, batch every 30 minutes"
                      value={spec.frequency}
                      onChange={(e) => updateSpec('frequency', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Objective */}
              {currentStep === 2 && (
                <Textarea
                  rows={6}
                  placeholder="What measurable outcome do you care about? Not what the agent does, but what result you need. Include specific metrics if possible."
                  value={spec.objective}
                  onChange={(e) => updateSpec('objective', e.target.value)}
                />
              )}

              {/* Step 3: Tools & Boundaries */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>Tools &amp; Access (what the agent CAN use)</Label>
                    <Textarea
                      className="mt-1"
                      rows={4}
                      placeholder="List each tool/system with permission level. e.g.:\n- Gmail: read + draft (no send)\n- Slack: read-only in #support channel\n- Jira: create tickets, comment (no close/delete)"
                      value={spec.tools}
                      onChange={(e) => updateSpec('tools', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-red-700">
                      Boundaries \u2014 MUST NOT (what the agent is explicitly prohibited from doing)
                    </Label>
                    <Textarea
                      className="mt-1 border-red-200"
                      rows={4}
                      placeholder="e.g.:\n- Must NOT send any email without human approval\n- Must NOT access financial systems\n- Must NOT delete any data\n- Must NOT share credentials or PII externally"
                      value={spec.boundaries}
                      onChange={(e) => updateSpec('boundaries', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Approval gates */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-emerald-200 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700">Tier 1</Badge>
                      <Label className="font-medium text-emerald-800">
                        Autonomous \u2014 Agent Decides &amp; Executes
                      </Label>
                    </div>
                    <Textarea
                      rows={3}
                      placeholder="Actions the agent can take without any approval. Low-stakes, reversible, high-frequency."
                      value={spec.tier1Autonomous}
                      onChange={(e) => updateSpec('tier1Autonomous', e.target.value)}
                    />
                  </div>

                  <div className="rounded-lg border border-amber-200 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700">Tier 2</Badge>
                      <Label className="font-medium text-amber-800">
                        Notification \u2014 Agent Acts, You&apos;re Informed After
                      </Label>
                    </div>
                    <Textarea
                      rows={3}
                      placeholder="Actions the agent takes but notifies you about after execution. Medium-stakes with reversibility."
                      value={spec.tier2Notification}
                      onChange={(e) => updateSpec('tier2Notification', e.target.value)}
                    />
                  </div>

                  <div className="rounded-lg border border-red-200 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-700">Tier 3</Badge>
                      <Label className="font-medium text-red-800">
                        Approval Required \u2014 Human Approves Before Execution
                      </Label>
                    </div>
                    <Textarea
                      rows={3}
                      placeholder="Actions that require your explicit approval before the agent can execute. High-stakes or irreversible."
                      value={spec.tier3Approval}
                      onChange={(e) => updateSpec('tier3Approval', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Success criteria */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <Textarea
                    rows={6}
                    placeholder="Define measurable success criteria. e.g.:\n- 90% of emails correctly triaged by category\n- Zero false positives on urgent-flag messages\n- Response drafts ready for review within 2 hours\n- Less than 5% of actions require correction after human review"
                    value={spec.successCriteria}
                    onChange={(e) => updateSpec('successCriteria', e.target.value)}
                  />
                  <div>
                    <Label>Verification Protocol</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Who checks, how often, by what method, using what evidence?"
                      value={spec.verificationProtocol}
                      onChange={(e) => updateSpec('verificationProtocol', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Failure modes */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  {spec.failureModes.map((fm, idx) => (
                    <div
                      key={fm.id}
                      className="rounded-lg border border-slate-200 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Failure Mode {idx + 1}</Label>
                        {spec.failureModes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                            onClick={() => removeFailureMode(fm.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-slate-600">What breaks?</Label>
                        <Textarea
                          rows={2}
                          placeholder="The predictable failure mode\u2014the obvious way this goes wrong"
                          value={fm.description}
                          onChange={(e) =>
                            updateFailureMode(fm.id, 'description', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <Label className="text-sm text-slate-600">Detection</Label>
                          <Textarea
                            rows={2}
                            placeholder="How do you detect it?"
                            value={fm.detection}
                            onChange={(e) =>
                              updateFailureMode(fm.id, 'detection', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">Recovery</Label>
                          <Textarea
                            rows={2}
                            placeholder="How do you recover?"
                            value={fm.recovery}
                            onChange={(e) =>
                              updateFailureMode(fm.id, 'recovery', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">Prevention</Label>
                          <Textarea
                            rows={2}
                            placeholder="What prevents this?"
                            value={fm.prevention}
                            onChange={(e) =>
                              updateFailureMode(fm.id, 'prevention', e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addFailureMode}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Failure Mode
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-4">
              <Button variant="outline" disabled={currentStep === 1} onClick={handlePrev}>
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
                  Generate Task Specification
                </Button>
              )}
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
