'use client';

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  Target,
  Lightbulb,
  Database,
  ShieldAlert,
  BarChart3,
  Server,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Check,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectOption } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PILOT_TEMPLATES } from '@/lib/pilot/templates';
import type {
  PilotSetup,
  PilotTemplate,
  PilotWizardStep,
  DataClassificationLevel,
  RiskTier,
} from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIZARD_STEPS: {
  key: PilotWizardStep;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'business_goal', label: 'Business Goal', icon: Target },
  { key: 'use_case', label: 'Use Case', icon: Lightbulb },
  { key: 'data_scope', label: 'Data Scope', icon: Database },
  { key: 'risk_tier', label: 'Risk Tier', icon: ShieldAlert },
  { key: 'success_metrics', label: 'Success Metrics', icon: BarChart3 },
  { key: 'architecture', label: 'Architecture', icon: Server },
  { key: 'launch_checklist', label: 'Launch Checklist', icon: CheckCircle2 },
];

const USE_CASE_DOMAINS = [
  'Customer Support',
  'Knowledge Management',
  'Document Generation',
  'Workflow Automation',
  'Software Engineering',
  'Data Analytics',
  'Sales & Marketing',
  'HR & Recruiting',
  'Finance & Accounting',
  'Legal & Compliance',
  'Other',
] as const;

const CLOUD_PROVIDERS = [
  { value: 'aws', label: 'Amazon Web Services (AWS)' },
  { value: 'gcp', label: 'Google Cloud Platform (GCP)' },
  { value: 'azure', label: 'Microsoft Azure' },
  { value: 'on_premises', label: 'On-Premises / Private Cloud' },
] as const;

const RISK_TIER_CONFIG: {
  tier: RiskTier;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  examples: string;
}[] = [
  {
    tier: 'critical',
    label: 'Critical',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    description:
      'Decisions with life-safety, regulatory, or financial materiality implications. Requires full governance review, legal sign-off, and continuous monitoring.',
    examples:
      'Medical diagnosis, financial trading, autonomous safety systems',
  },
  {
    tier: 'high',
    label: 'High',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    description:
      'Handles sensitive data or makes consequential business decisions. Requires enhanced controls, human-in-the-loop review, and regular audits.',
    examples:
      'Code generation with repo access, customer data analysis, HR screening',
  },
  {
    tier: 'medium',
    label: 'Medium',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    description:
      'Internal productivity tools with moderate data sensitivity. Standard governance controls and periodic review cycles.',
    examples:
      'Document drafting, internal search, support ticket triage',
  },
  {
    tier: 'low',
    label: 'Low',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    description:
      'Low-sensitivity internal tools with minimal risk exposure. Lightweight approval and basic monitoring sufficient.',
    examples:
      'Meeting summarization, internal FAQ bots, code formatting',
  },
];

const DEFAULT_LAUNCH_CHECKLIST = [
  { item: 'Business sponsor sign-off obtained', completed: false, required: true },
  { item: 'Data classification review completed', completed: false, required: true },
  { item: 'Security review and threat model approved', completed: false, required: true },
  { item: 'Privacy impact assessment filed', completed: false, required: true },
  { item: 'Sandbox environment provisioned and validated', completed: false, required: true },
  { item: 'Success metrics baseline measurements captured', completed: false, required: true },
  { item: 'Pilot team members onboarded and trained', completed: false, required: true },
  { item: 'Rollback / kill-switch procedure documented', completed: false, required: true },
  { item: 'Monitoring and alerting configured', completed: false, required: false },
  { item: 'Communication plan distributed to stakeholders', completed: false, required: false },
  { item: 'Legal / compliance approval documented', completed: false, required: false },
  { item: 'User acceptance testing completed', completed: false, required: false },
];

// ---------------------------------------------------------------------------
// Wizard state interface
// ---------------------------------------------------------------------------

interface WizardState {
  templateId: string;
  businessGoal: string;
  useCaseDomain: string;
  useCaseDescription: string;
  dataClassification: DataClassificationLevel;
  dataSources: string[];
  containsPii: boolean;
  crossBorder: boolean;
  riskTier: RiskTier | '';
  successMetrics: { metric: string; target: string; measurement_method: string }[];
  architectureNotes: string;
  cloudProvider: string;
  launchChecklist: { item: string; completed: boolean; required: boolean }[];
}

