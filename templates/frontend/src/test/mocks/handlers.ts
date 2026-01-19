/**
 * Mock Service Worker (MSW) Request Handlers
 *
 * MSW intercepts actual network requests at the service worker level,
 * providing realistic API mocking without changing your application code.
 *
 * Benefits over manual mocking:
 * - Tests use real fetch/axios calls
 * - No need to mock HTTP clients
 * - Same handlers work in browser dev mode
 * - More realistic integration tests
 *
 * Installation:
 *   npm install -D msw
 *
 * @see https://mswjs.io/docs/
 */

import { http, HttpResponse, delay } from 'msw'

// -----------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------

// Base URL for your API (adjust to match your app)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Supabase URL (for mocking Supabase REST API)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'

// -----------------------------------------------------------------
// Mock Data
// -----------------------------------------------------------------

export const mockUsers = [
  { id: '1', email: 'user1@example.com', name: 'Alice Smith', role: 'admin' },
  { id: '2', email: 'user2@example.com', name: 'Bob Johnson', role: 'user' },
  { id: '3', email: 'user3@example.com', name: 'Carol White', role: 'user' },
]

export const mockPosts = [
  { id: '1', title: 'First Post', content: 'Hello world!', author_id: '1', published: true },
  { id: '2', title: 'Second Post', content: 'More content', author_id: '2', published: true },
  { id: '3', title: 'Draft Post', content: 'Work in progress', author_id: '1', published: false },
]

// Mutable state for testing CRUD operations
let users = [...mockUsers]
let posts = [...mockPosts]

// Helper to reset mock data between tests
export function resetMockData() {
  users = [...mockUsers]
  posts = [...mockPosts]
}

// -----------------------------------------------------------------
// Custom API Handlers
// -----------------------------------------------------------------

export const apiHandlers = [
  // GET /api/users - List all users
  http.get(`${API_BASE_URL}/users`, async () => {
    await delay(100) // Simulate network latency
    return HttpResponse.json(users)
  }),

  // GET /api/users/:id - Get user by ID
  http.get(`${API_BASE_URL}/users/:id`, async ({ params }) => {
    const user = users.find(u => u.id === params.id)

    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(user)
  }),

  // POST /api/users - Create user
  http.post(`${API_BASE_URL}/users`, async ({ request }) => {
    const body = await request.json() as { email: string; name: string }

    // Validate required fields
    if (!body.email || !body.name) {
      return HttpResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    if (users.some(u => u.email === body.email)) {
      return HttpResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    const newUser = {
      id: String(users.length + 1),
      email: body.email,
      name: body.name,
      role: 'user',
    }
    users.push(newUser)

    return HttpResponse.json(newUser, { status: 201 })
  }),

  // PUT /api/users/:id - Update user
  http.put(`${API_BASE_URL}/users/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<typeof users[0]>
    const index = users.findIndex(u => u.id === params.id)

    if (index === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    users[index] = { ...users[index], ...body }
    return HttpResponse.json(users[index])
  }),

  // DELETE /api/users/:id - Delete user
  http.delete(`${API_BASE_URL}/users/:id`, async ({ params }) => {
    const index = users.findIndex(u => u.id === params.id)

    if (index === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const [deleted] = users.splice(index, 1)
    return HttpResponse.json(deleted)
  }),

  // GET /api/posts - List posts with optional filtering
  http.get(`${API_BASE_URL}/posts`, async ({ request }) => {
    const url = new URL(request.url)
    const published = url.searchParams.get('published')
    const authorId = url.searchParams.get('author_id')

    let result = [...posts]

    if (published !== null) {
      result = result.filter(p => p.published === (published === 'true'))
    }

    if (authorId) {
      result = result.filter(p => p.author_id === authorId)
    }

    return HttpResponse.json(result)
  }),
]

// -----------------------------------------------------------------
// Supabase REST API Handlers
// -----------------------------------------------------------------

export const supabaseHandlers = [
  // Mock Supabase REST API: GET /rest/v1/users
  http.get(`${SUPABASE_URL}/rest/v1/users`, async ({ request }) => {
    const url = new URL(request.url)
    const select = url.searchParams.get('select') || '*'

    // Simple select support (doesn't handle all Supabase features)
    let result = users

    // Handle ID filter (id=eq.xxx)
    const idFilter = url.searchParams.get('id')
    if (idFilter?.startsWith('eq.')) {
      const id = idFilter.replace('eq.', '')
      result = result.filter(u => u.id === id)
    }

    return HttpResponse.json(result)
  }),

  // Mock Supabase REST API: POST /rest/v1/users
  http.post(`${SUPABASE_URL}/rest/v1/users`, async ({ request }) => {
    const body = await request.json() as typeof users[0]

    const newUser = {
      id: String(users.length + 1),
      ...body,
    }
    users.push(newUser)

    return HttpResponse.json([newUser], { status: 201 })
  }),

  // Mock Supabase Auth: POST /auth/v1/token
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const url = new URL(request.url)
    const grantType = url.searchParams.get('grant_type')

    if (grantType === 'password') {
      const body = await request.json() as { email: string; password: string }

      // Simulate authentication
      if (body.email === 'test@example.com' && body.password === 'password123') {
        return HttpResponse.json({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'mock-user-id',
            email: body.email,
            aud: 'authenticated',
          },
        })
      }

      return HttpResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid login credentials' },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      { error: 'unsupported_grant_type' },
      { status: 400 }
    )
  }),

  // Mock Supabase Auth: GET /auth/v1/user
  http.get(`${SUPABASE_URL}/auth/v1/user`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Return mock user for any valid-looking token
    return HttpResponse.json({
      id: 'mock-user-id',
      email: 'test@example.com',
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    })
  }),

  // Mock Supabase Auth: POST /auth/v1/logout
  http.post(`${SUPABASE_URL}/auth/v1/logout`, async () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

// -----------------------------------------------------------------
// Error Simulation Handlers
// -----------------------------------------------------------------

export const errorHandlers = [
  // Simulate server error
  http.get(`${API_BASE_URL}/error/500`, async () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }),

  // Simulate timeout
  http.get(`${API_BASE_URL}/error/timeout`, async () => {
    await delay(60000) // 60 second delay (will likely timeout)
    return HttpResponse.json({ message: 'This should timeout' })
  }),

  // Simulate network error
  http.get(`${API_BASE_URL}/error/network`, async () => {
    return HttpResponse.error()
  }),

  // Simulate rate limiting
  http.get(`${API_BASE_URL}/error/rate-limit`, async () => {
    return HttpResponse.json(
      { error: 'Too Many Requests' },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      }
    )
  }),
]

// -----------------------------------------------------------------
// Export All Handlers
// -----------------------------------------------------------------

export const handlers = [
  ...apiHandlers,
  ...supabaseHandlers,
  ...errorHandlers,
]

// -----------------------------------------------------------------
// Helper Functions for Tests
// -----------------------------------------------------------------

/**
 * Create a one-time handler that overrides existing handlers.
 * Useful for testing specific scenarios in individual tests.
 *
 * @example
 * server.use(
 *   overrideHandler('get', '/api/users', { status: 500, body: { error: 'DB down' } })
 * )
 */
export function overrideHandler(
  method: 'get' | 'post' | 'put' | 'delete',
  path: string,
  response: { status?: number; body?: unknown; delay?: number }
) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`

  return http[method](url, async () => {
    if (response.delay) {
      await delay(response.delay)
    }
    return HttpResponse.json(response.body, { status: response.status || 200 })
  })
}
