# Testing Setup Quick Start Guide

## 🎯 Why This Matters

Testing infrastructure is like compound interest - the earlier you start, the more it pays off.
Setting it up on day 1 takes 30 minutes. Retrofitting it 6 months later takes days.

---

## 🚀 Automated Setup (Recommended)

The fastest way to set up testing in any project:

```bash
# Run from testing_setup directory
./setup-tests.sh /path/to/your/project

# Or run in the project directory
cd /path/to/your/project
/path/to/testing_setup/setup-tests.sh

# With CI/CD workflows
./setup-tests.sh -c /path/to/project

# Force overwrite existing files
./setup-tests.sh -f /path/to/project

# See all options
./setup-tests.sh --help
```

The script auto-detects your project type (Python, React+Vite, Next.js) and copies the appropriate templates.

---

## Python Backend Setup (pytest + pytest-asyncio)

### 1. Install Dependencies

```bash
# Using pip
pip install pytest pytest-asyncio pytest-cov pytest-xdist respx faker pytest-mock

# Using uv (faster)
uv add --dev pytest pytest-asyncio pytest-cov pytest-xdist respx faker pytest-mock
```

### 2. Create Directory Structure

```bash
mkdir -p tests/unit tests/integration
touch tests/__init__.py tests/conftest.py pytest.ini
```

### 3. Copy Template Files

Copy these files from the templates:
- `templates/python/pyproject.toml` → project root (merge with existing)
- `templates/python/tests/conftest.py` → tests/
- `templates/python/tests/integration/test_supabase.py` → tests/integration/

### 4. Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific file
pytest tests/unit/test_example.py

# Run in parallel (faster)
pytest -n auto

# Run only unit tests
pytest -m "not integration"

# Run only integration tests
pytest -m integration
```

---

## Frontend Setup (React + Vite with Vitest)

### 1. Install Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event @vitest/coverage-v8 jsdom msw
```

### 2. Create Directory Structure

```bash
mkdir -p src/test/mocks
touch src/test/setup.ts src/test/utils.tsx vitest.config.ts
```

### 3. Copy Template Files

- `templates/frontend/vitest.config.ts` → project root
- `templates/frontend/src/test/setup.ts` → src/test/
- `templates/frontend/src/test/utils.tsx` → src/test/
- `templates/frontend/src/test/mocks/handlers.ts` → src/test/mocks/
- `templates/frontend/src/test/mocks/server.ts` → src/test/mocks/

### 4. Update tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### 5. Add Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 6. Run Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

---

## Next.js Testing Setup

Next.js projects can use either **Vitest** (recommended for speed) or **Jest** (native Next.js support).

### Option A: Vitest (Recommended)

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event jsdom msw
```

Copy templates:
- `templates/nextjs/vitest.config.ts` → project root
- `templates/nextjs/src/test/setup.ts` → src/test/
- `templates/nextjs/src/test/utils.tsx` → src/test/

### Option B: Jest (Native Next.js)

```bash
npm install -D jest @types/jest ts-jest @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom msw
```

Copy templates:
- `templates/nextjs/jest.config.js` → project root
- `templates/nextjs/src/test/setup.ts` → src/test/
- `templates/nextjs/src/test/utils.tsx` → src/test/

### Testing API Routes (App Router)

The templates include examples for testing Next.js API routes. See:
- `templates/nextjs/examples/api-route.test.ts` - API route testing patterns
- `templates/nextjs/examples/page.test.tsx` - Page component testing

Key patterns:
```typescript
// Test helper for creating mock requests
import { createMockRequest, createMockParams } from '@/test/utils'

const request = createMockRequest('POST', '/api/users', { name: 'John' })
const response = await POST(request)
expect(response.status).toBe(201)

// For dynamic routes [id]
const { params } = createMockParams({ id: '123' })
const response = await GET(request, { params })
```

---

## E2E Testing with Playwright

### 1. Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### 2. Copy Templates

```bash
mkdir -p e2e/tests e2e/fixtures
```

- `templates/playwright/playwright.config.ts` → e2e/ (or project root)
- `templates/playwright/tests/example.spec.ts` → e2e/tests/
- `templates/playwright/fixtures/db-seed.ts` → e2e/fixtures/

### 3. Add Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### 4. Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test landing.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Generate tests by recording
npx playwright codegen localhost:3000
```

### Database Seeding for E2E

