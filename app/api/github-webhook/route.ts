/*
 * @FilePath: \my-new-app\app\api\github-webhook\route.ts
 * @LastEditTime: 2026-08-01 13:48:15
 */
// app/api/github-webhook/route.ts
export const runtime = "nodejs";

import crypto from "crypto";
import { Axiom } from "@axiomhq/js";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { withLogging } from "@/lib/logging/withLogging";
import { getConfig } from "@/lib/runtime/config";
import { normalizeGitHubEvent } from "@/lib/github/normalize";
import { db } from "@/lib/db";

const gw = Number(await getConfig("github_webhook", "0"));
const axiom = new Axiom({ token: process.env.AXIOM_TOKEN! });

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

  try {
    await db.githubEvent.upsert({
      where: { eventId: deliveryId },
      update: normalized,
      create: { eventId: deliveryId, ...normalized },
    });
  } catch (err) {
    console.error("DB ERROR:", err);
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
