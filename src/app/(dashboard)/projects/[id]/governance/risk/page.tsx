'use client';

import { useState } from 'react';
import * as React from 'react';
import { AlertTriangle, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRiskClassifications } from '@/hooks/use-governance';

type RiskTier = 'critical' | 'high' | 'medium' | 'low';
type RiskStatus = 'mitigating' | 'identified' | 'accepted' | 'resolved';

interface Risk {
  id: string;
  category: string;
  description: string;
  tier: RiskTier;
  likelihood: number;
  impact: number;
  score: number;
  mitigation: string;
  owner: string;
  status: RiskStatus;
}

const RISKS: Risk[] = [
  { id: 'R-001', category: 'Data Leakage', description: 'AI model inadvertently exposes proprietary source code through API calls', tier: 'critical', likelihood: 3, impact: 5, score: 15, mitigation: 'DLP rules, egress filtering, managed settings file restrictions', owner: 'CISO', status: 'mitigating' },
  { id: 'R-002', category: 'Unauthorized Access', description: 'Developers bypass sandbox controls to use AI tools in production', tier: 'high', likelihood: 2, impact: 5, score: 10, mitigation: 'MFA enforcement, audit logging, automated access reviews', owner: 'IT Lead', status: 'mitigating' },
  { id: 'R-003', category: 'Compliance Violation', description: 'AI usage violates SOC 2 or HIPAA regulatory requirements', tier: 'high', likelihood: 2, impact: 4, score: 8, mitigation: 'Compliance framework mapping, legal review, mandatory training', owner: 'Legal', status: 'identified' },
  { id: 'R-004', category: 'Model Hallucination', description: 'AI generates incorrect or vulnerable code that passes review', tier: 'medium', likelihood: 4, impact: 2, score: 8, mitigation: 'Mandatory code review, SAST/DAST integration, test coverage requirements', owner: 'Eng Lead', status: 'accepted' },
  { id: 'R-005', category: 'Vendor Lock-in', description: 'Over-dependence on single AI provider limits flexibility', tier: 'medium', likelihood: 3, impact: 3, score: 9, mitigation: 'Multi-tool evaluation, provider abstraction layer, contract review', owner: 'CTO', status: 'identified' },
  { id: 'R-006', category: 'Cost Overrun', description: 'API costs exceed budget projections due to uncontrolled usage', tier: 'low', likelihood: 2, impact: 2, score: 4, mitigation: 'Usage monitoring dashboards, per-user rate limits, budget alerts', owner: 'Finance', status: 'resolved' },
];

