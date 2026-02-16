import type { PilotTemplate } from '@/types';

export const PILOT_TEMPLATES: PilotTemplate[] = [
  {
    id: 'tpl-support',
    name: 'Customer Support Automation',
    domain: 'support',
    description:
      'Deploy an AI-powered customer support agent that handles Tier-1 inquiries, routes complex tickets, and drafts suggested responses for human review.',
    default_objectives: [
      'Reduce average first-response time by 40%',
      'Automate resolution of Tier-1 tickets with 90%+ accuracy',
      'Maintain or improve customer satisfaction (CSAT) scores',
      'Decrease support agent workload on repetitive inquiries by 50%',
    ],
    default_success_metrics: [
      'First-response time < 2 minutes (from 8-minute baseline)',
      'Tier-1 auto-resolution rate >= 90%',
      'CSAT score >= 4.2 / 5.0',
      'Agent escalation rate < 15%',
    ],
    default_risk_tier: 'medium',
    estimated_duration_weeks: 8,
    prerequisites: [
      'Historical ticket data exported and classified',
      'Support knowledge base indexed and current',
      'API access to ticketing system (e.g., Zendesk, ServiceNow)',
      'Defined escalation workflow for AI-handled tickets',
      'Support team trained on AI-assisted workflow',
    ],
  },
  {
    id: 'tpl-knowledge',
    name: 'Knowledge Search & RAG',
    domain: 'knowledge_search',
    description:
      'Implement a retrieval-augmented generation (RAG) system that enables employees to search internal knowledge bases using natural language and receive accurate, cited answers.',
    default_objectives: [
      'Reduce time-to-answer for internal queries by 60%',
      'Increase knowledge base utilization across departments',
      'Provide source-cited answers with 95%+ factual accuracy',
      'Decrease duplicate questions submitted to subject-matter experts',
    ],
    default_success_metrics: [
      'Query-to-answer time < 30 seconds',
      'Answer accuracy (human-reviewed) >= 95%',
      'Weekly active users > 100 within first month',
      'Source citation accuracy >= 98%',
    ],
    default_risk_tier: 'low',
    estimated_duration_weeks: 6,
    prerequisites: [
      'Knowledge base content inventoried and deduplicated',
      'Document ingestion pipeline configured',
      'Vector database provisioned (e.g., Pinecone, pgvector)',
      'Access control rules mapped to document classifications',
    ],
  },
  {
    id: 'tpl-document',
    name: 'Document Drafting Assistant',
    domain: 'document_drafting',
    description:
      'Deploy an AI writing assistant that helps teams draft, review, and refine business documents such as proposals, reports, and policy documents with brand-consistent language.',
    default_objectives: [
      'Reduce document drafting time by 50%',
      'Ensure brand and style guide compliance on generated drafts',
      'Improve first-draft quality as measured by revision cycles',
      'Enable non-specialist staff to produce professional-grade documents',
    ],
    default_success_metrics: [
      'Average drafting time reduced from 4 hours to 2 hours',
      'Style guide compliance score >= 90%',
      'Average revision cycles reduced from 3.2 to 1.5',
      'User satisfaction rating >= 4.0 / 5.0',
    ],
    default_risk_tier: 'medium',
    estimated_duration_weeks: 6,
    prerequisites: [
      'Brand style guide digitized and structured',
      'Document templates cataloged by type',
      'Review/approval workflow defined',
      'Data classification for document content established',
      'Output review process for AI-generated content in place',
    ],
  },
  {
    id: 'tpl-workflow',
    name: 'Workflow Automation',
    domain: 'workflow_automation',
    description:
      'Automate repetitive business workflows using AI-driven task orchestration, including data extraction, routing decisions, and status updates across integrated systems.',
    default_objectives: [
      'Automate 70% of manual steps in target workflow',
      'Reduce end-to-end process time by 60%',
      'Eliminate data entry errors in automated steps',
      'Free up 20+ hours per week of staff time',
    ],
    default_success_metrics: [
      'Process automation rate >= 70%',
      'End-to-end cycle time reduced by 60%',
      'Data entry error rate < 0.5%',
      'Staff time savings >= 20 hours/week',
    ],
    default_risk_tier: 'medium',
    estimated_duration_weeks: 10,
    prerequisites: [
      'Target workflow documented with process maps',
      'Integration APIs available for all connected systems',
      'Exception handling procedures defined',
      'Rollback procedures established for automated actions',
      'Monitoring and alerting configured for workflow failures',
    ],
  },
  {
    id: 'tpl-codegen',
    name: 'Code Generation Assistant',
    domain: 'code_generation',
    description:
      'Integrate an AI coding assistant (Claude Code, GitHub Copilot, or similar) into the development workflow to accelerate code writing, test generation, and code review across engineering teams.',
    default_objectives: [
      'Increase developer velocity by 25-40%',
      'Improve unit test coverage through AI-generated tests',
      'Reduce time spent on boilerplate and repetitive code',
      'Maintain or improve code quality metrics',
    ],
    default_success_metrics: [
      'Lines of code / developer-hour increased by 30%',
      'Unit test coverage increased from 65% to 85%',
      'PR cycle time reduced by 25%',
      'Defect rate per release unchanged or improved',
    ],
    default_risk_tier: 'high',
    estimated_duration_weeks: 8,
    prerequisites: [
      'Approved IDE extensions or CLI tools installed in sandboxed environment',
      'Code repository access controls and branch protection configured',
      'Security scanning pipeline includes AI-generated code checks',
      'Developer guidelines for AI-assisted coding published',
      'Baseline velocity and quality metrics captured',
    ],
  },
  {
    id: 'tpl-data',
    name: 'Data Analysis Copilot',
    domain: 'data_analysis',
    description:
      'Deploy an AI copilot that assists analysts with data exploration, visualization, and insight generation by translating natural language questions into SQL queries and charts.',
    default_objectives: [
      'Enable non-technical users to self-serve data queries',
      'Reduce ad-hoc report turnaround time by 70%',
      'Improve data literacy across business teams',
      'Maintain query accuracy and data governance compliance',
    ],
    default_success_metrics: [
      'Self-service query adoption: 50+ queries/week by non-analysts',
      'Ad-hoc report delivery time < 5 minutes (from 2-day baseline)',
      'Query accuracy (validated against manual results) >= 95%',
      'Data access policy violations: 0',
    ],
    default_risk_tier: 'high',
    estimated_duration_weeks: 10,
    prerequisites: [
      'Data warehouse schema documented and accessible',
      'Row-level security and column masking policies configured',
      'Approved data sources and tables allow-listed',
      'Query audit logging enabled',
      'Analyst team trained on AI copilot usage and limitations',
    ],
  },
];
