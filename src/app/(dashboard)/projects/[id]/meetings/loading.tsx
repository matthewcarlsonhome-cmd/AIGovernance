import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className || ''}`} />;
}

export default function MeetingsLoading() {
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

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>

      {/* Meeting list */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Date badge */}
                <div className="flex flex-col items-center">
                  <Skeleton className="h-12 w-12 rounded" />
                </div>

                {/* Meeting details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-md" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  {/* Attendee avatars */}
                  <div className="flex items-center gap-1 pt-1">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-6 w-6 rounded-full" />
                    ))}
                    <Skeleton className="h-6 w-8 rounded-full" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
