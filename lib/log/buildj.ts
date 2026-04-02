/*
 * @FilePath: \my-new-app\lib\log\buildj.ts
 * @LastEditTime: 2026-04-02 00:24:43
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
    local: now.toLocaleString(),
    runtime: {
      node: process.version,
      region: process.env.VERCEL_REGION ?? "local",
    },
  };
}
