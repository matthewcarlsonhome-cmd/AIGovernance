'use client';

import { History, Download, Eye, Edit, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const REPORTS = [
  { id: 'r1', title: 'Executive Summary Q1 2026', persona: 'Executive', format: 'PDF', generated: 'Feb 5, 2026', status: 'final' as const, size: '2.4 MB' },
  { id: 'r2', title: 'Legal Compliance Review', persona: 'Legal', format: 'DOCX', generated: 'Feb 3, 2026', status: 'final' as const, size: '1.8 MB' },
  { id: 'r3', title: 'IT Security Assessment', persona: 'IT/Security', format: 'PDF', generated: 'Feb 1, 2026', status: 'review' as const, size: '4.1 MB' },
  { id: 'r4', title: 'Engineering Setup Guide', persona: 'Engineering', format: 'Markdown', generated: 'Jan 28, 2026', status: 'draft' as const, size: '856 KB' },
  { id: 'r5', title: 'Communications Messaging Guide', persona: 'Marketing', format: 'DOCX', generated: 'Jan 25, 2026', status: 'final' as const, size: '1.2 MB' },
];

const statusColors = { final: 'bg-emerald-100 text-emerald-800', review: 'bg-yellow-100 text-yellow-800', draft: 'bg-gray-100 text-gray-600' };
const personaColors: Record<string, string> = { Executive: 'bg-violet-100 text-violet-800', Legal: 'bg-blue-100 text-blue-800', 'IT/Security': 'bg-emerald-100 text-emerald-800', Engineering: 'bg-amber-100 text-amber-800', Marketing: 'bg-rose-100 text-rose-800' };

export default function ReportHistoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          Report History
        </h1>
        <p className="text-muted-foreground mt-1">Previously generated reports and deliverables</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 px-3 font-medium">Report</th>
                <th className="py-3 px-3 font-medium">Persona</th>
                <th className="py-3 px-3 font-medium">Format</th>
                <th className="py-3 px-3 font-medium">Generated</th>
                <th className="py-3 px-3 font-medium">Size</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((r) => (
                <tr key={r.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{r.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3"><Badge className={personaColors[r.persona]}>{r.persona}</Badge></td>
                  <td className="py-3 px-3"><Badge variant="outline">{r.format}</Badge></td>
                  <td className="py-3 px-3 text-muted-foreground">{r.generated}</td>
                  <td className="py-3 px-3 text-muted-foreground">{r.size}</td>
                  <td className="py-3 px-3"><Badge className={statusColors[r.status]}>{r.status}</Badge></td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /></Button>
                      <Button variant="outline" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                      {r.status !== 'final' && <Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5" /></Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
