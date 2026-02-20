# Feature Contract: Bun CI Template

**Date:** 2026-02-20
**Session:** 3, Task 2
**Scope:** STANDARD (1 new file + 2 modified files)

---

## Deliverables

1. `templates/ci/github-actions-bun.yml` — Bun CI workflow for GitHub Actions
2. `setup-tests.sh` — add `bun)` case to `copy_ci_templates()`
3. `QUICK_START.md` — add Bun to CI workflow section

## Success Criteria

- [ ] CI template follows conventions from existing python/frontend templates
- [ ] Uses `oven-sh/setup-bun@v2` for Bun setup
- [ ] Includes lint, test, build jobs
- [ ] Concurrency and path filtering match existing patterns
- [ ] `copy_ci_templates()` handles `bun` project type
- [ ] QUICK_START.md references the new template

## Scope Boundaries

### IN SCOPE
- Bun CI workflow (lint → test → build)
- setup-tests.sh CI handler for Bun
- QUICK_START.md CI section update

### OUT OF SCOPE
- E2E testing in Bun CI
- Multi-runtime matrix (Bun + Node)
- Bun version matrix (single latest version)
- Deployment steps

## Conventions to Follow

From existing CI templates:
- Triggers: push/PR on main/master/develop + workflow_dispatch
- Concurrency: cancel-in-progress: true
- Path filters matching relevant file types
- Upload artifacts with actions/upload-artifact@v4
- Coverage reporting
