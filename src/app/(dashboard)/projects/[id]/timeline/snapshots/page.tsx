'use client';

import { Camera, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SNAPSHOT_DATA = [
  { phase: 'Discovery', baselineEnd: 'Jan 10', currentEnd: 'Jan 12', variance: '+2 days', status: 'behind' as const },
  { phase: 'Governance', baselineEnd: 'Jan 17', currentEnd: 'Jan 19', variance: '+2 days', status: 'behind' as const },
  { phase: 'Sandbox Build', baselineEnd: 'Jan 27', currentEnd: 'Jan 28', variance: '+1 day', status: 'behind' as const },
  { phase: 'Training & Launch', baselineEnd: 'Feb 3', currentEnd: 'Feb 4', variance: '+1 day', status: 'at_risk' as const },
  { phase: 'Evaluation', baselineEnd: 'Feb 24', currentEnd: 'Feb 24', variance: 'On track', status: 'on_track' as const },
  { phase: 'Readout', baselineEnd: 'Mar 14', currentEnd: 'Mar 14', variance: 'On track', status: 'on_track' as const },
];

const statusConfig = {
  on_track: { label: 'On Track', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, iconColor: 'text-emerald-600' },
  behind: { label: 'Behind', color: 'bg-yellow-100 text-yellow-800', icon: Clock, iconColor: 'text-yellow-600' },
  at_risk: { label: 'At Risk', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, iconColor: 'text-orange-600' },
};

export default function SnapshotsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            Schedule Baseline Comparison
          </h1>
          <p className="text-muted-foreground mt-1">Compare current schedule against saved baselines</p>
        </div>
        <Button><Camera className="h-4 w-4 mr-2" /> Save New Baseline</Button>
      </div>

      {/* Summary */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold">Schedule is 2 days behind baseline</p>
              <p className="text-sm text-muted-foreground">Critical path impact: <span className="font-medium text-emerald-700">Low</span> — Evaluation and Readout phases remain on track.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison info */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Baseline</p>
            <p className="font-semibold">Original Plan</p>
            <p className="text-sm text-muted-foreground">Saved Jan 6, 2026</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Schedule</p>
            <p className="font-semibold">Active Plan</p>
            <p className="text-sm text-muted-foreground">As of Feb 9, 2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader><CardTitle>Phase-by-Phase Comparison</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 px-3 font-medium">Phase</th>
                <th className="py-3 px-3 font-medium">Baseline End</th>
                <th className="py-3 px-3 font-medium">Current End</th>
                <th className="py-3 px-3 font-medium">Variance</th>
                <th className="py-3 px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {SNAPSHOT_DATA.map((row) => {
                const config = statusConfig[row.status];
                const StatusIcon = config.icon;
                return (
                  <tr key={row.phase} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-3 font-medium">{row.phase}</td>
                    <td className="py-3 px-3 text-muted-foreground">{row.baselineEnd}</td>
                    <td className="py-3 px-3">{row.currentEnd}</td>
                    <td className="py-3 px-3">
                      <span className={row.status !== 'on_track' ? 'text-yellow-700 font-medium' : 'text-emerald-700'}>{row.variance}</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge className={config.color}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${config.iconColor}`} />
                        {config.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
