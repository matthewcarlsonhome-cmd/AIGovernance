'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, LogOut } from 'lucide-react';

function getErrorGuidance(message: string): { title: string; guidance: string } {
  if (message.includes('authentication') || message.includes('Unauthorized') || message.includes('401')) {
    return {
      title: 'Authentication Error',
      guidance: 'Your session may have expired. Try signing in again.',
    };
  }
  if (message.includes('permission') || message.includes('Forbidden') || message.includes('403')) {
    return {
      title: 'Access Denied',
      guidance: 'You do not have permission to access this resource. Contact your administrator if you believe this is a mistake.',
    };
  }
  if (message.includes('not found') || message.includes('404')) {
    return {
      title: 'Not Found',
      guidance: 'The requested resource could not be found. It may have been moved or deleted.',
    };
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('ECONNREFUSED')) {
    return {
      title: 'Connection Error',
      guidance: 'Cannot connect to the server. Check your internet connection and try again.',
    };
  }
  if (message.includes('Supabase') || message.includes('supabase')) {
    return {
      title: 'Database Error',
      guidance: 'There was a problem connecting to the database. Verify your Supabase configuration in .env.local.',
    };
  }
  return {
    title: 'Something Went Wrong',
    guidance: 'An unexpected error occurred. Try refreshing the page or going back to the dashboard.',
  };
}

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  const { title, guidance } = getErrorGuidance(error.message || '');

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">{guidance}</p>
          <div className="rounded-md bg-slate-50 p-3 border">
            <p className="text-xs font-mono text-slate-500 break-all">
              {error.message || 'No error details available.'}
            </p>
          </div>
          {error.digest && (
            <p className="text-xs text-slate-400">Error ID: {error.digest}</p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="outline" className="flex-1 gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button onClick={() => router.push('/')} variant="outline" className="flex-1 gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
