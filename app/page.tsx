// app/page.tsx

import { logit } from "@/lib/log/server";
import { Button } from "@/components/ui/button";
import CurrentWeatherCard from "@/app/components/dashboard/current-weather-card";
import { AstronomyCard } from "./components/astronomy/AstronomyCard";
import Link from "next/link";
import { db } from "@/lib/db";


function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 5) return "Good night";
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

export default async function HomePage() {
	await logit({
		level: "info",
		message: "Visited dashboard",
		file: "app/page.tsx",
		line: 21,
		sessionUser: "Jonathan",
	});

	const location = await db.location.findFirst({
		where: { isDefault: true },
	});
	if (!location) {
		return <div>No default location configured.</div>;
	}
	const weatherRes = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/weather?locationId=${location?.id}`,
		{ cache: "no-store" },
	);
	const weatherData = await weatherRes.json();
	return (
		<div className="min-h-screen bg-gradient-to-b from-sky-600 to-sky-900 text-white p-8">
			<div className="max-w-5xl mx-auto bg-sky-800/60 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
				{/* Header */}
				<section className="mb-8">
					<h1 className="text-4xl font-semibold mb-1">{getGreeting()}, Jonathan.</h1>
					<p className="text-sky-200">Your weather system is online and running smoothly.</p>
				</section>

				{/* Current Weather */}
				<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<CurrentWeatherCard location={location} />
					<AstronomyCard data={weatherData.astronomy} location={location} />
				</section>

				{/* System Health */}
				<section className="mt-10">
					<h2 className="text-xl font-medium mb-2 text-sky-200">System Health</h2>
				</section>

				{/* Runtime Controls */}
				<section className="mt-6">
					<h2 className="text-xl font-medium mb-2 text-sky-200">Runtime Controls</h2>
				</section>

				{/* Recent Activity */}
				<section className="mt-6">
					<h2 className="text-xl font-medium mb-2 text-sky-200">Recent Activity</h2>
				</section>

				{/* Quick Actions */}
				<section className="mt-8 flex gap-4">
					<Button asChild>
						<Link href="/forecast">Full Forecast</Link>
					</Button>
					<Button asChild>
						<Link href="/logs">Logs</Link>
					</Button>
					<Button asChild>
						<Link href="/locations">Locations</Link>
					</Button>
					<Button asChild>
						<Link href="/admin/runtime">Runtime Settings</Link>
					</Button>
				</section>
			</div>
		</div>
	);
}
