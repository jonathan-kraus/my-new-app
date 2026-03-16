import { Axiom } from "@axiomhq/js";

const client = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  orgId: process.env.AXIOM_ORG_ID!,
});

export async function queryAxiom(apl: string) {
  const res = await client.query(apl);
  return res.matches ?? [];
}
