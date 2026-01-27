// app/dashboard/astronomy/page.tsx
import { computeSolarNoon } from "@/lib/ephemeris/utils/computeSolarNoon";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { AstronomyTimeline } from "@/components/astronomy/AstronomyTimeline";
import { NextEventCard } from "@/components/astronomy/NextEventCard";
import { format } from "date-fns";
import { SolarArcBar } from "@/app/components/SolarArcBar";
export default async function DashboardAstronomyPage() {
  const snapshot = await getEphemerisSnapshot("KOP");
  console.log("Astronomy Snapshot", snapshot);
  const solar = snapshot.solar;
  const lunar = snapshot.lunar;

  const solarNoon = computeSolarNoon(
    new Date(snapshot.solar.sunrise.timestamp),
    new Date(snapshot.solar.sunset.timestamp),
  );
  console.log("sunrise raw", snapshot.solar.sunrise.timestamp);
console.log("sunrise date", new Date(snapshot.solar.sunrise.timestamp));
console.log("sunset raw", snapshot.solar.sunset.timestamp);
console.log("sunset date", new Date(snapshot.solar.sunset.timestamp));
console.log("solarNoon", solarNoon);
  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Astronomy</h1>
        <p className="text-white/60 mt-1">
          Solar & lunar events for{" "}
          {format(new Date(snapshot.solar.sunrise.date), "MMMM d, yyyy")}
        </p>
      </div>

      {/* Top section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Event */}
        <NextEventCard
          nextEvent={snapshot.nextEvent.name}
          nextEventTime={new Date(snapshot.nextEvent.timestamp)}
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
              <span>{format(solarNoon, "h:mm a")}</span>
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
        sunrise={new Date(solar.sunrise.timestamp)}
        sunset={new Date(solar.sunset.timestamp)}
        moonrise={lunar.moonrise ? new Date(lunar.moonrise.timestamp) : null}
        moonset={lunar.moonset ? new Date(lunar.moonset.timestamp) : null}
        sunriseBlueStart={
          snapshot.solar.blueHour.sunrise.start
            ? new Date(snapshot.solar.blueHour.sunrise.start.timestamp)
            : null
        }
        sunriseBlueEnd={
          solar.blueHour.sunrise.end
            ? new Date(solar.blueHour.sunrise.end.timestamp)
            : null
        }
        sunriseGoldenStart={
          solar.goldenHour.sunrise.start
            ? new Date(solar.goldenHour.sunrise.start.timestamp)
            : null
        }
        sunriseGoldenEnd={
          solar.goldenHour.sunrise.end
            ? new Date(solar.goldenHour.sunrise.end.timestamp)
            : null
        }
        solarNoon={solarNoon}
        sunsetBlueStart={
          solar.blueHour.sunset.start
            ? new Date(solar.blueHour.sunset.start.timestamp)
            : null
        }
        sunsetBlueEnd={
          solar.blueHour.sunset.end
            ? new Date(solar.blueHour.sunset.end.timestamp)
            : null
        }
        sunsetGoldenStart={
          solar.goldenHour.sunset.start
            ? new Date(solar.goldenHour.sunset.start.timestamp)
            : null
        }
        sunsetGoldenEnd={
          solar.goldenHour.sunset.end
            ? new Date(solar.goldenHour.sunset.end.timestamp)
            : null
        }
      />
      <SolarArcBar
        events={{
          sunriseStart: new Date(
            snapshot.solar.goldenHour.sunrise.start!.timestamp,
          ), //new Date(snapshot.solar.goldenHourStart.timestamp),
          sunriseEnd: new Date(
            snapshot.solar.goldenHour.sunrise.end!.timestamp,
          ),
          solarNoon: solarNoon,
          sunsetStart: new Date(
            snapshot.solar.goldenHour.sunset.start!.timestamp,
          ),
          sunsetEnd: new Date(snapshot.solar.goldenHour.sunset.end!.dateObj),
          sunset: new Date(snapshot.solar.sunset.timestamp),
        }}
        currentTime={new Date()}
      />
    </div>
  );
}
