import { axiomIngest } from "@/lib/axiom";
import type { QueueEvent } from "./queue";

export async function flush(batch: QueueEvent[]) {
  if (!batch.length) return;

  const events = batch.map((e) => e.dataj);

  try {
    await axiomIngest(events);
    console.log(`FLUSHED ${events.length} events`);
  } catch (err) {
    console.error("Axiom flush failed", err);
  }
}
