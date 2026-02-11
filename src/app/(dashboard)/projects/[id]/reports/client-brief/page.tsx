'use client';

import { useState } from 'react';
import * as React from 'react';
import {
  Briefcase,
  Shield,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Users,
  HelpCircle,
  Eye,
  Download,
  Sparkles,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileText,
  Building2,
  Gauge,
  Target,
  Scale,
  Lock,
  Code2,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
  ClientBrief,
  ObjectionScript,
  TalkingPoint,
  RiskPosture,
  Industry,
} from '@/types';

// ---------- Constants ----------

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'financial_services', label: 'Financial Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'government', label: 'Government' },
  { value: 'technology', label: 'Technology' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const RISK_POSTURES: { value: RiskPosture; label: string; description: string }[] = [
  {
    value: 'conservative',
    label: 'Conservative',
    description: 'Maximum guardrails, phased rollout, extensive testing before any production use. Best for regulated industries.',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Balanced approach with strong governance and measured adoption. Suitable for most enterprises.',
  },
  {
    value: 'progressive',
    label: 'Progressive',
    description: 'Accelerated adoption with streamlined governance. For organizations with mature tech practices.',
  },
];

type TabId = 'overview' | 'objections' | 'talking_points' | 'faq' | 'transparency';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <FileText className="h-4 w-4" /> },
  { id: 'objections', label: 'Objection Handling', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'talking_points', label: 'Talking Points', icon: <Users className="h-4 w-4" /> },
  { id: 'faq', label: 'FAQ', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'transparency', label: 'Transparency', icon: <Eye className="h-4 w-4" /> },
];

// ---------- Demo Data ----------

