export function SolarProgress({
	sunrise,
	sunset,
}: {
	sunrise: Date | null;
	sunset: Date | null;
}) {
	if (!sunrise || !sunset) return null;

	const now = new Date();
	const isDay = now >= sunrise && now < sunset;

	let percent = 0;
	if (isDay) {
		const total = sunset.getTime() - sunrise.getTime();
		const elapsed = now.getTime() - sunrise.getTime();
		percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
	}

	return (
		<div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
			<div
				className="absolute top-0 left-0 h-full bg-yellow-400 transition-all"
				style={{ width: `${percent}%` }}
			/>
		</div>
	);
}
