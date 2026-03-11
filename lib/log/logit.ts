export async function logit(
  domain: string,
  event: Record<string, any>,
  payload: Record<string, any>,
  meta: Record<string, any>,
) {
  // Generate canonical timestamp
  const timestamp = new Date().toISOString();

  // Flatten payload (you can add your eventIndex logic here if needed)
  const flatPayload = {
    ...payload,
  };

  // Flatten meta (already includes zulu + local from codemod)
  const flatMeta = {
    ...meta,
  };

  // Build the final structured log record
  const logEvent = {
    domain,
    level: event.level ?? "info",
    message: event.message ?? "",
    timestamp,
    payload: flatPayload,
    meta: flatMeta,
  };

  // --- Neon ingestion (if enabled) ---
  try {
    // await neonClient.insert(logEvent);
  } catch (err) {
    console.error("Neon log ingestion failed:", err);
  }

  // --- Axiom ingestion (if enabled) ---
  try {
    // await axiom.ingest("logs", logEvent);
  } catch (err) {
    console.error("Axiom log ingestion failed:", err);
  }

  return logEvent;
}
