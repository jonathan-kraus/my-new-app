/*
 * @FilePath: \my-new-app\app\admin\db\layout.tsx
 * @LastEditTime: 2026-10-05 07:05:33
 */
import type { ReactNode } from "react";
import { requireRuntimeAdmin, RuntimeAccessError } from "@/lib/runtime/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireRuntimeAdmin();
  } catch (error) {
    if (error instanceof RuntimeAccessError) {
      return (
        <p role="alert" className="p-6">
          {error.message}
        </p>
      );
    }
    throw error;
  }

  return <>{children}</>;
}
