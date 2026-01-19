"use server";

import { logit } from "@/lib/log/logit";

export async function logFromClient(domain: string, payload: any) {
  logit(domain as any, payload, {});
}
