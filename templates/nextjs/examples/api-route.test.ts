/**
 * Example: Testing Next.js API Routes (App Router)
 *
 * This demonstrates how to test:
 * - GET, POST, PUT, DELETE handlers
 * - Request parsing (body, params, searchParams)
 * - Response handling
 * - Error cases
 * - Authentication/authorization
 * - Database interactions (mocked)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockRequest, createMockParams } from '../src/test/utils'

// -----------------------------------------------------------------
// Example API Route Implementation (would be in app/api/users/route.ts)
// -----------------------------------------------------------------

// This is what your actual route handler might look like:
/*
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: users, error } = await supabase.from('users').select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = createClient()

  const { data, error } = await supabase.from('users').insert(body).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}
*/

// -----------------------------------------------------------------
// Mock the route handlers for testing
// -----------------------------------------------------------------

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}))

// Simulated route handlers for demonstration
async function GET(_request: Request) {
  const selectMock = mockSupabase.from('users')
  const { data, error } = await selectMock.select('*')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

async function POST(request: Request) {
  const body = await request.json()

  if (!body.email) {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  const insertMock = mockSupabase.from('users')
  const { data, error } = await insertMock.insert(body).select().single()

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json(data, { status: 201 })
}

// -----------------------------------------------------------------
// Tests
// -----------------------------------------------------------------

describe('Users API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('returns list of users on success', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', name: 'User 1' },
        { id: '2', email: 'user2@example.com', name: 'User 2' },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
      })

      const request = createMockRequest('GET', '/api/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockUsers)
      expect(mockSupabase.from).toHaveBeenCalledWith('users')
    })

    it('returns 500 on database error', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        }),
      })

      const request = createMockRequest('GET', '/api/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database connection failed')
    })
  })

  describe('POST /api/users', () => {
    it('creates a new user and returns 201', async () => {
      const newUser = { email: 'new@example.com', name: 'New User' }
      const createdUser = { id: '3', ...newUser }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: createdUser, error: null }),
          }),
        }),
      })

      const request = createMockRequest('POST', '/api/users', newUser)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(createdUser)
    })

    it('returns 400 when email is missing', async () => {
      const invalidUser = { name: 'No Email User' }

      const request = createMockRequest('POST', '/api/users', invalidUser)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email is required')
    })

    it('returns 400 on database constraint violation', async () => {
      const duplicateUser = { email: 'existing@example.com', name: 'Duplicate' }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'duplicate key value violates unique constraint' }
            }),
          }),
        }),
      })

      const request = createMockRequest('POST', '/api/users', duplicateUser)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('duplicate key')
    })
  })
})

// -----------------------------------------------------------------
// Dynamic Route Example: /api/users/[id]
// -----------------------------------------------------------------

describe('User by ID API Route', () => {
  // Simulated handler for /api/users/[id]
  async function GET_BY_ID(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params

    const userMock = mockSupabase.from('users')
    const { data, error } = await userMock.select('*').eq('id', id).single()

    if (error) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json(data)
  }

  it('returns user by ID', async () => {
    const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' }

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
        }),
      }),
    })

    const request = createMockRequest('GET', '/api/users/123')
    const { params } = createMockParams({ id: '123' })
    const response = await GET_BY_ID(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockUser)
  })

  it('returns 404 when user not found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'No rows returned' }
          }),
        }),
      }),
    })

    const request = createMockRequest('GET', '/api/users/nonexistent')
    const { params } = createMockParams({ id: 'nonexistent' })
    const response = await GET_BY_ID(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })
})
