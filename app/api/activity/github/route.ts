import { NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

