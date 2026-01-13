export const runtime = "nodejs";

import { NextRequest } from "next/server";
import crypto from "crypto";
import { logit } from "@/lib/log/server";
import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

// -----------------------------
// Transform workflow_run payload
// -----------------------------
function transformWorkflowRun(payload: any) {
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

// -----------------------------
// Normalize all GitHub events
// -----------------------------
function normalizeGitHubEvent(event: string | null, payload: any) {
  const repo = payload.repository?.full_name ?? null;
  const actor = payload.sender?.login ?? null;

  switch (event) {
    case "push":
      return {
        type: "push",
        repo,
        actor,
        sha: payload.after,
        branch: payload.ref?.replace("refs/heads/", ""),
        commitMessage: payload.head_commit?.message ?? null,
        url: payload.head_commit?.url ?? null,
      };

    case "pull_request":
      return {
        type: "pull_request",
        repo,
        actor,
        action: payload.action,
        number: payload.number,
        title: payload.pull_request?.title,
        url: payload.pull_request?.html_url,
        sha: payload.pull_request?.head?.sha,
        branch: payload.pull_request?.head?.ref,
      };

    case "workflow_run":
      return transformWorkflowRun(payload);

    case "deployment_status":
      return {
        type: "deployment_status",
        repo,
        actor,
        environment: payload.deployment?.environment,
        status: payload.deployment_status?.state,
        url: payload.deployment_status?.target_url,
        sha: payload.deployment?.sha,
      };

    case "issue_comment":
      return {
        type: "issue_comment",
        repo,
        actor,
        action: payload.action,
        issueNumber: payload.issue?.number,
        comment: payload.comment?.body,
        url: payload.comment?.html_url,
      };

    default:
      return {
        type: event,
        repo,
        actor,
      };
  }
}

// -----------------------------
// Signature verification
// -----------------------------
async function verifySignature(req: NextRequest, body: string) {
  const signature = req.headers.get("x-hub-signature-256");
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature || !secret) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(body).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

// -----------------------------
// POST handler
// -----------------------------
export async function POST(req: NextRequest) {
  const raw = await req.text();

  // 1. Verify signature
  if (!(await verifySignature(req, raw))) {
    await logit({
      level: "warn",
      message: "Invalid GitHub signature",
      file: "github-webhook",
    });
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(raw);
  const event = req.headers.get("x-github-event");

  // 2. Log raw event type
  await logit({
    level: "info",
    message: "GitHub webhook received",
    data: { event },
  });

  // 3. Normalize event
  const normalized = normalizeGitHubEvent(event, payload);

  // If workflow_run, ingest full event
  if (event === "workflow_run") {
    const wr = transformWorkflowRun(payload);

    if (!wr) {
      await logit({
        level: "warn",
        message: "workflow_run missing payload",
      });
      return new Response("OK");
    }

    // Local log
    await logit({
      level: "info",
      message: "workflow_run processed",
      data: wr,
    });

    // Ingest into Axiom
    await axiom.ingest("github-events", wr);
await logit({
  level: "info",
  message: "RAW PAYLOAD",
  data: payload,
});

    await logit({
      level: "info",
      message: "** GitHub workflow_run ingested **",
      data: { id: wr.id },
    });

    return new Response("OK");
  }

  // 4. Other events → optional ingest or ignore
  await logit({
    level: "info",
    message: "GitHub event ignored",
    data: { event },
  });

  return new Response("Ignored", { status: 200 });
}
