/*
 * @FilePath: \my-new-app\app\dashboard\environment\page.tsx
 * @LastEditTime: 2026-07-19 17:46:24
 */
// app/dashboard/environment/page.tsx
import { EnvironmentStatus } from "../components/EnvironmentStatus";
export const metadata = { title: "Environment" };
export default function EnvironmentPage() {
  return (
    <div className="p-6">
      <EnvironmentStatus />
    </div>
  );
}
