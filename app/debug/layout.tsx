/*
 * @FilePath     : \my-new-app\app\debug\layout.tsx
 * @Author       : Jonathan
 * @Date         : 2026-02-21 02:21:52
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-21 02:50:26
 */
export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
