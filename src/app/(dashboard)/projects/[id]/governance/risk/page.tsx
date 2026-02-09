'use client';

import { useState } from 'react';
import { AlertTriangle, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RISKS = [
  { id: 'R-001', category: 'Data Leakage', description: 'AI model inadvertently exposes proprietary source code through API calls', tier: 'critical' as const, likelihood: 3, impact: 5, score: 15, mitigation: 'DLP rules, egress filtering, managed settings file restrictions', owner: 'CISO', status: 'mitigating' as const },
  { id: 'R-002', category: 'Unauthorized Access', description: 'Developers bypass sandbox controls to use AI tools in production', tier: 'high' as const, likelihood: 2, impact: 5, score: 10, mitigation: 'MFA enforcement, audit logging, automated access reviews', owner: 'IT Lead', status: 'mitigating' as const },
  { id: 'R-003', category: 'Compliance Violation', description: 'AI usage violates SOC 2 or HIPAA regulatory requirements', tier: 'high' as const, likelihood: 2, impact: 4, score: 8, mitigation: 'Compliance framework mapping, legal review, mandatory training', owner: 'Legal', status: 'identified' as const },
  { id: 'R-004', category: 'Model Hallucination', description: 'AI generates incorrect or vulnerable code that passes review', tier: 'medium' as const, likelihood: 4, impact: 2, score: 8, mitigation: 'Mandatory code review, SAST/DAST integration, test coverage requirements', owner: 'Eng Lead', status: 'accepted' as const },
  { id: 'R-005', category: 'Vendor Lock-in', description: 'Over-dependence on single AI provider limits flexibility', tier: 'medium' as const, likelihood: 3, impact: 3, score: 9, mitigation: 'Multi-tool evaluation, provider abstraction layer, contract review', owner: 'CTO', status: 'identified' as const },
  { id: 'R-006', category: 'Cost Overrun', description: 'API costs exceed budget projections due to uncontrolled usage', tier: 'low' as const, likelihood: 2, impact: 2, score: 4, mitigation: 'Usage monitoring dashboards, per-user rate limits, budget alerts', owner: 'Finance', status: 'resolved' as const },
];

const tierColors = { critical: 'bg-red-100 text-red-800 border-red-200', high: 'bg-orange-100 text-orange-800 border-orange-200', medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', low: 'bg-green-100 text-green-800 border-green-200' };
const statusColors = { mitigating: 'bg-blue-100 text-blue-800', identified: 'bg-yellow-100 text-yellow-800', accepted: 'bg-gray-100 text-gray-800', resolved: 'bg-green-100 text-green-800' };

function getCellColor(score: number) {
  if (score >= 15) return 'bg-red-500/80';
  if (score >= 10) return 'bg-orange-400/80';
  if (score >= 5) return 'bg-yellow-400/70';
  return 'bg-green-400/60';
}

export default function RiskPage() {
  const [filterTier, setFilterTier] = useState<string>('all');
  const filtered = filterTier === 'all' ? RISKS : RISKS.filter((r) => r.tier === filterTier);

  // Build heat map grid (5x5) — rows = impact (5 top to 1 bottom), cols = likelihood (1 left to 5 right)
  const grid: { likelihood: number; impact: number; risks: typeof RISKS }[][] = [];
  for (let imp = 5; imp >= 1; imp--) {
    const row: { likelihood: number; impact: number; risks: typeof RISKS }[] = [];
    for (let lik = 1; lik <= 5; lik++) {
      row.push({ likelihood: lik, impact: imp, risks: RISKS.filter((r) => r.likelihood === lik && r.impact === imp) });
    }
    grid.push(row);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Risk Classification Manager
          </h1>
          <p className="text-muted-foreground mt-1">Identify, assess, and mitigate AI deployment risks</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Risk</Button>
      </div>

      {/* Risk Heat Map */}
      <Card>
        <CardHeader><CardTitle>Risk Heat Map</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap w-4 mb-8">Impact</span>
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
                {[1, 2, 3, 4, 5].map((n) => (<span key={n} className="text-xs text-muted-foreground">{n}</span>))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">Likelihood</p>
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
              <Filter className="h-4 w-4 text-muted-foreground mt-1" />
              {['all', 'critical', 'high', 'medium', 'low'].map((t) => (
                <button key={t} onClick={() => setFilterTier(t)} className={`text-xs px-2 py-1 rounded ${filterTier === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
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
                  <tr key={r.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-xs">{r.id}</td>
                    <td className="py-2 px-2 font-medium">{r.category}</td>
                    <td className="py-2 px-2 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{r.description}</td>
                    <td className="py-2 px-2"><Badge className={tierColors[r.tier]}>{r.tier}</Badge></td>
                    <td className="py-2 px-2 text-center">{r.likelihood}</td>
                    <td className="py-2 px-2 text-center">{r.impact}</td>
                    <td className="py-2 px-2 text-center font-bold">{r.score}</td>
                    <td className="py-2 px-2 text-muted-foreground text-xs hidden lg:table-cell max-w-[200px] truncate">{r.mitigation}</td>
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
