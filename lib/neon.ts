//  lib/neon.ts
import { NeonPostgrestClient } from "@neondatabase/postgrest-js";

export function neon() {
  return new NeonPostgrestClient({
    dataApiUrl: process.env.NEON_DATA_API_URL!,
  });
}