The `fixtures/db-seed.ts` template provides:
- Test data factories for users, posts, etc.
- `seedDatabase()` - call in `beforeAll()`
- `cleanupDatabase()` - call in `afterAll()`
- Test user credentials for auth flows

---

## Supabase Testing Patterns

### Python (Integration Tests)

See `templates/python/tests/integration/test_supabase.py` for:
- Mocked Supabase client for unit tests
- Real Supabase integration tests
- RLS (Row Level Security) testing
- Repository pattern testing

```python
# Mark tests that need real Supabase
@pytest.mark.integration
def test_real_supabase_query(supabase_client):
    result = supabase_client.table("users").select("*").execute()
    assert len(result.data) >= 0
```

### Frontend (MSW Mocking)

The MSW handlers in `templates/frontend/src/test/mocks/handlers.ts` include:
- Supabase REST API mocks (`/rest/v1/*`)
- Supabase Auth mocks (`/auth/v1/*`)
- Easy override for specific tests

```typescript
import { server, overrideHandler } from '@/test/mocks/server'

test('handles auth error', async () => {
  server.use(
    overrideHandler('post', '/auth/v1/token', { status: 400, body: { error: 'Invalid credentials' } })
  )
  // ... test code
})
```

---

## MSW (Mock Service Worker) Setup

MSW intercepts network requests at the service worker level, providing realistic API mocking.

### Why MSW?

- Your actual `fetch()` calls run unchanged
- Same mocks work in tests AND browser dev mode
- No need to mock HTTP client libraries
- More realistic integration tests

### Setup

1. Install: `npm install -D msw`
2. Copy handlers: `templates/frontend/src/test/mocks/handlers.ts`
3. Copy server: `templates/frontend/src/test/mocks/server.ts`
4. Add to setup.ts:

```typescript
import { setupMSW } from '@/test/mocks/server'
setupMSW()
```

### Override Handlers in Tests

```typescript
import { server, http, HttpResponse } from '@/test/mocks/server'

test('handles server error', async () => {
  server.use(
    http.get('/api/users', () => HttpResponse.json({ error: 'Server down' }, { status: 500 }))
  )
  // ... test code
})
```

---

## CI/CD Setup (GitHub Actions)

### Copy Workflow Files

```bash
mkdir -p .github/workflows
```

Choose the appropriate workflow:
- **Python**: `templates/ci/github-actions-python.yml` → `.github/workflows/test.yml`
- **Frontend**: `templates/ci/github-actions-frontend.yml` → `.github/workflows/test.yml`
- **E2E**: `templates/ci/github-actions-e2e.yml` → `.github/workflows/e2e.yml`

### Required Secrets

Add these in GitHub → Settings → Secrets:

| Secret | Description |
|--------|-------------|
| `CODECOV_TOKEN` | For coverage reporting |
| `SUPABASE_URL` | For integration tests |
| `SUPABASE_KEY` | Anon key for tests |
| `SUPABASE_SERVICE_KEY` | Service key for RLS bypass |
| `VITE_SUPABASE_URL` | Build-time env var |
| `VITE_SUPABASE_ANON_KEY` | Build-time env var |

### Workflow Features

- **Python workflow**: Multi-version testing (3.10-3.12), lint → test → integration → build
- **Frontend workflow**: Auto-detects npm/yarn/pnpm, multi-Node testing (18-22)
- **E2E workflow**: Multi-browser, sharding for parallel execution, screenshot capture

---

## Monorepo Patterns

For projects with separate frontend and backend:

```
my-project/
├── backend/
│   ├── tests/
│   └── pyproject.toml
├── frontend/
│   ├── src/test/
│   └── vitest.config.ts
├── e2e/
│   ├── tests/
│   └── playwright.config.ts
└── .github/workflows/
```

### Setup Script for Monorepos

```bash
# Setup backend tests
./setup-tests.sh -t python ./backend

# Setup frontend tests
./setup-tests.sh -t nextjs ./frontend

# Setup E2E tests
./setup-tests.sh -t e2e ./e2e
```

---

## New Project Checklist

When starting any new project, go through this checklist:

### Day 1: Foundation
- [ ] Run `./setup-tests.sh /path/to/project`
- [ ] Verify setup with `npm test` or `pytest`
- [ ] Write ONE trivial test to confirm it works
- [ ] Add test scripts to package.json/Makefile

