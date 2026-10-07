"use client";
// app/layout.tsx
import SideNav from "@/app/components/SideNav";
import ClientLayout from "@/app/ClientLayout";
import "./globals.css";
import { Toaster } from "react-hot-toast";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body className="bg-blue-950 text-white min-h-screen antialiased">
        <div className="flex min-h-screen flex-col sm:flex-row">
          <SideNav />
          <ClientLayout>{children}</ClientLayout>
        </div>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
