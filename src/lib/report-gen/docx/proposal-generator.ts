import type { FeasibilityScore, RoiResults, Project, TimelineTask } from '@/types';

export interface ProposalData {
  project: Pick<Project, 'name' | 'description' | 'status'>;
  score: FeasibilityScore;
  roi?: RoiResults;
  tasks: TimelineTask[];
  clientOrg: string;
  consultantName: string;
  consultantFirm: string;
  generatedAt: string;
}

export interface ProposalContent {
  title: string;
  metadata: Record<string, string>;
  sections: ProposalSection[];
}

export interface ProposalSection {
  heading: string;
  body: string;
  items?: string[];
  table?: { headers: string[]; rows: string[][] };
}

export function generateProposalContent(data: ProposalData): ProposalContent {
  const { project, score, roi, tasks, clientOrg, consultantName, consultantFirm, generatedAt } = data;

  const failedDomains = score.domain_scores.filter(d => !d.passed);
  const totalRemediation = score.remediation_tasks.length;
  const phases = getPhases(tasks);

  return {
    title: `AI Coding Agent Implementation Proposal`,
    metadata: {
      client: clientOrg,
      project: project.name,
      preparedBy: `${consultantName}, ${consultantFirm}`,
      date: generatedAt,
      version: '1.0',
      confidentiality: 'CONFIDENTIAL',
    },
    sections: [
      {
        heading: '1. Engagement Objectives',
        body: `This proposal outlines a structured engagement to guide ${clientOrg} through the adoption of AI coding agents, ` +
          `addressing ${failedDomains.length} domain gaps identified in the readiness assessment and implementing a controlled ` +
          `rollout framework with three-gate governance.`,
        items: [
          'Remediate identified readiness gaps across infrastructure, security, and governance domains',
          'Establish a secure sandbox environment for controlled AI agent evaluation',
          'Execute a structured proof-of-concept with measurable success criteria',
          'Develop governance artifacts (AUP, IRP, data classification, risk framework)',
          'Deliver executive-ready reporting and go/no-go recommendation',
          'Build internal capability for sustainable AI agent adoption',
        ],
      },
      {
        heading: '2. Scope of Work',
        body: 'The engagement covers the following phases:',
        table: {
          headers: ['Phase', 'Duration', 'Key Deliverables'],
          rows: phases.map(p => [
            p.name,
            `${p.weeks} weeks`,
            p.deliverables.join('; '),
          ]),
        },
      },
      {
        heading: '3. Deliverables',
        body: 'The following artifacts will be produced during the engagement:',
        items: [
          'Readiness Assessment Report (PDF) — comprehensive scoring across 5 domains',
          'Gap Remediation Plan — prioritized action items with owners and timelines',
          'Governance Package — AUP, IRP addendum, data classification policy, risk framework',
          'Sandbox Configuration — infrastructure-as-code templates for secure AI environment',
          'PoC Evaluation Report — sprint metrics, tool comparison, developer feedback',
          'Executive Briefing Deck — 5-slide summary with go/no-go recommendation',
          'ROI Analysis — cost-benefit model with sensitivity analysis',
          'Implementation Runbook — step-by-step production rollout guide',
          'RACI Matrix — responsibility assignments for all phases',
          'Gate Review Packages — evidence checklists for Gates 1, 2, and 3',
        ],
      },
      {
        heading: '4. Timeline',
        body: `Total estimated duration: ${phases.reduce((s, p) => s + p.weeks, 0)} weeks. ` +
          'The timeline is structured around three governance gates that serve as go/no-go checkpoints.',
        table: {
          headers: ['Milestone', 'Target Week', 'Gate'],
          rows: [
            ['Project Kickoff', 'Week 1', '—'],
            ['Readiness Assessment Complete', `Week ${phases[0]?.weeks || 2}`, '—'],
            ['Governance Artifacts Approved', `Week ${(phases[0]?.weeks || 2) + (phases[1]?.weeks || 3)}`, 'Gate 1'],
            ['Sandbox Validated', `Week ${(phases[0]?.weeks || 2) + (phases[1]?.weeks || 3) + (phases[2]?.weeks || 2)}`, '—'],
            ['PoC Complete', `Week ${phases.reduce((s, p) => s + p.weeks, 0) - 2}`, 'Gate 2'],
            ['Go/No-Go Decision', `Week ${phases.reduce((s, p) => s + p.weeks, 0)}`, 'Gate 3'],
          ],
        },
      },
      {
        heading: '5. Team Requirements',
        body: 'The following roles are required from the client organization:',
        table: {
          headers: ['Role', 'Time Commitment', 'Responsibilities'],
          rows: [
            ['Executive Sponsor', '2-4 hours/week', 'Gate approvals, budget authority, organizational alignment'],
            ['IT/Security Lead', '8-10 hours/week', 'Infrastructure setup, security configuration, validation'],
            ['Engineering Manager', '6-8 hours/week', 'PoC team selection, sprint management, metrics collection'],
            ['Legal/Compliance', '4-6 hours/week', 'Policy review, compliance mapping, risk assessment'],
            ['Pilot Developers (2-4)', '80% capacity during PoC', 'Tool evaluation, feedback, metrics generation'],
          ],
        },
      },
      {
        heading: '6. Investment',
        body: generateInvestmentSection(roi, phases),
        table: roi ? {
          headers: ['Item', 'Cost'],
          rows: [
            ['Consulting Engagement', `$${((roi.total_annual_cost * 0.4) / 1000).toFixed(0)}K`],
            ['AI Agent Licenses (Annual)', `$${((roi.total_annual_cost * 0.5) / 1000).toFixed(0)}K`],
            ['Training & Onboarding', `$${((roi.total_annual_cost * 0.1) / 1000).toFixed(0)}K`],
            ['Total Year 1 Investment', `$${(roi.total_annual_cost / 1000).toFixed(0)}K`],
            ['Projected Annual Savings', `$${(roi.annual_savings / 1000).toFixed(0)}K`],
            ['Payback Period', `${roi.payback_months} months`],
            ['3-Year NPV', `$${(roi.three_year_npv / 1000).toFixed(0)}K`],
          ],
        } : undefined,
      },
      {
        heading: '7. Assumptions & Dependencies',
        body: 'This proposal is based on the following assumptions:',
        items: [
          'Client will provide timely access to required personnel and systems',
          'Infrastructure provisioning can be completed within stated timelines',
          'Existing compliance frameworks are current and documented',
          'Executive sponsor has budget authority for stated investment',
          `Assessment data reflects current state (score: ${score.overall_score.toFixed(1)}%)`,
          'No major organizational restructuring during engagement period',
        ],
      },
    ],
  };
}

