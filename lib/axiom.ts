// lib/axiom.ts
import { Axiom } from "@axiomhq/js";

export function getAxiomClient() {
  const token = process.env.AXIOM_TOKEN;
  const orgId = process.env.AXIOM_ORG_ID;

  if (!token || !orgId) {
    throw new Error("Missing Axiom environment variables");
  }

  return new Axiom({ token, orgId });
}
