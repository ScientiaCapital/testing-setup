# Project Context: testing-setup

**Last Updated:** 2026-02-20 (session 3 — end of day)
**Status:** Active — File guards fixed, Bun CI template added, detection bug fixed, Bun examples added

---

## Project Overview

Testing infrastructure templates and setup scripts for Python (pytest), Bun (bun:test), React+Vite (Vitest), Next.js (Vitest/Jest), and Playwright E2E. Provides a `setup-tests.sh` script that auto-detects project type and copies appropriate templates.

## Components

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| Setup script | `setup-tests.sh` | Stable | Auto-detects Python, Bun, Vite, Next.js |
| Python templates | `templates/python/` | Stable | pytest + asyncio |
| Bun templates | `templates/bun/` | Stable | bun:test + HTTP server + SQLite examples |
| Frontend templates | `templates/frontend/` | Stable | Vitest + Testing Library + MSW |
| Next.js templates | `templates/nextjs/` | Stable | Vitest or Jest options |
| Playwright templates | `templates/playwright/` | Stable | E2E with fixtures |
| CI templates | `templates/ci/` | Updated | GitHub Actions: Python, Bun, Frontend, E2E |
| Quick Start Guide | `QUICK_START.md` | Updated | Added Bun section |
| Example files | Root (`*.test.tsx`, etc.) | Reference | Show patterns in action |
| Workflow infra | `.claude/`, `CLAUDE.md` | Exercised | Dual-team observer — fully tested |
| Feature contracts | `.claude/contracts/` | Complete | bun-testing-template, bun-ci-template, bun-examples |

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
| Sessions with observer active | 2 |
| Total blockers found | 0 |
| Total warnings found | 9 (2 lite S2, 4 full S2, 3 full S3) |
| Total warnings resolved | 8 |
| Remaining warnings | 1 (bun.lock detection — backlog) |
| Observer-lite runs | 2 (S2 initial, S3 initial) |
| Observer-full runs | 3 (S2 pre+final, S3 pre-task-2) |

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

## Session Log — 2026-02-20 (Session 3: Hardening + Bun CI + Examples)

### Completed
- [x] **Task 1: Fix file guards** — Added `if [[ -f ... ]]` guards to ALL 27 cp commands in setup-tests.sh (was 7 unguarded, expanded to comprehensive coverage)
- [x] **Task 2: Bun CI template** — Created `templates/ci/github-actions-bun.yml` (lint → test → build), added `bun)` case to `copy_ci_templates()`, updated QUICK_START.md
- [x] **Task 3: Detection verification** — 7/7 dry-run scenarios PASS. Real copy test revealed critical bug: `detect_project_type()` debug echo polluted stdout, breaking all non-dry-run dispatches. Fixed by redirecting to stderr.
- [x] **Task 4: Bun examples** — Created `http-server.test.ts` (Bun.serve() patterns) and `sqlite.test.ts` (bun:sqlite CRUD/transactions). Fixed observer-flagged issues: `require("fs")` → ESM import, unused imports in setup.ts.
- [x] **Observer runs** — observer-lite (initial scan), observer-full (pre-task-2 with contract review)
- [x] **Security sweep** — PASS (no secrets, no .env files)

### Bug Discovery
**Critical bug found during Task 3 verification:** `detect_project_type()` at line 106 echoed "Detecting project type..." to stdout. When captured via `$(detect_project_type "$target_dir")`, this text was prepended to the actual type ("Detecting project type...\nbun"), causing the `case` dispatch to silently fall through. This means **all non-dry-run copy operations were broken** since the function was written. Only dry-run mode worked because it exits before the case statement. Fixed by redirecting the echo to stderr (`>&2`).

### Observer Findings Summary (Session 3)
| Source | BLOCKERs | WARNINGs | INFOs |
|--------|----------|----------|-------|
| observer-lite (initial) | 0 | 2 | 3 |
| observer-full (pre-task-2) | 0 | 3 | 4 |
| Total unique | 0 | 5 | 7 |
| Resolved during implementation | 0 | 5 | 2 |
| Remaining (backlog) | 0 | 0 | 5 |

### Remaining Observer Items (backlog)
- [INFO] Root `vitest.config.ts` and `package.json` are duplicates of `templates/frontend/` counterparts
- [INFO] Root `pyproject.toml` targets >=3.11 vs template >=3.10
- [INFO] `conftest.py:68` has `import os` in commented-out example code
- [INFO] `detect_project_type()` only checks `bun.lockb`, not `bun.lock` (Bun v1.1+ uses text lock file)
- [INFO] `copy_ci_templates()` case branches lack inline comments describing which template is copied

### Metrics
- Files created: 5 (2 examples, 1 CI template, 2 contracts)
- Files modified: 4 (setup-tests.sh, QUICK_START.md, example.test.ts, setup.ts)
- Lines added: ~870
- Commits: 4 (`b14df5e` guards, `3f78209` CI template, `79f1e07` detection fix, `a5911bc` examples)

## Next Priorities

1. Add `bun.lock` (text format) to `detect_project_type()` alongside `bun.lockb` (backlog from observer-full)
2. Consider symlinking or documenting root config duplicates (`vitest.config.ts`, `package.json`)
3. Add inline comments to `copy_ci_templates()` case branches
4. Run HTTP server + SQLite tests with actual Bun runtime (Bun not installed on this machine)
5. Add Next.js CI template variant (if needed)
6. Add test coverage for `setup-tests.sh` (shell test framework or BATS)
