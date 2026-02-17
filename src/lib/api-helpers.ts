import { NextRequest, NextResponse } from 'next/server';
import {
  rateLimit,
  RATE_LIMIT_DEFAULT,
  RATE_LIMIT_WINDOW_MS,
  type RateLimitResult,
} from '@/lib/rate-limit';
import type { ApiResponse } from '@/types';

/**
 * Generate a unique trace ID for request correlation.
 * Uses crypto.randomUUID() which is available in Node 19+ and all modern runtimes.
 */
export function generateTraceId(): string {
  return crypto.randomUUID();
}

/**
 * Extract the client IP address from a Next.js request.
 *
 * Checks the standard `x-forwarded-for` header first (set by reverse
 * proxies and Vercel), then falls back to `x-real-ip`, and finally
 * to a constant string for local development where headers may be absent.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; take the first.
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback for local development without a reverse proxy.
  return '127.0.0.1';
}

/**
 * Apply rate limiting to an incoming request.
 *
 * If the rate limit is exceeded a 429 response is returned with a
 * `Retry-After` header (in seconds) and standard rate-limit headers.
 *
 * @param request  - The incoming Next.js request.
 * @param limit    - Maximum requests allowed in the window.
 * @param windowMs - Duration of the rate-limit window in milliseconds.
 * @returns `null` if the request is within limits, or a `NextResponse`
 *          with status 429 if the limit is exceeded.
 */
export function withRateLimit(
  request: NextRequest,
  limit: number = RATE_LIMIT_DEFAULT,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
): NextResponse<ApiResponse<never>> | null {
  const ip = getClientIp(request);
  // Prefix the key with the pathname so different endpoints have
  // independent rate-limit buckets.
  const key = `${request.nextUrl.pathname}:${ip}`;

  const result: RateLimitResult = rateLimit(key, limit, windowMs);

  if (!result.success) {
    const retryAfterSeconds = Math.ceil(result.resetIn / 1000);
    const response = NextResponse.json<ApiResponse<never>>(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please retry after ${retryAfterSeconds} seconds.`,
        traceId: generateTraceId(),
      },
      { status: 429 },
    );
    response.headers.set('Retry-After', String(retryAfterSeconds));
    response.headers.set('X-RateLimit-Limit', String(limit));
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetIn / 1000)));
    return response;
  }

  // Within limits -- caller should proceed with normal handling.
  return null;
}

/**
 * Create a consistent JSON error response.
 *
 * @param message - Human-readable error description.
 * @param status  - HTTP status code (defaults to 500).
 */
export function apiError(
  message: string,
  status: number = 500,
  traceId?: string,
): NextResponse<ApiResponse> {
  return NextResponse.json<ApiResponse>(
    { error: message, traceId: traceId ?? generateTraceId() },
    { status },
  );
}

/**
 * Create a consistent JSON success response.
 *
 * @param data    - The payload to return under the `data` key.
 * @param status  - HTTP status code (defaults to 200).
 * @param message - Optional human-readable summary.
 */
export function apiSuccess<T>(
  data: T,
  status: number = 200,
  message?: string,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>(
    { data, message, traceId: generateTraceId() },
    { status },
  );
}
