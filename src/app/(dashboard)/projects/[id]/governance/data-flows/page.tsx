'use client';

import { useState, useCallback } from 'react';
import * as React from 'react';
import {
  Network,
  Plus,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldAlert,
  Server,
  GitBranch,
  Users,
  Bot,
  Workflow,
  Info,
  Download,
  Pencil,
  Trash2,
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
import type {
  DataFlowSystem,
  DataFlowRiskPoint,
  VendorAssessment,
  RiskTier,
} from '@/types';

// ---------- Helpers ----------

type TabId = 'systems' | 'risks' | 'vendors';

const tierColors: Record<RiskTier, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const tierDotColors: Record<RiskTier, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const classificationColors: Record<DataFlowSystem['data_classification'], string> = {
  public: 'bg-green-100 text-green-800 border-green-200',
  internal: 'bg-blue-100 text-blue-800 border-blue-200',
  confidential: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  restricted: 'bg-red-100 text-red-800 border-red-200',
};

const classificationDescriptions: Record<DataFlowSystem['data_classification'], string> = {
  public: 'Freely shareable, no business impact if disclosed',
  internal: 'For internal use only, minor impact if disclosed',
  confidential: 'Sensitive business data, significant impact if disclosed',
  restricted: 'Highly sensitive (PII, secrets), severe impact if disclosed',
};

const statusColors: Record<DataFlowRiskPoint['status'], string> = {
  open: 'bg-red-100 text-red-800 border-red-200',
  mitigated: 'bg-green-100 text-green-800 border-green-200',
  accepted: 'bg-slate-100 text-slate-700 border-slate-200',
};

const integrationTypeLabels: Record<string, string> = {
  direct_api: 'Direct API',
  embedded: 'Embedded',
  middleware: 'Middleware',
  on_premise: 'On-Premise',
  rag_vector: 'RAG / Vector',
};

function getScoreSeverity(score: number): RiskTier {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function getScoreColor(score: number): string {
  if (score >= 9) return 'bg-red-600 text-white';
  if (score >= 7) return 'bg-orange-500 text-white';
  if (score >= 4) return 'bg-yellow-500 text-white';
  return 'bg-green-500 text-white';
}

function getSystemIcon(type: string): React.ReactNode {
  switch (type) {
    case 'Version Control':
      return <GitBranch className="h-5 w-5 text-slate-500" />;
    case 'Enterprise Application':
      return <Users className="h-5 w-5 text-slate-500" />;
    case 'SaaS Application':
      return <Database className="h-5 w-5 text-slate-500" />;
    case 'Developer Tool':
      return <Bot className="h-5 w-5 text-slate-500" />;
    case 'Infrastructure':
      return <Workflow className="h-5 w-5 text-slate-500" />;
    default:
      return <Server className="h-5 w-5 text-slate-500" />;
  }
}

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ---------- Form State Types ----------

interface SystemFormState {
  name: string;
  type: string;
  data_types: string;
  ai_integration: boolean;
  ai_service: string;
  integration_type: string;
  data_classification: string;
}

const emptySystemForm: SystemFormState = {
  name: '',
  type: '',
  data_types: '',
  ai_integration: false,
  ai_service: '',
  integration_type: '',
  data_classification: 'internal',
};

interface RiskFormState {
  system_id: string;
  risk_description: string;
  data_type: string;
  threat: string;
  score: string;
  current_control: string;
  recommended_control: string;
  status: string;
}

const emptyRiskForm: RiskFormState = {
  system_id: '',
  risk_description: '',
  data_type: '',
  threat: '',
  score: '5',
  current_control: '',
  recommended_control: '',
  status: 'open',
};

interface VendorFormState {
  vendor_name: string;
  service: string;
  data_access: string;
  risk_rating: string;
  has_dpa: boolean;
  has_training_optout: boolean;
  has_deletion_rights: boolean;
  has_audit_rights: boolean;
  key_concerns: string;
}

const emptyVendorForm: VendorFormState = {
  vendor_name: '',
  service: '',
  data_access: '',
  risk_rating: 'medium',
  has_dpa: false,
  has_training_optout: false,
  has_deletion_rights: false,
  has_audit_rights: false,
  key_concerns: '',
};

// ---------- Page Component ----------

export default function DataFlowsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.id;

  // Core data state -- starts empty
  const [systems, setSystems] = useState<DataFlowSystem[]>([]);
  const [riskPoints, setRiskPoints] = useState<DataFlowRiskPoint[]>([]);
  const [vendors, setVendors] = useState<VendorAssessment[]>([]);

  const [activeTab, setActiveTab] = useState<TabId>('systems');

  // Dialog state
  const [systemDialogOpen, setSystemDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);

  // Editing id (null = creating new)
  const [editingSystemId, setEditingSystemId] = useState<string | null>(null);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // Form state
  const [systemForm, setSystemForm] = useState<SystemFormState>(emptySystemForm);
  const [riskForm, setRiskForm] = useState<RiskFormState>(emptyRiskForm);
  const [vendorForm, setVendorForm] = useState<VendorFormState>(emptyVendorForm);

  // Summary statistics
  const totalSystems = systems.length;
  const totalRiskPoints = riskPoints.length;
  const highRiskItems = riskPoints.filter(
    (r) => getScoreSeverity(r.score) === 'critical' || getScoreSeverity(r.score) === 'high'
  ).length;
  const vendorCount = vendors.length;
  const openRisks = riskPoints.filter((r) => r.status === 'open').length;
  const aiIntegratedSystems = systems.filter((s) => s.ai_integration).length;

  // Sorted risk points by score descending
  const sortedRiskPoints = [...riskPoints].sort((a, b) => b.score - a.score);

  // Group risk points by severity
  const risksBySeverity: Record<RiskTier, DataFlowRiskPoint[]> = {
    critical: sortedRiskPoints.filter((r) => getScoreSeverity(r.score) === 'critical'),
    high: sortedRiskPoints.filter((r) => getScoreSeverity(r.score) === 'high'),
    medium: sortedRiskPoints.filter((r) => getScoreSeverity(r.score) === 'medium'),
    low: sortedRiskPoints.filter((r) => getScoreSeverity(r.score) === 'low'),
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'systems', label: 'Systems', icon: <Database className="h-4 w-4" /> },
    { id: 'risks', label: 'Risk Points', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'vendors', label: 'Vendors', icon: <Shield className="h-4 w-4" /> },
  ];

  // ---- System CRUD ----

  const openAddSystem = useCallback(() => {
    setEditingSystemId(null);
    setSystemForm(emptySystemForm);
    setSystemDialogOpen(true);
  }, []);

  const openEditSystem = useCallback((system: DataFlowSystem) => {
    setEditingSystemId(system.id);
    setSystemForm({
      name: system.name,
      type: system.type,
      data_types: system.data_types.join(', '),
      ai_integration: system.ai_integration,
      ai_service: system.ai_service ?? '',
      integration_type: system.integration_type ?? '',
      data_classification: system.data_classification,
    });
    setSystemDialogOpen(true);
  }, []);

  const saveSystem = useCallback(() => {
    const now = new Date().toISOString();
    const dataTypes = systemForm.data_types
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const integrationType = systemForm.integration_type || null;

    if (editingSystemId) {
      setSystems((prev) =>
        prev.map((s) =>
          s.id === editingSystemId
            ? {
                ...s,
                name: systemForm.name,
                type: systemForm.type,
                data_types: dataTypes,
                ai_integration: systemForm.ai_integration,
                ai_service: systemForm.ai_integration ? (systemForm.ai_service || null) : null,
                integration_type: systemForm.ai_integration
                  ? (integrationType as DataFlowSystem['integration_type'])
                  : null,
                data_classification: systemForm.data_classification as DataFlowSystem['data_classification'],
                updated_at: now,
              }
            : s
        )
      );
    } else {
      const newSystem: DataFlowSystem = {
        id: generateId(),
        project_id: projectId,
        name: systemForm.name,
        type: systemForm.type,
        data_types: dataTypes,
        ai_integration: systemForm.ai_integration,
        ai_service: systemForm.ai_integration ? (systemForm.ai_service || null) : null,
        integration_type: systemForm.ai_integration
          ? (integrationType as DataFlowSystem['integration_type'])
          : null,
        data_classification: systemForm.data_classification as DataFlowSystem['data_classification'],
        created_at: now,
        updated_at: now,
      };
      setSystems((prev) => [...prev, newSystem]);
    }
    setSystemDialogOpen(false);
  }, [systemForm, editingSystemId, projectId]);

  const deleteSystem = useCallback((id: string) => {
    setSystems((prev) => prev.filter((s) => s.id !== id));
    // Also remove associated risk points
    setRiskPoints((prev) => prev.filter((r) => r.system_id !== id));
  }, []);

  // ---- Risk Point CRUD ----

  const openAddRisk = useCallback(() => {
    setEditingRiskId(null);
    setRiskForm({
      ...emptyRiskForm,
      system_id: systems.length > 0 ? systems[0].id : '',
    });
    setRiskDialogOpen(true);
  }, [systems]);

  const openEditRisk = useCallback((risk: DataFlowRiskPoint) => {
    setEditingRiskId(risk.id);
    setRiskForm({
      system_id: risk.system_id,
      risk_description: risk.risk_description,
      data_type: risk.data_type,
      threat: risk.threat,
      score: String(risk.score),
      current_control: risk.current_control ?? '',
      recommended_control: risk.recommended_control,
      status: risk.status,
    });
    setRiskDialogOpen(true);
  }, []);

  const saveRisk = useCallback(() => {
    const scoreNum = Math.min(10, Math.max(1, parseFloat(riskForm.score) || 5));

    if (editingRiskId) {
      setRiskPoints((prev) =>
        prev.map((r) =>
          r.id === editingRiskId
            ? {
                ...r,
                system_id: riskForm.system_id,
                risk_description: riskForm.risk_description,
                data_type: riskForm.data_type,
                threat: riskForm.threat,
                score: scoreNum,
                current_control: riskForm.current_control || null,
                recommended_control: riskForm.recommended_control,
                status: riskForm.status as DataFlowRiskPoint['status'],
              }
            : r
        )
      );
    } else {
      const newRisk: DataFlowRiskPoint = {
        id: generateId(),
        project_id: projectId,
        system_id: riskForm.system_id,
        risk_description: riskForm.risk_description,
        data_type: riskForm.data_type,
        threat: riskForm.threat,
        score: scoreNum,
        current_control: riskForm.current_control || null,
        recommended_control: riskForm.recommended_control,
        status: riskForm.status as DataFlowRiskPoint['status'],
      };
      setRiskPoints((prev) => [...prev, newRisk]);
    }
    setRiskDialogOpen(false);
  }, [riskForm, editingRiskId, projectId]);

  const deleteRisk = useCallback((id: string) => {
    setRiskPoints((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ---- Vendor CRUD ----

  const openAddVendor = useCallback(() => {
    setEditingVendorId(null);
    setVendorForm(emptyVendorForm);
    setVendorDialogOpen(true);
  }, []);

  const openEditVendor = useCallback((vendor: VendorAssessment) => {
    setEditingVendorId(vendor.id);
    setVendorForm({
      vendor_name: vendor.vendor_name,
      service: vendor.service,
      data_access: vendor.data_access.join(', '),
      risk_rating: vendor.risk_rating,
      has_dpa: vendor.has_dpa,
      has_training_optout: vendor.has_training_optout,
      has_deletion_rights: vendor.has_deletion_rights,
      has_audit_rights: vendor.has_audit_rights,
      key_concerns: vendor.key_concerns.join(', '),
    });
    setVendorDialogOpen(true);
  }, []);

  const saveVendor = useCallback(() => {
    const dataAccess = vendorForm.data_access
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const keyConcerns = vendorForm.key_concerns
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (editingVendorId) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === editingVendorId
            ? {
                ...v,
                vendor_name: vendorForm.vendor_name,
                service: vendorForm.service,
                data_access: dataAccess,
                risk_rating: vendorForm.risk_rating as RiskTier,
                has_dpa: vendorForm.has_dpa,
                has_training_optout: vendorForm.has_training_optout,
                has_deletion_rights: vendorForm.has_deletion_rights,
                has_audit_rights: vendorForm.has_audit_rights,
                key_concerns: keyConcerns,
              }
            : v
        )
      );
    } else {
      const newVendor: VendorAssessment = {
        id: generateId(),
        project_id: projectId,
        vendor_name: vendorForm.vendor_name,
        service: vendorForm.service,
        data_access: dataAccess,
        risk_rating: vendorForm.risk_rating as RiskTier,
        has_dpa: vendorForm.has_dpa,
        has_training_optout: vendorForm.has_training_optout,
        has_deletion_rights: vendorForm.has_deletion_rights,
        has_audit_rights: vendorForm.has_audit_rights,
        key_concerns: keyConcerns,
      };
      setVendors((prev) => [...prev, newVendor]);
    }
    setVendorDialogOpen(false);
  }, [vendorForm, editingVendorId, projectId]);

  const deleteVendor = useCallback((id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // ---- Export ----

  const handleExport = useCallback(() => {
    const exportData = {
      project_id: projectId,
      exported_at: new Date().toISOString(),
      systems,
      risk_points: sortedRiskPoints,
      vendors,
      summary: {
        total_systems: totalSystems,
        ai_integrated_systems: aiIntegratedSystems,
        total_risk_points: totalRiskPoints,
        high_critical_risks: highRiskItems,
        open_risks: openRisks,
        total_vendors: vendorCount,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-flow-risk-map-${projectId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [projectId, systems, sortedRiskPoints, vendors, totalSystems, aiIntegratedSystems, totalRiskPoints, highRiskItems, openRisks, vendorCount]);

  // ---- Validation helpers ----

  const isSystemFormValid = systemForm.name.trim() !== '' && systemForm.type.trim() !== '';
  const isRiskFormValid =
    riskForm.system_id !== '' &&
    riskForm.risk_description.trim() !== '' &&
    riskForm.threat.trim() !== '' &&
    riskForm.recommended_control.trim() !== '';
  const isVendorFormValid =
    vendorForm.vendor_name.trim() !== '' && vendorForm.service.trim() !== '';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Network className="h-6 w-6 text-cyan-600" />
            Data Flow Risk Mapper
          </h1>
          <p className="text-slate-500 mt-1">
            Map data flows, AI integration points, and associated risks across your systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
            onClick={openAddSystem}
          >
            <Plus className="h-4 w-4" />
            Add System
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-50">
                <Database className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalSystems}</p>
                <p className="text-xs text-slate-500">Total Systems</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{aiIntegratedSystems}</p>
                <p className="text-xs text-slate-500">AI-Integrated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalRiskPoints}</p>
                <p className="text-xs text-slate-500">Risk Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{highRiskItems}</p>
                <p className="text-xs text-slate-500">High/Critical Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <XCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{openRisks}</p>
                <p className="text-xs text-slate-500">Open Risks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{vendorCount}</p>
                <p className="text-xs text-slate-500">Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== Systems Tab ========== */}
      {activeTab === 'systems' && (
        <div className="space-y-6">
          {systems.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <Database className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No systems mapped yet</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md">
                    Start by adding the systems in your organization that handle data or integrate
                    with AI services. This forms the foundation for risk mapping.
                  </p>
                  <Button
                    className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
                    onClick={openAddSystem}
                  >
                    <Plus className="h-4 w-4" />
                    Add First System
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Data Flow Inventory Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-cyan-600" />
                    Data Flow Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="py-3 px-3 font-medium text-slate-700">System</th>
                          <th className="py-3 px-3 font-medium text-slate-700">Type</th>
                          <th className="py-3 px-3 font-medium text-slate-700">Data Types</th>
                          <th className="py-3 px-3 font-medium text-slate-700 text-center">AI Integration</th>
                          <th className="py-3 px-3 font-medium text-slate-700">AI Service</th>
                          <th className="py-3 px-3 font-medium text-slate-700">Integration</th>
                          <th className="py-3 px-3 font-medium text-slate-700">Classification</th>
                          <th className="py-3 px-3 font-medium text-slate-700 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {systems.map((system) => (
                          <tr
                            key={system.id}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                {getSystemIcon(system.type)}
                                <span className="font-medium text-slate-900">{system.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-600">{system.type}</td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                {system.data_types.map((dt, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs border-slate-300 text-slate-600"
                                  >
                                    {dt}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {system.ai_integration ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600 text-xs">
                              {system.ai_service ? (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                  {system.ai_service}
                                </Badge>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600 text-xs">
                              {system.integration_type
                                ? integrationTypeLabels[system.integration_type] ?? system.integration_type
                                : <span className="text-slate-400">N/A</span>}
                            </td>
                            <td className="py-3 px-3">
                              <Badge className={classificationColors[system.data_classification]}>
                                {system.data_classification}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openEditSystem(system)}
                                >
                                  <Pencil className="h-4 w-4 text-slate-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => deleteSystem(system.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Data Classification Legend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-500" />
                    Data Classification Legend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(
                      ['public', 'internal', 'confidential', 'restricted'] as const
                    ).map((level) => {
                      const colorMap: Record<string, { bg: string; border: string; dot: string }> = {
                        public: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
                        internal: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
                        confidential: { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
                        restricted: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
                      };
                      const colors = colorMap[level];
                      return (
                        <div
                          key={level}
                          className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`h-3 w-3 rounded-full ${colors.dot}`} />
                            <span className="text-sm font-semibold capitalize text-slate-900">
                              {level}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            {classificationDescriptions[level]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ========== Risk Points Tab ========== */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          {riskPoints.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <AlertTriangle className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No risk points identified</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md">
                    {systems.length === 0
                      ? 'Add systems first, then identify risk points associated with each system.'
                      : 'Identify and document risk points for your mapped systems to track threats and controls.'}
                  </p>
                  <Button
                    className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
                    onClick={systems.length > 0 ? openAddRisk : openAddSystem}
                  >
                    <Plus className="h-4 w-4" />
                    {systems.length > 0 ? 'Add First Risk Point' : 'Add a System First'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Add Risk Point button */}
              <div className="flex justify-end">
                <Button
                  className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
                  onClick={openAddRisk}
                  disabled={systems.length === 0}
                >
                  <Plus className="h-4 w-4" />
                  Add Risk Point
                </Button>
              </div>

              {/* Risk score distribution bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700 shrink-0">
                      Risk Distribution:
                    </span>
                    <div className="flex-1 flex h-3 rounded-full overflow-hidden gap-0.5">
                      {risksBySeverity.critical.length > 0 && (
                        <div
                          className="bg-red-500 rounded-l-full"
                          style={{
                            width: `${(risksBySeverity.critical.length / totalRiskPoints) * 100}%`,
                          }}
                          title={`Critical: ${risksBySeverity.critical.length}`}
                        />
                      )}
                      {risksBySeverity.high.length > 0 && (
                        <div
                          className="bg-orange-500"
                          style={{
                            width: `${(risksBySeverity.high.length / totalRiskPoints) * 100}%`,
                          }}
                          title={`High: ${risksBySeverity.high.length}`}
                        />
                      )}
                      {risksBySeverity.medium.length > 0 && (
                        <div
                          className="bg-yellow-500"
                          style={{
                            width: `${(risksBySeverity.medium.length / totalRiskPoints) * 100}%`,
                          }}
                          title={`Medium: ${risksBySeverity.medium.length}`}
                        />
                      )}
                      {risksBySeverity.low.length > 0 && (
                        <div
                          className="bg-green-500 rounded-r-full"
                          style={{
                            width: `${(risksBySeverity.low.length / totalRiskPoints) * 100}%`,
                          }}
                          title={`Low: ${risksBySeverity.low.length}`}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                      {(['critical', 'high', 'medium', 'low'] as RiskTier[]).map((tier) => (
                        <span key={tier} className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${tierDotColors[tier]}`} />
                          {risksBySeverity[tier].length} {tier}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grouped risk point cards */}
              {(['critical', 'high', 'medium', 'low'] as RiskTier[]).map((severity) => {
                const risks = risksBySeverity[severity];
                if (risks.length === 0) return null;
                return (
                  <Card key={severity}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            severity === 'critical'
                              ? 'text-red-600'
                              : severity === 'high'
                              ? 'text-orange-500'
                              : severity === 'medium'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}
                        />
                        <CardTitle className="text-lg">
                          {severity.charAt(0).toUpperCase() + severity.slice(1)} Risk Points
                        </CardTitle>
                        <Badge className={tierColors[severity]}>{risks.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {risks.map((risk) => {
                          const system = systems.find((s) => s.id === risk.system_id);
                          return (
                            <div
                              key={risk.id}
                              className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={getScoreColor(risk.score)}>
                                    {risk.score.toFixed(1)}
                                  </Badge>
                                  <span className="text-xs font-medium text-slate-500">
                                    {system?.name ?? 'Unknown System'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={statusColors[risk.status]}>
                                    {risk.status}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => openEditRisk(risk)}
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => deleteRisk(risk.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-slate-900 mb-1">
                                {risk.risk_description}
                              </p>
                              <p className="text-xs text-slate-500 mb-3">
                                <span className="font-semibold">Threat:</span> {risk.threat}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div className="p-2 rounded bg-slate-50">
                                  <span className="font-medium text-slate-500 block mb-0.5">
                                    Data Type
                                  </span>
                                  <span className="text-slate-700">{risk.data_type}</span>
                                </div>
                                <div className="p-2 rounded bg-slate-50">
                                  <span className="font-medium text-slate-500 block mb-0.5">
                                    Current Control
                                  </span>
                                  <span className="text-slate-700">
                                    {risk.current_control ?? 'None'}
                                  </span>
                                </div>
                                <div className="p-2 rounded bg-blue-50">
                                  <span className="font-medium text-blue-700 block mb-0.5">
                                    Recommended Control
                                  </span>
                                  <span className="text-blue-600">
                                    {risk.recommended_control}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ========== Vendors Tab ========== */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          {vendors.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <Shield className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No vendors assessed</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md">
                    Assess AI and data vendors to track their data access, compliance posture,
                    and key concerns for your governance review.
                  </p>
                  <Button
                    className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
                    onClick={openAddVendor}
                  >
                    <Plus className="h-4 w-4" />
                    Add First Vendor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Add Vendor button */}
              <div className="flex justify-end">
                <Button
                  className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
                  onClick={openAddVendor}
                >
                  <Plus className="h-4 w-4" />
                  Add Vendor
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => {
                  const complianceChecks = [
                    { label: 'Data Processing Agreement (DPA)', value: vendor.has_dpa },
                    { label: 'Training Opt-Out', value: vendor.has_training_optout },
                    { label: 'Deletion Rights', value: vendor.has_deletion_rights },
                    { label: 'Audit Rights', value: vendor.has_audit_rights },
                  ];
                  const passCount = complianceChecks.filter((c) => c.value).length;

                  return (
                    <Card key={vendor.id} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-slate-900">
                              {vendor.vendor_name}
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-0.5">{vendor.service}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={tierColors[vendor.risk_rating]}>
                              {vendor.risk_rating} risk
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => openEditVendor(vendor)}
                            >
                              <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => deleteVendor(vendor.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        {/* Data Access */}
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            Data Access
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {vendor.data_access.map((item, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs border-slate-300 text-slate-600"
                              >
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Compliance Checks */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Compliance
                            </p>
                            <span className="text-xs text-slate-500">
                              {passCount}/{complianceChecks.length} passed
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {complianceChecks.map((check, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm"
                              >
                                {check.value ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                                )}
                                <span
                                  className={
                                    check.value ? 'text-slate-700' : 'text-slate-500'
                                  }
                                >
                                  {check.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Compliance progress bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              passCount === complianceChecks.length
                                ? 'bg-green-500'
                                : passCount >= complianceChecks.length / 2
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{
                              width: `${(passCount / complianceChecks.length) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Key Concerns */}
                        {vendor.key_concerns.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                              Key Concerns
                            </p>
                            <ul className="space-y-1.5">
                              {vendor.key_concerns.map((concern, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-xs text-slate-600"
                                >
                                  <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0 mt-0.5" />
                                  {concern}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {vendor.key_concerns.length === 0 && (
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            No outstanding concerns
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Vendor Comparison Summary Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    Vendor Comparison Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="py-3 px-3 font-medium text-slate-700">Vendor</th>
                          <th className="py-3 px-3 font-medium text-slate-700">Service</th>
                          <th className="py-3 px-3 font-medium text-slate-700">Risk Rating</th>
                          <th className="py-3 px-3 font-medium text-slate-700 text-center">DPA</th>
                          <th className="py-3 px-3 font-medium text-slate-700 text-center">Training Opt-Out</th>
                          <th className="py-3 px-3 font-medium text-slate-700 text-center">Deletion</th>
                          <th className="py-3 px-3 font-medium text-slate-700 text-center">Audit</th>
                          <th className="py-3 px-3 font-medium text-slate-700 text-center">Concerns</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendors.map((vendor) => (
                          <tr
                            key={vendor.id}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-3 font-medium text-slate-900">
                              {vendor.vendor_name}
                            </td>
                            <td className="py-3 px-3 text-slate-600 text-xs">
                              {vendor.service}
                            </td>
                            <td className="py-3 px-3">
                              <Badge className={tierColors[vendor.risk_rating]}>
                                {vendor.risk_rating}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {vendor.has_dpa ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {vendor.has_training_optout ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {vendor.has_deletion_rights ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {vendor.has_audit_rights ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {vendor.key_concerns.length > 0 ? (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  {vendor.key_concerns.length}
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  0
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ========== Add/Edit System Dialog ========== */}
      <Dialog open={systemDialogOpen} onOpenChange={setSystemDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingSystemId ? 'Edit System' : 'Add System'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingSystemId
                ? 'Update the details for this system.'
                : 'Add a new system to your data flow inventory.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sys-name" className="text-slate-700">Name</Label>
              <Input
                id="sys-name"
                placeholder="e.g. Source Code Repository"
                value={systemForm.name}
                onChange={(e) => setSystemForm((f) => ({ ...f, name: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sys-type" className="text-slate-700">Type</Label>
              <Input
                id="sys-type"
                placeholder="e.g. Version Control, SaaS Application, Infrastructure"
                value={systemForm.type}
                onChange={(e) => setSystemForm((f) => ({ ...f, type: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sys-data-types" className="text-slate-700">Data Types (comma-separated)</Label>
              <Input
                id="sys-data-types"
                placeholder="e.g. Source code, Config files, Documentation"
                value={systemForm.data_types}
                onChange={(e) => setSystemForm((f) => ({ ...f, data_types: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="sys-ai"
                type="checkbox"
                checked={systemForm.ai_integration}
                onChange={(e) => setSystemForm((f) => ({ ...f, ai_integration: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="sys-ai" className="text-slate-700">AI Integration</Label>
            </div>
            {systemForm.ai_integration && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sys-ai-service" className="text-slate-700">AI Service</Label>
                  <Input
                    id="sys-ai-service"
                    placeholder="e.g. Claude Code, GitHub Copilot"
                    value={systemForm.ai_service}
                    onChange={(e) => setSystemForm((f) => ({ ...f, ai_service: e.target.value }))}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sys-int-type" className="text-slate-700">Integration Type</Label>
                  <select
                    id="sys-int-type"
                    value={systemForm.integration_type}
                    onChange={(e) => setSystemForm((f) => ({ ...f, integration_type: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="">Select integration type</option>
                    <option value="direct_api">Direct API</option>
                    <option value="embedded">Embedded</option>
                    <option value="middleware">Middleware</option>
                    <option value="on_premise">On-Premise</option>
                    <option value="rag_vector">RAG / Vector</option>
                  </select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="sys-classification" className="text-slate-700">Data Classification</Label>
              <select
                id="sys-classification"
                value={systemForm.data_classification}
                onChange={(e) => setSystemForm((f) => ({ ...f, data_classification: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSystemDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={saveSystem}
              disabled={!isSystemFormValid}
            >
              {editingSystemId ? 'Save Changes' : 'Add System'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== Add/Edit Risk Point Dialog ========== */}
      <Dialog open={riskDialogOpen} onOpenChange={setRiskDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingRiskId ? 'Edit Risk Point' : 'Add Risk Point'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingRiskId
                ? 'Update the details for this risk point.'
                : 'Identify a new risk point for one of your mapped systems.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="risk-system" className="text-slate-700">System</Label>
              <select
                id="risk-system"
                value={riskForm.system_id}
                onChange={(e) => setRiskForm((f) => ({ ...f, system_id: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">Select a system</option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-desc" className="text-slate-700">Risk Description</Label>
              <Textarea
                id="risk-desc"
                placeholder="Describe the risk..."
                value={riskForm.risk_description}
                onChange={(e) => setRiskForm((f) => ({ ...f, risk_description: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-data-type" className="text-slate-700">Data Type</Label>
              <Input
                id="risk-data-type"
                placeholder="e.g. Source code, Customer PII"
                value={riskForm.data_type}
                onChange={(e) => setRiskForm((f) => ({ ...f, data_type: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-threat" className="text-slate-700">Threat</Label>
              <Input
                id="risk-threat"
                placeholder="Describe the threat vector..."
                value={riskForm.threat}
                onChange={(e) => setRiskForm((f) => ({ ...f, threat: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-score" className="text-slate-700">Score (1-10)</Label>
              <Input
                id="risk-score"
                type="number"
                min={1}
                max={10}
                step={0.1}
                value={riskForm.score}
                onChange={(e) => setRiskForm((f) => ({ ...f, score: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-current" className="text-slate-700">Current Control</Label>
              <Input
                id="risk-current"
                placeholder="Existing mitigation (optional)"
                value={riskForm.current_control}
                onChange={(e) => setRiskForm((f) => ({ ...f, current_control: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-recommended" className="text-slate-700">Recommended Control</Label>
              <Textarea
                id="risk-recommended"
                placeholder="Describe recommended controls..."
                value={riskForm.recommended_control}
                onChange={(e) => setRiskForm((f) => ({ ...f, recommended_control: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-status" className="text-slate-700">Status</Label>
              <select
                id="risk-status"
                value={riskForm.status}
                onChange={(e) => setRiskForm((f) => ({ ...f, status: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="open">Open</option>
                <option value="mitigated">Mitigated</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRiskDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={saveRisk}
              disabled={!isRiskFormValid}
            >
              {editingRiskId ? 'Save Changes' : 'Add Risk Point'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== Add/Edit Vendor Dialog ========== */}
      <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingVendorId ? 'Edit Vendor' : 'Add Vendor'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingVendorId
                ? 'Update the details for this vendor assessment.'
                : 'Assess a new AI or data vendor for governance review.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="vendor-name" className="text-slate-700">Vendor Name</Label>
              <Input
                id="vendor-name"
                placeholder="e.g. Anthropic, GitHub, OpenAI"
                value={vendorForm.vendor_name}
                onChange={(e) => setVendorForm((f) => ({ ...f, vendor_name: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-service" className="text-slate-700">Service</Label>
              <Input
                id="vendor-service"
                placeholder="e.g. Claude Code (Enterprise)"
                value={vendorForm.service}
                onChange={(e) => setVendorForm((f) => ({ ...f, service: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-data-access" className="text-slate-700">Data Access (comma-separated)</Label>
              <Input
                id="vendor-data-access"
                placeholder="e.g. Source code, Documentation, Prompt context"
                value={vendorForm.data_access}
                onChange={(e) => setVendorForm((f) => ({ ...f, data_access: e.target.value }))}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-risk" className="text-slate-700">Risk Rating</Label>
              <select
                id="vendor-risk"
                value={vendorForm.risk_rating}
                onChange={(e) => setVendorForm((f) => ({ ...f, risk_rating: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label className="text-slate-700">Compliance</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    id="vendor-dpa"
                    type="checkbox"
                    checked={vendorForm.has_dpa}
                    onChange={(e) => setVendorForm((f) => ({ ...f, has_dpa: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <Label htmlFor="vendor-dpa" className="text-slate-600 font-normal">Data Processing Agreement (DPA)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="vendor-optout"
                    type="checkbox"
                    checked={vendorForm.has_training_optout}
                    onChange={(e) => setVendorForm((f) => ({ ...f, has_training_optout: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <Label htmlFor="vendor-optout" className="text-slate-600 font-normal">Training Opt-Out</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="vendor-deletion"
                    type="checkbox"
                    checked={vendorForm.has_deletion_rights}
                    onChange={(e) => setVendorForm((f) => ({ ...f, has_deletion_rights: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <Label htmlFor="vendor-deletion" className="text-slate-600 font-normal">Deletion Rights</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="vendor-audit"
                    type="checkbox"
                    checked={vendorForm.has_audit_rights}
                    onChange={(e) => setVendorForm((f) => ({ ...f, has_audit_rights: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <Label htmlFor="vendor-audit" className="text-slate-600 font-normal">Audit Rights</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-concerns" className="text-slate-700">Key Concerns (comma-separated)</Label>
              <Textarea
                id="vendor-concerns"
                placeholder="e.g. No on-premise option, Audit rights not negotiated"
                value={vendorForm.key_concerns}
                onChange={(e) => setVendorForm((f) => ({ ...f, key_concerns: e.target.value }))}
                className="border-slate-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVendorDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={saveVendor}
              disabled={!isVendorFormValid}
            >
              {editingVendorId ? 'Save Changes' : 'Add Vendor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
