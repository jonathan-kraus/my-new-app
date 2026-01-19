export function buildWeatherEmail({
  locationName,
  current,
  astronomy,
  source,
}: {
  locationName: string;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    fetchedAt: string;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moonPhaseName: string;
    moonPhaseEmoji: string;
  };
  source: string;
}) {
  const updated = new Date(current.fetchedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    subject: `Weather Update for ${locationName}`,
    text: `
Weather Update for ${locationName}

Temperature: ${current.temperature}°
Feels Like: ${current.feelsLike}°
Humidity: ${current.humidity}%
Wind: ${current.windSpeed} mph
Updated: ${updated}
Source: ${source}

Sunrise: ${astronomy.sunrise}
Sunset: ${astronomy.sunset}
Moonrise: ${astronomy.moonrise}
Moonset: ${astronomy.moonset}
Moon Phase: ${astronomy.moonPhaseEmoji} ${astronomy.moonPhaseName}
    `.trim(),

    html: `
<div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f9fc;">
  <h2 style="color: #1e3a8a; margin-bottom: 10px;">Weather Update for ${locationName}</h2>
  <p style="color: #555; margin-top: 0;">Updated ${updated} • Source: ${source}</p>

  <div style="background: white; padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
    <h3 style="color: #1e40af; margin-bottom: 8px;">Current Weather</h3>
    <p>🌡️ <strong>Temperature:</strong> ${current.temperature}°</p>
    <p>🥶 <strong>Feels Like:</strong> ${current.feelsLike}°</p>
    <p>💧 <strong>Humidity:</strong> ${current.humidity}%</p>
    <p>💨 <strong>Wind:</strong> ${current.windSpeed} mph</p>
  </div>

  <div style="background: white; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb;">
    <h3 style="color: #1e40af; margin-bottom: 8px;">Astronomy</h3>
    <p>🌅 <strong>Sunrise:</strong> ${astronomy.sunrise}</p>
    <p>🌇 <strong>Sunset:</strong> ${astronomy.sunset}</p>
    <p>🌕 <strong>Moonrise:</strong> ${astronomy.moonrise}</p>
    <p>🌘 <strong>Moonset:</strong> ${astronomy.moonset}</p>
    <p>${astronomy.moonPhaseEmoji} <strong>Moon Phase:</strong> ${astronomy.moonPhaseName}</p>
  </div>

  <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
    Sent automatically from your dashboard.
  </p>
</div>
    `.trim(),
  };
}
