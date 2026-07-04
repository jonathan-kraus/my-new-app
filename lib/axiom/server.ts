/*
 * @FilePath: \my-new-app\lib\axiom\server.ts
 * @LastEditTime: 2026-07-03 20:43:35
 */
import { Axiom } from "@axiomhq/js";

/**
 * Server-side Axiom client
 * - Safe for SSR
 * - Safe for CI
 * - Uses real secrets
 */

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  orgId: process.env.AXIOM_ORG_ID!,
});

/**
 * Unified ingest function
 * - This is what your audit script already uses
 * - This is what your server logs already use
 * - This is what WebVitals (server-side) will use
 */
export async function axiomIngest(events: any[]) {
  try {
    await axiom.ingest(process.env.AXIOM_DATASET!, events);
  } catch (err) {
    console.error("Axiom ingest failed:", err);
  }
}
