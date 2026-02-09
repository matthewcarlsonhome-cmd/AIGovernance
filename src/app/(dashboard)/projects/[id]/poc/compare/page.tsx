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
import {
  GitCompareArrows,
  Trophy,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ComparisonCategory {
  category: string;
  claudeCode: number;
  codex: number;
  winner: 'Claude Code' | 'Codex' | 'Tie';
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const COMPARISONS: ComparisonCategory[] = [
  { category: 'Code Quality', claudeCode: 92, codex: 85, winner: 'Claude Code' },
  { category: 'Velocity Impact', claudeCode: 62, codex: 45, winner: 'Claude Code' },
  { category: 'Test Generation', claudeCode: 88, codex: 91, winner: 'Codex' },
  { category: 'Documentation', claudeCode: 95, codex: 78, winner: 'Claude Code' },
  { category: 'Context Understanding', claudeCode: 94, codex: 82, winner: 'Claude Code' },
  { category: 'Setup Complexity', claudeCode: 85, codex: 90, winner: 'Codex' },
  { category: 'Cost Efficiency', claudeCode: 78, codex: 82, winner: 'Codex' },
];

const TOOL_SUMMARY = {
  claudeCode: {
    name: 'Claude Code',
    winsCount: COMPARISONS.filter((c) => c.winner === 'Claude Code').length,
    avgScore: Math.round(
      COMPARISONS.reduce((sum, c) => sum + c.claudeCode, 0) / COMPARISONS.length
    ),
  },
  codex: {
    name: 'OpenAI Codex',
    winsCount: COMPARISONS.filter((c) => c.winner === 'Codex').length,
    avgScore: Math.round(
      COMPARISONS.reduce((sum, c) => sum + c.codex, 0) / COMPARISONS.length
    ),
  },
};

/* ------------------------------------------------------------------ */
/*  Bar Chart Component                                                */
/* ------------------------------------------------------------------ */

function ComparisonBar({
  item,
}: {
  item: ComparisonCategory;
}): React.ReactElement {
  const maxValue = 100;
  const isVelocity = item.category === 'Velocity Impact';
  const claudeLabel = isVelocity ? `+${item.claudeCode}%` : `${item.claudeCode}/100`;
  const codexLabel = isVelocity ? `+${item.codex}%` : `${item.codex}/100`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">{item.category}</h4>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            item.winner === 'Claude Code'
              ? 'bg-violet-500/15 text-violet-700 border-violet-500/25'
              : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25'
          )}
        >
          <Trophy className="h-3 w-3 mr-1" />
          {item.winner}
        </Badge>
      </div>

      {/* Claude Code bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
          Claude Code
        </span>
        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full flex items-center justify-end pr-2 transition-all bg-violet-500"
            style={{ width: `${(item.claudeCode / maxValue) * 100}%` }}
          >
            <span className="text-[10px] font-semibold text-white">
              {claudeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Codex bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
          OpenAI Codex
        </span>
        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full flex items-center justify-end pr-2 transition-all bg-emerald-500"
            style={{ width: `${(item.codex / maxValue) * 100}%` }}
          >
            <span className="text-[10px] font-semibold text-white">
              {codexLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ToolComparisonPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tool Comparison Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Head-to-head comparison of Claude Code vs OpenAI Codex across key
          evaluation categories.
        </p>
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
                  <h3 className="font-semibold text-foreground">Claude Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Avg Score: {TOOL_SUMMARY.claudeCode.avgScore}/100
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-violet-600">
                  {TOOL_SUMMARY.claudeCode.winsCount}
                </p>
                <p className="text-xs text-muted-foreground">Categories Won</p>
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
                  <h3 className="font-semibold text-foreground">OpenAI Codex</h3>
                  <p className="text-sm text-muted-foreground">
                    Avg Score: {TOOL_SUMMARY.codex.avgScore}/100
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">
                  {TOOL_SUMMARY.codex.winsCount}
                </p>
                <p className="text-xs text-muted-foreground">Categories Won</p>
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
            Side-by-side performance metrics across all evaluation categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {COMPARISONS.map((item) => (
              <ComparisonBar key={item.category} item={item} />
            ))}
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
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-violet-600">
                    Claude Code
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    OpenAI Codex
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Winner
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((item, idx) => (
                  <tr
                    key={item.category}
                    className={cn(
                      'border-b border-border transition-colors hover:bg-muted/50',
                      idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    )}
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          'font-semibold',
                          item.winner === 'Claude Code'
                            ? 'text-violet-600'
                            : 'text-foreground'
                        )}
                      >
                        {item.category === 'Velocity Impact'
                          ? `+${item.claudeCode}%`
                          : `${item.claudeCode}/100`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          'font-semibold',
                          item.winner === 'Codex'
                            ? 'text-emerald-600'
                            : 'text-foreground'
                        )}
                      >
                        {item.category === 'Velocity Impact'
                          ? `+${item.codex}%`
                          : `${item.codex}/100`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          item.winner === 'Claude Code'
                            ? 'bg-violet-500/15 text-violet-700 border-violet-500/25'
                            : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25'
                        )}
                      >
                        {item.winner}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
              <CheckCircle2 className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Recommendation: Claude Code for Primary Adoption
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on the evaluation results, Claude Code is recommended for
                primary adoption due to superior performance in code quality
                (+7pts), velocity impact (+17%), documentation (+17pts), and
                context understanding (+12pts). OpenAI Codex showed strengths in
                test generation, setup simplicity, and cost efficiency, making it
                a viable secondary option for specific use cases.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
