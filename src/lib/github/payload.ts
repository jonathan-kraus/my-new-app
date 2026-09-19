// Fields consumed from GitHub webhook payloads; event-specific sections may be absent.
export type GitHubPayload = {
  action?: string;
  after?: string;
  sha?: string;
  sender?: { login?: string };
  pusher?: { name?: string };
  compare?: string;
  head_commit?: { id?: string; message?: string };
  repository?: {
    full_name?: string;
    name: string;
    owner?: { login?: string; name?: string };
  };
  deployment?: { description?: string };
  check_suite?: { head_sha?: string };
  check_run?: { head_sha?: string };
  issue?: { title?: string; html_url?: string };
  pull_request?: {
    title?: string;
    user?: { login?: string };
    head?: { sha?: string };
    html_url?: string;
    state?: string;
    merged?: boolean;
    number?: number;
  };
  workflow_job?: {
    name?: string;
    head_sha?: string;
    html_url?: string;
    status?: string;
    conclusion?: string;
  };
  workflow_run?: {
    id?: number;
    name?: string;
    display_title?: string;
    actor?: { login?: string };
    head_sha?: string;
    html_url?: string;
    status?: string;
    conclusion?: string;
    head_commit?: { message?: string };
    created_at?: string;
    updated_at?: string;
  };
};

export type GitHubCommit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { name: string; date: string } };
  author?: { avatar_url?: string };
};
