# Coding Rules — testing-setup

## Stack
Template project: Python pytest, Bun test, Vitest, Playwright; TypeScript + Vite for frontend template

## Rules
- Templates must work standalone — no cross-template dependencies
- Python templates: pytest + pytest-asyncio, ruff formatting, mypy type checks
- Frontend templates: Vitest with Testing Library and MSW for API mocking
- E2E templates: Playwright with page object pattern
- setup-tests.sh must auto-detect project type before applying templates
- CI templates must use GitHub Actions matrix for multi-version testing
- Keep template configs minimal — users extend them, not replace them
