// app/(client)/layout.tsx - SIDEBAR + SESSION
"use client";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* LEFT SIDEBAR */}
					<aside className="lg:col-span-3 space-y-6">
						{/* PROFILE */}
						<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 sticky top-6">
							<div className="text-center">
								<div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
									<span className="text-2xl font-bold text-white">J</span>
								</div>
								<h2 className="text-2xl font-bold text-gray-900 mb-2">Jonathan</h2>
								<p className="text-gray-600 text-sm mb-6">email</p>
								<button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg">
									Logout
								</button>
							</div>
						</div>

						{/* NAV */}
						<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 space-y-2">
							<a
								href="/"
								className="block p-4 rounded-xl bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600"
							>
								🏠 Home
							</a>
							<a
								href="/notes"
								className="block p-4 rounded-xl bg-purple-500 text-white font-semibold shadow-md hover:bg-purple-600"
							>
								📝 Notes
							</a>
							<a
								href="/files"
								className="block p-4 rounded-xl bg-indigo-500 text-white font-semibold shadow-md hover:bg-indigo-600"
							>
								📁 Files
							</a>
							<a
								href="/weather-maps"
								className="block p-4 rounded-xl bg-emerald-500 text-white font-semibold shadow-md hover:bg-emerald-600"
							>
								🌤️ Weather
							</a>
						</div>
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
