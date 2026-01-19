/**
 * Test utilities for Next.js projects
 *
 * Provides:
 * - Custom render function with providers
 * - Common test helpers
 * - Mock data factories
 */

import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// -----------------------------------------------------------------
// Custom Render with Providers
// -----------------------------------------------------------------

/**
 * Wrapper component that includes all providers your app needs.
 * Add your context providers here (auth, theme, etc.)
 */
interface ProvidersProps {
  children: ReactNode
}

function AllProviders({ children }: ProvidersProps) {
  return (
    <>
      {/* Add your providers here, e.g.:
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
      */}
      {children}
    </>
  )
}

/**
 * Custom render function that wraps components with all necessary providers.
 * Use this instead of RTL's render() in your tests.
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render with custom render
export { customRender as render }

// -----------------------------------------------------------------
// User Event Setup
// -----------------------------------------------------------------

/**
 * Sets up userEvent with default options.
 * Returns both the user instance and rendered component.
 *
 * @example
 * const { user, ...screen } = renderWithUser(<Button onClick={handleClick} />)
 * await user.click(screen.getByRole('button'))
 */
export function renderWithUser(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...customRender(ui, options),
  }
}

// -----------------------------------------------------------------
// Mock Factories
// -----------------------------------------------------------------

/**
 * Creates a mock user object.
 * Override any properties as needed.
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar_url: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export interface MockUser {
  id: string
  email: string
  name: string
  avatar_url: string | null
  created_at: string
}

/**
 * Creates a mock Supabase session.
 */
export function createMockSession(user: MockUser = createMockUser()) {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      user_metadata: { name: user.name, avatar_url: user.avatar_url },
      app_metadata: {},
      aud: 'authenticated',
      created_at: user.created_at,
    },
  }
}

// -----------------------------------------------------------------
// API Route Testing Helpers
// -----------------------------------------------------------------

/**
 * Creates a mock Request object for testing API routes.
 *
 * @example
 * const request = createMockRequest('POST', '/api/users', { name: 'John' })
 * const response = await POST(request)
 */
export function createMockRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>
): Request {
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body)
  }

  return new Request(`http://localhost:3000${url}`, requestInit)
}

/**
 * Creates mock NextRequest params for dynamic routes.
 *
 * @example
 * const { params } = createMockParams({ id: '123' })
 * const response = await GET(request, { params })
 */
export function createMockParams<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) }
}

// -----------------------------------------------------------------
// Async Test Helpers
// -----------------------------------------------------------------

/**
 * Waits for a condition to be true, with timeout.
 * Useful for testing async state changes.
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`)
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}

/**
 * Creates a deferred promise for testing async flows.
 */
export function createDeferred<T>() {
  let resolve: (value: T) => void
  let reject: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve: resolve!, reject: reject! }
}

// -----------------------------------------------------------------
// Mock Function Helpers
// -----------------------------------------------------------------

/**
 * Creates a mock function that resolves with the given value.
 */
export function mockResolvedValue<T>(value: T) {
  return vi.fn().mockResolvedValue(value)
}

/**
 * Creates a mock function that rejects with the given error.
 */
export function mockRejectedValue(error: Error | string) {
  return vi.fn().mockRejectedValue(
    typeof error === 'string' ? new Error(error) : error
  )
}

/**
 * Creates a mock function that resolves with different values on each call.
 */
export function mockResolvedValueSequence<T>(values: T[]) {
  const fn = vi.fn()
  values.forEach((value, index) => {
    fn.mockResolvedValueOnce(value)
  })
  return fn
}
