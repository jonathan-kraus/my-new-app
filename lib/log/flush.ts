// lib/log/flush.ts

import { client } from "@/lib/axiom";

export async function flush(batch: any[]) {
  if (!batch || batch.length === 0) return;

  try {
    await client.ingest(process.env.AXIOM_DATASET!, batch);
  } catch (err) {
    console.error("AXIOM INGEST ERROR", err);
  }
}
