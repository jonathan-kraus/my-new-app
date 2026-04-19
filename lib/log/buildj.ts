/*
 * @FilePath: \my-new-app\lib\log\buildj.ts
 * @LastEditTime: 2026-04-19 18:35:24
 */
export function staticUniversalContext(route: string) {
  const now = new Date();

  return {
    ip: "1.2.3.4",
    url: "kraus.my.id/logs/static",
    requestId: crypto.randomUUID(),
    method: "UNKNOWN",
    route,
    userId: "JKstatic",
    sessionEmail: "static@kraus.my.id",
    sessionUser: "Jonathan Static",
    zulu: now.toISOString(),
    local: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      hour12: true,}),
    runtime: {
      node: process.version,
      region: process.env.VERCEL_REGION ?? "local",
    },
  };
}
