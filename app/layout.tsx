// app/layout.tsx
import ClientSideNav from "./ClientSideNav";
import ClientLayout from "@/app/ClientLayout";
import "./globals.css";
import { Toaster } from "react-hot-toast";
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body className="bg-blue-200 text-[#0C0D0D] dark:bg-black dark:text-white min-h-screen antialiased">
        <div className="flex shrink-0 min-h-screen">
          <ClientSideNav />
          <ClientLayout>
            <main className="flex-1">{children}</main>
          </ClientLayout>
        </div>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
