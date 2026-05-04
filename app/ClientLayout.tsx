"use client";
// app/ClientLayout.tsx

import { ToastProvider } from "@/components/Toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
return (
  <main className="ml-64 p-6 flex-1 min-h-screen bg-blue-950">
    <ToastProvider>{children}</ToastProvider>
    <Analytics />
    <SpeedInsights />
  </main>
);
}
