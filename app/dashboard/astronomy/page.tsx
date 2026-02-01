// app/dashboard/astronomy/page.tsx
import { computeSolarNoon } from "@/lib/ephemeris/utils/computeSolarNoon";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { AstronomyTimeline } from "@/components/astronomy/AstronomyTimeline";
import { NextEventCard } from "@/components/astronomy/NextEventCard";
import { format } from "date-fns";
import { SolarArcBar } from "@/app/components/SolarArcBar";
import { DateTime } from "luxon";

export default async function DashboardAstronomyPage() {
  const snapshot = await getEphemerisSnapshot("KOP");
  const solar = snapshot.snapshot?.solar ?? null;
  const lunar = snapshot.snapshot?.lunar ?? null;
  if (!solar || !lunar) {
    return (
      <div className="p-4 text-gray-500">
        {" "}
        No astronomy data available yet.{" "}
      </div>
    );
  }

  const solarNoon = computeSolarNoon(
    solar!.sunrise.dateObj,
    solar!.sunset.dateObj,
  );
  console.log("sunrise raw", solar!.sunrise.timestamp);
  console.log("sunrise date", DateTime.fromISO(solar!.sunrise.timestamp));
  console.log("sunset raw", solar!.sunset.timestamp);
  console.log("sunset date", DateTime.fromISO(solar!.sunset.timestamp));
  console.log("solarNoon", solarNoon);

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Astronomy</h1>
        <p className="text-white/60 mt-1">
          Solar & lunar events for{" "}
          {format(
            DateTime.fromISO(solar!.sunrise.date).toJSDate(),
            "MMMM d, yyyy",
          )}
        </p>
      </div>

      {/* Top section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Event */}
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
                {DateTime.fromJSDate(solarNoon, {
                  zone: "America/New_York",
                }).toFormat("h:mm a")}
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
        sunrise={DateTime.fromISO(solar.sunrise.timestamp, {
          setZone: true,
        }).toJSDate()}
        sunset={DateTime.fromISO(solar.sunset.timestamp, {
          setZone: true,
        }).toJSDate()}
        moonrise={
          lunar.moonrise
            ? DateTime.fromISO(lunar.moonrise.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
        moonset={
          lunar.moonset
            ? DateTime.fromISO(lunar.moonset.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
        sunriseBlueStart={
          solar.blueHour.sunrise.start
            ? DateTime.fromISO(solar.blueHour.sunrise.start.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
        sunriseBlueEnd={
          solar.blueHour.sunrise.end
            ? DateTime.fromISO(solar.blueHour.sunrise.end.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
        sunriseGoldenStart={
          solar.goldenHour.sunrise.start
            ? DateTime.fromISO(solar.goldenHour.sunrise.start.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
        sunriseGoldenEnd={
          solar.goldenHour.sunrise.end
            ? DateTime.fromISO(solar.goldenHour.sunrise.end.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
        solarNoon={solarNoon}
        sunsetBlueStart={
          solar.blueHour.sunset.start
            ? DateTime.fromISO(solar.blueHour.sunset.start.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
        sunsetBlueEnd={
          solar.blueHour.sunset.end
            ? DateTime.fromISO(solar.blueHour.sunset.end.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
        sunsetGoldenStart={
          solar.goldenHour.sunset.start
            ? DateTime.fromISO(solar.goldenHour.sunset.start.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
        sunsetGoldenEnd={
          solar.goldenHour.sunset.end
            ? DateTime.fromISO(solar.goldenHour.sunset.end.timestamp, {
                setZone: true,
              }).toJSDate()
            : null
        }
      />
      <SolarArcBar
        events={{
          sunriseStart: DateTime.fromISO(
            solar.goldenHour.sunrise.start!.timestamp,
            { setZone: true },
          ).toJSDate(),
          sunriseEnd: DateTime.fromISO(
            solar.goldenHour.sunrise.end!.timestamp,
            { setZone: true },
          ).toJSDate(),
          solarNoon,
          sunsetStart: DateTime.fromISO(
            solar.goldenHour.sunset.start!.timestamp,
            { setZone: true },
          ).toJSDate(),
          sunsetEnd: DateTime.fromISO(solar.goldenHour.sunset.end!.timestamp, {
            setZone: true,
          }).toJSDate(),
          sunset: DateTime.fromISO(solar.sunset.timestamp, {
            setZone: true,
          }).toJSDate(),
        }}
        currentTime={new Date()}
      />
    </div>
  );
}
