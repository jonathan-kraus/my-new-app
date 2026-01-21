export const runtime = "nodejs";

import { NextRequest } from "next/server";
import crypto from "crypto";
import { logit } from "@/lib/log/logit";
import { Axiom } from "@axiomhq/js";
import { getSha } from "@/lib/github/parse";
import { getCommitMessage } from "@/lib/github";
const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});
const ctx = {
  requestId: crypto.randomUUID(),
  route: "Github Webhook",
  page: "workflow",
  userId: "JK",
};
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
  // ⭐ Direct-to-DB debug write (safe, no recursion)
  writeGithubDebugEvent({
    event,
    repo,
    actor,
    status: payload.workflow_run?.status,
    action: payload.action,
    commit: getCommitMessage(payload),
    sha: getSha(payload),
    raw: payload,
  });
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
import { db } from "@/lib/db";

export async function writeGithubDebugEvent(payload: any) {
  try {
    await db.githubDebug.create({
      data: {
        raw: payload,
        status: payload.workflow_run?.status,
        action: payload.action,
        commit: payload.workflow_run?.head_commit?.message,
        sha: payload.workflow_run?.head_sha,
      },
    });
  } catch (err) {
    console.error("Failed to write GitHub debug event", err);
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
    const myact = 1417;
    await logit(
      "github",
      {
        level: "warn",
        message: "Invalid GitHub signature",
        payload: { actor: myact },
      },
      {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
    );
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(raw);
  const event = req.headers.get("x-github-event");

  // 2. Log raw event type
  await logit(
    "github",
    {
      level: "info",
      message: "GitHub webhook received",
      payload: { event: event },
    },
    {
      requestId: ctx.requestId,
      route: ctx.page,
      userId: ctx.userId,
    },
  );

  // 3. Normalize event
  const normalized = normalizeGitHubEvent(event, payload);

  // If workflow_run, ingest full event
  if (event === "workflow_run") {
    const wr = transformWorkflowRun(payload);

    if (!wr) {
      await logit(
        "github",
        {
          level: "warn",
          message: "workflow_run missing payload",
          payload: { event: event },
        },
        {
          requestId: ctx.requestId,
          route: ctx.page,
          userId: ctx.userId,
        },
      );
      return new Response("OK");
    }

    // Ingest into Axiom
    await axiom.ingest("github-events", wr);

    await logit(
      "github",
      {
        level: "info",
        message: "** GitHub workflow_run ingested **",
        payload: { id: wr.id },
      },
      {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
    );

    return new Response("OK");
  }

  // 4. Other events → optional ingest or ignore
  await logit(
    "github",
    {
      level: "info",
      message: "GitHub event ignored",
      payload: { event },
    },
    {
      requestId: ctx.requestId,
      route: ctx.page,
      userId: ctx.userId,
    },
  );

  return new Response("Ignored", { status: 200 });
}
