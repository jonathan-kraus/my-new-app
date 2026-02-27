/*
 * @FilePath: \my-new-app\app\api\github\ingest\route.ts
 * @LastEditTime: 2026-02-27 15:32:40
 */
// app/api/github/ingest/route.ts
import { db } from "@/lib/db";
import crypto from "crypto";
import { getCommitMessage } from "@/lib/github";
import { getSha } from "@/lib/github/parse";

export const runtime = "nodejs";

/* -------------------------------------------------------------------------- */
/*                         SIGNATURE VERIFICATION                             */
/* -------------------------------------------------------------------------- */

async function verifySignature(req: Request, body: string) {
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

/* -------------------------------------------------------------------------- */
/*                         NORMALIZATION LAYER                                */
/* -------------------------------------------------------------------------- */

function normalizeGitHubEvent(event: string | null, payload: any) {
  const repo = payload.repository?.full_name ?? null;
  const actor = payload.sender?.login ?? null;

  const commitMessage = getCommitMessage(payload);
  const sha = getSha(payload);

  switch (event) {
    case "push":
      return {
        type: "push",
        repo,
        actor,
        commitSha: payload.after,
        commitMessage: payload.head_commit?.message ?? commitMessage,
        url: payload.head_commit?.url ?? null,
      };

    case "pull_request":
      return {
        type: "pull_request",
        repo,
        actor,
        status: payload.action,
        commitSha: payload.pull_request?.head?.sha,
        commitMessage: payload.pull_request?.title ?? commitMessage,
        url: payload.pull_request?.html_url,
      };

    case "workflow_run": {
      const wr = payload.workflow_run;
      return {
        type: "workflow_run",
        repo,
        actor: wr?.actor?.login ?? actor,
        status: wr?.status ?? null,
        conclusion: wr?.conclusion ?? null,
        commitSha: wr?.head_sha ?? sha,
        commitMessage:
          wr?.display_title ?? wr?.head_commit?.message ?? commitMessage,
        url: wr?.html_url ?? null,
      };
    }

    case "deployment_status":
      return {
        type: "deployment_status",
        repo,
        actor,
        status: payload.deployment_status?.state,
        commitSha: payload.deployment?.sha,
        commitMessage,
        url: payload.deployment_status?.target_url,
      };

    case "issue_comment":
      return {
        type: "issue_comment",
        repo,
        actor,
        status: payload.action,
        commitMessage: payload.comment?.body ?? null,
        url: payload.comment?.html_url,
      };

    default:
      return { type: event, repo, actor };
  }
}

/* -------------------------------------------------------------------------- */
/*                                POST HANDLER                                */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  const bodyText = await req.text();

  if (!(await verifySignature(req, bodyText))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(bodyText);
  const event = req.headers.get("x-github-event");
  const deliveryId = req.headers.get("x-github-delivery");

  const commitMessage = await getCommitMessage(payload); // FIX #2
  const sha = getSha(payload);

  const normalized = {
    eventId: deliveryId!,
    type: event ?? "unknown", // FIX #1
    repo: payload.repository?.full_name ?? "unknown",
    actor: payload.sender?.login ?? null,
    status: payload.workflow_run?.status ?? payload.status ?? null,
    conclusion: payload.workflow_run?.conclusion ?? null,
    commitSha: sha ?? null,
    commitMessage: commitMessage ?? null,
    url: payload.workflow_run?.html_url ?? null,
    raw: payload,
  };

  await db.githubEvent.upsert({
    where: { eventId: normalized.eventId },
    update: normalized,
    create: normalized,
  });

  return Response.json({ ok: true });
}
