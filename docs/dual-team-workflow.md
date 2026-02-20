# Dual-Team Workflow Reference

> Full architecture reference for the testing-setup project's observer system.
> Adapted from workflow-orchestrator v2.0.0 reference docs.

---

## Overview

Every development session runs with an observer layer that watches for quality issues, scope drift, and architectural problems:

```
                    ┌─────────────────────┐
                    │    ORCHESTRATOR      │
                    │  (main Claude session│
                    │   reading CLAUDE.md) │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
    ┌──────────────────┐              ┌──────────────────┐
    │   BUILDER WORK   │              │  OBSERVER AGENT  │
    │  (main session   │              │ (subagent via    │
    │   doing the task)│              │  Task tool)      │
    └──────────────────┘              └──────────────────┘
```

**Key principle:** Observers are non-negotiable. They always run, scaled to task scope. The tension between building fast and building correct produces better code.

---

## Scope Classification

| Scope | Criteria | Observer | Examples |
|-------|----------|----------|----------|
| **MINIMAL** | Typos, comments, config tweaks | Skip | "fix typo in README" |
| **SMALL** | 1-3 files, no new deps | observer-lite (Haiku) | "add test for utils.tsx" |
| **STANDARD** | 4-10 files, or new deps | observer-full (Sonnet) | "add Bun testing template" |
| **FULL** | >10 files, new architecture | observer-full + contract | "add Playwright template suite" |

### Scope Escalation Rules

Auto-upgrade from Lite to Full when:
- **>5 files modified** (PostToolUse hook detects this)
- **New dependency added** to package.json or pyproject.toml
- **Scope expands** beyond original task description

---

## Observer Agents

### observer-lite (Haiku — Fast & Cheap)

**Cost:** <$0.05 per run | **Time:** <60 seconds | **When:** SMALL scope tasks

Runs 4 quick checks:
1. **Secrets scan** — grep for API_KEY, SECRET, PASSWORD, sk-, ghp_, AKIA
2. **Test gap detection** — new functions without test files
3. **Silent failures** — empty catch/except blocks
4. **Debt markers** — TODO/FIXME/HACK count

**Spawn:**
```
Task tool → subagent_type: "observer-lite"
```

Writes to: `.claude/OBSERVER_QUALITY.md`

### observer-full (Sonnet — Thorough)

**Cost:** ~$0.50-2.00 per run | **Time:** <3 minutes | **When:** STANDARD/FULL scope tasks

Runs all 7 drift detection patterns + devil's advocate stance:
1. Agent drift (scope violation)
2. Tech debt accumulation
3. Test gaps
4. Scope creep
5. Import bloat
6. Silent failures
7. Contract drift

**Spawn:**
```
Task tool → subagent_type: "observer-full"
```

Writes to: `.claude/OBSERVER_QUALITY.md`, `.claude/OBSERVER_ARCH.md`, `.claude/OBSERVER_ALERTS.md`

---

## 7 Drift Detection Patterns

### 1. Agent Drift (Scope Violation)

Detect when work goes outside the stated scope boundaries.

```bash
git diff --name-only main...HEAD
# Compare against contract scope in .claude/contracts/
```

**Severity:** BLOCKER if touching files explicitly marked OUT OF SCOPE

### 2. Tech Debt Accumulation

Detect growing TODO/FIXME/HACK comments.

```bash
# Count debt markers in changed files
git diff --name-only main...HEAD | xargs grep -Hn "TODO\|FIXME\|HACK\|XXX\|TEMP"
```

**Severity:** WARNING if count increases by >3 in a session

### 3. Test Gap

Detect new functions/exports without corresponding tests.

- Find new exported functions via git diff
- Check for corresponding test files
- **WARNING** for utilities, **BLOCKER** for API endpoints

### 4. Scope Creep

Detect features being built that aren't in the contract.

- Compare actual endpoints/exports vs contract definition
- **BLOCKER** — new endpoints MUST be in contract first

### 5. Import Bloat

Detect unused imports and redundant dependencies.

- Find imported names not used in file body
- **INFO** — log to backlog

### 6. Silent Failures

Detect empty catch blocks and swallowed errors.

- Empty catch blocks, bare except in Python
- **WARNING** — silent failures mask bugs

### 7. Contract Drift

Detect when response shapes diverge from the contract definition.

- Extract response types from contract
- Compare against actual return statements
- **BLOCKER** if response shape doesn't match contract

---

## Observer Output Format

All findings use a consistent format:

```
[SEVERITY] — file:line — description — fix

Examples:
[BLOCKER] — src/api/widgets.ts:45 — POST /api/widgets returns { widget_id } but contract says { id } — rename to match contract
[WARNING] — src/utils/helpers.ts:12 — TODO: implement proper validation — write validation or remove TODO
[INFO] — src/lib/cache.ts:3 — unused import: Redis — remove import
```

