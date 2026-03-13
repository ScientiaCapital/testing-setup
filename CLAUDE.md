# CLAUDE.md — testing-setup

## Project Overview

**testing-setup** — Testing infrastructure templates and setup scripts.

Provides ready-to-use testing configurations for:
- Python (pytest + pytest-asyncio)
- Bun (bun:test built-in runner)
- React + Vite (Vitest + Testing Library + MSW)
- Next.js (Vitest or Jest)
- Playwright (E2E)
- GitHub Actions CI/CD workflows

### Directory Structure

```
testing-setup/
├── CLAUDE.md                  # This file
├── QUICK_START.md             # Setup guide for users
├── PROJECT_CONTEXT.md         # Session state tracking
├── setup-tests.sh             # Auto-detection setup script
├── pyproject.toml             # Python template config
├── package.json               # Frontend template config
├── vitest.config.ts           # Vitest template config
├── pytest.ini                 # Pytest template config
├── conftest.py                # Pytest fixtures template
├── templates/                 # Template files by framework
│   ├── python/
│   ├── bun/
│   ├── frontend/
│   ├── nextjs/
│   ├── playwright/
│   └── ci/
├── examples/                  # Example test files
├── docs/
│   └── dual-team-workflow.md  # Full workflow reference
└── .claude/
    ├── settings.local.json    # Hook enforcement
    ├── agents/
    │   ├── observer-lite.md   # Haiku — 4 quick checks
    │   └── observer-full.md   # Sonnet — 7 drift patterns
    ├── contracts/             # Feature contracts
    ├── archive/               # Archived reports
    ├── OBSERVER_QUALITY.md    # Code quality findings (ephemeral)
    ├── OBSERVER_ARCH.md       # Architecture findings (ephemeral)
    └── OBSERVER_ALERTS.md     # Active blockers (ephemeral)
```

### Dev Commands

```bash
# Python tests
pytest                          # Run all
pytest --cov=src               # With coverage
pytest -m "not integration"    # Unit only

# Bun tests
bun test                        # Run all
bun test --coverage            # With coverage
bun test --watch               # Watch mode

# Frontend tests
npm test                        # Run all
npm run test:watch             # Watch mode
npm run test:coverage          # With coverage

# E2E tests
npx playwright test            # Run all
npx playwright test --ui       # Interactive

# Setup for a new project
./setup-tests.sh /path/to/project
```
