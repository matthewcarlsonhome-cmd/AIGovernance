'use client';

import { useState, useCallback } from 'react';
import * as React from 'react';
import {
  BookOpen,
  Shield,
  FileText,
  Download,
  Sparkles,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wrench,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectOption } from '@/components/ui/select';
import type {
  AIUsagePlaybook,
  PlaybookTool,
  PlaybookDataRule,
  DataTrafficLight,
} from '@/types';

// ---------- Helpers ----------

const trafficLightColors: Record<DataTrafficLight, string> = {
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-800 border-red-200',
};

const trafficLightLabels: Record<DataTrafficLight, string> = {
  green: 'GREEN - Safe for AI',
  yellow: 'YELLOW - Use with Caution',
  red: 'RED - Never Use with AI',
};

const toolStatusColors: Record<PlaybookTool['status'], string> = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  restricted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  prohibited: 'bg-red-100 text-red-800 border-red-200',
};

function makeEmptyTool(): PlaybookTool {
  return {
    name: '',
    status: 'approved',
    data_handling: '',
    approved_for: [],
    not_approved_for: [],
    access_method: '',
  };
}

function makeEmptyDataRule(): PlaybookDataRule {
  return {
    data_type: '',
    classification: 'green',
    consumer_ai: false,
    enterprise_ai: false,
    notes: '',
  };
}

// ---------- Sub-components ----------

