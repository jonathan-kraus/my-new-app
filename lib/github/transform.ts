export function transformGitHubRun(payload: any) {
  const wr = payload.workflow_run;
  if (!wr) return null;

  return {
    id: wr.id,

    // Workflow metadata
    name: wr.name,
    repo: payload.repository?.full_name ?? null,

    // Status + result
    status: wr.status ?? null,
    conclusion: wr.conclusion ?? null,

    // Event context
    event: payload.action ?? "workflow_run",
    actor: wr.actor?.login ?? payload.sender?.login ?? null,

    // Commit info
    commitMessage: wr.head_commit?.message ?? null,
    commitSha: wr.head_sha ?? null,

    // Link
    url: wr.html_url ?? null,

    // Timestamps
    createdAt: wr.created_at,
    updatedAt: wr.updated_at,

    // Source discriminator
    source: "github",
  };
}
