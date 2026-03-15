/*
 * @FilePath: \my-new-app\app\config\read\page.tsx
 * @LastEditTime: 2026-03-14 23:45:45
 */
import { readConfigFromAxiom } from "./actions";

export default async function ConfigReadPage() {
  const result = await readConfigFromAxiom();

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold mb-4">Config Read Result</h1>

      <pre className="bg-black/40 p-4 rounded text-green-300 text-sm overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
