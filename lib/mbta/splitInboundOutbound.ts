/*
 * @FilePath: \my-new-app\lib\mbta\splitInboundOutbound.ts
 * @LastEditTime: 2026-08-25 14:11:55
 */
import { MBTAPrediction } from "./types";

export function splitInboundOutbound(predictions: MBTAPrediction[]) {
  const filtered = predictions.filter(
    (p) => p.relationships.stop.data.id === "place-denrd",
  );

  const sorted = filtered.sort(
    (a, b) => a.attributes.stop_sequence - b.attributes.stop_sequence,
  );

  const inbound: MBTAPrediction[] = [];
  const outbound: MBTAPrediction[] = [];

  for (const p of sorted) {
    const dir = p.attributes.direction_id;
    const seq = p.attributes.stop_sequence;

    if (dir === 1) inbound.push(p);
    else if (dir === 0) outbound.push(p);
    else {
      if (seq >= 20) inbound.push(p);
      else outbound.push(p);
    }
  }

  return { inbound, outbound };
}
