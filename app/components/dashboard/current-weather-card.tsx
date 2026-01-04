"use client";

import { logit } from "@/lib/log/client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type CurrentWeatherCardProps = {
	location: {
		id: string;
		key: string;
		name: string;
		latitude: number;
		longitude: number;
		timezone: string;
		isDefault: boolean;
		createdAt: Date;
		updatedAt: Date;
	} | null;
};

export default function CurrentWeatherCard({ location }: CurrentWeatherCardProps) {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	logit({
		level: "info",
		message: `Rendering CurrentWeatherCard with location: ${location?.name ?? "null"}`,
		data: { locationId: location?.id ?? "null" },
		file: "app/components/dashboard/current-weather-card.tsx",
		line: 25,
		sessionUser: "jonathan-kraus",
	});

	useEffect(() => {
		if (!location) return;
		async function load(locationId: string) {
			try {
				const res = await fetch(`/api/weather?locationId=${locationId}`);
				const json = await res.json();
				setData(json);
				logit({
					level: "info",
					message: `Weather fetch → ${location?.name ?? "unknown"} | source: ${json.sources?.current ?? "unknown"} | temp: ${Math.round(json.weatherData?.temperature ?? -99)}°`,
					data: { locationId: location?.id ?? "null", json },
					file: "app/components/dashboard/current-weather-card.tsx",
					line: 41,
				});
			} catch (error) {
				logit({
					level: "error",
					message: `Error fetching weather data: ${error}`,
					data: { locationId },
					file: "app/components/dashboard/current-weather-card.tsx",
					line: 49,
					sessionUser: "jonathan-kraus",
				});
			} finally {
				setLoading(false);
			}
		}
		load(location.id);
	}, [location]);

	// ✅ Toast only when data.current.temperature is available
	useEffect(() => {
		if (data?.current?.temperature != null) {
			toast.success(`🌡️ ${Math.round(data.current.temperature)}° in ${location?.name}`, {
				duration: 4000,
			});
		}
	}, [data?.current?.temperature]);

	if (loading) {
		return (
			<div className="p-6 rounded-xl border bg-white shadow-sm animate-pulse">
				<div className="h-6 w-32 bg-gray-200 rounded mb-4" />
				<div className="h-10 w-20 bg-gray-200 rounded mb-2" />
				<div className="h-4 w-40 bg-gray-200 rounded" />
			</div>
		);
	}

	if (!data?.current) {
		return (
			<div className="p-6 rounded-xl border bg-white shadow-sm">
				<p className="text-gray-600">Unable to load weather data.</p>
			</div>
		);
	}

	const { current, sources } = data;
	logit({
		level: "info",
		message: `Fetch weather for: ${location?.name ?? "null"} from sources:
					${(sources.current ?? "null", "Temp")}: ${current.temperature ?? "null"}°`,
		data: { locationId: location?.id ?? "null", weatherData: current, sources: sources },
		file: "app/components/dashboard/current-weather-card.tsx",
		line: 92,
	});
	return (
		<div className="p-6 rounded-xl border bg-sky-700/60 backdrop-blur-md text-white shadow-md transition-all duration-300 hover:shadow-lg">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Current Weather</h2>
				<span
					className={`text-xs px-2 py-1 rounded-full ${
						sources.current === "cache"
							? "bg-blue-100 text-blue-700"
							: "bg-green-100 text-green-700"
					}`}
				>
					{sources.current.toUpperCase()}
				</span>
			</div>

			<div className="flex items-center bg-blue-500 gap-4">
				<div className="flex flex-col items-center">
					<div className="text-sm text-muted-foreground">Temp</div>
					<div className="text-5xl font-bold text-yellow-500">
						{Math.round(current.temperature)}°
					</div>
				</div>
				<div className="text-sky-200">
					<div>Feels like {Math.round(current.feelsLike)}°</div>
					<div className="text-sm mt-1">Humidity: {current.humidity}%</div>
					<div className="text-sm">Wind: {current.windSpeed} mph</div>
				</div>
			</div>

			<div className="mt-4 text-sm text-sky-200">
				Updated {new Date(current.fetchedAt).toLocaleTimeString()}
			</div>
		</div>
	);
}
