// app/astronomy/page.tsx
import { db } from "@/lib/db";
import AstronomyClientPage from "./AstronomyClientPage";

export default async function AstronomyPage() {
  const location = await db.location.findFirst({
    where: { isDefault: true },
  });

  if (!location) {
    return (
      <div className="p-8 text-red-300">
        No default location found in the database.
      </div>
    );
  }

  const snapshots = await db.astronomySnapshot.findMany({
    where: { locationId: location.id },
    orderBy: { date: "asc" },
  });

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="p-8 text-red-300">
        No astronomy data found for {location.name}.
      </div>
    );
  }

  return (
    <AstronomyClientPage
      locationName={location.name}
      snapshots={snapshots}
    />
  );
}
