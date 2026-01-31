// app/debug/timestamps/page.tsx

import { prisma } from "@/lib/db/prisma";
import { parseISO } from "date-fns";
import { logit } from "@/lib/log/logit";

export default async function TimestampDebugPage() {
  const domain = "debug.timestamps";

  await logit(domain, {
    level: "info",
    message: "Loading timestamp debug page",
  });

  const snapshots = await prisma.astronomySnapshot.findMany({
    orderBy: { date: "desc" },
    take: 10,
  });

  return (
    <div style={{ padding: 24 }}>
      <h1>Timestamp Debugger</h1>
      <p>Showing raw vs parsed timestamps for recent snapshots.</p>

      {snapshots.map((snap) => (
        <div
          key={snap.id}
          style={{
            marginTop: 32,
            padding: 16,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        >
          <h2>{snap.date.toDateString()}</h2>

          <TimestampRow label="Sunrise" value={snap.sunrise} />
          <TimestampRow label="Sunset" value={snap.sunset} />
          <TimestampRow label="Solar Noon" value={snap.solarNoon ?? ""} />

          <TimestampRow label="Blue Start (AM)" value={snap.sunriseBlueStart} />
          <TimestampRow label="Blue End (AM)" value={snap.sunriseBlueEnd} />
          <TimestampRow label="Blue Start (PM)" value={snap.sunsetBlueStart} />
          <TimestampRow label="Blue End (PM)" value={snap.sunsetBlueEnd} />

          <TimestampRow
            label="Golden Start (AM)"
            value={snap.sunriseGoldenStart}
          />
          <TimestampRow label="Golden End (AM)" value={snap.sunriseGoldenEnd} />
          <TimestampRow
            label="Golden Start (PM)"
            value={snap.sunsetGoldenStart}
          />
          <TimestampRow label="Golden End (PM)" value={snap.sunsetGoldenEnd} />

          <TimestampRow label="Moonrise" value={snap.moonrise ?? ""} />
          <TimestampRow label="Moonset" value={snap.moonset ?? ""} />
        </div>
      ))}
    </div>
  );
}

function TimestampRow({ label, value }: { label: string; value: string }) {
  const parsed = safeParse(value);

  return (
    <div style={{ marginBottom: 12 }}>
      <strong>{label}</strong>
      <div>Raw: {value}</div>
      <div>Parsed Local: {parsed.local}</div>
      <div>Parsed UTC: {parsed.utc}</div>
      <div>Offset Detected: {parsed.offset}</div>
      {parsed.error && (
        <div style={{ color: "red" }}>Error: {parsed.error}</div>
      )}
    </div>
  );
}

function safeParse(value: string) {
  try {
    if (!value) return { local: "-", utc: "-", offset: "-", error: null };

    const date = parseISO(value);

    return {
      local: date.toString(),
      utc: date.toISOString(),
      offset: value.match(/([+-]\d{2}:\d{2})/)?.[1] ?? "NONE",
      error: null,
    };
  } catch (err: any) {
    return {
      local: "-",
      utc: "-",
      offset: "UNKNOWN",
      error: err.message,
    };
  }
}
