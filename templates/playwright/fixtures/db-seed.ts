/**
 * Database Seeding for E2E Tests
 *
 * This module provides utilities to set up and tear down test data
 * in Supabase before running E2E tests.
 *
 * Usage:
 *   import { seedDatabase, cleanupDatabase, testUsers } from './fixtures/db-seed'
 *
 *   test.beforeAll(async () => {
 *     await seedDatabase()
 *   })
 *
 *   test.afterAll(async () => {
 *     await cleanupDatabase()
 *   })
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// -----------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------

// Use service role key for full database access during testing
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-role-key'

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// -----------------------------------------------------------------
// Test Data
// -----------------------------------------------------------------

export const testUsers = {
  admin: {
    id: 'e2e-admin-user-id',
    email: 'admin@e2e-test.local',
    password: 'e2e-admin-password-123!',
    name: 'E2E Admin User',
    role: 'admin',
  },
  regular: {
    id: 'e2e-regular-user-id',
    email: 'user@e2e-test.local',
    password: 'e2e-user-password-123!',
    name: 'E2E Regular User',
    role: 'user',
  },
}

export const testPosts = [
  {
    id: 'e2e-post-1',
    title: 'E2E Test Post 1',
    content: 'This is test content for E2E testing.',
    author_id: testUsers.regular.id,
    published: true,
  },
  {
    id: 'e2e-post-2',
    title: 'E2E Test Post 2 (Draft)',
    content: 'This is a draft post.',
    author_id: testUsers.regular.id,
    published: false,
  },
]

// -----------------------------------------------------------------
// Seed Functions
// -----------------------------------------------------------------

/**
 * Seeds the database with test data.
 * Call this in test.beforeAll()
 */
export async function seedDatabase(): Promise<void> {
  console.log('Seeding E2E test database...')

  try {
    // Clean up any existing test data first
    await cleanupDatabase()

    // Create test users in auth.users
    // Note: This requires admin API access
    for (const user of Object.values(testUsers)) {
      const { error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      })

      if (authError && !authError.message.includes('already registered')) {
        console.error(`Failed to create user ${user.email}:`, authError)
      }
    }

    // Insert test profiles (if you have a profiles table)
    const profiles = Object.values(testUsers).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }))

    const { error: profilesError } = await supabase
      .from('profiles')
      .upsert(profiles, { onConflict: 'id' })

    if (profilesError) {
      console.error('Failed to seed profiles:', profilesError)
    }

    // Insert test posts
    const { error: postsError } = await supabase
      .from('posts')
      .upsert(testPosts, { onConflict: 'id' })

    if (postsError) {
      console.error('Failed to seed posts:', postsError)
    }

    console.log('E2E test database seeded successfully.')
  } catch (error) {
    console.error('Database seeding failed:', error)
    throw error
  }
}

/**
 * Cleans up test data from the database.
 * Call this in test.afterAll()
 */
export async function cleanupDatabase(): Promise<void> {
  console.log('Cleaning up E2E test database...')

  try {
    // Delete test posts
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .like('id', 'e2e-%')

    if (postsError) {
      console.error('Failed to cleanup posts:', postsError)
    }

    // Delete test profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .like('id', 'e2e-%')

    if (profilesError) {
      console.error('Failed to cleanup profiles:', profilesError)
    }

    // Delete test users from auth
    for (const user of Object.values(testUsers)) {
      // Get user by email first
      const { data: userData } = await supabase.auth.admin.listUsers()
      const authUser = userData?.users.find(u => u.email === user.email)

      if (authUser) {
        await supabase.auth.admin.deleteUser(authUser.id)
      }
    }

    console.log('E2E test database cleaned up successfully.')
  } catch (error) {
    console.error('Database cleanup failed:', error)
    // Don't throw - cleanup failures shouldn't fail tests
  }
}

// -----------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------

/**
 * Creates a Supabase session for a test user.
 * Returns the session tokens for use in authenticated tests.
 */
export async function createTestSession(user: typeof testUsers.admin): Promise<{
  accessToken: string
  refreshToken: string
}> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  })

  if (error || !data.session) {
    throw new Error(`Failed to create session for ${user.email}: ${error?.message}`)
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  }
}

/**
 * Resets a specific table to a known state.
 * Useful for resetting data between tests.
 */
export async function resetTable(
  tableName: string,
  data: Record<string, unknown>[]
): Promise<void> {
  // Delete existing test data
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .like('id', 'e2e-%')

  if (deleteError) {
    throw new Error(`Failed to delete from ${tableName}: ${deleteError.message}`)
  }

  // Insert fresh data
  if (data.length > 0) {
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(data)

    if (insertError) {
      throw new Error(`Failed to insert into ${tableName}: ${insertError.message}`)
    }
  }
}

// -----------------------------------------------------------------
// Playwright Global Setup/Teardown (optional)
// -----------------------------------------------------------------

/**
 * Use this in playwright.config.ts as globalSetup/globalTeardown:
 *
 * export default defineConfig({
 *   globalSetup: './fixtures/db-seed.ts',
 *   globalTeardown: './fixtures/db-seed.ts',
 * })
 */

// When run as a module (global setup)
async function globalSetup() {
  await seedDatabase()
}

// When run as global teardown
async function globalTeardown() {
  await cleanupDatabase()
}

// Export for use as global setup/teardown
export { globalSetup, globalTeardown }
export default globalSetup
