/*
 * @FilePath: \my-new-app\lib\server\travel\getNextTravelSnapshot.ts
 * @LastEditTime: 2026-02-24 19:25:06
 */
// lib/server/travel/getNextTravelSnapshot.ts

import { db } from "@/lib/db"; // adjust if needed
import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";

export async function getNextTravelSnapshot(): Promise<ParsedTravelSnapshot | null> {
  const snapshot = await db.travelSnapshot.findFirst({
    orderBy: { receivedAt: "desc" },
    include: {
      segments: true, // ← THIS IS THE FIX
    },
  });

  if (!snapshot) return null;

  return snapshot as unknown as ParsedTravelSnapshot;
}
