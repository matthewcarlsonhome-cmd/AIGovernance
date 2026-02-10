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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { UserRole } from '@/types';
import { useCreateProject } from '@/hooks/use-projects';
import {
  projectDetailsSchema,
  type ProjectDetailsFormValues,
  INDUSTRIES,
  ORG_SIZES,
} from '@/lib/validations/project';

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
                  isCompleted ? 'bg-slate-900' : 'bg-slate-200'
                )}
              />
            )}

            {/* Circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isCompleted && 'border-slate-900 bg-slate-900 text-white',
                  isCurrent && 'border-slate-900 bg-white text-slate-900',
                  !isCompleted && !isCurrent && 'border-slate-200 bg-slate-100 text-slate-500'
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
                  isCurrent ? 'text-slate-900' : 'text-slate-500'
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
/*  Step 1 – Project Details (React Hook Form + Zod)                           */
/* -------------------------------------------------------------------------- */

function StepProjectDetails({
  form,
}: {
  form: ReturnType<typeof useForm<ProjectDetailsFormValues>>;
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Project Name <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. AI Coding Agent Governance Program"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the goals and scope of this governance project..."
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Industry <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="flex h-9 w-full items-center rounded-md border border-input bg-transparent py-2 pl-10 pr-3 text-sm shadow-sm ring-offset-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orgSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Organization Size <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="flex h-9 w-full items-center rounded-md border border-input bg-transparent py-2 pl-10 pr-3 text-sm shadow-sm ring-offset-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="">Select size...</option>
                    {ORG_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size} employees
                      </option>
                    ))}
                  </select>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
      <p className="text-sm text-slate-500">
        Add the core team members who will participate in the AI governance
        process. You can add more members later.
      </p>

      <div className="space-y-4">
        {members.map((member, idx) => (
          <div
            key={member.id}
            className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_180px_40px]"
          >
            <div className="space-y-1">
              <Label htmlFor={`name-${member.id}`} className="text-xs text-slate-500">
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
              <Label htmlFor={`email-${member.id}`} className="text-xs text-slate-500">
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
              <Label htmlFor={`role-${member.id}`} className="text-xs text-slate-500">
                Role
              </Label>
              <select
                id={`role-${member.id}`}
                value={member.role}
                onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                className="text-slate-500 hover:text-red-500"
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
      <p className="text-sm text-slate-500">
        Review the details below before creating your project. You can always
        edit these later from the project settings.
      </p>

      {/* Project Info */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          Project Details
        </h3>
        <Separator />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-slate-500">Name</span>
            <p className="font-medium text-slate-900">{name || '(not provided)'}</p>
          </div>
          <div>
            <span className="text-slate-500">Industry</span>
            <p className="font-medium text-slate-900">{industry || '(not selected)'}</p>
          </div>
          <div>
            <span className="text-slate-500">Organization Size</span>
            <p className="font-medium text-slate-900">
              {orgSize ? `${orgSize} employees` : '(not selected)'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-500">Description</span>
            <p className="font-medium text-slate-900">{description || '(not provided)'}</p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          Team Members ({members.filter((m) => m.name || m.email).length})
        </h3>
        <Separator />
        {members.filter((m) => m.name || m.email).length === 0 ? (
          <p className="text-sm text-slate-500">No team members added.</p>
        ) : (
          <div className="space-y-2">
            {members
              .filter((m) => m.name || m.email)
              .map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{m.name || '(no name)'}</p>
                    <p className="text-xs text-slate-500">{m.email || '(no email)'}</p>
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
  const createProject = useCreateProject();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 – React Hook Form + Zod validation
  const detailsForm = useForm<ProjectDetailsFormValues>({
    resolver: zodResolver(projectDetailsSchema),
    defaultValues: {
      name: '',
      description: '',
      industry: '',
      orgSize: '',
    },
    mode: 'onTouched',
  });

  // Step 2 state
  const [members, setMembers] = useState<TeamMemberRow[]>([
    { id: crypto.randomUUID(), name: '', email: '', role: 'engineering' },
  ]);

  const [isCreating, setIsCreating] = useState(false);

  /* ---- Validation ---- */
  const isStep1Valid = detailsForm.formState.isValid;

  const canProceed = currentStep === 0 ? isStep1Valid : true;

  /* ---- Navigation ---- */
  const goNext = async () => {
    if (currentStep === 0) {
      // Trigger validation before proceeding from Step 1
      const valid = await detailsForm.trigger();
      if (!valid) return;
    }
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
    const formValues = detailsForm.getValues();
    try {
      const project = await createProject.mutateAsync({
        name: formValues.name,
        description: formValues.description,
        status: 'discovery',
      });
      router.push(`/projects/${project?.id ?? 'demo-new'}/overview`);
    } catch {
      // Fallback: navigate to demo project if API not ready
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push('/projects/demo-new/overview');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create New Project
        </h1>
        <p className="mt-1 text-sm text-slate-500">
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

        <CardFooter className="flex justify-between gap-3 border-t border-slate-200 pt-6">
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
