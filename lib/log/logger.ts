/*
 * @FilePath: \my-new-app\lib\log\logger.ts
 * @LastEditTime: 2026-03-18 23:15:33
 */
import { buildUniversalContext } from "./build-universal-context";
import { logit } from "./logit";

// Utility to capture file + line of the caller
function getCallerInfo() {
  const stack = new Error().stack?.split("\n") ?? [];
  const caller = stack[3] ?? null;

  let file = null;
  let line = null;

  if (caller) {
    const match =
      caller.match(/\((.*):(\d+):(\d+)\)/) ??
      caller.match(/at (.*):(\d+):(\d+)/);

    if (match) {
      file = match[1] ?? null;
      line = match[2] ?? null;
    }
  }

  return { file, line };
}

async function baseLog(domain: string, message: string, payload: any, route: string) {
  const built = await buildUniversalContext(route);
  const { file, line } = getCallerInfo();

  return logit(
    domain,
    { level: "info", message },
    { ...payload, file, line },
    { built }
  );
}

export const log = {
  // For API route handlers
  async api(domain: string, message: string, payload: any = {}) {
    return baseLog(domain, message, payload, `api:${domain}`);
  },

  // For server components / pages
  async page(message: string, payload: any = {}) {
    return baseLog("page", message, payload, "page");
  },

  // For server actions
  async action(domain: string, message: string, payload: any = {}) {
    return baseLog(domain, message, payload, `action:${domain}`);
  },

  // For middleware
  async middleware(message: string, payload: any = {}) {
    return baseLog("middleware", message, payload, "middleware");
  },

  // For client components (no session, no headers)
  client(domain: string, message: string, payload: any = {}) {
    const now = new Date();
    const { file, line } = getCallerInfo();

    return logit(
      domain,
      { level: "info", message },
      {
        ...payload,
        file,
        line,
        clientTime: now.toISOString(),
      },
      {
        built: {
          ip: null,
          url: null,
          route: `client:${domain}`,
          method: null,
          userId: null,
          sessionEmail: null,
          sessionUser: null,
          zulu: now.toISOString(),
          local: now.toLocaleString(),
          runtime: {
            node: process.version,
            region: "client",
          },
          requestId: crypto.randomUUID(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          eventIndex: 0,
          deploymentId: "client",
          buildTimestamp: "client",
        },
      }
    );
  },
};
