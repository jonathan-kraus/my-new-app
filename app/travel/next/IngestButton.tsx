"use client";
/*
 * @FilePath: \my-new-app\app\travel\next\IngestButton.tsx
 * @LastEditTime: 2026-07-09 18:23:48
 */
export function IngestButton() {
  async function handleIngest() {
    await fetch("/api/travel/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source: "manual",
        email: "manual trigger"
      })
    });

    // Refresh the page so the new trip shows up
    window.location.reload();
  }

  return (
    <button
      onClick={handleIngest}
      className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
    >
      Ingest Travel Email
    </button>
  );
}
