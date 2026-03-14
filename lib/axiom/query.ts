// lib\axiom\query.ts
import { Axiom } from "@axiomhq/js";
import { subMinutes } from "date-fns";

const client = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

export async function queryAxiom(query: string, minutes = 30) {
  const start = subMinutes(new Date(), minutes).toISOString();

  const res = await client.query(process.env.AXIOM_DATASET!, {
    query,
    startTime: start, // ISO timestamp — Axiom loves this
  });

  return res.matches;
}
