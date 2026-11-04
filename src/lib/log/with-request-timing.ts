import { headers } from "next/headers";
import { logj } from "@/lib/log/logj";

function readProxyStart(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Log route duration and, when present, the elapsed time since proxy entry. */
export function withRequestTiming<
  Args extends unknown[],
  Result extends Response,
>(
  method: string,
  route: string,
  handler: (...args: Args) => Result | Promise<Result>,
): (...args: Args) => Promise<Result> {
  return async (...args) => {
    const requestStarted = performance.now();
    const requestStartedAt = Date.now();
    const request = args[0] instanceof Request ? args[0] : undefined;
    let requestHeaders = request?.headers;
    if (!requestHeaders) {
      try {
        requestHeaders = await headers();
      } catch {
        // Keep direct unit calls working outside a Next.js request context.
        requestHeaders = new Headers();
      }
    }
    const requestId =
      requestHeaders.get("x-app-request-id") ??
      requestHeaders.get("x-request-id") ??
      crypto.randomUUID();
    const proxyStartedAt = readProxyStart(
      requestHeaders.get("x-app-request-started-at"),
    );
    if (proxyStartedAt === null) {
      // Direct route calls (including isolated tests) have no proxy clock to
      // report. Preserve their normal behavior and avoid a redundant log.
      return handler(...args);
    }
    const proxyDurationMs = requestStartedAt - proxyStartedAt;

    let status = 500;
    let failure: unknown;
    let didFail = false;

    try {
      const response = await handler(...args);
      status = response.status;
      return response;
    } catch (error) {
      didFail = true;
      failure = error;
      throw error;
    } finally {
      const completedAt = Date.now();
      const handlerDurationMs = performance.now() - requestStarted;
      try {
        await logj({
          domain: "REQUEST",
          level: didFail ? "error" : "info",
          message: didFail
            ? "Route request failed"
            : `${route} ${method} request completed in ${handlerDurationMs.toFixed(3)}ms`,
          file: route,
          payload: {
            requestId,
            method,
            route,
            status,
            handlerDurationMs: Number(handlerDurationMs.toFixed(3)),
            proxyDurationMs,
            totalDurationMs: completedAt - proxyStartedAt,
            ...(failure
              ? {
                  error:
                    failure instanceof Error
                      ? { name: failure.name, message: failure.message }
                      : String(failure),
                }
              : {}),
          },
        });
      } catch (loggingError) {
        console.error("Request timing log failed", loggingError);
      }
    }
  };
}
