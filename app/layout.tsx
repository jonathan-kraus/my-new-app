// app/layout.tsx - WRAPPER for ClientLayout with SessionProvider
import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "./client-layout";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

