import { computeSolarNoon } from "@/lib/ephemeris/utils/computeSolarNoon";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { AstronomyTimeline } from "@/components/astronomy/AstronomyTimeline";
import { NextEventCard } from "@/components/astronomy/NextEventCard";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { SolarArcBar } from "@/app/components/SolarArcBar";
import { logj } from "@/lib/log/logj";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export const dynamic = "force-dynamic"; // ensure cookies + fresh SSR
export const revalidate = 60;

async function fetchWithRetry(req: NextRequest, station: string) {
  const attempt1 = await getEphemerisSnapshot(station);
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("No active session found.");
  }
  const built = await buildUniversalContext(req as any, "ASTRONOMY");
  let jei = 0;
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Astronomy fetch attempt #1",
    file: "app/dashboard/astronomy/page.tsx",
    line: 23,
    payload: {
      snapshot: !!attempt1.snapshot,
      user: session.user,
      name: session.user.name,
      email: session.user.email,
      station: station,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  if (attempt1.snapshot?.solar && attempt1.snapshot?.lunar) {
    return attempt1;
  }

  // Retry after short delay
  await new Promise((r) => setTimeout(r, 250));

  const attempt2 = await getEphemerisSnapshot(station);

  await logj({
    domain: "jonathan",
    level: "info",
    message: "Astronomy fetch attempt #2",
    file: "app/dashboard/astronomy/page.tsx",
    line: 51,
    payload: { snapshot: !!attempt2.snapshot },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return attempt2;
}

export default async function DashboardAstronomyPage(req: NextRequest) {
  const snapshot = await fetchWithRetry(req as any, "KOP");
  const solar = snapshot.snapshot?.solar ?? null;
  const lunar = snapshot.snapshot?.lunar ?? null;

  if (!solar || !lunar) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-400">
        <svg
          className="animate-spin h-8 w-8 mb-4 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
          />
        </svg>
        <div>Loading astronomy data…</div>
      </div>
    );
  }

  const solarNoon = computeSolarNoon(
    solar.sunrise.dateObj,
    solar.sunset.dateObj,
  );

  if (!solar.sunrise?.timestamp || !solar.sunset?.timestamp || !solarNoon) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-400">
        <div>Loading astronomy data…</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Astronomy</h1>
        <p className="text-white/60 mt-1">
          Solar & lunar events for{" "}
          {format(parseISO(solar.sunrise.timestamp), "MMMM dd, yyyy")}
        </p>
      </div>

      {/* Top section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NextEventCard
          nextEvent={snapshot.nextEvent!.name}
          nextEventTime={snapshot.nextEvent!.dateObj}
        />

        {/* Solar */}
        <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur">
          <h2 className="text-lg font-semibold mb-4">Solar</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Sunrise</span>
              <span>{solar.sunrise.timeLocal}</span>
            </div>
            <div className="flex justify-between">
              <span>Solar Noon</span>
              <span>
                {formatInTimeZone(solarNoon, "America/New_York", "h:mm a")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Sunset</span>
              <span>{solar.sunset.timeLocal}</span>
            </div>
          </div>
        </div>

        {/* Lunar */}
        <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur">
          <h2 className="text-lg font-semibold mb-4">Lunar</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Moonrise</span>
              <span>{lunar.moonrise?.timeLocal ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Moonset</span>
              <span>{lunar.moonset?.timeLocal ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Illumination</span>
              <span>{lunar.illumination ?? "—"}%</span>
            </div>
            <div className="flex justify-between">
              <span>Phase</span>
              <span>{lunar.phaseName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width timeline */}
      <AstronomyTimeline
        sunrise={
          solar.sunrise?.timestamp ? parseISO(solar.sunrise.timestamp) : null
        }
        sunset={
          solar.sunset?.timestamp ? parseISO(solar.sunset.timestamp) : null
        }
        moonrise={
          lunar.moonrise?.timestamp ? parseISO(lunar.moonrise.timestamp) : null
        }
        moonset={
          lunar.moonset?.timestamp ? parseISO(lunar.moonset.timestamp) : null
        }
        sunriseBlueStart={
          solar.blueHour.sunrise.start?.timestamp
            ? parseISO(solar.blueHour.sunrise.start.timestamp)
            : null
        }
        sunriseBlueEnd={
          solar.blueHour.sunrise.end?.timestamp
            ? parseISO(solar.blueHour.sunrise.end.timestamp)
            : null
        }
        sunriseGoldenStart={
          solar.goldenHour.sunrise.start?.timestamp
            ? parseISO(solar.goldenHour.sunrise.start.timestamp)
            : null
        }
        sunriseGoldenEnd={
          solar.goldenHour.sunrise.end?.timestamp
            ? parseISO(solar.goldenHour.sunrise.end.timestamp)
            : null
        }
        solarNoon={solarNoon}
        sunsetBlueStart={
          solar.blueHour.sunset.start?.timestamp
            ? parseISO(solar.blueHour.sunset.start.timestamp)
            : null
        }
        sunsetBlueEnd={
          solar.blueHour.sunset.end?.timestamp
            ? parseISO(solar.blueHour.sunset.end.timestamp)
            : null
        }
        sunsetGoldenStart={
          solar.goldenHour.sunset.start?.timestamp
            ? parseISO(solar.goldenHour.sunset.start.timestamp)
            : null
        }
        sunsetGoldenEnd={
          solar.goldenHour.sunset.end?.timestamp
            ? parseISO(solar.goldenHour.sunset.end.timestamp)
            : null
        }
      />

      <SolarArcBar
        events={{
          Sunrise: parseISO(solar.sunrise.timestamp),
          SolarNoon: solarNoon,
          Sunset: parseISO(solar.sunset.timestamp),
        }}
        currentTime={new Date()}
      />
    </div>
  );
}
