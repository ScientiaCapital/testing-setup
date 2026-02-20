# Project Context: testing-setup

**Last Updated:** 2026-02-20
**Status:** Active — workflow infrastructure being added

---

## Project Overview

Testing infrastructure templates and setup scripts for Python (pytest), React+Vite (Vitest), Next.js (Vitest/Jest), and Playwright E2E. Provides a `setup-tests.sh` script that auto-detects project type and copies appropriate templates.

## Components

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| Setup script | `setup-tests.sh` | Stable | Auto-detects project type |
| Python templates | `templates/python/` | Stable | pytest + asyncio |
| Frontend templates | `templates/frontend/` | Stable | Vitest + Testing Library + MSW |
| Next.js templates | `templates/nextjs/` | Stable | Vitest or Jest options |
| Playwright templates | `templates/playwright/` | Stable | E2E with fixtures |
| CI templates | `templates/ci/` | Stable | GitHub Actions workflows |
| Quick Start Guide | `QUICK_START.md` | Stable | Comprehensive setup guide |
| Example files | Root (`*.test.tsx`, etc.) | Reference | Show patterns in action |
| Workflow infra | `.claude/`, `CLAUDE.md` | New | Dual-team observer system |

## Tech Stack

- **Python:** pytest, pytest-asyncio, respx, faker
- **Frontend:** Vitest, Testing Library, MSW, jsdom
- **E2E:** Playwright
- **CI/CD:** GitHub Actions
- **Workflow:** Claude Code agents, observer pattern

## Architecture Decisions

### 2026-02-20: Added Dual-Team Observer Workflow
**Context:** Project had no workflow infrastructure. Observer pattern from workflow-orchestrator skill needed to be integrated to enforce code quality on every session.
**Decision:** Added CLAUDE.md with mandatory observer protocol at top, hook enforcement via `.claude/settings.local.json`, pre-seeded observer templates, and lightweight + full observer agent definitions.
**Consequences:** Every code change now triggers observer awareness. Small tasks use observer-lite (Haiku, <$0.05), larger tasks use observer-full (Sonnet). Scope escalation auto-detected at >5 files.

## Observer Summary

| Metric | Value |
|--------|-------|
| Sessions with observer active | 0 |
| Total blockers found | 0 |
| Total warnings resolved | 0 |
| Average session cost | $0.00 |

## Next Priorities

1. Verify observer hooks work in a new session
2. Test scope classification with real tasks
3. Add feature contract template for first real feature
