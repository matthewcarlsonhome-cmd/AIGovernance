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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { RoiInputs, RoiResults, SensitivityRow, EnhancedRoiInputs, EnhancedRoiResults } from '@/types';
import {
  calculateRoi,
  calculateSensitivity,
  calculateEnhancedRoi,
  formatCurrency,
  formatPercent,
} from '@/lib/scoring/roi-calculator';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_INPUTS: RoiInputs = {
  team_size: 20,
  avg_salary: 150000,
  current_velocity: 40,
  projected_velocity_lift: 40,
  license_cost_per_user: 50,
  implementation_cost: 25000,
  training_cost: 10000,
};

const DEBOUNCE_MS = 400;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function paybackLabel(months: number): string {
  if (months >= 999) return 'N/A';
  if (months <= 1) return '< 1 month';
  return `${months} months`;
}

function paybackBadgeVariant(
  months: number
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (months >= 999) return 'destructive';
  if (months <= 3) return 'default';
  if (months <= 6) return 'secondary';
  return 'outline';
}

/* -------------------------------------------------------------------------- */
/*  Metric Card                                                                 */
/* -------------------------------------------------------------------------- */

function ResultMetricCard({
  label,
  value,
  icon: Icon,
  variant = 'neutral',
  badge,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  variant?: 'positive' | 'negative' | 'neutral';
  badge?: React.ReactNode;
  sub?: string;
}): React.ReactElement {
  const colorMap = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-slate-900',
  } as const;

  const bgMap = {
    positive: 'bg-emerald-500/10',
    negative: 'bg-red-500/10',
    neutral: 'bg-slate-100',
  } as const;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              bgMap[variant]
            )}
          >
            <Icon
              className={cn(
                'h-4.5 w-4.5',
                variant === 'positive'
                  ? 'text-emerald-600'
                  : variant === 'negative'
                    ? 'text-red-600'
                    : 'text-slate-900'
              )}
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn('text-2xl font-bold', colorMap[variant])}>
            {value}
          </span>
          {badge}
        </div>
        {sub && (
          <p className="mt-1 text-xs text-slate-500">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sensitivity Chart Tooltip                                                   */
/* -------------------------------------------------------------------------- */

function SensitivityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-slate-500 mb-1">
        Velocity Lift: {label}
      </p>
      <p className="text-sm font-bold text-slate-900">
        3-Year NPV: {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                              */
/* -------------------------------------------------------------------------- */

export default function RoiCalculatorPage(): React.ReactElement {
  /* ---- State ---- */
  const [inputs, setInputs] = React.useState<RoiInputs>(DEFAULT_INPUTS);
  const [results, setResults] = React.useState<RoiResults | null>(null);
  const [sensitivity, setSensitivity] = React.useState<SensitivityRow[]>([]);
  const [showEnhanced, setShowEnhanced] = React.useState(false);
  const [enhancedResults, setEnhancedResults] = React.useState<EnhancedRoiResults | null>(null);
  const [enhancedExtras, setEnhancedExtras] = React.useState({
    infrastructure_cost: 15000,
    data_engineering_cost: 10000,
    change_management_cost: 8000,
    ongoing_infrastructure: 2000,
    ongoing_support_fte: 0.25,
    support_fte_salary: 120000,
    revenue_increase_pct: 5,
    error_reduction_pct: 30,
    error_cost_annual: 50000,
  });

  /* ---- Debounced auto-calculate ---- */
  const debouncedInputs = useDebounce(inputs, DEBOUNCE_MS);

  React.useEffect(() => {
    const r = calculateRoi(debouncedInputs);
    const s = calculateSensitivity(debouncedInputs);
    setResults(r);
    setSensitivity(s);
  }, [debouncedInputs]);

  /* ---- Input updater ---- */
  function updateField(field: keyof RoiInputs, raw: string): void {
    const num = parseFloat(raw);
    if (Number.isNaN(num) || num < 0) return;
    setInputs((prev) => ({ ...prev, [field]: num }));
  }

  /* ---- Manual calculate ---- */
  function handleCalculate(): void {
    const r = calculateRoi(inputs);
    const s = calculateSensitivity(inputs);
    setResults(r);
    setSensitivity(s);
  }

  /* ---- Export ---- */
  function handleExport(): void {
    if (!results) return;
    const lines = [
      'ROI Calculator Export',
      '====================',
      '',
      'Input Parameters:',
      `  Team Size: ${inputs.team_size}`,
      `  Average Salary: ${formatCurrency(inputs.avg_salary)}`,
      `  Current Velocity: ${inputs.current_velocity} pts/sprint`,
      `  Projected Velocity Lift: ${inputs.projected_velocity_lift}%`,
      `  License Cost/User/Month: ${formatCurrency(inputs.license_cost_per_user)}`,
      `  Implementation Cost: ${formatCurrency(inputs.implementation_cost)}`,
      `  Training Cost: ${formatCurrency(inputs.training_cost)}`,
      '',
      'Results:',
      `  Monthly Savings: ${formatCurrency(results.monthly_savings)}`,
      `  Annual Savings: ${formatCurrency(results.annual_savings)}`,
      `  Total Annual Cost: ${formatCurrency(results.total_annual_cost)}`,
      `  Net Annual Benefit: ${formatCurrency(results.net_annual_benefit)}`,
      `  Payback Period: ${paybackLabel(results.payback_months)}`,
      `  ROI: ${formatPercent(results.roi_percentage)}`,
      `  3-Year NPV: ${formatCurrency(results.three_year_npv)}`,
      '',
      'Sensitivity Analysis:',
      'Velocity Lift | Monthly Savings | Annual Savings | Payback | 3-Year NPV',
    ];
    sensitivity.forEach((row) => {
      lines.push(`  ${row.velocity_lift}% | ${formatCurrency(row.monthly_savings)} | ${formatCurrency(row.annual_savings)} | ${paybackLabel(row.payback_months)} | ${formatCurrency(row.three_year_npv)}`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roi-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ---- Chart data ---- */
  const chartData = sensitivity.map((row) => ({
    name: `${row.velocity_lift}%`,
    npv: row.three_year_npv,
  }));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ------------------------------------------------------------------ */}
      {/*  Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-slate-900" />
            ROI Calculator
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Calculate and visualize the return on investment for AI coding agent
            adoption across your engineering organization.
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Separator />

      {/* ------------------------------------------------------------------ */}
      {/*  Input + Results Grid                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* ---- Input Card ---- */}
        <Card className="self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-slate-900" />
              Input Parameters
            </CardTitle>
            <CardDescription>
              Adjust the values below to model your scenario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Team Size */}
            <div className="space-y-1.5">
              <Label htmlFor="team_size" className="text-xs font-medium">
                Team Size (developers)
              </Label>
              <Input
                id="team_size"
                type="number"
                min={1}
                value={inputs.team_size}
                onChange={(e) => updateField('team_size', e.target.value)}
              />
            </div>

            {/* Average Salary */}
            <div className="space-y-1.5">
              <Label htmlFor="avg_salary" className="text-xs font-medium">
                Average Developer Salary ($/year)
              </Label>
              <Input
                id="avg_salary"
                type="number"
                min={0}
                step={1000}
                value={inputs.avg_salary}
                onChange={(e) => updateField('avg_salary', e.target.value)}
              />
            </div>

            {/* Current Velocity */}
            <div className="space-y-1.5">
              <Label htmlFor="current_velocity" className="text-xs font-medium">
                Current Velocity (story pts/sprint)
              </Label>
              <Input
                id="current_velocity"
                type="number"
                min={1}
                value={inputs.current_velocity}
                onChange={(e) => updateField('current_velocity', e.target.value)}
              />
            </div>

            {/* Projected Velocity Lift */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="projected_velocity_lift" className="text-xs font-medium">
                  Projected Velocity Lift
                </Label>
                <span className="text-sm font-semibold text-slate-900">
                  {inputs.projected_velocity_lift}%
                </span>
              </div>
              <Slider
                id="projected_velocity_lift"
                min={5}
                max={100}
                step={5}
                value={[inputs.projected_velocity_lift]}
                onValueChange={([val]) =>
                  setInputs((prev) => ({
                    ...prev,
                    projected_velocity_lift: val,
                  }))
                }
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5%</span>
                <span>100%</span>
              </div>
            </div>

            <Separator />

            {/* License Cost */}
            <div className="space-y-1.5">
              <Label htmlFor="license_cost" className="text-xs font-medium">
                License Cost per User/Month ($)
              </Label>
              <Input
                id="license_cost"
                type="number"
                min={0}
                value={inputs.license_cost_per_user}
                onChange={(e) =>
                  updateField('license_cost_per_user', e.target.value)
                }
              />
            </div>

            {/* Implementation Cost */}
            <div className="space-y-1.5">
              <Label htmlFor="implementation_cost" className="text-xs font-medium">
                Implementation Cost (one-time, $)
              </Label>
              <Input
                id="implementation_cost"
                type="number"
                min={0}
                step={1000}
                value={inputs.implementation_cost}
                onChange={(e) =>
                  updateField('implementation_cost', e.target.value)
                }
              />
            </div>

            {/* Training Cost */}
            <div className="space-y-1.5">
              <Label htmlFor="training_cost" className="text-xs font-medium">
                Training Cost (one-time, $)
              </Label>
              <Input
                id="training_cost"
                type="number"
                min={0}
                step={1000}
                value={inputs.training_cost}
                onChange={(e) => updateField('training_cost', e.target.value)}
              />
            </div>

            <Button className="w-full gap-2" onClick={handleCalculate}>
              <Calculator className="h-4 w-4" />
              Calculate
            </Button>
          </CardContent>
        </Card>

        {/* ---- Results Grid ---- */}
        {results ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ResultMetricCard
                label="Monthly Savings"
                value={formatCurrency(results.monthly_savings)}
                icon={DollarSign}
                variant="positive"
              />
              <ResultMetricCard
                label="Annual Savings"
                value={formatCurrency(results.annual_savings)}
                icon={DollarSign}
                variant="positive"
              />
              <ResultMetricCard
                label="Total Annual Cost"
                value={formatCurrency(results.total_annual_cost)}
                icon={DollarSign}
                variant="neutral"
                sub="Licenses + implementation + training"
              />
              <ResultMetricCard
                label="Net Annual Benefit"
                value={formatCurrency(results.net_annual_benefit)}
                icon={TrendingUp}
                variant={results.net_annual_benefit >= 0 ? 'positive' : 'negative'}
              />
              <ResultMetricCard
                label="Payback Period"
                value={paybackLabel(results.payback_months)}
                icon={Clock}
                variant={results.payback_months <= 6 ? 'positive' : results.payback_months >= 999 ? 'negative' : 'neutral'}
                badge={
                  <Badge variant={paybackBadgeVariant(results.payback_months)} className="text-xs">
                    {results.payback_months <= 3
                      ? 'Fast'
                      : results.payback_months <= 6
                        ? 'Good'
                        : results.payback_months <= 12
                          ? 'Moderate'
                          : results.payback_months >= 999
                            ? 'Never'
                            : 'Slow'}
                  </Badge>
                }
              />
              <ResultMetricCard
                label="ROI %"
                value={formatPercent(results.roi_percentage)}
                icon={TrendingUp}
                variant={results.roi_percentage >= 0 ? 'positive' : 'negative'}
                badge={
                  <Badge
                    variant={results.roi_percentage >= 100 ? 'default' : results.roi_percentage >= 0 ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {results.roi_percentage >= 200
                      ? 'Excellent'
                      : results.roi_percentage >= 100
                        ? 'Strong'
                        : results.roi_percentage >= 0
                          ? 'Positive'
                          : 'Negative'}
                  </Badge>
                }
              />
              <ResultMetricCard
                label="3-Year NPV"
                value={formatCurrency(results.three_year_npv)}
                icon={BarChart3}
                variant={results.three_year_npv >= 0 ? 'positive' : 'negative'}
                sub="Net present value at 10% discount rate"
              />
            </div>
          </div>
        ) : (
          <Card className="flex items-center justify-center min-h-[300px]">
            <CardContent className="text-center py-12">
              <Calculator className="h-12 w-12 text-slate-500/40 mx-auto mb-4" />
              <p className="text-sm text-slate-500">
                Adjust the input parameters and results will appear here automatically.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Sensitivity Analysis                                               */}
      {/* ------------------------------------------------------------------ */}
      {/* ------------------------------------------------------------------ */}
      {/*  Enhanced TCO & Scenario Analysis Toggle                            */}
      {/* ------------------------------------------------------------------ */}
      {results && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setShowEnhanced(!showEnhanced);
              if (!showEnhanced && !enhancedResults) {
                const enhanced = calculateEnhancedRoi({ ...inputs, ...enhancedExtras });
                setEnhancedResults(enhanced);
              }
            }}
          >
            <TrendingUp className="h-4 w-4" />
            {showEnhanced ? 'Hide' : 'Show'} TCO & Scenario Analysis
          </Button>
        </div>
      )}

      {showEnhanced && enhancedResults && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-slate-900" />
              Total Cost of Ownership
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Full lifecycle cost analysis including infrastructure, support, and change management.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Initial Investment</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(enhancedResults.tco_initial)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Annual Operating</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(enhancedResults.tco_annual)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">3-Year TCO</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(enhancedResults.tco_three_year)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Internal Rate of Return</p>
                  <p className="text-xl font-bold text-emerald-600">{enhancedResults.irr}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Benefit Breakdown */}
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Annual Benefit Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Productivity Gains', value: enhancedResults.benefit_breakdown.productivity, color: 'bg-emerald-500' },
                    { label: 'Revenue Impact', value: enhancedResults.benefit_breakdown.revenue, color: 'bg-blue-500' },
                    { label: 'Error Reduction Savings', value: enhancedResults.benefit_breakdown.error_savings, color: 'bg-purple-500' },
                    { label: 'Cost Reduction', value: enhancedResults.benefit_breakdown.cost_reduction, color: 'bg-amber-500' },
                  ].map((item) => {
                    const total = enhancedResults.benefit_breakdown.productivity + enhancedResults.benefit_breakdown.revenue + enhancedResults.benefit_breakdown.error_savings;
                    const pct = total > 0 ? Math.round((Math.abs(item.value) / total) * 100) : 0;
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-slate-600 w-44">{item.label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium text-slate-900 w-28 text-right">{formatCurrency(item.value)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Scenario Analysis */}
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-1 mt-8">
              <BarChart3 className="h-5 w-5 text-slate-900" />
              Scenario Analysis
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Probability-weighted scenarios from optimistic to pessimistic.
            </p>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scenario</TableHead>
                      <TableHead className="text-right">Probability</TableHead>
                      <TableHead className="text-right">Revenue Mult.</TableHead>
                      <TableHead className="text-right">Cost Mult.</TableHead>
                      <TableHead className="text-right">3-Year NPV</TableHead>
                      <TableHead className="text-right">ROI %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enhancedResults.scenarios.map((s) => (
                      <TableRow key={s.scenario} className={s.scenario === 'base' ? 'bg-slate-50 font-medium' : ''}>
                        <TableCell>
                          <Badge variant={
                            s.scenario === 'optimistic' ? 'default' :
                            s.scenario === 'base' ? 'secondary' :
                            s.scenario === 'conservative' ? 'outline' : 'destructive'
                          }>
                            {s.scenario.charAt(0).toUpperCase() + s.scenario.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{(s.probability * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-right">{s.revenue_multiplier.toFixed(2)}x</TableCell>
                        <TableCell className="text-right">{s.cost_multiplier.toFixed(2)}x</TableCell>
                        <TableCell className={cn('text-right font-semibold', s.npv >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                          {formatCurrency(s.npv)}
                        </TableCell>
                        <TableCell className={cn('text-right', s.roi >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                          {formatPercent(s.roi)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <strong>Expected NPV (probability-weighted):</strong>{' '}
                    <span className={enhancedResults.expected_npv >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                      {formatCurrency(enhancedResults.expected_npv)}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 5-Year Cash Flow */}
            <Card>
              <CardHeader><CardTitle className="text-base">5-Year Cash Flow Projection</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {enhancedResults.five_year_cashflows.map((cf, i) => {
                    const max = Math.max(...enhancedResults.five_year_cashflows.map(Math.abs));
                    const height = max > 0 ? (Math.abs(cf) / max) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className={cn('text-xs font-medium', cf >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                          {formatCurrency(cf)}
                        </span>
                        <div
                          className={cn('w-full rounded-t', cf >= 0 ? 'bg-emerald-500' : 'bg-red-400')}
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        />
                        <span className="text-xs text-slate-500">Y{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {sensitivity.length > 0 && (
        <>
          <Separator />

          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-slate-900" />
              Sensitivity Analysis
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              3-Year Net Present Value at varying velocity lift percentages,
              holding all other inputs constant.
            </p>

            {/* Chart */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 8, right: 24, left: 24, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        className="text-slate-500"
                        label={{
                          value: 'Velocity Lift',
                          position: 'insideBottom',
                          offset: -4,
                          fontSize: 12,
                          className: 'fill-slate-500',
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        className="text-slate-500"
                        tickFormatter={(v: number) => formatCurrency(v)}
                        width={100}
                        label={{
                          value: '3-Year NPV',
                          angle: -90,
                          position: 'insideLeft',
                          offset: 0,
                          fontSize: 12,
                          className: 'fill-slate-500',
                        }}
                      />
                      <Tooltip content={<SensitivityTooltip />} />
                      <Bar dataKey="npv" radius={[4, 4, 0, 0]} maxBarSize={56}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.npv >= 0 ? '#10b981' : '#ef4444'}
                            opacity={
                              entry.name === `${inputs.projected_velocity_lift}%`
                                ? 1
                                : 0.6
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detailed Sensitivity Data</CardTitle>
                <CardDescription>
                  Full breakdown at each velocity lift scenario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Velocity Lift</TableHead>
                      <TableHead className="text-right">Monthly Savings</TableHead>
                      <TableHead className="text-right">Annual Savings</TableHead>
                      <TableHead className="text-right">Payback (months)</TableHead>
                      <TableHead className="text-right">3-Year NPV</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensitivity.map((row) => {
                      const isCurrentLift =
                        row.velocity_lift === inputs.projected_velocity_lift;
                      return (
                        <TableRow
                          key={row.velocity_lift}
                          className={cn(
                            isCurrentLift && 'bg-slate-50 font-medium'
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {row.velocity_lift}%
                              {isCurrentLift && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  Current
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.monthly_savings)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.annual_savings)}
                          </TableCell>
                          <TableCell className="text-right">
                            {paybackLabel(row.payback_months)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-right font-semibold',
                              row.three_year_npv >= 0
                                ? 'text-emerald-600'
                                : 'text-red-600'
                            )}
                          >
                            {formatCurrency(row.three_year_npv)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