const tierColors: Record<RiskTier, string> = { critical: 'bg-red-100 text-red-800 border-red-200', high: 'bg-orange-100 text-orange-800 border-orange-200', medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', low: 'bg-green-100 text-green-800 border-green-200' };
const statusColors: Record<RiskStatus, string> = { mitigating: 'bg-blue-100 text-blue-800', identified: 'bg-yellow-100 text-yellow-800', accepted: 'bg-gray-100 text-gray-800', resolved: 'bg-green-100 text-green-800' };

function getCellColor(score: number) {
  if (score >= 15) return 'bg-red-500/80';
  if (score >= 10) return 'bg-orange-400/80';
  if (score >= 5) return 'bg-yellow-400/70';
  return 'bg-green-400/60';
}

function getTierFromScore(score: number): RiskTier {
  if (score >= 15) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

export default function RiskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: fetchedRisks, isLoading, error } = useRiskClassifications(id);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [localRisks, setLocalRisks] = useState<Risk[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Form state
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLikelihood, setNewLikelihood] = useState(3);
  const [newImpact, setNewImpact] = useState(3);
  const [newMitigation, setNewMitigation] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newStatus, setNewStatus] = useState<RiskStatus>('identified');

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  const baseRisks: Risk[] = (fetchedRisks && fetchedRisks.length > 0) ? fetchedRisks as unknown as Risk[] : RISKS;
  const allRisks = [...baseRisks, ...localRisks];
  const filtered = filterTier === 'all' ? allRisks : allRisks.filter((r) => r.tier === filterTier);

  // Build heat map grid (5x5)
  const grid: { likelihood: number; impact: number; risks: Risk[] }[][] = [];
  for (let imp = 5; imp >= 1; imp--) {
    const row: { likelihood: number; impact: number; risks: Risk[] }[] = [];
    for (let lik = 1; lik <= 5; lik++) {
      row.push({ likelihood: lik, impact: imp, risks: allRisks.filter((r) => r.likelihood === lik && r.impact === imp) });
    }
    grid.push(row);
  }

  const handleAddRisk = () => {
    if (!newCategory.trim() || !newDescription.trim()) return;
    const score = newLikelihood * newImpact;
    const newRisk: Risk = {
      id: `R-${String(allRisks.length + 1).padStart(3, '0')}`,
      category: newCategory.trim(),
      description: newDescription.trim(),
      tier: getTierFromScore(score),
      likelihood: newLikelihood,
      impact: newImpact,
      score,
      mitigation: newMitigation.trim() || 'To be determined',
      owner: newOwner.trim() || 'Unassigned',
      status: newStatus,
    };
    setLocalRisks((prev) => [...prev, newRisk]);
    setShowAddDialog(false);
    // Reset form
    setNewCategory('');
    setNewDescription('');
    setNewLikelihood(3);
    setNewImpact(3);
    setNewMitigation('');
    setNewOwner('');
    setNewStatus('identified');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Add Risk Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Risk</DialogTitle>
            <DialogDescription>
              Identify and classify a new risk for this AI governance project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="risk-category">Category</Label>
              <Input
                id="risk-category"
                placeholder="e.g. Data Leakage, Unauthorized Access..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-description">Description</Label>
              <Textarea
                id="risk-description"
                placeholder="Describe the risk scenario..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk-likelihood">Likelihood (1-5)</Label>
                <select
                  id="risk-likelihood"
                  value={newLikelihood}
                  onChange={(e) => setNewLikelihood(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} - {['Very Low', 'Low', 'Medium', 'High', 'Very High'][n - 1]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk-impact">Impact (1-5)</Label>
                <select
                  id="risk-impact"
                  value={newImpact}
                  onChange={(e) => setNewImpact(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} - {['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'][n - 1]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-md bg-slate-50 p-3 border border-slate-200">
              <p className="text-sm">
                Risk Score: <strong>{newLikelihood * newImpact}</strong> — Tier:{' '}
                <Badge className={tierColors[getTierFromScore(newLikelihood * newImpact)]}>
                  {getTierFromScore(newLikelihood * newImpact)}
                </Badge>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-mitigation">Mitigation Strategy</Label>
              <Textarea
                id="risk-mitigation"
                placeholder="Describe planned mitigation controls..."
                value={newMitigation}
                onChange={(e) => setNewMitigation(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk-owner">Owner</Label>
                <Input
                  id="risk-owner"
                  placeholder="e.g. CISO, CTO..."
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk-status">Status</Label>
                <select
                  id="risk-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RiskStatus)}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                >
                  <option value="identified">Identified</option>
                  <option value="mitigating">Mitigating</option>
                  <option value="accepted">Accepted</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddRisk}
              disabled={!newCategory.trim() || !newDescription.trim()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              Add Risk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Risk Classification Manager
          </h1>
          <p className="text-slate-500 mt-1">Identify, assess, and mitigate AI deployment risks</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" /> Add Risk
        </Button>
      </div>

      {/* Risk Heat Map */}
      <Card>
        <CardHeader><CardTitle>Risk Heat Map</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500 -rotate-90 whitespace-nowrap w-4 mb-8">Impact</span>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-5 gap-1">
                {grid.map((row, ri) =>
                  row.map((cell, ci) => (
                    <div key={`${ri}-${ci}`} className={`relative h-16 rounded-md flex items-center justify-center ${getCellColor(cell.likelihood * cell.impact)}`}>
                      <span className="text-[10px] text-white/70 absolute top-0.5 right-1">{cell.likelihood * cell.impact}</span>
                      {cell.risks.map((r) => (
                        <span key={r.id} className="bg-white rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow-sm" title={r.category}>{r.id}</span>
                      ))}
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between mt-1 px-1">
                {[1, 2, 3, 4, 5].map((n) => (<span key={n} className="text-xs text-slate-500">{n}</span>))}
              </div>
              <p className="text-xs text-slate-500 text-center mt-1">Likelihood</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-400" /> Low (1-4)</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400" /> Medium (5-9)</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-400" /> High (10-14)</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /> Critical (15-25)</div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Register */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Risk Register</CardTitle>
            <div className="flex gap-2">
              <Filter className="h-4 w-4 text-slate-500 mt-1" />
              {['all', 'critical', 'high', 'medium', 'low'].map((t) => (
                <button key={t} onClick={() => setFilterTier(t)} className={`text-xs px-2 py-1 rounded ${filterTier === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-2 font-medium">ID</th>
                  <th className="py-2 px-2 font-medium">Category</th>
                  <th className="py-2 px-2 font-medium hidden md:table-cell">Description</th>
                  <th className="py-2 px-2 font-medium">Tier</th>
                  <th className="py-2 px-2 font-medium text-center">L</th>
                  <th className="py-2 px-2 font-medium text-center">I</th>
                  <th className="py-2 px-2 font-medium text-center">Score</th>
                  <th className="py-2 px-2 font-medium hidden lg:table-cell">Mitigation</th>
                  <th className="py-2 px-2 font-medium">Owner</th>
                  <th className="py-2 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-slate-50">
                    <td className="py-2 px-2 font-mono text-xs">{r.id}</td>
                    <td className="py-2 px-2 font-medium">{r.category}</td>
                    <td className="py-2 px-2 text-slate-500 hidden md:table-cell max-w-[200px] truncate">{r.description}</td>
                    <td className="py-2 px-2"><Badge className={tierColors[r.tier]}>{r.tier}</Badge></td>
                    <td className="py-2 px-2 text-center">{r.likelihood}</td>
                    <td className="py-2 px-2 text-center">{r.impact}</td>
                    <td className="py-2 px-2 text-center font-bold">{r.score}</td>
                    <td className="py-2 px-2 text-slate-500 text-xs hidden lg:table-cell max-w-[200px] truncate">{r.mitigation}</td>
                    <td className="py-2 px-2">{r.owner}</td>
                    <td className="py-2 px-2"><Badge className={statusColors[r.status]}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
