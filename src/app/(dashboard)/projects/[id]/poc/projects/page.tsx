'use client';

import * as React from 'react';
import { useState } from 'react';
import { FlaskConical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePocProjects } from '@/hooks/use-poc';

interface PocProject {
  id: string;
  name: string;
  tool: string;
  status: 'active' | 'planned' | 'completed' | 'cancelled';
  score: number;
  description: string;
  sprints: number;
  completedSprints: number;
  team: string[];
  criteria: { name: string; score: number; weight: number }[];
}

const POC_PROJECTS: PocProject[] = [];

const statusColors = { active: 'bg-emerald-100 text-emerald-800', planned: 'bg-blue-100 text-blue-800', completed: 'bg-gray-100 text-gray-800', cancelled: 'bg-red-100 text-red-800' };

export default function PocProjectsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: fetchedProjects, isLoading, error } = usePocProjects(id);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTool, setNewTool] = useState('Claude Code');
  const [newDescription, setNewDescription] = useState('');
  const [newSprints, setNewSprints] = useState(2);
  const [localProjects, setLocalProjects] = useState<PocProject[]>([]);

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  // Gracefully fall through to demo data if API errors

  const baseProjects = (fetchedProjects && fetchedProjects.length > 0) ? fetchedProjects as unknown as PocProject[] : POC_PROJECTS;
  const pocProjects = [...baseProjects, ...localProjects];

  const handleCreatePoc = (): void => {
    if (!newName.trim()) return;
    const poc = {
      id: `poc-local-${Date.now()}`,
      name: newName.trim(),
      tool: newTool,
      status: 'planned' as const,
      score: 0,
      description: newDescription.trim() || 'New PoC project',
      sprints: newSprints,
      completedSprints: 0,
      team: [] as string[],
      criteria: [
        { name: 'Code Quality', score: 0, weight: 25 },
        { name: 'Velocity Impact', score: 0, weight: 25 },
        { name: 'Security Compliance', score: 0, weight: 20 },
        { name: 'Developer Satisfaction', score: 0, weight: 15 },
        { name: 'Cost Efficiency', score: 0, weight: 15 },
      ],
    };
    setLocalProjects((prev) => [...prev, poc]);
    setShowNewDialog(false);
    setNewName('');
    setNewTool('Claude Code');
    setNewDescription('');
    setNewSprints(2);
    setExpanded(poc.id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-slate-900" />
            PoC Projects
          </h1>
          <p className="text-slate-500 mt-1">Proof-of-concept definitions with selection scoring</p>
          <Badge className="mt-2 bg-slate-100 text-slate-700 border border-slate-200 font-normal text-xs">Owned by: Engineering Lead</Badge>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="h-4 w-4 mr-2" /> New PoC Project</Button>
      </div>

      {/* New PoC Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New PoC Project</DialogTitle>
            <DialogDescription>Define a new proof-of-concept evaluation project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="poc-name">Project Name</Label>
              <Input id="poc-name" placeholder="e.g. GitHub Copilot Evaluation" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poc-tool">AI Tool</Label>
                <select id="poc-tool" value={newTool} onChange={(e) => setNewTool(e.target.value)} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400">
                  <option value="Claude Code">Claude Code</option>
                  <option value="OpenAI Codex">OpenAI Codex</option>
                  <option value="GitHub Copilot">GitHub Copilot</option>
                  <option value="Cursor">Cursor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="poc-sprints">Number of Sprints</Label>
                <select id="poc-sprints" value={newSprints} onChange={(e) => setNewSprints(Number(e.target.value))} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400">
                  {[1, 2, 3, 4, 5].map((n) => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="poc-desc">Description</Label>
              <Textarea id="poc-desc" placeholder="Describe the evaluation scope and goals..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePoc} disabled={!newName.trim()} className="bg-slate-900 text-white hover:bg-slate-800">Create PoC Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pocProjects.length === 0 && (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <FlaskConical className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No PoC projects yet</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            Create your first proof-of-concept project to begin evaluating AI coding tools.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {pocProjects.map((poc) => (
          <Card key={poc.id} className="cursor-pointer" onClick={() => setExpanded(expanded === poc.id ? null : poc.id)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {poc.name}
                    <Badge className={statusColors[poc.status]}>{poc.status}</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">{poc.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{poc.score}</div>
                  <div className="text-xs text-slate-500">Selection Score</div>
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-sm text-slate-500">
                <span>Tool: <strong className="text-slate-900">{poc.tool}</strong></span>
                <span>Sprints: {poc.completedSprints}/{poc.sprints}</span>
                <span>Team: {poc.team.join(', ')}</span>
              </div>
            </CardHeader>
            {expanded === poc.id && (
              <CardContent>
                <h4 className="text-sm font-semibold mb-3">Selection Criteria Breakdown</h4>
                <div className="space-y-3">
                  {poc.criteria.map((c) => (
                    <div key={c.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{c.name} <span className="text-slate-500">({c.weight}%)</span></span>
                        <span className="font-medium">{c.score}/100</span>
                      </div>
                      <Progress value={c.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
