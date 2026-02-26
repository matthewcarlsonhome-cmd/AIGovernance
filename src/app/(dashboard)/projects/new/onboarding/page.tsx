'use client';

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Briefcase,
  Users,
  ClipboardCheck,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  Info,
  Rocket,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectOption } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface OrgProfile {
  companyName: string;
  industry: string;
  companySize: string;
  regulatoryEnvironment: string[];
}

interface ProjectDefinition {
  projectName: string;
  aiTool: string;
  businessUseCase: string;
  targetTimeline: string;
  executiveSponsor: string;
}

interface TeamSlot {
  role: string;
  label: string;
  description: string;
  required: boolean;
  name: string;
  email: string;
}

interface IntakeAnswer {
  questionId: string;
  value: string;
}

type RiskPath = 'fast_track' | 'standard' | 'high_risk';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STEPS = [
  { label: 'Organization', icon: Building2 },
  { label: 'Project', icon: Briefcase },
  { label: 'Team', icon: Users },
  { label: 'Scorecard', icon: ClipboardCheck },
  { label: 'Review', icon: FileCheck },
] as const;

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Government',
  'Education',
  'Retail',
  'Manufacturing',
  'Other',
];

const COMPANY_SIZES = ['1-50', '51-200', '201-1000', '1001-5000', '5000+'];

const REGULATORY_OPTIONS = ['SOC2', 'HIPAA', 'NIST', 'GDPR', 'FedRAMP', 'None'];

const AI_TOOLS = [
  'Claude Code',
  'GitHub Copilot',
  'Amazon CodeWhisperer',
  'OpenAI Codex',
  'Cursor',
  'Multiple Tools',
  'Other',
];

const TIMELINES = ['30 days', '60 days', '90 days', '120 days', 'Custom'];

const INITIAL_TEAM_SLOTS: TeamSlot[] = [
  { role: 'admin', label: 'Project Administrator', description: 'Manages project configuration and team access', required: true, name: '', email: '' },
  { role: 'consultant', label: 'Governance Consultant', description: 'Leads the governance framework and coordinates across teams', required: false, name: '', email: '' },
  { role: 'executive', label: 'Executive Sponsor', description: 'Provides executive oversight and makes go/no-go decisions', required: true, name: '', email: '' },
  { role: 'it', label: 'IT / Security Lead', description: 'Manages infrastructure, security controls, and data classification', required: true, name: '', email: '' },
  { role: 'legal', label: 'Legal / Compliance Lead', description: 'Reviews policies, compliance mappings, and exceptions', required: false, name: '', email: '' },
  { role: 'engineering', label: 'Engineering Lead', description: 'Configures sandbox, runs pilot, and collects technical metrics', required: false, name: '', email: '' },
  { role: 'marketing', label: 'Communications Lead', description: 'Drafts stakeholder communications and change management materials', required: false, name: '', email: '' },
];

