/**
 * HTTP Server Tests — Bun.serve()
 *
 * Demonstrates testing HTTP servers built with Bun's native Bun.serve() API.
 * Bun.serve() returns a Server object immediately — no callback needed.
 *
 * Key patterns:
 * - Start server with port: 0 (OS assigns available port)
 * - Use native fetch() to test endpoints
 * - Stop server in afterAll() for cleanup
 *
 * Run:
 *   bun test tests/http-server.test.ts
 *
 * Documentation: https://bun.sh/docs/api/http
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";

// =============================================================================
// Simple Server Factory
// =============================================================================

/** Creates a test server with basic routing */
function createTestServer() {
  return Bun.serve({
    port: 0, // OS assigns available port
    fetch(req) {
      const url = new URL(req.url);

      // GET /health
      if (req.method === "GET" && url.pathname === "/health") {
        return Response.json({ status: "ok" });
      }

      // GET /users
      if (req.method === "GET" && url.pathname === "/users") {
        return Response.json({
          users: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
          ],
        });
      }

      // GET /users/:id
      if (req.method === "GET" && url.pathname.startsWith("/users/")) {
        const id = parseInt(url.pathname.split("/")[2]);
        if (isNaN(id)) {
          return Response.json({ error: "Invalid user ID" }, { status: 400 });
        }
        return Response.json({ id, name: `User ${id}` });
      }

      // POST /users
      if (req.method === "POST" && url.pathname === "/users") {
        return (async () => {
          const body = await req.json();
          if (!body.name) {
            return Response.json(
              { error: "Name is required" },
              { status: 400 },
            );
          }
          return Response.json(
            { id: 3, name: body.name },
            { status: 201 },
          );
        })();
      }

      // PUT /users/:id
      if (req.method === "PUT" && url.pathname.startsWith("/users/")) {
        return (async () => {
          const id = parseInt(url.pathname.split("/")[2]);
          const body = await req.json();
          return Response.json({ id, ...body });
        })();
      }

      // DELETE /users/:id
      if (req.method === "DELETE" && url.pathname.startsWith("/users/")) {
        return new Response(null, { status: 204 });
      }

      // 404 for everything else
      return Response.json({ error: "Not found" }, { status: 404 });
    },
  });
}

// =============================================================================
// Tests
// =============================================================================

describe("HTTP Server", () => {
  let server: ReturnType<typeof Bun.serve>;
  let baseUrl: string;

  beforeAll(() => {
    server = createTestServer();
    baseUrl = `http://localhost:${server.port}`;
  });

  afterAll(() => {
    server.stop();
  });

  // ---------------------------------------------------------------------------
  // Health Check
  // ---------------------------------------------------------------------------

  test("GET /health returns ok", async () => {
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");

    const data = await response.json();
    expect(data.status).toBe("ok");
  });

  // ---------------------------------------------------------------------------
  // GET Routes
  // ---------------------------------------------------------------------------

  test("GET /users returns user list", async () => {
    const response = await fetch(`${baseUrl}/users`);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.users).toHaveLength(2);
    expect(data.users[0].name).toBe("Alice");
  });

  test("GET /users/:id returns single user", async () => {
    const response = await fetch(`${baseUrl}/users/1`);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe(1);
    expect(data.name).toBe("User 1");
  });

  test("GET /users/invalid returns 400", async () => {
    const response = await fetch(`${baseUrl}/users/abc`);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid user ID");
  });

  // ---------------------------------------------------------------------------
  // POST Routes
  // ---------------------------------------------------------------------------

  test("POST /users creates a user", async () => {
    const response = await fetch(`${baseUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Charlie" }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe("Charlie");
    expect(data.id).toBe(3);
  });

  test("POST /users without name returns 400", async () => {
    const response = await fetch(`${baseUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Name is required");
  });

  // ---------------------------------------------------------------------------
  // PUT Routes
  // ---------------------------------------------------------------------------

  test("PUT /users/:id updates a user", async () => {
    const response = await fetch(`${baseUrl}/users/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice Updated" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe(1);
    expect(data.name).toBe("Alice Updated");
  });

  // ---------------------------------------------------------------------------
  // DELETE Routes
  // ---------------------------------------------------------------------------

  test("DELETE /users/:id returns 204", async () => {
    const response = await fetch(`${baseUrl}/users/1`, {
      method: "DELETE",
    });

    expect(response.status).toBe(204);
  });

  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------

  test("unknown route returns 404", async () => {
    const response = await fetch(`${baseUrl}/nonexistent`);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("Not found");
  });

  // ---------------------------------------------------------------------------
  // Headers
  // ---------------------------------------------------------------------------

  test("responses include correct content-type", async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
