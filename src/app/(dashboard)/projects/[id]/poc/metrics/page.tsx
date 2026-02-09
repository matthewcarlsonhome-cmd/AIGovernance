'use client';

import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const METRICS = [
  { name: 'Velocity', baseline: 21, aiAssisted: 36, unit: 'pts/sprint', change: 71, positive: true },
  { name: 'Cycle Time', baseline: 4.2, aiAssisted: 2.1, unit: 'days', change: -50, positive: true },
  { name: 'Defect Rate', baseline: 12, aiAssisted: 8, unit: '%', change: -33, positive: true },
  { name: 'Code Review Time', baseline: 45, aiAssisted: 22, unit: 'min/PR', change: -51, positive: true },
  { name: 'Test Coverage', baseline: 67, aiAssisted: 84, unit: '%', change: 25, positive: true },
  { name: 'Developer Satisfaction', baseline: 6.2, aiAssisted: 8.7, unit: '/10', change: 40, positive: true },
];

export default function MetricsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Baseline vs AI-Assisted Metrics
        </h1>
        <p className="text-muted-foreground mt-1">Quantitative comparison of development metrics before and after AI tool adoption</p>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-700">+71%</p>
              <p className="text-sm text-muted-foreground">Avg. Velocity Increase</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700">-50%</p>
              <p className="text-sm text-muted-foreground">Cycle Time Reduction</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-violet-700">+25%</p>
              <p className="text-sm text-muted-foreground">Test Coverage Gain</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map((m) => {
          const isIncrease = m.change > 0;
          const ArrowIcon = isIncrease ? ArrowUpRight : ArrowDownRight;
          // For metrics where decrease is good (cycle time, defect rate, review time)
          const isGood = m.positive;
          const changeColor = isGood ? 'text-emerald-600' : 'text-red-600';

          return (
            <Card key={m.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{m.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="space-y-2 flex-1">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Baseline</p>
                      <p className="text-xl font-semibold text-muted-foreground">{m.baseline} <span className="text-xs">{m.unit}</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">AI-Assisted</p>
                      <p className="text-2xl font-bold">{m.aiAssisted} <span className="text-xs font-normal text-muted-foreground">{m.unit}</span></p>
                    </div>
                  </div>
                  <div className={`text-right ${changeColor}`}>
                    <ArrowIcon className="h-8 w-8 ml-auto" />
                    <p className="text-xl font-bold">{isIncrease ? '+' : ''}{m.change}%</p>
                  </div>
                </div>
                {/* Visual bar comparison */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-16">Baseline</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${(m.baseline / Math.max(m.baseline, m.aiAssisted)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-16">AI-Assisted</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(m.aiAssisted / Math.max(m.baseline, m.aiAssisted)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
