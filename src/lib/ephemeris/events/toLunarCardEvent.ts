/*
 * @FilePath: \my-new-app\lib\ephemeris\events\toLunarCardEvent.ts
 * @LastEditTime: 2026-05-11 04:18:46
 */
import type { LunarSnapshot } from "@/lib/ephemeris/types";
import { getNextLunarEvent } from "@/lib/ephemeris/getNextLunarEvent";

export function toLunarCardEvent(snapshot: LunarSnapshot) {
  const next = getNextLunarEvent({
    moonriseAbsolute: snapshot.moonrise?.timestamp ?? null,
    moonsetAbsolute: snapshot.moonset?.timestamp ?? null,
  });

  return {
    name: next.name,
    timeLocal: next.timeFormatted, // LunarCard expects this field
  };
}
