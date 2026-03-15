// lib/axiom/query.ts
import { Axiom } from "@axiomhq/js";
import { subMinutes } from "date-fns";

const client = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

export async function queryAxiom(
  query: string,
  minutes = 30,
  dataset = process.env.AXIOM_DATASET!, // default stays myapp_logs
) {
  const start = subMinutes(new Date(), minutes).toISOString();

  const res = await client.query(dataset, {
    query,
    startTime: start,
  });

  return res.matches;
}
