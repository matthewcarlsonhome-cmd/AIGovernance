import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className || ''}`} />;
}

export default function TeamLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Search and filter */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Team member grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

                {/* Member info */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>

                {/* More button */}
                <Skeleton className="h-8 w-8" />
              </div>

              {/* Assignments */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <Skeleton className="h-3 w-20" />
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-5 w-16 rounded-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
