// app/(client)/layout.tsx - CLIENT SESSION
"use client";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* LEFT: Profile + Nav + Insights */}
					<aside className="lg:col-span-3 space-y-6">
						{/* Profile, Nav, Insights - same as before */}
					</aside>

					{/* MAIN CONTENT */}
					<main className="lg:col-span-9">
						<div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/60 min-h-[600px]">
							{children}
						</div>
					</main>
				</div>
			</div>
		</SessionProvider>
	);
}
