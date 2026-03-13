// lib\axiom\query.ts
import { Axiom } from "@axiomhq/js";

const client = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

export async function queryAxiom(query: string, startTime = "24h") {
  const res = await client.query(process.env.AXIOM_DATASET!, {
    query,
    startTime,
  });

  return res.matches;
}
