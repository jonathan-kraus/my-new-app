// lib/logging/withLogging.ts
import { log } from "@/lib/log/logger";

export function withLogging(handler: (req: Request) => Promise<Response>) {
  return async function wrapped(req: Request) {
    const start = performance.now();

    await log.api("system", "Request started", {
      url: req.url,
      method: req.method,
    });

    try {
      const res = await handler(req);

      await log.api("system", "Request completed", {
        status: res.status,
        durationMs: Math.round(performance.now() - start),
      });

      return res;
    } catch (err: any) {
      await log.api("system", "Request failed", {
        error: err.message,
        durationMs: Math.round(performance.now() - start),
      });

      throw err;
    }
  };
}