### Day 2-3: First Real Tests
- [ ] Write tests for core business logic first
- [ ] Set up mocks for external services (APIs, DBs)
- [ ] Add GitHub Actions workflow
- [ ] Set coverage thresholds (start at 60%, increase over time)

### Ongoing
- [ ] Write tests BEFORE fixing bugs (catches regressions)
- [ ] Review test coverage weekly
- [ ] Refactor tests as code changes
- [ ] Keep test suite fast (<30 seconds for unit tests)

---

## When You Join an Existing Codebase

If tests aren't set up:

1. **Don't panic** - This is common
2. **Start small** - Set up infrastructure first
3. **Add tests for NEW code** - Don't try to retroactively test everything
4. **Test bug fixes** - Before fixing a bug, write a test that reproduces it
5. **Test the scary parts** - Critical paths, payment flows, auth

### Making the Case to the Team

Key arguments for skeptical teammates:
- "It catches bugs before they reach production"
- "It lets us refactor without fear"
- "It speeds up onboarding - tests show how code should work"
- "It reduces manual QA time"

---

## Red Flags in Existing Codebases

Watch for these signs that testing was skipped:
- Functions that do 10 things (untestable)
- Hard-coded API keys and URLs (not mockable)
- Global state everywhere (tests pollute each other)
- "It works on my machine" (no CI)
- Fear of changing critical code (no safety net)

---

## Quick Reference Commands

### Python
```bash
pytest                          # Run all tests
pytest -v                       # Verbose output
pytest -k "test_name"           # Run matching tests
pytest --cov=src               # Coverage report
pytest -x                       # Stop on first failure
pytest --lf                     # Run last failed only
pytest -n auto                  # Parallel execution
pytest -m "not integration"    # Skip slow tests
```

### Frontend (Vitest)
```bash
npm test                        # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
npm test -- --run              # Run once (no watch)
npm test -- MyComponent        # Run matching tests
npm test -- --reporter=verbose # Detailed output
```

### Next.js (Jest)
```bash
npm test                        # Run all tests
npm test -- --watch            # Watch mode
npm test -- --coverage         # Coverage report
npm test -- --testPathPattern="api"  # Run API tests only
```

### Playwright (E2E)
```bash
npx playwright test            # Run all E2E tests
npx playwright test --ui       # Interactive UI mode
npx playwright test --headed   # See browser
npx playwright test --debug    # Debug mode
npx playwright codegen         # Record/generate tests
npx playwright show-report     # View HTML report
```

---

## Template Directory Structure

```
testing_setup/
├── setup-tests.sh             # Automated setup script
├── QUICK_START.md             # This guide
├── templates/
│   ├── python/
│   │   ├── pyproject.toml
│   │   ├── tests/
│   │   │   ├── conftest.py
│   │   │   └── integration/
│   │   │       └── test_supabase.py
│   ├── frontend/
│   │   ├── vitest.config.ts
│   │   └── src/test/
│   │       ├── setup.ts
│   │       ├── utils.tsx
│   │       └── mocks/
│   │           ├── handlers.ts
│   │           └── server.ts
│   ├── nextjs/
│   │   ├── vitest.config.ts
│   │   ├── jest.config.js
│   │   ├── src/test/
│   │   │   ├── setup.ts
│   │   │   └── utils.tsx
│   │   └── examples/
│   │       ├── api-route.test.ts
│   │       └── page.test.tsx
│   ├── playwright/
│   │   ├── playwright.config.ts
│   │   ├── tests/
│   │   │   └── example.spec.ts
│   │   └── fixtures/
│   │       └── db-seed.ts
│   └── ci/
│       ├── github-actions-python.yml
│       ├── github-actions-frontend.yml
│       └── github-actions-e2e.yml
```

---

## GTME Perspective

As a Go-To-Market Engineer, testing infrastructure is CRITICAL because:

1. **Sales tools must be reliable** - Demos that crash kill deals
2. **Lead pipelines need confidence** - You can't A/B test if you can't trust results
3. **Automation requires testing** - Scripts that break at 2am waste everyone's time
4. **Technical credibility** - Tested code signals engineering maturity

### Portfolio Impact

When interviewing for GTME roles, having test coverage in your repos signals:
- You build production-grade systems, not demos
- You think about reliability and maintenance
- You can work autonomously without breaking things
- You understand engineering best practices

### Make It a Habit

Every project you build going forward should have tests from day 1.
It becomes second nature quickly.
