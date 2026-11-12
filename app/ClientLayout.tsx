"use client";

// app/ClientLayout.tsx

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/Toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-w-0 flex-1 min-h-screen bg-blue-950 p-2 sm:p-6">
      <ToastProvider>{children}</ToastProvider>
      <Analytics />
      <SpeedInsights />
    </main>
  );
}
