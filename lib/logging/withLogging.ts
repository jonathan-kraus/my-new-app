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
      });

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}
