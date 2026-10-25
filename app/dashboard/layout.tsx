/*
 * @FilePath: \my-new-app\app\dashboard\layout.tsx
 * @LastEditTime: 2026-10-24 22:31:13
 */
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/profile");

  return <>{children}</>;
}
