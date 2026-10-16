#!/usr/bin/env bash
set -euo pipefail

# PowerShell's `bash` can resolve to WSL. This Windows checkout uses Windows
# Git credentials and TLS settings, so run the whole script in Git Bash.
if [[ "${OSTYPE:-}" == linux* && -x '/mnt/c/Program Files/Git/bin/bash.exe' ]]; then
  exec '/mnt/c/Program Files/Git/bin/bash.exe' --login "$(wslpath -w "$0")" "$@"
fi

cd "$(dirname "$0")/.."

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
  echo "GitHub CLI was not found in this Bash session. Add the installation directory to PATH and restart your terminal." >&2
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
  closed_pr=$(gh pr list --head "$branch" --base main --state closed --json url,state,headRefOid --jq 'if length > 0 then .[0] | [.state, .headRefOid, .url] | @tsv else empty end')
  if [[ -n "$closed_pr" ]]; then
    IFS=$'\t' read -r pr_state merged_head pr_url <<< "$closed_pr"
    if [[ "$pr_state" != MERGED ]]; then
      echo "This PR was closed without merging: $pr_url" >&2
      echo "Reopen it or move your work to a new branch before retrying." >&2
      exit 1
    fi
    if [[ "$(git rev-parse HEAD)" != "$merged_head" ]]; then
      echo "The PR merged, but this branch has commits different from its merged head." >&2
      echo "Move those commits to a new branch before retrying; no changes were discarded." >&2
      exit 1
    fi
    if [[ -z "$(git status --porcelain)" ]]; then
      echo "PR already merged; no new changes to submit."
      exit 0
    fi
    branch="codex/mn-$(date +%Y%m%d-%H%M%S)-${RANDOM}"
    echo "Previous PR merged. Moving local changes to $branch from origin/main."
    # Plain switch preserves edits and refuses to overwrite conflicting files.
    # Never reset, force-switch, or silently stash the user's changes.
    if ! git switch --no-track -c "$branch" origin/main; then
      echo "Could not carry local edits onto updated main. Your changes are still intact; resolve this before retrying." >&2
      exit 1
    fi
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
