'use client';

import * as React from 'react';
import { use, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  HelpCircle,
  Server,
  Shield,
  Scale,
  Code2,
  Briefcase,
  Calculator,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { ScoreDomain, QuestionType } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface QuestionOption {
  label: string;
  score: number;
}

interface InlineQuestion {
  id: string;
  domain: ScoreDomain;
  text: string;
  helpText?: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  weight: number;
}

/* -------------------------------------------------------------------------- */
/*  Question Data (inline)                                                     */
/* -------------------------------------------------------------------------- */

const QUESTIONS: InlineQuestion[] = [
  // ===================== INFRASTRUCTURE =====================
  {
    id: 'infra-1',
    domain: 'infrastructure',
    text: 'Which cloud provider(s) does your organization currently use?',
    helpText:
      'Select all that apply. Multi-cloud or hybrid environments may require additional configuration for AI tooling.',
    type: 'multi_select',
    options: [
      { label: 'AWS', score: 5 },
      { label: 'Google Cloud', score: 5 },
      { label: 'Azure', score: 5 },
      { label: 'On-premises only', score: 2 },
      { label: 'Hybrid', score: 4 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'infra-2',
    domain: 'infrastructure',
    text: 'What is your network segmentation maturity level?',
    helpText:
      'Network segmentation controls blast radius and is critical for isolating AI workloads.',
    type: 'single_select',
    options: [
      { label: 'Advanced (micro-segmentation)', score: 5 },
      { label: 'Moderate (VLANs/VPCs)', score: 4 },
      { label: 'Basic (flat network)', score: 2 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'infra-3',
    domain: 'infrastructure',
    text: 'What is your primary developer environment model?',
    helpText:
      'Standardized, cloud-based environments simplify AI agent deployment and monitoring.',
    type: 'single_select',
    options: [
      { label: 'Cloud workstations (Codespaces/Cloud9)', score: 5 },
      { label: 'Standardized local (managed images)', score: 4 },
      { label: 'Mixed/unmanaged', score: 2 },
      { label: 'BYOD', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'infra-4',
    domain: 'infrastructure',
    text: 'How does your organization manage software packages and dependencies?',
    helpText:
      'Centralized artifact management is essential for controlling what AI agents can install.',
    type: 'single_select',
    options: [
      { label: 'Centralized artifact registry', score: 5 },
      { label: 'Per-team registries', score: 4 },
      { label: 'Public registries only', score: 2 },
      { label: 'No formal process', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'infra-5',
    domain: 'infrastructure',
    text: 'What is your Infrastructure as Code (IaC) maturity?',
    helpText:
      'IaC maturity indicates ability to provision reproducible sandbox environments for AI agents.',
    type: 'single_select',
    options: [
      { label: 'Mature (Terraform/Pulumi)', score: 5 },
      { label: 'Partial (some automation)', score: 4 },
      { label: 'Manual provisioning', score: 2 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1,
  },

  // ===================== SECURITY =====================
  {
    id: 'sec-1',
    domain: 'security',
    text: 'Does your organization have a formal data classification policy?',
    helpText:
      'Data classification determines which repositories and data AI agents can access.',
    type: 'single_select',
    options: [
      { label: 'Formal & enforced', score: 5 },
      { label: 'Formal but not consistently enforced', score: 4 },
      { label: 'Informal guidelines', score: 2 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1.2,
  },
  {
    id: 'sec-2',
    domain: 'security',
    text: 'Which Data Loss Prevention (DLP) tools are currently deployed?',
    helpText:
      'DLP is critical for preventing AI agents from exfiltrating sensitive code or data.',
    type: 'multi_select',
    options: [
      { label: 'Endpoint DLP', score: 5 },
      { label: 'Network DLP', score: 5 },
      { label: 'Cloud DLP', score: 5 },
      { label: 'Email DLP', score: 3 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1.2,
  },
  {
    id: 'sec-3',
    domain: 'security',
    text: 'What SIEM/logging platform is in place?',
    helpText:
      'Security monitoring is essential for auditing AI agent actions and detecting anomalies.',
    type: 'single_select',
    options: [
      { label: 'Enterprise SIEM (Splunk/Sentinel)', score: 5 },
      { label: 'Cloud-native logging', score: 4 },
      { label: 'Basic logging', score: 2 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'sec-4',
    domain: 'security',
    text: 'How are secrets and credentials managed?',
    helpText:
      'AI agents must never have access to plaintext secrets. Vault-based management is strongly recommended.',
    type: 'single_select',
    options: [
      { label: 'Dedicated vault (HashiCorp/AWS Secrets Manager)', score: 5 },
      { label: 'Cloud KMS only', score: 4 },
      { label: 'Environment variables', score: 2 },
      { label: 'Hardcoded/manual', score: 1 },
    ],
    required: true,
    weight: 1.2,
  },
  {
    id: 'sec-5',
    domain: 'security',
    text: 'When was your incident response plan last tested?',
    helpText:
      'An untested IRP may not cover AI-related incidents. Recent testing is preferred.',
    type: 'single_select',
    options: [
      { label: 'Tested within 6 months', score: 5 },
      { label: 'Documented but not recently tested', score: 3 },
      { label: 'Informal process', score: 2 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1,
  },

  // ===================== GOVERNANCE =====================
  {
    id: 'gov-1',
    domain: 'governance',
    text: 'Does your organization have an existing AI acceptable use policy?',
    helpText:
      'An AUP specifically for AI tools establishes guardrails before deployment.',
    type: 'single_select',
    options: [
      { label: 'Yes, approved and distributed', score: 5 },
      { label: 'In draft', score: 4 },
      { label: 'Planned', score: 2 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1.2,
  },
  {
    id: 'gov-2',
    domain: 'governance',
    text: 'Which compliance frameworks does your organization currently follow?',
    helpText:
      'AI governance controls need to map to existing compliance requirements.',
    type: 'multi_select',
    options: [
      { label: 'SOC 2', score: 5 },
      { label: 'HIPAA', score: 5 },
      { label: 'PCI-DSS', score: 5 },
      { label: 'GDPR', score: 5 },
      { label: 'NIST 800-53', score: 5 },
      { label: 'ISO 27001', score: 5 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'gov-3',
    domain: 'governance',
    text: 'How mature is your vendor risk assessment process?',
    helpText:
      'AI tool vendors (Anthropic, OpenAI) must undergo risk assessment before onboarding.',
    type: 'single_select',
    options: [
      { label: 'Formal process with scoring', score: 5 },
      { label: 'Basic checklist', score: 3 },
      { label: 'Ad hoc', score: 2 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'gov-4',
    domain: 'governance',
    text: 'What is your change management process maturity?',
    helpText:
      'AI agent deployments involve significant process changes that need formal management.',
    type: 'single_select',
    options: [
      { label: 'Formal CAB with approval workflow', score: 5 },
      { label: 'Lightweight review process', score: 4 },
      { label: 'Informal', score: 2 },
      { label: 'None', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'gov-5',
    domain: 'governance',
    text: 'What is your organization\'s experience with AI initiatives?',
    helpText:
      'Prior AI experience accelerates governance planning and reduces adoption risk.',
    type: 'single_select',
    options: [
      { label: 'Successful production deployment', score: 5 },
      { label: 'Pilot completed', score: 4 },
      { label: 'Explored/evaluated', score: 3 },
      { label: 'No experience', score: 1 },
    ],
    required: true,
    weight: 0.8,
  },

  // ===================== ENGINEERING =====================
  {
    id: 'eng-1',
    domain: 'engineering',
    text: 'What is your CI/CD pipeline maturity level?',
    helpText:
      'AI-generated code must pass through automated quality gates in CI/CD pipelines.',
    type: 'single_select',
    options: [
      { label: 'Full automation with SAST/DAST', score: 5 },
      { label: 'Automated build/test', score: 4 },
      { label: 'Partial automation', score: 2 },
      { label: 'Manual deployment', score: 1 },
    ],
    required: true,
    weight: 1.2,
  },
  {
    id: 'eng-2',
    domain: 'engineering',
    text: 'How disciplined is your code review process?',
    helpText:
      'All AI-generated code must undergo human review. Existing review culture eases adoption.',
    type: 'single_select',
    options: [
      { label: 'Required PR approvals with checklist', score: 5 },
      { label: 'Required PR approvals', score: 4 },
      { label: 'Optional reviews', score: 2 },
      { label: 'No formal process', score: 1 },
    ],
    required: true,
    weight: 1.2,
  },
  {
    id: 'eng-3',
    domain: 'engineering',
    text: 'What is your current automated test coverage level?',
    helpText:
      'Higher test coverage helps catch regressions in AI-generated code quickly.',
    type: 'single_select',
    options: [
      { label: '>80% with automation', score: 5 },
      { label: '50-80%', score: 4 },
      { label: '<50%', score: 2 },
      { label: 'No formal testing', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'eng-4',
    domain: 'engineering',
    text: 'How would you describe your engineering team\'s AI readiness?',
    helpText:
      'Team sentiment and willingness to adopt AI tools significantly impacts success.',
    type: 'single_select',
    options: [
      { label: 'Actively using AI tools', score: 5 },
      { label: 'Interested and supportive', score: 4 },
      { label: 'Neutral', score: 3 },
      { label: 'Resistant', score: 1 },
    ],
    required: true,
    weight: 0.8,
  },
  {
    id: 'eng-5',
    domain: 'engineering',
    text: 'How is your engineering organization structured?',
    helpText:
      'Team structure affects how AI agents integrate into workflows and communication patterns.',
    type: 'single_select',
    options: [
      { label: 'Feature teams with platform team', score: 5 },
      { label: 'Feature teams', score: 4 },
      { label: 'Siloed by function', score: 2 },
      { label: 'Single team', score: 3 },
    ],
    required: true,
    weight: 0.8,
  },

  // ===================== BUSINESS =====================
  {
    id: 'biz-1',
    domain: 'business',
    text: 'Is there an executive sponsor for the AI coding initiative?',
    helpText:
      'Executive sponsorship is the single strongest predictor of successful AI adoption.',
    type: 'single_select',
    options: [
      { label: 'C-level champion identified', score: 5 },
      { label: 'VP-level support', score: 4 },
      { label: 'Manager interest', score: 2 },
      { label: 'No sponsor', score: 1 },
    ],
    required: true,
    weight: 1.2,
  },
  {
    id: 'biz-2',
    domain: 'business',
    text: 'How well-defined are the expected business outcomes?',
    helpText:
      'Clear success metrics enable objective evaluation of AI tool effectiveness.',
    type: 'single_select',
    options: [
      { label: 'Quantified ROI targets defined', score: 5 },
      { label: 'General productivity goals', score: 4 },
      { label: 'Exploration phase', score: 3 },
      { label: 'No defined outcomes', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'biz-3',
    domain: 'business',
    text: 'What is the budget status for AI tooling and governance?',
    helpText:
      'Budget availability directly impacts implementation timeline and scope.',
    type: 'single_select',
    options: [
      { label: 'Approved and allocated', score: 5 },
      { label: 'Pending approval', score: 4 },
      { label: 'Not yet requested', score: 2 },
      { label: 'No budget available', score: 1 },
    ],
    required: true,
    weight: 1,
  },
  {
    id: 'biz-4',
    domain: 'business',
    text: 'What are your timeline constraints for AI deployment?',
    helpText:
      'Tighter timelines may require phased approaches and acceptance of higher initial risk.',
    type: 'single_select',
    options: [
      { label: 'Flexible (6+ months)', score: 5 },
      { label: 'Moderate (3-6 months)', score: 4 },
      { label: 'Tight (1-3 months)', score: 3 },
      { label: 'Immediate need', score: 1 },
    ],
    required: true,
    weight: 0.8,
  },
  {
    id: 'biz-5',
    domain: 'business',
    text: 'How would you characterize your organization\'s risk appetite for new technology?',
    helpText:
      'Risk appetite determines the governance rigor and pace of AI rollout.',
    type: 'single_select',
    options: [
      { label: 'Aggressive (early adopter)', score: 5 },
      { label: 'Moderate (fast follower)', score: 4 },
      { label: 'Conservative (proven only)', score: 3 },
      { label: 'Very conservative', score: 1 },
    ],
    required: true,
    weight: 0.8,
  },
];

/* -------------------------------------------------------------------------- */
/*  Domain metadata                                                            */
/* -------------------------------------------------------------------------- */

interface DomainMeta {
  key: ScoreDomain;
  label: string;
  icon: React.ElementType;
  description: string;
}

const DOMAINS: DomainMeta[] = [
  {
    key: 'infrastructure',
    label: 'Infrastructure',
    icon: Server,
    description: 'Cloud, networking, developer environments, and IaC maturity',
  },
  {
    key: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Data classification, DLP, SIEM, secrets management, and incident response',
  },
  {
    key: 'governance',
    label: 'Governance',
    icon: Scale,
    description: 'Policies, compliance frameworks, vendor risk, and change management',
  },
  {
    key: 'engineering',
    label: 'Engineering',
    icon: Code2,
    description: 'CI/CD, code review, testing, team readiness, and org structure',
  },
  {
    key: 'business',
    label: 'Business',
    icon: Briefcase,
    description: 'Executive sponsorship, outcomes, budget, timeline, and risk appetite',
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

type Responses = Record<string, string | string[]>;

function questionsForDomain(domain: ScoreDomain): InlineQuestion[] {
  return QUESTIONS.filter((q) => q.domain === domain);
}

function isQuestionAnswered(q: InlineQuestion, responses: Responses): boolean {
  const val = responses[q.id];
  if (val === undefined || val === null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return false;
}

/* -------------------------------------------------------------------------- */
/*  Question renderers                                                         */
/* -------------------------------------------------------------------------- */

function SingleSelectQuestion({
  question,
  value,
  onChange,
}: {
  question: InlineQuestion;
  value: string;
  onChange: (v: string) => void;
}): React.ReactElement {
  return (
    <div className="space-y-2">
      {question.options?.map((opt) => (
        <label
          key={opt.label}
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
            value === opt.label
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40 hover:bg-muted/50'
          )}
        >
          <input
            type="radio"
            name={question.id}
            value={opt.label}
            checked={value === opt.label}
            onChange={() => onChange(opt.label)}
            className="h-4 w-4 shrink-0 cursor-pointer rounded-full border border-primary accent-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <span className="text-sm text-foreground">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function MultiSelectQuestion({
  question,
  values,
  onChange,
}: {
  question: InlineQuestion;
  values: string[];
  onChange: (v: string[]) => void;
}): React.ReactElement {
  const toggle = (label: string) => {
    // If user selects "None", deselect everything else
    if (label === 'None') {
      onChange(values.includes('None') ? [] : ['None']);
      return;
    }
    // If selecting a non-None option, remove "None"
    const filtered = values.filter((v) => v !== 'None');
    if (filtered.includes(label)) {
      onChange(filtered.filter((v) => v !== label));
    } else {
      onChange([...filtered, label]);
    }
  };

  return (
    <div className="space-y-2">
      {question.options?.map((opt) => (
        <label
          key={opt.label}
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
            values.includes(opt.label)
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40 hover:bg-muted/50'
          )}
        >
          <input
            type="checkbox"
            checked={values.includes(opt.label)}
            onChange={() => toggle(opt.label)}
            className="h-4 w-4 shrink-0 cursor-pointer rounded-sm border border-primary accent-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <span className="text-sm text-foreground">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function TextQuestion({
  question,
  value,
  onChange,
}: {
  question: InlineQuestion;
  value: string;
  onChange: (v: string) => void;
}): React.ReactElement {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your response..."
      rows={3}
    />
  );
}

function NumberQuestion({
  question,
  value,
  onChange,
}: {
  question: InlineQuestion;
  value: string;
  onChange: (v: string) => void;
}): React.ReactElement {
  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter a number..."
      min={0}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page Component                                                        */
/* -------------------------------------------------------------------------- */

export default function QuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = use(params);
  const router = useRouter();

  const [activeDomainIdx, setActiveDomainIdx] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const activeDomain = DOMAINS[activeDomainIdx];
  const domainQuestions = questionsForDomain(activeDomain.key);

  /* ---- Response helpers ---- */
  const setResponse = useCallback((questionId: string, value: string | string[]) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  /* ---- Completion stats ---- */
  const totalQuestions = QUESTIONS.length;
  const answeredQuestions = QUESTIONS.filter((q) => isQuestionAnswered(q, responses)).length;
  const overallPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const domainCompletion = useMemo(() => {
    const result: Record<ScoreDomain, { answered: number; total: number }> = {
      infrastructure: { answered: 0, total: 0 },
      security: { answered: 0, total: 0 },
      governance: { answered: 0, total: 0 },
      engineering: { answered: 0, total: 0 },
      business: { answered: 0, total: 0 },
    };
    for (const q of QUESTIONS) {
      result[q.domain].total += 1;
      if (isQuestionAnswered(q, responses)) {
        result[q.domain].answered += 1;
      }
    }
    return result;
  }, [responses]);

  /* ---- Navigation ---- */
  const goToDomain = (idx: number) => setActiveDomainIdx(idx);
  const goPrev = () => setActiveDomainIdx((i) => Math.max(0, i - 1));
  const goNext = () => setActiveDomainIdx((i) => Math.min(DOMAINS.length - 1, i + 1));

  const handleCalculateScore = async () => {
    setIsCalculating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(`/projects/${id}/discovery/readiness`);
  };

  const isLastDomain = activeDomainIdx === DOMAINS.length - 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ---------------------------------------------------------------- */}
      {/*  Page header                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Feasibility Assessment Questionnaire
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer the questions across five domains to generate your organization&apos;s
          AI readiness score.
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Overall progress                                                 */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Overall Completion</span>
          <span className="text-muted-foreground">
            {answeredQuestions} of {totalQuestions} questions ({overallPercent}%)
          </span>
        </div>
        <Progress value={overallPercent} />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Domain tabs                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-8 flex flex-wrap gap-2">
        {DOMAINS.map((domain, idx) => {
          const dc = domainCompletion[domain.key];
          const isComplete = dc.answered === dc.total && dc.total > 0;
          const isActive = idx === activeDomainIdx;
          const Icon = domain.icon;

          return (
            <button
              key={domain.key}
              onClick={() => goToDomain(idx)}
              className={cn(
                'group relative flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{domain.label}</span>
              {isComplete && (
                <CircleCheck className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-emerald-500')} />
              )}
              {!isComplete && dc.answered > 0 && (
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {dc.answered}/{dc.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Questions card                                                   */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {React.createElement(activeDomain.icon, {
              className: 'h-6 w-6 text-primary',
            })}
            <div>
              <CardTitle className="text-lg">{activeDomain.label}</CardTitle>
              <CardDescription>{activeDomain.description}</CardDescription>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Domain progress</span>
              <span>
                {domainCompletion[activeDomain.key].answered} /{' '}
                {domainCompletion[activeDomain.key].total}
              </span>
            </div>
            <Progress
              value={
                domainCompletion[activeDomain.key].total > 0
                  ? (domainCompletion[activeDomain.key].answered /
                      domainCompletion[activeDomain.key].total) *
                    100
                  : 0
              }
              className="h-1.5"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {domainQuestions.map((question, qIdx) => {
            const answered = isQuestionAnswered(question, responses);

            return (
              <div key={question.id} className="space-y-3">
                {/* Question header */}
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      answered
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {qIdx + 1}
                  </span>
                  <div className="space-y-1 flex-1">
                    <Label className="text-sm font-medium leading-snug text-foreground">
                      {question.text}
                      {question.required && (
                        <span className="ml-1 text-destructive">*</span>
                      )}
                    </Label>
                    {question.helpText && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{question.helpText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question body */}
                <div className="ml-10">
                  {question.type === 'single_select' && (
                    <SingleSelectQuestion
                      question={question}
                      value={(responses[question.id] as string) ?? ''}
                      onChange={(v) => setResponse(question.id, v)}
                    />
                  )}
                  {question.type === 'multi_select' && (
                    <MultiSelectQuestion
                      question={question}
                      values={(responses[question.id] as string[]) ?? []}
                      onChange={(v) => setResponse(question.id, v)}
                    />
                  )}
                  {question.type === 'text' && (
                    <TextQuestion
                      question={question}
                      value={(responses[question.id] as string) ?? ''}
                      onChange={(v) => setResponse(question.id, v)}
                    />
                  )}
                  {question.type === 'number' && (
                    <NumberQuestion
                      question={question}
                      value={(responses[question.id] as string) ?? ''}
                      onChange={(v) => setResponse(question.id, v)}
                    />
                  )}
                </div>

                {/* Divider between questions */}
                {qIdx < domainQuestions.length - 1 && <Separator className="mt-6" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/*  Navigation buttons                                               */}
      {/* ---------------------------------------------------------------- */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={activeDomainIdx === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Domain
        </Button>

        <div className="flex items-center gap-3">
          {isLastDomain ? (
            <Button
              onClick={handleCalculateScore}
              disabled={isCalculating}
              className="gap-2"
            >
              {isCalculating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Calculate Score
                </>
              )}
            </Button>
          ) : (
            <Button onClick={goNext} className="gap-2">
              Next Domain
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
