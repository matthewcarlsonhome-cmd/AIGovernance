'use client';

import * as React from 'react';
import { Flag, CheckCircle, Clock, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMilestones } from '@/hooks/use-timeline';

const MILESTONES = [
  { id: 'm1', date: 'Jan 10, 2026', title: 'Readiness Assessment Delivered', gate: null, status: 'reached' as const, description: 'Assessment questionnaire completed, feasibility scores calculated, readiness report generated.' },
  { id: 'm2', date: 'Jan 17, 2026', title: 'AUP Approved & Legal Sign-off', gate: 'Gate 1', status: 'reached' as const, description: 'AI Acceptable Use Policy approved. Legal review complete. Developer training module deployed.' },
  { id: 'm3', date: 'Jan 27, 2026', title: 'Sandbox Passes Isolation Validation', gate: 'Gate 2', status: 'upcoming' as const, description: 'Cloud sandbox provisioned, egress filtering configured, DLP rules active, audit logging integrated.' },
  { id: 'm4', date: 'Feb 3, 2026', title: 'Sprint 1 Go/No-Go Decision', gate: null, status: 'upcoming' as const, description: 'Security training complete, AUP signatures collected, baseline metrics captured, Sprint 1 approved.' },
  { id: 'm5', date: 'Feb 24, 2026', title: 'Sprint 3 Complete — All Data Collected', gate: null, status: 'future' as const, description: 'All evaluation sprints complete. Comparative data collected. Red team exercise finished.' },
  { id: 'm6', date: 'Mar 14, 2026', title: 'Executive Decision — Go/No-Go for Production', gate: 'Gate 3', status: 'future' as const, description: 'Full evaluation presented to leadership. ROI analysis delivered. Vendor negotiation support provided.' },
];

const statusConfig = {
  reached: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-600', line: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-800' },
  upcoming: { icon: Clock, color: 'text-blue-600', bg: 'border-2 border-blue-500 bg-white', line: 'bg-blue-300', badge: 'bg-blue-100 text-blue-800' },
  future: { icon: Circle, color: 'text-gray-400', bg: 'border-2 border-gray-300 bg-white', line: 'bg-gray-200', badge: 'bg-gray-100 text-gray-600' },
};

export default function MilestonesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: fetchedMilestones, isLoading, error } = useMilestones(id);

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {error.message}</p></div>;

  const milestones = (fetchedMilestones && fetchedMilestones.length > 0) ? fetchedMilestones as unknown as typeof MILESTONES : MILESTONES;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flag className="h-6 w-6 text-slate-900" />
          Project Milestones
        </h1>
        <p className="text-slate-500 mt-1">Key deliverables and gate review checkpoints</p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative ml-8">
        {milestones.map((ms, i) => {
          const config = statusConfig[ms.status];
          const isLast = i === milestones.length - 1;
          return (
            <div key={ms.id} className="relative flex gap-6 pb-8">
              {/* Vertical line */}
              {!isLast && (
                <div className={`absolute left-[11px] top-[28px] w-0.5 h-[calc(100%-16px)] ${config.line}`} />
              )}
              {/* Dot */}
              <div className={`relative z-10 w-6 h-6 rounded-full shrink-0 mt-1 ${config.bg} flex items-center justify-center`}>
                {ms.status === 'reached' && <CheckCircle className="h-6 w-6 text-white fill-emerald-600" />}
              </div>
              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-500">{ms.date}</span>
                  {ms.gate && <Badge className={config.badge}>{ms.gate}</Badge>}
                  <Badge variant="outline" className={config.badge}>{ms.status === 'reached' ? 'Reached' : ms.status === 'upcoming' ? 'Upcoming' : 'Planned'}</Badge>
                </div>
                <h3 className="text-lg font-semibold mt-1">{ms.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{ms.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
