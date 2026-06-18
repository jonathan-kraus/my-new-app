/*
 * @FilePath: \my-new-app\app\dashboard\environment\page.tsx
 * @LastEditTime: 2026-06-18 09:37:47
 */
// app/dashboard/environment/page.tsx
import { EnvironmentStatus } from "../components/EnvironmentStatus";

export default function EnvironmentPage() {
  return (
    <div className="p-6">
      <EnvironmentStatus />
    </div>
  );
}
