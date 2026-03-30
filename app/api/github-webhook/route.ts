// app\api\github-webhook\route.ts
export const runtime = "nodejs";

import crypto from "crypto";
import { Axiom } from "@axiomhq/js";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { withLogging } from "@/lib/logging/withLogging";
import { getConfig } from "@/lib/runtime/config";
import { getSha } from "@/lib/github/parse";
import { getCommitMessage } from "@/lib/github";
import { db } from "@/lib/db";
import { z } from "zod";

const gw = Number(await getConfig("github_webhook", "0"));
const axiom = new Axiom({ token: process.env.AXIOM_TOKEN! });

export const GitHubWebhookSchema = z.object({
  event: z.string(),
  delivery: z.string(),

  action: z.string().optional(),

  repository: z
    .object({
      name: z.string().optional(),
      full_name: z.string().optional(),
      id: z.number().optional(),
      private: z.boolean().optional(),
      owner: z
        .object({
          login: z.string().optional(),
          id: z.number().optional(),
          type: z.string().optional(),
        })
        .optional(),
    })
    .optional(),

  sender: z
    .object({
      login: z.string().optional(),
      id: z.number().optional(),
      type: z.string().optional(),
    })
    .optional(),

  installation: z
    .object({
      id: z.number().optional(),
    })
    .optional(),

  // FIXED: Zod v3.21-compatible
  payload: z.record(z.string(), z.unknown()).optional(),
});


/* -------------------------------------------------------------------------- */
/*                                POST HANDLER                                */
/* -------------------------------------------------------------------------- */

export const POST = withLogging(async (req: Request) => {
  // Build context INSIDE the request handler
  const built = await buildUniversalContext(req as any, "GITHUB");

  const raw = await req.text();
  if (!(await verifySignature(req, raw))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(raw);
  const event = req.headers.get("x-github-event");
  const deliveryId = req.headers.get("x-github-delivery");

  const commitMessage = await getCommitMessage(payload);
  const sha = getSha(payload);

  const parsed = GitHubWebhookSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("Invalid GitHub webhook", parsed.error.format());
  }

  await logj({
    domain: "jonathan",
    level: "info",
    message: "Github webhook processed " + event,
    file: "app/api/github-webhook/route.ts",
    line: 53,
    payload: {},
    meta: {
      built,
    },
  });

  const normalized = {
    eventId: deliveryId!,
    type: event ?? "unknown",
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

  return new Response("OK");
});

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
