import { client } from "@/lib/axiom";

let lastFlushAt: number | null = null;

export function getLastFlushAt() {
  return lastFlushAt;
}
export async function flush(batch: any[]) {
  if (!batch.length) return;

  console.log("FLUSHING BATCH", batch.length);

  const events = batch.map((e) => e.dataj);

  try {
    const res = await fetch(
      `https://api.axiom.co/v1/datasets/${process.env.AXIOM_DATASET}/ingest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
        },
        body: JSON.stringify(events),
      },
    );
    console.log(`FLUSHING BATCH of ${events.length} events`);
    if (!res.ok) {
      const text = await res.text(); // <-- capture HTML or JSON
      console.error("Axiom ingest failed:", res.status, text);
      return;
    }

    console.log("INGEST COMPLETE");
    lastFlushAt = Date.now();
  } catch (err) {
    console.error("Axiom flush threw:", err);
  }
}
