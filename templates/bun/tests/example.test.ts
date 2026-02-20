/**
 * Example Test File — Bun Testing
 *
 * Bun ships a built-in test runner compatible with Jest's expect() API.
 * No need for Vitest or Jest — just import from "bun:test".
 *
 * Run:
 *   bun test                     # Run all tests
 *   bun test tests/example       # Run this file
 *   bun test --watch             # Watch mode
 *
 * Documentation: https://bun.sh/docs/cli/test
 */

import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import { unlinkSync } from "node:fs";

// =============================================================================
// Basic Tests
// =============================================================================

describe("Math utilities", () => {
  test("adds two numbers", () => {
    expect(1 + 2).toBe(3);
  });

  test("handles floating point", () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3);
  });

  test("array contains value", () => {
    const fruits = ["apple", "banana", "cherry"];
    expect(fruits).toContain("banana");
    expect(fruits).toHaveLength(3);
  });
});

// =============================================================================
// Async Tests
// =============================================================================

describe("Async operations", () => {
  test("resolves a promise", async () => {
    const result = await Promise.resolve("hello");
    expect(result).toBe("hello");
  });

  test("rejects with error", () => {
    const failing = async () => {
      throw new Error("something went wrong");
    };
    expect(failing()).rejects.toThrow("something went wrong");
  });

  test("fetches data (using Bun's native fetch)", async () => {
    // Bun has native fetch — no node-fetch needed
    // In real tests, you'd mock this or use a test server
    const mockResponse = { users: [{ id: 1, name: "Alice" }] };

    // Example: mock a fetch call
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    );

    const response = await fetch("https://api.example.com/users");
    const data = await response.json();

    expect(data.users).toHaveLength(1);
    expect(data.users[0].name).toBe("Alice");

    // Restore original fetch
    globalThis.fetch = originalFetch;
  });
});

// =============================================================================
// Mocking
// =============================================================================

describe("Mocking", () => {
  test("mock a function", () => {
    const fn = mock(() => 42);

    expect(fn()).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("mock implementation", () => {
    const greet = mock((name: string) => `Hello, ${name}!`);

    expect(greet("World")).toBe("Hello, World!");
    expect(greet).toHaveBeenCalledWith("World");
  });

  test("spy on method", () => {
    const obj = {
      calculate: (a: number, b: number) => a + b,
    };

    const spy = mock(() => obj.calculate(2, 3));
    spy();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// Lifecycle Hooks
// =============================================================================

describe("With setup and teardown", () => {
  let testData: string[];

  beforeAll(() => {
    testData = ["item1", "item2", "item3"];
  });

  afterAll(() => {
    testData = [];
  });

  test("data is initialized", () => {
    expect(testData).toHaveLength(3);
  });

  test("data contains expected items", () => {
    expect(testData).toContain("item1");
  });
});

// =============================================================================
// Snapshot Testing
// =============================================================================

describe("Snapshots", () => {
  test("object matches snapshot", () => {
    const config = {
      name: "my-app",
      version: "1.0.0",
      features: ["auth", "api", "dashboard"],
    };

    expect(config).toMatchSnapshot();
  });
});

// =============================================================================
// Bun-Specific Features
// =============================================================================

describe("Bun-specific", () => {
  test("Bun.version is available", () => {
    expect(typeof Bun.version).toBe("string");
    expect(Bun.version.length).toBeGreaterThan(0);
  });

  test("Bun.env reads environment", () => {
    // Bun.env is like process.env but faster
    expect(Bun.env.NODE_ENV).toBeDefined();
  });

  test("file I/O with Bun APIs", async () => {
    // Bun has fast native file I/O
    const tempFile = "/tmp/bun-test-example.txt";
    await Bun.write(tempFile, "Hello from Bun!");

    const content = await Bun.file(tempFile).text();
    expect(content).toBe("Hello from Bun!");

    // Cleanup
    unlinkSync(tempFile);
  });
});
