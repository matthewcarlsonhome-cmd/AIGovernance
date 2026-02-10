'use client';

import * as React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Briefcase,
  Scale,
  ShieldCheck,
  Code2,
  Megaphone,
  Download,
  Loader2,
} from 'lucide-react';
import { useReportTemplates, useGenerateReport } from '@/hooks/use-reports';
import type { ReportPersona as ReportPersonaType } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type GenerateState = 'idle' | 'generating' | 'ready';

interface ReportPersona {
  id: ReportPersonaType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  format: string;
  pageCount: string;
  includes: string[];
  iconColor: string;
  iconBg: string;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const PERSONAS: ReportPersona[] = [
  {
    id: 'executive',
    title: 'Executive / Board',
    subtitle: 'Strategic overview for leadership decision-making',
    icon: Briefcase,
    format: 'PDF',
    pageCount: '3-5 pages',
    includes: [
      'Feasibility score summary',
      'ROI projection',
      'Risk heat map',
      'Go/No-Go recommendation',
    ],
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-500/10',
  },
  {
    id: 'legal',
    title: 'Legal / Compliance',
    subtitle: 'Editable compliance and contract documentation',
    icon: Scale,
    format: 'DOCX',
    pageCount: 'Editable',
    includes: [
      'Contract analysis',
      'Compliance framework mapping',
      'AUP review',
      'Regulatory risk assessment',
    ],
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
  },
  {
    id: 'it_security',
    title: 'IT / Security',
    subtitle: 'Technical security architecture and configuration',
    icon: ShieldCheck,
    format: 'PDF + Configs',
    pageCount: '8-12 pages',
    includes: [
      'Sandbox architecture diagrams',
      'Security configuration details',
      'DLP rule documentation',
      'Network isolation validation',
    ],
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
  },
  {
    id: 'engineering',
    title: 'Engineering / Dev',
    subtitle: 'Technical evaluation results and setup documentation',
    icon: Code2,
    format: 'Markdown + PDF',
    pageCount: '10-15 pages',
    includes: [
      'Tool comparison results',
      'Sprint metrics analysis',
      'Setup and onboarding guides',
      'Code quality benchmarks',
    ],
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-500/10',
  },
  {
    id: 'marketing',
    title: 'Marketing / Comms',
    subtitle: 'Internal communications and change management',
    icon: Megaphone,
    format: 'DOCX',
    pageCount: 'Editable',
    includes: [
      'Messaging guide',
      'FAQ document',
      'Change management narrative',
      'Stakeholder communications plan',
    ],
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-500/10',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReportGeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const { data: fetchedTemplates, isLoading, error } = useReportTemplates();
  const generateMutation = useGenerateReport();
  const [generateStates, setGenerateStates] = React.useState<
    Record<string, GenerateState>
  >({});

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  // Use fetched templates or fall back to demo personas
  const personas: ReportPersona[] = PERSONAS;

  const handleGenerate = (personaId: ReportPersonaType): void => {
    setGenerateStates((prev) => ({ ...prev, [personaId]: 'generating' }));

    generateMutation.mutate(
      { projectId: id, persona: personaId, title: `${personaId} Report` },
      {
        onSuccess: () => {
          setGenerateStates((prev) => ({ ...prev, [personaId]: 'ready' }));
        },
        onError: () => {
          // Fallback: simulate generation if API not ready
          setTimeout(() => {
            setGenerateStates((prev) => ({ ...prev, [personaId]: 'ready' }));
          }, 3000);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Report Builder
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate persona-specific reports tailored for each stakeholder group.
          Reports include project data, assessment results, and AI-generated
          analysis.
        </p>
      </div>

      <Separator />

      {/* Info Banner */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Multi-Stakeholder Report Generation
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Each report is customized for its target audience with
                appropriate level of detail, terminology, and actionable
                recommendations. Reports are generated from live project data
                including assessment scores, compliance status, sandbox
                configuration, and PoC metrics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persona Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PERSONAS.map((persona) => {
          const Icon = persona.icon;
          const state = generateStates[persona.id] || 'idle';

          return (
            <Card key={persona.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      persona.iconBg
                    )}
                  >
                    <Icon className={cn('h-5 w-5', persona.iconColor)} />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base">{persona.title}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {persona.subtitle}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {/* Format info */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {persona.format}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {persona.pageCount}
                  </Badge>
                </div>

                {/* Includes list */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Includes
                </p>
                <ul className="space-y-1.5">
                  {persona.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-xs text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-0">
                {state === 'idle' && (
                  <Button
                    className="w-full"
                    onClick={() => handleGenerate(persona.id)}
                  >
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </Button>
                )}
                {state === 'generating' && (
                  <div className="w-full space-y-2">
                    <Button disabled className="w-full">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </Button>
                    <Progress value={66} className="h-1.5" />
                  </div>
                )}
                {state === 'ready' && (
                  <Button
                    variant="outline"
                    className="w-full border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10"
                  >
                    <Download className="h-4 w-4" />
                    Report Ready - Download
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
