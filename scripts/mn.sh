#!/usr/bin/env bash
##
 # @FilePath:  \my-new-app\scripts\mn.sh
 # @LastEditTime: 2026-08-04 21:48:41
###
set -euo pipefail

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}

section() {
  echo -e "\n${BLUE}[$(timestamp)] === $1 ===${NC}"
}

success() {
  echo -e "${GREEN}✔ $1${NC}"
}

warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

fail() {
  echo -e "${RED}✖ $1${NC}"
}

section "Updating pnpm"
corepack prepare pnpm@latest --activate

section "Checking outdated dependencies"
pnpm check-out || warn "Some dependencies are outdated"

# section "Update dependencies"
# pnpm update --latest || warn "Failed to update dependencies"

echo "=== Running Prettier check ==="

UNFORMATTED=$(pnpm prettier --list-different . 2>/dev/null || true)

if [ -n "$UNFORMATTED" ]; then
  warn "Found $(echo "$UNFORMATTED" | wc -l) file(s) needing formatting:"
  echo "$UNFORMATTED" | sed 's/^/   • /'
  echo

  echo "$UNFORMATTED" | xargs pnpm prettier --write --log-level=error

  success "Prettier issues fixed"
else
  success "Prettier formatting OK"
fi

# section "Running ESLint"
# pnpm lint && success "ESLint passed"

section "Running TypeScript type-check"
echo "Checking types..."

if ! pnpm type-check; then
  warn "TypeScript errors detected"
fi

section "Validating Prisma schema"
pnpm prisma validate && success "Prisma schema valid"

# section "Running pnpm audit"
# node .github/scripts/audit.js

section "Maintenance Summary"
echo -e "${GREEN}All checks completed.${NC}"

# ---------------------------------------------------------------
# Ask whether to run smart-commit (default = Y)
# ---------------------------------------------------------------
echo
read -r -p "Run pnpm smart-commit? [Y/n] " answer
answer=${answer:-Y}          # default to Y if user just presses Enter

case "$answer" in
  [Yy]|[Yy][Ee][Ss])
    echo
    section "Running pnpm smart-commit"
    pnpm smart-commit
    ;;
  *)
    echo
    warn "Skipped smart-commit"
    ;;
esac
