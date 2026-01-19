import { test, expect } from '@playwright/test'

/**
 * Example E2E Tests
 *
 * These tests demonstrate common patterns:
 * - Navigation and page structure
 * - Form interactions
 * - Authentication flows
 * - API interactions
 * - Responsive design testing
 */

// -----------------------------------------------------------------
// Basic Navigation Tests
// -----------------------------------------------------------------

test.describe('Homepage', () => {
  test('loads successfully with correct title', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/Your App Name/)

    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('has working navigation links', async ({ page }) => {
    await page.goto('/')

    // Find and click navigation link
    await page.getByRole('link', { name: 'About' }).click()

    // Verify navigation occurred
    await expect(page).toHaveURL(/\/about/)
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible()
  })

  test('displays correct content sections', async ({ page }) => {
    await page.goto('/')

    // Check for expected sections
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible() // footer
  })
})

// -----------------------------------------------------------------
// Form Interaction Tests
// -----------------------------------------------------------------

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('submits form successfully', async ({ page }) => {
    // Fill in form fields
    await page.getByLabel('Name').fill('John Doe')
    await page.getByLabel('Email').fill('john@example.com')
    await page.getByLabel('Message').fill('This is a test message.')

    // Submit the form
    await page.getByRole('button', { name: 'Send' }).click()

    // Check for success message
    await expect(page.getByText(/message sent successfully/i)).toBeVisible()
  })

  test('shows validation errors for empty fields', async ({ page }) => {
    // Try to submit without filling in fields
    await page.getByRole('button', { name: 'Send' }).click()

    // Check for validation messages
    await expect(page.getByText(/name is required/i)).toBeVisible()
  })

  test('validates email format', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Email').blur()

    await expect(page.getByText(/valid email/i)).toBeVisible()
  })
})

// -----------------------------------------------------------------
// Authentication Tests
// -----------------------------------------------------------------

test.describe('Authentication', () => {
  test('shows login page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in credentials
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('testpassword123')

    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('logs out successfully', async ({ page }) => {
    // First, log in (or set up authenticated state)
    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Log out
    await page.getByRole('button', { name: /logout|sign out/i }).click()

    // Should be back at login
    await expect(page).toHaveURL(/\/login|\//)
  })
})

// -----------------------------------------------------------------
// API Interaction Tests
// -----------------------------------------------------------------

test.describe('API Interactions', () => {
  test('displays data from API', async ({ page }) => {
    await page.goto('/users')

    // Wait for data to load
    await expect(page.getByRole('list')).toBeVisible()

    // Check that items are displayed
    const items = page.getByRole('listitem')
    await expect(items).toHaveCount(10) // Assuming API returns 10 items
  })

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/users', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    )

    await page.goto('/users')

    // Check for error message
    await expect(page.getByText(/something went wrong/i)).toBeVisible()
  })

  test('submits data to API', async ({ page }) => {
    // Intercept the API call
    const responsePromise = page.waitForResponse('/api/users')

    await page.goto('/users/new')
    await page.getByLabel('Name').fill('New User')
    await page.getByLabel('Email').fill('newuser@example.com')
    await page.getByRole('button', { name: 'Create' }).click()

    // Verify API was called
    const response = await responsePromise
    expect(response.status()).toBe(201)
  })
})

// -----------------------------------------------------------------
// Responsive Design Tests
// -----------------------------------------------------------------

test.describe('Responsive Design', () => {
  test('mobile menu works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Desktop navigation should be hidden
    await expect(page.getByRole('navigation').getByRole('link', { name: 'About' })).toBeHidden()

    // Mobile menu button should be visible
    const menuButton = page.getByRole('button', { name: /menu/i })
    await expect(menuButton).toBeVisible()

    // Open mobile menu
    await menuButton.click()

    // Navigation links should now be visible
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
  })

  test('content adapts to viewport size', async ({ page }) => {
    await page.goto('/')

    // Desktop: sidebar visible
    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(page.getByTestId('sidebar')).toBeVisible()

    // Mobile: sidebar hidden
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByTestId('sidebar')).toBeHidden()
  })
})

// -----------------------------------------------------------------
// Visual Regression Tests (optional)
// -----------------------------------------------------------------

test.describe('Visual Regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/')

    // Wait for all content to load
    await page.waitForLoadState('networkidle')

    // Take full page screenshot and compare
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      // Allow small differences for font rendering
      maxDiffPixelRatio: 0.01,
    })
  })
})

// -----------------------------------------------------------------
// Performance Tests
// -----------------------------------------------------------------

test.describe('Performance', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Page should load within 3 seconds
  })
})

// -----------------------------------------------------------------
// Accessibility Tests
// -----------------------------------------------------------------

test.describe('Accessibility', () => {
  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/')

    // This requires @axe-core/playwright to be installed
    // npm install -D @axe-core/playwright
    //
    // import AxeBuilder from '@axe-core/playwright'
    // const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    // expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Check that focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
