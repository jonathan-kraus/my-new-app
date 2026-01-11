import "./globals.css";
import Sidebar from "./components/Sidebar";
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
      <body className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
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