const DEMO_BRIEF: ClientBrief = {
  id: 'cb-001',
  project_id: 'proj-001',
  client_industry: 'technology',
  risk_posture: 'moderate',
  executive_summary:
    'Our organization is positioned to adopt AI coding agents as a strategic capability accelerator. Following a comprehensive feasibility assessment scoring 78/100, we have identified a clear path to implementation that balances innovation velocity with enterprise governance requirements. The proposed phased rollout begins with a controlled sandbox environment, advances through a structured proof-of-concept with measurable success criteria, and culminates in a governed production deployment. Our analysis projects a 25-40% improvement in developer productivity within the first six months, with a projected ROI payback period of 4.2 months. All implementation activities are governed by a three-gate review process ensuring compliance, security, and business alignment at every stage.',
  governance_framework_summary:
    'The governance framework encompasses five pillars: (1) Acceptable Use Policy defining permitted and prohibited AI interactions, (2) Data Classification Protocol ensuring sensitive data never enters AI systems, (3) Three-Gate Review Board providing executive oversight at sandbox, pilot, and production stages, (4) Incident Response Addendum covering AI-specific failure modes, and (5) Continuous Monitoring Dashboard tracking model performance, cost, and compliance metrics. All policies have been mapped to SOC 2 Type II and GDPR requirements.',
  risk_mitigation_table: [
    {
      risk: 'Data leakage through AI model prompts',
      mitigation: 'Enterprise API with zero-retention policy, DLP rules on all AI tool inputs, sandbox network isolation',
      status: 'mitigated',
    },
    {
      risk: 'Intellectual property contamination',
      mitigation: 'Managed settings restricting code generation scope, IP audit trail logging, license compliance scanning',
      status: 'mitigated',
    },
    {
      risk: 'Over-reliance on AI-generated code',
      mitigation: 'Mandatory human code review policy, AI-assisted PR flagging, quality metrics baseline comparison',
      status: 'in_progress',
    },
    {
      risk: 'Regulatory non-compliance (SOC 2, GDPR)',
      mitigation: 'Compliance mapping to 42 controls, evidence collection automation, quarterly audit schedule',
      status: 'mitigated',
    },
    {
      risk: 'Shadow AI tool adoption',
      mitigation: 'Network-level blocking of consumer AI tools, approved tool registry, employee awareness training',
      status: 'in_progress',
    },
    {
      risk: 'Cost overrun from unmonitored API usage',
      mitigation: 'Per-team token budgets, real-time usage dashboards, automatic throttling at 80% threshold',
      status: 'planned',
    },
  ],
  objection_scripts: [
    {
      objection: 'AI is too risky for our organization',
      acknowledge:
        'That concern is completely valid. AI adoption without proper governance has led to well-documented incidents at other organizations, and the risks are real.',
      counter:
        'However, the risk of not adopting AI is equally significant. Our competitors are already gaining 30-40% productivity advantages. Our approach mitigates risk through a three-gate governance framework, sandbox isolation, and measurable success criteria before any production deployment.',
      evidence:
        'McKinsey reports that 72% of organizations have adopted AI in at least one business function as of 2024. Organizations with structured governance frameworks report 3x fewer AI-related incidents than those with ad-hoc adoption. Our feasibility score of 78/100 confirms organizational readiness.',
    },
    {
      objection: 'We cannot afford this investment right now',
      acknowledge:
        'Budget constraints are a legitimate consideration, especially with competing priorities for technology investment.',
      counter:
        'The implementation is designed for rapid payback. Our ROI model shows a 4.2-month payback period with conservative estimates. The phased approach means initial investment is limited to sandbox setup and a small pilot team, with expansion only after measurable results are demonstrated.',
      evidence:
        'Our detailed ROI analysis projects annual savings of $480,000 for a 15-person engineering team, against a total first-year cost of $165,000 including licenses, infrastructure, and training. The three-year NPV is $1.2M at a 10% discount rate.',
    },
    {
      objection: 'Our data is not ready for AI',
      acknowledge:
        'Data readiness is indeed a critical prerequisite, and many AI initiatives have struggled because of insufficient data preparation.',
      counter:
        'AI coding agents like Claude Code and Codex operate primarily on code and documentation, not on traditional enterprise data. The data readiness requirements are fundamentally different from ML model training. Our sandbox approach isolates AI interactions from sensitive data entirely.',
      evidence:
        'Our data classification audit identified zero restricted-tier data flows in the proposed AI coding workflow. The sandbox environment operates on a separate VPC with DLP rules preventing any confidential data ingress. 94% of the AI interaction involves code generation and review, not data processing.',
    },
    {
      objection: 'Legal and compliance concerns are too complex',
      acknowledge:
        'The regulatory landscape for AI is evolving rapidly, and legal uncertainty is a genuine concern for organizations in regulated industries.',
      counter:
        'We have proactively mapped our implementation to existing compliance frameworks rather than waiting for AI-specific regulation. Our Acceptable Use Policy, data classification rules, and audit trail meet current SOC 2, GDPR, and emerging AI governance standards.',
      evidence:
        'Our compliance mapping covers 42 controls across SOC 2 Type II and GDPR. The enterprise API agreement includes a Data Processing Addendum with zero-retention guarantees. Our legal team has reviewed the vendor contract and confirmed alignment with our IP protection requirements.',
    },
    {
      objection: 'Our developers will resist this change',
      acknowledge:
        'Change resistance is natural, especially when people feel their expertise or job security might be threatened by AI tools.',
      counter:
        'Our change management plan positions AI as an amplifier of developer capabilities, not a replacement. The pilot program specifically involves volunteer early adopters who become internal champions. Developers who have used AI coding assistants report higher job satisfaction due to reduced time on repetitive tasks.',
      evidence:
        'Stack Overflow 2024 survey shows 76% of developers are already using or planning to use AI coding tools. Our internal survey of the pilot team shows 82% enthusiasm for AI-assisted development. The change management plan includes role-specific training and a dedicated feedback channel.',
    },
  ],
  talking_points: [
    {
      role: 'c_suite',
      points: [
        'AI coding agents represent a strategic competitive advantage with measurable ROI within one quarter.',
        'Our three-gate governance framework ensures executive visibility and control at every stage.',
        'The phased approach limits initial investment while providing clear go/no-go decision points.',
        'Industry peers are already achieving 25-40% productivity gains through structured AI adoption.',
      ],
      concerns: [
        'Reputational risk from AI incidents',
        'Regulatory compliance in evolving landscape',
        'Return on investment timeline and certainty',
      ],
      benefits: [
        '4.2-month projected ROI payback period',
        'Structured governance reducing liability exposure',
        'Competitive positioning through faster delivery',
      ],
    },
    {
      role: 'legal',
      points: [
        'All AI interactions governed by enterprise API agreements with zero-retention data processing addendum.',
        'Acceptable Use Policy clearly delineates permitted and prohibited AI activities.',
        'IP protection ensured through managed settings, audit trails, and license compliance scanning.',
        'Compliance mapping covers 42 controls across SOC 2 Type II and GDPR frameworks.',
      ],
      concerns: [
        'Intellectual property ownership of AI-generated code',
        'Data privacy and cross-border data transfer',
        'Evolving AI-specific regulations',
      ],
      benefits: [
        'Proactive compliance posture ahead of regulation',
        'Clear audit trail for all AI interactions',
        'Vendor agreements with explicit liability provisions',
      ],
    },
    {
      role: 'it',
      points: [
        'Sandbox environment runs on isolated VPC with full network segmentation.',
        'DLP rules prevent sensitive data ingress to AI tool environments.',
        'Infrastructure-as-code deployment ensures reproducible and auditable environments.',
        'Real-time monitoring dashboard tracks usage, performance, and security events.',
      ],
      concerns: [
        'Network security and data exfiltration risks',
        'Infrastructure cost management',
        'Integration with existing CI/CD pipelines',
      ],
      benefits: [
        'Reduced manual infrastructure configuration through AI assistance',
        'Automated security scanning of AI-generated code',
        'Centralized management of AI tool access and permissions',
      ],
    },
    {
      role: 'security',
      points: [
        'Zero-trust architecture applied to all AI tool access with SSO and MFA.',
        'All AI interactions logged and available for security audit within 24 hours.',
        'Automated vulnerability scanning of all AI-generated code before merge.',
        'Incident response addendum covers AI-specific failure modes and escalation procedures.',
      ],
      concerns: [
        'Prompt injection and adversarial attacks',
        'Supply chain risks from AI-generated dependencies',
        'Data leakage through model prompts',
      ],
      benefits: [
        'Enhanced code security through automated review',
        'Comprehensive audit trail exceeding current manual processes',
        'Proactive threat detection through AI interaction monitoring',
      ],
    },
    {
      role: 'engineering',
      points: [
        'AI coding agents handle boilerplate, test generation, and documentation, freeing time for architecture and design.',
        'Tool comparison data shows Claude Code excelling at complex refactoring and Codex at rapid prototyping.',
        'Pilot metrics demonstrate 35% velocity improvement with no degradation in code quality scores.',
        'Developer autonomy preserved: AI assists but humans make all commit and merge decisions.',
      ],
      concerns: [
        'Code quality and maintainability of AI output',
        'Learning curve and workflow disruption',
        'Tool reliability and availability',
      ],
      benefits: [
        '35% projected velocity improvement',
        'Reduced time on repetitive coding tasks',
        'AI-assisted code review and documentation',
      ],
    },
    {
      role: 'hr',
      points: [
        'AI adoption is positioned as skill enhancement, not workforce reduction.',
        'Training program includes role-specific modules with hands-on workshops.',
        'Change management plan addresses concerns proactively with transparent communication.',
        'AI literacy becomes a career development opportunity across all technical roles.',
      ],
      concerns: [
        'Employee anxiety about job displacement',
        'Training resource requirements',
        'Performance evaluation fairness with AI tools',
      ],
      benefits: [
        'Enhanced employee value proposition for recruitment',
        'Structured upskilling program for existing staff',
        'Reduced burnout through automation of tedious tasks',
      ],
    },
  ],
  faq_items: [
    {
      question: 'What AI coding tools are we evaluating?',
      answer:
        'We are evaluating Claude Code (Anthropic) and OpenAI Codex as the primary candidates. Both operate through enterprise API agreements with zero-retention data policies. The proof-of-concept phase includes a head-to-head comparison across code quality, velocity improvement, and developer satisfaction metrics.',
    },
    {
      question: 'Will AI-generated code be used in production?',
      answer:
        'Yes, but only after passing through our standard code review process plus additional AI-specific quality gates. All AI-generated code goes through the same pull request review, automated testing, and security scanning as human-written code. AI-generated code is flagged in commit metadata for traceability.',
    },
    {
      question: 'How do we prevent sensitive data from reaching AI models?',
      answer:
        'Three layers of protection: (1) Network-level DLP rules block sensitive data patterns from leaving the sandbox, (2) Managed AI tool settings restrict file access and context scope, (3) Data classification training ensures developers understand what can and cannot be shared with AI tools. Additionally, the enterprise API agreement guarantees zero data retention.',
    },
    {
      question: 'Who owns the intellectual property of AI-generated code?',
      answer:
        'Under our enterprise agreements, all code generated through our AI tools is owned by our organization. The vendors explicitly disclaim any IP rights to outputs generated through enterprise API usage. Our legal team has reviewed and confirmed these provisions in the vendor contracts.',
    },
    {
      question: 'What happens if the AI generates buggy or insecure code?',
      answer:
        'AI-generated code is treated identically to human-written code in our quality assurance pipeline. It must pass automated unit tests, integration tests, static analysis, and security scanning before merge. Our pilot data shows AI-generated code has a comparable defect rate to human-written code (2.1% vs 2.3%), with security vulnerabilities caught by existing SAST/DAST tooling.',
    },
    {
      question: 'How much will this cost?',
      answer:
        'The total first-year investment is projected at $165,000, covering enterprise licenses ($72,000), sandbox infrastructure ($48,000), training and change management ($30,000), and implementation support ($15,000). The projected annual productivity savings of $480,000 yield a 4.2-month payback period and a three-year NPV of $1.2M.',
    },
    {
      question: 'What is the implementation timeline?',
      answer:
        'The implementation follows a 16-week phased approach: Weeks 1-4 for discovery and governance setup, Weeks 5-8 for sandbox configuration and validation, Weeks 9-14 for the proof-of-concept with a 5-person pilot team, and Weeks 15-16 for evaluation and go/no-go decision. Production rollout, if approved, follows a separate 8-week expansion plan.',
    },
    {
      question: 'Can we roll this back if it does not work?',
      answer:
        'Absolutely. The three-gate review process includes explicit go/no-go decision points at sandbox, pilot, and production stages. Each gate has defined success criteria that must be met before proceeding. The sandbox and pilot environments are fully isolated, so discontinuation has zero impact on existing development workflows.',
    },
    {
      question: 'How will developer performance be measured during the pilot?',
      answer:
        'We use a balanced scorecard approach: velocity (story points per sprint), code quality (defect rate, test coverage), developer experience (satisfaction surveys, workflow friction scores), and business impact (cycle time, deployment frequency). All metrics compare AI-assisted vs. baseline periods for the same team, eliminating selection bias.',
    },
    {
      question: 'What compliance frameworks does this satisfy?',
      answer:
        'Our implementation has been mapped to SOC 2 Type II (42 controls), GDPR data processing requirements, and emerging NIST AI Risk Management Framework guidelines. For industry-specific requirements, the governance framework is extensible to HIPAA, PCI-DSS, and FedRAMP with additional configuration modules available.',
    },
  ],
  transparency_statement:
    'Our organization is committed to the responsible and transparent use of artificial intelligence in our software development processes. We employ AI coding assistants as productivity tools under strict governance controls, not as autonomous decision-makers. All AI-generated code undergoes the same rigorous quality assurance process as human-written code, including peer review, automated testing, and security scanning. Our AI usage is governed by a comprehensive Acceptable Use Policy, data classification rules, and a three-gate review framework that ensures executive oversight at every stage. We maintain complete audit trails of all AI interactions and make our governance documentation available to stakeholders, auditors, and regulators upon request. We believe that transparency about AI usage builds trust with our clients, partners, and employees, and we are committed to updating our practices as industry standards and regulations evolve.',
  available_upon_request: [
    'Complete AI Acceptable Use Policy document',
    'Data Classification and Handling Procedures',
    'SOC 2 Type II Compliance Mapping for AI Controls',
    'AI Incident Response Plan and Escalation Procedures',
    'Vendor Data Processing Agreements and Security Assessments',
    'Pilot Program Results and Metrics Dashboard',
  ],
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-02-10T14:30:00Z',
};

