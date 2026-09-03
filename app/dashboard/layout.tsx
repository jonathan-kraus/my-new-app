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
  console.log("DASHBOARD LAYOUT");
  const session = await auth();
  console.log("SESSION:", session);
  if (!session) redirect("/signin");

  return <>{children}</>;
}
