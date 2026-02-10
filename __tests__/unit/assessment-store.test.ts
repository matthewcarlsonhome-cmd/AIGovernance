import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore, ASSESSMENT_SECTIONS } from '@/stores/assessment-store';

describe('AssessmentStore', () => {
  beforeEach(() => {
    useAssessmentStore.getState().reset();
  });

  describe('initialization', () => {
    it('should start with no project id', () => {
      expect(useAssessmentStore.getState().projectId).toBeNull();
    });

    it('should start at section index 0', () => {
      expect(useAssessmentStore.getState().currentSectionIndex).toBe(0);
    });

    it('should start with empty responses', () => {
      expect(useAssessmentStore.getState().responses).toHaveLength(0);
    });

    it('should start with no feasibility score', () => {
      expect(useAssessmentStore.getState().feasibilityScore).toBeNull();
    });

    it('should start not dirty', () => {
      expect(useAssessmentStore.getState().isDirty).toBe(false);
    });
  });

  describe('navigation', () => {
    it('should set project id', () => {
      useAssessmentStore.getState().setProjectId('proj-1');
      expect(useAssessmentStore.getState().projectId).toBe('proj-1');
    });

    it('should go to a specific section', () => {
      useAssessmentStore.getState().goToSection(3);
      expect(useAssessmentStore.getState().currentSectionIndex).toBe(3);
    });

    it('should not go to negative section index', () => {
      useAssessmentStore.getState().goToSection(-1);
      expect(useAssessmentStore.getState().currentSectionIndex).toBe(0);
    });

    it('should not go beyond last section', () => {
      useAssessmentStore.getState().goToSection(100);
      expect(useAssessmentStore.getState().currentSectionIndex).toBe(0);
    });

    it('should navigate to next section', () => {
      useAssessmentStore.getState().nextSection();
      expect(useAssessmentStore.getState().currentSectionIndex).toBe(1);
    });

    it('should not navigate past last section', () => {
      useAssessmentStore.getState().goToSection(ASSESSMENT_SECTIONS.length - 1);
      useAssessmentStore.getState().nextSection();
      expect(useAssessmentStore.getState().currentSectionIndex).toBe(ASSESSMENT_SECTIONS.length - 1);
    });

    it('should navigate to previous section', () => {
      useAssessmentStore.getState().goToSection(2);
      useAssessmentStore.getState().prevSection();
      expect(useAssessmentStore.getState().currentSectionIndex).toBe(1);
    });

    it('should not navigate before first section', () => {
      useAssessmentStore.getState().prevSection();
      expect(useAssessmentStore.getState().currentSectionIndex).toBe(0);
    });

    it('should get current section', () => {
      const section = useAssessmentStore.getState().getCurrentSection();
      expect(section.key).toBe('infrastructure');
      expect(section.label).toBe('Infrastructure Readiness');
    });
  });

  describe('responses', () => {
    it('should set a response', () => {
      useAssessmentStore.getState().setProjectId('proj-1');
      useAssessmentStore.getState().setResponse('infra-001', 'AWS');
      const responses = useAssessmentStore.getState().responses;
      expect(responses).toHaveLength(1);
      expect(responses[0].question_id).toBe('infra-001');
      expect(responses[0].value).toBe('AWS');
    });

    it('should update existing response', () => {
      useAssessmentStore.getState().setProjectId('proj-1');
      useAssessmentStore.getState().setResponse('infra-001', 'AWS');
      useAssessmentStore.getState().setResponse('infra-001', 'Google Cloud');
      const responses = useAssessmentStore.getState().responses;
      expect(responses).toHaveLength(1);
      expect(responses[0].value).toBe('Google Cloud');
    });

    it('should mark as dirty when response is set', () => {
      useAssessmentStore.getState().setResponse('infra-001', 'AWS');
      expect(useAssessmentStore.getState().isDirty).toBe(true);
    });

    it('should get a response by question id', () => {
      useAssessmentStore.getState().setResponse('infra-001', 'AWS');
      const response = useAssessmentStore.getState().getResponse('infra-001');
      expect(response?.value).toBe('AWS');
    });

    it('should return undefined for unset response', () => {
      const response = useAssessmentStore.getState().getResponse('nonexistent');
      expect(response).toBeUndefined();
    });

    it('should clear all responses', () => {
      useAssessmentStore.getState().setResponse('infra-001', 'AWS');
      useAssessmentStore.getState().setResponse('sec-001', 'Yes');
      useAssessmentStore.getState().clearResponses();
      expect(useAssessmentStore.getState().responses).toHaveLength(0);
      expect(useAssessmentStore.getState().isDirty).toBe(false);
      expect(useAssessmentStore.getState().feasibilityScore).toBeNull();
    });

    it('should set bulk responses', () => {
      const responses = [
        {
          id: 'r1',
          project_id: 'proj-1',
          question_id: 'infra-001',
          value: 'AWS' as string | string[] | number,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'r2',
          project_id: 'proj-1',
          question_id: 'sec-001',
          value: 'Yes' as string | string[] | number,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      useAssessmentStore.getState().setResponses(responses);
      expect(useAssessmentStore.getState().responses).toHaveLength(2);
      expect(useAssessmentStore.getState().isDirty).toBe(false);
    });
  });

  describe('progress', () => {
    it('should return 0% progress with no responses', () => {
      const progress = useAssessmentStore.getState().getProgress();
      expect(progress.answered).toBe(0);
      expect(progress.total).toBe(30);
      expect(progress.percentage).toBe(0);
    });

    it('should calculate progress based on responses', () => {
      useAssessmentStore.getState().setResponse('infra-001', 'AWS');
      useAssessmentStore.getState().setResponse('infra-002', 'Yes');
      const progress = useAssessmentStore.getState().getProgress();
      expect(progress.answered).toBe(2);
      expect(progress.percentage).toBe(Math.round((2 / 30) * 100));
    });

    it('should calculate section progress', () => {
      useAssessmentStore.getState().setResponse('infra-001', 'AWS');
      useAssessmentStore.getState().setResponse('infra-002', 'Yes');
      const sectionProgress = useAssessmentStore.getState().getSectionProgress('infrastructure');
      expect(sectionProgress.answered).toBe(2);
      expect(sectionProgress.total).toBe(6);
      expect(sectionProgress.percentage).toBe(Math.round((2 / 6) * 100));
    });

    it('should return 0 for section with no responses', () => {
      const sectionProgress = useAssessmentStore.getState().getSectionProgress('security');
      expect(sectionProgress.answered).toBe(0);
      expect(sectionProgress.percentage).toBe(0);
    });

    it('should report not complete when fewer than 30 responses', () => {
      useAssessmentStore.getState().setResponse('infra-001', 'AWS');
      expect(useAssessmentStore.getState().isComplete()).toBe(false);
    });
  });

  describe('scoring', () => {
    it('should set feasibility score', () => {
      const mockScore = {
        domain_scores: [],
        overall_score: 72,
        rating: 'moderate' as const,
        recommendations: ['rec1'],
        remediation_tasks: ['task1'],
      };
      useAssessmentStore.getState().setFeasibilityScore(mockScore);
      expect(useAssessmentStore.getState().feasibilityScore?.overall_score).toBe(72);
    });

    it('should set calculating state', () => {
      useAssessmentStore.getState().setIsCalculating(true);
      expect(useAssessmentStore.getState().isCalculating).toBe(true);
      useAssessmentStore.getState().setIsCalculating(false);
      expect(useAssessmentStore.getState().isCalculating).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useAssessmentStore.getState().setProjectId('proj-1');
      useAssessmentStore.getState().goToSection(3);
      useAssessmentStore.getState().setResponse('infra-001', 'AWS');
      useAssessmentStore.getState().setIsCalculating(true);

      useAssessmentStore.getState().reset();

      const state = useAssessmentStore.getState();
      expect(state.projectId).toBeNull();
      expect(state.currentSectionIndex).toBe(0);
      expect(state.responses).toHaveLength(0);
      expect(state.feasibilityScore).toBeNull();
      expect(state.isCalculating).toBe(false);
      expect(state.isDirty).toBe(false);
    });
  });

  describe('ASSESSMENT_SECTIONS constant', () => {
    it('should have 5 sections', () => {
      expect(ASSESSMENT_SECTIONS).toHaveLength(5);
    });

    it('should have key, label, and domain for each section', () => {
      ASSESSMENT_SECTIONS.forEach((section) => {
        expect(section.key).toBeTruthy();
        expect(section.label).toBeTruthy();
        expect(section.domain).toBeTruthy();
      });
    });
  });
});
