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
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GitCompareArrows,
  Trophy,
  CheckCircle2,
  Sparkles,
  Pencil,
  PencilOff,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useToolEvaluations } from '@/hooks/use-poc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ComparisonCategory {
  category: string;
  claudeCode: number;
  codex: number;
  winner: 'Claude Code' | 'Codex' | 'Tie';
  isCustom?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function computeWinner(
  claudeCode: number,
  codex: number
): 'Claude Code' | 'Codex' | 'Tie' {
  if (claudeCode > codex) return 'Claude Code';
  if (codex > claudeCode) return 'Codex';
  return 'Tie';
}

function computeSummary(comparisons: ComparisonCategory[]) {
  const count = comparisons.length || 1;
  return {
    claudeCode: {
      name: 'Claude Code',
      winsCount: comparisons.filter((c) => c.winner === 'Claude Code').length,
      avgScore: Math.round(
        comparisons.reduce((sum, c) => sum + c.claudeCode, 0) / count
      ),
    },
    codex: {
      name: 'OpenAI Codex',
      winsCount: comparisons.filter((c) => c.winner === 'Codex').length,
      avgScore: Math.round(
        comparisons.reduce((sum, c) => sum + c.codex, 0) / count
      ),
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Initial Demo Data                                                  */
/* ------------------------------------------------------------------ */

const INITIAL_COMPARISONS: ComparisonCategory[] = [
  { category: 'Code Quality', claudeCode: 92, codex: 85, winner: 'Claude Code' },
  { category: 'Velocity Impact', claudeCode: 62, codex: 45, winner: 'Claude Code' },
  { category: 'Test Generation', claudeCode: 88, codex: 91, winner: 'Codex' },
  { category: 'Documentation', claudeCode: 95, codex: 78, winner: 'Claude Code' },
  { category: 'Context Understanding', claudeCode: 94, codex: 82, winner: 'Claude Code' },
  { category: 'Setup Complexity', claudeCode: 85, codex: 90, winner: 'Codex' },
  { category: 'Cost Efficiency', claudeCode: 78, codex: 82, winner: 'Codex' },
];

/* ------------------------------------------------------------------ */
/*  Inline Score Input                                                 */
/* ------------------------------------------------------------------ */

function ScoreInput({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  color: 'violet' | 'emerald';
}): React.ReactElement {
  const borderColor =
    color === 'violet' ? 'border-violet-400 focus:ring-violet-500' : 'border-emerald-400 focus:ring-emerald-500';

  return (
    <input
      type="number"
      min={0}
      max={100}
      value={value}
      onChange={(e) => {
        const raw = parseInt(e.target.value, 10);
        if (Number.isNaN(raw)) return;
        onChange(Math.max(0, Math.min(100, raw)));
      }}
      className={cn(
        'w-16 h-7 rounded border text-center text-xs font-semibold bg-white text-slate-900 outline-none focus:ring-2',
        borderColor
      )}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Bar Chart Component                                                */
/* ------------------------------------------------------------------ */

function ComparisonBar({
  item,
  editMode,
  onUpdateClaude,
  onUpdateCodex,
  onRemove,
}: {
  item: ComparisonCategory;
  editMode: boolean;
  onUpdateClaude: (v: number) => void;
  onUpdateCodex: (v: number) => void;
  onRemove?: () => void;
}): React.ReactElement {
  const maxValue = 100;
  const isVelocity = item.category === 'Velocity Impact';
  const claudeLabel = isVelocity ? `+${item.claudeCode}%` : `${item.claudeCode}/100`;
  const codexLabel = isVelocity ? `+${item.codex}%` : `${item.codex}/100`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-900">{item.category}</h4>
          {editMode && item.isCustom && onRemove && (
            <button
              onClick={onRemove}
              className="text-red-400 hover:text-red-600 transition-colors"
              title="Remove category"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            item.winner === 'Claude Code'
              ? 'bg-violet-500/15 text-violet-700 border-violet-500/25'
              : item.winner === 'Codex'
              ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25'
              : 'bg-slate-500/15 text-slate-700 border-slate-500/25'
          )}
        >
          <Trophy className="h-3 w-3 mr-1" />
          {item.winner}
        </Badge>
      </div>

      {/* Claude Code bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 w-24 text-right shrink-0">
          Claude Code
        </span>
        <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full flex items-center justify-end pr-2 transition-all bg-violet-500"
            style={{ width: `${(item.claudeCode / maxValue) * 100}%` }}
          >
            {!editMode && (
              <span className="text-[10px] font-semibold text-white">
                {claudeLabel}
              </span>
            )}
          </div>
        </div>
        {editMode ? (
          <ScoreInput value={item.claudeCode} onChange={onUpdateClaude} color="violet" />
        ) : (
          <span className="text-xs font-semibold text-slate-700 w-16 text-center shrink-0">
            {claudeLabel}
          </span>
        )}
      </div>

      {/* Codex bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 w-24 text-right shrink-0">
          OpenAI Codex
        </span>
        <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full flex items-center justify-end pr-2 transition-all bg-emerald-500"
            style={{ width: `${(item.codex / maxValue) * 100}%` }}
          >
            {!editMode && (
              <span className="text-[10px] font-semibold text-white">
                {codexLabel}
              </span>
            )}
          </div>
        </div>
        {editMode ? (
          <ScoreInput value={item.codex} onChange={onUpdateCodex} color="emerald" />
        ) : (
          <span className="text-xs font-semibold text-slate-700 w-16 text-center shrink-0">
            {codexLabel}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Category Form                                                  */
/* ------------------------------------------------------------------ */

function AddCategoryForm({
  onAdd,
  onCancel,
}: {
  onAdd: (name: string, claude: number, codex: number) => void;
  onCancel: () => void;
}): React.ReactElement {
  const [name, setName] = React.useState('');
  const [claude, setClaude] = React.useState(50);
  const [codex, setCodex] = React.useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, claude, codex);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">New Comparison Category</h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Category Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Refactoring Ability"
            className="h-8 text-sm bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Claude Code Score (0-100)
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            value={claude}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) setClaude(Math.max(0, Math.min(100, v)));
            }}
            className="h-8 text-sm bg-white border-violet-300 text-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            OpenAI Codex Score (0-100)
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            value={codex}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) setCodex(Math.max(0, Math.min(100, v)));
            }}
            className="h-8 text-sm bg-white border-emerald-300 text-slate-900"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-600 hover:text-slate-900"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!name.trim()}
          className="bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Category
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Dynamic Recommendation                                             */
/* ------------------------------------------------------------------ */

function Recommendation({
  comparisons,
}: {
  comparisons: ComparisonCategory[];
}): React.ReactElement {
  const summary = computeSummary(comparisons);
  const claudeWins = summary.claudeCode.winsCount;
  const codexWins = summary.codex.winsCount;

  let title: string;
  let description: string;

  if (claudeWins > codexWins) {
    const advantages = comparisons
      .filter((c) => c.winner === 'Claude Code')
      .map((c) => {
        const diff = c.claudeCode - c.codex;
        return c.category === 'Velocity Impact'
          ? `${c.category} (+${diff}%)`
          : `${c.category} (+${diff}pts)`;
      });
    title = 'Recommendation: Claude Code for Primary Adoption';
    description = `Based on the evaluation results, Claude Code is recommended for primary adoption due to superior performance in ${advantages.join(', ')}. OpenAI Codex showed strengths in ${comparisons
      .filter((c) => c.winner === 'Codex')
      .map((c) => c.category.toLowerCase())
      .join(', ') || 'no categories'}, making it a viable secondary option for specific use cases.`;
  } else if (codexWins > claudeWins) {
    const advantages = comparisons
      .filter((c) => c.winner === 'Codex')
      .map((c) => {
        const diff = c.codex - c.claudeCode;
        return c.category === 'Velocity Impact'
          ? `${c.category} (+${diff}%)`
          : `${c.category} (+${diff}pts)`;
      });
    title = 'Recommendation: OpenAI Codex for Primary Adoption';
    description = `Based on the evaluation results, OpenAI Codex is recommended for primary adoption due to superior performance in ${advantages.join(', ')}. Claude Code showed strengths in ${comparisons
      .filter((c) => c.winner === 'Claude Code')
      .map((c) => c.category.toLowerCase())
      .join(', ') || 'no categories'}, making it a viable secondary option for specific use cases.`;
  } else {
    title = 'Recommendation: Both Tools Are Closely Matched';
    description = `The evaluation shows both Claude Code (avg ${summary.claudeCode.avgScore}/100) and OpenAI Codex (avg ${summary.codex.avgScore}/100) performing comparably. Consider running extended pilots to differentiate further, or adopt both tools for different use cases.`;
  }

  return (
    <Card className="border-violet-500/20 bg-violet-500/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
            <CheckCircle2 className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ToolComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const { data: fetchedEvals, isLoading, error } = useToolEvaluations(id);

  const [comparisons, setComparisons] = React.useState<ComparisonCategory[]>(
    () => INITIAL_COMPARISONS.map((c) => ({ ...c }))
  );
  const [editMode, setEditMode] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);

  /* Derived summary - recalculates on every render when comparisons change */
  const toolSummary = computeSummary(comparisons);

  /* Score updater */
  const updateScore = React.useCallback(
    (index: number, tool: 'claudeCode' | 'codex', value: number) => {
      setComparisons((prev) => {
        const next = [...prev];
        const item = { ...next[index] };
        item[tool] = value;
        item.winner = computeWinner(item.claudeCode, item.codex);
        next[index] = item;
        return next;
      });
    },
    []
  );

  /* Add category */
  const addCategory = React.useCallback(
    (name: string, claudeScore: number, codexScore: number) => {
      const newItem: ComparisonCategory = {
        category: name,
        claudeCode: claudeScore,
        codex: codexScore,
        winner: computeWinner(claudeScore, codexScore),
        isCustom: true,
      };
      setComparisons((prev) => [...prev, newItem]);
      setShowAddForm(false);
    },
    []
  );

  /* Remove category */
  const removeCategory = React.useCallback((index: number) => {
    setComparisons((prev) => prev.filter((_, i) => i !== index));
  }, []);

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tool Comparison Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Head-to-head comparison of Claude Code vs OpenAI Codex across key
            evaluation categories. Click &quot;Edit Scores&quot; to manually judge each model.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {editMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Category
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              setEditMode((prev) => !prev);
              if (editMode) setShowAddForm(false);
            }}
            className={cn(
              editMode
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            )}
          >
            {editMode ? (
              <>
                <PencilOff className="h-3.5 w-3.5 mr-1" />
                Done Editing
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit Scores
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-violet-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10">
                  <Sparkles className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Claude Code</h3>
                  <p className="text-sm text-slate-500">
                    Avg Score: {toolSummary.claudeCode.avgScore}/100
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-violet-600">
                  {toolSummary.claudeCode.winsCount}
                </p>
                <p className="text-xs text-slate-500">Categories Won</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <GitCompareArrows className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">OpenAI Codex</h3>
                  <p className="text-sm text-slate-500">
                    Avg Score: {toolSummary.codex.avgScore}/100
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">
                  {toolSummary.codex.winsCount}
                </p>
                <p className="text-xs text-slate-500">Categories Won</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Category Comparison</CardTitle>
          <CardDescription>
            {editMode
              ? 'Adjust scores for each category using the number inputs. Winners update automatically.'
              : 'Side-by-side performance metrics across all evaluation categories'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {comparisons.map((item, idx) => (
              <ComparisonBar
                key={`${item.category}-${idx}`}
                item={item}
                editMode={editMode}
                onUpdateClaude={(v) => updateScore(idx, 'claudeCode', v)}
                onUpdateCodex={(v) => updateScore(idx, 'codex', v)}
                onRemove={item.isCustom ? () => removeCategory(idx) : undefined}
              />
            ))}
            {editMode && showAddForm && (
              <AddCategoryForm
                onAdd={addCategory}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Score Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-violet-600">
                    Claude Code
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    OpenAI Codex
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Winner
                  </th>
                  {editMode && (
                    <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-12">
                      {/* actions column */}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {comparisons.map((item, idx) => (
                  <tr
                    key={`${item.category}-${idx}`}
                    className={cn(
                      'border-b border-slate-200 transition-colors hover:bg-slate-50',
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-100/20'
                    )}
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <span className="flex items-center gap-1.5">
                        {item.category}
                        {item.isCustom && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300 text-slate-500">
                            Custom
                          </Badge>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editMode ? (
                        <div className="flex justify-center">
                          <ScoreInput
                            value={item.claudeCode}
                            onChange={(v) => updateScore(idx, 'claudeCode', v)}
                            color="violet"
                          />
                        </div>
                      ) : (
                        <span
                          className={cn(
                            'font-semibold',
                            item.winner === 'Claude Code'
                              ? 'text-violet-600'
                              : 'text-slate-900'
                          )}
                        >
                          {item.category === 'Velocity Impact'
                            ? `+${item.claudeCode}%`
                            : `${item.claudeCode}/100`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editMode ? (
                        <div className="flex justify-center">
                          <ScoreInput
                            value={item.codex}
                            onChange={(v) => updateScore(idx, 'codex', v)}
                            color="emerald"
                          />
                        </div>
                      ) : (
                        <span
                          className={cn(
                            'font-semibold',
                            item.winner === 'Codex'
                              ? 'text-emerald-600'
                              : 'text-slate-900'
                          )}
                        >
                          {item.category === 'Velocity Impact'
                            ? `+${item.codex}%`
                            : `${item.codex}/100`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          item.winner === 'Claude Code'
                            ? 'bg-violet-500/15 text-violet-700 border-violet-500/25'
                            : item.winner === 'Codex'
                            ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25'
                            : 'bg-slate-500/15 text-slate-700 border-slate-500/25'
                        )}
                      >
                        {item.winner}
                      </Badge>
                    </td>
                    {editMode && (
                      <td className="py-3 px-4 text-center">
                        {item.isCustom && (
                          <button
                            onClick={() => removeCategory(idx)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Remove category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Recommendation comparisons={comparisons} />
    </div>
  );
}
