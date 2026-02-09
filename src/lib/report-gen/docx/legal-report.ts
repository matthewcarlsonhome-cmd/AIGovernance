import type { ComplianceMapping, Policy, RiskClassification, Project } from '@/types';

export interface LegalReportData {
  project: Pick<Project, 'name'>;
  policies: Policy[];
  complianceMappings: ComplianceMapping[];
  risks: RiskClassification[];
  clientOrg: string;
  preparedBy: string;
  generatedAt: string;
}

export interface LegalReportContent {
  title: string;
  metadata: Record<string, string>;
  sections: LegalSection[];
}

export interface LegalSection {
  heading: string;
  body: string;
  items?: string[];
  table?: { headers: string[]; rows: string[][] };
}

export function generateLegalReportContent(data: LegalReportData): LegalReportContent {
  const { project, policies, complianceMappings, risks, clientOrg, preparedBy, generatedAt } = data;

  const frameworks = [...new Set(complianceMappings.map(m => m.framework))];
  const legalRisks = risks.filter(r => r.category.toLowerCase().includes('legal') || r.category.toLowerCase().includes('compliance') || r.tier === 'critical');

  return {
    title: 'Legal & Compliance Review',
    metadata: {
      project: project.name,
      client: clientOrg,
      preparedBy,
      date: generatedAt,
      classification: 'PRIVILEGED & CONFIDENTIAL',
    },
    sections: [
      {
        heading: '1. Regulatory Landscape',
        body: `This review covers compliance requirements across ${frameworks.length} regulatory frameworks ` +
          `applicable to ${clientOrg}'s adoption of AI coding agents. ` +
          `${complianceMappings.length} controls have been mapped across ${frameworks.join(', ').toUpperCase()}.`,
        items: frameworks.map(f => {
          const controls = complianceMappings.filter(m => m.framework === f);
          const implemented = controls.filter(c => c.status === 'implemented' || c.status === 'verified').length;
          return `${f.toUpperCase()}: ${implemented}/${controls.length} controls implemented (${((implemented / controls.length) * 100).toFixed(0)}%)`;
        }),
      },
      {
        heading: '2. Acceptable Use Policy Analysis',
        body: generatePolicySection(policies, 'aup'),
      },
      {
        heading: '3. Incident Response Plan Addendum',
        body: generatePolicySection(policies, 'irp'),
      },
      {
        heading: '4. Data Classification Requirements',
        body: generatePolicySection(policies, 'data_classification'),
      },
      {
        heading: '5. Compliance Framework Mapping',
        body: `Detailed control-to-framework mappings for all ${frameworks.length} applicable frameworks.`,
        table: {
          headers: ['Framework', 'Control ID', 'Control Name', 'Status', 'Evidence'],
          rows: complianceMappings.slice(0, 30).map(m => [
            m.framework.toUpperCase(),
            m.control_id,
            m.control_name,
            m.status.replace('_', ' ').toUpperCase(),
            m.evidence || '—',
          ]),
        },
      },
      {
        heading: '6. Legal Risk Register',
        body: `${legalRisks.length} risks with legal or compliance implications have been identified.`,
        table: {
          headers: ['Risk', 'Tier', 'Likelihood', 'Impact', 'Mitigation'],
          rows: legalRisks.map(r => [
            r.category,
            r.tier.toUpperCase(),
            `${r.likelihood}/5`,
            `${r.impact}/5`,
            r.mitigation,
          ]),
        },
      },
      {
        heading: '7. Contractual Considerations',
        body: 'The following contractual elements should be reviewed before proceeding with AI agent vendor agreements:',
        items: [
          'Data processing agreement (DPA) with AI vendor — ensure compliance with applicable data protection laws',
          'Intellectual property clauses — verify ownership of AI-generated code output',
          'Liability and indemnification — clarify responsibility for AI-generated security vulnerabilities',
          'Service level agreements — define uptime, latency, and support expectations',
          'Data residency requirements — confirm processing location meets regulatory requirements',
          'Audit rights — ensure ability to audit AI vendor security practices',
          'Termination provisions — data portability and deletion upon contract end',
        ],
      },
    ],
  };
}

function generatePolicySection(policies: Policy[], type: string): string {
  const policy = policies.find(p => p.type === type);
  if (!policy) {
    return `No ${type.toUpperCase()} policy has been drafted yet. This is a required deliverable before Gate 1 approval.`;
  }

  const statusText = {
    draft: 'currently in draft and requires review',
    review: 'under review by designated approvers',
    approved: 'approved and in effect',
    archived: 'archived (superseded by newer version)',
  }[policy.status];

  return `The ${policy.title} (Version ${policy.version}) is ${statusText}. ` +
    (policy.content
      ? `\n\nPolicy Summary:\n${policy.content.substring(0, 500)}${policy.content.length > 500 ? '...' : ''}`
      : '');
}
