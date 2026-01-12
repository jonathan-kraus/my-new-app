export const runtime = "nodejs";

import { NextRequest } from "next/server";
import crypto from "crypto";
import { logit } from "@/lib/log/server";
import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});
function normalizeGitHubEvent(event: any, payload: any) {
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
      return {
        type: "workflow_run",
        repo,
        actor,
        workflowName: payload.workflow_run?.name,
        status: payload.workflow_run?.status,
        conclusion: payload.workflow_run?.conclusion,
        url: payload.workflow_run?.html_url,
        sha: payload.workflow_run?.head_sha,
        branch: payload.workflow_run?.head_branch,
      };

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
  const normalized = normalizeGitHubEvent(event, payload);
  // 2. Log the raw event
  await logit({
    level: "info",
    message: "GitHub webhook received",
    data: { event },
  });
//   await logit({ level: "info",
//     message: "111111111111111" });
// await axiom.ingest("github-events",
//   [ { msg: "test-ingest", ts: Date.now() } ]);
//   await logit({ level: "info",
//     message: "2222222222222222" });
//     const result = await axiom.query(` ['github-events'] | limit(5) `);
//       await logit({ level: "info",
//     message: "333333333333333333333" });
//     console.log(result.matches);
//     await logit({ level: "info",
//     message: "test-query fired" });
  switch (event) {
    case "workflow_run": {
      const wr = payload.workflow_run;

      // 3. Local log of filtered data
      await logit({
        level: "info",
        message: "workflow_run processed",
        data: {
          id: wr.id,
          name: wr.name,
          status: wr.status,
          conclusion: wr.conclusion,
          createdAt: wr.created_at,
          updatedAt: wr.updated_at,
          repo: payload.repository.full_name,
        },
      });

      // 4. Filtered ingest to Axiom
axiom.ingest("github_events", {
  id: payload?.workflow_run?.id ?? payload?.after ?? crypto.randomUUID(),
  event,
  ...normalized, raw: payload, // optional
  timestamp: new Date().toISOString(),
});
      await logit({
        level: "info",
        message: "** GitHub event ingested **",
        data: { event },
      });
    await axiom.ingest("github-events", [ { msg: "Hello" } ]);
      return new Response("OK");
    }

    default:
      await logit({
        level: "info",
        message: "GitHub event ignored",
        data: { event },
      });
      return new Response("Ignored", { status: 200 });
  }
}
