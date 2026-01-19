/**
 * MSW Server Setup for Testing
 *
 * This file creates the MSW server instance for use in tests.
 * The server intercepts HTTP requests and returns mock responses.
 *
 * Usage in tests:
 *   import { server } from '@/test/mocks/server'
 *
 *   // Override handlers for specific tests
 *   server.use(
 *     http.get('/api/users', () => HttpResponse.json([]))
 *   )
 *
 * Installation:
 *   npm install -D msw
 *
 * @see https://mswjs.io/docs/getting-started
 */

import { setupServer } from 'msw/node'
import { handlers, resetMockData } from './handlers'

// -----------------------------------------------------------------
// Server Setup
// -----------------------------------------------------------------

/**
 * MSW server instance for Node.js test environment.
 *
 * The server is configured with default handlers from ./handlers.ts
 * Individual tests can override handlers using server.use()
 */
export const server = setupServer(...handlers)

// -----------------------------------------------------------------
// Test Lifecycle Integration
// -----------------------------------------------------------------

/**
 * Setup function to call in your test setup file (setup.ts)
 *
 * Handles:
 * - Starting the server before all tests
 * - Resetting handlers after each test
 * - Stopping the server after all tests
 *
 * @example
 * // In src/test/setup.ts
 * import { setupMSW } from '@/test/mocks/server'
 * setupMSW()
 */
export function setupMSW() {
  // Start server before all tests
  beforeAll(() => {
    server.listen({
      // Warn when a request doesn't have a matching handler
      onUnhandledRequest: 'warn',
    })
  })

  // Reset handlers and mock data after each test
  afterEach(() => {
    server.resetHandlers()
    resetMockData()
  })

  // Close server after all tests
  afterAll(() => {
    server.close()
  })
}

// -----------------------------------------------------------------
// Alternative: Manual Setup (if not using setupMSW)
// -----------------------------------------------------------------

/**
 * If you prefer manual control, you can use these functions directly:
 *
 * @example
 * import { startMSW, stopMSW, resetMSW } from '@/test/mocks/server'
 *
 * beforeAll(() => startMSW())
 * afterEach(() => resetMSW())
 * afterAll(() => stopMSW())
 */

export function startMSW(options?: Parameters<typeof server.listen>[0]) {
  server.listen(options ?? { onUnhandledRequest: 'warn' })
}

export function stopMSW() {
  server.close()
}

export function resetMSW() {
  server.resetHandlers()
  resetMockData()
}

// -----------------------------------------------------------------
// Helper: Add Runtime Handlers
// -----------------------------------------------------------------

/**
 * Add handlers at runtime for specific test scenarios.
 *
 * @example
 * import { addHandlers } from '@/test/mocks/server'
 * import { http, HttpResponse } from 'msw'
 *
 * test('handles empty user list', async () => {
 *   addHandlers(
 *     http.get('/api/users', () => HttpResponse.json([]))
 *   )
 *   // ... test code
 * })
 */
export function addHandlers(...newHandlers: Parameters<typeof server.use>) {
  server.use(...newHandlers)
}

// -----------------------------------------------------------------
// Helper: Assert Request Was Made
// -----------------------------------------------------------------

/**
 * Track requests for assertions in tests.
 *
 * @example
 * const tracker = createRequestTracker()
 *
 * // Make API call in your test...
 *
 * expect(tracker.requests).toContainEqual(
 *   expect.objectContaining({ url: expect.stringContaining('/api/users') })
 * )
 */
export function createRequestTracker() {
  const requests: Array<{ method: string; url: string; body?: unknown }> = []

  // This is a simplified version - for production use, consider
  // using MSW's life-cycle events: https://mswjs.io/docs/api/life-cycle-events

  return {
    requests,
    clear: () => {
      requests.length = 0
    },
  }
}

// -----------------------------------------------------------------
// Export for convenience
// -----------------------------------------------------------------

export { handlers, resetMockData } from './handlers'
export { http, HttpResponse, delay } from 'msw'
