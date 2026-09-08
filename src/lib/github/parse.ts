export function getSha(payload: any): string | null {
  if (!payload) return null;

  // Push events
  if (payload.head_commit?.id) return payload.head_commit.id;

  // Workflow run
  if (payload.workflow_run?.head_sha) return payload.workflow_run.head_sha;

  // Workflow job
  if (payload.workflow_job?.head_sha) return payload.workflow_job.head_sha;

  // Check suite
  if (payload.check_suite?.head_sha) return payload.check_suite.head_sha;

  // Check run
  if (payload.check_run?.head_sha) return payload.check_run.head_sha;

  // Pull request
  if (payload.pull_request?.head?.sha) return payload.pull_request.head.sha;

  return null;
}
