// app/layout.tsx
import ServerSidebar from "@/app/components/ServerSidebar";
import { ToasterClient } from "@/app/components/ToasterClient";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen antialiased">
				{/* ✅ Flex container WRAPS both sidebar + main */}
				<div className="flex min-h-screen">
					<ServerSidebar />
					<main className="flex-1 overflow-auto">
						<div className="p-8 max-w-7xl mx-auto w-full">{children}</div>
						<ToasterClient />
					</main>
				</div>
				{/* ✅ Analytics/SpeedInsights outside flex */}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
