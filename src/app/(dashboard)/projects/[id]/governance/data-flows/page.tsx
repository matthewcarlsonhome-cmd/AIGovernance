'use client';

import { useState } from 'react';
import * as React from 'react';
import {
  Network,
  Plus,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldAlert,
  Server,
  GitBranch,
  Users,
  Bot,
  Workflow,
  Info,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
  DataFlowSystem,
  DataFlowRiskPoint,
  VendorAssessment,
  RiskTier,
} from '@/types';

// ---------- Demo Data ----------

const DEMO_SYSTEMS: DataFlowSystem[] = [
  {
    id: 'sys-001',
    project_id: 'proj-001',
    name: 'Source Code Repository',
    type: 'Version Control',
    data_types: ['Proprietary code', 'Config files', 'Documentation', 'Secrets (env files)'],
    ai_integration: true,
    ai_service: 'Claude Code',
    integration_type: 'embedded',
    data_classification: 'confidential',
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-15T14:30:00Z',
  },
  {
    id: 'sys-002',
    project_id: 'proj-001',
    name: 'HR Management System',
    type: 'Enterprise Application',
    data_types: ['Employee PII', 'Salary data', 'Performance reviews', 'SSN / Tax IDs'],
    ai_integration: false,
    ai_service: null,
    integration_type: null,
    data_classification: 'restricted',
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-10T09:00:00Z',
  },
  {
    id: 'sys-003',
    project_id: 'proj-001',
    name: 'Customer CRM',
    type: 'SaaS Application',
    data_types: ['Customer PII', 'Contact info', 'Purchase history', 'Support tickets'],
    ai_integration: true,
    ai_service: 'Claude Code',
    integration_type: 'direct_api',
    data_classification: 'confidential',
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-12T16:45:00Z',
  },
  {
    id: 'sys-004',
    project_id: 'proj-001',
    name: 'AI Code Assistant',
    type: 'Developer Tool',
    data_types: ['Code snippets', 'Prompt context', 'File contents', 'Terminal output'],
    ai_integration: true,
    ai_service: 'Claude Code / GitHub Copilot',
    integration_type: 'embedded',
    data_classification: 'confidential',
    created_at: '2025-06-05T08:00:00Z',
    updated_at: '2025-06-15T11:20:00Z',
  },
  {
    id: 'sys-005',
    project_id: 'proj-001',
    name: 'CI/CD Pipeline',
    type: 'Infrastructure',
    data_types: ['Build artifacts', 'Test results', 'Deployment configs', 'Environment variables'],
    ai_integration: true,
    ai_service: 'Internal LLM',
    integration_type: 'middleware',
    data_classification: 'internal',
    created_at: '2025-06-02T10:00:00Z',
    updated_at: '2025-06-14T13:10:00Z',
  },
];

