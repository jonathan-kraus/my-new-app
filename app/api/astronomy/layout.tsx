// app/astronomy/layout.tsx
import ClientLayout from "@/app/ClientLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
