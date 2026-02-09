import { create } from 'zustand';
import type { AssessmentResponse, FeasibilityScore, ScoreDomain } from '@/types';

// ---------------------------------------------------------------------------
// Section metadata for navigation
// ---------------------------------------------------------------------------

export const ASSESSMENT_SECTIONS = [
  { key: 'infrastructure', label: 'Infrastructure Readiness', domain: 'infrastructure' as ScoreDomain },
  { key: 'security', label: 'Security Posture', domain: 'security' as ScoreDomain },
  { key: 'governance', label: 'Governance Maturity', domain: 'governance' as ScoreDomain },
  { key: 'engineering', label: 'Engineering Culture', domain: 'engineering' as ScoreDomain },
  { key: 'business', label: 'Business Alignment', domain: 'business' as ScoreDomain },
] as const;

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface AssessmentStore {
  // State
  projectId: string | null;
  currentSectionIndex: number;
  responses: AssessmentResponse[];
  feasibilityScore: FeasibilityScore | null;
  isCalculating: boolean;
  isDirty: boolean;

  // Navigation
  setProjectId: (projectId: string) => void;
  goToSection: (index: number) => void;
  nextSection: () => void;
  prevSection: () => void;
  getCurrentSection: () => (typeof ASSESSMENT_SECTIONS)[number];

  // Responses
  setResponse: (questionId: string, value: string | string[] | number) => void;
  setResponses: (responses: AssessmentResponse[]) => void;
  getResponse: (questionId: string) => AssessmentResponse | undefined;
  clearResponses: () => void;

  // Scoring
  setFeasibilityScore: (score: FeasibilityScore | null) => void;
  setIsCalculating: (calculating: boolean) => void;

  // Progress
  getProgress: () => { answered: number; total: number; percentage: number };
  getSectionProgress: (sectionKey: string) => { answered: number; total: number; percentage: number };
  isComplete: () => boolean;

  // Persistence helpers
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  projectId: null,
  currentSectionIndex: 0,
  responses: [],
  feasibilityScore: null,
  isCalculating: false,
  isDirty: false,

  // -- Navigation --

  setProjectId: (projectId) => set({ projectId }),

  goToSection: (index) => {
    if (index >= 0 && index < ASSESSMENT_SECTIONS.length) {
      set({ currentSectionIndex: index });
    }
  },

  nextSection: () => {
    const { currentSectionIndex } = get();
    if (currentSectionIndex < ASSESSMENT_SECTIONS.length - 1) {
      set({ currentSectionIndex: currentSectionIndex + 1 });
    }
  },

  prevSection: () => {
    const { currentSectionIndex } = get();
    if (currentSectionIndex > 0) {
      set({ currentSectionIndex: currentSectionIndex - 1 });
    }
  },

  getCurrentSection: () => ASSESSMENT_SECTIONS[get().currentSectionIndex],

  // -- Responses --

  setResponse: (questionId, value) => {
    set((state) => {
      const existingIndex = state.responses.findIndex((r) => r.question_id === questionId);
      const now = new Date().toISOString();

      const response: AssessmentResponse = {
        id: existingIndex >= 0 ? state.responses[existingIndex].id : `resp-${questionId}`,
        project_id: state.projectId || '',
        question_id: questionId,
        value,
        created_at: existingIndex >= 0 ? state.responses[existingIndex].created_at : now,
        updated_at: now,
      };

      const newResponses = [...state.responses];
      if (existingIndex >= 0) {
        newResponses[existingIndex] = response;
      } else {
        newResponses.push(response);
      }

      return { responses: newResponses, isDirty: true };
    });
  },

  setResponses: (responses) => set({ responses, isDirty: false }),

  getResponse: (questionId) => get().responses.find((r) => r.question_id === questionId),

  clearResponses: () => set({ responses: [], feasibilityScore: null, isDirty: false }),

  // -- Scoring --

  setFeasibilityScore: (feasibilityScore) => set({ feasibilityScore }),

  setIsCalculating: (isCalculating) => set({ isCalculating }),

  // -- Progress --

  getProgress: () => {
    const { responses } = get();
    // Total questions across all sections (30 based on question bank)
    const total = 30;
    const answered = responses.length;
    return {
      answered,
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
    };
  },

  getSectionProgress: (sectionKey) => {
    const { responses } = get();
    // Question IDs follow the pattern: domain-prefix + number
    const prefixMap: Record<string, string> = {
      infrastructure: 'infra-',
      security: 'sec-',
      governance: 'gov-',
      engineering: 'eng-',
      business: 'biz-',
    };
    const prefix = prefixMap[sectionKey] || '';
    const sectionResponses = responses.filter((r) => r.question_id.startsWith(prefix));
    const total = 6; // 6 questions per section
    const answered = sectionResponses.length;
    return {
      answered,
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
    };
  },

  isComplete: () => {
    const { responses } = get();
    return responses.length >= 30;
  },

  // -- Persistence helpers --

  setDirty: (isDirty) => set({ isDirty }),

  reset: () =>
    set({
      projectId: null,
      currentSectionIndex: 0,
      responses: [],
      feasibilityScore: null,
      isCalculating: false,
      isDirty: false,
    }),
}));
