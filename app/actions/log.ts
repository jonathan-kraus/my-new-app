"use server";
// app/actions/log.ts
import { logit } from "@/lib/log/logit";

export async function logFromClient(domain: string, payload: any) {
  return await logit(domain as string, payload, {});
}
