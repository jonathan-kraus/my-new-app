// lib/axiom.ts
import { Axiom } from "@axiomhq/js";

export const client = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  orgId: process.env.AXIOM_ORG_ID!,
});
