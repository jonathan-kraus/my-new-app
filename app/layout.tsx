// app/layout.tsx
import SideNav from "@/app/components/SideNav";
import ClientLayout from "@/app/ClientLayout";
import { WebVitals } from "@/lib/axiom/client";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <WebVitals />
      <body className="bg-blue-950 text-white min-h-screen antialiased">
        <div className="flex shrink-0 min-h-screen">
          <SideNav />
          <ClientLayout>{children}</ClientLayout>
        </div>

        <Toaster position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
