import "server-only";
import { mbtaDb } from "./db";

export async function getStopName(stopId: string) {
  const stop = await mbtaDb.orm.public.MbtaStop.where({ id: stopId })
    .select("name")
    .first();
  return stop?.name ?? stopId;
}
