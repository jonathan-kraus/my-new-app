// lib\log\flush.ts
import { client } from "@/lib/axiom";
  import { Logger } from 'next-axiom';
let lastFlushAt: number | null = null;

export function getLastFlushAt() {
  return lastFlushAt;
}

export async function flush(batch: any[]) {


const log = new Logger();

// Add logs to batch
log.info('message 1');
log.info('message 2');

// Check if there are pending logs
console.log('Pending logs:', log.logEvents, log.logEvents.length,batch.length); // If accessible



  if (!batch.length) return;

  try {
    await client.ingest(process.env.AXIOM_DATASET!, batch);
    lastFlushAt = Date.now();
  } catch (err) {
    console.error("Axiom flush failed", err);
  }
}
