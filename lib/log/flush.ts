// lib\log\flush.ts
import { client } from "@/lib/axiom";

let lastFlushAt: number | null = null;

export function getLastFlushAt() {
  return lastFlushAt;
}

export async function flush(batch: any[]) {
  if (!batch.length) return;

  try {
    await client.ingest(process.env.AXIOM_DATASET!, batch);
    lastFlushAt = Date.now();
  } catch (err) {
    console.error("Axiom flush failed", err);
  }
}