const initialState: WizardState = {
  templateId: '',
  businessGoal: '',
  useCaseDomain: '',
  useCaseDescription: '',
  dataClassification: 'internal',
  dataSources: [],
  containsPii: false,
  crossBorder: false,
  riskTier: '',
  successMetrics: [{ metric: '', target: '', measurement_method: '' }],
  architectureNotes: '',
  cloudProvider: '',
  launchChecklist: DEFAULT_LAUNCH_CHECKLIST.map((c) => ({ ...c })),
};

// ---------------------------------------------------------------------------
// Step Indicator Component
// ---------------------------------------------------------------------------

function StepIndicator({
  steps,
  currentIndex,
  onStepClick,
}: {
  steps: typeof WIZARD_STEPS;
  currentIndex: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <nav aria-label="Wizard progress" className="mb-8">
      <ol className="flex items-center w-full">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isComplete = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <li
              key={step.key}
              className={cn(
                'flex items-center',
                idx < steps.length - 1 ? 'flex-1' : ''
              )}
            >
              <button
                type="button"
                onClick={() => onStepClick(idx)}
                className={cn(
                  'flex flex-col items-center gap-1 group relative',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${idx + 1}: ${step.label}`}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    isComplete
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                  )}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:block',
                    isComplete
                      ? 'text-emerald-700'
                      : isCurrent
                        ? 'text-blue-700'
                        : 'text-slate-400'
                  )}
                >
                  {step.label}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Business Goal
// ---------------------------------------------------------------------------

function StepBusinessGoal({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}) {
  const handleTemplateChange = (templateId: string) => {
    if (!templateId) {
      onChange({ templateId: '' });
      return;
    }
    const template = PILOT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    onChange({
      templateId,
      businessGoal: template.default_objectives.join('\n'),
      useCaseDomain: domainToUseCaseDomain(template.domain),
      useCaseDescription: template.description,
      riskTier: template.default_risk_tier,
      successMetrics: template.default_success_metrics.map((m) => ({
        metric: m,
        target: '',
        measurement_method: '',
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          Define Your Business Goal
        </h2>
        <p className="text-sm text-slate-500">
          Start by selecting a pilot template or describe your business
          objective from scratch. Templates pre-fill recommended defaults you
          can customize in later steps.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-select">Pilot Template</Label>
        <Select
          id="template-select"
          value={state.templateId}
          onValueChange={handleTemplateChange}
          className="border-slate-300"
        >
          <SelectOption value="">-- Select a template (optional) --</SelectOption>
          {PILOT_TEMPLATES.map((t) => (
            <SelectOption key={t.id} value={t.id}>
              {t.name}
            </SelectOption>
          ))}
        </Select>
        {state.templateId && (
          <p className="text-xs text-slate-500 mt-1">
            {PILOT_TEMPLATES.find((t) => t.id === state.templateId)?.description}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-goal">
          Business Goal / Expected Outcomes
        </Label>
        <Textarea
          id="business-goal"
          rows={6}
          placeholder="Describe the business objective for this pilot and the expected outcomes. What problem are you solving? What does success look like?"
          value={state.businessGoal}
          onChange={(e) => onChange({ businessGoal: e.target.value })}
          className="border-slate-300"
        />
        <p className="text-xs text-slate-500">
          Be specific about measurable outcomes. These will inform your success
          metrics in Step 5.
        </p>
      </div>

      {state.templateId && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Template Applied</p>
              <p>
                Defaults from &ldquo;
                {PILOT_TEMPLATES.find((t) => t.id === state.templateId)?.name}
                &rdquo; have been loaded. You can modify any field in the
                following steps.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Use Case
// ---------------------------------------------------------------------------

function StepUseCase({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          Describe the Use Case
        </h2>
        <p className="text-sm text-slate-500">
          Select the domain this pilot falls under and provide a detailed
          description of the specific use case.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="use-case-domain">Use Case Domain</Label>
        <Select
          id="use-case-domain"
          value={state.useCaseDomain}
          onValueChange={(v) => onChange({ useCaseDomain: v })}
          className="border-slate-300"
        >
          <SelectOption value="">-- Select a domain --</SelectOption>
          {USE_CASE_DOMAINS.map((d) => (
            <SelectOption key={d} value={d}>
              {d}
            </SelectOption>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="use-case-description">Use Case Description</Label>
        <Textarea
          id="use-case-description"
          rows={6}
          placeholder="Describe the specific use case in detail. Include the target users, workflow integration points, and how AI will be applied."
          value={state.useCaseDescription}
          onChange={(e) => onChange({ useCaseDescription: e.target.value })}
          className="border-slate-300"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Data Scope
// ---------------------------------------------------------------------------

function StepDataScope({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}) {
  const [newSource, setNewSource] = useState('');

  const addSource = () => {
    const trimmed = newSource.trim();
    if (!trimmed) return;
    onChange({ dataSources: [...state.dataSources, trimmed] });
    setNewSource('');
  };

  const removeSource = (index: number) => {
    onChange({
      dataSources: state.dataSources.filter((_, i) => i !== index),
    });
  };

  const classificationLevels: {
    value: DataClassificationLevel;
    label: string;
    description: string;
  }[] = [
    {
      value: 'public',
      label: 'Public',
      description: 'Data intended for public consumption with no restrictions.',
    },
    {
      value: 'internal',
      label: 'Internal',
      description: 'General business data not intended for external sharing.',
    },
    {
      value: 'confidential',
      label: 'Confidential',
      description:
        'Sensitive business data with restricted access (e.g., financials, strategy).',
    },
    {
      value: 'restricted',
      label: 'Restricted',
      description:
        'Highly sensitive data subject to regulatory requirements (e.g., PII, PHI, PCI).',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          Data Scope & Classification
        </h2>
        <p className="text-sm text-slate-500">
          Classify the data this pilot will access and identify sources,
          PII exposure, and cross-border transfer requirements.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Data Classification Level</Label>
        <RadioGroup
          name="data-classification"
          value={state.dataClassification}
          onValueChange={(v) =>
            onChange({ dataClassification: v as DataClassificationLevel })
          }
          className="grid gap-3"
        >
          {classificationLevels.map((level) => (
            <label
              key={level.value}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
                state.dataClassification === level.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <RadioGroupItem
                value={level.value}
                className="mt-0.5"
              />
              <div>
                <span className="font-medium text-sm text-slate-900">
                  {level.label}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {level.description}
                </p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Data Sources</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a data source (e.g., CRM database, S3 bucket)"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSource();
              }
            }}
            className="border-slate-300"
          />
          <Button
            type="button"
            onClick={addSource}
            variant="outline"
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        {state.dataSources.length > 0 && (
          <ul className="space-y-2 mt-2">
            {state.dataSources.map((source, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="text-slate-700">{source}</span>
                <button
                  type="button"
                  onClick={() => removeSource(idx)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${source}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {state.dataSources.length === 0 && (
          <p className="text-xs text-slate-400">
            No data sources added yet.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Data Sensitivity Flags</Label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={state.containsPii}
              onCheckedChange={(checked) =>
                onChange({ containsPii: checked })
              }
            />
            <div>
              <span className="text-sm font-medium text-slate-900">
                Contains PII (Personally Identifiable Information)
              </span>
              <p className="text-xs text-slate-500">
                Data includes names, emails, addresses, SSNs, or other
                personally identifiable information.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={state.crossBorder}
              onCheckedChange={(checked) =>
                onChange({ crossBorder: checked })
              }
            />
            <div>
              <span className="text-sm font-medium text-slate-900">
                Cross-Border Data Transfer
              </span>
              <p className="text-xs text-slate-500">
                Data may be processed or stored in a different jurisdiction
                from its origin (e.g., EU to US transfer).
              </p>
            </div>
          </label>
        </div>
      </div>

      {(state.containsPii || state.crossBorder) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Additional Review Required</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {state.containsPii && (
                  <li>
                    PII handling requires a Privacy Impact Assessment (PIA) and
                    data minimization plan.
                  </li>
                )}
                {state.crossBorder && (
                  <li>
                    Cross-border transfers may require Standard Contractual
                    Clauses (SCCs) or adequacy decisions.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Risk Tier
// ---------------------------------------------------------------------------

function StepRiskTier({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          Risk Tier Classification
        </h2>
        <p className="text-sm text-slate-500">
          Select the risk tier for this pilot. The risk tier determines the
          level of governance controls, review requirements, and monitoring
          intensity.
        </p>
      </div>

      <RadioGroup
        name="risk-tier"
        value={state.riskTier}
        onValueChange={(v) => onChange({ riskTier: v as RiskTier })}
        className="grid gap-4"
      >
        {RISK_TIER_CONFIG.map((config) => (
          <label
            key={config.tier}
            className={cn(
              'flex items-start gap-4 rounded-lg border-2 p-5 cursor-pointer transition-all',
              state.riskTier === config.tier
                ? `${config.borderColor} ${config.bgColor}`
                : 'border-slate-200 hover:border-slate-300 bg-white'
            )}
          >
            <RadioGroupItem
              value={config.tier}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('font-semibold text-sm', config.color)}>
                  {config.label}
                </span>
                {state.riskTier === config.tier && (
                  <Badge className={cn(config.bgColor, config.color, 'text-xs')}>
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-700 mb-2">
                {config.description}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-medium">Examples:</span>{' '}
                {config.examples}
              </p>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5: Success Metrics
// ---------------------------------------------------------------------------

function StepSuccessMetrics({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}) {
  const updateMetric = (
    index: number,
    field: 'metric' | 'target' | 'measurement_method',
    value: string
  ) => {
    const updated = state.successMetrics.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    onChange({ successMetrics: updated });
  };

  const addMetric = () => {
    onChange({
      successMetrics: [
        ...state.successMetrics,
        { metric: '', target: '', measurement_method: '' },
      ],
    });
  };

  const removeMetric = (index: number) => {
    if (state.successMetrics.length <= 1) return;
    onChange({
      successMetrics: state.successMetrics.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          Success Metrics
        </h2>
        <p className="text-sm text-slate-500">
          Define measurable success criteria for the pilot. Each metric should
          have a clear target and a method for measurement.
        </p>
      </div>

      <div className="space-y-4">
        {state.successMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Metric {idx + 1}
              </span>
              {state.successMetrics.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMetric(idx)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove metric ${idx + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label
                  htmlFor={`metric-name-${idx}`}
                  className="text-xs"
                >
                  Metric Name
                </Label>
                <Input
                  id={`metric-name-${idx}`}
                  placeholder="e.g., Response time"
                  value={metric.metric}
                  onChange={(e) =>
                    updateMetric(idx, 'metric', e.target.value)
                  }
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor={`metric-target-${idx}`}
                  className="text-xs"
                >
                  Target
                </Label>
                <Input
                  id={`metric-target-${idx}`}
                  placeholder="e.g., < 2 minutes"
                  value={metric.target}
                  onChange={(e) =>
                    updateMetric(idx, 'target', e.target.value)
                  }
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor={`metric-method-${idx}`}
                  className="text-xs"
                >
                  Measurement Method
                </Label>
                <Input
                  id={`metric-method-${idx}`}
                  placeholder="e.g., APM dashboard"
                  value={metric.measurement_method}
                  onChange={(e) =>
                    updateMetric(idx, 'measurement_method', e.target.value)
                  }
                  className="border-slate-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addMetric}>
        <Plus className="w-4 h-4 mr-1" />
        Add Metric
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 6: Architecture
// ---------------------------------------------------------------------------

function StepArchitecture({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          Architecture & Infrastructure
        </h2>
        <p className="text-sm text-slate-500">
          Document the technical architecture, cloud provider, and
          infrastructure requirements for the pilot environment.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cloud-provider">Cloud Provider</Label>
        <Select
          id="cloud-provider"
          value={state.cloudProvider}
          onValueChange={(v) => onChange({ cloudProvider: v })}
          className="border-slate-300"
        >
          <SelectOption value="">-- Select cloud provider --</SelectOption>
          {CLOUD_PROVIDERS.map((cp) => (
            <SelectOption key={cp.value} value={cp.value}>
              {cp.label}
            </SelectOption>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="architecture-notes">Architecture Notes</Label>
        <Textarea
          id="architecture-notes"
          rows={8}
          placeholder={`Describe the technical architecture for this pilot. Consider:\n\n- Network topology (VPC, subnets, security groups)\n- AI model hosting (API-based, self-hosted, hybrid)\n- Data pipeline architecture\n- Integration points with existing systems\n- Scaling requirements\n- Disaster recovery considerations`}
          value={state.architectureNotes}
          onChange={(e) => onChange({ architectureNotes: e.target.value })}
          className="border-slate-300"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 7: Launch Checklist
// ---------------------------------------------------------------------------

function StepLaunchChecklist({
  state,
  onChange,
  readinessScore,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  readinessScore: number;
}) {
  const toggleItem = (index: number) => {
    const updated = state.launchChecklist.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    onChange({ launchChecklist: updated });
  };

  const requiredCount = state.launchChecklist.filter((c) => c.required).length;
  const requiredCompleted = state.launchChecklist.filter(
    (c) => c.required && c.completed
  ).length;
  const optionalCompleted = state.launchChecklist.filter(
    (c) => !c.required && c.completed
  ).length;
  const totalCompleted = requiredCompleted + optionalCompleted;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          Launch Readiness Checklist
        </h2>
        <p className="text-sm text-slate-500">
          Review and complete the pre-launch checklist items before launching
          the pilot. Required items must be completed for launch approval.
        </p>
      </div>

      {/* Readiness Score Card */}
      <Card
        className={cn(
          'border-2',
          readinessScore >= 80
            ? 'border-emerald-300 bg-emerald-50'
            : readinessScore >= 50
              ? 'border-amber-300 bg-amber-50'
              : 'border-red-300 bg-red-50'
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">
                Definition of Done - Readiness Score
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {requiredCompleted} of {requiredCount} required items complete
                {optionalCompleted > 0 &&
                  ` + ${optionalCompleted} optional`}
              </p>
            </div>
            <div
              className={cn(
                'text-3xl font-bold',
                readinessScore >= 80
                  ? 'text-emerald-700'
                  : readinessScore >= 50
                    ? 'text-amber-700'
                    : 'text-red-700'
              )}
            >
              {readinessScore}%
            </div>
          </div>
          <Progress
            value={readinessScore}
            className="h-2"
          />
          <div className="flex items-center gap-2 mt-3">
            {readinessScore >= 80 ? (
              <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                Ready for Launch
              </Badge>
            ) : readinessScore >= 50 ? (
              <Badge className="bg-amber-100 text-amber-800 text-xs">
                Partially Ready
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 text-xs">
                Not Ready
              </Badge>
            )}
            <span className="text-xs text-slate-500">
              {totalCompleted} of {state.launchChecklist.length} total items
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          Required Items
        </h3>
        {state.launchChecklist
          .map((item, originalIdx) => ({ item, originalIdx }))
          .filter(({ item }) => item.required)
          .map(({ item, originalIdx }) => (
            <label
              key={originalIdx}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                item.completed
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(originalIdx)}
              />
              <span
                className={cn(
                  'text-sm',
                  item.completed
                    ? 'text-emerald-800 line-through'
                    : 'text-slate-700'
                )}
              >
                {item.item}
              </span>
              <Badge className="ml-auto bg-red-100 text-red-700 text-xs shrink-0">
                Required
              </Badge>
            </label>
          ))}

        <h3 className="text-sm font-semibold text-slate-700 mt-4 mb-2">
          Optional Items
        </h3>
        {state.launchChecklist
          .map((item, originalIdx) => ({ item, originalIdx }))
          .filter(({ item }) => !item.required)
          .map(({ item, originalIdx }) => (
            <label
              key={originalIdx}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                item.completed
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(originalIdx)}
              />
              <span
                className={cn(
                  'text-sm',
                  item.completed
                    ? 'text-emerald-800 line-through'
                    : 'text-slate-700'
                )}
              >
                {item.item}
              </span>
              <Badge className="ml-auto bg-slate-100 text-slate-600 text-xs shrink-0">
                Optional
              </Badge>
            </label>
          ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function domainToUseCaseDomain(
  domain: PilotTemplate['domain']
): string {
  const map: Record<PilotTemplate['domain'], string> = {
    support: 'Customer Support',
    knowledge_search: 'Knowledge Management',
    document_drafting: 'Document Generation',
    workflow_automation: 'Workflow Automation',
    code_generation: 'Software Engineering',
    data_analysis: 'Data Analytics',
    custom: 'Other',
  };
  return map[domain] ?? 'Other';
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function PilotSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = React.use(params);
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialState);
  const [isComplete, setIsComplete] = useState(false);

  const handleChange = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Readiness score: weighted by required vs optional
  const readinessScore = useMemo(() => {
    const { launchChecklist } = state;
    if (launchChecklist.length === 0) return 0;

    const requiredItems = launchChecklist.filter((c) => c.required);
    const optionalItems = launchChecklist.filter((c) => !c.required);

    const requiredWeight = 0.8;
    const optionalWeight = 0.2;

    const requiredScore =
      requiredItems.length > 0
        ? requiredItems.filter((c) => c.completed).length /
          requiredItems.length
        : 1;

    const optionalScore =
      optionalItems.length > 0
        ? optionalItems.filter((c) => c.completed).length /
          optionalItems.length
        : 0;

    return Math.round(requiredScore * requiredWeight * 100 + optionalScore * optionalWeight * 100);
  }, [state]);

  // Definition of Done: overall completion percentage across all steps
  const overallCompletion = useMemo(() => {
    let filled = 0;
    let total = 7;

    if (state.businessGoal.trim().length > 0) filled++;
    if (state.useCaseDomain && state.useCaseDescription.trim().length > 0) filled++;
    if (state.dataSources.length > 0) filled++;
    if (state.riskTier) filled++;
    if (
      state.successMetrics.length > 0 &&
      state.successMetrics.some((m) => m.metric.trim().length > 0)
    )
      filled++;
    if (state.architectureNotes.trim().length > 0 || state.cloudProvider)
      filled++;
    if (state.launchChecklist.some((c) => c.completed)) filled++;

    return Math.round((filled / total) * 100);
  }, [state]);

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Pilot Setup Complete
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Your pilot configuration has been saved. Review the summary below
              and proceed to launch when all checklist items are resolved.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-left max-w-md mx-auto">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Readiness Score</p>
                <p className="text-lg font-bold text-slate-900">
                  {readinessScore}%
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Risk Tier</p>
                <p className="text-lg font-bold text-slate-900 capitalize">
                  {state.riskTier || 'Not set'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Data Sources</p>
                <p className="text-lg font-bold text-slate-900">
                  {state.dataSources.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Success Metrics</p>
                <p className="text-lg font-bold text-slate-900">
                  {state.successMetrics.filter((m) => m.metric.trim()).length}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsComplete(false)}
              >
                Edit Setup
              </Button>
              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                Launch Pilot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Pilot Launch Accelerator
            </h1>
            <p className="text-sm text-slate-500">
              Configure your AI pilot in 7 steps
            </p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-xs font-medium text-slate-500 shrink-0">
            Overall Completion
          </span>
          <Progress value={overallCompletion} className="h-2 flex-1" />
          <span className="text-xs font-bold text-slate-700 shrink-0">
            {overallCompletion}%
          </span>
        </div>
      </div>

      {/* Step Indicators */}
      <StepIndicator
        steps={WIZARD_STEPS}
        currentIndex={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          {currentStep === 0 && (
            <StepBusinessGoal state={state} onChange={handleChange} />
          )}
          {currentStep === 1 && (
            <StepUseCase state={state} onChange={handleChange} />
          )}
          {currentStep === 2 && (
            <StepDataScope state={state} onChange={handleChange} />
          )}
          {currentStep === 3 && (
            <StepRiskTier state={state} onChange={handleChange} />
          )}
          {currentStep === 4 && (
            <StepSuccessMetrics state={state} onChange={handleChange} />
          )}
          {currentStep === 5 && (
            <StepArchitecture state={state} onChange={handleChange} />
          )}
          {currentStep === 6 && (
            <StepLaunchChecklist
              state={state}
              onChange={handleChange}
              readinessScore={readinessScore}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <span className="text-sm text-slate-500">
          Step {currentStep + 1} of {WIZARD_STEPS.length}
        </span>

        {currentStep < WIZARD_STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            className="gap-1 bg-slate-900 text-white hover:bg-slate-800"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Setup
          </Button>
        )}
      </div>
    </div>
  );
}
