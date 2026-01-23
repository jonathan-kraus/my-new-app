// app/solar/page.tsx
import { getSolarSnapshot } from "@/lib/ephemeris/getSolarSnapshot";
import SolarCard from "@/app/components/ephemeris/solarCard";

export default async function SolarPage() {
  const snapshot = await getSolarSnapshot();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Solar Overview</h1>
      <SolarCard snapshot={snapshot} />
    </div>
  );
}
