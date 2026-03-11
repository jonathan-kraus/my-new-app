import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";

export function withLogging(
  handler: (req: Request, ctx?: any) => Promise<Response>,
) {
  return async (req: Request, ctx?: any) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();
    const url = new URL(req.url);

    try {
      const res = await handler(req, ctx);

      logit("response", {
                requestId,
                method: req.method,
                path: url.pathname,
                status: res.status,
                duration: Date.now() - start,
                message: `${req.method} ${url.pathname} status=${res.status}`,
              }, { eventIndex }, {
              requestId: ctx?.requestId ?? req?.id,
              zulu: new Date().toISOString(),
              local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
            });

      return res;
    } catch (err: any) {
      logit("response_error", {
                requestId,
                method: req.method,
                path: url.pathname,
                status: 500,
                duration: Date.now() - start,
                error: err?.message ?? "Unknown error",
                message: `${req.method} ${url.pathname} status=500 error=${err?.message ?? "Unknown error"}`,
              }, { eventIndex }, {
              requestId: ctx?.requestId ?? req?.id,
              zulu: new Date().toISOString(),
              local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
            });

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}
