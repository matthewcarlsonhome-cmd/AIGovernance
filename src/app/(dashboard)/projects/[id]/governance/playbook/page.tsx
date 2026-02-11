'use client';

import { useState } from 'react';
import * as React from 'react';
import {
  BookOpen,
  Shield,
  FileText,
  Download,
  Sparkles,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type {
  AIUsagePlaybook,
  PlaybookTool,
  PlaybookDataRule,
  DataTrafficLight,
} from '@/types';

// ---------- Demo Data ----------

const DEMO_PLAYBOOK: AIUsagePlaybook = {
  id: 'pb-001',
  project_id: 'proj-001',
  golden_rules: [
    'Never input confidential customer data, trade secrets, or credentials into any AI tool.',
    'Always review and validate AI-generated output before committing, publishing, or sharing.',
    'Disclose AI assistance in any client-facing deliverable, report, or communication.',
  ],
  tools: [
    {
      name: 'Claude Code',
      status: 'approved',
      data_handling: 'Enterprise plan with zero-retention API. Data not used for training.',
      approved_for: [
        'Code generation and review',
        'Documentation drafting',
        'Test case generation',
        'Architecture brainstorming',
      ],
      not_approved_for: [
        'Processing PII or PHI',
        'Generating legal opinions',
        'Accessing production databases',
      ],
      access_method: 'CLI via managed sandbox environment',
    },
    {
      name: 'OpenAI Codex',
      status: 'restricted',
      data_handling: 'Enterprise agreement with DPA. Opt-out from training confirmed.',
      approved_for: [
        'Non-sensitive code completion',
        'Documentation assistance',
      ],
      not_approved_for: [
        'Any regulated workload (HIPAA, SOX)',
        'Processing internal financial data',
        'Client project code',
      ],
      access_method: 'API via approved middleware only',
    },
    {
      name: 'ChatGPT (Consumer)',
      status: 'prohibited',
      data_handling: 'Consumer terms apply. Data may be used for training.',
      approved_for: [],
      not_approved_for: [
        'All work-related tasks',
        'Any company data processing',
      ],
      access_method: 'Blocked at network level',
    },
    {
      name: 'GitHub Copilot',
      status: 'restricted',
      data_handling: 'Business plan with telemetry disabled. Code snippets not retained.',
      approved_for: [
        'Open-source project contributions',
        'Personal learning and experimentation',
      ],
      not_approved_for: [
        'Proprietary codebase work',
        'Projects with IP restrictions',
      ],
      access_method: 'IDE extension with enterprise SSO',
    },
  ],
  data_rules: [
    {
      data_type: 'Public documentation',
      classification: 'green',
      consumer_ai: true,
      enterprise_ai: true,
      notes: 'Freely shareable. No restrictions.',
    },
    {
      data_type: 'Open-source code',
      classification: 'green',
      consumer_ai: true,
      enterprise_ai: true,
      notes: 'Check license compatibility.',
    },
    {
      data_type: 'Internal design docs',
      classification: 'yellow',
      consumer_ai: false,
      enterprise_ai: true,
      notes: 'Enterprise AI only. Strip project identifiers.',
    },
    {
      data_type: 'Proprietary source code',
      classification: 'yellow',
      consumer_ai: false,
      enterprise_ai: true,
      notes: 'Enterprise AI with DPA only. Sandbox environment required.',
    },
    {
      data_type: 'Customer PII',
      classification: 'red',
      consumer_ai: false,
      enterprise_ai: false,
      notes: 'Never input into any AI tool. Anonymize first if analysis needed.',
    },
    {
      data_type: 'API keys / credentials',
      classification: 'red',
      consumer_ai: false,
      enterprise_ai: false,
      notes: 'Strictly prohibited. Use placeholder values only.',
    },
    {
      data_type: 'Financial reports',
      classification: 'red',
      consumer_ai: false,
      enterprise_ai: false,
      notes: 'SOX compliance. No AI processing without CFO approval.',
    },
  ],
  approved_activities: [
    'Code generation for non-sensitive features',
    'Writing and improving unit tests',
    'Drafting internal documentation',
    'Brainstorming architecture approaches',
    'Generating boilerplate and scaffolding code',
    'Code review assistance and explanation',
    'Refactoring suggestions for existing code',
  ],
  prohibited_activities: [
    'Inputting customer PII, PHI, or financial data',
    'Using AI to generate legal contracts or opinions',
    'Bypassing sandbox environment controls',
    'Using consumer-grade AI tools for any work task',
    'Sharing proprietary algorithms or trade secrets',
    'Auto-deploying AI-generated code without review',
  ],
  requires_approval: [
    'Processing internal business data with AI tools',
    'Using AI for client-facing deliverables',
    'Integrating new AI tools not on the approved list',
    'AI-assisted analysis of competitive intelligence',
    'Training custom models on company data',
  ],
  disclosure_policy:
    'All AI-assisted work products must include an AI disclosure statement. For client deliverables, use the standard disclosure template: "This document was prepared with AI assistance. All content has been reviewed and validated by [Name], [Title]." Internal documents should note AI usage in the document metadata or header.',
  created_at: '2025-01-10T10:00:00Z',
  updated_at: '2025-02-05T16:00:00Z',
};

// ---------- Helpers ----------

const trafficLightColors: Record<DataTrafficLight, string> = {
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-800 border-red-200',
};

const trafficLightLabels: Record<DataTrafficLight, string> = {
  green: 'GREEN - Safe to Use',
  yellow: 'YELLOW - Caution Required',
  red: 'RED - Prohibited',
};

const toolStatusColors: Record<PlaybookTool['status'], string> = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  restricted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  prohibited: 'bg-red-100 text-red-800 border-red-200',
};