// ---------- Helpers ----------

const riskStatusColors: Record<string, string> = {
  mitigated: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  planned: 'bg-blue-100 text-blue-800 border-blue-200',
  open: 'bg-red-100 text-red-800 border-red-200',
};

const riskStatusLabels: Record<string, string> = {
  mitigated: 'Mitigated',
  in_progress: 'In Progress',
  planned: 'Planned',
  open: 'Open',
};

const roleLabels: Record<TalkingPoint['role'], string> = {
  c_suite: 'C-Suite / Executive',
  legal: 'Legal & Compliance',
  it: 'IT / Infrastructure',
  security: 'Security',
  engineering: 'Engineering',
  hr: 'HR / People Ops',
};

const roleIcons: Record<TalkingPoint['role'], React.ReactNode> = {
  c_suite: <Building2 className="h-5 w-5" />,
  legal: <Scale className="h-5 w-5" />,
  it: <Gauge className="h-5 w-5" />,
  security: <Lock className="h-5 w-5" />,
  engineering: <Code2 className="h-5 w-5" />,
  hr: <UserCog className="h-5 w-5" />,
};

const roleColors: Record<TalkingPoint['role'], string> = {
  c_suite: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  legal: 'bg-purple-50 border-purple-200 text-purple-800',
  it: 'bg-sky-50 border-sky-200 text-sky-800',
  security: 'bg-red-50 border-red-200 text-red-800',
  engineering: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  hr: 'bg-amber-50 border-amber-200 text-amber-800',
};

