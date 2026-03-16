export async function axiomIngest(events: any[], datasetOverride?: string) {
  const token = process.env.AXIOM_TOKEN!;
  const orgId = process.env.AXIOM_ORG_ID!;
  const dataset = datasetOverride ?? process.env.AXIOM_DATASET!;
  const url = `https://api.axiom.co/v1/datasets/${dataset}/ingest`;

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
    throw new Error(`Axiom ingest failed: ${res.status} ${text}`);
  }

  return { ok: true };
}
