// lib/log/app-log.ts

interface GlobalContext {
  requestId?: string;
  sessionEmail?: string | null;
  sessionUser?: unknown | null;
  userId?: string | null;
}

let globalContext: GlobalContext = {};

export const logger = {
  setGlobalContext(ctx: GlobalContext) {
    globalContext = {
      ...globalContext,
      requestId: ctx.requestId,
    };
  },

  info(message: string, data: Record<string, unknown> = {}) {
    console.log(
      JSON.stringify({
        id: crypto.randomUUID(),
        level: "info",
        message,
        data,
        ...globalContext,
        createdAt: new Date().toISOString(),
      }),
    );
  },

  error(message: string, data: Record<string, unknown> = {}) {
    console.error(
      JSON.stringify({
        id: crypto.randomUUID(),
        level: "error",
        message,
        data,
        ...globalContext,
        createdAt: new Date().toISOString(),
      }),
    );
  },
};
