# CLAUDE.md — testing-setup

---

## MANDATORY: Observer Protocol

**You MUST follow this protocol before writing ANY code.** No exceptions. No rationalizing.

### Step 1: Classify Task Scope

| Scope | Criteria | Observer Required |
|-------|----------|-------------------|
| **MINIMAL** | Typos, comments, single config tweak | None |
| **SMALL** | 1-3 files changed, no new dependencies | observer-lite (Haiku) |
| **STANDARD** | 4-10 files, or any new dependency | observer-full (Sonnet) |
| **FULL** | >10 files, new architecture, new patterns | observer-full + feature contract |

### Step 2: Spawn Observer (if SMALL or above)

```
# For SMALL scope:
Task tool → subagent_type: "observer-lite"
  prompt: "Run quality checks on the testing-setup codebase. Focus on [relevant area]."

# For STANDARD/FULL scope:
Task tool → subagent_type: "observer-full"
  prompt: "Run full drift detection on testing-setup. The current task is: [describe task]."
```

### Step 3: For FULL scope — Create Feature Contract First

Before coding, create `.claude/contracts/[feature-name].md`:
- Define IN SCOPE and OUT OF SCOPE boundaries
- List success criteria
- Get observer approval before writing code

### Step 4: Verify Observer Ran

Before making your first code change, confirm:
- [ ] `.claude/OBSERVER_QUALITY.md` has a real date (not `_not yet run_`)
- [ ] Scope classification matches the task complexity

**If the PreToolUse hook prints `** OBSERVER NOT ACTIVE **`, STOP and spawn the observer.**

### Scope Escalation Rule

If during work you hit ANY of these triggers, upgrade from Lite to Full:
- **>5 files modified** (the PostToolUse hook will remind you)
- **New dependency added** to package.json or pyproject.toml
- **Task scope expanded** beyond original description

---

## Project Overview

**testing-setup** — Testing infrastructure templates and setup scripts.

Provides ready-to-use testing configurations for:
- Python (pytest + pytest-asyncio)
- React + Vite (Vitest + Testing Library + MSW)
- Next.js (Vitest or Jest)
- Playwright (E2E)
- GitHub Actions CI/CD workflows

### Directory Structure

```
testing-setup/
├── CLAUDE.md                  # This file (observer enforcement)
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

---

## Dual-Team Workflow

This project uses a **dual-team observer pattern** where an observer agent runs alongside the main work to catch quality issues in real-time.

### Quality Gates

| Gate | Check | Enforced By |
|------|-------|-------------|
| Pre-code | Observer spawned | PreToolUse hook |
| During code | Scope escalation | PostToolUse hook |
| Pre-merge | No open BLOCKERs | OBSERVER_ALERTS.md |

### Observer Cost Guide

| Observer | Model | Cost | When |
|----------|-------|------|------|
| observer-lite | Haiku 4.5 | ~$0.03-0.05 | SMALL scope |
| observer-full | Sonnet 4.6 | ~$0.50-2.00 | STANDARD/FULL scope |

For full workflow details, see `docs/dual-team-workflow.md`.
