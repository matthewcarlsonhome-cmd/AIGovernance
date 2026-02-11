'use client';

import { useState } from 'react';
import * as React from 'react';
import {
  Shield,
  Eye,
  Brain,
  Users,
  Edit2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
  EthicsReview,
  BiasAssessment,
  FairnessMetric,
  PrivacyImpactItem,
  RiskTier,
  ComplianceStatus,
} from '@/types';

// ---------- Demo Data ----------

const DEMO_ETHICS_REVIEW: EthicsReview = {
  id: 'eth-001',
  project_id: 'proj-001',
  system_name: 'AI Code Assistant (Claude Code)',
  system_purpose:
    'Automated code generation, review assistance, and developer productivity enhancement for the engineering organization.',
  risk_classification: 'high',
  bias_assessments: [
    {
      type: 'historical',
      risk_level: 'medium',
      evidence:
        'Training data may reflect historical biases in open-source codebases, favoring patterns from majority contributor demographics.',
      mitigation:
        'Periodic output audits, diverse code review panels, bias-detection tooling on generated code.',
    },
    {
      type: 'representation',
      risk_level: 'high',
      evidence:
        'Underrepresentation of domain-specific patterns for regulated industries (healthcare, finance) in training data.',
      mitigation:
        'Fine-tuning with industry-specific datasets, mandatory human review for regulated code paths.',
    },
    {
      type: 'measurement',
      risk_level: 'low',
      evidence:
        'Productivity metrics may overweight speed vs. code quality, incentivizing quantity over maintainability.',
      mitigation:
        'Balanced KPI framework including quality metrics (defect rate, test coverage, code complexity).',
    },
    {
      type: 'aggregation',
      risk_level: 'medium',
      evidence:
        'Model treats all code generation requests uniformly regardless of security context or data sensitivity.',
      mitigation:
        'Context-aware prompting, data classification tagging, sensitivity-based routing rules.',
    },
    {
      type: 'evaluation',
      risk_level: 'low',
      evidence:
        'Evaluation benchmarks may not capture edge cases in proprietary frameworks or legacy systems.',
      mitigation:
        'Custom evaluation suite aligned with internal tech stack, quarterly benchmark updates.',
    },
  ],
  fairness_metrics: [
    {
      type: 'demographic_parity',
      target: 'Equal suggestion quality across all developer experience levels',
      current: '82% parity score',
      status: 'partial',
    },
    {
      type: 'equalized_odds',
      target: 'Error rate consistent regardless of programming language',
      current: '91% consistency',
      status: 'compliant',
    },
    {
      type: 'predictive_parity',
      target: 'Code quality predictions equally accurate across teams',
      current: null,
      status: 'needs_review',
    },
    {
      type: 'individual_fairness',
      target: 'Similar inputs produce similar quality outputs',
      current: '88% similarity score',
      status: 'partial',
    },
  ],
  privacy_items: [
    {
      id: 'pi-001',
      data_type: 'Source Code',
      purpose: 'Code generation and completion',
      legal_basis: 'Legitimate interest with DPA',
      retention: '30 days for context, then deleted',
      access: 'AI provider API only',
      risk_level: 'high',
    },
    {
      id: 'pi-002',
      data_type: 'Developer Prompts',
      purpose: 'Context for AI responses',
      legal_basis: 'Consent via AUP acknowledgment',
      retention: 'Session-only, no persistent storage',
      access: 'Encrypted in transit',
      risk_level: 'medium',
    },
    {
      id: 'pi-003',
      data_type: 'Usage Telemetry',
      purpose: 'Productivity measurement',
      legal_basis: 'Legitimate interest',
      retention: '12 months aggregated',
      access: 'Internal analytics team',
      risk_level: 'low',
    },
    {
      id: 'pi-004',
      data_type: 'Error Logs',
      purpose: 'Debugging and quality assurance',
      legal_basis: 'Legitimate interest',
      retention: '90 days',
      access: 'Engineering and support teams',
      risk_level: 'low',
    },
  ],
  transparency_level: 'interpretable',
  human_oversight_controls: [
    'All AI-generated code requires human review before merge',
    'Security-critical paths require two independent reviewers',
    'Automated SAST/DAST scanning on all AI-assisted commits',
    'Weekly audit of AI usage patterns and output quality',
    'Kill switch to disable AI tools within 15 minutes',
    'Escalation path for AI-generated code concerns',
  ],
  recommendations: [
    'Implement quarterly bias audits with diverse review panels',
    'Establish AI output quality baselines per team before scaling',
    'Create feedback loop for developers to flag biased or low-quality suggestions',
    'Document all AI decision points in architecture decision records',
    'Conduct annual third-party ethics review of AI integration practices',
  ],
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-02-01T14:30:00Z',
};

