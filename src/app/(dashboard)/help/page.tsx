'use client';

import {
  Shield,
  FolderKanban,
  ClipboardList,
  Target,
  CheckSquare,
  FileText,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Settings,
  Code,
  CheckCircle,
  FlaskConical,
  Timer,
  GitCompare,
  TrendingUp,
  CalendarRange,
  Flag,
  FileOutput,
  History,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Rocket,
  DollarSign,
  Calendar,
  Grid3X3,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface WorkflowStep {
  phase: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  pages: { name: string; description: string; icon: React.ElementType }[];
}

/* -------------------------------------------------------------------------- */
/*  Workflow Data                                                               */
/* -------------------------------------------------------------------------- */

const workflowSteps: WorkflowStep[] = [
  {
    phase: 'Phase 1',
    title: 'Discovery & Assessment',
    description: 'Evaluate your organization\'s readiness for AI adoption through structured questionnaires, readiness assessments, and prerequisite checklists.',
    icon: ClipboardList,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    pages: [
      {
        name: 'Questionnaire',
        description: 'Complete a guided assessment covering 5 domains: Infrastructure, Security, Governance, Engineering, and Business readiness. Each question contributes to your feasibility score.',
        icon: ClipboardList,
      },
      {
        name: 'Readiness Dashboard',
        description: 'View your organization\'s readiness as a radar chart across all 5 domains. Identify strengths and gaps at a glance with domain-specific scores and recommendations.',
        icon: Target,
      },
      {
        name: 'Prerequisites Checklist',
        description: 'Track required prerequisites before moving to the next phase. Assign tasks to team members, set due dates, and monitor completion status.',
        icon: CheckSquare,
      },
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Governance Framework',
    description: 'Establish policies, compliance mappings, risk classifications, and gate reviews to ensure responsible AI adoption.',
    icon: ShieldCheck,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    pages: [
      {
        name: 'Policies',
        description: 'Create and manage governance policies including Acceptable Use Policy (AUP), Incident Response Plan (IRP), and data classification policies. Version-controlled with edit history.',
        icon: FileText,
      },
      {
        name: 'Gate Reviews',
        description: 'Manage the three-gate approval process: Gate 1 (Security & Compliance), Gate 2 (Pilot Readiness), Gate 3 (Production). Each gate has evidence checklists and approval workflows.',
        icon: ShieldCheck,
      },
      {
        name: 'Compliance',
        description: 'Map your AI governance controls to compliance frameworks (SOC2, HIPAA, NIST, GDPR). Track control coverage and identify gaps.',
        icon: Scale,
      },
      {
        name: 'Risk Classification',
        description: 'Define and manage risk tiers for AI usage. Classify risks by likelihood and impact, assign mitigation strategies, and track risk status over time.',
        icon: AlertTriangle,
      },
      {
        name: 'RACI Matrix',
        description: 'Define Responsible, Accountable, Consulted, and Informed roles for each governance activity. Ensures clear ownership and accountability.',
        icon: Grid3X3,
      },
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Sandbox Setup',
    description: 'Configure and validate your AI sandbox environment with infrastructure settings, generated config files, and health checks.',
    icon: Settings,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pages: [
      {
        name: 'Configure',
        description: 'Complete the infrastructure questionnaire to specify your cloud provider, model preferences, network settings, and security controls. The system generates configuration files automatically.',
        icon: Settings,
      },
      {
        name: 'Config Files',
        description: 'View and edit generated configuration files (managed-settings.json, requirements.toml, .cursorrules, etc.) for your sandbox environment. Download individual files or export all as a bundle.',
        icon: Code,
      },
      {
        name: 'Validation',
        description: 'Run health checks against your sandbox environment to verify connectivity, security settings, model access, and compliance controls are properly configured.',
        icon: CheckCircle,
      },
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Proof of Concept',
    description: 'Run structured PoC evaluations comparing AI coding tools, track sprint metrics, and measure impact against baseline.',
    icon: FlaskConical,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    pages: [
      {
        name: 'PoC Projects',
        description: 'Define proof-of-concept projects with scope, success criteria, and selection scoring. Compare multiple PoC candidates and select the most promising ones.',
        icon: FlaskConical,
      },
      {
        name: 'Sprints',
        description: 'Track sprint evaluation windows with start/end dates, team assignments, and sprint goals. Record outcomes and lessons learned for each sprint cycle.',
        icon: Timer,
      },
      {
        name: 'Compare Tools',
        description: 'Head-to-head comparison dashboard for AI coding tools (e.g., Claude Code vs. OpenAI Codex). Compare on quality, speed, accuracy, developer satisfaction, and security.',
        icon: GitCompare,
      },
      {
        name: 'Metrics',
        description: 'Capture and visualize key metrics: development velocity, defect rates, code quality scores, developer satisfaction, and AI adoption rates. Compare baseline vs. AI-assisted performance.',
        icon: TrendingUp,
      },
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Timeline & Project Management',
    description: 'Plan and track your AI implementation timeline with Gantt charts, milestones, and schedule baseline comparisons.',
    icon: CalendarRange,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    pages: [
      {
        name: 'Gantt Chart',
        description: 'Interactive Gantt chart for planning implementation phases. Drag-and-drop to adjust dates, draw dependency arrows between tasks, and highlight the critical path.',
        icon: CalendarRange,
      },
      {
        name: 'Milestones',
        description: 'Define and track major milestones in your AI governance journey. Set target dates, assign owners, and monitor completion against the project timeline.',
        icon: Flag,
      },
      {
        name: 'Snapshots',
        description: 'Capture point-in-time schedule baselines to compare planned vs. actual progress. Identify schedule drift and adjust timelines proactively.',
        icon: History,
      },
    ],
  },
  {
    phase: 'Phase 6',
    title: 'Reports & Communication',
    description: 'Generate stakeholder-specific reports for executives, legal, IT/security, engineering, and marketing teams.',
    icon: FileOutput,
    color: 'bg-green-100 text-green-800 border-green-200',
    pages: [
      {
        name: 'Generate Reports',
        description: 'Select a report persona (Executive, Legal, IT/Security, Engineering, Marketing) and customize sections. Reports are generated as PDF or DOCX with tailored content for each audience.',
        icon: FileOutput,
      },
      {
        name: 'Report History',
        description: 'Browse previously generated reports. Download, share, or regenerate reports from this archive. Track which stakeholders have received which reports.',
        icon: History,
      },
    ],
  },
];

const additionalFeatures = [
  {
    name: 'Project Overview',
    description: 'Dashboard view showing project health score, current phase, key metrics, and recent activity. Your starting point after selecting a project.',
    icon: BarChart3,
  },
  {
    name: 'Setup Guide',
    description: 'Step-by-step wizard that walks you through initial project configuration. Ensures all required fields are completed before advancing to the discovery phase.',
    icon: Rocket,
  },
  {
    name: 'ROI Calculator',
    description: 'Estimate the return on investment for your AI adoption initiative. Input team size, velocity improvements, and costs to generate financial projections.',
    icon: DollarSign,
  },
  {
    name: 'Meetings',
    description: 'Schedule and track governance meetings including steering committee reviews, gate review meetings, and team standups. Attach agendas and minutes.',
    icon: Calendar,
  },
  {
    name: 'Team Management',
    description: 'Manage project team members, assign roles (Admin, Consultant, Executive, IT, Legal, Engineering, Marketing), and control access permissions.',
    icon: Users,
  },
];

/* -------------------------------------------------------------------------- */
/*  Collapsible Phase Section                                                  */
/* -------------------------------------------------------------------------- */

function PhaseSection({ step }: { step: WorkflowStep }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = step.icon;

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border', step.color)}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={step.color}>
                  {step.phase}
                </Badge>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-slate-400 ml-auto" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                )}
              </div>
              <CardTitle className="text-lg mt-1">{step.title}</CardTitle>
              <CardDescription className="mt-1">{step.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </button>

      {isOpen && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          <div className="space-y-4">
            {step.pages.map((page) => {
              const PageIcon = page.icon;
              return (
                <div key={page.name} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <PageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{page.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{page.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scoring Explanation                                                        */
/* -------------------------------------------------------------------------- */

function ScoringSection() {
  const [isOpen, setIsOpen] = useState(false);

  const domains = [
    { name: 'Infrastructure', weight: '25%', description: 'Cloud readiness, network configuration, compute capacity, and deployment infrastructure.' },
    { name: 'Security', weight: '25%', description: 'Data protection, access controls, DLP policies, threat modeling, and incident response.' },
    { name: 'Governance', weight: '20%', description: 'Policy frameworks, compliance mappings, risk management, and audit readiness.' },
    { name: 'Engineering', weight: '15%', description: 'Developer tooling, CI/CD pipelines, code review processes, and testing practices.' },
    { name: 'Business', weight: '15%', description: 'ROI justification, stakeholder buy-in, change management, and success criteria.' },
  ];

  return (
    <Card>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Feasibility Scoring Engine</CardTitle>
              <CardDescription className="mt-1">
                How your project feasibility score is calculated across 5 domains.
              </CardDescription>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </CardHeader>
      </button>

      {isOpen && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Your feasibility score is calculated by evaluating responses across 5 weighted domains.
              Each domain is scored 0-100, then combined using the weights below for an overall score.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {domains.map((d) => (
                <div key={d.name} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{d.name}</span>
                    <Badge variant="outline" className="text-xs">{d.weight}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{d.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-900 mb-2">Score Ratings</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-600"><strong>75-100:</strong> Feasible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-slate-600"><strong>50-74:</strong> Conditional</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-slate-600"><strong>0-49:</strong> Not Ready</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Getting Started Section                                                    */
/* -------------------------------------------------------------------------- */

function GettingStartedSection() {
  const steps = [
    {
      step: 1,
      title: 'Create a Project',
      description: 'Click "New Project" from the Projects page. Fill in your project name, industry, and organization size. Add initial team members.',
    },
    {
      step: 2,
      title: 'Complete Discovery',
      description: 'Navigate to the Discovery section. Complete the assessment questionnaire, review your readiness dashboard, and work through the prerequisites checklist.',
    },
    {
      step: 3,
      title: 'Establish Governance',
      description: 'Set up your governance framework: create policies, map compliance requirements, classify risks, and prepare for gate reviews.',
    },
    {
      step: 4,
      title: 'Configure Sandbox',
      description: 'Set up your AI sandbox environment. Complete the infrastructure questionnaire and validate that your sandbox meets all requirements.',
    },
    {
      step: 5,
      title: 'Run Proof of Concept',
      description: 'Define PoC projects, run evaluation sprints, compare tools, and capture metrics to validate your AI adoption approach.',
    },
    {
      step: 6,
      title: 'Review & Report',
      description: 'Generate stakeholder reports, track milestones, pass gate reviews, and prepare for production deployment.',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Getting Started</CardTitle>
        <CardDescription>Follow these steps to set up and run your first AI governance project.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((s, idx) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-semibold">
                  {s.step}
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-slate-200 mt-1" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium text-slate-900">{s.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-slate-900" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Help &amp; Documentation
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Learn how GovAI Studio works and how to navigate its features to manage your
          AI governance projects from assessment through production deployment.
        </p>
      </div>

      {/* Getting Started */}
      <GettingStartedSection />

      {/* Workflow Phases */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Workflow Phases</h2>
        <p className="text-sm text-slate-500 mb-4">
          GovAI Studio guides you through a structured workflow. Each phase builds on the
          previous one, ensuring a comprehensive governance process. Click each phase to see
          its features.
        </p>
        <div className="space-y-4">
          {workflowSteps.map((step) => (
            <PhaseSection key={step.phase} step={step} />
          ))}
        </div>
      </div>

      {/* Scoring Engine */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">How Scoring Works</h2>
        <ScoringSection />
      </div>

      {/* Additional Features */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Features</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {additionalFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.name}>
                <CardContent className="pt-5">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{feature.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stakeholder Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Multi-Stakeholder Reporting</CardTitle>
          <CardDescription>
            Generate tailored reports for different audiences within your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { persona: 'Executive', format: 'PDF', pages: '3-5 pages', content: 'Feasibility score, ROI analysis, risk heat map, go/no-go recommendation' },
              { persona: 'Legal', format: 'DOCX', pages: 'Editable', content: 'Contract analysis, compliance mapping, AUP review, regulatory considerations' },
              { persona: 'IT / Security', format: 'PDF + Config', pages: 'Technical', content: 'Sandbox architecture, network config, DLP rules, security controls' },
              { persona: 'Engineering', format: 'PDF + MD', pages: 'Developer', content: 'Tool comparison, metrics, setup guides, CI/CD configuration' },
              { persona: 'Marketing', format: 'DOCX', pages: 'Editable', content: 'Messaging guide, FAQ, change management narrative, stakeholder comms' },
            ].map((r) => (
              <div key={r.persona} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{r.persona}</span>
                  <Badge variant="outline" className="text-xs">{r.format}</Badge>
                </div>
                <p className="text-xs text-slate-500">{r.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Tips for Success</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span><strong>Work sequentially through phases.</strong> Each phase builds on the outputs of the previous one. Complete Discovery before establishing Governance.</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span><strong>Involve the right stakeholders early.</strong> Use the Team page to assign roles and the RACI matrix to define responsibilities before starting assessments.</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span><strong>Use the feasibility score as a guide.</strong> A score below 50 indicates significant readiness gaps. Focus on the weakest domains first.</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span><strong>Gate reviews are checkpoints.</strong> Don&apos;t skip gate reviews. They ensure your organization has met the minimum requirements before advancing.</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span><strong>Generate reports for every audience.</strong> Different stakeholders need different information. Use the persona-based report generator to tailor communication.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
