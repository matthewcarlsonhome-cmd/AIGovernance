'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Application Error</h2>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Something went wrong while loading the application. This may be a temporary issue.
        </p>

        <div className="rounded-md bg-slate-50 p-3 border">
          <p className="text-xs font-mono text-slate-500 break-all">
            {error.message || 'No error details available.'}
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-slate-400">Error ID: {error.digest}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <a
            href="/login"
            className="flex-1 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