// ---------- Helpers ----------

const tierColors: Record<RiskTier, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const complianceStatusColors: Record<ComplianceStatus, string> = {
  compliant: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  non_compliant: 'bg-red-100 text-red-800',
  needs_review: 'bg-blue-100 text-blue-800',
  not_applicable: 'bg-slate-100 text-slate-600',
};

const complianceStatusLabels: Record<ComplianceStatus, string> = {
  compliant: 'Compliant',
  partial: 'Partial',
  non_compliant: 'Non-Compliant',
  needs_review: 'Needs Review',
  not_applicable: 'N/A',
};

const biasTypeLabels: Record<BiasAssessment['type'], string> = {
  historical: 'Historical Bias',
  representation: 'Representation Bias',
  measurement: 'Measurement Bias',
  aggregation: 'Aggregation Bias',
  evaluation: 'Evaluation Bias',
};

const fairnessTypeLabels: Record<FairnessMetric['type'], string> = {
  demographic_parity: 'Demographic Parity',
  equalized_odds: 'Equalized Odds',
  predictive_parity: 'Predictive Parity',
  individual_fairness: 'Individual Fairness',
};

const transparencyConfig: Record<
  EthicsReview['transparency_level'],
  { label: string; color: string; description: string }
> = {
  black_box: {
    label: 'Black Box',
    color: 'bg-red-600 text-white',
    description:
      'No visibility into decision-making process. Outputs cannot be explained or audited.',
  },
  interpretable: {
    label: 'Interpretable',
    color: 'bg-yellow-500 text-white',
    description:
      'General reasoning can be understood. Key factors influencing outputs are identifiable.',
  },
  explainable: {
    label: 'Explainable',
    color: 'bg-green-600 text-white',
    description:
      'Full transparency into decision process. Every output can be traced and justified.',
  },
};

// ---------- Page Component ----------

