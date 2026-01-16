import { getAstronomyDashboard } from "@/lib/astronomy-dashboard";
import { formatTime } from "@/lib/astronomy/formatTime";
export default async function AstronomyPage() {
  const { todaySnapshot } = await getAstronomyDashboard("KOP");

  if (!todaySnapshot) {
    return <div className="p-6">No astronomy data available.</div>;
  }

  const sunrise = formatTime(todaySnapshot.sunrise);

  const sunset = formatTime(todaySnapshot.sunset);

  const moonrise = formatTime(todaySnapshot.moonrise);

  const moonset = formatTime(todaySnapshot.moonset);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Astronomy for {todaySnapshot.date.getFullYear()}-
        {String(todaySnapshot.date.getMonth() + 1).padStart(2, "0")}-
        {String(todaySnapshot.date.getDate()).padStart(2, "0")}
      </h2>

      <p>🌅 Sunrise: {sunrise}</p>
      <p>🌇 Sunset: {sunset}</p>
      <p>🌕 Moonrise: {moonrise}</p>
      <p>🌑 Moonset: {moonset}</p>
      <p>🌗 Moon Phase: {todaySnapshot.moonPhase}</p>
    </div>
  );
}
