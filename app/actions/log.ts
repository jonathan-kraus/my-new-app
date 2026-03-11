"use server";
// app/actions/log.ts
import { logit } from "@/lib/log/logit";

let eventIndex = 22;
export async function logFromClient(domain: string, payload: any) {
  return await logit(
    domain,
    {
      level: payload?.level ?? "info",
      message: payload?.message ?? "client log"
    },
    { eventIndex },
    {
      requestId: undefined,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    }
  );
}

