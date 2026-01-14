import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import ClientLayout from "@/app/client-layout";

import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-blue-950 text-white min-h-screen">
        <ClientLayout>
{children}
        <Sidebar />
</ClientLayout>
        <main className="ml-64 p-6">
          {children}

          {/* Vercel Analytics */}
          <Analytics />
          <Toaster position="top-right" reverseOrder={false} />
          {/* Vercel Speed Insights */}
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
