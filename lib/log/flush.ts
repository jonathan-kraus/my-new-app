import { getAxiomClient } from "@/lib/axiom";

export async function flush(batch: any[]) {
  if (!batch.length) return;

  console.log("FLUSHING BATCH", batch.length);

  try {
    const client = getAxiomClient();
    const events = batch.map(e => e.dataj);

    await client.ingest(process.env.AXIOM_DATASET!, events);

        console.log(`FLUSHING BATCH of ${events.length} events`);
  } catch (err) {
    console.error("Axiom flush failed", err);
  }
}