const INTAKE_QUESTIONS = [
  {
    id: 'q1',
    question: 'Has your organization deployed AI tools before?',
    options: [
      { label: 'Yes, fully', value: 'yes', score: 3 },
      { label: 'Partially', value: 'partial', score: 2 },
      { label: 'No', value: 'no', score: 1 },
    ],
  },
  {
    id: 'q2',
    question: 'Do you have an existing data classification framework?',
    options: [
      { label: 'Yes', value: 'yes', score: 3 },
      { label: 'In progress', value: 'partial', score: 2 },
      { label: 'No', value: 'no', score: 1 },
    ],
  },
  {
    id: 'q3',
    question: 'Is there executive sponsorship for this initiative?',
    options: [
      { label: 'Active sponsor', value: 'yes', score: 3 },
      { label: 'Passive support', value: 'partial', score: 2 },
      { label: 'No sponsor', value: 'no', score: 1 },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Risk Path Helpers                                                          */
/* -------------------------------------------------------------------------- */

function computeRiskPath(answers: IntakeAnswer[]): RiskPath {
  if (answers.length < 3) return 'standard';
  const allPositive = answers.every((a) => a.value === 'yes');
  const allNegative = answers.every((a) => a.value === 'no');
  if (allPositive) return 'fast_track';
  if (allNegative) return 'high_risk';
  return 'standard';
}

const RISK_PATH_CONFIG: Record<RiskPath, {
  label: string;
  message: string;
  badgeClass: string;
  tasks: number;
  days: number;
}> = {
  fast_track: {
    label: 'Fast Track',
    message: 'Your organization shows strong readiness. Standard governance path recommended.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    tasks: 25,
    days: 60,
  },
  standard: {
    label: 'Standard',
    message: 'Some areas need attention. Full governance review recommended.',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    tasks: 33,
    days: 90,
  },
  high_risk: {
    label: 'High Risk',
    message: 'Significant gaps identified. Extended assessment and governance review required.',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    tasks: 40,
    days: 120,
  },
};

const PLAN_PHASES = [
  { name: 'Discovery & Assessment', fast: 5, standard: 7, high: 9 },
  { name: 'Classify & Govern', fast: 5, standard: 7, high: 9 },
  { name: 'Sandbox & Control', fast: 5, standard: 7, high: 8 },
  { name: 'Pilot Execution', fast: 6, standard: 7, high: 8 },
  { name: 'Decision & Scale', fast: 4, standard: 5, high: 6 },
];

/* -------------------------------------------------------------------------- */
/*  Step Indicator Component                                                   */
/* -------------------------------------------------------------------------- */

function StepIndicator({ currentStep }: { currentStep: number }): React.ReactElement {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <React.Fragment key={step.label}>
            {i > 0 && (
              <div className={cn('h-0.5 w-8 sm:w-12', isComplete ? 'bg-emerald-400' : 'bg-slate-200')} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors',
                  isComplete && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-slate-900 text-white ring-2 ring-slate-300',
                  !isComplete && !isCurrent && 'bg-slate-100 text-slate-400',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={cn(
                'text-xs font-medium hidden sm:block',
                isCurrent ? 'text-slate-900' : 'text-slate-400',
              )}>
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function OnboardingWizardPage(): React.ReactElement {
  const [currentStep, setCurrentStep] = useState(0);
  const [created, setCreated] = useState(false);

  // Step 1 state
  const [orgProfile, setOrgProfile] = useState<OrgProfile>({
    companyName: '',
    industry: '',
    companySize: '',
    regulatoryEnvironment: [],
  });

  // Step 2 state
  const [projectDef, setProjectDef] = useState<ProjectDefinition>({
    projectName: '',
    aiTool: '',
    businessUseCase: '',
    targetTimeline: '',
    executiveSponsor: '',
  });

  // Step 3 state
  const [teamSlots, setTeamSlots] = useState<TeamSlot[]>(
    INITIAL_TEAM_SLOTS.map((s) => ({ ...s })),
  );

  // Step 4 state
  const [intakeAnswers, setIntakeAnswers] = useState<IntakeAnswer[]>([]);

  const riskPath = useMemo(() => computeRiskPath(intakeAnswers), [intakeAnswers]);
  const riskConfig = RISK_PATH_CONFIG[riskPath];

  /* ---- Validation ---- */
  const step1Valid = orgProfile.companyName.trim().length > 0 && orgProfile.industry.length > 0 && orgProfile.companySize.length > 0;
  const step2Valid = projectDef.projectName.trim().length > 0 && projectDef.aiTool.length > 0;
  const step3Valid = (() => {
    const admin = teamSlots.find((s) => s.role === 'admin');
    const exec = teamSlots.find((s) => s.role === 'executive');
    const itLead = teamSlots.find((s) => s.role === 'it');
    const legalLead = teamSlots.find((s) => s.role === 'legal');
    const adminFilled = Boolean(admin && admin.name.trim() && admin.email.trim());
    const execFilled = Boolean(exec && exec.name.trim() && exec.email.trim());
    const itOrLegalFilled = Boolean(
      (itLead && itLead.name.trim() && itLead.email.trim()) ||
      (legalLead && legalLead.name.trim() && legalLead.email.trim()),
    );
    return adminFilled && execFilled && itOrLegalFilled;
  })();
  const step4Valid = intakeAnswers.length === INTAKE_QUESTIONS.length;

  const canContinue = [step1Valid, step2Valid, step3Valid, step4Valid, true][currentStep];

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleRegToggle = useCallback((opt: string) => {
    setOrgProfile((prev) => {
      const updated = prev.regulatoryEnvironment.includes(opt)
        ? prev.regulatoryEnvironment.filter((r) => r !== opt)
        : opt === 'None'
          ? ['None']
          : [...prev.regulatoryEnvironment.filter((r) => r !== 'None'), opt];
      return { ...prev, regulatoryEnvironment: updated };
    });
  }, []);

  const handleTeamChange = useCallback((idx: number, field: 'name' | 'email', value: string) => {
    setTeamSlots((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }, []);

  const handleIntakeAnswer = useCallback((questionId: string, value: string) => {
    setIntakeAnswers((prev) => {
      const existing = prev.filter((a) => a.questionId !== questionId);
      return [...existing, { questionId, value }];
    });
  }, []);

  const handleCreate = useCallback(() => {
    setCreated(true);
  }, []);

  /* ---- Success State ---- */
  if (created) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <Rocket className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Project Created Successfully</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Your project &quot;{projectDef.projectName}&quot; has been created with a {riskConfig.label} governance path.
          {riskConfig.tasks} tasks have been generated across {riskConfig.days} days.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 gap-2">
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create New Project</h1>
        <p className="text-sm text-slate-500 mt-1">Set up your AI governance engagement in 5 simple steps</p>
      </div>

      <StepIndicator currentStep={currentStep} />

      {/* Step 1: Organization Profile */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Organization Profile</CardTitle>
            <CardDescription className="text-slate-500">
              Tell us about your organization so we can pre-configure relevant frameworks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Company Name *</label>
              <Input
                placeholder="Acme Corporation"
                value={orgProfile.companyName}
                onChange={(e) => setOrgProfile((p) => ({ ...p, companyName: e.target.value }))}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Industry *</label>
              <Select
                value={orgProfile.industry}
                onValueChange={(v) => setOrgProfile((p) => ({ ...p, industry: v }))}
                className="border-slate-200"
              >
                <SelectOption value="" disabled>Select industry</SelectOption>
                {INDUSTRIES.map((ind) => (
                  <SelectOption key={ind} value={ind}>{ind}</SelectOption>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Company Size *</label>
              <Select
                value={orgProfile.companySize}
                onValueChange={(v) => setOrgProfile((p) => ({ ...p, companySize: v }))}
                className="border-slate-200"
              >
                <SelectOption value="" disabled>Select company size</SelectOption>
                {COMPANY_SIZES.map((sz) => (
                  <SelectOption key={sz} value={sz}>{sz} employees</SelectOption>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Regulatory Environment</label>
              <div className="grid grid-cols-3 gap-3">
                {REGULATORY_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <Checkbox
                      checked={orgProfile.regulatoryEnvironment.includes(opt)}
                      onCheckedChange={() => handleRegToggle(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-xs text-blue-700">
                This helps pre-configure compliance frameworks relevant to your organization.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Project Definition */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Project Definition</CardTitle>
            <CardDescription className="text-slate-500">
              Define the scope and goals of your AI governance engagement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Project Name *</label>
              <Input
                placeholder="Enterprise AI Coding Agent Pilot"
                value={projectDef.projectName}
                onChange={(e) => setProjectDef((p) => ({ ...p, projectName: e.target.value }))}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">AI Tool Being Evaluated *</label>
              <Select
                value={projectDef.aiTool}
                onValueChange={(v) => setProjectDef((p) => ({ ...p, aiTool: v }))}
                className="border-slate-200"
              >
                <SelectOption value="" disabled>Select AI tool</SelectOption>
                {AI_TOOLS.map((tool) => (
                  <SelectOption key={tool} value={tool}>{tool}</SelectOption>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Business Use Case</label>
              <Textarea
                placeholder="Describe the business problem you aim to solve with AI coding tools (2-3 sentences)..."
                value={projectDef.businessUseCase}
                onChange={(e) => setProjectDef((p) => ({ ...p, businessUseCase: e.target.value }))}
                className="border-slate-200 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Target Timeline</label>
              <Select
                value={projectDef.targetTimeline}
                onValueChange={(v) => setProjectDef((p) => ({ ...p, targetTimeline: v }))}
                className="border-slate-200"
              >
                <SelectOption value="" disabled>Select timeline</SelectOption>
                {TIMELINES.map((t) => (
                  <SelectOption key={t} value={t}>{t}</SelectOption>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Executive Sponsor Name</label>
              <Input
                placeholder="Jane Smith"
                value={projectDef.executiveSponsor}
                onChange={(e) => setProjectDef((p) => ({ ...p, executiveSponsor: e.target.value }))}
                className="border-slate-200"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Team Setup */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Team Setup</CardTitle>
            <CardDescription className="text-slate-500">
              Assign team members to key roles. Required roles are marked with *.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamSlots.map((slot, idx) => (
              <div key={slot.role} className="p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">
                      {slot.label} {slot.required && <span className="text-red-500">*</span>}
                    </h4>
                    <p className="text-xs text-slate-500">{slot.description}</p>
                  </div>
                  {slot.required && (
                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs shrink-0">
                      Required
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Full name"
                    value={slot.name}
                    onChange={(e) => handleTeamChange(idx, 'name', e.target.value)}
                    className="border-slate-200 text-sm"
                  />
                  <Input
                    placeholder="email@company.com"
                    type="email"
                    value={slot.email}
                    onChange={(e) => handleTeamChange(idx, 'email', e.target.value)}
                    className="border-slate-200 text-sm"
                  />
                </div>
              </div>
            ))}

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-xs text-blue-700">
                You can add additional team members after project creation. At minimum, fill in the Project Administrator, Executive Sponsor, and one of IT/Security Lead or Legal/Compliance Lead.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Intake Scorecard */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Intake Scorecard</CardTitle>
            <CardDescription className="text-slate-500">
              Answer these quick screening questions to determine your governance path.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {INTAKE_QUESTIONS.map((q) => {
              const selected = intakeAnswers.find((a) => a.questionId === q.id)?.value;
              return (
                <div key={q.id} className="space-y-3">
                  <p className="text-sm font-medium text-slate-900">{q.question}</p>
                  <div className="flex gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleIntakeAnswer(q.id, opt.value)}
                        className={cn(
                          'flex-1 px-3 py-2 text-sm rounded-lg border transition-colors',
                          selected === opt.value
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {step4Valid && (
              <>
                <Separator className="bg-slate-200" />
                <div className="p-4 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">Risk Path Classification:</span>
                    <Badge variant="outline" className={cn('text-xs', riskConfig.badgeClass)}>
                      {riskConfig.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{riskConfig.message}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review & Create */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Review Your Project</CardTitle>
              <CardDescription className="text-slate-500">
                Confirm the details below before creating your project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Organization Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900">Organization</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-slate-500">Company</span>
                  <span className="text-slate-900">{orgProfile.companyName}</span>
                  <span className="text-slate-500">Industry</span>
                  <span className="text-slate-900">{orgProfile.industry}</span>
                  <span className="text-slate-500">Size</span>
                  <span className="text-slate-900">{orgProfile.companySize} employees</span>
                  <span className="text-slate-500">Regulatory</span>
                  <span className="text-slate-900">
                    {orgProfile.regulatoryEnvironment.length > 0
                      ? orgProfile.regulatoryEnvironment.join(', ')
                      : 'None specified'}
                  </span>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Project Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900">Project</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-slate-500">Project Name</span>
                  <span className="text-slate-900">{projectDef.projectName}</span>
                  <span className="text-slate-500">AI Tool</span>
                  <span className="text-slate-900">{projectDef.aiTool}</span>
                  <span className="text-slate-500">Timeline</span>
                  <span className="text-slate-900">{projectDef.targetTimeline || 'Not specified'}</span>
                  <span className="text-slate-500">Executive Sponsor</span>
                  <span className="text-slate-900">{projectDef.executiveSponsor || 'Not specified'}</span>
                </div>
                {projectDef.businessUseCase && (
                  <div className="mt-2">
                    <span className="text-xs text-slate-500">Use Case</span>
                    <p className="text-sm text-slate-700 mt-0.5">{projectDef.businessUseCase}</p>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-200" />

              {/* Team Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900">Team</h4>
                <div className="space-y-1">
                  {teamSlots.filter((s) => s.name.trim()).map((s) => (
                    <div key={s.role} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{s.label}</span>
                      <span className="text-slate-900">{s.name} ({s.email})</span>
                    </div>
                  ))}
                  {teamSlots.filter((s) => s.name.trim()).length === 0 && (
                    <p className="text-sm text-slate-400">No team members assigned</p>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Risk Path */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900">Governance Path</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-xs', riskConfig.badgeClass)}>
                    {riskConfig.label}
                  </Badge>
                  <span className="text-sm text-slate-600">{riskConfig.message}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Plan Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Generated Project Plan</CardTitle>
              <CardDescription className="text-slate-500">
                {riskConfig.tasks} tasks across ~{riskConfig.days} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PLAN_PHASES.map((phase, i) => {
                  const taskCount =
                    riskPath === 'fast_track' ? phase.fast :
                    riskPath === 'high_risk' ? phase.high :
                    phase.standard;
                  return (
                    <div key={phase.name} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-medium shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">{phase.name}</span>
                          <span className="text-xs text-slate-500">{taskCount} tasks</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1">
                          <div
                            className="h-full bg-slate-300 rounded-full"
                            style={{ width: `${(taskCount / riskConfig.tasks) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-1 border-slate-200 text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canContinue}
            className="gap-1 bg-slate-900 text-white hover:bg-slate-800"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            className="gap-1 bg-slate-900 text-white hover:bg-slate-800"
          >
            Create Project
            <Rocket className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