const postureBadgeColors: Record<RiskPosture, string> = {
  conservative: 'bg-blue-100 text-blue-800 border-blue-200',
  moderate: 'bg-amber-100 text-amber-800 border-amber-200',
  progressive: 'bg-green-100 text-green-800 border-green-200',
};

// ---------- Sub-Components ----------

function OverviewTab({ brief }: { brief: ClientBrief }): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-slate-700" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed">
              {brief.executive_summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Governance Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Governance Framework Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-slate-700 leading-relaxed">
              {brief.governance_framework_summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Mitigation Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Risk Mitigation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-3 px-3 font-medium text-slate-700 w-[25%]">Risk</th>
                  <th className="py-3 px-3 font-medium text-slate-700 w-[55%]">Mitigation Strategy</th>
                  <th className="py-3 px-3 font-medium text-slate-700 w-[20%]">Status</th>
                </tr>
              </thead>
              <tbody>
                {brief.risk_mitigation_table.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {row.risk}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {row.mitigation}
                    </td>
                    <td className="py-3 px-3">
                      <Badge className={riskStatusColors[row.status] || 'bg-slate-100 text-slate-700 border-slate-200'}>
                        {riskStatusLabels[row.status] || row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ObjectionHandlingTab({ scripts }: { scripts: ObjectionScript[] }): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
        <h3 className="text-sm font-semibold text-indigo-900 mb-1">
          A.C.E. Objection Handling Method
        </h3>
        <p className="text-xs text-indigo-700">
          Each script follows the Acknowledge-Counter-Evidence framework. Start by validating the
          concern, then present the counterpoint, and close with data-driven evidence.
        </p>
      </div>

      {scripts.map((script, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-red-500" />
              <span className="text-red-700">&ldquo;{script.objection}&rdquo;</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Acknowledge */}
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs shrink-0">
                  A
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
                    Acknowledge
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {script.acknowledge}
                  </p>
                </div>
              </div>

              {/* Counter */}
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                  C
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">
                    Counter
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {script.counter}
                  </p>
                </div>
              </div>

              {/* Evidence */}
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-xs shrink-0">
                  E
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">
                    Evidence
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {script.evidence}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TalkingPointsTab({ points }: { points: TalkingPoint[] }): React.ReactElement {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {points.map((tp, idx) => (
        <Card key={idx} className={`border ${roleColors[tp.role].split(' ')[1] || 'border-slate-200'}`}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className={roleColors[tp.role].split(' ')[2] || 'text-slate-800'}>
                {roleIcons[tp.role]}
              </span>
              {roleLabels[tp.role]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Points */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Key Points
              </p>
              <ul className="space-y-1.5">
                {tp.points.map((point, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <Target className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Concerns */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Top Concerns
              </p>
              <ul className="space-y-1.5">
                {tp.concerns.map((concern, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    {concern}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Benefits */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Key Benefits
              </p>
              <ul className="space-y-1.5">
                {tp.benefits.map((benefit, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FaqTab({ items }: { items: { question: string; answer: string }[] }): React.ReactElement {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (idx: number): void => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 mb-4">
        <p className="text-xs text-slate-500">
          {items.length} frequently asked questions prepared for stakeholder conversations.
          Click any question to expand the recommended response.
        </p>
      </div>
      {items.map((item, idx) => {
        const isExpanded = expandedItems.has(idx);
        return (
          <div
            key={idx}
            className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors"
          >
            <button
              type="button"
              onClick={() => toggleItem(idx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-slate-900 truncate">
                  {item.question}
                </span>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
              )}
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 pt-0">
                <div className="ml-10 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TransparencyTab({
  statement,
  availableItems,
}: {
  statement: string;
  availableItems: string[];
}): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Transparency Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-slate-700" />
            AI Transparency Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed italic">
              {statement}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            This statement can be shared with clients, partners, and regulators to demonstrate
            your organization&apos;s commitment to responsible AI use.
          </p>
        </CardContent>
      </Card>

      {/* Available Upon Request */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Available Upon Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            The following governance documentation is maintained and available for stakeholders,
            auditors, and regulators upon request.
          </p>
          <div className="space-y-2">
            {availableItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <span className="text-sm text-slate-700">{item}</span>
                <Badge className="ml-auto bg-green-100 text-green-700 border-green-200 text-xs">
                  Available
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Page Component ----------

export default function ClientBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const resolvedParams = React.use(params);
  void resolvedParams;

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('technology');
  const [selectedPosture, setSelectedPosture] = useState<RiskPosture>('moderate');
  const [briefGenerated, setBriefGenerated] = useState(true);

  const brief = DEMO_BRIEF;

  const handleGenerate = (): void => {
    setBriefGenerated(true);
  };

  const selectedPostureInfo = RISK_POSTURES.find((p) => p.value === selectedPosture);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            Client Brief Generator
          </h1>
          <p className="text-slate-500 mt-1">
            Generate tailored client-facing briefs with objection handling, talking points, and compliance documentation
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="h-5 w-5 text-slate-700" />
            Brief Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Industry Selector */}
            <div>
              <label
                htmlFor="industry-select"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Client Industry
              </label>
              <select
                id="industry-select"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value as Industry)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Posture Selector */}
            <div>
              <label
                htmlFor="posture-select"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Risk Posture
              </label>
              <select
                id="posture-select"
                value={selectedPosture}
                onChange={(e) => setSelectedPosture(e.target.value as RiskPosture)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {RISK_POSTURES.map((rp) => (
                  <option key={rp.value} value={rp.value}>
                    {rp.label}
                  </option>
                ))}
              </select>
              {selectedPostureInfo && (
                <p className="text-xs text-slate-500 mt-1.5">
                  {selectedPostureInfo.description}
                </p>
              )}
            </div>

            {/* Generate Button */}
            <div className="flex flex-col justify-end">
              <Button
                onClick={handleGenerate}
                className="bg-blue-600 text-white hover:bg-blue-700 gap-2 w-full"
              >
                <Sparkles className="h-4 w-4" />
                Generate Brief
              </Button>
              {briefGenerated && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge className={postureBadgeColors[selectedPosture]}>
                    {selectedPosture.charAt(0).toUpperCase() + selectedPosture.slice(1)}
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                    {INDUSTRIES.find((i) => i.value === selectedIndustry)?.label || selectedIndustry}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      {briefGenerated && (
        <>
          <div className="border-b border-slate-200">
            <nav className="flex gap-1 -mb-px" aria-label="Brief sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && <OverviewTab brief={brief} />}
            {activeTab === 'objections' && <ObjectionHandlingTab scripts={brief.objection_scripts} />}
            {activeTab === 'talking_points' && <TalkingPointsTab points={brief.talking_points} />}
            {activeTab === 'faq' && <FaqTab items={brief.faq_items} />}
            {activeTab === 'transparency' && (
              <TransparencyTab
                statement={brief.transparency_statement}
                availableItems={brief.available_upon_request}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
