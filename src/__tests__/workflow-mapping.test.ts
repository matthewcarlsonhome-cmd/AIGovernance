import { describe, it, expect } from 'vitest';
import {
  CANONICAL_WORKFLOW,
  WORKFLOW_MAPPINGS,
  getWorkflowStep,
  getPagesByWorkspace,
  getConsolidationTargets,
} from '@/lib/workflow/mapping';

describe('Workflow Mapping Matrix', () => {
  it('should have 6 canonical workflow steps', () => {
    expect(CANONICAL_WORKFLOW).toHaveLength(6);
  });

  it('should map every page to a workflow step', () => {
    for (const mapping of WORKFLOW_MAPPINGS) {
      expect(CANONICAL_WORKFLOW.map((w) => w.step)).toContain(mapping.workflow_step);
    }
  });

  it('should return correct workflow step for a route', () => {
    expect(getWorkflowStep('/projects/[id]/plan')).toBe('scope');
    expect(getWorkflowStep('/projects/[id]/governance/gates')).toBe('approve');
    expect(getWorkflowStep('/projects/[id]/decide')).toBe('decide');
  });

  it('should return null for unknown routes', () => {
    expect(getWorkflowStep('/unknown/route')).toBeNull();
  });

  it('should list pages by workspace', () => {
    const planPages = getPagesByWorkspace('plan');
    expect(planPages.length).toBeGreaterThan(0);
    expect(planPages.every((p) => p.workspace === 'plan')).toBe(true);
  });

  it('should identify consolidation targets', () => {
    const targets = getConsolidationTargets();
    expect(targets.length).toBeGreaterThan(0);
    expect(targets.every((t) => t.status === 'consolidate')).toBe(true);
    expect(targets.every((t) => t.consolidate_into !== undefined)).toBe(true);
  });

  it('should map all kept pages to one of four workspaces', () => {
    const keptPages = WORKFLOW_MAPPINGS.filter((m) => m.status === 'keep');
    const validWorkspaces = ['plan', 'govern', 'execute', 'decide'];
    for (const page of keptPages) {
      expect(validWorkspaces).toContain(page.workspace);
    }
  });
});
