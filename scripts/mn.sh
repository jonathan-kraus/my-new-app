#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m"

section() {
  echo -e "\n${BLUE}[$(date +"%Y-%m-%d %H:%M:%S")] === $1 ===${NC}"
}

success() { echo -e "${GREEN}✔ $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠ $1${NC}"; }
fail()    { echo -e "${RED}✖ $1${NC}"; }

# Summary status variables
PRETTIER_STATUS="❔"
TSC_STATUS="❔"
BUILD_STATUS="❔"
COMMIT_STATUS="❔"
PUSH_STATUS="❔"

# --- Ensure we're on main ---
section "Checking branch"
branch=$(git symbolic-ref --quiet --short HEAD || true)

if [[ "$branch" != "main" ]]; then
  fail "You must be on main to use this script."
  exit 1
else
  success "On main"
  git pull origin main
fi

# --- Prettier ---
section "Running Prettier"
UNFORMATTED=$(pnpm prettier --list-different . 2>/dev/null || true)

if [[ -n "$UNFORMATTED" ]]; then
  warn "Formatting $(echo "$UNFORMATTED" | wc -l) file(s)"
  if echo "$UNFORMATTED" | xargs pnpm prettier --write --log-level=error; then
    PRETTIER_STATUS="✔"
    success "Prettier fixed issues"
  else
    PRETTIER_STATUS="✖"
    fail "Prettier failed"
    exit 1
  fi
else
  PRETTIER_STATUS="✔"
  success "Prettier OK"
fi

# --- TypeScript ---
section "Type-checking"
if pnpm type-check; then
  TSC_STATUS="✔"
  success "Types OK"
else
  TSC_STATUS="✖"
  fail "TypeScript errors"
  exit 1
fi

# --- Build ---
section "Building"
if pnpm build; then
  BUILD_STATUS="✔"
  success "Build OK"
else
  BUILD_STATUS="✖"
  fail "Build failed"
  exit 1
fi

# --- Commit ---
section "Committing"
git add .

if git diff --cached --quiet; then
  COMMIT_STATUS="✔"
  warn "No changes to commit"
else
  pnpm genmsg
  git commit -F "$(git rev-parse --git-path COMMIT_MSG)"
  COMMIT_STATUS="✔"
  success "Committed changes"
fi

# --- Push ---
section "Pushing to main"
if git push origin main; then
  PUSH_STATUS="✔"
  success "Pushed to main"
else
  PUSH_STATUS="✖"
  fail "Push failed"
  exit 1
fi

# --- Summary ---
section "Summary"

printf "%-20s %s\n" "Prettier" "     $PRETTIER_STATUS"
printf "%-20s %s\n" "TypeScript" "     $TSC_STATUS"
printf "%-20s %s\n" "Build" "     $BUILD_STATUS"
printf "%-20s %s\n" "Commit" "     $COMMIT_STATUS"
printf "%-20s %s\n" "Push" "     $PUSH_STATUS"

echo -e "\n${GREEN}Done.${NC}"
