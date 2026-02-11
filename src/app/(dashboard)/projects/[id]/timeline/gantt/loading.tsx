import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${className || ''}`} />;
}

export default function GanttLoading() {
  return (
    <div className="space-y-6">
      {/* Page header + controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        {['Day', 'Week', 'Month', 'Quarter'].map((label) => (
          <Skeleton key={label} className="h-8 w-16" />
        ))}
      </div>

      {/* Gantt chart area */}
      <Card>
        <CardContent className="p-0">
          <div className="flex">
            {/* Task names column */}
            <div className="w-64 border-r p-4 space-y-3">
              <Skeleton className="h-6 w-32 mb-4" />
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2" style={{ paddingLeft: i % 3 === 0 ? 0 : 16 }}>
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>

            {/* Timeline area */}
            <div className="flex-1 p-4">
              {/* Date headers */}
              <div className="flex gap-0 mb-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 flex-1 mx-0.5" />
                ))}
              </div>

              {/* Gantt bars */}
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => {
                  const offset = (i * 17 + 5) % 40;
                  const width = 20 + (i * 13) % 40;
                  return (
                    <div key={i} className="relative h-5">
                      <div
                        className="h-5 absolute rounded-sm animate-pulse bg-slate-100"
                        style={{
                          left: `${offset}%`,
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
