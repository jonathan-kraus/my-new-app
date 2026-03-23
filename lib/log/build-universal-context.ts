export async function buildUniversalContext(route: string) {
  const now = new Date();

  try {
    // headers() may be sync or async depending on environment
    const rawHeaders = await Promise.resolve(headers());

    const plainHeaders = Object.fromEntries(rawHeaders.entries());

    const req = new NextRequest("http://local", { headers: plainHeaders });

    let session = null;
    try {
      session = await auth({ headers: plainHeaders } as any);
    } catch {
      session = await auth();
    }

    const userId = session?.user?.id ?? null;

    const ctx = await enrichContext(req);

    return {
      ...ctx,
      requestId: ctx.requestId ?? crypto.randomUUID(),
      userId,
      sessionEmail: session?.user?.email ?? null,
      sessionUser: session?.user?.name ?? null,
      route,
    };
  } catch {
    return {
      ip: null,
      url: null,
      requestId: crypto.randomUUID(),
      method: "UNKNOWN",
      route,
      userId: null,
      sessionEmail: null,
      sessionUser: null,
      zulu: now.toISOString(),
      local: now.toLocaleString(),
      runtime: {
        node: process.version,
        region: process.env.VERCEL_REGION ?? "local",
      },
    };
  }
}
