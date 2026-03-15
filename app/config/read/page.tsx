/*
 * @FilePath: \my-new-app\app\config\read\page.tsx
 * @LastEditTime: 2026-03-15 00:17:41
 */
import { readConfigFromAxiom } from "./actions";

export default async function ConfigReadPage() {
  const data = await readConfigFromAxiom();

  return (
    <div className="p-6 space-y-4 text-green-300 text-sm">
      <h1 className="text-xl font-bold mb-4 text-white">Data</h1>

      {data ? (
        <>
          <div>{data.Variable01}</div>
          <div>{data.Variable02}</div>
          <div>{data.Variable03}</div>

          {/* If you want secondData too, add them here */}
          <div>—</div>
          <div>—</div>
          <div>—</div>
        </>
      ) : (
        <div>No config found.</div>
      )}

      <div className="mt-6 text-white">End</div>
    </div>
  );
}
