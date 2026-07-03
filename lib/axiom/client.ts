"use client";
// lib\axiom\client.ts
import { Logger, AxiomJSTransport } from "@axiomhq/logging";
import { Axiom } from "@axiomhq/js";
import { createUseLogger, createWebVitalsComponent } from "@axiomhq/react";

const axiomClient = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  orgId: process.env.AXIOM_ORG_ID!,
});

export const logger = new Logger({
  transports: [
    new AxiomJSTransport({
      axiom: axiomClient,
      dataset: process.env.NEXT_PUBLIC_AXIOM_DATASET!,
    }),
  ],
});

export const useLogger = createUseLogger(logger);
export const WebVitals = createWebVitalsComponent(logger);
