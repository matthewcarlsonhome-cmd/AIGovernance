import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '@/stores/project-store';
import type { Project } from '@/types';

const TEST_PROJECT: Project = {
  id: 'test-proj-1',
  name: 'Test Project',
  description: 'A test project',
  organization_id: 'org-test',
  status: 'discovery',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('ProjectStore', () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
  });

  it('should initialize with demo projects', () => {
    const { projects } = useProjectStore.getState();
    expect(projects.length).toBeGreaterThan(0);
  });

  it('should set projects', () => {
    useProjectStore.getState().setProjects([TEST_PROJECT]);
    const { projects } = useProjectStore.getState();
    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe('test-proj-1');
  });

  it('should add a project', () => {
    const initialCount = useProjectStore.getState().projects.length;
    useProjectStore.getState().addProject(TEST_PROJECT);
    const { projects } = useProjectStore.getState();
    expect(projects).toHaveLength(initialCount + 1);
    expect(projects.find((p) => p.id === TEST_PROJECT.id)).toBeDefined();
  });

  it('should update a project', () => {
    useProjectStore.getState().addProject(TEST_PROJECT);
    useProjectStore.getState().updateProject('test-proj-1', { name: 'Updated Name' });
    const project = useProjectStore.getState().projects.find((p) => p.id === 'test-proj-1');
    expect(project?.name).toBe('Updated Name');
  });

  it('should update project status', () => {
    useProjectStore.getState().addProject(TEST_PROJECT);
    useProjectStore.getState().updateProjectStatus('test-proj-1', 'sandbox');
    const project = useProjectStore.getState().projects.find((p) => p.id === 'test-proj-1');
    expect(project?.status).toBe('sandbox');
  });

  it('should remove a project', () => {
    useProjectStore.getState().addProject(TEST_PROJECT);
    const beforeCount = useProjectStore.getState().projects.length;
    useProjectStore.getState().removeProject('test-proj-1');
    const afterCount = useProjectStore.getState().projects.length;
    expect(afterCount).toBe(beforeCount - 1);
    expect(useProjectStore.getState().projects.find((p) => p.id === 'test-proj-1')).toBeUndefined();
  });

  it('should set current project', () => {
    useProjectStore.getState().setCurrentProject(TEST_PROJECT);
    expect(useProjectStore.getState().currentProject?.id).toBe('test-proj-1');
  });

  it('should clear current project when removed', () => {
    useProjectStore.getState().addProject(TEST_PROJECT);
    useProjectStore.getState().setCurrentProject(TEST_PROJECT);
    useProjectStore.getState().removeProject('test-proj-1');
    expect(useProjectStore.getState().currentProject).toBeNull();
  });

  it('should update current project when it matches the updated project', () => {
    useProjectStore.getState().addProject(TEST_PROJECT);
    useProjectStore.getState().setCurrentProject(TEST_PROJECT);
    useProjectStore.getState().updateProject('test-proj-1', { name: 'New Name' });
    expect(useProjectStore.getState().currentProject?.name).toBe('New Name');
  });

  it('should not update current project when a different project is updated', () => {
    useProjectStore.getState().setCurrentProject(TEST_PROJECT);
    useProjectStore.getState().updateProject('other-id', { name: 'Other' });
    expect(useProjectStore.getState().currentProject?.name).toBe('Test Project');
  });

  it('should get project by id', () => {
    useProjectStore.getState().addProject(TEST_PROJECT);
    const found = useProjectStore.getState().getProjectById('test-proj-1');
    expect(found?.id).toBe('test-proj-1');
  });

  it('should return undefined for unknown project id', () => {
    const found = useProjectStore.getState().getProjectById('nonexistent');
    expect(found).toBeUndefined();
  });

  it('should set loading state', () => {
    useProjectStore.getState().setLoading(true);
    expect(useProjectStore.getState().isLoading).toBe(true);
    useProjectStore.getState().setLoading(false);
    expect(useProjectStore.getState().isLoading).toBe(false);
  });

  it('should set error state', () => {
    useProjectStore.getState().setError('Something went wrong');
    expect(useProjectStore.getState().error).toBe('Something went wrong');
    useProjectStore.getState().setError(null);
    expect(useProjectStore.getState().error).toBeNull();
  });

  it('should reset to demo state', () => {
    useProjectStore.getState().setProjects([TEST_PROJECT]);
    useProjectStore.getState().setCurrentProject(TEST_PROJECT);
    useProjectStore.getState().setLoading(true);
    useProjectStore.getState().setError('err');
    useProjectStore.getState().reset();

    const state = useProjectStore.getState();
    expect(state.projects.length).toBeGreaterThan(1); // demo projects
    expect(state.currentProject).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
