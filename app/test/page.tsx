// app/test/page.jsx
import React from "react";
import { getConfig } from "@/lib/runtime/config";
export default async function TestPage() {
  // Replace this with your flag/variable later

  const msg = await getConfig("ephemDebug", "no_data");
  if (msg === "no_data") {
    console.warn(
      "No value found for 'ephemDebug' in config. Make sure to set it before testing.",
    );
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-8">
      <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-3">
        Weather Dashboard
      </h1>

      <a
        href="/dashboard"
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-colors duration-300"
      >
        {msg}
      </a>
    </main>
  );
}
