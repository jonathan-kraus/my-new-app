import "./globals.css";
import ClientNav from "@/app/ClientNav";
import ClientProfileCard from "@/app/ClientProfileCard";
import { ToastProvider } from "@/components/Toast";
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
        {/* Fixed Sidebar */}
        <ClientNav />
        <ClientProfileCard />

        {/* Main Content Area */}
        <main className="ml-64 p-6 min-h-screen">

          <ToastProvider>
          {children}
          </ToastProvider>
          <Analytics />
          <SpeedInsights />

        </main>
      </body>
    </html>
  );
}
