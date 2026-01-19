/**
 * Test Setup File
 * 
 * This runs BEFORE each test file. Use it for:
 * - Extending expect with custom matchers
 * - Setting up global mocks
 * - Cleaning up between tests
 * - Configuring testing-library
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// =============================================================================
// Cleanup
// =============================================================================

// Cleanup after each test to prevent test pollution
afterEach(() => {
  cleanup()
})

// =============================================================================
// Global Mocks
// =============================================================================

// Mock window.matchMedia (required for many UI libraries)
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// Mock IntersectionObserver (for lazy loading, infinite scroll, etc.)
beforeAll(() => {
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.IntersectionObserver = mockIntersectionObserver
})

// Mock ResizeObserver
beforeAll(() => {
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

// Mock scrollTo (used by routers and UI libraries)
beforeAll(() => {
  window.scrollTo = vi.fn()
})

// =============================================================================
// Environment Variables (test values)
// =============================================================================

// Set test environment variables
vi.stubEnv('VITE_API_URL', 'http://localhost:3001/api')
vi.stubEnv('VITE_ENV', 'test')

// =============================================================================
// Suppress Specific Console Errors (use sparingly!)
// =============================================================================

// Example: Suppress specific known warnings
// const originalError = console.error
// beforeAll(() => {
//   console.error = (...args) => {
//     if (args[0]?.includes('Warning: ReactDOM.render is no longer supported')) {
//       return
//     }
//     originalError.call(console, ...args)
//   }
// })

// =============================================================================
// Custom Matchers (extend expect)
// =============================================================================

// You can add custom matchers here
// Example:
// expect.extend({
//   toBeWithinRange(received, floor, ceiling) {
//     const pass = received >= floor && received <= ceiling
//     if (pass) {
//       return {
//         message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
//         pass: true,
//       }
//     } else {
//       return {
//         message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
//         pass: false,
//       }
//     }
//   },
// })
