// lib/logging/withLogging.ts

export function withLogging(handler: (req: Request) => Promise<Response>) {
  return async function wrapped(req: Request) {
    performance.now();
    const res = await handler(req);

    // await log.api("Jonathan", "Request completed", {
    //   status: res.status,
    //   durationMs: Math.round(performance.now() - start),
    // });

    return res;
  };
}
