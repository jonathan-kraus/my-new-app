/*
 * @FilePath: \my-new-app\lib\axiom\query.ts
 * @LastEditTime: 2026-08-04 13:49:08
 */
import { Axiom } from "@axiomhq/js";

const client = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  orgId: process.env.AXIOM_ORG_ID!,
});

/**
 * Convert tabular query result into an array of row objects
 * (roughly equivalent to the old `matches[].data`).
 */
function tabularToRows(res: {
  tables?: Array<{
    fields: Array<{ name: string }>;
    columns: unknown[][];
  }>;
}): Record<string, unknown>[] {
  const table = res.tables?.[0];
  if (!table?.fields?.length || !table.columns?.length) {
    return [];
  }

  const { fields, columns } = table;
  const rowCount = columns[0]?.length ?? 0;
  const rows: Record<string, unknown>[] = [];

  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, unknown> = {};
    for (let c = 0; c < fields.length; c++) {
      const field = fields[c];
      if (!field) continue;
      row[field.name] = columns[c]?.[i];
    }
    rows.push(row);
  }

  return rows;
}

export async function queryAxiom(apl: string) {
  const res = await client.query(apl);
  return tabularToRows(res as any);
}
