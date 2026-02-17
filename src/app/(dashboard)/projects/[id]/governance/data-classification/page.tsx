'use client';

import { useState, useCallback } from 'react';
import * as React from 'react';
import {
  Database,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Fingerprint,
  HardDrive,
  Cloud,
  FileSpreadsheet,
  Radio,
  Server,
  ScanSearch,
  Filter,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { DataAssetRecord, DataClassificationLevel } from '@/types';

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const classificationColors: Record<DataClassificationLevel, string> = {
  public: 'bg-green-100 text-green-800 border-green-200',
  internal: 'bg-blue-100 text-blue-800 border-blue-200',
  confidential: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  restricted: 'bg-red-100 text-red-800 border-red-200',
};

const classificationLabels: Record<DataClassificationLevel, string> = {
  public: 'Public',
  internal: 'Internal',
  confidential: 'Confidential',
  restricted: 'Restricted',
};

const classificationDescriptions: Record<DataClassificationLevel, string> = {
  public: 'Freely shareable, no business impact if disclosed',
  internal: 'For internal use only, minor impact if disclosed',
  confidential: 'Sensitive business data, significant impact if disclosed',
  restricted: 'Highly sensitive (PII, secrets), severe impact if disclosed',
};

const typeIcons: Record<string, React.ReactNode> = {
  database: <Database className="h-4 w-4" />,
  data_lake: <Cloud className="h-4 w-4" />,
  api: <Server className="h-4 w-4" />,
  file_system: <HardDrive className="h-4 w-4" />,
  streaming: <Radio className="h-4 w-4" />,
  feature_store: <Database className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  spreadsheet: <FileSpreadsheet className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  database: 'Database',
  data_lake: 'Data Lake',
  api: 'API',
  file_system: 'File System',
  streaming: 'Streaming',
  feature_store: 'Feature Store',
  document: 'Document',
  spreadsheet: 'Spreadsheet',
};

const retentionLabels: Record<string, string> = {
  '30_days': '30 Days',
  '90_days': '90 Days',
  '1_year': '1 Year',
  '3_years': '3 Years',
  '7_years': '7 Years',
  indefinite: 'Indefinite',
};

const lawfulBasisLabels: Record<string, string> = {
  consent: 'Consent',
  contract: 'Contract',
  legal_obligation: 'Legal Obligation',
  vital_interest: 'Vital Interest',
  public_task: 'Public Task',
  legitimate_interest: 'Legitimate Interest',
};

function generateId(): string {
  return `da-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Inline demo data
// ---------------------------------------------------------------------------

const DEMO_ASSETS: DataAssetRecord[] = [
  {
    id: 'da-001',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Customer CRM Database',
    description: 'Primary customer relationship management database containing contact information, interaction history, and account details.',
    type: 'database',
    domain: 'Sales',
    owner_id: 'user-001',
    owner_name: 'Sarah Chen',
    classification: 'confidential',
    lawful_basis: 'contract',
    retention_period: '3_years',
    retention_expires_at: null,
    source_system: 'Salesforce',
    contains_pii: true,
    pii_types: ['email', 'phone', 'name', 'address'],
    ai_relevance: 'inference',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-15T10:30:00Z',
    created_by: 'user-001',
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2025-11-15T10:30:00Z',
    deleted_at: null,
  },
  {
    id: 'da-002',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Product Analytics Data Lake',
    description: 'Aggregated product usage analytics and telemetry data used for feature adoption analysis.',
    type: 'data_lake',
    domain: 'Product',
    owner_id: 'user-002',
    owner_name: 'Marcus Rivera',
    classification: 'internal',
    lawful_basis: 'legitimate_interest',
    retention_period: '1_year',
    retention_expires_at: null,
    source_system: 'Snowflake',
    contains_pii: false,
    pii_types: [],
    ai_relevance: 'training',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-10T14:00:00Z',
    created_by: 'user-002',
    created_at: '2025-09-20T12:00:00Z',
    updated_at: '2025-11-10T14:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-003',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Employee HR Records',
    description: 'Human resources records including payroll, performance reviews, and personal employee information.',
    type: 'database',
    domain: 'Human Resources',
    owner_id: 'user-004',
    owner_name: 'Lisa Park',
    classification: 'restricted',
    lawful_basis: 'legal_obligation',
    retention_period: '7_years',
    retention_expires_at: null,
    source_system: 'Workday',
    contains_pii: true,
    pii_types: ['ssn', 'name', 'address', 'salary', 'date_of_birth'],
    ai_relevance: 'none',
    approved: true,
    approved_by: 'user-005',
    approved_at: '2025-10-20T09:00:00Z',
    created_by: 'user-004',
    created_at: '2025-08-15T10:00:00Z',
    updated_at: '2025-10-20T09:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-004',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Public Marketing Content',
    description: 'Published marketing materials, blog posts, and public-facing documentation.',
    type: 'document',
    domain: 'Marketing',
    owner_id: 'user-006',
    owner_name: 'James Wu',
    classification: 'public',
    lawful_basis: null,
    retention_period: 'indefinite',
    retention_expires_at: null,
    source_system: 'Contentful',
    contains_pii: false,
    pii_types: [],
    ai_relevance: 'training',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-01T16:00:00Z',
    created_by: 'user-006',
    created_at: '2025-10-05T11:00:00Z',
    updated_at: '2025-11-01T16:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-005',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Financial Transaction Logs',
    description: 'Real-time transaction processing logs from the payment system, containing payment details and audit trails.',
    type: 'streaming',
    domain: 'Finance',
    owner_id: 'user-007',
    owner_name: 'Priya Sharma',
    classification: 'restricted',
    lawful_basis: 'legal_obligation',
    retention_period: '7_years',
    retention_expires_at: null,
    source_system: 'Stripe / Kafka',
    contains_pii: true,
    pii_types: ['payment_card', 'email', 'name', 'billing_address'],
    ai_relevance: 'none',
    approved: false,
    approved_by: null,
    approved_at: null,
    created_by: 'user-007',
    created_at: '2025-11-20T08:00:00Z',
    updated_at: '2025-11-20T08:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-006',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Internal API Gateway Logs',
    description: 'API request/response logs from the internal gateway used for debugging and performance monitoring.',
    type: 'api',
    domain: 'Engineering',
    owner_id: 'user-008',
    owner_name: 'Alex Kim',
    classification: 'internal',
    lawful_basis: 'legitimate_interest',
    retention_period: '90_days',
    retention_expires_at: null,
    source_system: 'Kong Gateway',
    contains_pii: false,
    pii_types: [],
    ai_relevance: 'inference',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-18T11:00:00Z',
    created_by: 'user-008',
    created_at: '2025-11-12T09:00:00Z',
    updated_at: '2025-11-18T11:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-007',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Customer Support Tickets',
    description: 'Support ticket data including customer communications, issue details, and resolution notes.',
    type: 'database',
    domain: 'Support',
    owner_id: 'user-009',
    owner_name: 'Rachel Torres',
    classification: 'confidential',
    lawful_basis: 'contract',
    retention_period: '3_years',
    retention_expires_at: null,
    source_system: 'Zendesk',
    contains_pii: true,
    pii_types: ['email', 'name', 'phone'],
    ai_relevance: 'both',
    approved: true,
    approved_by: 'user-003',
    approved_at: '2025-11-14T13:00:00Z',
    created_by: 'user-009',
    created_at: '2025-10-28T10:00:00Z',
    updated_at: '2025-11-14T13:00:00Z',
    deleted_at: null,
  },
  {
    id: 'da-008',
    project_id: 'proj-demo-001',
    organization_id: 'org-demo-001',
    name: 'Quarterly Revenue Spreadsheet',
    description: 'Executive-level revenue summaries and forecasts maintained in spreadsheets for board reporting.',
    type: 'spreadsheet',
    domain: 'Finance',
    owner_id: 'user-010',
    owner_name: 'Tom Bradley',
    classification: 'confidential',
    lawful_basis: null,
    retention_period: '3_years',
    retention_expires_at: null,
    source_system: 'Google Sheets',
    contains_pii: false,
    pii_types: [],
    ai_relevance: 'none',
    approved: false,
    approved_by: null,
    approved_at: null,
    created_by: 'user-010',
    created_at: '2025-12-01T15:00:00Z',
    updated_at: '2025-12-01T15:00:00Z',
    deleted_at: null,
  },
];

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface AssetFormState {
  name: string;
  description: string;
  type: string;
  domain: string;
  owner_name: string;
  classification: DataClassificationLevel;
  lawful_basis: string;
  retention_period: string;
  source_system: string;
  contains_pii: boolean;
  pii_types: string;
}

const emptyForm: AssetFormState = {
  name: '',
  description: '',
  type: 'database',
  domain: '',
  owner_name: '',
  classification: 'internal',
  lawful_basis: '',
  retention_period: '',
  source_system: '',
  contains_pii: false,
  pii_types: '',
};

// ---------------------------------------------------------------------------
// Scan result display types
// ---------------------------------------------------------------------------

interface PiiDetection {
  field_name: string;
  pii_type: string;
  confidence: number;
  sample_count: number;
}

interface ScanResultItem {
  data_asset_id: string;
  data_asset_name: string;
  total_fields_scanned: number;
  detections: PiiDetection[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface ScanResultData {
  scan_id: string;
  total_assets_scanned: number;
  total_pii_detections: number;
  results: ScanResultItem[];
}

// ---------------------------------------------------------------------------
// Summary card component
// ---------------------------------------------------------------------------

function SummaryCard({
  title,
  value,
  icon,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  color?: string;
}): React.ReactElement {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className={cn('text-2xl font-bold mt-1', color ?? 'text-slate-900')}>{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div className="rounded-lg bg-slate-100 p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Detail dialog for viewing a single asset
// ---------------------------------------------------------------------------

function AssetDetailDialog({
  asset,
  open,
  onClose,
}: {
  asset: DataAssetRecord | null;
  open: boolean;
  onClose: () => void;
}): React.ReactElement | null {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeIcons[asset.type] ?? <Database className="h-4 w-4" />}
            {asset.name}
          </DialogTitle>
          <DialogDescription>Data asset details and classification information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</span>
            <p className="text-sm text-slate-700 mt-1">{asset.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Classification</span>
              <div className="mt-1">
                <Badge className={cn('capitalize', classificationColors[asset.classification])}>
                  {classificationLabels[asset.classification]}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">{classificationDescriptions[asset.classification]}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</span>
              <p className="text-sm text-slate-700 mt-1 flex items-center gap-1.5">
                {typeIcons[asset.type]} {typeLabels[asset.type] ?? asset.type}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Domain</span>
              <p className="text-sm text-slate-700 mt-1">{asset.domain}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Owner</span>
              <p className="text-sm text-slate-700 mt-1">{asset.owner_name ?? 'Unassigned'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Source System</span>
              <p className="text-sm text-slate-700 mt-1">{asset.source_system ?? 'N/A'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Retention</span>
              <p className="text-sm text-slate-700 mt-1">
                {asset.retention_period ? retentionLabels[asset.retention_period] ?? asset.retention_period : 'Not set'}
              </p>
            </div>
          </div>

          {asset.lawful_basis && (
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lawful Basis</span>
              <p className="text-sm text-slate-700 mt-1">{lawfulBasisLabels[asset.lawful_basis] ?? asset.lawful_basis}</p>
            </div>
          )}

          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contains PII</span>
            <div className="flex items-center gap-2 mt-1">
              {asset.contains_pii ? (
                <>
                  <Fingerprint className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700 font-medium">Yes</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700 font-medium">No</span>
                </>
              )}
            </div>
            {asset.contains_pii && asset.pii_types.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {asset.pii_types.map((piiType) => (
                  <Badge key={piiType} className="bg-red-50 text-red-700 border-red-200 text-xs">
                    {piiType}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Approval Status</span>
            <div className="flex items-center gap-2 mt-1">
              {asset.approved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700 font-medium">Approved</span>
                  {asset.approved_at && (
                    <span className="text-xs text-slate-400">
                      on {new Date(asset.approved_at).toLocaleDateString()}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-700 font-medium">Pending Approval</span>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DataClassificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.id;

  // State
  const [assets, setAssets] = useState<DataAssetRecord[]>(DEMO_ASSETS);
  const [filterClassification, setFilterClassification] = useState<DataClassificationLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, setForm] = useState<AssetFormState>(emptyForm);
  const [detailAsset, setDetailAsset] = useState<DataAssetRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResultData | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  // Derived data
  const filteredAssets = assets.filter((a) => {
    if (filterClassification !== 'all' && a.classification !== filterClassification) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.domain.toLowerCase().includes(q) ||
        (a.owner_name ?? '').toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAssets = assets.length;
  const byClassification: Record<DataClassificationLevel, number> = {
    public: assets.filter((a) => a.classification === 'public').length,
    internal: assets.filter((a) => a.classification === 'internal').length,
    confidential: assets.filter((a) => a.classification === 'confidential').length,
    restricted: assets.filter((a) => a.classification === 'restricted').length,
  };
  const piiPercentage = totalAssets > 0
    ? Math.round((assets.filter((a) => a.contains_pii).length / totalAssets) * 100)
    : 0;
  const approvedCount = assets.filter((a) => a.approved).length;
  const pendingCount = totalAssets - approvedCount;

  // Handlers
  const openAddDialog = useCallback(() => {
    setForm(emptyForm);
    setAddDialogOpen(true);
  }, []);

  const handleFormChange = useCallback((field: keyof AssetFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveAsset = useCallback(() => {
    if (!form.name.trim() || !form.description.trim() || !form.domain.trim()) return;

    const now = new Date().toISOString();
    const newAsset: DataAssetRecord = {
      id: generateId(),
      project_id: projectId,
      organization_id: 'org-demo-001',
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type as DataAssetRecord['type'],
      domain: form.domain.trim(),
      owner_id: null,
      owner_name: form.owner_name.trim() || null,
      classification: form.classification,
      lawful_basis: form.lawful_basis ? (form.lawful_basis as DataAssetRecord['lawful_basis']) : null,
      retention_period: form.retention_period ? (form.retention_period as DataAssetRecord['retention_period']) : null,
      retention_expires_at: null,
      source_system: form.source_system.trim() || null,
      contains_pii: form.contains_pii,
      pii_types: form.pii_types
        ? form.pii_types.split(',').map((s) => s.trim()).filter((s): s is string => Boolean(s))
        : [],
      ai_relevance: 'none',
      approved: false,
      approved_by: null,
      approved_at: null,
      created_by: 'current-user',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    setAssets((prev) => [newAsset, ...prev]);
    setAddDialogOpen(false);
  }, [form, projectId]);

  const handleViewDetail = useCallback((asset: DataAssetRecord) => {
    setDetailAsset(asset);
    setDetailDialogOpen(true);
  }, []);

  const handleRunScan = useCallback(async () => {
    setScanLoading(true);
    setScanDialogOpen(true);

    // Simulate a scan delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const demoScanResults: ScanResultData = {
      scan_id: `scan-${Date.now()}`,
      total_assets_scanned: 4,
      total_pii_detections: 12,
      results: [
        {
          data_asset_id: 'da-001',
          data_asset_name: 'Customer CRM Database',
          total_fields_scanned: 42,
          detections: [
            { field_name: 'customer_email', pii_type: 'email', confidence: 0.98, sample_count: 15420 },
            { field_name: 'customer_phone', pii_type: 'phone', confidence: 0.95, sample_count: 12380 },
            { field_name: 'full_name', pii_type: 'name', confidence: 0.97, sample_count: 15420 },
            { field_name: 'billing_address', pii_type: 'address', confidence: 0.92, sample_count: 11200 },
          ],
          risk_level: 'high',
        },
        {
          data_asset_id: 'da-003',
          data_asset_name: 'Employee HR Records',
          total_fields_scanned: 68,
          detections: [
            { field_name: 'ssn', pii_type: 'ssn', confidence: 0.99, sample_count: 3200 },
            { field_name: 'employee_name', pii_type: 'name', confidence: 0.96, sample_count: 3200 },
            { field_name: 'home_address', pii_type: 'address', confidence: 0.94, sample_count: 3200 },
            { field_name: 'date_of_birth', pii_type: 'date_of_birth', confidence: 0.97, sample_count: 3200 },
            { field_name: 'salary', pii_type: 'financial', confidence: 0.88, sample_count: 3200 },
          ],
          risk_level: 'critical',
        },
        {
          data_asset_id: 'da-005',
          data_asset_name: 'Financial Transaction Logs',
          total_fields_scanned: 35,
          detections: [
            { field_name: 'card_last_four', pii_type: 'payment_card', confidence: 0.91, sample_count: 89500 },
            { field_name: 'payer_email', pii_type: 'email', confidence: 0.96, sample_count: 89500 },
          ],
          risk_level: 'critical',
        },
        {
          data_asset_id: 'da-007',
          data_asset_name: 'Customer Support Tickets',
          total_fields_scanned: 28,
          detections: [],
          risk_level: 'low',
        },
      ],
    };

    setScanResults(demoScanResults);
    setScanLoading(false);
  }, []);

  const scanRiskColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };

  // Suppress unused variable lint
  void projectId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Classification & Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Catalog data assets, assign classification levels, and track PII exposure across your organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRunScan}>
            <ScanSearch className="h-4 w-4 mr-2" />
            Run PII Scan
          </Button>
          <Button onClick={openAddDialog} className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Data Asset
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Assets"
          value={totalAssets}
          icon={<Database className="h-5 w-5 text-slate-600" />}
          subtitle={`${filteredAssets.length} shown`}
        />
        <SummaryCard
          title="Restricted"
          value={byClassification.restricted}
          icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
          color="text-red-600"
          subtitle="Highest sensitivity"
        />
        <SummaryCard
          title="Confidential"
          value={byClassification.confidential}
          icon={<Shield className="h-5 w-5 text-yellow-600" />}
          color="text-yellow-600"
        />
        <SummaryCard
          title="Contains PII"
          value={`${piiPercentage}%`}
          icon={<Fingerprint className="h-5 w-5 text-orange-600" />}
          color="text-orange-600"
          subtitle={`${assets.filter((a) => a.contains_pii).length} of ${totalAssets} assets`}
        />
        <SummaryCard
          title="Pending Approval"
          value={pendingCount}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          color={pendingCount > 0 ? 'text-amber-600' : 'text-green-600'}
          subtitle={`${approvedCount} approved`}
        />
      </div>

      {/* Classification distribution bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-slate-700">Classification Distribution</span>
          </div>
          <div className="flex rounded-full overflow-hidden h-3">
            {totalAssets > 0 && (
              <>
                {byClassification.restricted > 0 && (
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${(byClassification.restricted / totalAssets) * 100}%` }}
                    title={`Restricted: ${byClassification.restricted}`}
                  />
                )}
                {byClassification.confidential > 0 && (
                  <div
                    className="bg-yellow-500 transition-all"
                    style={{ width: `${(byClassification.confidential / totalAssets) * 100}%` }}
                    title={`Confidential: ${byClassification.confidential}`}
                  />
                )}
                {byClassification.internal > 0 && (
                  <div
                    className="bg-blue-500 transition-all"
                    style={{ width: `${(byClassification.internal / totalAssets) * 100}%` }}
                    title={`Internal: ${byClassification.internal}`}
                  />
                )}
                {byClassification.public > 0 && (
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${(byClassification.public / totalAssets) * 100}%` }}
                    title={`Public: ${byClassification.public}`}
                  />
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> Restricted ({byClassification.restricted})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" /> Confidential ({byClassification.confidential})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> Internal ({byClassification.internal})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> Public ({byClassification.public})</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters & search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search assets by name, domain, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select
            value={filterClassification}
            onValueChange={(v) => setFilterClassification(v as DataClassificationLevel | 'all')}
            className="w-44"
          >
            <SelectOption value="all">All Classifications</SelectOption>
            <SelectOption value="restricted">Restricted</SelectOption>
            <SelectOption value="confidential">Confidential</SelectOption>
            <SelectOption value="internal">Internal</SelectOption>
            <SelectOption value="public">Public</SelectOption>
          </Select>
        </div>
      </div>

      {/* Data assets table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Data Asset Inventory ({filteredAssets.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Domain</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Classification</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">PII</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      <ShieldOff className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium">No data assets found</p>
                      <p className="text-xs mt-1">
                        {searchQuery || filterClassification !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Add your first data asset to get started'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{typeIcons[asset.type] ?? <Database className="h-4 w-4" />}</span>
                          <span className="font-medium text-slate-900">{asset.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {typeLabels[asset.type] ?? asset.type}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{asset.domain}</td>
                      <td className="py-3 px-4">
                        <Badge className={cn('capitalize', classificationColors[asset.classification])}>
                          {classificationLabels[asset.classification]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {asset.contains_pii ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <Fingerprint className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Yes</span>
                            {asset.pii_types.length > 0 && (
                              <span className="text-xs text-slate-400 ml-1">
                                ({asset.pii_types.length})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">No</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {asset.owner_name ?? <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4">
                        {asset.approved ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(asset)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add data asset dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Data Asset</DialogTitle>
            <DialogDescription>Register a new data asset and assign its classification level.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="asset-name">Name *</Label>
              <Input
                id="asset-name"
                placeholder="e.g., Customer Transactions Database"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="asset-desc">Description *</Label>
              <Textarea
                id="asset-desc"
                placeholder="Describe what data this asset contains and its purpose..."
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asset-type">Type *</Label>
                <Select
                  id="asset-type"
                  value={form.type}
                  onValueChange={(v) => handleFormChange('type', v)}
                  className="mt-1"
                >
                  <SelectOption value="database">Database</SelectOption>
                  <SelectOption value="data_lake">Data Lake</SelectOption>
                  <SelectOption value="api">API</SelectOption>
                  <SelectOption value="file_system">File System</SelectOption>
                  <SelectOption value="streaming">Streaming</SelectOption>
                  <SelectOption value="feature_store">Feature Store</SelectOption>
                  <SelectOption value="document">Document</SelectOption>
                  <SelectOption value="spreadsheet">Spreadsheet</SelectOption>
                </Select>
              </div>
              <div>
                <Label htmlFor="asset-domain">Domain *</Label>
                <Input
                  id="asset-domain"
                  placeholder="e.g., Sales, Engineering"
                  value={form.domain}
                  onChange={(e) => handleFormChange('domain', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="asset-classification">Classification Level *</Label>
              <Select
                id="asset-classification"
                value={form.classification}
                onValueChange={(v) => handleFormChange('classification', v)}
                className="mt-1"
              >
                <SelectOption value="public">Public - Freely shareable</SelectOption>
                <SelectOption value="internal">Internal - For internal use only</SelectOption>
                <SelectOption value="confidential">Confidential - Sensitive business data</SelectOption>
                <SelectOption value="restricted">Restricted - Highly sensitive (PII, secrets)</SelectOption>
              </Select>
              <p className="text-xs text-slate-400 mt-1">
                {classificationDescriptions[form.classification]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asset-owner">Owner</Label>
                <Input
                  id="asset-owner"
                  placeholder="e.g., Jane Doe"
                  value={form.owner_name}
                  onChange={(e) => handleFormChange('owner_name', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="asset-source">Source System</Label>
                <Input
                  id="asset-source"
                  placeholder="e.g., Salesforce"
                  value={form.source_system}
                  onChange={(e) => handleFormChange('source_system', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asset-lawful-basis">Lawful Basis (GDPR)</Label>
                <Select
                  id="asset-lawful-basis"
                  value={form.lawful_basis}
                  onValueChange={(v) => handleFormChange('lawful_basis', v)}
                  className="mt-1"
                >
                  <SelectOption value="">Not applicable</SelectOption>
                  <SelectOption value="consent">Consent</SelectOption>
                  <SelectOption value="contract">Contract</SelectOption>
                  <SelectOption value="legal_obligation">Legal Obligation</SelectOption>
                  <SelectOption value="vital_interest">Vital Interest</SelectOption>
                  <SelectOption value="public_task">Public Task</SelectOption>
                  <SelectOption value="legitimate_interest">Legitimate Interest</SelectOption>
                </Select>
              </div>
              <div>
                <Label htmlFor="asset-retention">Retention Period</Label>
                <Select
                  id="asset-retention"
                  value={form.retention_period}
                  onValueChange={(v) => handleFormChange('retention_period', v)}
                  className="mt-1"
                >
                  <SelectOption value="">Not set</SelectOption>
                  <SelectOption value="30_days">30 Days</SelectOption>
                  <SelectOption value="90_days">90 Days</SelectOption>
                  <SelectOption value="1_year">1 Year</SelectOption>
                  <SelectOption value="3_years">3 Years</SelectOption>
                  <SelectOption value="7_years">7 Years</SelectOption>
                  <SelectOption value="indefinite">Indefinite</SelectOption>
                </Select>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="asset-pii"
                  checked={form.contains_pii}
                  onCheckedChange={(checked) => handleFormChange('contains_pii', checked)}
                />
                <Label htmlFor="asset-pii" className="cursor-pointer">
                  Contains Personally Identifiable Information (PII)
                </Label>
              </div>
              {form.contains_pii && (
                <div>
                  <Label htmlFor="asset-pii-types">PII Types (comma-separated)</Label>
                  <Input
                    id="asset-pii-types"
                    placeholder="e.g., email, phone, ssn, name, address"
                    value={form.pii_types}
                    onChange={(e) => handleFormChange('pii_types', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Common types: email, phone, name, address, ssn, date_of_birth, payment_card, salary
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAsset}
              disabled={!form.name.trim() || !form.description.trim() || !form.domain.trim()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset detail dialog */}
      <AssetDetailDialog
        asset={detailAsset}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />

      {/* PII Scan results dialog */}
      <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanSearch className="h-5 w-5" />
              PII Scan Results
            </DialogTitle>
            <DialogDescription>
              Automated scan for personally identifiable information across registered data assets.
            </DialogDescription>
          </DialogHeader>

          {scanLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
              <p className="text-sm text-slate-500 mt-4">Scanning data assets for PII patterns...</p>
            </div>
          ) : scanResults ? (
            <div className="space-y-4 mt-2">
              {/* Scan summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{scanResults.total_assets_scanned}</p>
                  <p className="text-xs text-slate-500">Assets Scanned</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{scanResults.total_pii_detections}</p>
                  <p className="text-xs text-slate-500">PII Detections</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {scanResults.results.filter((r) => r.risk_level === 'critical' || r.risk_level === 'high').length}
                  </p>
                  <p className="text-xs text-slate-500">High/Critical Risk</p>
                </div>
              </div>

              {/* Per-asset results */}
              {scanResults.results.map((result) => (
                <Card key={result.data_asset_id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-slate-900">{result.data_asset_name}</p>
                        <p className="text-xs text-slate-400">{result.total_fields_scanned} fields scanned</p>
                      </div>
                      <Badge className={cn('capitalize', scanRiskColors[result.risk_level] ?? 'bg-slate-100 text-slate-700')}>
                        {result.risk_level} risk
                      </Badge>
                    </div>
                    {result.detections.length > 0 ? (
                      <div className="space-y-2">
                        {result.detections.map((d) => (
                          <div
                            key={d.field_name}
                            className="flex items-center justify-between text-sm rounded-md bg-slate-50 px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Fingerprint className="h-3.5 w-3.5 text-red-500" />
                              <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded">{d.field_name}</code>
                              <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">{d.pii_type}</Badge>
                            </div>
                            <span className="text-xs text-slate-500">
                              {Math.round(d.confidence * 100)}% confidence
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" />
                        No PII detected
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setScanDialogOpen(false)}>
              Close
            </Button>
            {scanResults && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
