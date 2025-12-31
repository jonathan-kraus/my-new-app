"use client";

import { useEffect } from "react";
import { useLogger } from "@/lib/log";

export default function Forecast() {
  const log = useLogger();

  useEffect(() => {
    log.info("initializing forecast page", {
      endpoint: "app/forecast/page.tsx",
      createdAt: new Date().toISOString(),
    });
  }, []);

  return (
    <div className="max-w-4xl space-y-6 py-4">
      <h1 className="text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        7-Day Forecast
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/50 text-center h-32 flex flex-col justify-center"
          >
            <p className="text-sm font-bold text-gray-900 mb-2">Thu</p>
            <div className="text-2xl mx-auto mb-2">☀️</div>
            <p className="text-2xl font-bold text-gray-900">72°</p>
            <p className="text-xs text-gray-600">Sunny</p>
          </div>
        ))}
      </div>
    </div>
  );
}
