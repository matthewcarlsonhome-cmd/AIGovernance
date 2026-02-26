// ─────────────────────────────────────────────────────────────────────────────
// API Route Wrapper — Automatically adds monitoring to API handlers
// ─────────────────────────────────────────────────────────────────────────────
//
// Usage:
//   import { withMonitoring } from '@/lib/monitoring/api-wrapper';
//
//   async function handler(request: NextRequest) { ... }
//   export const GET = withMonitoring(handler);
//
// The wrapper:
// 1. Records request start time
// 2. Invokes the original handler
// 3. Logs the request (method, path, status, duration, user_id)
// 4. Tracks per-route performance metrics
// 5. Catches unhandled errors, logs them, and returns a 500 response
// 6. Does NOT change the API response shape for successful requests
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { logRequest, trackError, trackPerformance } from './index';
import { apiError } from '@/lib/api-helpers';

/**
 * The signature for a Next.js App Router API route handler.
 * Supports handlers that receive just the request, or request + context
 * (for dynamic routes with params).
 */
export type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps an API route handler with automatic monitoring instrumentation.
 *
 * - Logs every request to the request logger
 * - Tracks response time per route for performance percentiles
 * - Catches unhandled errors and logs them to the error tracker
 * - Returns a consistent 500 error response for unhandled exceptions
 */
export function withMonitoring(handler: RouteHandler): RouteHandler {
  return async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    const startTime = performance.now();
    const method = request.method;
    const path = request.nextUrl.pathname;

    // Attempt to extract user_id from request headers or auth context.
    // In a real app this would come from the auth session, but we keep
    // it lightweight by checking a common header set by middleware.
    const userId = request.headers.get('x-user-id') ?? null;

    try {
      const response = await handler(request, context);
      const durationMs = performance.now() - startTime;
      const statusCode = response.status;

      // Log request
      logRequest({
        method,
        path,
        status_code: statusCode,
        duration_ms: Math.round(durationMs * 100) / 100,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });

      // Track performance
      trackPerformance(path, durationMs);

      return response;
    } catch (error: unknown) {
      const durationMs = performance.now() - startTime;

      // Track the error
      trackError(error, { route: path, method, user_id: userId });

      // Log the failed request
      logRequest({
        method,
        path,
        status_code: 500,
        duration_ms: Math.round(durationMs * 100) / 100,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });

      // Track performance even for errors
      trackPerformance(path, durationMs);

      // Return a consistent error response
      return apiError('Internal server error', 500);
    }
  };
}