// ---------- Page Component ----------

export default function PlaybookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  void resolvedParams;

  const playbook = DEMO_PLAYBOOK;
  const [goldenRules, setGoldenRules] = useState<string[]>(playbook.golden_rules);
  const [editingRules, setEditingRules] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            AI Usage Playbook
          </h1>
          <p className="text-slate-500 mt-1">
            Organization-wide rules and guidelines for responsible AI usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white hover:bg-blue-700 gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Playbook
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Golden Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              The 3 Golden Rules
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setEditingRules(!editingRules)}
            >
              <Edit2 className="h-3 w-3" />
              {editingRules ? 'Done' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {goldenRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                {editingRules ? (
                  <Input
                    value={rule}
                    onChange={(e) => {
                      const updated = [...goldenRules];
                      updated[idx] = e.target.value;
                      setGoldenRules(updated);
                    }}
                    className="flex-1 border-amber-300"
                  />
                ) : (
                  <p className="text-sm font-medium text-amber-900 pt-1">{rule}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Traffic Light */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Data Traffic Light System
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex gap-4 mb-4">
            {(Object.entries(trafficLightLabels) as [DataTrafficLight, string][]).map(
              ([level, label]) => (
                <div key={level} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      level === 'green'
                        ? 'bg-green-500'
                        : level === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              )
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-3 px-3 font-medium text-slate-700">Data Type</th>
                  <th className="py-3 px-3 font-medium text-slate-700">
                    Classification
                  </th>
                  <th className="py-3 px-3 font-medium text-slate-700 text-center">
                    Consumer AI
                  </th>
                  <th className="py-3 px-3 font-medium text-slate-700 text-center">
                    Enterprise AI
                  </th>
                  <th className="py-3 px-3 font-medium text-slate-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {playbook.data_rules.map((rule: PlaybookDataRule, idx: number) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-3 font-medium">{rule.data_type}</td>
                    <td className="py-3 px-3">
                      <Badge className={trafficLightColors[rule.classification]}>
                        {rule.classification.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {rule.consumer_ai ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {rule.enterprise_ai ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-xs max-w-[250px]">
                      {rule.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approved Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5 text-slate-700" />
            Approved Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playbook.tools.map((tool: PlaybookTool, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                  <Badge className={toolStatusColors[tool.status]}>
                    {tool.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mb-3">{tool.data_handling}</p>
                <p className="text-xs text-slate-500 mb-3">
                  <span className="font-medium text-slate-700">Access: </span>
                  {tool.access_method}
                </p>

                {tool.approved_for.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-green-700 mb-1">
                      Approved For:
                    </p>
                    <ul className="space-y-0.5">
                      {tool.approved_for.map((item, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-600 flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tool.not_approved_for.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">
                      Not Approved For:
                    </p>
                    <ul className="space-y-0.5">
                      {tool.not_approved_for.map((item, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-600 flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Approved Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Approved Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {playbook.approved_activities.map((activity, idx) => (
                <li
                  key={idx}
                  className="text-sm text-slate-700 flex items-start gap-2 p-2 rounded bg-green-50"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  {activity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {playbook.prohibited_activities.map((activity, idx) => (
                <li
                  key={idx}
                  className="text-sm text-slate-700 flex items-start gap-2 p-2 rounded bg-red-50"
                >
                  <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  {activity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Requires Approval */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Requires Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {playbook.requires_approval.map((activity, idx) => (
                <li
                  key={idx}
                  className="text-sm text-slate-700 flex items-start gap-2 p-2 rounded bg-yellow-50"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                  {activity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Disclosure Policy */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-700" />
              Disclosure Policy
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
              <Edit2 className="h-3 w-3" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed">
              {playbook.disclosure_policy}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
