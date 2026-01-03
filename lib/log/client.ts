// lib/log/client.ts
import { CreateLogInput } from "@/lib/types";

export function logit(input: CreateLogInput) {
  return fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
