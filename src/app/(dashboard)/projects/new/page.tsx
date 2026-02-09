'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderPlus,
  Users,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  Building2,
  Briefcase,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface TeamMemberRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STEPS = [
  { label: 'Project Details', icon: FolderPlus },
  { label: 'Team Setup', icon: Users },
  { label: 'Review & Create', icon: ClipboardCheck },
] as const;

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Government',
  'Manufacturing',
  'Retail',
  'Other',
] as const;

const ORG_SIZES = [
  '1-50',
  '51-200',
  '201-1000',
  '1001-5000',
  '5000+',
] as const;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'executive', label: 'Executive' },
  { value: 'it', label: 'IT / Infrastructure' },
  { value: 'legal', label: 'Legal / Compliance' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
];

/* -------------------------------------------------------------------------- */
/*  Step Indicator                                                             */
/* -------------------------------------------------------------------------- */

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        const StepIcon = step.icon;

        return (
          <React.Fragment key={step.label}>
            {/* Connector line (before) */}
            {idx > 0 && (
              <div
                className={cn(
                  'h-0.5 w-12 sm:w-20 transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            {/* Circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-background text-primary',
                  !isCompleted && !isCurrent && 'border-border bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
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
/*  Step 1 – Project Details                                                   */
/* -------------------------------------------------------------------------- */

function StepProjectDetails({
  name,
  setName,
  description,
  setDescription,
  industry,
  setIndustry,
  orgSize,
  setOrgSize,
}: {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  orgSize: string;
  setOrgSize: (v: string) => void;
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="project-name">
          Project Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="project-name"
          placeholder="e.g. AI Coding Agent Governance Program"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">Description</Label>
        <Textarea
          id="project-description"
          placeholder="Describe the goals and scope of this governance project..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">
            Industry <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="flex h-9 w-full items-center rounded-md border border-input bg-transparent py-2 pl-10 pr-3 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-size">
            Organization Size <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              id="org-size"
              value={orgSize}
              onChange={(e) => setOrgSize(e.target.value)}
              className="flex h-9 w-full items-center rounded-md border border-input bg-transparent py-2 pl-10 pr-3 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select size...</option>
              {ORG_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} employees
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 2 – Team Setup                                                        */
/* -------------------------------------------------------------------------- */

function StepTeamSetup({
  members,
  setMembers,
}: {
  members: TeamMemberRow[];
  setMembers: React.Dispatch<React.SetStateAction<TeamMemberRow[]>>;
}): React.ReactElement {
  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', email: '', role: 'engineering' },
    ]);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, field: keyof TeamMemberRow, value: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add the core team members who will participate in the AI governance
        process. You can add more members later.
      </p>

      <div className="space-y-4">
        {members.map((member, idx) => (
          <div
            key={member.id}
            className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-[1fr_1fr_180px_40px]"
          >
            <div className="space-y-1">
              <Label htmlFor={`name-${member.id}`} className="text-xs text-muted-foreground">
                Full Name
              </Label>
              <Input
                id={`name-${member.id}`}
                placeholder="Jane Smith"
                value={member.name}
                onChange={(e) => updateMember(member.id, 'name', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`email-${member.id}`} className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id={`email-${member.id}`}
                type="email"
                placeholder="jane@company.com"
                value={member.email}
                onChange={(e) => updateMember(member.id, 'email', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`role-${member.id}`} className="text-xs text-muted-foreground">
                Role
              </Label>
              <select
                id={`role-${member.id}`}
                value={member.role}
                onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={members.length <= 1}
                onClick={() => removeMember(member.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addMember} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Member
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 3 – Review & Create                                                   */
/* -------------------------------------------------------------------------- */

function StepReview({
  name,
  description,
  industry,
  orgSize,
  members,
}: {
  name: string;
  description: string;
  industry: string;
  orgSize: string;
  members: TeamMemberRow[];
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review the details below before creating your project. You can always
        edit these later from the project settings.
      </p>

      {/* Project Info */}
      <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Project Details
        </h3>
        <Separator />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-muted-foreground">Name</span>
            <p className="font-medium text-foreground">{name || '(not provided)'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Industry</span>
            <p className="font-medium text-foreground">{industry || '(not selected)'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Organization Size</span>
            <p className="font-medium text-foreground">
              {orgSize ? `${orgSize} employees` : '(not selected)'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">Description</span>
            <p className="font-medium text-foreground">{description || '(not provided)'}</p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Team Members ({members.filter((m) => m.name || m.email).length})
        </h3>
        <Separator />
        {members.filter((m) => m.name || m.email).length === 0 ? (
          <p className="text-sm text-muted-foreground">No team members added.</p>
        ) : (
          <div className="space-y-2">
            {members
              .filter((m) => m.name || m.email)
              .map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name || '(no name)'}</p>
                    <p className="text-xs text-muted-foreground">{m.email || '(no email)'}</p>
                  </div>
                  <Badge variant="secondary">
                    {ROLE_OPTIONS.find((r) => r.value === m.role)?.label ?? m.role}
                  </Badge>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function NewProjectPage(): React.ReactElement {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [orgSize, setOrgSize] = useState('');

  // Step 2 state
  const [members, setMembers] = useState<TeamMemberRow[]>([
    { id: crypto.randomUUID(), name: '', email: '', role: 'engineering' },
  ]);

  const [isCreating, setIsCreating] = useState(false);

  /* ---- Validation ---- */
  const isStep1Valid = name.trim().length > 0 && industry.length > 0 && orgSize.length > 0;

  const canProceed = currentStep === 0 ? isStep1Valid : true;

  /* ---- Navigation ---- */
  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    router.push('/projects/demo-new/overview');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create New Project
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up a new AI governance project for your organization
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-10">
        <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />
      </div>

      {/* Card body */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{STEPS[currentStep].label}</CardTitle>
          <CardDescription>
            {currentStep === 0 &&
              'Provide the basic information about your governance project.'}
            {currentStep === 1 &&
              'Invite team members who will collaborate on this project.'}
            {currentStep === 2 &&
              'Confirm everything looks good, then create the project.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {currentStep === 0 && (
            <StepProjectDetails
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              industry={industry}
              setIndustry={setIndustry}
              orgSize={orgSize}
              setOrgSize={setOrgSize}
            />
          )}
          {currentStep === 1 && (
            <StepTeamSetup members={members} setMembers={setMembers} />
          )}
          {currentStep === 2 && (
            <StepReview
              name={name}
              description={description}
              industry={industry}
              orgSize={orgSize}
              members={members}
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-3 border-t border-border pt-6">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={goNext} disabled={!canProceed} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={isCreating || !isStep1Valid}
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
