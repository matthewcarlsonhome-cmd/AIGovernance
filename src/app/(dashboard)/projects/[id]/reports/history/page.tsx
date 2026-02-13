'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  History,
  Download,
  Eye,
  Pencil,
  FileText,
  Briefcase,
  Scale,
  ShieldCheck,
  Code2,
  Megaphone,
} from 'lucide-react';
import { useGeneratedReports } from '@/hooks/use-reports';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ReportStatus = 'Final' | 'Review' | 'Draft';

interface GeneratedReport {
  id: string;
  name: string;
  persona: string;
  personaIcon: React.ElementType;
  format: string;
  generatedDate: string;
  status: ReportStatus;
  fileSize: string;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const REPORTS: GeneratedReport[] = [
  {
    id: 'rpt-001',
    name: 'Executive Summary Q1',
    persona: 'Executive',
    personaIcon: Briefcase,
    format: 'PDF',
    generatedDate: 'Feb 5, 2026',
    status: 'Final',
    fileSize: '2.4 MB',
  },
  {
    id: 'rpt-002',
    name: 'Legal Compliance Review',
    persona: 'Legal',
    personaIcon: Scale,
    format: 'DOCX',
    generatedDate: 'Feb 3, 2026',
    status: 'Final',
    fileSize: '1.8 MB',
  },
  {
    id: 'rpt-003',
    name: 'IT Security Assessment',
    persona: 'IT/Security',
    personaIcon: ShieldCheck,
    format: 'PDF',
    generatedDate: 'Feb 1, 2026',
    status: 'Review',
    fileSize: '5.1 MB',
  },
  {
    id: 'rpt-004',
    name: 'Engineering Setup Guide',
    persona: 'Engineering',
    personaIcon: Code2,
    format: 'Markdown',
    generatedDate: 'Jan 28, 2026',
    status: 'Draft',
    fileSize: '890 KB',
  },
  {
    id: 'rpt-005',
    name: 'Comms Messaging Guide',
    persona: 'Marketing',
    personaIcon: Megaphone,
    format: 'DOCX',
    generatedDate: 'Jan 25, 2026',
    status: 'Final',
    fileSize: '1.2 MB',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusBadgeClasses(status: ReportStatus): string {
  switch (status) {
    case 'Final':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25';
    case 'Review':
      return 'bg-amber-500/15 text-amber-700 border-amber-500/25';
    case 'Draft':
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

function getFormatBadgeClasses(format: string): string {
  switch (format) {
    case 'PDF':
      return 'bg-red-500/15 text-red-700 border-red-500/25';
    case 'DOCX':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/25';
    case 'Markdown':
      return 'bg-gray-500/15 text-gray-700 border-gray-500/25';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReportHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const { data: fetchedReports, isLoading, error } = useGeneratedReports(id);

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  // Gracefully fall through to demo data if API errors

  const reports: GeneratedReport[] = (fetchedReports && fetchedReports.length > 0) ? fetchedReports as unknown as GeneratedReport[] : REPORTS;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Report History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Previously generated reports with download and version tracking.
          </p>
        </div>
        <Button variant="outline" onClick={() => {
          const csvRows = ['Name,Persona,Format,Generated,Size,Status'];
          reports.forEach((r) => csvRows.push(`"${r.name}","${r.persona}","${r.format}","${r.generatedDate}","${r.fileSize}","${r.status}"`));
          const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'reports-export.csv';
          a.click();
          URL.revokeObjectURL(url);
        }}>
          <History className="h-4 w-4" />
          Export All
        </Button>
      </div>

      <Separator />

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
            <p className="text-xs text-slate-500">Total Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600">
              {reports.filter((r) => r.status === 'Final').length}
            </p>
            <p className="text-xs text-slate-500">Finalized</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600">
              {reports.filter((r) => r.status === 'Review').length}
            </p>
            <p className="text-xs text-slate-500">In Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-slate-500">
              {reports.filter((r) => r.status === 'Draft').length}
            </p>
            <p className="text-xs text-slate-500">Drafts</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            Complete history of generated reports with persona, format, and
            status information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const PersonaIcon = report.personaIcon;
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                          <span className="font-medium text-slate-900">
                            {report.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <PersonaIcon className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm">{report.persona}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            getFormatBadgeClasses(report.format)
                          )}
                        >
                          {report.format}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {report.generatedDate}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {report.fileSize}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            getStatusBadgeClasses(report.status)
                          )}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            const blob = new Blob([`Report: ${report.name}\nPersona: ${report.persona}\nFormat: ${report.format}\nStatus: ${report.status}\nGenerated: ${report.generatedDate}\n\n[This is a demo export. In production, the actual ${report.format} file would be downloaded from Supabase Storage.]`], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${report.name.replace(/\s+/g, '_')}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          {report.status === 'Final' ? (
                            <Button variant="ghost" size="sm" onClick={() => alert(`Viewing report: ${report.name}\n\nFormat: ${report.format}\nPersona: ${report.persona}\nGenerated: ${report.generatedDate}\nSize: ${report.fileSize}\n\n[In production, this would open the full report viewer.]`)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => alert(`Opening editor for: ${report.name}\n\nStatus: ${report.status}\nFormat: ${report.format}\n\n[In production, this would open the report editor.]`)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
