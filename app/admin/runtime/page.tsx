/*
 * @FilePath: \my-new-app\app\admin\runtime\page.tsx
 * @LastEditTime: 2026-08-06 00:16:21
 */
// app/admin/runtime/page.tsx
import { db } from "@/lib/db";
import { ConfigTable } from "./ConfigTable";
import { EmailThrottleCountdown } from "./EmailThrottleCountdown";
import type { NextRequest } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

// Make this page fully dynamic so DB reads happen on every request
export const dynamic = "force-dynamic";

export default async function RuntimeAdminPage(req: NextRequest) {
  const configs = await db.runtimeConfig.findMany({
    orderBy: { key: "asc" },
  });

  let jei = 0;
  const lastSent =
    configs.find((c) => c.key === "email.last_sent_at")?.value ?? null;
  const throttle = Number(
    configs.find((c) => c.key === "email.throttle.minutes")?.value ?? "0",
  );
  const built = await buildUniversalContext(req as any, "RUNTIME");

  await logj({
    domain: "jonathan",
    level: "info",
    message: `** Runtime Admin Page **`,
    file: "app/admin/runtime/page.tsx",
    line: 25,
    payload: {
      lastsent: lastSent,
      throttle: throttle,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold text-white">Runtime Controls</h1>
      <EmailThrottleCountdown lastSent={lastSent} throttleMinutes={throttle} />

      <p className="text-white/60">Live feature flags & runtime settings</p>

      <ConfigTable configs={configs} />
    </div>
  );
}
