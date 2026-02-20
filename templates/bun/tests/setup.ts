/**
 * Test Setup File — Bun
 *
 * This runs BEFORE each test file via bunfig.toml [test].preload.
 * Use it for:
 * - Setting up global test state
 * - Configuring DOM environment (happy-dom)
 * - Adding custom matchers
 * - Setting environment variables
 *
 * Unlike Vitest, Bun's test runner doesn't need explicit cleanup
 * for DOM — each test file gets a fresh module scope.
 */

import { beforeAll, afterEach } from "bun:test";

// =============================================================================
// Environment Variables (test values)
// =============================================================================

// Set test environment variables
// Bun.env is the fast equivalent of process.env
Bun.env.NODE_ENV = "test";
Bun.env.API_URL = "http://localhost:3001/api";

// =============================================================================
// DOM Environment (optional — uncomment if testing DOM/UI code)
// =============================================================================

// If you need DOM APIs (document, window, etc.), install happy-dom:
//   bun add -d happy-dom
//
// Then uncomment the following:
//
// import { Window } from "happy-dom";
//
// const window = new Window({ url: "http://localhost" });
// const document = window.document;
//
// // Make DOM globals available
// Object.assign(globalThis, {
//   window,
//   document,
//   navigator: window.navigator,
//   HTMLElement: window.HTMLElement,
//   customElements: window.customElements,
// });
//
// afterEach(() => {
//   // Clean up DOM between tests
//   document.body.textContent = "";
// });

// =============================================================================
// Global Mocks
// =============================================================================

// Mock console.warn to suppress noisy warnings in tests (use sparingly!)
// const originalWarn = console.warn;
// beforeAll(() => {
//   console.warn = (...args: unknown[]) => {
//     const msg = String(args[0]);
//     if (msg.includes("Expected warning to suppress")) return;
//     originalWarn.call(console, ...args);
//   };
// });

// =============================================================================
// Custom Matchers (extend expect)
// =============================================================================

// Bun's expect is compatible with Jest matchers.
// You can extend it with custom matchers:
//
// import { expect } from "bun:test";
//
// expect.extend({
//   toBeWithinRange(received: number, floor: number, ceiling: number) {
//     const pass = received >= floor && received <= ceiling;
//     return {
//       message: () =>
//         `expected ${received} ${pass ? "not " : ""}to be within range ${floor} - ${ceiling}`,
//       pass,
//     };
//   },
// });
