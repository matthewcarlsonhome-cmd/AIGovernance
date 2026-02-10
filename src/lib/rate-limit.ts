/**
 * In-memory rate limiter for API routes.
 *
 * Uses a Map keyed by identifier (typically IP address) to track request
 * counts within sliding time windows. Expired entries are cleaned up
 * periodically to prevent memory leaks.
 *
 * This is suitable for single-instance deployments (e.g., Vercel serverless
 * functions share memory within a single invocation lifecycle). For
 * multi-instance deployments, replace with Redis-backed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

/** Default: 60 requests per 60 000 ms (1 minute) */
export const RATE_LIMIT_DEFAULT = 60;
/** Strict: 10 requests per 60 000 ms (for AI endpoints) */
export const RATE_LIMIT_STRICT = 10;
/** Export: 20 requests per 60 000 ms (for export endpoints) */
export const RATE_LIMIT_EXPORT = 20;
/** Default window: 60 seconds */
export const RATE_LIMIT_WINDOW_MS = 60_000;

const store = new Map<string, RateLimitEntry>();

/** Interval handle for the cleanup timer (created lazily). */
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the periodic cleanup of expired entries if not already running.
 * Runs every 60 seconds by default.
 */
function ensureCleanupRunning(): void {
  if (cleanupInterval !== null) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetTime) {
        store.delete(key);
      }
    }

    // If the store is empty, stop the cleanup timer to avoid
    // keeping the process alive unnecessarily in serverless.
    if (store.size === 0 && cleanupInterval !== null) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  }, 60_000);

  // Allow the Node.js process to exit even if the timer is running.
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref();
  }
}

/**
 * Check and consume one request against the rate limit for a given identifier.
 *
 * @param identifier - Unique key for the requester (typically IP address).
 * @param limit      - Maximum number of requests allowed in the window.
 * @param windowMs   - Duration of the rate-limit window in milliseconds.
 * @returns An object indicating whether the request is allowed, how many
 *          requests remain, and how many milliseconds until the window resets.
 */
export function rateLimit(
  identifier: string,
  limit: number = RATE_LIMIT_DEFAULT,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
): RateLimitResult {
  ensureCleanupRunning();

  const now = Date.now();
  const entry = store.get(identifier);

  // First request or window expired -- start a new window.
  if (!entry || now >= entry.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      remaining: limit - 1,
      resetIn: windowMs,
    };
  }

  // Within an existing window.
  entry.count += 1;

  const resetIn = Math.max(0, entry.resetTime - now);

  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetIn,
    };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    resetIn,
  };
}

/**
 * Reset the rate-limit store. Useful in tests.
 */
export function resetRateLimitStore(): void {
  store.clear();
  if (cleanupInterval !== null) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