const DEMO_RISK_POINTS: DataFlowRiskPoint[] = [
  {
    id: 'rp-001',
    project_id: 'proj-001',
    system_id: 'sys-001',
    risk_description: 'Proprietary source code transmitted to external AI provider for code completion and analysis',
    data_type: 'Source code',
    threat: 'Intellectual property exposure via AI context window',
    score: 9.2,
    current_control: 'Zero-retention API agreement with vendor',
    recommended_control: 'DLP scanning on egress, code classification tagging, managed-settings.json disallowed paths',
    status: 'open',
  },
  {
    id: 'rp-002',
    project_id: 'proj-001',
    system_id: 'sys-001',
    risk_description: 'Configuration files containing secrets may be included in AI context during code generation',
    data_type: 'Credentials / Secrets',
    threat: 'Secret exposure in AI prompts leading to credential compromise',
    score: 9.8,
    current_control: '.gitignore and pre-commit secret scanning hooks',
    recommended_control: 'Pre-flight prompt scanning, managed-settings.json file restrictions, vault-based secret management',
    status: 'open',
  },
  {
    id: 'rp-003',
    project_id: 'proj-001',
    system_id: 'sys-003',
    risk_description: 'Customer PII exposed to AI model via API calls during CRM workflow automation',
    data_type: 'Customer PII',
    threat: 'Data leakage of personal information to AI provider',
    score: 8.5,
    current_control: 'API-level DPA agreement in place',
    recommended_control: 'Data masking layer before AI processing, field-level encryption, PII redaction middleware',
    status: 'mitigated',
  },
  {
    id: 'rp-004',
    project_id: 'proj-001',
    system_id: 'sys-004',
    risk_description: 'AI code assistant may generate code that introduces security vulnerabilities or license violations',
    data_type: 'Generated code',
    threat: 'Supply chain risk from AI-generated insecure or non-compliant code',
    score: 6.5,
    current_control: 'Mandatory code review policy for all AI-generated code',
    recommended_control: 'Automated SAST/DAST scanning on AI output, license compliance checker, test coverage gates',
    status: 'mitigated',
  },
  {
    id: 'rp-005',
    project_id: 'proj-001',
    system_id: 'sys-005',
    risk_description: 'Build environment variables and deployment secrets accessible to AI-enhanced pipeline tooling',
    data_type: 'Environment variables',
    threat: 'Infrastructure credential exposure through AI middleware',
    score: 7.1,
    current_control: 'Secrets stored in vault with limited TTL',
    recommended_control: 'Ephemeral secret injection, AI middleware isolation from secret store, audit logging on all access',
    status: 'open',
  },
  {
    id: 'rp-006',
    project_id: 'proj-001',
    system_id: 'sys-005',
    risk_description: 'Test result data and build logs may contain sensitive information when sent to AI for analysis',
    data_type: 'Build logs / Test data',
    threat: 'Indirect data leakage through log and test artifact analysis',
    score: 4.2,
    current_control: 'Log sanitization in place for production logs',
    recommended_control: 'Extend log sanitization to CI/CD outputs, automated PII detection in test fixtures',
    status: 'accepted',
  },
];

const DEMO_VENDORS: VendorAssessment[] = [
  {
    id: 'va-001',
    project_id: 'proj-001',
    vendor_name: 'Anthropic',
    service: 'Claude Code (Enterprise)',
    data_access: ['Source code', 'Documentation', 'Config files', 'Prompt context'],
    risk_rating: 'medium',
    has_dpa: true,
    has_training_optout: true,
    has_deletion_rights: true,
    has_audit_rights: false,
    key_concerns: [
      'No on-premise deployment option currently available',
      'Audit rights not yet negotiated in enterprise agreement',
      'Context window may retain data for session duration',
    ],
  },
  {
    id: 'va-002',
    project_id: 'proj-001',
    vendor_name: 'GitHub',
    service: 'Copilot Business',
    data_access: ['Repository code', 'Commit history', 'Code comments'],
    risk_rating: 'high',
    has_dpa: true,
    has_training_optout: false,
    has_deletion_rights: false,
    has_audit_rights: false,
    key_concerns: [
      'No confirmed training opt-out for business tier',
      'No deletion rights for code snippets used in suggestions',
      'Telemetry data handling and retention unclear',
      'Potential code attribution issues with open-source suggestions',
    ],
  },
  {
    id: 'va-003',
    project_id: 'proj-001',
    vendor_name: 'Internal',
    service: 'Self-Hosted LLM (vLLM + Llama 3)',
    data_access: ['Build logs', 'Test results', 'Internal documentation'],
    risk_rating: 'low',
    has_dpa: true,
    has_training_optout: true,
    has_deletion_rights: true,
    has_audit_rights: true,
    key_concerns: [
      'Requires ongoing infrastructure maintenance and GPU cost management',
    ],
  },
];

// ---------- Helpers ----------

type TabId = 'systems' | 'risks' | 'vendors';

const tierColors: Record<RiskTier, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const tierDotColors: Record<RiskTier, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const classificationColors: Record<DataFlowSystem['data_classification'], string> = {
  public: 'bg-green-100 text-green-800 border-green-200',
  internal: 'bg-blue-100 text-blue-800 border-blue-200',
  confidential: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  restricted: 'bg-red-100 text-red-800 border-red-200',
};

