import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Testing Configuration
 *
 * Run all tests:   npx playwright test
 * Run specific:    npx playwright test landing.spec.ts
 * UI mode:         npx playwright test --ui
 * Debug mode:      npx playwright test --debug
 * Generate tests:  npx playwright codegen localhost:3000
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Test file patterns
  testMatch: '**/*.spec.ts',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation (e.g., await page.goto('/'))
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'on-first-retry',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors during development
    ignoreHTTPSErrors: true,

    // Additional HTTP headers
    extraHTTPHeaders: {
      // Accept JSON responses from API
      'Accept': 'application/json',
    },
  },

  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Branded browsers (optional - uncomment if needed)
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // Local development server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for dev server to start
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Global timeout for each test
  timeout: 30 * 1000, // 30 seconds

  // Timeout for each assertion
  expect: {
    timeout: 5 * 1000, // 5 seconds
  },

  // Output directory for test artifacts
  outputDir: 'test-results/',

  // Preserve output for failed tests
  preserveOutput: 'failures-only',
})
