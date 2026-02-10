'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ScrollText,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Pencil,
  Trash2,
  FileDown,
  CheckCircle2,
  LogIn,
  LogOut,
  Plus,
} from 'lucide-react';
import type { AuditAction } from '@/lib/db/audit';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DemoAuditLog {
  id: string;
  user_name: string;
  user_email: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Demo data (structured for real data replacement)
// ---------------------------------------------------------------------------

const DEMO_AUDIT_LOGS: DemoAuditLog[] = [
  {
    id: 'al-1',
    user_name: 'Sarah Chen',
    user_email: 'sarah.chen@company.com',
    action: 'create',
    resource_type: 'project',
    resource_id: 'demo-1',
    details: { name: 'Enterprise AI Coding Pilot' },
    ip_address: '192.168.1.10',
    created_at: '2026-02-10T14:30:00Z',
  },
  {
    id: 'al-2',
    user_name: 'James Wilson',
    user_email: 'james.wilson@company.com',
    action: 'update',
    resource_type: 'policy',
    resource_id: 'pol-1',
    details: { title: 'Acceptable Use Policy', version: 3 },
    ip_address: '192.168.1.22',
    created_at: '2026-02-10T13:15:00Z',
  },
  {
    id: 'al-3',
    user_name: 'Maria Garcia',
    user_email: 'maria.garcia@company.com',
    action: 'approve',
    resource_type: 'gate_review',
    resource_id: 'gr-1',
    details: { gate_number: 1, decision: 'approved' },
    ip_address: '192.168.1.35',
    created_at: '2026-02-10T11:00:00Z',
  },
  {
    id: 'al-4',
    user_name: 'Alex Kim',
    user_email: 'alex.kim@company.com',
    action: 'export',
    resource_type: 'report',
    resource_id: 'rpt-1',
    details: { format: 'pdf', title: 'Executive Summary Q1 2026' },
    ip_address: '192.168.1.44',
    created_at: '2026-02-09T16:45:00Z',
  },
  {
    id: 'al-5',
    user_name: 'Sarah Chen',
    user_email: 'sarah.chen@company.com',
    action: 'view',
    resource_type: 'assessment',
    resource_id: 'assess-1',
    details: { section: 'Security Domain' },
    ip_address: '192.168.1.10',
    created_at: '2026-02-09T15:20:00Z',
  },
  {
    id: 'al-6',
    user_name: 'David Park',
    user_email: 'david.park@company.com',
    action: 'delete',
    resource_type: 'risk_classification',
    resource_id: 'risk-3',
    details: { category: 'Data Exposure', tier: 'low' },
    ip_address: '192.168.1.55',
    created_at: '2026-02-09T10:30:00Z',
  },
  {
    id: 'al-7',
    user_name: 'Lisa Zhang',
    user_email: 'lisa.zhang@company.com',
    action: 'sign_in',
    resource_type: 'auth',
    resource_id: null,
    details: { method: 'sso' },
    ip_address: '10.0.0.14',
    created_at: '2026-02-09T09:00:00Z',
  },
  {
    id: 'al-8',
    user_name: 'James Wilson',
    user_email: 'james.wilson@company.com',
    action: 'create',
    resource_type: 'compliance_mapping',
    resource_id: 'cm-5',
    details: { framework: 'SOC 2', control_id: 'CC6.1' },
    ip_address: '192.168.1.22',
    created_at: '2026-02-08T14:10:00Z',
  },
  {
    id: 'al-9',
    user_name: 'Maria Garcia',
    user_email: 'maria.garcia@company.com',
    action: 'update',
    resource_type: 'sandbox_config',
    resource_id: 'sc-1',
    details: { field: 'vpc_cidr', new_value: '10.100.0.0/16' },
    ip_address: '192.168.1.35',
    created_at: '2026-02-08T11:45:00Z',
  },
  {
    id: 'al-10',
    user_name: 'David Park',
    user_email: 'david.park@company.com',
    action: 'sign_out',
    resource_type: 'auth',
    resource_id: null,
    details: {},
    ip_address: '192.168.1.55',
    created_at: '2026-02-08T09:30:00Z',
  },
];

// ---------------------------------------------------------------------------
// Action badge
// ---------------------------------------------------------------------------

const ACTION_CONFIG: Record<AuditAction, { label: string; className: string; icon: React.ElementType }> = {
  create: { label: 'Create', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Plus },
  update: { label: 'Update', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: Pencil },
  delete: { label: 'Delete', className: 'bg-red-50 text-red-700 border-red-200', icon: Trash2 },
  view: { label: 'View', className: 'bg-slate-50 text-slate-700 border-slate-200', icon: Eye },
  export: { label: 'Export', className: 'bg-violet-50 text-violet-700 border-violet-200', icon: FileDown },
  approve: { label: 'Approve', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: CheckCircle2 },
  sign_in: { label: 'Sign In', className: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: LogIn },
  sign_out: { label: 'Sign Out', className: 'bg-gray-50 text-gray-600 border-gray-200', icon: LogOut },
};

function ActionBadge({ action }: { action: AuditAction }): React.ReactElement {
  const config = ACTION_CONFIG[action] ?? ACTION_CONFIG.view;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('text-xs gap-1', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatResourceType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDetails(details: Record<string, unknown>): string {
  const entries = Object.entries(details);
  if (entries.length === 0) return '--';
  return entries
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(', ');
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const ALL_ACTIONS: AuditAction[] = [
  'create', 'update', 'delete', 'view', 'export', 'approve', 'sign_in', 'sign_out',
];

const PAGE_SIZE = 10;

export default function AuditLogPage(): React.ReactElement {
  const [actionFilter, setActionFilter] = React.useState<AuditAction | ''>('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  // ---- Filtering (client-side on demo data; swap for server-side later) ----
  const filteredLogs = React.useMemo(() => {
    let logs = DEMO_AUDIT_LOGS;

    if (actionFilter) {
      logs = logs.filter((l) => l.action === actionFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      logs = logs.filter((l) => new Date(l.created_at).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000; // end of day
      logs = logs.filter((l) => new Date(l.created_at).getTime() <= to);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.user_name.toLowerCase().includes(term) ||
          l.resource_type.toLowerCase().includes(term) ||
          formatDetails(l.details).toLowerCase().includes(term),
      );
    }

    return logs;
  }, [actionFilter, dateFrom, dateTo, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, dateFrom, dateTo, searchTerm]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ScrollText className="h-6 w-6" />
          Audit Log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View a chronological record of all actions performed across the organization.
        </p>
      </div>

      <Separator />

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-1.5">
              <Label htmlFor="audit-search" className="text-xs">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="audit-search"
                  placeholder="User, resource, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {/* Action filter */}
            <div className="space-y-1.5">
              <Label htmlFor="audit-action" className="text-xs">
                Action Type
              </Label>
              <select
                id="audit-action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as AuditAction | '')}
                className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">All Actions</option>
                {ALL_ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {ACTION_CONFIG[a].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div className="space-y-1.5">
              <Label htmlFor="audit-from" className="text-xs">
                From Date
              </Label>
              <Input
                id="audit-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Date to */}
            <div className="space-y-1.5">
              <Label htmlFor="audit-to" className="text-xs">
                To Date
              </Label>
              <Input
                id="audit-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit log table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Activity Records</CardTitle>
              <CardDescription>
                {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    User
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Action
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resource
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No audit log entries match the current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={cn(
                        'border-b border-border transition-colors hover:bg-muted/50',
                        idx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                      )}
                    >
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {log.user_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.user_email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {formatResourceType(log.resource_type)}
                        </span>
                        {log.resource_id && (
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                            {log.resource_id}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-[250px]">
                        <p className="text-xs text-muted-foreground truncate">
                          {formatDetails(log.details)}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
