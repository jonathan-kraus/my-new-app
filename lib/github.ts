// lib/github.ts

/**
 * Resolve the commit SHA from different GitHub webhook event payloads.
 */
export function getSha(payload: any): string | undefined {
  return (
    // status/deployment events
    // check_run events
    payload.after || // push events
    payload.pull_request?.head?.sha || // PR events
    payload.workflow_run?.head_sha || // workflow_run events
    payload.check_suite?.head_sha || // check_suite events
    payload.check_run?.head_sha ||
    payload.sha
  );
}

/**
 * Detect an all-zero or missing SHA (e.g. branch delete events).
 */
function isZeroSha(sha: string | undefined): boolean {
  return !sha || /^0{40}$/.test(sha);
}

/**
 * Get repository info from payload
 */
export function getRepoInfo(payload: any): {
  owner: string;
  repo: string;
} | null {
  const repository = payload.repository;
  if (!repository) return null;

  return {
    owner: repository.owner?.login || repository.owner?.name,
    repo: repository.name,
  };
}

/**
 * Resolve the commit message from payload or GitHub API fallback.
 */
export async function getCommitMessage(
  payload: any,
): Promise<string | undefined> {
  // 1. Try direct fields first
  const direct =
    payload.head_commit?.message ||
    payload.pull_request?.title ||
    payload.deployment?.description;

  if (direct) return direct;

  // 2. Extract repo + SHA
  const sha = getSha(payload);
  const repoInfo = getRepoInfo(payload);

  if (!repoInfo || isZeroSha(sha)) {
    return undefined;
  }

  // 3. Best-effort GitHub API fetch
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits/${sha}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!res.ok) {
      // Soft failure — no console.error spam
      return undefined;
    }

    const data = await res.json();
    return data?.commit?.message;
  } catch {
    return undefined;
  }
}

/**
 * Get full commit details from GitHub API
 */
export async function getCommitDetails(
  owner: string,
  repo: string,
  sha: string,
): Promise<any> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to get commit details:", error);
    throw error;
  }
}

/**
 * Get recent commits for a repository
 */
export async function getRecentCommits(
  owner: string,
  repo: string,
  limit: number = 10,
): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}&sort=created&direction=desc`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to get recent commits:", error);
    throw error;
  }
}

/**
 * Get recent activity across all repositories for a user/organization
 */
export async function getRecentActivity(
  username: string,
  limit: number = 20,
): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/events?per_page=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to get recent activity:", error);
    throw error;
  }
}

/**
 * Get recent activity for specific repositories
 */
export async function getRepositoryActivity(
  repositories: { owner: string; repo: string }[],
  limit: number = 10,
): Promise<any[]> {
  try {
    const activities = await Promise.all(
      repositories.map(async ({ owner, repo }) => {
        try {
          const commits = await getRecentCommits(owner, repo, limit);
          return commits.map((commit) => ({
            type: "commit",
            owner,
            repo,
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            url: commit.html_url,
            avatar: commit.author?.avatar_url,
          }));
        } catch (error) {
          console.error(`Failed to get activity for ${owner}/${repo}:`, error);
          return [];
        }
      }),
    );

    // Flatten and sort by date
    return activities
      .flat()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to get repository activity:", error);
    throw error;
  }
}

/**
 * Get workflow runs for a repository
 */
export async function getRecentWorkflowRuns(
  owner: string,
  repo: string,
  limit: number = 10,
): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return data.workflow_runs || [];
  } catch (error) {
    console.error("Failed to get workflow runs:", error);
    throw error;
  }
}
