/*
 * @FilePath: \my-new-app\app\dashboard\layout.tsx
 * @LastEditTime: 2026-09-03 13:30:46
 */
import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/signin");

  return <>{children}</>;
}
