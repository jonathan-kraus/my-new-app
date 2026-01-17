"use client";

import ClientNav from "@/app/ClientNav";
import ClientProfileCard from "@/app/ClientProfileCard";
import { ToastProvider } from "@/components/Toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-blue-950 text-white">
      {/* Sidebar */}
      <ClientNav />
      <ClientProfileCard />

      {/* Main content */}
      <main className="ml-64 p-6 w-full min-h-screen">
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
        <SpeedInsights />
      </main>
    </div>
  );
}
