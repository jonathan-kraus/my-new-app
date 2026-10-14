#!/usr/bin/env bash
set -euo pipefail

# Keep the existing generated commit message, but never push directly to main.
gh_cli=$(command -v gh || command -v gh.exe || true)
if [[ -z "$gh_cli" ]]; then
  # Git Bash / WSL may not inherit the PATH used by PowerShell.
  for candidate in \
    'C:/Program Files/GitHub CLI/gh.exe' \
    '/c/Program Files/GitHub CLI/gh.exe' \
    '/mnt/c/Program Files/GitHub CLI/gh.exe'; do
    if [[ -x "$candidate" ]]; then
      gh_cli="$candidate"
      break
    fi
  done
fi
if [[ -z "$gh_cli" ]]; then
  echo "GitHub CLI was not found in this Bash session. Add its installation directory to PATH and restart your terminal." >&2
  exit 1
fi
gh() { "$gh_cli" "$@"; }
gh auth status >/dev/null 2>&1 || { echo "GitHub authentication failed. Run gh auth status in PowerShell for details." >&2; exit 1; }
cd "$(git rev-parse --show-toplevel)"

branch=$(git symbolic-ref --quiet --short HEAD) || {
  echo "Detached HEAD: switch to a branch before running mn." >&2
  exit 1
}
git fetch origin main

if [[ "$branch" == "main" ]]; then
  # Updating a clean main avoids carrying already-merged commits into the next PR.
  # With local edits, leave the working tree intact; GitHub checks mergeability.
  if [[ -z "$(git status --porcelain)" ]]; then
    git merge --ff-only origin/main
  fi
  if [[ -z "$(git status --porcelain)" ]] && [[ "$(git rev-list --count origin/main..HEAD)" == 0 ]]; then
    echo "No changes to submit."
    exit 0
  fi
  branch="codex/mn-$(date +%Y%m%d-%H%M%S)-${RANDOM}"
  git switch -c "$branch"
fi

# Resolve API errors before committing or pushing; never interpret them as no PR.
existing_pr=$(gh pr list --head "$branch" --base main --state open --json url --jq '.[0].url // empty')
if [[ -z "$existing_pr" ]]; then
  closed_pr=$(gh pr list --head "$branch" --base main --state closed --json url --jq '.[0].url // empty')
  if [[ -n "$closed_pr" ]]; then
    echo "This branch belongs to a closed or merged PR: $closed_pr" >&2
    echo "Switch to main (preserving any local edits), then run mn again." >&2
    exit 1
  fi
fi

git add .
if ! git diff --cached --quiet; then
  pnpm genmsg
  git commit -F "$(git rev-parse --git-path COMMIT_MSG)"
fi

if [[ "$(git rev-list --count origin/main..HEAD)" == 0 ]]; then
  echo "No commits to submit."
  exit 0
fi

git push --set-upstream origin "$branch"
if [[ -n "$existing_pr" ]]; then
  echo "Updated PR: $existing_pr"
else
  gh pr create --base main --head "$branch" --fill
fi
echo "CI will run on the PR. Merge it on GitHub once checks pass."
