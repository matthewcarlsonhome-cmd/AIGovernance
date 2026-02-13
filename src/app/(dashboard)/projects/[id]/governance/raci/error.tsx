'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-4xl mb-2">🫠</div>
          <CardTitle>Well, that didn&apos;t go as planned</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            {error.message || 'Something unexpected happened. No worries — let\u0027s try that again.'}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={reset} variant="outline" className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Give It Another Go
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
