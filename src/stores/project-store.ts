import { create } from 'zustand';
import type { Project, ProjectStatus } from '@/types';

// ---------------------------------------------------------------------------
// Demo Projects (initial state when Supabase is not configured)
// ---------------------------------------------------------------------------

const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Acme Corp AI Coding Pilot',
    description: 'Enterprise-wide evaluation of Claude Code for the platform engineering team. Covers sandbox setup, security review, and three-gate approval process.',
    organization_id: 'org-001',
    status: 'sandbox',
    feasibility_score: 72,
    start_date: '2025-09-01',
    target_end_date: '2026-03-01',
    actual_end_date: null,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-12-15T10:30:00Z',
  },
  {
    id: 'proj-002',
    name: 'FinServ AI Governance Assessment',
    description: 'Readiness assessment and governance framework design for a financial services firm adopting AI coding tools under SOC 2 and PCI DSS requirements.',
    organization_id: 'org-002',
    status: 'discovery',
    feasibility_score: 45,
    start_date: '2025-11-15',
    target_end_date: '2026-05-15',
    actual_end_date: null,
    created_at: '2025-11-15T00:00:00Z',
    updated_at: '2026-01-10T14:00:00Z',
  },
  {
    id: 'proj-003',
    name: 'HealthTech Codex vs Claude Comparison',
    description: 'Head-to-head proof-of-concept comparing OpenAI Codex and Claude Code for a healthcare technology company with HIPAA compliance requirements.',
    organization_id: 'org-003',
    status: 'pilot',
    feasibility_score: 81,
    start_date: '2025-08-01',
    target_end_date: '2026-02-01',
    actual_end_date: null,
    created_at: '2025-08-01T00:00:00Z',
    updated_at: '2026-01-20T09:15:00Z',
  },
];

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getProjectById: (id: string) => Project | undefined;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: DEMO_PROJECTS,
  currentProject: null,
  isLoading: false,
  error: null,

  setProjects: (projects) => set({ projects }),

  setCurrentProject: (project) => set({ currentProject: project }),

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates, updated_at: new Date().toISOString() }
          : state.currentProject,
    })),

  updateProjectStatus: (id, status) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status, updated_at: new Date().toISOString() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, status, updated_at: new Date().toISOString() }
          : state.currentProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  reset: () =>
    set({
      projects: DEMO_PROJECTS,
      currentProject: null,
      isLoading: false,
      error: null,
    }),
}));
