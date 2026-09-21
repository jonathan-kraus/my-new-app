/*
 * @FilePath: \my-new-app\app\api\github-webhook\route.ts
 * @LastEditTime: 2026-09-18 00:02:03
 */
// app/api/github-webhook/route.ts
export const runtime = "nodejs";

import crypto from "crypto";
import { logj } from "@/lib/log/logj";
import { createId } from "@paralleldrive/cuid2";
import { timestampString } from "@/lib/timestampString";
import { staticUniversalContext } from "@/lib/log/buildj";
import { withLogging } from "@/lib/logging/withLogging";
import { getConfig } from "@/lib/runtime/config";
import { normalizeGitHubEvent } from "@/lib/github/normalize";
import { db8 } from "@/lib/db.prisma8";

const gw = Number(await getConfig("github_webhook", "0"));

export const POST = withLogging(async (req: Request) => {
  const built = staticUniversalContext("GITHUB");
  let jei = 0;
  const raw = await req.text();
  if (!(await verifySignature(req, raw))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const event = req.headers.get("x-github-event") ?? "unknown";
  const deliveryId =
    req.headers.get("x-github-delivery") ?? crypto.randomUUID();
  const payload = JSON.parse(raw);
  const normalized = normalizeGitHubEvent(event, payload);

  await logj({
    domain: "github",
    level: "info",
    message:
      "Github webhook processed " +
      event +
      (normalized.title ? ` - ${JSON.stringify(normalized.title)}` : ""),
    file: "app/api/github-webhook/route.ts",
    line: 34,
    payload: { event, type: normalized.type, gw },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const now = timestampString(new Date().toISOString());

  // Normalized events also contain display-only fields (such as prNumber).
  // Persist only contract fields; the original event remains available in raw.
  const normalized8 = {
    _type: normalized.type,
    repo: normalized.repo,
    title: normalized.title,
    actor: normalized.actor,
    commitSha: normalized.commitSha,
    url: normalized.url,
    status: normalized.status,
    conclusion: normalized.conclusion,
    jobName: normalized.jobName ?? null,
    commitMessage: normalized.commitMessage ?? null,
    raw: normalized.raw,
    updatedAt: now,
  };
  try {
    const existing = await db8.orm.public.GithubEvent.where((event) =>
      event.eventId.eq(deliveryId),
    ).first();

    if (existing) {
      await db8.orm.public.GithubEvent.where({ id: existing.id }).update(
        normalized8,
      );
    } else {
      await db8.orm.public.GithubEvent.create({
        id: createId(),
        eventId: deliveryId,
        ...normalized8,
      });
    }

    await logj({
      domain: "github",
      level: "info",
      message: "Github event upserted",
      file: "app/api/github-webhook/route.ts",
      line: 72,
      payload: { event, type: normalized.type, gw },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
  } catch (err) {
    await logj({
      domain: "github",
      level: "error",
      message: "Github event database write failed",
      file: "app/api/github-webhook/route.ts",
      payload: {
        event,
        deliveryId,
        error: err instanceof Error ? err.message : String(err),
      },
      meta: { requestId: deliveryId, built: { ...built, eventIndex: ++jei } },
    });
    throw err;
  }

  return new Response("OK");
});

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
