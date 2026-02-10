import { describe, it, expect } from 'vitest';
import { generateProposalContent } from '@/lib/report-gen/docx/proposal-generator';
import type { ProposalData } from '@/lib/report-gen/docx/proposal-generator';
import type { FeasibilityScore, DomainScore, RoiResults, TimelineTask } from '@/types';

function makeDomainScore(domain: string, percentage: number, passed: boolean): DomainScore {
  return {
    domain: domain as DomainScore['domain'],
    score: percentage,
    maxScore: 100,
    percentage,
    passThreshold: 60,
    passed,
    recommendations: passed ? [] : [`Improve ${domain}`],
    remediation_tasks: passed ? [] : [`Fix ${domain}`],
  };
}

const MOCK_SCORE: FeasibilityScore = {
  domain_scores: [
    makeDomainScore('infrastructure', 80, true),
    makeDomainScore('security', 40, false),
    makeDomainScore('governance', 55, true),
    makeDomainScore('engineering', 70, true),
    makeDomainScore('business', 60, true),
  ],
  overall_score: 61,
  rating: 'moderate',
  recommendations: ['Improve security'],
  remediation_tasks: ['Fix security'],
};

const MOCK_ROI: RoiResults = {
  monthly_savings: 50000,
  annual_savings: 600000,
  total_annual_cost: 200000,
  net_annual_benefit: 400000,
  payback_months: 4,
  three_year_npv: 900000,
  roi_percentage: 200,
};

const MOCK_DATA: ProposalData = {
  project: {
    name: 'Acme Corp AI Pilot',
    description: 'Testing AI coding tools',
    status: 'sandbox',
  },
  score: MOCK_SCORE,
  roi: MOCK_ROI,
  tasks: [],
  clientOrg: 'Acme Corporation',
  consultantName: 'Jane Doe',
  consultantFirm: 'GovAI Consulting',
  generatedAt: '2025-12-01',
};

describe('Proposal Generator', () => {
  describe('generateProposalContent', () => {
    it('should return title, metadata, and sections', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('sections');
    });

    it('should include the title "AI Coding Agent Implementation Proposal"', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result.title).toContain('AI Coding Agent Implementation Proposal');
    });

    it('should include client name in metadata', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result.metadata.client).toBe('Acme Corporation');
    });

    it('should include project name in metadata', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result.metadata.project).toBe('Acme Corp AI Pilot');
    });

    it('should include prepared by with consultant info', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result.metadata.preparedBy).toContain('Jane Doe');
      expect(result.metadata.preparedBy).toContain('GovAI Consulting');
    });

    it('should include date in metadata', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result.metadata.date).toBe('2025-12-01');
    });

    it('should mark as CONFIDENTIAL', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result.metadata.confidentiality).toBe('CONFIDENTIAL');
    });

    it('should have 7 sections', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result.sections).toHaveLength(7);
    });

    it('should have Engagement Objectives section first', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result.sections[0].heading).toContain('Engagement Objectives');
    });

    it('should mention client org in Engagement Objectives', () => {
      const result = generateProposalContent(MOCK_DATA);
      expect(result.sections[0].body).toContain('Acme Corporation');
    });

    it('should include Scope of Work section with phase table', () => {
      const result = generateProposalContent(MOCK_DATA);
      const scopeSection = result.sections.find((s) => s.heading.includes('Scope of Work'));
      expect(scopeSection).toBeDefined();
      expect(scopeSection?.table).toBeDefined();
      expect(scopeSection?.table?.headers).toContain('Phase');
    });

    it('should include Deliverables section with items list', () => {
      const result = generateProposalContent(MOCK_DATA);
      const deliverables = result.sections.find((s) => s.heading.includes('Deliverables'));
      expect(deliverables).toBeDefined();
      expect(deliverables?.items).toBeDefined();
      expect(deliverables!.items!.length).toBeGreaterThan(0);
    });

    it('should include Timeline section', () => {
      const result = generateProposalContent(MOCK_DATA);
      const timeline = result.sections.find((s) => s.heading.includes('Timeline'));
      expect(timeline).toBeDefined();
      expect(timeline?.table).toBeDefined();
    });

    it('should include Investment section with ROI data', () => {
      const result = generateProposalContent(MOCK_DATA);
      const investment = result.sections.find((s) => s.heading.includes('Investment'));
      expect(investment).toBeDefined();
      expect(investment?.table).toBeDefined();
    });

    it('should include Assumptions section', () => {
      const result = generateProposalContent(MOCK_DATA);
      const assumptions = result.sections.find((s) => s.heading.includes('Assumptions'));
      expect(assumptions).toBeDefined();
      expect(assumptions?.items).toBeDefined();
      expect(assumptions!.items!.length).toBeGreaterThan(0);
    });

    it('should include overall score in assumptions', () => {
      const result = generateProposalContent(MOCK_DATA);
      const assumptions = result.sections.find((s) => s.heading.includes('Assumptions'));
      expect(assumptions?.items?.some((item) => item.includes('61'))).toBe(true);
    });

    it('should handle missing ROI gracefully', () => {
      const dataWithoutRoi = { ...MOCK_DATA, roi: undefined };
      const result = generateProposalContent(dataWithoutRoi);
      expect(result.sections).toHaveLength(7);
      const investment = result.sections.find((s) => s.heading.includes('Investment'));
      expect(investment).toBeDefined();
      // Should not have a table when no ROI data
      expect(investment?.table).toBeUndefined();
    });

    it('should use default phases when no tasks provided', () => {
      const result = generateProposalContent(MOCK_DATA);
      const scopeSection = result.sections.find((s) => s.heading.includes('Scope of Work'));
      expect(scopeSection?.table?.rows?.length).toBeGreaterThan(0);
    });

    it('should use custom phases when tasks are provided', () => {
      const tasks: TimelineTask[] = [
        {
          id: 't1',
          project_id: 'proj-1',
          title: 'Kickoff Meeting',
          phase: 'Discovery',
          start_date: '2025-12-01',
          end_date: '2025-12-10',
          duration_days: 10,
          status: 'complete',
          dependencies: [],
          progress_percent: 100,
          is_milestone: true,
        },
        {
          id: 't2',
          project_id: 'proj-1',
          title: 'Security Review',
          phase: 'Governance',
          start_date: '2025-12-11',
          end_date: '2025-12-25',
          duration_days: 15,
          status: 'not_started',
          dependencies: [],
          progress_percent: 0,
          is_milestone: false,
        },
      ];
      const dataWithTasks = { ...MOCK_DATA, tasks };
      const result = generateProposalContent(dataWithTasks);
      const scopeSection = result.sections.find((s) => s.heading.includes('Scope of Work'));
      expect(scopeSection?.table?.rows?.length).toBe(2);
    });
  });
});
