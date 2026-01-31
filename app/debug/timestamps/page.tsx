"use client";

import { useEffect, useState } from "react";

interface Snapshot {
  date: string;
  sunrise: string;
  sunset: string;
  solarNoon: string | null;

  sunriseBlueStart: string | null;
  sunriseBlueEnd: string | null;
  sunsetBlueStart: string | null;
  sunsetBlueEnd: string | null;

  sunriseGoldenStart: string | null;
  sunriseGoldenEnd: string | null;
  sunsetGoldenStart: string | null;
  sunsetGoldenEnd: string | null;

  moonrise: string | null;
  moonset: string | null;

  illumination: number | null;
  phaseName: string | null;
  moonPhase: number | null;
}

function TimestampRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-700">
      <span className="font-medium text-gray-300">{label}</span>
      <span className="text-gray-100">{value}</span>
    </div>
  );
}

export default function TimestampDebugPage() {
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
async function load() { const res = await fetch("/api/debug/timestamps"); const json = await res.json(); console.log("DEBUG TIMESTAMPS RESPONSE:", json); setSnap(json.snapshot); }
    load();
  }, []);

  if (!snap) {
    return <div className="p-6 text-gray-300">Loading…</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-100 mb-4">
        Timestamp Debug
      </h1>

      <TimestampRow label="Date" value={snap.date} />
      <TimestampRow label="Sunrise" value={snap.sunrise} />
      <TimestampRow label="Sunset" value={snap.sunset} />
      <TimestampRow label="Solar Noon" value={snap.solarNoon ?? ""} />

      <h2 className="text-xl font-semibold text-gray-200 mt-4">Blue Hour</h2>
      <TimestampRow label="Blue Start (AM)" value={snap.sunriseBlueStart ?? ""} />
      <TimestampRow label="Blue End (AM)" value={snap.sunriseBlueEnd ?? ""} />
      <TimestampRow label="Blue Start (PM)" value={snap.sunsetBlueStart ?? ""} />
      <TimestampRow label="Blue End (PM)" value={snap.sunsetBlueEnd ?? ""} />

      <h2 className="text-xl font-semibold text-gray-200 mt-4">Golden Hour</h2>
      <TimestampRow label="Golden Start (AM)" value={snap.sunriseGoldenStart ?? ""} />
      <TimestampRow label="Golden End (AM)" value={snap.sunriseGoldenEnd ?? ""} />
      <TimestampRow label="Golden Start (PM)" value={snap.sunsetGoldenStart ?? ""} />
      <TimestampRow label="Golden End (PM)" value={snap.sunsetGoldenEnd ?? ""} />

      <h2 className="text-xl font-semibold text-gray-200 mt-4">Moon</h2>
      <TimestampRow label="Moonrise" value={snap.moonrise ?? ""} />
      <TimestampRow label="Moonset" value={snap.moonset ?? ""} />
      <TimestampRow label="Illumination" value={snap.illumination?.toString() ?? ""} />
      <TimestampRow label="Phase Name" value={snap.phaseName ?? ""} />
      <TimestampRow label="Moon Phase" value={snap.moonPhase?.toString() ?? ""} />
    </div>
  );
}
