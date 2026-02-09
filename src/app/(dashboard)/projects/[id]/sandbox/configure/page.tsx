'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Cloud,
  Server,
  Container,
  Monitor,
  Shield,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Layers,
  Network,
  Lock,
  Settings,
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
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CloudProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

interface SandboxModel {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  recommended?: boolean;
}

interface SecurityConfig {
  egressFiltering: boolean;
  domainAllowlist: string;
  dlpEnabled: boolean;
  dlpPatterns: { secrets: boolean; pii: boolean; proprietary: boolean };
  auditLogging: boolean;
  siemIntegration: string;
  selectedModel: string;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const CLOUD_PROVIDERS: CloudProvider[] = [
  {
    id: 'aws',
    name: 'Amazon Web Services',
    description: 'VPC-based isolation with AWS PrivateLink endpoints and CloudTrail audit logging.',
    icon: Cloud,
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    description: 'VPC Service Controls with Cloud Audit Logs and Access Transparency.',
    icon: Cloud,
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    description: 'Virtual Network isolation with Private Link and Azure Monitor integration.',
    icon: Cloud,
  },
  {
    id: 'on-prem',
    name: 'On-Premises',
    description: 'Self-hosted infrastructure with existing network security controls and firewalls.',
    icon: Server,
  },
] satisfies CloudProvider[];

const SANDBOX_MODELS: SandboxModel[] = [
  {
    id: 'vpc',
    name: 'Cloud Native VPC',
    description:
      'Dedicated VPC with private subnets, NAT gateway egress filtering, and VPC endpoints for AI services. Best for enterprise compliance.',
    icon: Network,
    recommended: true,
  },
  {
    id: 'codespaces',
    name: 'GitHub Codespaces / Cloud Workstations',
    description:
      'Managed cloud development environments with pre-configured images, network policies, and session-based isolation.',
    icon: Monitor,
  },
  {
    id: 'docker',
    name: 'Docker Compose',
    description:
      'Containerized local development environment with network isolation, volume mounts, and reproducible builds.',
    icon: Container,
  },
  {
    id: 'hybrid',
    name: 'Hybrid (Cloud + Local)',
    description:
      'Cloud infrastructure for AI model access with local development environments connected via secure tunnel.',
    icon: Layers,
  },
] satisfies SandboxModel[];

const AI_MODELS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4o', label: 'GPT-4o' },
] satisfies { value: string; label: string }[];

const SIEM_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'splunk', label: 'Splunk' },
  { value: 'datadog', label: 'Datadog' },
  { value: 'elastic', label: 'Elastic SIEM' },
  { value: 'sentinel', label: 'Microsoft Sentinel' },
  { value: 'chronicle', label: 'Google Chronicle' },
] satisfies { value: string; label: string }[];

const STEPS = [
  { number: 1, title: 'Cloud Provider', icon: Cloud },
  { number: 2, title: 'Sandbox Model', icon: Container },
  { number: 3, title: 'Security Config', icon: Shield },
  { number: 4, title: 'Review & Generate', icon: CheckCircle2 },
] satisfies { number: number; title: string; icon: React.ElementType }[];

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: typeof STEPS;
  currentStep: number;
}): React.JSX.Element {
  return (
    <nav aria-label="Configuration steps" className="mb-8">
      <ol className="flex items-center gap-2">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <li key={step.number} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive && 'bg-primary text-primary-foreground',
                  isComplete && 'bg-primary/10 text-primary',
                  !isActive && !isComplete && 'text-muted-foreground'
                )}
              >
                <StepIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.number}</span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1: Cloud Provider                                             */
/* ------------------------------------------------------------------ */

