"use client";

import { useEffect, useState } from "react";
import { appLog } from "@/lib/logger";

type WeatherSnapshot = {
	temperature: number;
	feelsLike?: number;
	humidity?: number;
	windSpeed?: number;
	windDirection?: number;
	pressure?: number;
	visibility?: number;
	weatherCode?: number;
	fetchedAt: string;
};

export default function ForecastPage() {
	const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
	const [error, setError] = useState<string | null>(null);
console.log("🔥 forecast page executed");

	useEffect(() => {
		appLog({
			level: "info",
			message: "Forecast page mounted",
			page: "/forecast",
		});

		const loadWeather = async () => {
			try {
				const res = await fetch("/api/weather");

				if (!res.ok) {
					throw new Error(`Weather fetch failed (${res.status})`);
				}

				const json = await res.json();
				setWeather(json.data);
			} catch (err) {
				console.error(err);
				setError("Unable to load weather data");
			}
		};

		loadWeather();
	}, []);

	if (error) {
		return <div className="text-red-600">{error}</div>;
	}
	if (!weather) {
		return (
			<div className="max-w-4xl space-y-4 py-4 animate-pulse">
				<div className="h-8 w-48 bg-gray-200 rounded" />
				<div className="h-32 bg-gray-200 rounded-xl" />
			</div>
		);
	}

	return (
		<div className="max-w-4xl space-y-6 py-4">
			<h1 className="text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
				Current Weather
			</h1>

			<div className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/50">
				<p className="text-2xl font-bold">
					{weather.temperature}°F
					{weather.feelsLike && (
						<span className="text-sm text-gray-600"> (feels like {weather.feelsLike}°F)</span>
					)}
				</p>

				<div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
					{weather.humidity !== undefined && <p>Humidity: {Math.round(weather.humidity * 100)}%</p>}
					{weather.windSpeed !== undefined && <p>Wind: {weather.windSpeed} mph</p>}
					{weather.pressure !== undefined && <p>Pressure: {weather.pressure} inHg</p>}
					{weather.visibility !== undefined && <p>Visibility: {weather.visibility} mi</p>}
				</div>

				<p className="mt-4 text-xs text-gray-500">
					Updated at {new Date(weather.fetchedAt).toLocaleTimeString()}
				</p>
			</div>
		</div>
	);
}
