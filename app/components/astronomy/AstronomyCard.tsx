// Add this NEW component
export const AstronomyCard = ({ data, location }: { data: any; location: any }) => {
	const astronomy = data?.astronomy;

	if (!astronomy) {
		return (
			<div className="p-6 rounded-xl border bg-white shadow-sm">
				<p>Astronomy data unavailable</p>
			</div>
		);
	}

	return (
		<div className="p-6 rounded-xl border bg-purple-700/60 backdrop-blur-md text-white shadow-md">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">🌅 Astronomy</h2>
				<span
					className={`text-xs px-2 py-1 rounded-full ${
						data.sources.astronomy === "cache"
							? "bg-blue-100 text-blue-700"
							: "bg-green-100 text-green-700"
					}`}
				>
					{data.sources.astronomy.toUpperCase()}
				</span>
			</div>

			<div className="grid grid-cols-2 gap-4 text-center">
				<div>
					<div className="text-2xl font-bold">
						{new Date(astronomy.sunrise).toLocaleTimeString()}
					</div>
					<div className="text-sm opacity-90">Sunrise</div>
				</div>
				<div>
					<div className="text-2xl font-bold">
						{new Date(astronomy.sunset).toLocaleTimeString()}
					</div>
					<div className="text-sm opacity-90">Sunset</div>
				</div>
			</div>

			{/* Your existing SunsetCountdown */}
			{/* {astronomy.sunset && (
        <SunsetCountdown
          sunsetIso={astronomy.sunset}
          locationName={location?.name || "Location"}
        />
      )} */}
		</div>
	);
};
