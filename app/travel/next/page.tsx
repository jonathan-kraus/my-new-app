// app/(dashboard)/travel/next/page.tsx

import { TripSummaryCard } from "@/components/travel/TripSummaryCard";
import { WeatherCard } from "@/components/travel/WeatherCard";
import { NextEventCountdown } from "@/components/travel/NextEventCountdown";
import { SendWeatherEmailButton } from "@/components/travel/SendWeatherEmailButton";

import { getNextTravelSnapshot } from "@/lib/server/travel/getNextTravelSnapshot";
import { getWeatherForTrip } from "@/lib/server/weather/getWeatherForTrip";

export default async function TravelNextPage() {
  const snapshot = await getNextTravelSnapshot();

  // If no upcoming trip, render a gentle empty state
  if (!snapshot) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-100">Your Next Trip</h1>
        <div className="bg-gray-900 rounded-lg p-4 text-gray-300">
          No upcoming trips found. Once a new AA email is parsed, your next trip
          will appear here.
        </div>
      </div>
    );
  }

  const weather = await getWeatherForTrip(snapshot);

  return (
    <div className="p-6 space-y-8">
      {/* Page title */}
      <h1 className="text-2xl font-semibold text-gray-100">Your Next Trip</h1>

      {/* Two-column responsive layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: trip + countdown */}
        <div className="space-y-6">
          <TripSummaryCard snapshot={snapshot} />
          <NextEventCountdown snapshot={snapshot} />
        </div>

        {/* RIGHT COLUMN: weather + email action */}
        <div className="space-y-6">
          <WeatherCard snapshot={snapshot} weather={weather} />

          <div className="pt-2">
            <SendWeatherEmailButton />
          </div>
        </div>
      </div>
    </div>
  );
}