const classificationDescriptions: Record<DataFlowSystem['data_classification'], string> = {
  public: 'Freely shareable, no business impact if disclosed',
  internal: 'For internal use only, minor impact if disclosed',
  confidential: 'Sensitive business data, significant impact if disclosed',
  restricted: 'Highly sensitive (PII, secrets), severe impact if disclosed',
};

const statusColors: Record<DataFlowRiskPoint['status'], string> = {
  open: 'bg-red-100 text-red-800 border-red-200',
  mitigated: 'bg-green-100 text-green-800 border-green-200',
  accepted: 'bg-slate-100 text-slate-700 border-slate-200',
};

const integrationTypeLabels: Record<string, string> = {
  direct_api: 'Direct API',
  embedded: 'Embedded',
  middleware: 'Middleware',
  on_premise: 'On-Premise',
  rag_vector: 'RAG / Vector',
};

function getScoreSeverity(score: number): RiskTier {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function getScoreColor(score: number): string {
  if (score >= 9) return 'bg-red-600 text-white';
  if (score >= 7) return 'bg-orange-500 text-white';
  if (score >= 4) return 'bg-yellow-500 text-white';
  return 'bg-green-500 text-white';
}

function getSystemIcon(type: string): React.ReactNode {
  switch (type) {
    case 'Version Control':
      return <GitBranch className="h-5 w-5 text-slate-500" />;
    case 'Enterprise Application':
      return <Users className="h-5 w-5 text-slate-500" />;
    case 'SaaS Application':
      return <Database className="h-5 w-5 text-slate-500" />;
    case 'Developer Tool':
      return <Bot className="h-5 w-5 text-slate-500" />;
    case 'Infrastructure':
      return <Workflow className="h-5 w-5 text-slate-500" />;
    default:
      return <Server className="h-5 w-5 text-slate-500" />;
  }
}

// ---------- Page Component ----------

export default function DataFlowsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const resolvedParams = React.use(params);
  void resolvedParams;

  const [activeTab, setActiveTab] = useState<TabId>('systems');

  // Summary statistics
  const totalSystems = DEMO_SYSTEMS.length;
  const totalRiskPoints = DEMO_RISK_POINTS.length;
  const highRiskItems = DEMO_RISK_POINTS.filter(
    (r) => getScoreSeverity(r.score) === 'critical' || getScoreSeverity(r.score) === 'high'
  ).length;
  const vendorCount = DEMO_VENDORS.length;
  const openRisks = DEMO_RISK_POINTS.filter((r) => r.status === 'open').length;
  const aiIntegratedSystems = DEMO_SYSTEMS.filter((s) => s.ai_integration).length;

  // Group risk points by severity for the Risk Points tab
  const risksBySeverity: Record<RiskTier, DataFlowRiskPoint[]> = {
    critical: DEMO_RISK_POINTS.filter((r) => getScoreSeverity(r.score) === 'critical'),
    high: DEMO_RISK_POINTS.filter((r) => getScoreSeverity(r.score) === 'high'),
    medium: DEMO_RISK_POINTS.filter((r) => getScoreSeverity(r.score) === 'medium'),
    low: DEMO_RISK_POINTS.filter((r) => getScoreSeverity(r.score) === 'low'),
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'systems', label: 'Systems', icon: <Database className="h-4 w-4" /> },
    { id: 'risks', label: 'Risk Points', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'vendors', label: 'Vendors', icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Network className="h-6 w-6 text-cyan-600" />
            Data Flow Risk Mapper
          </h1>
          <p className="text-slate-500 mt-1">
            Map data flows, AI integration points, and associated risks across your systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            Add System
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-50">
                <Database className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalSystems}</p>
                <p className="text-xs text-slate-500">Total Systems</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{aiIntegratedSystems}</p>
                <p className="text-xs text-slate-500">AI-Integrated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalRiskPoints}</p>
                <p className="text-xs text-slate-500">Risk Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{highRiskItems}</p>
                <p className="text-xs text-slate-500">High/Critical Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <XCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{openRisks}</p>
                <p className="text-xs text-slate-500">Open Risks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{vendorCount}</p>
                <p className="text-xs text-slate-500">Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== Systems Tab ========== */}
      {activeTab === 'systems' && (
        <div className="space-y-6">
          {/* Data Flow Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-600" />
                Data Flow Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 px-3 font-medium text-slate-700">System</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Type</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Data Types</th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">AI Integration</th>
                      <th className="py-3 px-3 font-medium text-slate-700">AI Service</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Integration</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_SYSTEMS.map((system) => (
                      <tr
                        key={system.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {getSystemIcon(system.type)}
                            <span className="font-medium text-slate-900">{system.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{system.type}</td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {system.data_types.map((dt, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs border-slate-300 text-slate-600"
                              >
                                {dt}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {system.ai_integration ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs">
                          {system.ai_service ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              {system.ai_service}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs">
                          {system.integration_type
                            ? integrationTypeLabels[system.integration_type] ?? system.integration_type
                            : <span className="text-slate-400">N/A</span>}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={classificationColors[system.data_classification]}>
                            {system.data_classification}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Data Classification Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-500" />
                Data Classification Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(
                  ['public', 'internal', 'confidential', 'restricted'] as const
                ).map((level) => {
                  const colorMap: Record<string, { bg: string; border: string; dot: string }> = {
                    public: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
                    internal: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
                    confidential: { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
                    restricted: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
                  };
                  const colors = colorMap[level];
                  return (
                    <div
                      key={level}
                      className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`h-3 w-3 rounded-full ${colors.dot}`} />
                        <span className="text-sm font-semibold capitalize text-slate-900">
                          {level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {classificationDescriptions[level]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========== Risk Points Tab ========== */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          {/* Risk score distribution bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700 shrink-0">
                  Risk Distribution:
                </span>
                <div className="flex-1 flex h-3 rounded-full overflow-hidden gap-0.5">
                  {risksBySeverity.critical.length > 0 && (
                    <div
                      className="bg-red-500 rounded-l-full"
                      style={{
                        width: `${(risksBySeverity.critical.length / totalRiskPoints) * 100}%`,
                      }}
                      title={`Critical: ${risksBySeverity.critical.length}`}
                    />
                  )}
                  {risksBySeverity.high.length > 0 && (
                    <div
                      className="bg-orange-500"
                      style={{
                        width: `${(risksBySeverity.high.length / totalRiskPoints) * 100}%`,
                      }}
                      title={`High: ${risksBySeverity.high.length}`}
                    />
                  )}
                  {risksBySeverity.medium.length > 0 && (
                    <div
                      className="bg-yellow-500"
                      style={{
                        width: `${(risksBySeverity.medium.length / totalRiskPoints) * 100}%`,
                      }}
                      title={`Medium: ${risksBySeverity.medium.length}`}
                    />
                  )}
                  {risksBySeverity.low.length > 0 && (
                    <div
                      className="bg-green-500 rounded-r-full"
                      style={{
                        width: `${(risksBySeverity.low.length / totalRiskPoints) * 100}%`,
                      }}
                      title={`Low: ${risksBySeverity.low.length}`}
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                  {(['critical', 'high', 'medium', 'low'] as RiskTier[]).map((tier) => (
                    <span key={tier} className="flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${tierDotColors[tier]}`} />
                      {risksBySeverity[tier].length} {tier}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grouped risk point cards */}
          {(['critical', 'high', 'medium', 'low'] as RiskTier[]).map((severity) => {
            const risks = risksBySeverity[severity];
            if (risks.length === 0) return null;
            return (
              <Card key={severity}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        severity === 'critical'
                          ? 'text-red-600'
                          : severity === 'high'
                          ? 'text-orange-500'
                          : severity === 'medium'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    />
                    <CardTitle className="text-lg">
                      {severity.charAt(0).toUpperCase() + severity.slice(1)} Risk Points
                    </CardTitle>
                    <Badge className={tierColors[severity]}>{risks.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {risks.map((risk) => {
                      const system = DEMO_SYSTEMS.find((s) => s.id === risk.system_id);
                      return (
                        <div
                          key={risk.id}
                          className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getScoreColor(risk.score)}>
                                {risk.score.toFixed(1)}
                              </Badge>
                              <span className="text-xs font-medium text-slate-500">
                                {system?.name ?? 'Unknown System'}
                              </span>
                            </div>
                            <Badge className={statusColors[risk.status]}>
                              {risk.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-1">
                            {risk.risk_description}
                          </p>
                          <p className="text-xs text-slate-500 mb-3">
                            <span className="font-semibold">Threat:</span> {risk.threat}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="p-2 rounded bg-slate-50">
                              <span className="font-medium text-slate-500 block mb-0.5">
                                Data Type
                              </span>
                              <span className="text-slate-700">{risk.data_type}</span>
                            </div>
                            <div className="p-2 rounded bg-slate-50">
                              <span className="font-medium text-slate-500 block mb-0.5">
                                Current Control
                              </span>
                              <span className="text-slate-700">
                                {risk.current_control ?? 'None'}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-blue-50">
                              <span className="font-medium text-blue-700 block mb-0.5">
                                Recommended Control
                              </span>
                              <span className="text-blue-600">
                                {risk.recommended_control}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========== Vendors Tab ========== */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {DEMO_VENDORS.map((vendor) => {
              const complianceChecks = [
                { label: 'Data Processing Agreement (DPA)', value: vendor.has_dpa },
                { label: 'Training Opt-Out', value: vendor.has_training_optout },
                { label: 'Deletion Rights', value: vendor.has_deletion_rights },
                { label: 'Audit Rights', value: vendor.has_audit_rights },
              ];
              const passCount = complianceChecks.filter((c) => c.value).length;

              return (
                <Card key={vendor.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-slate-900">
                          {vendor.vendor_name}
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">{vendor.service}</p>
                      </div>
                      <Badge className={tierColors[vendor.risk_rating]}>
                        {vendor.risk_rating} risk
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    {/* Data Access */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Data Access
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {vendor.data_access.map((item, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs border-slate-300 text-slate-600"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Compliance Checks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Compliance
                        </p>
                        <span className="text-xs text-slate-500">
                          {passCount}/{complianceChecks.length} passed
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {complianceChecks.map((check, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            {check.value ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                            )}
                            <span
                              className={
                                check.value ? 'text-slate-700' : 'text-slate-500'
                              }
                            >
                              {check.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compliance progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          passCount === complianceChecks.length
                            ? 'bg-green-500'
                            : passCount >= complianceChecks.length / 2
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${(passCount / complianceChecks.length) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Key Concerns */}
                    {vendor.key_concerns.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Key Concerns
                        </p>
                        <ul className="space-y-1.5">
                          {vendor.key_concerns.map((concern, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-slate-600"
                            >
                              <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0 mt-0.5" />
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {vendor.key_concerns.length === 0 && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        No outstanding concerns
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Vendor Comparison Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Vendor Comparison Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 px-3 font-medium text-slate-700">Vendor</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Service</th>
                      <th className="py-3 px-3 font-medium text-slate-700">Risk Rating</th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">DPA</th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">Training Opt-Out</th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">Deletion</th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">Audit</th>
                      <th className="py-3 px-3 font-medium text-slate-700 text-center">Concerns</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_VENDORS.map((vendor) => (
                      <tr
                        key={vendor.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {vendor.vendor_name}
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs">
                          {vendor.service}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={tierColors[vendor.risk_rating]}>
                            {vendor.risk_rating}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {vendor.has_dpa ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {vendor.has_training_optout ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {vendor.has_deletion_rights ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {vendor.has_audit_rights ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {vendor.key_concerns.length > 0 ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              {vendor.key_concerns.length}
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              0
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
