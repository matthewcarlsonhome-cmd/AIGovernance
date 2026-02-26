'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';
import type { OutcomeMetric } from '@/types';

const DEMO_METRICS: OutcomeMetric[] = [];

const TREND_DATA: { week: string; time_saved: number; adoption: number; quality: number }[] = [];

const CATEGORY_COLORS: Record<string, string> = {
  value: 'bg-blue-100 text-blue-800 border-blue-200',
  quality: 'bg-purple-100 text-purple-800 border-purple-200',
  adoption: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  efficiency: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  risk: 'bg-red-100 text-red-800 border-red-200',
};

function getAttainment(metric: OutcomeMetric): number | null {
  if (metric.actual_value === null) return null;
  if (metric.target_value === 0) return metric.actual_value === 0 ? 100 : 0;
  // For metrics where lower is better (like bugs, cost), invert
  if (metric.category === 'risk' || metric.name.includes('Cost') || metric.name.includes('Bug') || metric.name.includes('Time')) {
    if (metric.target_value === 0 && metric.actual_value === 0) return 100;
    return Math.round((metric.target_value / Math.max(metric.actual_value, 0.01)) * 100);
  }
  return Math.round((metric.actual_value / metric.target_value) * 100);
}

export default function OutcomeMetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);

  const metWithTarget = DEMO_METRICS.filter((m) => m.actual_value !== null);
  const metCount = metWithTarget.filter((m) => (getAttainment(m) ?? 0) >= 100).length;
  const avgAttainment = metWithTarget.length > 0
    ? Math.round(metWithTarget.reduce((s, m) => s + (getAttainment(m) ?? 0), 0) / metWithTarget.length)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Outcome Metrics</h1>
        <p className="text-slate-500 mt-1">Track pilot results against targets. These feed directly into the executive decision brief.</p>
        <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-normal mt-2">Owned by: Governance Consultant, Executive Sponsor</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold text-slate-900">{avgAttainment}%</p>
            <p className="text-sm text-slate-500">Avg Attainment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
            <p className="text-3xl font-bold text-emerald-700">{metCount}/{DEMO_METRICS.length}</p>
            <p className="text-sm text-slate-500">Targets Met</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p className="text-3xl font-bold text-slate-900">{DEMO_METRICS.length}</p>
            <p className="text-sm text-slate-500">Metrics Tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Weekly Trends</CardTitle>
          <CardDescription className="text-slate-500">Key metrics tracked week-over-week during the pilot period.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="time_saved" stroke="#0891b2" strokeWidth={2} name="Time Saved (hrs)" dot={{ fill: '#0891b2' }} />
              <Line type="monotone" dataKey="adoption" stroke="#059669" strokeWidth={2} name="Adoption (%)" dot={{ fill: '#059669' }} />
              <Line type="monotone" dataKey="quality" stroke="#7c3aed" strokeWidth={2} name="Quality Score" dot={{ fill: '#7c3aed' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">All Outcome Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DEMO_METRICS.map((metric) => {
              const attainment = getAttainment(metric);
              const isMet = attainment !== null && attainment >= 100;
              return (
                <div key={metric.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                  <div className="w-56 flex-shrink-0">
                    <p className="font-medium text-slate-900">{metric.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={CATEGORY_COLORS[metric.category] ?? 'bg-slate-100 text-slate-700'} variant="outline">{metric.category}</Badge>
                      <Badge variant="outline" className="text-slate-500 border-slate-200">{metric.confidence}</Badge>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Progress value={Math.min(attainment ?? 0, 100)} className="h-3" />
                  </div>
                  <div className="w-28 text-right">
                    <p className="text-sm text-slate-500">
                      {metric.actual_value ?? '—'} / {metric.target_value} {metric.unit}
                    </p>
                    <p className={`text-sm font-bold ${isMet ? 'text-emerald-700' : attainment !== null && attainment >= 70 ? 'text-yellow-700' : 'text-red-700'}`}>
                      {attainment !== null ? `${attainment}%` : '—'}
                    </p>
                  </div>
                  <div className="w-6">
                    {isMet ? <TrendingUp className="h-5 w-5 text-emerald-600" />
                      : attainment !== null && attainment >= 70 ? <Minus className="h-5 w-5 text-yellow-600" />
                      : <TrendingDown className="h-5 w-5 text-red-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Step */}
      <Card className="bg-blue-50 border-blue-200 mt-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">Next Step</p>
              <p className="text-sm text-blue-700">Review the executive decision brief for the go/no-go recommendation.</p>
            </div>
            <a href={`/projects/${projectId}/decision-hub`}>
              <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                Decision Hub <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