function generateInvestmentSection(roi: RoiResults | undefined, phases: Phase[]): string {
  const totalWeeks = phases.reduce((s, p) => s + p.weeks, 0);
  if (!roi) {
    return `Based on a ${totalWeeks}-week engagement timeline, the investment breakdown is as follows. ` +
      'Detailed ROI analysis is available upon completion of the readiness assessment.';
  }
  return `Based on the ROI analysis, the total Year 1 investment of $${(roi.total_annual_cost / 1000).toFixed(0)}K ` +
    `is projected to generate $${(roi.annual_savings / 1000).toFixed(0)}K in annual savings, ` +
    `achieving payback in ${roi.payback_months} months with a 3-year NPV of $${(roi.three_year_npv / 1000).toFixed(0)}K.`;
}

interface Phase {
  name: string;
  weeks: number;
  deliverables: string[];
}

function getPhases(tasks: TimelineTask[]): Phase[] {
  const phaseMap = new Map<string, TimelineTask[]>();
  tasks.forEach(t => {
    const list = phaseMap.get(t.phase) || [];
    list.push(t);
    phaseMap.set(t.phase, list);
  });

  if (phaseMap.size === 0) {
    return [
      { name: 'Discovery & Assessment', weeks: 2, deliverables: ['Readiness Assessment', 'Gap Analysis', 'Stakeholder Interviews'] },
      { name: 'Governance & Policy', weeks: 3, deliverables: ['AUP', 'IRP', 'Data Classification', 'Risk Framework', 'Gate 1 Review'] },
      { name: 'Sandbox Setup', weeks: 2, deliverables: ['Infrastructure Config', 'Security Hardening', 'Validation'] },
      { name: 'Proof of Concept', weeks: 4, deliverables: ['Sprint Execution', 'Metrics Collection', 'Tool Comparison', 'Gate 2 Review'] },
      { name: 'Evaluation & Decision', weeks: 2, deliverables: ['Executive Briefing', 'ROI Analysis', 'Go/No-Go', 'Gate 3 Review'] },
    ];
  }

  return Array.from(phaseMap.entries()).map(([phase, phaseTasks]) => {
    const maxDuration = Math.max(...phaseTasks.map(t => t.duration_days));
    return {
      name: phase,
      weeks: Math.ceil(maxDuration / 5),
      deliverables: phaseTasks.filter(t => t.is_milestone).map(t => t.title),
    };
  });
}
