"use client";

import { useEffect } from "react";
import { logit } from "@/lib/log/client";
import { Button } from "@/components/ui/button";
import CurrentWeatherCard from "@/app/components/dashboard/current-weather-card";
import Link from "next/link";
// import { TodayAtAGlanceCard } from "@/components/dashboard/today-at-a-glance-card";
// import { AstronomyCard } from "@/components/dashboard/astronomy-card";
// import { SystemHealthGrid } from "@/components/dashboard/system-health-grid";
// import { RuntimeConfigPanel } from "@/components/dashboard/runtime-config-panel";
// import { RecentLogsFeed } from "@/components/dashboard/recent-logs-feed";

export default function HomePage() {
	useEffect(() => {
		logit({
			level: "info",
			message: "Visited dashboard",
			file: "app/page.tsx",
			line: 16,
			sessionUser: "Jonathan",
		});
	}, []);
	return (
		<div className="space-y-8 p-6">
			{/* Header */}
			<section>
				<h1 className="text-3xl font-semibold">Good evening, Jonathan.</h1>
				<p className="text-muted-foreground">Your weather system is online and running smoothly.</p>
			</section>

			{/* Current Weather */}
			<section className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<CurrentWeatherCard />
				{/* <TodayAtAGlanceCard /> */}
				{/* <AstronomyCard /> */}
			</section>

			{/* System Health */}
			<section>
				<h2 className="text-xl font-medium mb-2">System Health</h2>
				{/* <SystemHealthGrid /> */}
			</section>

			{/* Runtime Controls */}
			<section>
				<h2 className="text-xl font-medium mb-2">Runtime Controls</h2>
				{/* <RuntimeConfigPanel /> */}
			</section>

			{/* Recent Activity */}
			<section>
				<h2 className="text-xl font-medium mb-2">Recent Activity</h2>
				{/* <RecentLogsFeed /> */}
			</section>

			{/* Quick Actions */}
			<section className="flex gap-4">
				<section className="flex gap-4">
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
			</section>
		</div>
	);
}
