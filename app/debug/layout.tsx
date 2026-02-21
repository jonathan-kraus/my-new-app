/*
 * @FilePath     : \my-new-app\app\debug\layout.tsx
 * @Author       : Jonathan
 * @Date         : 2026-02-21 02:21:52
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-21 02:34:51
 */
import AppShell from "@/components/layouts/AppShell";

export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
