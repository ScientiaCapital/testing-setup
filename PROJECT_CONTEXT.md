# Project Context: testing-setup

**Last Updated:** 2026-02-20 (end of day)
**Status:** Active — workflow infrastructure committed and pushed

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
| Workflow infra | `.claude/`, `CLAUDE.md` | Committed | Dual-team observer system — pushed to main |

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

## Session Log — 2026-02-20

### Completed
- [x] Created .gitignore with observer file exclusions
- [x] Created .claude/ directory structure (agents/, contracts/, archive/)
- [x] Pre-seeded OBSERVER_QUALITY.md, OBSERVER_ARCH.md, OBSERVER_ALERTS.md
- [x] Created observer-lite.md (Haiku, 4 checks, <$0.05)
- [x] Created observer-full.md (Sonnet, 7 drift patterns + devil's advocate)
- [x] Created settings.local.json with PreToolUse + PostToolUse hooks
- [x] Created PROJECT_CONTEXT.md
- [x] Created docs/dual-team-workflow.md (full reference)
- [x] Created CLAUDE.md with observer protocol as first section
- [x] Security sweep: passed (no real secrets, templates only)
- [x] Committed 8 files (+775 lines) and pushed to origin/main

### Security Sweep Results
- Secrets scan: PASS (all matches are mock/template values)
- .env files: PASS (none exist, gitignored)
- Observer alerts: PASS (no active blockers)

### Metrics
- Files created: 12 (8 tracked, 4 gitignored)
- Lines added: 775 (tracked) + ~200 (gitignored templates)
- Commits: 1 (`3b241b2`)

## Next Priorities

1. Verify observer hooks work in a fresh session (start new session, try editing a file)
2. Test scope classification with a real SMALL task (e.g., "fix typo in QUICK_START.md")
3. Test scope classification with a STANDARD task (e.g., "add Bun testing template")
4. Add feature contract template for first real feature build
