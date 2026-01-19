// lib/log/app-log.ts
type LogLevel = "info" | "warn" | "error";

interface GlobalContext {
  requestId?: string;
  sessionEmail?: string | null;
  sessionUser?: any | null;
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

  info(message: string, data: Record<string, any> = {}) {
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

  error(message: string, data: Record<string, any> = {}) {
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
