// lib/log/client.ts
import { CreateLogInput } from "@/lib/types";
export const dynamic = "force-dynamic";
export function logit(input: CreateLogInput) {
  // ⭐ Prevent SSR crash
  if (typeof window === "undefined") return;

  return fetch("/api/log", {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
