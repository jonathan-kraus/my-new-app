import { Axiom } from "@axiomhq/js";

export function getAxiomClient() {
  const token = process.env.AXIOM_TOKEN;

  if (!token) {
    throw new Error("Missing AXIOM_TOKEN");
  }

  return new Axiom({ token });
}