function StepCloudProvider({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Select Cloud Provider</h2>
        <p className="text-sm text-muted-foreground">
          Choose the cloud platform where the sandbox environment will be provisioned.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {CLOUD_PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          const isSelected = selected === provider.id;

          return (
            <Card
              key={provider.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary border-primary'
              )}
              onClick={() => onSelect(provider.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{provider.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2: Sandbox Model                                              */
/* ------------------------------------------------------------------ */

function StepSandboxModel({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Select Sandbox Model</h2>
        <p className="text-sm text-muted-foreground">
          Choose the isolation architecture for your AI coding sandbox.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SANDBOX_MODELS.map((model) => {
          const Icon = model.icon;
          const isSelected = selected === model.id;

          return (
            <Card
              key={model.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary border-primary'
              )}
              onClick={() => onSelect(model.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{model.name}</CardTitle>
                    {model.recommended && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{model.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3: Security Configuration                                     */
/* ------------------------------------------------------------------ */

function StepSecurity({
  config,
  onChange,
}: {
  config: SecurityConfig;
  onChange: (config: SecurityConfig) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Security Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Configure network, data protection, and audit settings for the sandbox.
        </p>
      </div>

      {/* Egress Filtering */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Egress Filtering</CardTitle>
            </div>
            <Switch
              checked={config.egressFiltering}
              onCheckedChange={(checked) =>
                onChange({ ...config, egressFiltering: checked })
              }
            />
          </div>
          <CardDescription>
            Restrict outbound network traffic to approved domains only.
          </CardDescription>
        </CardHeader>
        {config.egressFiltering && (
          <CardContent>
            <Label htmlFor="domain-allowlist" className="text-sm font-medium">
              Domain Allowlist
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              One domain per line. Wildcards supported (e.g., *.internal.corp.com).
            </p>
            <Textarea
              id="domain-allowlist"
              rows={5}
              placeholder={
                'api.anthropic.com\ngithub.com\n*.internal.corp.com\nregistry.npmjs.org'
              }
              value={config.domainAllowlist}
              onChange={(e) =>
                onChange({ ...config, domainAllowlist: e.target.value })
              }
              className="font-mono text-sm"
            />
          </CardContent>
        )}
      </Card>

      {/* DLP Rules */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">DLP Rules</CardTitle>
            </div>
            <Switch
              checked={config.dlpEnabled}
              onCheckedChange={(checked) =>
                onChange({ ...config, dlpEnabled: checked })
              }
            />
          </div>
          <CardDescription>
            Data Loss Prevention patterns to detect and block sensitive information.
          </CardDescription>
        </CardHeader>
        {config.dlpEnabled && (
          <CardContent>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Pattern Detection</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={config.dlpPatterns.secrets}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...config,
                        dlpPatterns: { ...config.dlpPatterns, secrets: !!checked },
                      })
                    }
                  />
                  <div>
                    <span className="text-sm font-medium">Secrets & Credentials</span>
                    <p className="text-xs text-muted-foreground">
                      API keys, tokens, passwords, connection strings
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={config.dlpPatterns.pii}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...config,
                        dlpPatterns: { ...config.dlpPatterns, pii: !!checked },
                      })
                    }
                  />
                  <div>
                    <span className="text-sm font-medium">
                      Personally Identifiable Information (PII)
                    </span>
                    <p className="text-xs text-muted-foreground">
                      SSNs, email addresses, phone numbers, credit card numbers
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={config.dlpPatterns.proprietary}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...config,
                        dlpPatterns: {
                          ...config.dlpPatterns,
                          proprietary: !!checked,
                        },
                      })
                    }
                  />
                  <div>
                    <span className="text-sm font-medium">Proprietary Code Patterns</span>
                    <p className="text-xs text-muted-foreground">
                      Internal package names, trade secrets, restricted file patterns
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Audit Logging */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Audit Logging</CardTitle>
            </div>
            <Switch
              checked={config.auditLogging}
              onCheckedChange={(checked) =>
                onChange({ ...config, auditLogging: checked })
              }
            />
          </div>
          <CardDescription>
            Log all AI interactions, file access, and configuration changes.
          </CardDescription>
        </CardHeader>
        {config.auditLogging && (
          <CardContent>
            <Label htmlFor="siem-select" className="text-sm font-medium">
              SIEM Integration
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Forward audit logs to your security information and event management platform.
            </p>
            <select
              id="siem-select"
              value={config.siemIntegration}
              onChange={(e) =>
                onChange({ ...config, siemIntegration: e.target.value })
              }
              className="flex h-9 w-full max-w-xs items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {SIEM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </CardContent>
        )}
      </Card>

      {/* Model Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Managed Settings</CardTitle>
          </div>
          <CardDescription>
            Configure the default AI model and token limits for the sandbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="model-select" className="text-sm font-medium">
            Default AI Model
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Select the primary model that will be available in the sandbox environment.
          </p>
          <select
            id="model-select"
            value={config.selectedModel}
            onChange={(e) =>
              onChange({ ...config, selectedModel: e.target.value })
            }
            className="flex h-9 w-full max-w-xs items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {AI_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4: Review & Generate                                          */
/* ------------------------------------------------------------------ */

function StepReview({
  provider,
  model,
  security,
}: {
  provider: string;
  model: string;
  security: SecurityConfig;
}): React.JSX.Element {
  const providerLabel =
    CLOUD_PROVIDERS.find((p) => p.id === provider)?.name ?? 'Not selected';
  const modelLabel =
    SANDBOX_MODELS.find((m) => m.id === model)?.name ?? 'Not selected';
  const aiModelLabel =
    AI_MODELS.find((m) => m.value === security.selectedModel)?.label ?? 'Not selected';
  const siemLabel =
    SIEM_OPTIONS.find((s) => s.value === security.siemIntegration)?.label ?? 'None';

  const dlpPatternsList = [
    security.dlpPatterns.secrets && 'Secrets & Credentials',
    security.dlpPatterns.pii && 'PII',
    security.dlpPatterns.proprietary && 'Proprietary Code',
  ].filter((v): v is string => Boolean(v));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Review Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Verify your sandbox configuration before generating files.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Infrastructure */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Infrastructure
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex justify-between py-1.5 px-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Cloud Provider</span>
                  <span className="text-sm font-medium">{providerLabel}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Sandbox Model</span>
                  <span className="text-sm font-medium">{modelLabel}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Security */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Security
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 px-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Egress Filtering</span>
                  <Badge variant={security.egressFiltering ? 'default' : 'secondary'}>
                    {security.egressFiltering ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                {security.egressFiltering && security.domainAllowlist.trim() && (
                  <div className="py-1.5 px-3 rounded-md bg-muted/50">
                    <span className="text-sm text-muted-foreground block mb-1">
                      Allowed Domains
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {security.domainAllowlist
                        .split('\n')
                        .filter(Boolean)
                        .map((domain) => (
                          <Badge key={domain} variant="outline" className="text-xs font-mono">
                            {domain.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between py-1.5 px-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">DLP Rules</span>
                  <Badge variant={security.dlpEnabled ? 'default' : 'secondary'}>
                    {security.dlpEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                {security.dlpEnabled && dlpPatternsList.length > 0 && (
                  <div className="py-1.5 px-3 rounded-md bg-muted/50">
                    <span className="text-sm text-muted-foreground block mb-1">
                      DLP Patterns
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dlpPatternsList.map((pattern) => (
                        <Badge key={pattern} variant="outline" className="text-xs">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between py-1.5 px-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Audit Logging</span>
                  <Badge variant={security.auditLogging ? 'default' : 'secondary'}>
                    {security.auditLogging ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                {security.auditLogging && security.siemIntegration !== 'none' && (
                  <div className="flex justify-between py-1.5 px-3 rounded-md bg-muted/50">
                    <span className="text-sm text-muted-foreground">SIEM Integration</span>
                    <span className="text-sm font-medium">{siemLabel}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* AI Model */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                AI Configuration
              </h3>
              <div className="flex justify-between py-1.5 px-3 rounded-md bg-muted/50">
                <span className="text-sm text-muted-foreground">Default Model</span>
                <span className="text-sm font-medium">{aiModelLabel}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SandboxConfigurePage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [cloudProvider, setCloudProvider] = useState('aws');
  const [sandboxModel, setSandboxModel] = useState('vpc');
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    egressFiltering: true,
    domainAllowlist: 'api.anthropic.com\ngithub.com\n*.internal.corp.com\nregistry.npmjs.org',
    dlpEnabled: true,
    dlpPatterns: { secrets: true, pii: true, proprietary: false },
    auditLogging: true,
    siemIntegration: 'splunk',
    selectedModel: 'claude-sonnet-4-20250514',
  });

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return cloudProvider !== '';
      case 2:
        return sandboxModel !== '';
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = (): void => {
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = (): void => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleGenerate = (): void => {
    router.push(`/projects/${projectId}/sandbox/files`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sandbox Configuration</h1>
        <p className="text-muted-foreground">
          Configure the isolated environment for AI coding agent evaluation.
        </p>
      </div>

      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Step content */}
      {currentStep === 1 && (
        <StepCloudProvider
          selected={cloudProvider}
          onSelect={setCloudProvider}
        />
      )}
      {currentStep === 2 && (
        <StepSandboxModel
          selected={sandboxModel}
          onSelect={setSandboxModel}
        />
      )}
      {currentStep === 3 && (
        <StepSecurity config={securityConfig} onChange={setSecurityConfig} />
      )}
      {currentStep === 4 && (
        <StepReview
          provider={cloudProvider}
          model={sandboxModel}
          security={securityConfig}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleGenerate}>
            Generate Configuration Files
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
