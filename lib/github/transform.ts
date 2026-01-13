export function transformGitHubRun(run: any) {
  if (!run) return null;

  return {
    id: run.id,

    // Workflow metadata
    name: run.name,
    repo: run.repo,

    // Status + result
    status: run.status ?? null,
    conclusion: run.conclusion ?? null,

    // Event context
    event: run.event ?? null,
    actor: run.actor ?? null,

    // Commit info
    commitMessage: run.commitMessage ?? null,
    commitSha: run.commitSha ?? null,

    // Link
    url: run.url ?? null,

    // Timestamps
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,

    // Source discriminator
    source: "github",
  };
}
