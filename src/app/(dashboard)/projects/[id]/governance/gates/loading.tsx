import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${className || ''}`} />;
}

export default function GatesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-3">
        <p className="text-sm text-slate-400 animate-pulse">
          Opening the gates...
        </p>
      </div>
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Gate pipeline - 3 gates in a row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Checklist items */}
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
              {/* Gate action button */}
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gate review history */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b last:border-0">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
