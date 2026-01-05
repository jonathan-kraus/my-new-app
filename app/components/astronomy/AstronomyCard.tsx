"use client";

import { SunriseCountdown, SunsetCountdown } from "@/components/astronomy/countdown";

import { getMoonPhaseIcon, getMoonPhaseName } from "@/lib/astro/moonPhase";
import { getLightPhases, getMoonLightPhases } from "@/lib/astro/lightPhases";
import type { AstronomyCardProps } from "@/lib/types";

export function AstronomyCard({ data, location }: AstronomyCardProps) {
	if (!data) return null;

	const format = (iso: string | null | undefined) =>
		iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

	const now = new Date();
	const sunrise = data.sunrise ? new Date(data.sunrise) : null;
	const sunset = data.sunset ? new Date(data.sunset) : null;

	// Determine next solar event
	const nextSolarEvent =
		sunrise && now < sunrise
			? { type: "sunrise", time: sunrise }
			: sunset && now < sunset
				? { type: "sunset", time: sunset }
				: null;

	// Light phases
	const solarPhases = sunrise && sunset ? getLightPhases(data.sunrise, data.sunset) : null;
	const lunarPhases = getMoonLightPhases(data.moonrise, data.moonset);

	const moonIcon = getMoonPhaseIcon(now);
	const moonName = getMoonPhaseName(now);

	return (
		<div className="p-4 rounded-xl bg-gradient-to-br from-indigo-700 to-sky-800 border border-white/10 shadow-md">
			<h3 className="text-lg font-semibold mb-2 text-white">Astronomy</h3>

			<p className="text-sm text-sky-200 mb-4">
				{location.name} • 📡 {data.source} •
			</p>

			{/* Rise/Set Grid */}
			<div className="grid grid-cols-2 gap-3 text-sm text-white">
				<div>🌅 Sunrise: {format(data.sunrise)}</div>
				<div>🌇 Sunset: {format(data.sunset)}</div>

			</div>



			{/* Countdown */}
			<div className="mt-4 text-sm text-sky-200">
				{nextSolarEvent?.type === "sunrise" && (
					<SunriseCountdown sunrise={data.sunrise!} timezone={location.timezone} />
				)}
				{nextSolarEvent?.type === "sunset" && (
					<SunsetCountdown sunset={data.sunset!} timezone={location.timezone} />
				)}
			</div>

			{/* Light Phases */}
			{solarPhases && (
				<div className="mt-4 text-xs text-sky-300 space-y-1">
					<div>
						🌄 Sunrise Golden Hour:{" "}
						{solarPhases.sunriseGoldenHour.start.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}{" "}
						–{" "}
						{solarPhases.sunriseGoldenHour.end.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>

					<div>
						🌆 Sunset Golden Hour:{" "}
						{solarPhases.sunsetGoldenHour.start.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}{" "}
						–{" "}
						{solarPhases.sunsetGoldenHour.end.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>

					<div>
						🌌 Sunrise Blue Hour:{" "}
						{solarPhases.sunriseBlueHour.start.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}{" "}
						–{" "}
						{solarPhases.sunriseBlueHour.end.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>

					<div>
						🌙 Sunset Blue Hour:{" "}
						{solarPhases.sunsetBlueHour.start.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}{" "}
						–{" "}
						{solarPhases.sunsetBlueHour.end.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</div>
			)}



		</div>
	);
}