export default function EthicsReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  void resolvedParams; // used for routing context

  const [activeSection, setActiveSection] = useState<string>('overview');
  const review = DEMO_ETHICS_REVIEW;
  const transparencyInfo = transparencyConfig[review.transparency_level];

  const sections = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'bias', label: 'Bias Assessment', icon: Brain },
    { id: 'fairness', label: 'Fairness Metrics', icon: Eye },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'transparency', label: 'Transparency', icon: Eye },
    { id: 'oversight', label: 'Oversight', icon: Users },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            AI Ethics Review
          </h1>
          <p className="text-slate-500 mt-1">
            Comprehensive ethical assessment of AI system deployment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Review
          </Button>
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700 gap-2">
            <Sparkles className="h-4 w-4" />
            Generate AI Review
          </Button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200 pb-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-md transition-colors ${
                activeSection === section.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* System Overview */}
      {activeSection === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    System Name
                  </p>
                  <p className="text-sm font-semibold mt-1">{review.system_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Purpose
                  </p>
                  <p className="text-sm text-slate-700 mt-1">{review.system_purpose}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Risk Classification
                  </p>
                  <div className="mt-1">
                    <Badge className={tierColors[review.risk_classification]}>
                      {review.risk_classification.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Transparency Level
                  </p>
                  <div className="mt-1">
                    <Badge className={transparencyInfo.color}>
                      {transparencyInfo.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Last Updated
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    {new Date(review.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">
                  {review.bias_assessments.length}
                </p>
                <p className="text-xs text-slate-500">Bias Types Assessed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">
                  {review.fairness_metrics.filter((m) => m.status === 'compliant').length}/
                  {review.fairness_metrics.length}
                </p>
                <p className="text-xs text-slate-500">Fairness Metrics Met</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">
                  {review.privacy_items.length}
                </p>
                <p className="text-xs text-slate-500">Privacy Items</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">
                  {review.human_oversight_controls.length}
                </p>
                <p className="text-xs text-slate-500">Oversight Controls</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bias Assessment */}
      {activeSection === 'bias' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Bias Assessment
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-3 font-medium text-slate-700">Bias Type</th>
                    <th className="py-3 px-3 font-medium text-slate-700">Risk Level</th>
                    <th className="py-3 px-3 font-medium text-slate-700">Evidence</th>
                    <th className="py-3 px-3 font-medium text-slate-700">Mitigation</th>
                  </tr>
                </thead>
                <tbody>
                  {review.bias_assessments.map((bias, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-3 font-medium">
                        {biasTypeLabels[bias.type]}
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={tierColors[bias.risk_level]}>
                          {bias.risk_level}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[300px]">
                        {bias.evidence}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[300px]">
                        {bias.mitigation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fairness Metrics */}
      {activeSection === 'fairness' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Fairness Metrics
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-3 font-medium text-slate-700">
                      Metric Type
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700">Target</th>
                    <th className="py-3 px-3 font-medium text-slate-700">Current</th>
                    <th className="py-3 px-3 font-medium text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {review.fairness_metrics.map((metric, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-3 font-medium">
                        {fairnessTypeLabels[metric.type]}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{metric.target}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {metric.current ?? (
                          <span className="italic text-slate-400">Not measured</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={complianceStatusColors[metric.status]}>
                          {complianceStatusLabels[metric.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Assessment */}
      {activeSection === 'privacy' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-600" />
                Privacy Assessment
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-3 font-medium text-slate-700">Data Type</th>
                    <th className="py-3 px-3 font-medium text-slate-700">Purpose</th>
                    <th className="py-3 px-3 font-medium text-slate-700">
                      Legal Basis
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700">Retention</th>
                    <th className="py-3 px-3 font-medium text-slate-700">Access</th>
                    <th className="py-3 px-3 font-medium text-slate-700">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {review.privacy_items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-3 font-medium">{item.data_type}</td>
                      <td className="py-3 px-3 text-slate-600">{item.purpose}</td>
                      <td className="py-3 px-3 text-slate-600">{item.legal_basis}</td>
                      <td className="py-3 px-3 text-slate-600">{item.retention}</td>
                      <td className="py-3 px-3 text-slate-600">{item.access}</td>
                      <td className="py-3 px-3">
                        <Badge className={tierColors[item.risk_level]}>
                          {item.risk_level}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Privacy Checklist */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Privacy Compliance Checklist
              </h3>
              <div className="space-y-2">
                {[
                  {
                    label: 'Data Minimization',
                    desc: 'Only essential data is collected and processed',
                    done: true,
                  },
                  {
                    label: 'Consent Management',
                    desc: 'User consent obtained via AUP acknowledgment',
                    done: true,
                  },
                  {
                    label: 'Data Protection Impact Assessment',
                    desc: 'DPIA completed for AI data processing',
                    done: true,
                  },
                  {
                    label: 'Right to Erasure',
                    desc: 'Process in place to delete data on request',
                    done: false,
                  },
                  {
                    label: 'Cross-border Transfer Safeguards',
                    desc: 'SCCs or adequacy decisions in place',
                    done: true,
                  },
                  {
                    label: 'Breach Notification Plan',
                    desc: 'AI-specific incident response procedures documented',
                    done: false,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transparency */}
      {activeSection === 'transparency' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-600" />
              Transparency Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              {(
                Object.entries(transparencyConfig) as [
                  EthicsReview['transparency_level'],
                  (typeof transparencyConfig)[EthicsReview['transparency_level']],
                ][]
              ).map(([level, config]) => (
                <div
                  key={level}
                  className={`flex-1 p-4 rounded-lg border-2 ${
                    level === review.transparency_level
                      ? 'border-slate-900 shadow-md'
                      : 'border-slate-200 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={config.color}>{config.label}</Badge>
                    {level === review.transparency_level && (
                      <Badge className="bg-slate-900 text-white">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{config.description}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Interpretable Level Assessment
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    The current system provides general visibility into its reasoning
                    process. To achieve &quot;Explainable&quot; status, implement detailed
                    output attribution, confidence scoring, and decision audit trails.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Human Oversight Controls */}
      {activeSection === 'oversight' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                Human Oversight Controls
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {review.human_oversight_controls.map((control, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-100 text-teal-700 text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-700">{control}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {activeSection === 'recommendations' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Recommendations
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {review.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg bg-indigo-50 border border-indigo-100"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-200 text-indigo-800 text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-700">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
