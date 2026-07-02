
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
pnpm outdated || warn "Some dependencies are outdated"

section "Update dependencies"
pnpm update || warn "Failed to update dependencies"

section "Running Prettier check"
if ! pnpm prettier --check .; then
  warn "Prettier found issues — fixing…"
  pnpm prettier --write .
  success "Prettier issues fixed"
else
  success "Prettier formatting OK"
fi


# section "Running ESLint"
# pnpm lint && success "ESLint passed"

section "Running TypeScript type-check"
echo "Checking types..."

if ! pnpm type-check; then
  warn "TypeScript errors detected — attempting auto-fix…"

  # Auto-fix strategy: run ESLint + Prettier
  pnpm lint --fix || true
  pnpm prettier --write . || true

  # Re-run TS check after fixes
  if pnpm type-check; then
    success "TypeScript issues fixed"
  else
    fail "TypeScript errors remain — manual review required"
  fi
else
  success "TypeScript OK"
fi

section "Validating Prisma schema"
pnpm prisma validate && success "Prisma schema valid"

section "Running pnpm audit"
node .github/scripts/audit.js

section "Maintenance Summary"
echo -e "${GREEN}All checks completed.${NC}"
