'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

export default function ActionQueuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Action Queue</h1>
        <p className="text-slate-500 mt-1">Priority-sorted pending actions for this project.</p>
        <Badge className="mt-2 bg-slate-100 text-slate-700 border border-slate-200 font-normal text-xs">Owned by: Governance Consultant</Badge>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <p className="text-sm text-blue-900 font-semibold">Looking for your tasks?</p>
          <p className="text-sm text-blue-700 mt-1">
            Visit My Tasks for your role-specific action items and upcoming responsibilities.
          </p>
          <a href={`/projects/${projectId}/my-tasks`}>
            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 mt-3">
              Go to My Tasks
            </Button>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <ClipboardList className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Actions</h3>
            <p className="text-sm text-slate-500">
              No pending actions. As your project progresses, action items will be generated automatically based on phase requirements, deadlines, and gate review outcomes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
