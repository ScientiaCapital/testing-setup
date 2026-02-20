# Feature Contract: Bun Examples

**Date:** 2026-02-20
**Session:** 3, Task 4
**Scope:** STANDARD (2 new files + 2 minor fixes)

---

## Deliverables

1. `templates/bun/tests/http-server.test.ts` — HTTP server testing with Bun.serve()
2. `templates/bun/tests/sqlite.test.ts` — SQLite testing with bun:sqlite

## Fixes (observer-flagged)

1. `templates/bun/tests/example.test.ts:171` — change `require("fs")` to ESM import
2. `templates/bun/tests/setup.ts:15` — remove unused `beforeAll`/`afterEach` imports

## Success Criteria

- [ ] HTTP server example covers GET/POST/JSON/error responses
- [ ] SQLite example covers CRUD, prepared statements, transactions
- [ ] Both files use `bun:test` imports (not vitest/jest)
- [ ] Example.test.ts uses ESM import instead of require()
- [ ] Setup.ts has no unused imports

## Scope Boundaries

### IN SCOPE
- HTTP server testing patterns (Bun.serve)
- SQLite testing patterns (bun:sqlite)
- Fixing 2 observer-flagged issues
- QUICK_START.md updates for new examples

### OUT OF SCOPE
- DOM/UI testing
- React component testing
- E2E testing
- WebSocket testing
