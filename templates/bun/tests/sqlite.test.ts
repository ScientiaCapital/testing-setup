/**
 * SQLite Tests — bun:sqlite
 *
 * Demonstrates testing SQLite operations with Bun's native bun:sqlite module.
 * Unlike most Node.js database drivers, bun:sqlite is synchronous — no await needed.
 *
 * Key patterns:
 * - Use `:memory:` for in-memory databases (fast, auto-cleanup)
 * - Create schema in beforeEach for test isolation
 * - Test CRUD operations, prepared statements, transactions
 *
 * Run:
 *   bun test tests/sqlite.test.ts
 *
 * Documentation: https://bun.sh/docs/api/sqlite
 */

import { Database } from "bun:sqlite";
import { describe, test, expect, beforeEach, afterEach } from "bun:test";

// =============================================================================
// Schema Setup
// =============================================================================

describe("SQLite CRUD", () => {
  let db: Database;

  beforeEach(() => {
    db = new Database(":memory:");
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    db.run(`
      CREATE TABLE posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  });

  afterEach(() => {
    db.close();
  });

  // ---------------------------------------------------------------------------
  // INSERT
  // ---------------------------------------------------------------------------

  test("insert a user", () => {
    const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
    const result = stmt.run("Alice", "alice@example.com");

    expect(result.changes).toBe(1);
    expect(result.lastInsertRowid).toBe(1);
  });

  test("insert multiple users", () => {
    const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
    stmt.run("Alice", "alice@example.com");
    stmt.run("Bob", "bob@example.com");
    stmt.run("Charlie", "charlie@example.com");

    const count = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
      count: number;
    };
    expect(count.count).toBe(3);
  });

  // ---------------------------------------------------------------------------
  // SELECT
  // ---------------------------------------------------------------------------

  test("select all users", () => {
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [
      "Alice",
      "alice@example.com",
    ]);
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [
      "Bob",
      "bob@example.com",
    ]);

    const users = db.prepare("SELECT id, name, email FROM users").all();

    expect(users).toHaveLength(2);
    expect(users[0]).toMatchObject({ id: 1, name: "Alice" });
    expect(users[1]).toMatchObject({ id: 2, name: "Bob" });
  });

  test("select single user by id", () => {
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [
      "Alice",
      "alice@example.com",
    ]);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(1) as {
      id: number;
      name: string;
      email: string;
    };

    expect(user.id).toBe(1);
    expect(user.name).toBe("Alice");
    expect(user.email).toBe("alice@example.com");
  });

  test("select returns null for missing row", () => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(999);
    expect(user).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------

  test("update a user", () => {
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [
      "Alice",
      "alice@example.com",
    ]);

    const result = db
      .prepare("UPDATE users SET name = ? WHERE id = ?")
      .run("Alice Updated", 1);

    expect(result.changes).toBe(1);

    const user = db.prepare("SELECT name FROM users WHERE id = ?").get(1) as {
      name: string;
    };
    expect(user.name).toBe("Alice Updated");
  });

  test("update returns 0 changes for missing row", () => {
    const result = db
      .prepare("UPDATE users SET name = ? WHERE id = ?")
      .run("Nobody", 999);

    expect(result.changes).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------

  test("delete a user", () => {
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [
      "Alice",
      "alice@example.com",
    ]);

    const result = db.prepare("DELETE FROM users WHERE id = ?").run(1);
    expect(result.changes).toBe(1);

    const users = db.prepare("SELECT * FROM users").all();
    expect(users).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // Constraint Violations
  // ---------------------------------------------------------------------------

  test("unique constraint rejects duplicate email", () => {
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [
      "Alice",
      "alice@example.com",
    ]);

    expect(() => {
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", [
        "Alice 2",
        "alice@example.com",
      ]);
    }).toThrow();
  });

  test("not null constraint rejects missing name", () => {
    expect(() => {
      db.run("INSERT INTO users (email) VALUES (?)", ["no-name@example.com"]);
    }).toThrow();
  });

  // ---------------------------------------------------------------------------
  // Prepared Statements
  // ---------------------------------------------------------------------------

  test("prepared statements with named parameters", () => {
    const stmt = db.prepare(
      "INSERT INTO users (name, email) VALUES ($name, $email)",
    );
    stmt.run({ $name: "Alice", $email: "alice@example.com" });

    const user = db.prepare("SELECT * FROM users WHERE name = ?").get("Alice");
    expect(user).not.toBeNull();
  });

  test("reuse prepared statement", () => {
    const insert = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");

    insert.run("Alice", "alice@example.com");
    insert.run("Bob", "bob@example.com");
    insert.run("Charlie", "charlie@example.com");

    const count = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
      count: number;
    };
    expect(count.count).toBe(3);
  });
});

// =============================================================================
// Transactions
// =============================================================================

describe("SQLite Transactions", () => {
  let db: Database;

  beforeEach(() => {
    db = new Database(":memory:");
    db.run(`
      CREATE TABLE accounts (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0
      )
    `);
    db.run("INSERT INTO accounts (id, name, balance) VALUES (1, 'Alice', 100)");
    db.run("INSERT INTO accounts (id, name, balance) VALUES (2, 'Bob', 50)");
  });

  afterEach(() => {
    db.close();
  });

  test("transaction commits on success", () => {
    const transfer = db.transaction(
      (from: number, to: number, amount: number) => {
        db.prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?").run(
          amount,
          from,
        );
        db.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?").run(
          amount,
          to,
        );
      },
    );

    transfer(1, 2, 30);

    const alice = db
      .prepare("SELECT balance FROM accounts WHERE id = ?")
      .get(1) as { balance: number };
    const bob = db
      .prepare("SELECT balance FROM accounts WHERE id = ?")
      .get(2) as { balance: number };

    expect(alice.balance).toBe(70);
    expect(bob.balance).toBe(80);
  });

  test("transaction rolls back on error", () => {
    const badTransfer = db.transaction(() => {
      db.prepare("UPDATE accounts SET balance = balance - 30 WHERE id = 1").run();
      throw new Error("Simulated failure");
    });

    expect(() => badTransfer()).toThrow("Simulated failure");

    // Balance should be unchanged
    const alice = db
      .prepare("SELECT balance FROM accounts WHERE id = ?")
      .get(1) as { balance: number };
    expect(alice.balance).toBe(100);
  });

  test("batch insert with transaction is faster", () => {
    db.run(
      "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)",
    );

    const insertMany = db.transaction((items: string[]) => {
      const stmt = db.prepare("INSERT INTO items (value) VALUES (?)");
      for (const item of items) {
        stmt.run(item);
      }
    });

    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    insertMany(items);

    const count = db.prepare("SELECT COUNT(*) as count FROM items").get() as {
      count: number;
    };
    expect(count.count).toBe(100);
  });
});
