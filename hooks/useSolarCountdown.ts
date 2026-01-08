"use client";

//import { logit } from "@/lib/log/client";
import { useEffect, useState } from "react";

export function useSolarCountdown(sunrise: Date, sunset: Date) {
	const [now, setNow] = useState(new Date());

	// Tick every second
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	// Helper: compute diff
	function diff(target: Date) {
		const ms = target.getTime() - now.getTime();
		if (ms <= 0) return { hours: 0, minutes: 0, seconds: 0 };

		const hours = Math.floor(ms / 1000 / 60 / 60);
		const minutes = Math.floor((ms / 1000 / 60) % 60);
		const seconds = Math.floor((ms / 1000) % 60);

		return { hours, minutes, seconds };
	}

	// Determine next event
	let nextEventLabel: "Sunrise" | "Sunset" | "Tomorrow's Sunrise";
	let nextCountdown;

	if (now < sunrise) {
		nextEventLabel = "Sunrise";
		nextCountdown = diff(sunrise);
	} else if (now < sunset) {
		nextEventLabel = "Sunset";
		nextCountdown = diff(sunset);
	} else {
		// After sunset → tomorrow's sunrise
		nextEventLabel = "Tomorrow's Sunrise";
		nextCountdown = diff(sunrise); // caller should pass tomorrow's sunrise here
	}
	// logit({
	//   level: "debug",
	//   message: `Solar countdown - now: ${now.toISOString()}, sunrise: ${sunrise.toISOString()}, sunset: ${sunset.toISOString()}, nextEvent: ${nextEventLabel}, countdown: ${JSON.stringify(nextCountdown)}`,
	//   file: "useSolarCountdown.ts",
	//   line: 42,
	// });
	// Day length
	const dayLengthMs = sunset.getTime() - sunrise.getTime();
	const dayLengthHours = dayLengthMs / 1000 / 60 / 60;

	// Progress bar
	const isDaytime = now >= sunrise && now <= sunset;
	const elapsedMs = now.getTime() - sunrise.getTime();
	const progressPercent = isDaytime
		? Math.min(100, Math.max(0, (elapsedMs / dayLengthMs) * 100))
		: 0;

	return {
		now,
		sunrise,
		sunset,
		nextEventLabel,
		nextCountdown,
		dayLengthHours,
		progressPercent,
	};
}
