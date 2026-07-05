type AxiomEvent = Record<string, unknown>;

export async function axiomIngest<T extends AxiomEvent>(
  events: T[],
  datasetOverride?: string,
) {
  const token = process.env.AXIOM_TOKEN?.trim();
  const orgId = process.env.AXIOM_ORG_ID?.trim();
  const dataset = (datasetOverride ?? process.env.AXIOM_DATASET)?.trim();

  if (!token || !orgId || !dataset) {
    return {
      ok: true as const,
      skipped: true as const,
      reason: "missing_config",
    };
  }

  if (!events.length) {
    return { ok: true as const, skipped: true as const, reason: "no_events" };
  }

  const url = `https://api.axiom.co/v1/datasets/${encodeURIComponent(dataset)}/ingest`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Axiom-Org-Id": orgId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(events),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Axiom ingest failed for dataset "${dataset}": ${res.status} ${text.slice(0, 1000)}`,
      );
    }

    return { ok: true as const, skipped: false as const };
  } catch (error) {
    throw new Error(
      `Axiom ingest request failed for dataset "${dataset}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
