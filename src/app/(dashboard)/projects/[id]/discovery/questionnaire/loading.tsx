import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className || ''}`} />;
}

export default function QuestionnaireLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Question form */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question items */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-full max-w-lg" />
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2 pl-1">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
