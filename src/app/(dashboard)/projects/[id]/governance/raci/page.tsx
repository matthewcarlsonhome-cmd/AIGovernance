'use client';

import { useState, useMemo, useCallback } from 'react';
import { Users, Grid3X3, Download, Plus, Check, AlertCircle, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import type { RaciAssignment, RaciEntry } from '@/types';

// ---------------------------------------------------------------------------
// Phase definitions & demo data
// ---------------------------------------------------------------------------

type Phase = 'discovery' | 'governance' | 'sandbox' | 'pilot' | 'evaluation' | 'production';

interface PhaseInfo {
  key: Phase;
  label: string;
  tasks: string[];
}

const PHASES: PhaseInfo[] = [
  {
    key: 'discovery',
    label: 'Discovery',
    tasks: [
      'Stakeholder Interviews',
      'Current State Assessment',
      'Requirements Gathering',
      'Readiness Questionnaire',
      'Gap Analysis Report',
    ],
  },
  {
    key: 'governance',
    label: 'Governance',
    tasks: [
      'AUP Drafting',
      'IRP Addendum',
      'Data Classification',
      'Risk Assessment',
      'Gate 1 Review',
    ],
  },
  {
    key: 'sandbox',
    label: 'Sandbox Setup',
    tasks: [
      'Infrastructure Setup',
      'Security Configuration',
      'Tool Installation',
      'Validation Testing',
      'Documentation',
    ],
  },
  {
    key: 'pilot',
    label: 'Pilot',
    tasks: [
      'Sprint Planning',
      'Developer Onboarding',
      'Code Review Process',
      'Metrics Collection',
      'Gate 2 Review',
    ],
  },
  {
    key: 'evaluation',
    label: 'Evaluation',
    tasks: [
      'Metrics Analysis',
      'Tool Comparison Report',
      'Stakeholder Feedback',
      'ROI Calculation',
      'Go/No-Go Recommendation',
    ],
  },
  {
    key: 'production',
    label: 'Production',
    tasks: [
      'Rollout Plan',
      'Training Program',
      'Monitoring Setup',
      'Gate 3 Review',
      'Post-Deployment Review',
    ],
  },
];

interface TeamMemberInfo {
  name: string;
  role: string;
}

const TEAM_MEMBERS: TeamMemberInfo[] = [
  { name: 'Jane Smith', role: 'Consultant' },
  { name: 'Mike Chen', role: 'IT Lead' },
  { name: 'Sarah Johnson', role: 'CISO' },
  { name: 'Tom Williams', role: 'Engineering Manager' },
  { name: 'Lisa Park', role: 'Legal Counsel' },
  { name: 'David Kim', role: 'Executive Sponsor' },
  { name: 'Rachel Green', role: 'Developer' },
  { name: 'James Wilson', role: 'Marketing' },
];

// ---------------------------------------------------------------------------
// RACI cycling & color helpers
// ---------------------------------------------------------------------------

const RACI_CYCLE: (RaciAssignment | null)[] = [null, 'R', 'A', 'C', 'I'];

function nextAssignment(current: RaciAssignment | null): RaciAssignment | null {
  const idx = RACI_CYCLE.indexOf(current);
  return RACI_CYCLE[(idx + 1) % RACI_CYCLE.length];
}

function getAssignmentStyle(assignment: RaciAssignment | null): string {
  switch (assignment) {
    case 'R':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/25 hover:bg-blue-500/25';
    case 'A':
      return 'bg-orange-500/15 text-orange-700 border-orange-500/25 hover:bg-orange-500/25';
    case 'C':
      return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/25 hover:bg-yellow-500/25';
    case 'I':
      return 'bg-gray-500/15 text-gray-600 border-gray-500/25 hover:bg-gray-500/25';
    default:
      return 'bg-muted/40 text-muted-foreground/50 border-dashed border-border hover:bg-muted';
  }
}

function getRoleBadgeStyle(role: string): string {
  switch (role) {
    case 'Consultant':
      return 'bg-purple-500/15 text-purple-700 border-purple-500/25';
    case 'IT Lead':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/25';
    case 'CISO':
      return 'bg-red-500/15 text-red-700 border-red-500/25';
    case 'Engineering Manager':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25';
    case 'Legal Counsel':
      return 'bg-amber-500/15 text-amber-700 border-amber-500/25';
    case 'Executive Sponsor':
      return 'bg-indigo-500/15 text-indigo-700 border-indigo-500/25';
    case 'Developer':
      return 'bg-teal-500/15 text-teal-700 border-teal-500/25';
    case 'Marketing':
      return 'bg-pink-500/15 text-pink-700 border-pink-500/25';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

// ---------------------------------------------------------------------------
// Validation types
// ---------------------------------------------------------------------------

type ValidationSeverity = 'error' | 'warning';

interface ValidationIssue {
  severity: ValidationSeverity;
  message: string;
}

// ---------------------------------------------------------------------------
// Build default matrix for Discovery phase
// ---------------------------------------------------------------------------

type MatrixData = Map<string, Map<string, RaciAssignment>>;

function buildDefaultDiscoveryMatrix(): MatrixData {
  const matrix: MatrixData = new Map();

  const defaults: Record<string, Record<string, RaciAssignment>> = {
    'Stakeholder Interviews': {
      'Jane Smith': 'R',
      'David Kim': 'A',
      'Tom Williams': 'C',
      'Lisa Park': 'I',
    },
    'Current State Assessment': {
      'Jane Smith': 'R',
      'Mike Chen': 'A',
      'Sarah Johnson': 'C',
      'Tom Williams': 'C',
      'David Kim': 'I',
    },
    'Requirements Gathering': {
      'Jane Smith': 'A',
      'Tom Williams': 'R',
      'Rachel Green': 'R',
      'Mike Chen': 'C',
      'Lisa Park': 'I',
    },
    'Readiness Questionnaire': {
      'Jane Smith': 'R',
      'David Kim': 'A',
      'Sarah Johnson': 'C',
      'Mike Chen': 'C',
      'James Wilson': 'I',
    },
    'Gap Analysis Report': {
      'Jane Smith': 'R',
      'David Kim': 'A',
      'Mike Chen': 'C',
      'Sarah Johnson': 'C',
      'Tom Williams': 'I',
      'Lisa Park': 'I',
    },
  };

  for (const [task, members] of Object.entries(defaults)) {
    const memberMap = new Map<string, RaciAssignment>();
    for (const [member, assignment] of Object.entries(members)) {
      memberMap.set(member, assignment);
    }
    matrix.set(task, memberMap);
  }

  return matrix;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RaciMatrixPage() {
  const [activePhase, setActivePhase] = useState<Phase>('discovery');

  // Matrix state keyed by phase -> task -> member -> assignment
  const [matrices, setMatrices] = useState<Record<string, MatrixData>>(() => ({
    discovery: buildDefaultDiscoveryMatrix(),
  }));

  const currentPhase = PHASES.find((p) => p.key === activePhase)!;

  // Get or create the matrix for the active phase
  const currentMatrix = useMemo((): MatrixData => {
    return matrices[activePhase] ?? new Map();
  }, [matrices, activePhase]);

  // Cycle a cell assignment
  const handleCellClick = useCallback(
    (taskName: string, memberName: string) => {
      setMatrices((prev) => {
        const phaseMatrix = new Map(prev[activePhase] ?? new Map());
        const taskRow = new Map(phaseMatrix.get(taskName) ?? new Map<string, RaciAssignment>());
        const current = taskRow.get(memberName) ?? null;
        const next = nextAssignment(current);

        if (next === null) {
          taskRow.delete(memberName);
        } else {
          taskRow.set(memberName, next);
        }

        phaseMatrix.set(taskName, taskRow);
        return { ...prev, [activePhase]: phaseMatrix };
      });
    },
    [activePhase]
  );

  // Validation
  const validationIssues = useMemo((): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    for (const task of currentPhase.tasks) {
      const taskRow = currentMatrix.get(task);
      const assignments = taskRow ? Array.from(taskRow.values()) : [];
      const accountableCount = assignments.filter((a) => a === 'A').length;
      const responsibleCount = assignments.filter((a) => a === 'R').length;

      if (accountableCount === 0) {
        issues.push({
          severity: 'error',
          message: `"${task}" has no Accountable person assigned`,
        });
      }

      if (accountableCount > 1) {
        issues.push({
          severity: 'error',
          message: `"${task}" has multiple Accountable persons (${accountableCount})`,
        });
      }

      if (responsibleCount === 0) {
        issues.push({
          severity: 'warning',
          message: `"${task}" has no Responsible person assigned`,
        });
      }
    }

    return issues;
  }, [currentMatrix, currentPhase.tasks]);

  const hasErrors = validationIssues.some((v) => v.severity === 'error');
  const hasWarnings = validationIssues.some((v) => v.severity === 'warning');
  const allValid = validationIssues.length === 0;

  // Count assignments for summary
  const assignmentCounts = useMemo(() => {
    let r = 0;
    let a = 0;
    let c = 0;
    let i = 0;
    for (const taskRow of currentMatrix.values()) {
      for (const val of taskRow.values()) {
        if (val === 'R') r++;
        if (val === 'A') a++;
        if (val === 'C') c++;
        if (val === 'I') i++;
      }
    }
    return { r, a, c, i, total: r + a + c + i };
  }, [currentMatrix]);

  const handleSave = () => {
    console.log('Saving RACI matrix for phase:', activePhase, Object.fromEntries(
      Array.from(currentMatrix.entries()).map(([task, members]) => [
        task,
        Object.fromEntries(members),
      ])
    ));
  };

  const handleExport = () => {
    console.log('Exporting RACI matrix for phase:', activePhase);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-primary" />
            RACI Matrix
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define Responsible, Accountable, Consulted, and Informed assignments for each project phase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Matrix
          </Button>
        </div>
      </div>

      <Separator />

      {/* Summary Badges */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{TEAM_MEMBERS.length} team members</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Grid3X3 className="h-4 w-4" />
          <span>{currentPhase.tasks.length} tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-blue-500/15 text-blue-700 border-blue-500/25">
            R: {assignmentCounts.r}
          </Badge>
          <Badge variant="outline" className="bg-orange-500/15 text-orange-700 border-orange-500/25">
            A: {assignmentCounts.a}
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/15 text-yellow-700 border-yellow-500/25">
            C: {assignmentCounts.c}
          </Badge>
          <Badge variant="outline" className="bg-gray-500/15 text-gray-600 border-gray-500/25">
            I: {assignmentCounts.i}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          ({assignmentCounts.total} total assignments)
        </span>
      </div>

      {/* Phase Tabs + Matrix Content */}
      <Tabs value={activePhase} onValueChange={(val) => setActivePhase(val as Phase)}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          {PHASES.map((phase) => (
            <TabsTrigger key={phase.key} value={phase.key}>
              {phase.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PHASES.map((phase) => (
          <TabsContent key={phase.key} value={phase.key}>
            {/* Matrix Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {phase.label} Phase &mdash; Assignment Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px] font-semibold text-xs uppercase tracking-wider">
                          Task / Deliverable
                        </TableHead>
                        {TEAM_MEMBERS.map((member) => (
                          <TableHead key={member.name} className="text-center min-w-[100px]">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                                {member.name.split(' ')[0]}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 font-normal ${getRoleBadgeStyle(member.role)}`}
                              >
                                {member.role}
                              </Badge>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {phase.tasks.map((task, taskIdx) => {
                        const taskRow = currentMatrix.get(task);
                        return (
                          <TableRow
                            key={task}
                            className={taskIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                          >
                            <TableCell className="font-medium text-sm text-foreground">
                              {task}
                            </TableCell>
                            {TEAM_MEMBERS.map((member) => {
                              const assignment = taskRow?.get(member.name) ?? null;
                              return (
                                <TableCell key={member.name} className="text-center p-1">
                                  <button
                                    type="button"
                                    onClick={() => handleCellClick(task, member.name)}
                                    className={`
                                      inline-flex items-center justify-center
                                      w-10 h-8 rounded-md border text-xs font-bold
                                      cursor-pointer transition-all duration-150
                                      ${getAssignmentStyle(assignment)}
                                    `}
                                    title={
                                      assignment
                                        ? `${member.name}: ${assignment} (click to change)`
                                        : `Assign ${member.name} (click to set)`
                                    }
                                  >
                                    {assignment ?? '\u2013'}
                                  </button>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Validation Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {allValid ? (
              <Check className="h-5 w-5 text-emerald-600" />
            ) : hasErrors ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            Validation
            {allValid && (
              <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/25 ml-2">
                All checks passed
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allValid ? (
            <p className="text-sm text-emerald-700">
              Every task in the {currentPhase.label} phase has exactly one Accountable person and at
              least one Responsible person assigned. The matrix is valid.
            </p>
          ) : (
            <div className="space-y-2">
              {validationIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                    issue.severity === 'error'
                      ? 'bg-red-500/10 text-red-700'
                      : 'bg-amber-500/10 text-amber-700'
                  }`}
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-medium capitalize">{issue.severity}:</span>{' '}
                    {issue.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-8 rounded-md border bg-blue-500/15 border-blue-500/25 flex items-center justify-center text-blue-700 text-xs font-bold">
                R
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Responsible</p>
                <p className="text-xs text-muted-foreground">Does the work to complete the task</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-8 rounded-md border bg-orange-500/15 border-orange-500/25 flex items-center justify-center text-orange-700 text-xs font-bold">
                A
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Accountable</p>
                <p className="text-xs text-muted-foreground">
                  Ultimately answerable; approves the work
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-8 rounded-md border bg-yellow-500/15 border-yellow-500/25 flex items-center justify-center text-yellow-700 text-xs font-bold">
                C
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Consulted</p>
                <p className="text-xs text-muted-foreground">
                  Provides input; two-way communication
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-8 rounded-md border bg-gray-500/15 border-gray-500/25 flex items-center justify-center text-gray-600 text-xs font-bold">
                I
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Informed</p>
                <p className="text-xs text-muted-foreground">
                  Kept up to date; one-way communication
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
