type AxiomEvent = Record<string, unknown>;

export async function axiomIngest<T extends AxiomEvent>(
  events: T[],
  datasetOverride?: string,
) {
  const token = process.env.AXIOM_TOKEN?.trim();
  const dataset = (datasetOverride ?? process.env.AXIOM_DATASET)?.trim();
  const baseUrl = process.env.AXIOM_URL?.trim();

  if (!token || !dataset || !baseUrl) {
    return {
      ok: true as const,
      skipped: true as const,
      reason: "missing_config",
    };
  }

  if (!events.length) {
    return {
      ok: true as const,
      skipped: true as const,
      reason: "no_events",
    };
  }

  const url =
    `${baseUrl.replace(/\/$/, "")}/v1/ingest/` + encodeURIComponent(dataset);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(events),
    });

    if (!res.ok) {
      const text = await res.text();

      throw new Error(
        `Axiom ingest failed for dataset "${dataset}": ` +
          `${res.status} ${text.slice(0, 1000)}`,
      );
    }

    return {
      ok: true as const,
      skipped: false as const,
    };
  } catch (error) {
    throw new Error(
      `Axiom ingest request failed for dataset "${dataset}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
