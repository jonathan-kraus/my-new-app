import { db } from "@/lib/db";

export async function getAstronomySnapshots() {
  const snapshots = await db.astronomySnapshot.findMany({
    orderBy: { date: "desc" },
    take: 2,
  });

  const [today, tomorrow] = snapshots;

  return { today, tomorrow };
}
