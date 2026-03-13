#!/usr/bin/env bash
set -euo pipefail

echo "==> testing-setup init"

echo "==> Installing Node dependencies"
npm install

echo "==> Creating Python virtual environment"
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]" 2>/dev/null || true

echo "==> Done. Usage:"
echo "  ./setup-tests.sh /path/to/project   — scaffold tests for another project"
echo "  npm test                             — run frontend template tests"
echo "  source .venv/bin/activate && pytest  — run Python template tests"
