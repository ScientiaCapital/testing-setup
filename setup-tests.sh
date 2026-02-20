#!/bin/bash

# =============================================================================
# Universal Testing Setup Script
# =============================================================================
#
# This script sets up testing infrastructure for any project type.
# It auto-detects the project type and copies the appropriate templates.
#
# Usage:
#   ./setup-tests.sh [target-directory]
#
# Examples:
#   ./setup-tests.sh                    # Setup in current directory
#   ./setup-tests.sh /path/to/project   # Setup in specified directory
#   ./setup-tests.sh --help             # Show help
#
# Supported Project Types:
#   - Python (pyproject.toml, setup.py, requirements.txt)
#   - Bun (bunfig.toml, bun.lockb)
#   - React + Vite (vite.config.ts)
#   - Next.js (next.config.js, next.config.mjs)
#   - Full-stack (both Python backend and frontend)
#
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory (where templates are located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="${SCRIPT_DIR}/templates"

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}→${NC} $1"
}

show_help() {
    cat << EOF
Universal Testing Setup Script

USAGE:
    ./setup-tests.sh [OPTIONS] [TARGET_DIRECTORY]

OPTIONS:
    -h, --help          Show this help message
    -f, --force         Overwrite existing files
    -n, --dry-run       Show what would be done without making changes
    -t, --type TYPE     Force project type (python|bun|vite|nextjs|e2e)
    -c, --ci            Also setup CI/CD workflows
    --no-msw            Skip MSW setup for frontend projects

EXAMPLES:
    ./setup-tests.sh                        # Auto-detect and setup
    ./setup-tests.sh ~/projects/my-app      # Setup specific project
    ./setup-tests.sh -t nextjs              # Force Next.js templates
    ./setup-tests.sh -f -c                  # Force overwrite with CI

SUPPORTED PROJECT TYPES:
    python    Python projects (pytest, coverage, mypy)
    bun       Bun projects (bun:test, built-in runner)
    vite      React + Vite projects (Vitest, Testing Library)
    nextjs    Next.js projects (Vitest or Jest, Testing Library)
    e2e       E2E testing only (Playwright)

EOF
}

# =============================================================================
# Project Detection
# =============================================================================

detect_project_type() {
    local dir="$1"

    echo "Detecting project type..." >&2

    # Check for Next.js
    if [[ -f "${dir}/next.config.js" ]] || [[ -f "${dir}/next.config.mjs" ]] || [[ -f "${dir}/next.config.ts" ]]; then
        echo "nextjs"
        return
    fi

    # Check for Bun
    if [[ -f "${dir}/bunfig.toml" ]] || [[ -f "${dir}/bun.lockb" ]]; then
        echo "bun"
        return
    fi

    # Check for React + Vite
    if [[ -f "${dir}/vite.config.ts" ]] || [[ -f "${dir}/vite.config.js" ]]; then
        echo "vite"
        return
    fi

    # Check for Python
    if [[ -f "${dir}/pyproject.toml" ]] || [[ -f "${dir}/setup.py" ]] || [[ -f "${dir}/requirements.txt" ]]; then
        echo "python"
        return
    fi

    # Check for package.json (generic Node.js)
    if [[ -f "${dir}/package.json" ]]; then
        # Could be React without Vite config, assume vite
        echo "vite"
        return
    fi

    echo "unknown"
}

detect_frontend_dir() {
    local dir="$1"

    # Common frontend directory names
    for frontend_dir in "frontend" "client" "web" "app" "ui"; do
        if [[ -d "${dir}/${frontend_dir}" ]]; then
            if [[ -f "${dir}/${frontend_dir}/package.json" ]]; then
                echo "${frontend_dir}"
                return
            fi
        fi
    done

    echo ""
}

detect_backend_dir() {
    local dir="$1"

    # Common backend directory names
    for backend_dir in "backend" "server" "api" "src"; do
        if [[ -d "${dir}/${backend_dir}" ]]; then
            if [[ -f "${dir}/${backend_dir}/pyproject.toml" ]] || [[ -f "${dir}/${backend_dir}/requirements.txt" ]]; then
                echo "${backend_dir}"
                return
            fi
        fi
    done

    echo ""
}

