'use client';

import { use } from 'react';
import { BarChart3 } from 'lucide-react';

export default function DecideWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: _id } = use(params);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border border-slate-200 rounded-lg bg-white p-4">
        <h1 className="text-2xl font-bold text-slate-900">Decide</h1>
        <p className="text-sm text-slate-500 mt-1">
          Go/no-go recommendation with evidence and compliance outputs
        </p>
      </div>

      {/* Empty State */}
      <div className="border border-slate-200 rounded-lg bg-white py-16">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
            <BarChart3 className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Decision Evidence Not Yet Available</h3>
          <p className="text-sm text-slate-500">
            The decision hub aggregates outcomes from all 5 project phases — pilot metrics, compliance scores, risk assessments, and ROI calculations — to generate a go/no-go recommendation. Complete the pilot phase to populate this view.
          </p>
        </div>
      </div>
    </div>
  );
}
