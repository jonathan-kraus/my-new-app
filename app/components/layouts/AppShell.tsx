/*
 * @FilePath     : \my-new-app\app\components\layouts\AppShell.tsx
 * @Author       : Jonathan
 * @Date         : 2026-02-21 02:33:48
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-21 02:33:48
 */
import { DashboardHeader } from "@/components/dashboard-header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-card text-foreground">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
