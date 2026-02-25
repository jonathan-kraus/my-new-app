import { client } from "@/lib/axiom";

let lastFlushAt: number | null = null;

export function getLastFlushAt() {
  return lastFlushAt;
}
export async function flush(batch: any[]) {
  if (!batch.length) return;

  console.log("FLUSHING BATCH", batch.length);

  try {
    // Send only the actual event objects
    const events = batch.map(e => e.dataj);

   client.ingest(process.env.AXIOM_DATASET!, events);

    console.log(`FLUSHING BATCH of ${events.length} events`);

    lastFlushAt = Date.now();
  } catch (err) {
    console.error("Axiom flush failed", err);
  }
}
