/**
 * Test Utilities — Bun
 *
 * Common helpers for Bun tests. Import these in your test files:
 *
 *   import { createMockFetch, waitFor, createDeferred } from "./utils";
 */

import { mock } from "bun:test";

// =============================================================================
// Fetch Mocking
// =============================================================================

/**
 * Create a mock fetch that returns predefined responses.
 *
 * Usage:
 *   const { restore } = createMockFetch({
 *     "https://api.example.com/users": { data: [{ id: 1, name: "Alice" }] },
 *     "https://api.example.com/health": { status: "ok" },
 *   });
 *
 *   const res = await fetch("https://api.example.com/users");
 *   const data = await res.json();
 *   // data === { data: [{ id: 1, name: "Alice" }] }
 *
 *   restore(); // Restore original fetch
 */
export function createMockFetch(
  responses: Record<string, unknown>,
  defaultStatus = 200
) {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = mock((input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url in responses) {
      return Promise.resolve(
        new Response(JSON.stringify(responses[url]), {
          status: defaultStatus,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    return Promise.resolve(
      new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
    );
  }) as typeof fetch;

  return {
    restore: () => {
      globalThis.fetch = originalFetch;
    },
    mock: globalThis.fetch,
  };
}

// =============================================================================
// Async Helpers
// =============================================================================

/**
 * Wait for a condition to become true.
 *
 * Usage:
 *   await waitFor(() => document.querySelector('.loaded') !== null);
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) return;
    await Bun.sleep(interval);
  }

  throw new Error(`waitFor timed out after ${timeout}ms`);
}

/**
 * Create a deferred promise for testing async behavior.
 *
 * Usage:
 *   const deferred = createDeferred<string>();
 *   someFn(deferred.promise);
 *
 *   // Later...
 *   deferred.resolve("result");
 */
export function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

// =============================================================================
// Mock Data Helpers
// =============================================================================

/**
 * Generate a random ID string.
 */
export function randomId(prefix = "test"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a mock API response object.
 *
 * Usage:
 *   const response = mockApiResponse({ users: [] });
 */
export function mockApiResponse<T>(data: T, status = 200) {
  return {
    data,
    status,
    ok: status >= 200 && status < 300,
  };
}

/**
 * Create a mock API error.
 */
export function mockApiError(message: string, status = 500) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

// =============================================================================
// Timer Helpers
// =============================================================================

/**
 * Sleep for a specified duration.
 * Uses Bun.sleep which is more efficient than setTimeout.
 *
 * Usage:
 *   await sleep(100); // Wait 100ms
 */
export async function sleep(ms: number): Promise<void> {
  await Bun.sleep(ms);
}

/**
 * Measure execution time of an async function.
 *
 * Usage:
 *   const { result, duration } = await measureTime(() => heavyComputation());
 *   expect(duration).toBeLessThan(1000);
 */
export async function measureTime<T>(
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Bun.nanoseconds();
  const result = await fn();
  const duration = (Bun.nanoseconds() - start) / 1_000_000; // Convert to ms
  return { result, duration };
}
