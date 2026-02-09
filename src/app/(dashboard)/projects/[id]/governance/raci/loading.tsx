import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className || ''}`} />;
}

export default function RACILoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* RACI Matrix grid */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          {/* Table header */}
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 gap-0 bg-muted/50 p-3 border-b">
              <Skeleton className="h-4 w-24 col-span-2" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-center">
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>

            {/* Table rows */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-0 p-3 border-b last:border-0">
                <div className="col-span-2">
                  <Skeleton className="h-4 w-full max-w-[180px]" />
                </div>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex justify-center">
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6">
        {['R', 'A', 'C', 'I'].map((letter) => (
          <div key={letter} className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
