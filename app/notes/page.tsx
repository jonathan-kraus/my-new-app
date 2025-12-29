// app/notes/page.tsx - COMPACT VERSION
export default function Notes() {
	return (
		<div className="max-w-4xl space-y-6 py-4">
			{" "}
			{/* ✅ max-w + py */}
			<h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
				Weather Notes
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{" "}
				{/* ✅ gap-4 */}
				{Array.from({ length: 6 }, (_, i) => (
					<div
						key={i}
						className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 h-32 flex flex-col justify-between"
					>
						{" "}
						{/* ✅ h-32 + flex */}
						<h3 className="font-bold text-lg text-gray-900 line-clamp-1">
							Storm Watch #{i + 1}
						</h3>{" "}
						{/* ✅ Smaller + truncate */}
						<p className="text-sm text-gray-600 line-clamp-2">
							Heavy rain expected tonight. Winds 25-35 mph.
						</p>{" "}
						{/* ✅ Smaller + truncate */}
						<div className="flex items-center space-x-2 text-xs text-gray-500 mt-auto">
							{" "}
							{/* ✅ Smaller */}
							<span>🌧️</span>
							<span>2 hours ago</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