### Severity Definitions

| Severity | Meaning | Action |
|----------|---------|--------|
| BLOCKER | Stops work | Must fix before next commit |
| WARNING | Should fix | Fix before merge, or add to backlog with justification |
| INFO | Nice to have | Log to backlog, fix when convenient |

---

## Hook Enforcement

Two hooks in `.claude/settings.local.json` mechanically enforce observer activation:

### PreToolUse Hook (Write|Edit|Bash)

Before any code-changing tool, checks if `.claude/OBSERVER_QUALITY.md` still contains `_not yet run_` (the template placeholder). If yes, prints:

```
** OBSERVER NOT ACTIVE ** The observer has not run yet this session.
```

This appears in the tool response, forcing Claude to acknowledge it.

### PostToolUse Hook (Write|Edit)

After file writes, counts modified files via `git diff --name-only`. If >5:

```
** SCOPE ESCALATION ** N files modified.
```

Reminds to upgrade from observer-lite to observer-full.

---

## Feature Contracts

Before ANY feature implementation at STANDARD or FULL scope, define a contract in `.claude/contracts/`:

```markdown
## Feature Contract: [NAME]

### Scope Boundaries
- IN SCOPE: [what will be changed]
- OUT OF SCOPE: [what will NOT be changed]

### Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Observer Checkpoints
- [ ] Observer approves contract before coding starts
- [ ] Observer runs after implementation
```

The contract is the **single source of truth**. Observers measure drift against it.

---

## Devil's Advocate Protocol

The observer-full agent maintains an adversarial stance:

### For Every New File
- Does it need to exist? Could existing code handle this?
- Does its location follow project conventions?

### For Every New Function
- Is there a simpler way to achieve this?
- Does it duplicate logic that exists elsewhere?

### For Every New Dependency
- Is it necessary? What's the maintenance cost?
- Could a simpler built-in solution work?

### When to Escalate vs Log

| Situation | Action |
|-----------|--------|
| Contract violation | ESCALATE immediately |
| Security gap | ESCALATE immediately |
| Scope creep | ESCALATE immediately |
| Missing tests for endpoint | LOG as WARNING |
| TODO comment added | LOG as INFO |
| Style inconsistency | LOG as INFO |
| Unnecessary dependency | LOG as WARNING |

---

## File Structure

```
.claude/
├── settings.local.json        # Hook enforcement config
├── agents/
│   ├── observer-lite.md       # Haiku — 4 quick checks
│   └── observer-full.md       # Sonnet — 7 patterns + devil's advocate
├── OBSERVER_QUALITY.md        # Code quality findings (ephemeral)
├── OBSERVER_ARCH.md           # Architecture findings (ephemeral)
├── OBSERVER_ALERTS.md         # Active blockers (ephemeral)
├── contracts/                 # Feature contracts (tracked)
│   └── .gitkeep
└── archive/                   # Archived observer reports
    └── .gitkeep
```

**Tracked in git:** agents/, contracts/.gitkeep, archive/.gitkeep, settings.local.json
**Gitignored:** OBSERVER_*.md, archive/*.md, daily-cost.json

---

## Model Cost Reference

| Model | Input/1M | Output/1M | Used For |
|-------|----------|-----------|----------|
| Claude Haiku 4.5 | $1.00 | $5.00 | observer-lite, quick checks |
| Claude Sonnet 4.6 | $3.00 | $15.00 | observer-full, implementation |
| Claude Opus 4.6 | $5.00 | $25.00 | Architecture decisions only |

**Budget tip:** observer-lite adds ~$0.03-0.05 per session. observer-full adds ~$0.50-2.00. The observer cost catches issues that would cost 5-10x more to fix later.

---

## Session Lifecycle

```
SESSION START
  └→ Read CLAUDE.md (observer protocol is FIRST section)
  └→ Classify task scope (MINIMAL/SMALL/STANDARD/FULL)
  └→ Spawn appropriate observer
      ├→ MINIMAL: skip observer
      ├→ SMALL: observer-lite
      ├→ STANDARD: observer-full
      └→ FULL: observer-full + require contract

DURING WORK
  └→ PreToolUse hook checks observer status on every Write/Edit/Bash
  └→ PostToolUse hook monitors file count for scope escalation
  └→ Observer writes findings to .claude/OBSERVER_*.md

SESSION END
  └→ Review observer findings
  └→ Resolve any open BLOCKERs
  └→ Archive reports if desired
  └→ Update PROJECT_CONTEXT.md
```

---

## See Also

- `CLAUDE.md` — Mandatory observer protocol (enforcement doc)
- `.claude/agents/observer-lite.md` — Lightweight observer definition
- `.claude/agents/observer-full.md` — Full observer definition
- `.claude/settings.local.json` — Hook configuration
- `PROJECT_CONTEXT.md` — Session state tracking
