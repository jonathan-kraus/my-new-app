import { snapshotAndClear } from "./queue";
import type { InternalEvent } from "./types";

let isFlushing = false;

async function sendToAxiom(batch: InternalEvent[]) {
  await fetch("https://api.axiom.co/v1/datasets/your-dataset/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
    },
    body: JSON.stringify(batch),
  });
}

export async function flush() {
  if (isFlushing) return;
  isFlushing = true;

  const batch = snapshotAndClear();
  if (batch.length === 0) {
    isFlushing = false;
    return;
  }

  try {
    await sendToAxiom(batch);
  } catch (err) {
    console.error("Axiom ingestion failed:", err);
    try {
      await sendToAxiom(batch);
    } catch (err2) {
      console.error("Axiom retry failed, dropping batch:", err2);
    }
  }

  isFlushing = false;
}