function ActivityListCard({
  title,
  icon,
  items,
  onAdd,
  onRemove,
  colorScheme,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  colorScheme: 'green' | 'red' | 'yellow';
}): React.JSX.Element {
  const [newItem, setNewItem] = useState('');
  const [showInput, setShowInput] = useState(false);

  const bgMap = { green: 'bg-green-50', red: 'bg-red-50', yellow: 'bg-yellow-50' };
  const titleColorMap = { green: 'text-green-700', red: 'text-red-700', yellow: 'text-yellow-700' };
  const iconMap = {
    green: <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />,
    red: <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />,
    yellow: <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />,
  };

  const handleAdd = (): void => {
    const trimmed = newItem.trim();
    if (trimmed) {
      onAdd(trimmed);
      setNewItem('');
      setShowInput(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base flex items-center gap-2 ${titleColorMap[colorScheme]}`}>
            {icon}
            {title}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowInput(!showInput)}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showInput && (
          <div className="flex gap-2 mb-3">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter activity..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
            />
            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleAdd}>
              Add
            </Button>
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No items yet. Click Add to create one.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((activity, idx) => (
              <li
                key={idx}
                className={`text-sm text-slate-700 flex items-start gap-2 p-2 rounded ${bgMap[colorScheme]} group`}
              >
                {iconMap[colorScheme]}
                <span className="flex-1">{activity}</span>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                  aria-label={`Remove "${activity}"`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Page Component ----------

export default function PlaybookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.JSX.Element {
  const resolvedParams = React.use(params);

  // ---- All hooks declared up front, before any early returns ----

  const [playbook, setPlaybook] = useState<AIUsagePlaybook | null>(null);

  // Golden rules state
  const [editingRules, setEditingRules] = useState(false);
  const [newRuleText, setNewRuleText] = useState('');
  const [showAddRule, setShowAddRule] = useState(false);

  // Tool dialog state
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [editingToolIndex, setEditingToolIndex] = useState<number | null>(null);
  const [toolForm, setToolForm] = useState<PlaybookTool>(makeEmptyTool);
  const [toolApprovedForInput, setToolApprovedForInput] = useState('');
  const [toolNotApprovedForInput, setToolNotApprovedForInput] = useState('');

  // Data rule dialog state
  const [dataRuleDialogOpen, setDataRuleDialogOpen] = useState(false);
  const [editingDataRuleIndex, setEditingDataRuleIndex] = useState<number | null>(null);
  const [dataRuleForm, setDataRuleForm] = useState<PlaybookDataRule>(makeEmptyDataRule);

  // Disclosure edit state
  const [editingDisclosure, setEditingDisclosure] = useState(false);
  const [disclosureText, setDisclosureText] = useState('');

  // Create playbook dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState('');

  // ---- Callbacks ----

  const handleCreatePlaybook = useCallback((): void => {
    const newPlaybook: AIUsagePlaybook = {
      id: `pb-${Date.now()}`,
      project_id: resolvedParams.id,
      golden_rules: [],
      tools: [],
      data_rules: [],
      approved_activities: [],
      prohibited_activities: [],
      requires_approval: [],
      disclosure_policy: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPlaybook(newPlaybook);
    setCreateDialogOpen(false);
    setCreateName('');
  }, [resolvedParams.id]);

  const updatePlaybook = useCallback(
    (updater: (prev: AIUsagePlaybook) => AIUsagePlaybook): void => {
      setPlaybook((prev) => {
        if (!prev) return prev;
        return { ...updater(prev), updated_at: new Date().toISOString() };
      });
    },
    []
  );

  // Golden rules
  const handleUpdateRule = useCallback(
    (idx: number, value: string): void => {
      updatePlaybook((prev) => {
        const rules = [...prev.golden_rules];
        rules[idx] = value;
        return { ...prev, golden_rules: rules };
      });
    },
    [updatePlaybook]
  );

  const handleDeleteRule = useCallback(
    (idx: number): void => {
      updatePlaybook((prev) => ({
        ...prev,
        golden_rules: prev.golden_rules.filter((_, i) => i !== idx),
      }));
    },
    [updatePlaybook]
  );

  const handleAddRule = useCallback((): void => {
    const trimmed = newRuleText.trim();
    if (trimmed) {
      updatePlaybook((prev) => ({
        ...prev,
        golden_rules: [...prev.golden_rules, trimmed],
      }));
      setNewRuleText('');
      setShowAddRule(false);
    }
  }, [newRuleText, updatePlaybook]);

  // Tools
  const openAddToolDialog = useCallback((): void => {
    setEditingToolIndex(null);
    setToolForm(makeEmptyTool());
    setToolApprovedForInput('');
    setToolNotApprovedForInput('');
    setToolDialogOpen(true);
  }, []);

  const openEditToolDialog = useCallback(
    (idx: number): void => {
      if (!playbook) return;
      setEditingToolIndex(idx);
      setToolForm({ ...playbook.tools[idx] });
      setToolApprovedForInput('');
      setToolNotApprovedForInput('');
      setToolDialogOpen(true);
    },
    [playbook]
  );

  const handleSaveTool = useCallback((): void => {
    if (!toolForm.name.trim()) return;
    updatePlaybook((prev) => {
      const tools = [...prev.tools];
      if (editingToolIndex !== null) {
        tools[editingToolIndex] = { ...toolForm };
      } else {
        tools.push({ ...toolForm });
      }
      return { ...prev, tools };
    });
    setToolDialogOpen(false);
  }, [toolForm, editingToolIndex, updatePlaybook]);

  const handleDeleteTool = useCallback(
    (idx: number): void => {
      updatePlaybook((prev) => ({
        ...prev,
        tools: prev.tools.filter((_, i) => i !== idx),
      }));
    },
    [updatePlaybook]
  );

  const addToolApprovedFor = useCallback((): void => {
    const trimmed = toolApprovedForInput.trim();
    if (trimmed) {
      setToolForm((prev) => ({
        ...prev,
        approved_for: [...prev.approved_for, trimmed],
      }));
      setToolApprovedForInput('');
    }
  }, [toolApprovedForInput]);

  const removeToolApprovedFor = useCallback((idx: number): void => {
    setToolForm((prev) => ({
      ...prev,
      approved_for: prev.approved_for.filter((_, i) => i !== idx),
    }));
  }, []);

  const addToolNotApprovedFor = useCallback((): void => {
    const trimmed = toolNotApprovedForInput.trim();
    if (trimmed) {
      setToolForm((prev) => ({
        ...prev,
        not_approved_for: [...prev.not_approved_for, trimmed],
      }));
      setToolNotApprovedForInput('');
    }
  }, [toolNotApprovedForInput]);

  const removeToolNotApprovedFor = useCallback((idx: number): void => {
    setToolForm((prev) => ({
      ...prev,
      not_approved_for: prev.not_approved_for.filter((_, i) => i !== idx),
    }));
  }, []);

  // Data rules
  const openAddDataRuleDialog = useCallback((): void => {
    setEditingDataRuleIndex(null);
    setDataRuleForm(makeEmptyDataRule());
    setDataRuleDialogOpen(true);
  }, []);

  const openEditDataRuleDialog = useCallback(
    (idx: number): void => {
      if (!playbook) return;
      setEditingDataRuleIndex(idx);
      setDataRuleForm({ ...playbook.data_rules[idx] });
      setDataRuleDialogOpen(true);
    },
    [playbook]
  );

  const handleSaveDataRule = useCallback((): void => {
    if (!dataRuleForm.data_type.trim()) return;
    updatePlaybook((prev) => {
      const rules = [...prev.data_rules];
      if (editingDataRuleIndex !== null) {
        rules[editingDataRuleIndex] = { ...dataRuleForm };
      } else {
        rules.push({ ...dataRuleForm });
      }
      return { ...prev, data_rules: rules };
    });
    setDataRuleDialogOpen(false);
  }, [dataRuleForm, editingDataRuleIndex, updatePlaybook]);

  const handleDeleteDataRule = useCallback(
    (idx: number): void => {
      updatePlaybook((prev) => ({
        ...prev,
        data_rules: prev.data_rules.filter((_, i) => i !== idx),
      }));
    },
    [updatePlaybook]
  );

  // Disclosure
  const handleStartEditDisclosure = useCallback((): void => {
    if (!playbook) return;
    setDisclosureText(playbook.disclosure_policy);
    setEditingDisclosure(true);
  }, [playbook]);

  const handleSaveDisclosure = useCallback((): void => {
    updatePlaybook((prev) => ({
      ...prev,
      disclosure_policy: disclosureText,
    }));
    setEditingDisclosure(false);
  }, [disclosureText, updatePlaybook]);

  // Activities
  const handleAddActivity = useCallback(
    (field: 'approved_activities' | 'prohibited_activities' | 'requires_approval', item: string): void => {
      updatePlaybook((prev) => ({
        ...prev,
        [field]: [...prev[field], item],
      }));
    },
    [updatePlaybook]
  );

  const handleRemoveActivity = useCallback(
    (field: 'approved_activities' | 'prohibited_activities' | 'requires_approval', idx: number): void => {
      updatePlaybook((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== idx),
      }));
    },
    [updatePlaybook]
  );

  // Generate Playbook
  const handleGeneratePlaybook = useCallback((): void => {
    alert('AI generation requires API key configuration');
  }, []);

  // Export PDF (JSON summary download)
  const handleExportPdf = useCallback((): void => {
    if (!playbook) return;
    const summary = JSON.stringify(playbook, null, 2);
    const blob = new Blob([summary], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-usage-playbook-${playbook.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [playbook]);

  // ---- Empty state ----

  if (!playbook) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              AI Usage Playbook
            </h1>
            <p className="text-slate-500 mt-1">
              Organization-wide rules and guidelines for responsible AI usage
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                No Playbook Created Yet
              </h2>
              <p className="text-sm text-slate-500 max-w-md mb-6">
                Create an AI Usage Playbook to define golden rules, approved tools,
                data classification guidelines, and activity policies for your organization.
              </p>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 gap-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create Playbook
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Playbook Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create AI Usage Playbook</DialogTitle>
              <DialogDescription className="text-slate-500">
                Start a new playbook for this project. You can add rules, tools, and policies after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="create-playbook-name">Playbook Name (optional)</Label>
                <Input
                  id="create-playbook-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Q1 2025 AI Usage Playbook"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleCreatePlaybook}
              >
                Create Playbook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ---- Main playbook view ----

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            AI Usage Playbook
          </h1>
          <p className="text-slate-500 mt-1">
            Organization-wide rules and guidelines for responsible AI usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 gap-2"
            onClick={handleGeneratePlaybook}
          >
            <Sparkles className="h-4 w-4" />
            Generate Playbook
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Golden Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Golden Rules
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setShowAddRule(!showAddRule)}
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
              {playbook.golden_rules.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setEditingRules(!editingRules)}
                >
                  <Edit2 className="h-3 w-3" />
                  {editingRules ? 'Done' : 'Edit'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showAddRule && (
            <div className="flex gap-2 mb-4">
              <Input
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                placeholder="Enter a new golden rule..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddRule();
                }}
              />
              <Button
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800"
                onClick={handleAddRule}
              >
                Add
              </Button>
            </div>
          )}
          {playbook.golden_rules.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No golden rules yet. Click Add to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {playbook.golden_rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  {editingRules ? (
                    <Input
                      value={rule}
                      onChange={(e) => handleUpdateRule(idx, e.target.value)}
                      className="flex-1 border-amber-300"
                    />
                  ) : (
                    <p className="text-sm font-medium text-amber-900 pt-1 flex-1">{rule}</p>
                  )}
                  {editingRules && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(idx)}
                      className="text-slate-400 hover:text-red-500 mt-1"
                      aria-label={`Delete rule ${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Traffic Light */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Data Traffic Light System
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={openAddDataRuleDialog}
            >
              <Plus className="h-3 w-3" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex gap-4 mb-4">
            {(Object.entries(trafficLightLabels) as [DataTrafficLight, string][]).map(
              ([level, label]) => (
                <div key={level} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      level === 'green'
                        ? 'bg-green-500'
                        : level === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              )
            )}
          </div>

          {playbook.data_rules.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No data rules yet. Click Add Rule to create one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-3 font-medium text-slate-700">Data Type</th>
                    <th className="py-3 px-3 font-medium text-slate-700">Classification</th>
                    <th className="py-3 px-3 font-medium text-slate-700 text-center">
                      Consumer AI
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700 text-center">
                      Enterprise AI
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700">Notes</th>
                    <th className="py-3 px-3 font-medium text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {playbook.data_rules.map((rule: PlaybookDataRule, idx: number) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 hover:bg-slate-50 group"
                    >
                      <td className="py-3 px-3 font-medium">{rule.data_type}</td>
                      <td className="py-3 px-3">
                        <Badge className={trafficLightColors[rule.classification]}>
                          {rule.classification.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {rule.consumer_ai ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {rule.enterprise_ai ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs max-w-[250px]">
                        {rule.notes}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openEditDataRuleDialog(idx)}
                            className="text-slate-400 hover:text-blue-600 p-1"
                            aria-label={`Edit ${rule.data_type}`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDataRule(idx)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            aria-label={`Delete ${rule.data_type}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Tools */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-slate-700" />
              Approved Tools
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={openAddToolDialog}
            >
              <Plus className="h-3 w-3" />
              Add Tool
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {playbook.tools.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No tools added yet. Click Add Tool to create one.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playbook.tools.map((tool: PlaybookTool, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={toolStatusColors[tool.status]}>
                        {tool.status.toUpperCase()}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEditToolDialog(idx)}
                          className="text-slate-400 hover:text-blue-600 p-1"
                          aria-label={`Edit ${tool.name}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTool(idx)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          aria-label={`Delete ${tool.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{tool.data_handling}</p>
                  <p className="text-xs text-slate-500 mb-3">
                    <span className="font-medium text-slate-700">Access: </span>
                    {tool.access_method}
                  </p>

                  {tool.approved_for.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-green-700 mb-1">
                        Approved For:
                      </p>
                      <ul className="space-y-0.5">
                        {tool.approved_for.map((item, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-600 flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tool.not_approved_for.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-1">
                        Not Approved For:
                      </p>
                      <ul className="space-y-0.5">
                        {tool.not_approved_for.map((item, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-600 flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActivityListCard
          title="Approved Activities"
          icon={<CheckCircle2 className="h-5 w-5" />}
          items={playbook.approved_activities}
          onAdd={(item) => handleAddActivity('approved_activities', item)}
          onRemove={(idx) => handleRemoveActivity('approved_activities', idx)}
          colorScheme="green"
        />
        <ActivityListCard
          title="Prohibited Activities"
          icon={<XCircle className="h-5 w-5" />}
          items={playbook.prohibited_activities}
          onAdd={(item) => handleAddActivity('prohibited_activities', item)}
          onRemove={(idx) => handleRemoveActivity('prohibited_activities', idx)}
          colorScheme="red"
        />
        <ActivityListCard
          title="Requires Approval"
          icon={<AlertTriangle className="h-5 w-5" />}
          items={playbook.requires_approval}
          onAdd={(item) => handleAddActivity('requires_approval', item)}
          onRemove={(idx) => handleRemoveActivity('requires_approval', idx)}
          colorScheme="yellow"
        />
      </div>

      {/* Disclosure Policy */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-700" />
              Disclosure Policy
            </CardTitle>
            {editingDisclosure ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleSaveDisclosure}
              >
                <Save className="h-3 w-3" />
                Save
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleStartEditDisclosure}
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingDisclosure ? (
            <Textarea
              value={disclosureText}
              onChange={(e) => setDisclosureText(e.target.value)}
              rows={5}
              placeholder="Enter disclosure policy text..."
              className="border-slate-300"
            />
          ) : playbook.disclosure_policy ? (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                {playbook.disclosure_policy}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No disclosure policy set. Click Edit to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tool Dialog */}
      <Dialog open={toolDialogOpen} onOpenChange={setToolDialogOpen}>
        <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingToolIndex !== null ? 'Edit Tool' : 'Add Tool'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Configure an AI tool with its approval status and usage rules.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tool-name">Tool Name</Label>
              <Input
                id="tool-name"
                value={toolForm.name}
                onChange={(e) =>
                  setToolForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Claude Code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-status">Status</Label>
              <Select
                id="tool-status"
                value={toolForm.status}
                onValueChange={(val) =>
                  setToolForm((prev) => ({
                    ...prev,
                    status: val as PlaybookTool['status'],
                  }))
                }
              >
                <SelectOption value="approved">Approved</SelectOption>
                <SelectOption value="restricted">Restricted</SelectOption>
                <SelectOption value="prohibited">Prohibited</SelectOption>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-data-handling">Data Handling</Label>
              <Textarea
                id="tool-data-handling"
                value={toolForm.data_handling}
                onChange={(e) =>
                  setToolForm((prev) => ({ ...prev, data_handling: e.target.value }))
                }
                placeholder="Describe data handling policies..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-access-method">Access Method</Label>
              <Input
                id="tool-access-method"
                value={toolForm.access_method}
                onChange={(e) =>
                  setToolForm((prev) => ({ ...prev, access_method: e.target.value }))
                }
                placeholder="e.g. CLI via managed sandbox environment"
              />
            </div>

            <div className="space-y-2">
              <Label>Approved For</Label>
              <div className="flex gap-2">
                <Input
                  value={toolApprovedForInput}
                  onChange={(e) => setToolApprovedForInput(e.target.value)}
                  placeholder="Add approved use case..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToolApprovedFor();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addToolApprovedFor}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {toolForm.approved_for.length > 0 && (
                <ul className="space-y-1 mt-1">
                  {toolForm.approved_for.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-600 flex items-center gap-1 bg-green-50 rounded px-2 py-1"
                    >
                      <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                      <span className="flex-1">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeToolApprovedFor(i)}
                        className="text-slate-400 hover:text-red-500"
                        aria-label={`Remove "${item}"`}
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label>Not Approved For</Label>
              <div className="flex gap-2">
                <Input
                  value={toolNotApprovedForInput}
                  onChange={(e) => setToolNotApprovedForInput(e.target.value)}
                  placeholder="Add restricted use case..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToolNotApprovedFor();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addToolNotApprovedFor}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {toolForm.not_approved_for.length > 0 && (
                <ul className="space-y-1 mt-1">
                  {toolForm.not_approved_for.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-600 flex items-center gap-1 bg-red-50 rounded px-2 py-1"
                    >
                      <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                      <span className="flex-1">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeToolNotApprovedFor(i)}
                        className="text-slate-400 hover:text-red-500"
                        aria-label={`Remove "${item}"`}
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToolDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSaveTool}
            >
              {editingToolIndex !== null ? 'Save Changes' : 'Add Tool'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Rule Dialog */}
      <Dialog open={dataRuleDialogOpen} onOpenChange={setDataRuleDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingDataRuleIndex !== null ? 'Edit Data Rule' : 'Add Data Rule'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Define a data classification rule for the traffic light system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rule-data-type">Data Type</Label>
              <Input
                id="rule-data-type"
                value={dataRuleForm.data_type}
                onChange={(e) =>
                  setDataRuleForm((prev) => ({ ...prev, data_type: e.target.value }))
                }
                placeholder="e.g. Customer PII"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-classification">Classification</Label>
              <Select
                id="rule-classification"
                value={dataRuleForm.classification}
                onValueChange={(val) =>
                  setDataRuleForm((prev) => ({
                    ...prev,
                    classification: val as DataTrafficLight,
                  }))
                }
              >
                <SelectOption value="green">Green - Safe for AI</SelectOption>
                <SelectOption value="yellow">Yellow - Use with Caution</SelectOption>
                <SelectOption value="red">Red - Never Use with AI</SelectOption>
              </Select>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataRuleForm.consumer_ai}
                  onChange={(e) =>
                    setDataRuleForm((prev) => ({
                      ...prev,
                      consumer_ai: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Consumer AI</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataRuleForm.enterprise_ai}
                  onChange={(e) =>
                    setDataRuleForm((prev) => ({
                      ...prev,
                      enterprise_ai: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Enterprise AI</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-notes">Notes</Label>
              <Textarea
                id="rule-notes"
                value={dataRuleForm.notes}
                onChange={(e) =>
                  setDataRuleForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Additional notes or conditions..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDataRuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSaveDataRule}
            >
              {editingDataRuleIndex !== null ? 'Save Changes' : 'Add Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
