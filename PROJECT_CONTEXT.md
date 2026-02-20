# Project Context: testing-setup

**Last Updated:** 2026-02-20 (session 2 — end of day)
**Status:** Active — Bun testing template added, observer workflow exercised

---

## Project Overview

Testing infrastructure templates and setup scripts for Python (pytest), Bun (bun:test), React+Vite (Vitest), Next.js (Vitest/Jest), and Playwright E2E. Provides a `setup-tests.sh` script that auto-detects project type and copies appropriate templates.

## Components

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| Setup script | `setup-tests.sh` | Stable | Auto-detects Python, Bun, Vite, Next.js |
| Python templates | `templates/python/` | Stable | pytest + asyncio |
| Bun templates | `templates/bun/` | **New** | bun:test built-in runner |
| Frontend templates | `templates/frontend/` | Stable | Vitest + Testing Library + MSW |
| Next.js templates | `templates/nextjs/` | Stable | Vitest or Jest options |
| Playwright templates | `templates/playwright/` | Stable | E2E with fixtures |
| CI templates | `templates/ci/` | Stable | GitHub Actions workflows |
| Quick Start Guide | `QUICK_START.md` | Updated | Added Bun section |
| Example files | Root (`*.test.tsx`, etc.) | Reference | Show patterns in action |
| Workflow infra | `.claude/`, `CLAUDE.md` | Exercised | Dual-team observer — fully tested |
| Feature contract | `.claude/contracts/bun-testing-template.md` | Complete | First real contract used |

## Tech Stack

- **Python:** pytest, pytest-asyncio, respx, faker
- **Bun:** bun:test (built-in runner), @types/bun
- **Frontend:** Vitest, Testing Library, MSW, jsdom
- **E2E:** Playwright
- **CI/CD:** GitHub Actions
- **Workflow:** Claude Code agents, observer pattern

## Architecture Decisions

### 2026-02-20: Added Dual-Team Observer Workflow
**Context:** Project had no workflow infrastructure. Observer pattern from workflow-orchestrator skill needed to be integrated to enforce code quality on every session.
**Decision:** Added CLAUDE.md with mandatory observer protocol at top, hook enforcement via `.claude/settings.local.json`, pre-seeded observer templates, and lightweight + full observer agent definitions.
**Consequences:** Every code change now triggers observer awareness. Small tasks use observer-lite (Haiku, <$0.05), larger tasks use observer-full (Sonnet). Scope escalation auto-detected at >5 files.

### 2026-02-20: Added Bun Testing Template
**Context:** Bun has its own native test runner (`bun:test`) that is Jest-compatible but distinct from Vitest. Users of Bun need templates tailored to its API, not Vitest adaptations.
**Decision:** Created separate `templates/bun/` directory with 5 template files. Used `bunfig.toml` for configuration (not vitest.config.ts). Placed Bun detection before Vite in `setup-tests.sh` (most-specific-first pattern). Kept DOM testing (happy-dom) as documented-but-not-included per contract scope.
**Consequences:** Bun projects now get proper templates via auto-detection. Detection order: Next.js > Bun > Vite > Python > generic.

## Observer Summary

| Metric | Value |
|--------|-------|
| Sessions with observer active | 1 |
| Total blockers found | 0 |
| Total warnings found | 6 (2 from lite, 4 from full) |
| Total warnings resolved | 5 (1 logging to backlog) |
| Observer-lite runs | 1 (initial scan, 35 files) |
| Observer-full runs | 2 (pre-implementation + final) |

## Session Log — 2026-02-20 (Session 1: Infrastructure)

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

### Metrics
- Files created: 12 (8 tracked, 4 gitignored)
- Lines added: 775 (tracked) + ~200 (gitignored templates)
- Commits: 1 (`3b241b2`)

## Session Log — 2026-02-20 (Session 2: Workflow Exercise)

### Completed
- [x] **Start Day protocol** — context scan, pre-flight checks, observer-lite spawn
- [x] **PreToolUse hook verified** — `_not yet run_` marker detected, warning confirmed
- [x] **observer-lite produced real report** — 35 files scanned, 0 BLOCKERs, 2 WARNINGs, 3 INFOs
- [x] **Hook silence verified** — after observer ran, marker gone, gate open
- [x] **SMALL scope: Fix QUICK_START.md** — fixed `testing_setup/` → `testing-setup/` (2 occurrences)
- [x] **Feature contract created** — `.claude/contracts/bun-testing-template.md`
- [x] **observer-full produced dual reports** — OBSERVER_QUALITY.md + OBSERVER_ARCH.md with real findings
- [x] **Bun testing templates created** — 5 files in `templates/bun/`
- [x] **setup-tests.sh updated** — Bun detection, copy function, help text, type flag
- [x] **QUICK_START.md updated** — Bun section, directory tree, command reference
- [x] **CLAUDE.md updated** — Project overview, directory tree, dev commands
- [x] **Observer WARNINGs addressed** — detection order, pinned @types/bun, removed happy-dom from default deps
- [x] **Scope escalation verified** — 9 files staged, hook correctly flagged >5
- [x] **Security scan** — PASS on all new template files
- [x] **Committed and pushed** — 2 commits (SMALL fix + STANDARD feature)

### Observer Findings Summary
| Source | BLOCKERs | WARNINGs | INFOs |
|--------|----------|----------|-------|
| observer-lite (initial) | 0 | 2 | 3 |
| observer-full (pre-impl) | 0 | 4 | 3 |
| Total unique | 0 | 6 | 3 |
| Resolved | 0 | 5 | 0 |
| Remaining | 0 | 1 (backlog) | 3 |

### Remaining Observer Items (backlog)
- [INFO] Root `vitest.config.ts` and `package.json` are duplicates of `templates/frontend/` counterparts — maintenance risk
- [INFO] Root `pyproject.toml` targets >=3.11 vs template >=3.10 — intentional but undocumented
- [INFO] `conftest.py:68` has `import os` in commented-out example code
- [WARNING] `setup-tests.sh:200` missing file guard for `test_supabase.py` template copy

### Metrics
- Files created: 6 (5 templates + 1 contract)
- Files modified: 3 (setup-tests.sh, QUICK_START.md, CLAUDE.md)
- Lines added: ~672
- Commits: 2 (`7983cb0` docs fix, `59606d0` Bun template)

### Workflow Verification Checklist
| Check | Result |
|-------|--------|
| PreToolUse hook fires before observer | PASS |
| observer-lite produces real report | PASS |
| Hook silent after observer runs | PASS |
| Feature contract created before code | PASS |
| observer-full produces dual reports | PASS |
| PostToolUse scope escalation at >5 files | PASS |
| OBSERVER_ALERTS.md checked (no BLOCKERs) | PASS |
| Bun templates follow conventions | PASS |
| setup-tests.sh detects Bun | PASS |
| QUICK_START.md has Bun section | PASS |

## Next Priorities

1. Add file existence guard to `setup-tests.sh:200` for `test_supabase.py` copy (WARNING from observer-lite)
2. Consider symlinking or documenting root config duplicates (INFO from observer-lite)
3. Add CI template for Bun projects (`templates/ci/github-actions-bun.yml`)
4. Test `setup-tests.sh` Bun detection with a real Bun project
5. Add more example tests for Bun (HTTP server testing, SQLite testing)
