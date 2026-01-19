/**
 * Test Utilities
 * 
 * Custom render function and utilities for testing React components.
 * This wraps components with common providers (Router, State, Theme, etc.)
 * 
 * Usage:
 *   import { render, screen, userEvent } from '@/test/utils'
 *   
 *   test('my test', async () => {
 *     const user = userEvent.setup()
 *     render(<MyComponent />)
 *     await user.click(screen.getByRole('button'))
 *   })
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// =============================================================================
// Custom Providers Wrapper
// =============================================================================

interface WrapperProps {
  children: ReactNode
}

/**
 * Wraps components with all necessary providers for testing.
 * 
 * Add your providers here:
 * - React Router
 * - State management (Zustand, Redux, etc.)
 * - Theme providers
 * - Auth context
 * - Query clients (React Query, SWR)
 */
function AllProviders({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      {/* Add more providers as needed:
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
      */}
      {children}
    </BrowserRouter>
  )
}

// =============================================================================
// Custom Render Function
// =============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here
  initialRoute?: string
}

/**
 * Custom render function that wraps component with providers.
 * 
 * Use this instead of the default render from @testing-library/react
 */
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  const { initialRoute = '/', ...renderOptions } = options || {}
  
  // Set initial route if needed
  window.history.pushState({}, 'Test page', initialRoute)
  
  return render(ui, {
    wrapper: AllProviders,
    ...renderOptions,
  })
}

// Override render export
export { customRender as render }

// =============================================================================
// Common Test Helpers
// =============================================================================

/**
 * Wait for loading states to complete.
 * Useful for async components.
 */
export async function waitForLoadingToComplete() {
  const { waitFor, screen } = await import('@testing-library/react')
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
}

/**
 * Create a deferred promise for testing async behavior.
 * 
 * Usage:
 *   const deferred = createDeferred<string>()
 *   mockApi.getData.mockReturnValue(deferred.promise)
 *   
 *   render(<MyComponent />)
 *   expect(screen.getByText('Loading...')).toBeInTheDocument()
 *   
 *   deferred.resolve('data')
 *   await waitFor(() => expect(screen.getByText('data')).toBeInTheDocument())
 */
export function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  
  return { promise, resolve, reject }
}

/**
 * Generate mock data with realistic values.
 * 
 * Example:
 *   const lead = mockLead({ company_name: 'Custom Name' })
 */
export function mockLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: `lead_${Math.random().toString(36).slice(2)}`,
    company_name: 'Acme HVAC Services',
    contact_name: 'John Smith',
    email: 'john@acmehvac.com',
    phone: '555-123-4567',
    trade: 'hvac',
    status: 'new',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

// Type definitions for test data
interface Lead {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  trade: string
  status: string
  created_at: string
}

// =============================================================================
// Mock API Helpers
// =============================================================================

/**
 * Create a mock API response.
 * 
 * Usage:
 *   vi.mocked(api.getLeads).mockResolvedValue(mockApiResponse({ data: leads }))
 */
export function mockApiResponse<T>(data: T, status = 200) {
  return {
    data,
    status,
    headers: {},
    config: {},
  }
}

/**
 * Create a mock API error.
 */
export function mockApiError(message: string, status = 500) {
  const error = new Error(message)
  ;(error as any).response = {
    status,
    data: { message },
  }
  return error
}
