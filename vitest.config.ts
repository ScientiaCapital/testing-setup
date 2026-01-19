/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Environment setup
    environment: 'jsdom',  // Simulates browser for React testing
    
    // Global setup - makes test utilities available without imports
    globals: true,
    
    // Setup files run before each test file
    setupFiles: ['./src/test/setup.ts'],
    
    // Test file patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      // Fail CI if coverage drops below thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    
    // Helpful for debugging
    reporters: ['verbose'],
    
    // Watch mode configuration
    watch: false,  // Set to true for development
    
    // Performance
    pool: 'threads',  // Faster than forks for most cases
    maxConcurrency: 10,
    
    // Timeouts (in ms)
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Retry flaky tests (use sparingly - fix flaky tests instead!)
    retry: 0,
  },
  
  // Path aliases (must match tsconfig.json)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
})
