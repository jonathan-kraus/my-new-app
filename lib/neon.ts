// lib/neon.ts
import { NeonPostgrestClient, fetchWithToken } from "@neondatabase/postgrest-js";

export function neon() {
  return new NeonPostgrestClient({
    dataApiUrl: process.env.NEON_DATA_API_URL!,
    options: {
      global: {
        fetch: fetchWithToken(async () => process.env.NEON_DATA_API_KEY ?? null),
      },
    },
  });
}
