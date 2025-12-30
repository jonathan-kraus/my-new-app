// app/maps/page.tsx
// app/(client)/maps/page.tsx
'use client';
import { SessionProvider } from "next-auth/react";
import ClientNav from "@/app/ClientNav";
export default function Maps() {
  return (
    <SessionProvider>
      <ClientNav />

    <div className="max-w-4xl space-y-6 py-4">
      <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        Interactive Weather Maps
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-2xl">🌍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Radar Map</h3>
            <p className="text-gray-600">Live precipitation</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-2xl">🌡️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Temperature</h3>
            <p className="text-gray-600">Live overlay</p>
          </div>
        </div>
      </div>
    </div>
  </SessionProvider>
  );
}