# =============================================================================
# Copy Functions
# =============================================================================

copy_python_templates() {
    local target="$1"
    local force="$2"

    print_header "Setting up Python Testing"

    # Create tests directory structure
    mkdir -p "${target}/tests/unit"
    mkdir -p "${target}/tests/integration"
    print_success "Created tests directory structure"

    # Copy pytest.ini or create from pyproject.toml
    if [[ ! -f "${target}/pytest.ini" ]] && [[ ! -f "${target}/pyproject.toml" ]]; then
        if [[ -f "${TEMPLATES_DIR}/python/pyproject.toml" ]]; then
            print_info "Creating pyproject.toml with test configuration..."
            cp "${TEMPLATES_DIR}/python/pyproject.toml" "${target}/pyproject.toml"
            print_success "Created pyproject.toml"
        fi
    elif [[ -f "${target}/pyproject.toml" ]]; then
        print_warning "pyproject.toml exists - please add pytest config manually from templates/python/pyproject.toml"
    fi

    # Copy conftest.py
    if [[ ! -f "${target}/tests/conftest.py" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/python/tests/conftest.py" ]]; then
            cp "${TEMPLATES_DIR}/python/tests/conftest.py" "${target}/tests/conftest.py"
            print_success "Created tests/conftest.py"
        fi
    fi

    # Copy Supabase integration test example
    if [[ ! -f "${target}/tests/integration/test_supabase.py" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/python/tests/integration/test_supabase.py" ]]; then
            cp "${TEMPLATES_DIR}/python/tests/integration/test_supabase.py" "${target}/tests/integration/test_supabase.py"
            print_success "Created tests/integration/test_supabase.py"
        fi
    fi

    # Create __init__.py files
    touch "${target}/tests/__init__.py"
    touch "${target}/tests/unit/__init__.py"
    touch "${target}/tests/integration/__init__.py"

    echo ""
    print_info "Next steps:"
    echo "  1. Install dev dependencies: pip install -e '.[dev]' or pip install pytest pytest-cov"
    echo "  2. Run tests: pytest"
    echo "  3. Run with coverage: pytest --cov=src"
}

copy_vite_templates() {
    local target="$1"
    local force="$2"
    local skip_msw="$3"

    print_header "Setting up React + Vite Testing"

    # Create test directories
    mkdir -p "${target}/src/test"
    print_success "Created src/test directory"

    # Copy vitest.config.ts
    if [[ ! -f "${target}/vitest.config.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/frontend/vitest.config.ts" ]]; then
            cp "${TEMPLATES_DIR}/frontend/vitest.config.ts" "${target}/vitest.config.ts"
            print_success "Created vitest.config.ts"
        fi
    else
        print_warning "vitest.config.ts exists - skipping"
    fi

    # Copy setup.ts
    if [[ ! -f "${target}/src/test/setup.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/frontend/src/test/setup.ts" ]]; then
            cp "${TEMPLATES_DIR}/frontend/src/test/setup.ts" "${target}/src/test/setup.ts"
            print_success "Created src/test/setup.ts"
        fi
    fi

    # Copy utils.tsx
    if [[ ! -f "${target}/src/test/utils.tsx" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/frontend/src/test/utils.tsx" ]]; then
            cp "${TEMPLATES_DIR}/frontend/src/test/utils.tsx" "${target}/src/test/utils.tsx"
            print_success "Created src/test/utils.tsx"
        fi
    fi

    # Copy MSW mocks (optional)
    if [[ "$skip_msw" != "true" ]]; then
        mkdir -p "${target}/src/test/mocks"
        if [[ ! -f "${target}/src/test/mocks/handlers.ts" ]] || [[ "$force" == "true" ]]; then
            if [[ -f "${TEMPLATES_DIR}/frontend/src/test/mocks/handlers.ts" ]]; then
                cp "${TEMPLATES_DIR}/frontend/src/test/mocks/handlers.ts" "${target}/src/test/mocks/handlers.ts"
                print_success "Created src/test/mocks/handlers.ts"
            fi
            if [[ -f "${TEMPLATES_DIR}/frontend/src/test/mocks/server.ts" ]]; then
                cp "${TEMPLATES_DIR}/frontend/src/test/mocks/server.ts" "${target}/src/test/mocks/server.ts"
                print_success "Created src/test/mocks/server.ts"
            fi
        fi
    fi

    echo ""
    print_info "Next steps:"
    echo "  1. Install dependencies: npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom msw"
    echo "  2. Add test script to package.json: \"test\": \"vitest\""
    echo "  3. Run tests: npm test"
}

copy_bun_templates() {
    local target="$1"
    local force="$2"

    print_header "Setting up Bun Testing"

    # Create tests directory
    mkdir -p "${target}/tests"
    print_success "Created tests directory"

    # Copy bunfig.toml
    if [[ ! -f "${target}/bunfig.toml" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/bun/bunfig.toml" ]]; then
            cp "${TEMPLATES_DIR}/bun/bunfig.toml" "${target}/bunfig.toml"
            print_success "Created bunfig.toml"
        fi
    else
        print_warning "bunfig.toml exists - skipping"
    fi

    # Copy package.json (only if no existing one)
    if [[ ! -f "${target}/package.json" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/bun/package.json" ]]; then
            cp "${TEMPLATES_DIR}/bun/package.json" "${target}/package.json"
            print_success "Created package.json"
        fi
    else
        print_warning "package.json exists - please add bun test scripts manually"
    fi

    # Copy test files
    if [[ ! -f "${target}/tests/setup.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/bun/tests/setup.ts" ]]; then
            cp "${TEMPLATES_DIR}/bun/tests/setup.ts" "${target}/tests/setup.ts"
            print_success "Created tests/setup.ts"
        fi
    fi

    if [[ ! -f "${target}/tests/utils.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/bun/tests/utils.ts" ]]; then
            cp "${TEMPLATES_DIR}/bun/tests/utils.ts" "${target}/tests/utils.ts"
            print_success "Created tests/utils.ts"
        fi
    fi

    if [[ ! -f "${target}/tests/example.test.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/bun/tests/example.test.ts" ]]; then
            cp "${TEMPLATES_DIR}/bun/tests/example.test.ts" "${target}/tests/example.test.ts"
            print_success "Created tests/example.test.ts"
        fi
    fi

    echo ""
    print_info "Next steps:"
    echo "  1. Install Bun (if not installed): curl -fsSL https://bun.sh/install | bash"
    echo "  2. Install dependencies: bun install"
    echo "  3. Run tests: bun test"
    echo "  4. Run with coverage: bun test --coverage"
}

copy_nextjs_templates() {
    local target="$1"
    local force="$2"
    local skip_msw="$3"

    print_header "Setting up Next.js Testing"

    # Create test directories
    mkdir -p "${target}/src/test"
    print_success "Created src/test directory"

    # Detect preferred test runner (check for existing jest config)
    local use_jest=false
    if [[ -f "${target}/jest.config.js" ]] || [[ -f "${target}/jest.config.ts" ]]; then
        use_jest=true
        print_info "Detected existing Jest configuration"
    fi

    if [[ "$use_jest" == "true" ]]; then
        # Copy Jest config
        if [[ ! -f "${target}/jest.config.js" ]] || [[ "$force" == "true" ]]; then
            if [[ -f "${TEMPLATES_DIR}/nextjs/jest.config.js" ]]; then
                cp "${TEMPLATES_DIR}/nextjs/jest.config.js" "${target}/jest.config.js"
                print_success "Created jest.config.js"
            fi
        fi
    else
        # Copy Vitest config
        if [[ ! -f "${target}/vitest.config.ts" ]] || [[ "$force" == "true" ]]; then
            if [[ -f "${TEMPLATES_DIR}/nextjs/vitest.config.ts" ]]; then
                cp "${TEMPLATES_DIR}/nextjs/vitest.config.ts" "${target}/vitest.config.ts"
                print_success "Created vitest.config.ts"
            fi
        fi
    fi

    # Copy setup.ts
    if [[ ! -f "${target}/src/test/setup.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/nextjs/src/test/setup.ts" ]]; then
            cp "${TEMPLATES_DIR}/nextjs/src/test/setup.ts" "${target}/src/test/setup.ts"
            print_success "Created src/test/setup.ts"
        fi
    fi

    # Copy utils.tsx
    if [[ ! -f "${target}/src/test/utils.tsx" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/nextjs/src/test/utils.tsx" ]]; then
            cp "${TEMPLATES_DIR}/nextjs/src/test/utils.tsx" "${target}/src/test/utils.tsx"
            print_success "Created src/test/utils.tsx"
        fi
    fi

    # Copy example tests
    mkdir -p "${target}/src/test/examples"
    if [[ ! -f "${target}/src/test/examples/api-route.test.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/nextjs/examples/api-route.test.ts" ]]; then
            cp "${TEMPLATES_DIR}/nextjs/examples/api-route.test.ts" "${target}/src/test/examples/api-route.test.ts"
            print_success "Created src/test/examples/api-route.test.ts"
        fi
        if [[ -f "${TEMPLATES_DIR}/nextjs/examples/page.test.tsx" ]]; then
            cp "${TEMPLATES_DIR}/nextjs/examples/page.test.tsx" "${target}/src/test/examples/page.test.tsx"
            print_success "Created src/test/examples/page.test.tsx"
        fi
    fi

    # Copy MSW mocks (optional)
    if [[ "$skip_msw" != "true" ]]; then
        mkdir -p "${target}/src/test/mocks"
        if [[ ! -f "${target}/src/test/mocks/handlers.ts" ]] || [[ "$force" == "true" ]]; then
            if [[ -f "${TEMPLATES_DIR}/frontend/src/test/mocks/handlers.ts" ]]; then
                cp "${TEMPLATES_DIR}/frontend/src/test/mocks/handlers.ts" "${target}/src/test/mocks/handlers.ts"
                print_success "Created src/test/mocks/handlers.ts"
            fi
            if [[ -f "${TEMPLATES_DIR}/frontend/src/test/mocks/server.ts" ]]; then
                cp "${TEMPLATES_DIR}/frontend/src/test/mocks/server.ts" "${target}/src/test/mocks/server.ts"
                print_success "Created src/test/mocks/server.ts"
            fi
        fi
    fi

    echo ""
    print_info "Next steps:"
    if [[ "$use_jest" == "true" ]]; then
        echo "  1. Install dependencies: npm install -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom msw"
        echo "  2. Add test script: \"test\": \"jest\""
    else
        echo "  1. Install dependencies: npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom msw"
        echo "  2. Add test script: \"test\": \"vitest\""
    fi
    echo "  3. Run tests: npm test"
}

copy_playwright_templates() {
    local target="$1"
    local force="$2"

    print_header "Setting up Playwright E2E Testing"

    # Create directories
    mkdir -p "${target}/tests"
    mkdir -p "${target}/fixtures"
    print_success "Created test directories"

    # Copy playwright.config.ts
    if [[ ! -f "${target}/playwright.config.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/playwright/playwright.config.ts" ]]; then
            cp "${TEMPLATES_DIR}/playwright/playwright.config.ts" "${target}/playwright.config.ts"
            print_success "Created playwright.config.ts"
        fi
    else
        print_warning "playwright.config.ts exists - skipping"
    fi

    # Copy example test
    if [[ ! -f "${target}/tests/example.spec.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/playwright/tests/example.spec.ts" ]]; then
            cp "${TEMPLATES_DIR}/playwright/tests/example.spec.ts" "${target}/tests/example.spec.ts"
            print_success "Created tests/example.spec.ts"
        fi
    fi

    # Copy db-seed fixture
    if [[ ! -f "${target}/fixtures/db-seed.ts" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/playwright/fixtures/db-seed.ts" ]]; then
            cp "${TEMPLATES_DIR}/playwright/fixtures/db-seed.ts" "${target}/fixtures/db-seed.ts"
            print_success "Created fixtures/db-seed.ts"
        fi
    fi

    echo ""
    print_info "Next steps:"
    echo "  1. Install Playwright: npm install -D @playwright/test"
    echo "  2. Install browsers: npx playwright install"
    echo "  3. Run tests: npx playwright test"
    echo "  4. Open UI mode: npx playwright test --ui"
}

copy_ci_templates() {
    local target="$1"
    local project_type="$2"
    local force="$3"

    print_header "Setting up CI/CD Workflows"

    mkdir -p "${target}/.github/workflows"

    case "$project_type" in
        python)
            if [[ ! -f "${target}/.github/workflows/test.yml" ]] || [[ "$force" == "true" ]]; then
                if [[ -f "${TEMPLATES_DIR}/ci/github-actions-python.yml" ]]; then
                    cp "${TEMPLATES_DIR}/ci/github-actions-python.yml" "${target}/.github/workflows/test.yml"
                    print_success "Created .github/workflows/test.yml (Python)"
                fi
            fi
            ;;
        bun)
            if [[ ! -f "${target}/.github/workflows/test.yml" ]] || [[ "$force" == "true" ]]; then
                if [[ -f "${TEMPLATES_DIR}/ci/github-actions-bun.yml" ]]; then
                    cp "${TEMPLATES_DIR}/ci/github-actions-bun.yml" "${target}/.github/workflows/test.yml"
                    print_success "Created .github/workflows/test.yml (Bun)"
                fi
            fi
            ;;
        vite|nextjs)
            if [[ ! -f "${target}/.github/workflows/test.yml" ]] || [[ "$force" == "true" ]]; then
                if [[ -f "${TEMPLATES_DIR}/ci/github-actions-frontend.yml" ]]; then
                    cp "${TEMPLATES_DIR}/ci/github-actions-frontend.yml" "${target}/.github/workflows/test.yml"
                    print_success "Created .github/workflows/test.yml (Frontend)"
                fi
            fi
            ;;
    esac

    # Always offer E2E workflow
    if [[ ! -f "${target}/.github/workflows/e2e.yml" ]] || [[ "$force" == "true" ]]; then
        if [[ -f "${TEMPLATES_DIR}/ci/github-actions-e2e.yml" ]]; then
            cp "${TEMPLATES_DIR}/ci/github-actions-e2e.yml" "${target}/.github/workflows/e2e.yml"
            print_success "Created .github/workflows/e2e.yml"
        fi
    fi
}

# =============================================================================
# Main Script
# =============================================================================

main() {
    local target_dir="${PWD}"
    local force=false
    local dry_run=false
    local setup_ci=false
    local skip_msw=false
    local forced_type=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -f|--force)
                force=true
                shift
                ;;
            -n|--dry-run)
                dry_run=true
                shift
                ;;
            -c|--ci)
                setup_ci=true
                shift
                ;;
            -t|--type)
                forced_type="$2"
                shift 2
                ;;
            --no-msw)
                skip_msw=true
                shift
                ;;
            *)
                if [[ -d "$1" ]]; then
                    target_dir="$1"
                else
                    print_error "Unknown option or invalid directory: $1"
                    exit 1
                fi
                shift
                ;;
        esac
    done

    # Resolve to absolute path
    target_dir="$(cd "$target_dir" && pwd)"

    print_header "Universal Testing Setup"
    print_info "Target directory: ${target_dir}"

    # Check templates exist
    if [[ ! -d "$TEMPLATES_DIR" ]]; then
        print_error "Templates directory not found: $TEMPLATES_DIR"
        exit 1
    fi

    # Detect or use forced type
    local project_type
    if [[ -n "$forced_type" ]]; then
        project_type="$forced_type"
        print_info "Using forced project type: ${project_type}"
    else
        project_type=$(detect_project_type "$target_dir")
        print_info "Detected project type: ${project_type}"
    fi

    # Check for monorepo / full-stack structure
    local frontend_dir=$(detect_frontend_dir "$target_dir")
    local backend_dir=$(detect_backend_dir "$target_dir")

    if [[ -n "$frontend_dir" ]] && [[ -n "$backend_dir" ]]; then
        print_info "Detected full-stack project structure"
        print_info "  Frontend: ${frontend_dir}/"
        print_info "  Backend: ${backend_dir}/"
    fi

    # Dry run mode
    if [[ "$dry_run" == "true" ]]; then
        echo ""
        print_warning "DRY RUN - No changes will be made"
        echo ""
        echo "Would perform the following actions:"
        echo "  - Project type: ${project_type}"
        echo "  - Target: ${target_dir}"
        [[ -n "$frontend_dir" ]] && echo "  - Setup frontend in: ${frontend_dir}/"
        [[ -n "$backend_dir" ]] && echo "  - Setup backend in: ${backend_dir}/"
        [[ "$setup_ci" == "true" ]] && echo "  - Setup CI/CD workflows"
        exit 0
    fi

    # Setup based on project type
    case "$project_type" in
        python)
            copy_python_templates "$target_dir" "$force"
            ;;
        bun)
            copy_bun_templates "$target_dir" "$force"
            ;;
        vite)
            copy_vite_templates "$target_dir" "$force" "$skip_msw"
            ;;
        nextjs)
            copy_nextjs_templates "$target_dir" "$force" "$skip_msw"
            ;;
        e2e)
            copy_playwright_templates "$target_dir" "$force"
            ;;
        unknown)
            print_error "Could not detect project type."
            echo ""
            echo "Please specify the type manually:"
            echo "  ./setup-tests.sh -t python     # For Python projects"
            echo "  ./setup-tests.sh -t bun        # For Bun projects"
            echo "  ./setup-tests.sh -t vite       # For React + Vite"
            echo "  ./setup-tests.sh -t nextjs     # For Next.js"
            echo "  ./setup-tests.sh -t e2e        # For E2E testing only"
            exit 1
            ;;
    esac

    # Handle full-stack structure
    if [[ -n "$frontend_dir" ]] && [[ "$project_type" == "python" ]]; then
        echo ""
        read -p "Also setup frontend testing in ${frontend_dir}/? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            local frontend_type=$(detect_project_type "${target_dir}/${frontend_dir}")
            case "$frontend_type" in
                nextjs)
                    copy_nextjs_templates "${target_dir}/${frontend_dir}" "$force" "$skip_msw"
                    ;;
                vite|*)
                    copy_vite_templates "${target_dir}/${frontend_dir}" "$force" "$skip_msw"
                    ;;
            esac
        fi
    fi

    # Setup CI/CD if requested
    if [[ "$setup_ci" == "true" ]]; then
        copy_ci_templates "$target_dir" "$project_type" "$force"
    fi

    # Always offer Playwright
    echo ""
    read -p "Also setup Playwright E2E testing? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # For E2E, put in project root or dedicated e2e folder
        if [[ "$project_type" != "e2e" ]]; then
            mkdir -p "${target_dir}/e2e"
            copy_playwright_templates "${target_dir}/e2e" "$force"
        else
            copy_playwright_templates "$target_dir" "$force"
        fi
    fi

    print_header "Setup Complete!"
    print_success "Testing infrastructure has been configured."
    echo ""
    echo "Run your tests with:"
    case "$project_type" in
        python)
            echo "  pytest"
            ;;
        bun)
            echo "  bun test"
            ;;
        vite|nextjs)
            echo "  npm test"
            ;;
    esac
    if [[ -d "${target_dir}/e2e" ]]; then
        echo "  npx playwright test  (for E2E)"
    fi
}

# Run main function
main "$@"
