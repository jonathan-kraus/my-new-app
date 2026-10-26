import { formatEastern } from "@/lib/utils/global";
import { v7 } from "uuid";
/*
 * @FilePath: \my-new-app\src\lib\log\buildj.ts
 * @LastEditTime: 2026-10-26 17:21:55
 */
export function staticUniversalContext(route: string) {
  const now = new Date();

  return {
    ip: "1.2.3.4",
    url: "kraus.my.id/logs/static",
    requestId: v7(),
    method: "UNKNOWN",
    route,
    userId: "JKstatic",
    sessionEmail: "static@kraus.my.id",
    sessionUser: "Jonathan Static",
    zulu: now.toISOString(),
    local: formatEastern(now),
    runtime: {
      node: process.version,
      region: process.env.VERCEL_REGION ?? "local",
    },
  };
}
