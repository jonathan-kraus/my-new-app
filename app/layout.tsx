import SideNav from "@/app/components/SideNav";
import ClientLayout from "@/app/ClientLayout";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-blue-200 text-[#0C0D0D] dark:bg-black dark:text-white min-h-screen antialiased">
        <div className="flex shrink-0 min-h-screen">
          <SideNav />
          <ClientLayout>
            <main className="flex-1">{children}</main>
          </ClientLayout>
        </div>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
