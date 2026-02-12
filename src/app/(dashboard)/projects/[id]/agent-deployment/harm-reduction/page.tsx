'use client';

import * as React from 'react';
import { use } from 'react';
import {
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Square,
  CheckSquare,
  Server,
  Key,
  Eye,
  AlertTriangle,
  Zap,
  RotateCcw,
  Lock,
  XCircle,
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

interface PreFlightItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

interface HarmReductionData {
  // Section 1: Infrastructure
  infrastructure: string;
  network: string;
  storage: string;
  // Section 2: Access control
  accounts: string;
  permissions: string;
  credentials: string;
  // Section 3: Monitoring
  monitoringWhat: string;
  monitoringHow: string;
  alertThresholds: string;
  reviewCadence: string;
  // Section 4: Incident response
  irStop: string;
  irRevoke: string;
  irAssess: string;
  irContain: string;
  irRecover: string;
  // Section 5: Pre-flight checklist
  preFlightChecklist: PreFlightItem[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    number: 1,
    title: 'Isolation Layer',
    description: 'What infrastructure are you using for agent deployment?',
    guidance:
      'Dedicated hardware? Cloud instance? Running on your primary machine? Be specific about what\'s isolated and how.',
  },
  {
    number: 2,
    title: 'Access Control',
    description: 'What accounts will the agent access?',
    guidance:
      'Email, calendar, file storage, APIs, financial systems\u2014list everything. Dedicated/throwaway accounts limit blast radius.',
  },
  {
    number: 3,
    title: 'Monitoring & Detection',
    description: 'How will you detect when the agent does something wrong?',
    guidance:
      'Not "I\'ll notice"\u2014specific monitoring. Log review? Alerts on specific actions? Audit trail review cadence?',
  },
  {
    number: 4,
    title: 'Incident Response',
    description: 'What\'s your step-by-step incident response and rollback plan?',
    guidance:
      'How do you kill the agent, revoke permissions, assess damage, and recover? Which actions are reversible? What\'s backed up?',
  },
  {
    number: 5,
    title: 'Pre-Flight Checklist',
    description: 'Verify every safety measure is in place before deployment.',
    guidance:
      'This checklist is blocking\u2014do not deploy until every item is checked. Each unchecked item represents a potential uncontained failure.',
  },
];

const DEFAULT_PREFLIGHT: PreFlightItem[] = [
  {
    id: 'isolation',
    label: 'Isolation infrastructure configured and tested',
    description: 'Agent runs on dedicated/isolated infrastructure, not your primary machine.',
    checked: false,
  },
  {
    id: 'accounts',
    label: 'Dedicated accounts created with minimum permissions',
    description: 'Throwaway or scoped accounts for each system the agent accesses.',
    checked: false,
  },
  {
    id: 'data',
    label: 'Protected data moved out of agent access or backed up',
    description: 'Sensitive data is either inaccessible to the agent or has current backups.',
    checked: false,
  },
  {
    id: 'monitoring',
    label: 'Monitoring and alerting configured',
    description: 'Log collection, anomaly detection, and alert thresholds are active.',
    checked: false,
  },
  {
    id: 'ir-plan',
    label: 'Incident response plan documented and practiced',
    description: 'You have a written step-by-step plan and have practiced the key steps.',
    checked: false,
  },
  {
    id: 'rollback',
    label: 'Rollback procedures tested',
    description: 'You have verified you can undo agent actions and restore from backups.',
    checked: false,
  },
  {
    id: 'kill-switch',
    label: 'Kill switch tested and accessible',
    description: 'You can immediately stop the agent via a single command or button.',
    checked: false,
  },
];

const EMPTY_DATA: HarmReductionData = {
  infrastructure: '',
  network: '',
  storage: '',
  accounts: '',
  permissions: '',
  credentials: '',
  monitoringWhat: '',
  monitoringHow: '',
  alertThresholds: '',
  reviewCadence: '',
  irStop: '',
  irRevoke: '',
  irAssess: '',
  irContain: '',
  irRecover: '',
  preFlightChecklist: DEFAULT_PREFLIGHT.map((item) => ({ ...item })),
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
/*  Protocol document view                                             */
/* ------------------------------------------------------------------ */

function ProtocolDocumentView({ data }: { data: HarmReductionData }) {
  const checkedCount = data.preFlightChecklist.filter((item) => item.checked).length;
  const totalChecklist = data.preFlightChecklist.length;
  const allChecked = checkedCount === totalChecklist;

  const riskLevel = allChecked
    ? 'HARDENED'
    : checkedCount >= totalChecklist - 2
    ? 'PARTIALLY HARDENED'
    : 'NOT HARDENED';

  const riskColor = allChecked
    ? 'bg-emerald-100 text-emerald-700'
    : checkedCount >= totalChecklist - 2
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Agent Harm Reduction Protocol
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Containment protocols for limiting blast radius when things go wrong
                </p>
              </div>
            </div>
            <Badge className={cn('text-sm px-3 py-1', riskColor)}>{riskLevel}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Isolation Layer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="h-4 w-4 text-slate-700" />
            Isolation Layer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Infrastructure
            </Label>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
              {data.infrastructure || 'Not specified'}
            </p>
          </div>
          <Separator />
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Network
            </Label>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
              {data.network || 'Not specified'}
            </p>
          </div>
          <Separator />
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Storage
            </Label>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
              {data.storage || 'Not specified'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4 text-slate-700" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Accounts
            </Label>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
              {data.accounts || 'Not specified'}
            </p>
          </div>
          <Separator />
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Permissions
            </Label>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
              {data.permissions || 'Not specified'}
            </p>
          </div>
          <Separator />
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Credential Management
            </Label>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
              {data.credentials || 'Not specified'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring & Detection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4 text-slate-700" />
            Monitoring &amp; Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                What I&apos;m Monitoring
              </Label>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                {data.monitoringWhat || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                How I&apos;m Monitoring
              </Label>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                {data.monitoringHow || 'Not specified'}
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Alert Thresholds
              </Label>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                {data.alertThresholds || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Review Cadence
              </Label>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                {data.reviewCadence || 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incident Response Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Incident Response Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { num: 1, label: 'STOP', icon: Zap, color: 'text-red-600', value: data.irStop },
              { num: 2, label: 'REVOKE', icon: Lock, color: 'text-red-600', value: data.irRevoke },
              { num: 3, label: 'ASSESS', icon: Eye, color: 'text-amber-600', value: data.irAssess },
              { num: 4, label: 'CONTAIN', icon: ShieldAlert, color: 'text-amber-600', value: data.irContain },
              { num: 5, label: 'RECOVER', icon: RotateCcw, color: 'text-emerald-600', value: data.irRecover },
            ].map((step) => (
              <div key={step.num} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2',
                      step.color,
                      step.color.replace('text-', 'border-')
                    )}
                  >
                    <span className="text-xs font-bold">{step.num}</span>
                  </div>
                  {step.num < 5 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <step.icon className={cn('h-4 w-4', step.color)} />
                    <h4 className="font-semibold text-slate-900">{step.label}</h4>
                  </div>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                    {step.value || 'Not specified'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pre-Flight Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Pre-Flight Checklist ({checkedCount}/{totalChecklist})
          </CardTitle>
          <CardDescription>
            {allChecked
              ? 'All items verified. Ready for deployment.'
              : `${totalChecklist - checkedCount} item${totalChecklist - checkedCount !== 1 ? 's' : ''} remaining before deployment.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.preFlightChecklist.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg p-3',
                  item.checked ? 'bg-emerald-50' : 'bg-red-50'
                )}
              >
                {item.checked ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      item.checked ? 'text-emerald-800' : 'text-red-800'
                    )}
                  >
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      'text-xs mt-0.5',
                      item.checked ? 'text-emerald-600' : 'text-red-600'
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HarmReductionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id: projectId } = use(params);

  const [currentStep, setCurrentStep] = React.useState(1);
  const [data, setData] = React.useState<HarmReductionData>({ ...EMPTY_DATA });
  const [generated, setGenerated] = React.useState(false);

  // Persist
  React.useEffect(() => {
    const stored = localStorage.getItem(`govai_harm_reduction_${projectId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.data) setData(parsed.data);
        if (parsed.generated) setGenerated(parsed.generated);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      } catch {
        // ignore
      }
    }
  }, [projectId]);

  const save = React.useCallback(
    (overrides?: Partial<{ currentStep: number; generated: boolean; data: HarmReductionData }>) => {
      localStorage.setItem(
        `govai_harm_reduction_${projectId}`,
        JSON.stringify({
          data: overrides?.data ?? data,
          currentStep: overrides?.currentStep ?? currentStep,
          generated: overrides?.generated ?? generated,
        })
      );
    },
    [data, currentStep, generated, projectId]
  );

  const updateField = <K extends keyof HarmReductionData>(
    field: K,
    value: HarmReductionData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleChecklistItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      preFlightChecklist: prev.preFlightChecklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return data.infrastructure.trim().length >= 10;
      case 2:
        return data.accounts.trim().length >= 10;
      case 3:
        return data.monitoringWhat.trim().length >= 10;
      case 4:
        return data.irStop.trim().length >= 5;
      case 5:
        return true; // checklist is optional to proceed
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
    setData({ ...EMPTY_DATA });
    setCurrentStep(1);
    setGenerated(false);
    localStorage.removeItem(`govai_harm_reduction_${projectId}`);
  };

  const step = STEPS[currentStep - 1];

  // Critical risk warning
  const isRunningOnPrimaryMachine =
    data.infrastructure.toLowerCase().includes('primary') ||
    data.infrastructure.toLowerCase().includes('main') ||
    data.infrastructure.toLowerCase().includes('personal') ||
    data.infrastructure.toLowerCase().includes('laptop');

  const hasNoBackups =
    data.storage.toLowerCase().includes('no backup') ||
    (!data.storage.toLowerCase().includes('backup') && data.storage.trim().length > 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6" />
            Agent Harm Reduction Protocol
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Implement containment protocols that limit blast radius when things go wrong. This is
            not about making agents perfectly safe\u2014it&apos;s about designing for recovery.
          </p>
        </div>
        {generated && (
          <Button variant="outline" onClick={handleReset}>
            Start Over
          </Button>
        )}
      </div>

      {generated ? (
        <ProtocolDocumentView data={data} />
      ) : (
        <>
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          {/* Critical risk warnings */}
          {currentStep === 1 && isRunningOnPrimaryMachine && data.infrastructure.trim().length > 10 && (
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">CRITICAL RISK</p>
                <p className="text-sm text-red-700 mt-1">
                  Running agents on your primary machine with full access to your accounts is
                  extremely high-risk. We strongly recommend dedicated infrastructure before
                  deploying any agent.
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && hasNoBackups && data.storage.trim().length > 10 && (
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">BLOCKER</p>
                <p className="text-sm text-red-700 mt-1">
                  No backup strategy detected. Deploy backup infrastructure before deploying agents.
                  Agent errors affecting protected data without backups are unrecoverable.
                </p>
              </div>
            </div>
          )}

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

              {/* Step 1: Isolation layer */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label>Infrastructure</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="e.g., Dedicated AWS EC2 instance (t3.medium) in isolated VPC, separate from production infrastructure. No SSH access to production systems."
                      value={data.infrastructure}
                      onChange={(e) => updateField('infrastructure', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Network Isolation</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="What can the agent reach over the network? What can't it reach? Firewall rules, VPC config, allowed outbound connections."
                      value={data.network}
                      onChange={(e) => updateField('network', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Storage &amp; Data</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Where can the agent read/write? What's off-limits? What's your backup strategy for data the agent can access?"
                      value={data.storage}
                      onChange={(e) => updateField('storage', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Access control */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label>Accounts &amp; Systems</Label>
                    <Textarea
                      className="mt-1"
                      rows={4}
                      placeholder="List every account/system the agent will access. For each one, note whether it's a dedicated/throwaway account or your primary account.\n\ne.g.:\n- Gmail: dedicated agent@company.com (throwaway)\n- Slack: bot account with limited channel access\n- GitHub: scoped PAT, read-only on main repos"
                      value={data.accounts}
                      onChange={(e) => updateField('accounts', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Minimum Necessary Permissions</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="For each account/system, what's the minimum permission level needed? Principle of least privilege."
                      value={data.permissions}
                      onChange={(e) => updateField('permissions', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Credential Management</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="How are credentials stored? How often are they rotated? How are they monitored for unauthorized use?"
                      value={data.credentials}
                      onChange={(e) => updateField('credentials', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Monitoring */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>What are you monitoring?</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Specific actions, log entries, system states. e.g., all API calls, file modifications, outbound network requests, authentication events."
                      value={data.monitoringWhat}
                      onChange={(e) => updateField('monitoringWhat', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>How are you monitoring?</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Tools, scripts, manual review. e.g., CloudWatch logs with custom alerts, structured logging to Elasticsearch, daily log review script."
                      value={data.monitoringHow}
                      onChange={(e) => updateField('monitoringHow', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Alert Thresholds</Label>
                      <Textarea
                        className="mt-1"
                        rows={3}
                        placeholder="What triggers immediate attention vs. batch review? e.g., any write to production DB = immediate; >10 API calls/minute = alert"
                        value={data.alertThresholds}
                        onChange={(e) => updateField('alertThresholds', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Review Cadence</Label>
                      <Textarea
                        className="mt-1"
                        rows={3}
                        placeholder="Daily log review? Weekly audit? Real-time alerts only? Specify your routine."
                        value={data.reviewCadence}
                        onChange={(e) => updateField('reviewCadence', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Incident response */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-red-200 p-4 space-y-2">
                    <Label className="flex items-center gap-2 text-red-700">
                      <Zap className="h-4 w-4" />
                      1. STOP \u2014 How to kill the agent immediately
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Command, API call, or process. e.g., 'docker stop agent-container' or 'aws ec2 stop-instances --instance-ids i-xxx'"
                      value={data.irStop}
                      onChange={(e) => updateField('irStop', e.target.value)}
                    />
                  </div>
                  <div className="rounded-lg border-2 border-red-200 p-4 space-y-2">
                    <Label className="flex items-center gap-2 text-red-700">
                      <Lock className="h-4 w-4" />
                      2. REVOKE \u2014 How to revoke agent permissions
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Step-by-step: revoke API keys, rotate passwords, remove OAuth grants. List each system."
                      value={data.irRevoke}
                      onChange={(e) => updateField('irRevoke', e.target.value)}
                    />
                  </div>
                  <div className="rounded-lg border-2 border-amber-200 p-4 space-y-2">
                    <Label className="flex items-center gap-2 text-amber-700">
                      <Eye className="h-4 w-4" />
                      3. ASSESS \u2014 How to determine what the agent did
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Where are the logs? What audit trails exist? How do you reconstruct the agent's actions?"
                      value={data.irAssess}
                      onChange={(e) => updateField('irAssess', e.target.value)}
                    />
                  </div>
                  <div className="rounded-lg border-2 border-amber-200 p-4 space-y-2">
                    <Label className="flex items-center gap-2 text-amber-700">
                      <ShieldAlert className="h-4 w-4" />
                      4. CONTAIN \u2014 How to prevent further damage
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Lock accounts, isolate systems, block network access. What's the containment procedure?"
                      value={data.irContain}
                      onChange={(e) => updateField('irContain', e.target.value)}
                    />
                  </div>
                  <div className="rounded-lg border-2 border-emerald-200 p-4 space-y-2">
                    <Label className="flex items-center gap-2 text-emerald-700">
                      <RotateCcw className="h-4 w-4" />
                      5. RECOVER \u2014 How to restore and recover
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Restore from backups, undo agent actions, notify affected parties. What's recoverable and what isn't?"
                      value={data.irRecover}
                      onChange={(e) => updateField('irRecover', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Pre-flight checklist */}
              {currentStep === 5 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 mb-4">
                    Check each item only when you have genuinely verified it. Unchecked items are
                    deployment blockers.
                  </p>
                  {data.preFlightChecklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                        item.checked
                          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                    >
                      {item.checked ? (
                        <CheckSquare className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            item.checked ? 'text-emerald-800' : 'text-slate-700'
                          )}
                        >
                          {item.label}
                        </p>
                        <p
                          className={cn(
                            'text-xs mt-0.5',
                            item.checked ? 'text-emerald-600' : 'text-slate-500'
                          )}
                        >
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))}
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
                  onClick={handleGenerate}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Generate Harm Reduction Protocol
                </Button>
              )}
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
