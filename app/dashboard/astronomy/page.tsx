import { getAstronomyDashboard } from "@/lib/astronomy-dashboard";

export default async function AstronomyPage() {
  const { todaySnapshot } = await getAstronomyDashboard("KOP");

  if (!todaySnapshot) {
    return <div className="p-6">No astronomy data available.</div>;
  }

  const sunrise = new Date(todaySnapshot.sunrise).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const sunset = new Date(todaySnapshot.sunset).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const moonrise = todaySnapshot.moonrise
    ? new Date(todaySnapshot.moonrise).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const moonset = todaySnapshot.moonset
    ? new Date(todaySnapshot.moonset).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

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
