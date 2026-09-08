import { axiomIngest } from "@/lib/axiom";

export async function flush(batch: any[]) {
  if (!batch.length) return;

  const events = batch.map((e) => e.dataj);

  try {
    await axiomIngest(events);
    console.log(`FLUSHED ${events.length} events`);
  } catch (err) {
    console.error("Axiom flush failed", err);
  }
}
