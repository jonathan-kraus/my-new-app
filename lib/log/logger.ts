/*
 * @FilePath: \my-new-app\lib\log\logger.ts
 * @LastEditTime: 2026-03-28 23:39:06
 */
import { buildUniversalContext } from "./build-universal-context";
import { logit } from "./logit";

// Utility to capture file + line of the caller
function getCallerInfo() {
  const stack = new Error().stack?.split("\n") ?? [];
  const caller = stack[3] ?? null;

  let file: string | null = null;
  let line: string | null = null;

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

async function baseLog(
  req: Request,
  domain: string,
  message: string,
  payload: any,
  route: string,
) {
  const built = await buildUniversalContext(req as any, route);
  const { file, line } = getCallerInfo();

  return logit(
    domain,
    { level: "info", message },
    { ...payload, file, line },
    { built },
  );
}

export const log = {
  // For API route handlers
  async api(req: Request, domain: string, message: string, payload: any = {}) {
    return baseLog(req, domain, message, payload, `api:${domain}`);
  },

  // For server components / pages (no req available)
  async page(message: string, payload: any = {}) {
    const { file, line } = getCallerInfo();
    return logit(
      "page",
      { level: "info", message },
      { ...payload, file, line },
      { built: { route: "page" } },
    );
  },

  // For server actions
  async action(
    req: Request,
    domain: string,
    message: string,
    payload: any = {},
  ) {
    return baseLog(req, domain, message, payload, `action:${domain}`);
  },

  // For middleware (middleware generates its own context)
  async middleware(req: Request, message: string, payload: any = {}) {
    return baseLog(req, "middleware", message, payload, "middleware");
  },

  // For client components (no req, no headers)
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
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : null,
          eventIndex: 0,
          deploymentId: "client",
          buildTimestamp: "client",
        },
      },
    );
  },
};
