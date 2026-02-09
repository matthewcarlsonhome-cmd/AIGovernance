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
      return 'bg-muted text-muted-foreground border-border';
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
      return 'bg-muted text-muted-foreground border-border';
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReportHistoryPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Report History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Previously generated reports with download and version tracking.
          </p>
        </div>
        <Button variant="outline">
          <History className="h-4 w-4" />
          Export All
        </Button>
      </div>

      <Separator />

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{REPORTS.length}</p>
            <p className="text-xs text-muted-foreground">Total Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600">
              {REPORTS.filter((r) => r.status === 'Final').length}
            </p>
            <p className="text-xs text-muted-foreground">Finalized</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600">
              {REPORTS.filter((r) => r.status === 'Review').length}
            </p>
            <p className="text-xs text-muted-foreground">In Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-muted-foreground">
              {REPORTS.filter((r) => r.status === 'Draft').length}
            </p>
            <p className="text-xs text-muted-foreground">Drafts</p>
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
                {REPORTS.map((report) => {
                  const PersonaIcon = report.personaIcon;
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">
                            {report.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <PersonaIcon className="h-3.5 w-3.5 text-muted-foreground" />
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
                      <TableCell className="text-sm text-muted-foreground">
                        {report.generatedDate}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
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
                          <Button variant="ghost" size="sm">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          {report.status === 'Final' ? (
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm">
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
