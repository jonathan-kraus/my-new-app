#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m"

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

# Status variables for summary table
PRETTIER_STATUS="❔"
TSC_STATUS="❔"
BUILD_STATUS="❔"

section "Updating pnpm"
corepack prepare pnpm@latest --activate

section "Checking outdated dependencies"
pnpm check-out || warn "Some dependencies are outdated."

echo "=== Running Prettier check ==="

UNFORMATTED=$(pnpm prettier --list-different . 2>/dev/null || true)

if [ -n "$UNFORMATTED" ]; then
  warn "Found $(echo "$UNFORMATTED" | wc -l) file(s) needing formatting:"
  echo "$UNFORMATTED" | sed 's/^/   • /'
  echo

  if echo "$UNFORMATTED" | xargs pnpm prettier --write --log-level=error; then
    PRETTIER_STATUS="✔"
    success "Prettier issues fixed"
  else
    PRETTIER_STATUS="✖"
    fail "Prettier formatting failed"
    exit 1
  fi
else
  PRETTIER_STATUS="✔"
  success "Prettier formatting OK"
fi

section "Running TypeScript type-check"
echo "Checking types..."

if pnpm type-check; then
  TSC_STATUS="✔"
  success "Types OK"
else
  TSC_STATUS="✖"
  warn "TypeScript errors detected"
  exit 1
fi

section "Running build"
echo "Building project..."

if pnpm build; then
  BUILD_STATUS="✔"
  success "Build OK"
else
  BUILD_STATUS="✖"
  fail "Build failed"
  exit 1
fi

section "Maintenance Summary"

echo ""
echo "Summary of checks:"
echo ""
printf "%-25s %-10s\n" "Prettier" "$PRETTIER_STATUS"
printf "%-25s %-10s\n" "TypeScript" "$TSC_STATUS"
printf "%-25s %-10s\n" "Build" "$BUILD_STATUS"
echo ""

echo -e "${GREEN}All checks completed.${NC}"

echo
read -r -p "Run pnpm smart-commit? [Y/n] " answer
answer=${answer:-Y}

case "$answer" in
  [Yy]|[Yy][Ee][Ss])
    echo
    section "Staging changes"
    git add .
    CHANGED_COUNT=$(git diff --name-only HEAD | wc -l)
    echo -e "${GREEN}✔ Staged $CHANGED_COUNT file(s)${NC}"

    section "Running pnpm smart-commit"
    pnpm smart-commit
    ;;
  *)
    echo
    warn "Skipped smart-commit"
    ;;
esac

echo
echo -e "${GREEN}Done.${NC}"

exit 0
