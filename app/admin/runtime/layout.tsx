// app/admin/runtime/layout.tsx
import ClientLayout from "@/app/ClientLayout";

export default function RuntimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
