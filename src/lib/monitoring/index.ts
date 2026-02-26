// ─────────────────────────────────────────────────────────────────────────────
// Core Monitoring Module — In-Memory Observability for GovAI Studio
// ─────────────────────────────────────────────────────────────────────────────
//
// Provides request logging, error tracking, and performance metrics without
// any external dependencies. All data is held in memory using ring buffers
// and sliding windows. Safe for Node.js single-thread concurrency model.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RequestLogEntry {
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  user_id: string | null;
  timestamp: string;
}

export interface TrackedError {
  id: string;
  route: string;
  method: string;
  user_id: string | null;
  message: string;
  stack: string | null;
  timestamp: string;
}

export interface RoutePerformanceMetrics {
  route: string;
  request_count: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  avg_ms: number;
  min_ms: number;
  max_ms: number;
}

export interface MonitoringMetricsSnapshot {
  uptime_seconds: number;
  total_requests: number;
  error_count: number;
  recent_errors: TrackedError[];
  performance: {
    routes: RoutePerformanceMetrics[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ring Buffer — Fixed-size circular buffer for in-memory storage
// ─────────────────────────────────────────────────────────────────────────────

class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private writeIndex: number = 0;
  private count: number = 0;
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array<T | undefined>(capacity);
  }

  push(item: T): void {
    this.buffer[this.writeIndex] = item;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
  }

  getAll(): T[] {
    if (this.count === 0) return [];

    const result: T[] = [];
    // Start from the oldest entry
    const startIndex = this.count < this.capacity
      ? 0
      : this.writeIndex;

    for (let i = 0; i < this.count; i++) {
      const index = (startIndex + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }

  size(): number {
    return this.count;
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this.capacity);
    this.writeIndex = 0;
    this.count = 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Logger
// ─────────────────────────────────────────────────────────────────────────────

const REQUEST_BUFFER_SIZE = 1000;
const requestBuffer = new RingBuffer<RequestLogEntry>(REQUEST_BUFFER_SIZE);
let totalRequests = 0;

export function logRequest(entry: RequestLogEntry): void {
  requestBuffer.push(entry);
  totalRequests++;
}

export function getRecentRequests(): RequestLogEntry[] {
  return requestBuffer.getAll();
}

export function getTotalRequests(): number {
  return totalRequests;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Tracker
// ─────────────────────────────────────────────────────────────────────────────

const ERROR_BUFFER_SIZE = 100;
const errorBuffer = new RingBuffer<TrackedError>(ERROR_BUFFER_SIZE);
let totalErrors = 0;

export function trackError(
  error: unknown,
  context: { route: string; method: string; user_id: string | null },
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? (error.stack ?? null) : null;

  const tracked: TrackedError = {
    id: crypto.randomUUID(),
    route: context.route,
    method: context.method,
    user_id: context.user_id,
    message,
    stack,
    timestamp: new Date().toISOString(),
  };

  errorBuffer.push(tracked);
  totalErrors++;
}

export function getRecentErrors(): TrackedError[] {
  // Return newest first
  return errorBuffer.getAll().reverse();
}

export function getTotalErrors(): number {
  return totalErrors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Tracker
// ─────────────────────────────────────────────────────────────────────────────

// Per-route sliding window of response durations (ms)
const PERF_WINDOW_SIZE = 1000;
const routeDurations = new Map<string, RingBuffer<number>>();
const routeRequestCounts = new Map<string, number>();

export function trackPerformance(route: string, durationMs: number): void {
  if (!routeDurations.has(route)) {
    routeDurations.set(route, new RingBuffer<number>(PERF_WINDOW_SIZE));
    routeRequestCounts.set(route, 0);
  }

  routeDurations.get(route)!.push(durationMs);
  routeRequestCounts.set(route, (routeRequestCounts.get(route) ?? 0) + 1);
}

function calculatePercentile(sorted: number[], percentile: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

export function getRouteMetrics(route: string): RoutePerformanceMetrics | null {
  const buffer = routeDurations.get(route);
  if (!buffer || buffer.size() === 0) return null;

  const durations = buffer.getAll().slice().sort((a, b) => a - b);
  const count = routeRequestCounts.get(route) ?? durations.length;
  const sum = durations.reduce((acc, d) => acc + d, 0);

  return {
    route,
    request_count: count,
    p50_ms: Math.round(calculatePercentile(durations, 50) * 100) / 100,
    p95_ms: Math.round(calculatePercentile(durations, 95) * 100) / 100,
    p99_ms: Math.round(calculatePercentile(durations, 99) * 100) / 100,
    avg_ms: Math.round((sum / durations.length) * 100) / 100,
    min_ms: Math.round(durations[0] * 100) / 100,
    max_ms: Math.round(durations[durations.length - 1] * 100) / 100,
  };
}

export function getPerformanceMetrics(): RoutePerformanceMetrics[] {
  const routes: RoutePerformanceMetrics[] = [];
  for (const route of routeDurations.keys()) {
    const metrics = getRouteMetrics(route);
    if (metrics) {
      routes.push(metrics);
    }
  }
  // Sort by request count descending
  return routes.sort((a, b) => b.request_count - a.request_count);
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregated Snapshot
// ─────────────────────────────────────────────────────────────────────────────

const startTime = Date.now();

export function getMonitoringSnapshot(): MonitoringMetricsSnapshot {
  return {
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    total_requests: totalRequests,
    error_count: totalErrors,
    recent_errors: getRecentErrors(),
    performance: {
      routes: getPerformanceMetrics(),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset (useful for testing)
// ─────────────────────────────────────────────────────────────────────────────

export function resetMonitoring(): void {
  requestBuffer.clear();
  errorBuffer.clear();
  routeDurations.clear();
  routeRequestCounts.clear();
  totalRequests = 0;
  totalErrors = 0;
}
